-- =========================================================
-- n8n ETL SUPPORT RPCs
-- Run these in Supabase SQL Editor BEFORE activating the n8n workflow.
-- These functions are called by the REBUILD nodes in the workflow.
-- =========================================================

-- ---------------------------------------------------------
-- 1) precios_electricidad_es – flat table (if not in schema already)
-- ---------------------------------------------------------
create table if not exists precios_electricidad_es (
  id bigserial primary key,
  fecha date not null,
  tarifa_codigo text not null,
  precio_kwh_media numeric(10,5),
  precio_kwh_min   numeric(10,5),
  precio_kwh_max   numeric(10,5),
  fuente text default 'esios',
  indicador_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (fecha, tarifa_codigo)
);

-- ---------------------------------------------------------
-- 1.1) bonificaciones_icio_municipios_es – defensive create
-- Required so rebuild_municipios_energia can compile even before ICIO seed.
-- ---------------------------------------------------------
create table if not exists bonificaciones_icio_municipios_es (
  id bigserial primary key,
  municipio text not null,
  provincia text not null,
  porcentaje_bonificacion numeric(5,2) not null check (porcentaje_bonificacion between 0 and 100),
  duracion_anos smallint not null default 0 check (duracion_anos between 0 and 50),
  condiciones text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (municipio, provincia)
);

-- ---------------------------------------------------------
-- 2) rebuild_municipios_energia()
-- Called by n8n REBUILD node via POST /rest/v1/rpc/rebuild_municipios_energia
-- Schema: municipios_energia(municipio, provincia, comunidad_autonoma, habitantes,
--   horas_sol, ahorro_estimado, bonificacion_ibi, bonificacion_icio,
--   subvencion_autoconsumo, irradiacion_solar, precio_medio_luz, slug)
-- ---------------------------------------------------------
create or replace function rebuild_municipios_energia()
returns void
language sql
security definer
as $$
  insert into public.municipios_energia (
    municipio,
    provincia,
    comunidad_autonoma,
    habitantes,
    horas_sol,
    ahorro_estimado,
    bonificacion_ibi,
    bonificacion_icio,
    subvencion_autoconsumo,
    irradiacion_solar,
    precio_medio_luz,
    slug
  )
  select
    m.municipio,
    m.provincia,
    m.comunidad_autonoma,
    coalesce(m.poblacion, 0)                          as habitantes,
    coalesce(r.horas_sol_anuales, 1800)               as horas_sol,
    coalesce(ea.ahorro_estimado, 600)                 as ahorro_estimado,
    coalesce(b.porcentaje_bonificacion, 0)            as bonificacion_ibi,
    coalesce(c.porcentaje_bonificacion, 0)            as bonificacion_icio,
    coalesce(s.subvencion_porcentaje, 0)              as subvencion_autoconsumo,
    coalesce(r.irradiacion_kwh_m2, 1600.0)            as irradiacion_solar,
    coalesce(t.precio_medio_luz, 0.15)                as precio_medio_luz,
    m.slug
  from public.municipios_dataset_es m
  left join public.radiacion_solar_provincial_es r
    on lower(r.provincia) = lower(m.provincia)
  left join public.bonificaciones_ibi_municipios_es b
    on lower(b.municipio) = lower(m.municipio)
   and lower(b.provincia) = lower(m.provincia)
  left join public.bonificaciones_icio_municipios_es c
    on lower(c.municipio) = lower(m.municipio)
   and lower(c.provincia) = lower(m.provincia)
  left join public.subvenciones_solares_ccaa_es s
    on lower(s.comunidad_autonoma) = lower(m.comunidad_autonoma)
  left join lateral (
    select round(avg(ahorro_estimado), 2) as ahorro_estimado
    from public.estimaciones_ahorro_anual_es
    limit 1
  ) ea on true
  left join lateral (
    select round(avg((precio_kwh_dia + precio_kwh_noche + precio_kwh_valle) / 3.0), 5) as precio_medio_luz
    from public.tarifas_electricas_espana_es
    limit 1
  ) t on true
  on conflict (slug) do update set
    municipio             = excluded.municipio,
    provincia             = excluded.provincia,
    comunidad_autonoma    = excluded.comunidad_autonoma,
    habitantes            = excluded.habitantes,
    horas_sol             = excluded.horas_sol,
    ahorro_estimado       = excluded.ahorro_estimado,
    bonificacion_ibi      = excluded.bonificacion_ibi,
    bonificacion_icio     = excluded.bonificacion_icio,
    subvencion_autoconsumo= excluded.subvencion_autoconsumo,
    irradiacion_solar     = excluded.irradiacion_solar,
    precio_medio_luz      = excluded.precio_medio_luz,
    updated_at            = now();
$$;

