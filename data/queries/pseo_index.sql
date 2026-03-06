-- Build a unified URL index used by sitemap/revalidation jobs.
-- Compatible sources (in order):
-- 1) public.municipios_energia
-- 2) public.municipios_dataset_es
-- 3) public.municipios + public.provincias + public.comunidades_autonomas

create extension if not exists unaccent;

create table if not exists pseo_url_index (
  id bigserial primary key,
  url text not null unique,
  route_type text not null,
  params_json jsonb not null,
  priority integer not null check (priority between 1 and 100),
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists idx_pseo_url_index_route_type on pseo_url_index (route_type);
create index if not exists idx_pseo_url_index_priority on pseo_url_index (priority desc);

do $$
declare
  source_sql text;
  upsert_sql text;
begin
  if to_regclass('public.municipios_energia') is not null then
    source_sql := $src$
      select
        slug,
        lower(regexp_replace(unaccent(provincia), '[^a-z0-9]+', '-', 'g')) as provincia_slug,
        lower(regexp_replace(unaccent(comunidad_autonoma), '[^a-z0-9]+', '-', 'g')) as comunidad_slug,
        coalesce(habitantes, 0)::numeric as habitantes
      from public.municipios_energia
    $src$;
  elsif to_regclass('public.municipios_dataset_es') is not null then
    source_sql := $src$
      select
        slug,
        lower(regexp_replace(unaccent(provincia), '[^a-z0-9]+', '-', 'g')) as provincia_slug,
        lower(regexp_replace(unaccent(comunidad_autonoma), '[^a-z0-9]+', '-', 'g')) as comunidad_slug,
        coalesce(poblacion, 0)::numeric as habitantes
      from public.municipios_dataset_es
    $src$;
  elsif
    to_regclass('public.municipios') is not null and
    to_regclass('public.provincias') is not null and
    to_regclass('public.comunidades_autonomas') is not null
  then
    source_sql := $src$
      select
        m.slug,
        lower(regexp_replace(unaccent(p.nombre), '[^a-z0-9]+', '-', 'g')) as provincia_slug,
        lower(regexp_replace(unaccent(c.nombre), '[^a-z0-9]+', '-', 'g')) as comunidad_slug,
        coalesce(m.poblacion, 0)::numeric as habitantes
      from public.municipios m
      join public.provincias p on p.id = m.provincia_id
      join public.comunidades_autonomas c on c.id = p.comunidad_id
      where m.activo = true
    $src$;
  else
    raise exception 'No source table found. Run municipios_espana_dataset.sql first, or create municipios_energia.';
  end if;

  upsert_sql := format($f$
    with source as (
      %s
    ),
    routes as (
      select
        '/placas-solares/' || slug as url,
        'placas'::text as route_type,
        json_build_object('municipio', slug) as params_json,
        greatest(1, least(100, round(habitantes / 10000.0)))::int as priority,
        now() as updated_at
      from source

      union all

      select
        '/placas-solares/geo/' || comunidad_slug || '/' || provincia_slug || '/' || slug as url,
        'placas_geo'::text as route_type,
        json_build_object('comunidad', comunidad_slug, 'provincia', provincia_slug, 'municipio', slug) as params_json,
        greatest(1, least(90, round(habitantes / 12000.0)))::int as priority,
        now() as updated_at
      from source

      union all

      select
        '/bonificacion-ibi/' || slug as url,
        'ibi'::text as route_type,
        json_build_object('municipio', slug) as params_json,
        greatest(1, least(80, round(habitantes / 15000.0)))::int as priority,
        now() as updated_at
      from source

      union all

      select
        '/autoconsumo-compartido/' || slug as url,
        'autoconsumo'::text as route_type,
        json_build_object('municipio', slug) as params_json,
        greatest(1, least(80, round(habitantes / 15000.0)))::int as priority,
        now() as updated_at
      from source

      union all

      select
        '/precio-instalacion-solar/' || slug as url,
        'precio_instalacion'::text as route_type,
        json_build_object('municipio', slug) as params_json,
        greatest(1, least(85, round(habitantes / 14000.0)))::int as priority,
        now() as updated_at
      from source

      union all

      select
        '/subvenciones-solares/' || slug as url,
        'subvenciones'::text as route_type,
        json_build_object('municipio', slug) as params_json,
        greatest(1, least(85, round(habitantes / 14000.0)))::int as priority,
        now() as updated_at
      from source

      union all

      select
        '/ahorro-placas-solares/' || slug as url,
        'ahorro'::text as route_type,
        json_build_object('municipio', slug) as params_json,
        greatest(1, least(85, round(habitantes / 14000.0)))::int as priority,
        now() as updated_at
      from source
    )
    insert into pseo_url_index (url, route_type, params_json, priority, updated_at)
    select url, route_type, params_json, priority, updated_at
    from routes
    on conflict (url)
    do update set
      route_type = excluded.route_type,
      params_json = excluded.params_json,
      priority = excluded.priority,
      updated_at = excluded.updated_at;
  $f$, source_sql);

  execute upsert_sql;
end $$;