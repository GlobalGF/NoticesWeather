-- Build a unified URL index used by sitemap/revalidation jobs.
with source as (
  select
    slug,
    lower(regexp_replace(unaccent(provincia), '[^a-z0-9]+', '-', 'g')) as provincia_slug,
    lower(regexp_replace(unaccent(comunidad_autonoma), '[^a-z0-9]+', '-', 'g')) as comunidad_slug,
    habitantes
  from municipios_energia
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
)
insert into pseo_url_index (url, route_type, params_json, priority, updated_at)
select url, route_type, params_json, priority, updated_at
from routes
on conflict (url)
do update
set
  route_type = excluded.route_type,
  params_json = excluded.params_json,
  priority = excluded.priority,
  updated_at = excluded.updated_at;