-- ---------------------------------------------------------
-- 3) rebuild_pseo_url_index()
-- Called by n8n REBUILD node via POST /rest/v1/rpc/rebuild_pseo_url_index
-- Schema: pseo_url_index(url, route_type, params_json, priority)
-- ---------------------------------------------------------
create or replace function rebuild_pseo_url_index()
returns void
language sql
security definer
as $$
  insert into public.pseo_url_index (
    url,
    route_type,
    params_json,
    priority
  )
  select
    '/placas-solares/' || me.slug            as url,
    'municipio'                              as route_type,
    jsonb_build_object(
      'slug',               me.slug,
      'municipio',          me.municipio,
      'provincia',          me.provincia,
      'comunidad_autonoma', me.comunidad_autonoma,
      'habitantes',         me.habitantes,
      'horas_sol',          me.horas_sol,
      'irradiacion_solar',  me.irradiacion_solar,
      'bonificacion_ibi',   me.bonificacion_ibi,
      'ahorro_estimado',    me.ahorro_estimado,
      'precio_medio_luz',   me.precio_medio_luz
    )                                        as params_json,
    -- Priority: 100 for large cities, scales down by population
    least(100, greatest(1,
      case
        when me.habitantes >= 500000 then 100
        when me.habitantes >= 100000 then 90
        when me.habitantes >= 50000  then 80
        when me.habitantes >= 10000  then 60
        when me.habitantes >= 5000   then 40
        else 20
      end
    ))                                       as priority
  from public.municipios_energia me
  on conflict (url) do update set
    params_json = excluded.params_json,
    priority    = excluded.priority,
    updated_at  = now();
$$;

-- ---------------------------------------------------------
-- 4) rebuild_pseo_slug_index()
-- Called by n8n REBUILD node via POST /rest/v1/rpc/rebuild_pseo_slug_index
-- Schema: pseo_slug_index(slug, municipio, provincia,
--   tarifa_electrica, consumo, tecnologia_solar, seo_title, seo_description)
-- ---------------------------------------------------------
create or replace function rebuild_pseo_slug_index()
returns void
language sql
security definer
as $$
  insert into public.pseo_slug_index (
    slug,
    municipio,
    provincia,
    tarifa_electrica,
    consumo,
    tecnologia_solar,
    seo_title,
    seo_description
  )
  select
    me.slug,
    me.municipio,
    me.provincia,
    coalesce(t.tarifa, 'PVPC 2.0 TD')           as tarifa_electrica,
    '3500 kWh/año'                               as consumo,
    'monocristalino'                             as tecnologia_solar,
    'Placas solares en ' || me.municipio
      || ' (' || me.provincia || ')'             as seo_title,
    'Instala placas solares en ' || me.municipio
      || '. Ahorra hasta ' || me.ahorro_estimado
      || '€/año con ' || me.horas_sol
      || ' horas de sol. Bonificación IBI: '
      || me.bonificacion_ibi || '%.'             as seo_description
  from public.municipios_energia me
  left join lateral (
    select tarifa
    from public.tarifas_electricas_espana_es
    order by
      case when tipo_tarifa = 'regulada-pvpc' then 0 else 1 end,
      id
    limit 1
  ) t on true
  on conflict (slug) do update set
    municipio        = excluded.municipio,
    provincia        = excluded.provincia,
    tarifa_electrica = excluded.tarifa_electrica,
    seo_title        = excluded.seo_title,
    seo_description  = excluded.seo_description,
    updated_at       = now();
$$;

-- ---------------------------------------------------------
-- 5) Grant execute to authenticated + anon roles
-- ---------------------------------------------------------
grant execute on function rebuild_municipios_energia() to authenticated, anon, service_role;
grant execute on function rebuild_pseo_url_index() to authenticated, anon, service_role;
grant execute on function rebuild_pseo_slug_index() to authenticated, anon, service_role;

-- ---------------------------------------------------------
-- 6) Validation queries (run after first ETL pass)
-- ---------------------------------------------------------
-- select count(*) from municipios_dataset_es;            -- expect > 8000
-- select count(*) from radiacion_solar_provincial_es;    -- expect ~50 provinces
-- select count(*) from municipios_energia;               -- expect > 8000
-- select count(*) from pseo_url_index;                   -- expect > 8000
-- select count(*) from pseo_slug_index;                  -- expect > 8000
-- select count(*) from precios_electricidad_es;          -- expect ~7 rows (daily)
-- select count(*) from bonificaciones_ibi_municipios_es; -- depends on your JSON input
-- select count(*) from compatibilidad_inversor_bateria_cargador_ev_es; -- depends on CSV
-- select * from municipios_energia where slug = 'madrid' limit 1;
-- select * from pseo_url_index where url = '/placas-solares/madrid' limit 1;
