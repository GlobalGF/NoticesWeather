-- Materializa una tabla consolidada para consultas pSEO por slug.
create table if not exists public.municipios_energia (
  id bigserial primary key,
  municipio text not null,
  provincia text not null,
  comunidad_autonoma text not null,
  habitantes integer not null default 0,
  horas_sol integer,
  ahorro_estimado numeric(12,2),
  bonificacion_ibi numeric(5,2),
  bonificacion_icio numeric(5,2),
  subvencion_autoconsumo numeric(5,2),
  irradiacion_solar numeric(8,1),
  precio_medio_luz numeric(10,5),
  slug text not null unique,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

do $$
begin
  if to_regclass('public.municipios_dataset_es') is null then
    raise exception 'Missing source table public.municipios_dataset_es. Run municipios_espana_dataset.sql first.';
  end if;

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
    slug,
    updated_at
  )
  select
    m.municipio,
    m.provincia,
    m.comunidad_autonoma,
    coalesce(m.poblacion, 0) as habitantes,
    r.horas_sol_anuales as horas_sol,
    ea.ahorro_estimado,
    ibi.porcentaje_bonificacion as bonificacion_ibi,
    null::numeric as bonificacion_icio,
    s.subvencion_porcentaje as subvencion_autoconsumo,
    r.irradiacion_kwh_m2 as irradiacion_solar,
    t.precio_medio_luz,
    m.slug,
    now()
  from public.municipios_dataset_es m
  left join public.radiacion_solar_provincial_es r
    on lower(r.provincia) = lower(m.provincia)
  left join public.bonificaciones_ibi_municipios_es ibi
    on lower(ibi.municipio) = lower(m.municipio)
   and lower(ibi.provincia) = lower(m.provincia)
  left join public.subvenciones_solares_ccaa_es s
    on lower(s.comunidad_autonoma) = lower(m.comunidad_autonoma)
  left join lateral (
    select round(avg((precio_kwh_dia + precio_kwh_noche + precio_kwh_valle) / 3.0), 5) as precio_medio_luz
    from public.tarifas_electricas_espana_es
  ) t on true
  left join lateral (
    select round(avg(ahorro_estimado), 2) as ahorro_estimado
    from public.estimaciones_ahorro_anual_es
  ) ea on true
  on conflict (slug)
  do update set
    municipio = excluded.municipio,
    provincia = excluded.provincia,
    comunidad_autonoma = excluded.comunidad_autonoma,
    habitantes = excluded.habitantes,
    horas_sol = excluded.horas_sol,
    ahorro_estimado = excluded.ahorro_estimado,
    bonificacion_ibi = excluded.bonificacion_ibi,
    bonificacion_icio = excluded.bonificacion_icio,
    subvencion_autoconsumo = excluded.subvencion_autoconsumo,
    irradiacion_solar = excluded.irradiacion_solar,
    precio_medio_luz = excluded.precio_medio_luz,
    updated_at = now();
end $$;

-- Indice critico para latencia baja por slug.
create index if not exists idx_municipios_energia_slug on public.municipios_energia (slug);

-- Indice de apoyo para ordenaciones por poblacion.
create index if not exists idx_municipios_energia_habitantes on public.municipios_energia (habitantes desc);

-- Funcion de lectura por slug (evita error con parametro $1 en SQL Editor).
create or replace function public.get_municipio_energia_by_slug(p_slug text)
returns table (
  municipio text,
  provincia text,
  comunidad_autonoma text,
  habitantes integer,
  horas_sol integer,
  ahorro_estimado numeric,
  bonificacion_ibi numeric,
  bonificacion_icio numeric,
  subvencion_autoconsumo numeric,
  irradiacion_solar numeric,
  precio_medio_luz numeric,
  slug text
)
language sql
stable
as $$
  select
    me.municipio,
    me.provincia,
    me.comunidad_autonoma,
    me.habitantes,
    me.horas_sol,
    me.ahorro_estimado,
    me.bonificacion_ibi,
    me.bonificacion_icio,
    me.subvencion_autoconsumo,
    me.irradiacion_solar,
    me.precio_medio_luz,
    me.slug
  from public.municipios_energia me
  where me.slug = p_slug
  limit 1;
$$;

-- Ejemplo:
-- select * from public.get_municipio_energia_by_slug('madrid');
