-- =========================================================
-- seo_municipio_snapshot
-- Tabla de contenido SEO generado por IA por municipio.
-- Alimentada por workflow n8n. Leida por Next.js en SSG/ISR.
-- =========================================================

-- Si existe una view/materialized view con este nombre, eliminarla.
-- Este caso rompe la creacion del trigger con: "relation ... cannot have triggers".
do $$
begin
  if exists (
    select 1
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname = 'seo_municipio_snapshot'
      and c.relkind = 'm'
  ) then
    execute 'drop materialized view public.seo_municipio_snapshot cascade';
  end if;

  if exists (
    select 1
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname = 'seo_municipio_snapshot'
      and c.relkind = 'v'
  ) then
    execute 'drop view public.seo_municipio_snapshot cascade';
  end if;
end $$;

create table if not exists seo_municipio_snapshot (
  id                           bigserial primary key,
  slug                         text not null unique,       -- FK logica a municipios_energia.slug
  municipio                    text not null,
  provincia                    text not null,
  comunidad_autonoma           text not null,

  -- -------------------------------------------------------
  -- Contenido generado por IA (actualizable por n8n)
  -- -------------------------------------------------------
  intro_unica                  text,          -- Parrafo introductorio con angulo local
  analisis_fiscal_personalizado text,         -- Parrafo sobre IBI/ICIO/subvenciones
  h2_variante                  text[],        -- Array de 3 titulos H2 alternativos
  conclusion_local             text,          -- Cierre con enfoque municipio especifico
  narrativa_angulo             text check (
    narrativa_angulo in ('ahorro','sostenibilidad','independencia_energetica','revalorizacion')
  ),

  -- -------------------------------------------------------
  -- Snapshot de datos de origen (para detectar staleness)
  -- -------------------------------------------------------
  irradiacion_solar            numeric(8,1),
  horas_sol                    integer,
  ahorro_estimado              numeric(12,2),
  bonificacion_ibi             numeric(5,2),
  subvencion_autoconsumo       numeric(5,2),
  precio_instalacion_medio_eur numeric(12,2),
  precio_medio_luz             numeric(10,5),
  habitantes                   integer,

  -- -------------------------------------------------------
  -- Control de generacion
  -- -------------------------------------------------------
  modelo_ia                    text not null default 'gpt-4o-mini',
  tokens_usados                integer,
  version_prompt               smallint not null default 1,
  calidad_score                numeric(4,2) check (calidad_score between 0 and 10),
  palabras_intro               integer generated always as (
    array_length(string_to_array(trim(coalesce(intro_unica, '')), ' '), 1)
  ) stored,
  palabras_total               integer,       -- calculado externamente (intro+fiscal+conclusion)

  last_generated_at            timestamptz,
  needs_regen                  boolean not null default true,  -- true si datos fuente cambiaron
  created_at                   timestamptz not null default now(),
  updated_at                   timestamptz not null default now()
);

-- Trigger updated_at
create or replace function set_seo_snapshot_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_seo_snapshot_updated_at on seo_municipio_snapshot;
create trigger trg_seo_snapshot_updated_at
before update on seo_municipio_snapshot
for each row execute function set_seo_snapshot_updated_at();

-- Indices de acceso por slug y por estado de regeneracion
create index if not exists idx_seo_snapshot_slug
  on seo_municipio_snapshot (slug);

create index if not exists idx_seo_snapshot_needs_regen
  on seo_municipio_snapshot (needs_regen, last_generated_at)
  where needs_regen = true;

create index if not exists idx_seo_snapshot_ccaa_prov
  on seo_municipio_snapshot (comunidad_autonoma, provincia);

-- =========================================================
-- Funcion: marcar snapshots como stale cuando municipios_energia
-- se actualiza. Llama a esta funcion desde n8n tras un upsert masivo.
-- =========================================================
create or replace function public.mark_seo_snapshots_stale()
returns void
language sql
as $$
  update seo_municipio_snapshot s
  set needs_regen = true
  from municipios_energia me
  where s.slug = me.slug
    and (
      s.irradiacion_solar    is distinct from me.irradiacion_solar   or
      s.horas_sol            is distinct from me.horas_sol           or
      s.ahorro_estimado      is distinct from me.ahorro_estimado     or
      s.bonificacion_ibi     is distinct from me.bonificacion_ibi    or
      s.subvencion_autoconsumo is distinct from me.subvencion_autoconsumo or
      s.precio_instalacion_medio_eur is distinct from me.precio_instalacion_medio_eur or
      s.precio_medio_luz     is distinct from me.precio_medio_luz    or
      s.habitantes           is distinct from me.habitantes
    );
$$;

-- =========================================================
-- Funcion: cola de trabajo para n8n.
-- Devuelve hasta p_limit municipios que necesitan contenido nuevo,
-- priorizando los mas poblados (mayor trafico esperado).
-- =========================================================
drop function if exists public.get_seo_generation_queue(int);
drop function if exists public.get_seo_generation_queue();

create or replace function public.get_seo_generation_queue(p_limit int default 50)
returns table (
  slug                         text,
  municipio                    text,
  provincia                    text,
  comunidad_autonoma           text,
  habitantes                   integer,
  irradiacion_solar            numeric,
  horas_sol                    integer,
  ahorro_estimado              numeric,
  bonificacion_ibi             numeric,
  subvencion_autoconsumo       numeric,
  precio_instalacion_medio_eur numeric,
  precio_instalacion_min_eur   numeric,
  precio_instalacion_max_eur   numeric,
  precio_medio_luz             numeric,
  eur_por_watio                numeric,
  tipo_zona                    text,   -- costa | interior | sierra | isla | urbano
  angulo_sugerido              text    -- ahorro | sostenibilidad | independencia_energetica | revalorizacion
)
language sql
stable
as $$
  select
    me.slug,
    me.municipio,
    me.provincia,
    me.comunidad_autonoma,
    me.habitantes,
    me.irradiacion_solar,
    me.horas_sol,
    me.ahorro_estimado,
    me.bonificacion_ibi,
    me.subvencion_autoconsumo,
    me.precio_instalacion_medio_eur,
    me.precio_instalacion_min_eur,
    me.precio_instalacion_max_eur,
    me.precio_medio_luz,
    me.eur_por_watio,
    -- Heuristica de tipo zona por comunidad (enriquece el prompt)
    case
      when me.comunidad_autonoma in ('Canarias','Illes Balears')
        then 'isla'
      when lower(me.comunidad_autonoma) in ('comunitat valenciana','andalucia','murcia','cataluna')
        then 'costa'
      when lower(me.comunidad_autonoma) in ('castilla y leon','castilla-la mancha','aragon','extremadura','castilla la mancha')
        then 'interior'
      when lower(me.comunidad_autonoma) in ('la rioja','navarra','pais vasco','cantabria','asturias','galicia')
        then 'norte'
      when lower(me.provincia) in ('granada','jaen','huesca','lleida','girona','caceres')
        then 'sierra'
      when me.habitantes > 100000
        then 'urbano'
      else 'interior'
    end as tipo_zona,
    -- Angulo narrativo rotativo (evita contenido identico)
    case (me.id % 4)
      when 0 then 'ahorro'
      when 1 then 'sostenibilidad'
      when 2 then 'independencia_energetica'
      else 'revalorizacion'
    end as angulo_sugerido
  from municipios_energia me
  left join seo_municipio_snapshot s on s.slug = me.slug
  where (s.slug is null or s.needs_regen = true)
  order by me.habitantes desc nulls last
  limit least(greatest(p_limit, 1), 200);
$$;

-- Wrapper sin parametros para compatibilidad con PostgREST/n8n cuando
-- el cliente llama al RPC sin body o sin argumentos explicitos.
create or replace function public.get_seo_generation_queue()
returns table (
  slug                         text,
  municipio                    text,
  provincia                    text,
  comunidad_autonoma           text,
  habitantes                   integer,
  irradiacion_solar            numeric,
  horas_sol                    integer,
  ahorro_estimado              numeric,
  bonificacion_ibi             numeric,
  subvencion_autoconsumo       numeric,
  precio_instalacion_medio_eur numeric,
  precio_instalacion_min_eur   numeric,
  precio_instalacion_max_eur   numeric,
  precio_medio_luz             numeric,
  eur_por_watio                numeric,
  tipo_zona                    text,
  angulo_sugerido              text
)
language sql
stable
as $$
  select * from public.get_seo_generation_queue(50);
$$;

grant execute on function public.get_seo_generation_queue(int) to anon, authenticated, service_role;
grant execute on function public.get_seo_generation_queue() to anon, authenticated, service_role;

-- Importante en Supabase/PostgREST: fuerza recarga de schema cache.
notify pgrst, 'reload schema';

-- =========================================================
-- Vista rapida: municipios ya generados y su estado
-- =========================================================
create or replace view v_seo_snapshot_status as
select
  s.slug,
  s.municipio,
  s.provincia,
  s.comunidad_autonoma,
  s.last_generated_at,
  s.needs_regen,
  s.calidad_score,
  s.palabras_intro,
  s.palabras_total,
  s.narrativa_angulo,
  s.version_prompt,
  s.modelo_ia
from seo_municipio_snapshot s
order by s.last_generated_at desc nulls last;

-- =========================================================
-- Query de actualizacion (usada desde n8n tras recibir IA response)
-- Ejemplo de uso:
--   update seo_municipio_snapshot set
--     intro_unica = :intro, analisis_fiscal_personalizado = :analisis,
--     h2_variante = :h2_array, conclusion_local = :conclusion,
--     narrativa_angulo = :angulo, modelo_ia = :model,
--     tokens_usados = :tokens, calidad_score = :score,
--     palabras_total = :words, last_generated_at = now(),
--     needs_regen = false, version_prompt = :version,
--     -- snapshot de datos fuente para detectar staleness futura:
--     irradiacion_solar = :irr, horas_sol = :horas,
--     ahorro_estimado = :ahorro, bonificacion_ibi = :ibi,
--     subvencion_autoconsumo = :subv,
--     precio_instalacion_medio_eur = :precio_medio,
--     precio_medio_luz = :precio_luz, habitantes = :hab
--   where slug = :slug
--   returning id, slug, last_generated_at;
-- =========================================================
