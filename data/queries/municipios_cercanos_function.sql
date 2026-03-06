-- =========================================================
-- Municipios cercanos por geolocalizacion (lat/lng)
-- Tabla esperada: public.municipios
-- Columnas usadas: municipio, slug, provincia, lat, lon/lng
-- =========================================================

create extension if not exists cube;
create extension if not exists earthdistance;

-- Indices recomendados para acelerar la busqueda KNN por distancia.
create index if not exists idx_municipios_slug on public.municipios (slug);

do $$
declare
  has_lon boolean;
  has_lng boolean;
begin
  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'municipios'
      and column_name = 'lon'
  ) into has_lon;

  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'municipios'
      and column_name = 'lng'
  ) into has_lng;

  if has_lon then
    execute 'create index if not exists idx_municipios_ll_to_earth_lon on public.municipios using gist (ll_to_earth(lat, lon))';
  elsif has_lng then
    execute 'create index if not exists idx_municipios_ll_to_earth_lng on public.municipios using gist (ll_to_earth(lat, lng))';
  else
    raise exception 'public.municipios must include lon or lng column to compute nearby municipalities.';
  end if;
end $$;

create or replace function public.get_municipios_cercanos(
  p_slug text,
  p_limit int default 10
)
returns table (
  municipio text,
  slug text,
  provincia text
)
language plpgsql
stable
parallel safe
as $$
declare
  has_lon boolean;
  has_lng boolean;
  sql_query text;
begin
  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'municipios'
      and column_name = 'lon'
  ) into has_lon;

  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'municipios'
      and column_name = 'lng'
  ) into has_lng;

  if has_lon then
    sql_query := $q$
      with origen as (
        select m.lat, m.lon as lon_ref
        from public.municipios m
        where m.slug = $1
          and m.lat is not null
          and m.lon is not null
        limit 1
      )
      select
        m.municipio::text as municipio,
        m.slug::text as slug,
        m.provincia::text as provincia
      from public.municipios m
      cross join origen o
      where m.slug <> $1
        and m.lat is not null
        and m.lon is not null
      order by ll_to_earth(m.lat, m.lon) <-> ll_to_earth(o.lat, o.lon_ref)
      limit least(greatest($2, 1), 100)
    $q$;
  elsif has_lng then
    sql_query := $q$
      with origen as (
        select m.lat, m.lng as lon_ref
        from public.municipios m
        where m.slug = $1
          and m.lat is not null
          and m.lng is not null
        limit 1
      )
      select
        m.municipio::text as municipio,
        m.slug::text as slug,
        m.provincia::text as provincia
      from public.municipios m
      cross join origen o
      where m.slug <> $1
        and m.lat is not null
        and m.lng is not null
      order by ll_to_earth(m.lat, m.lng) <-> ll_to_earth(o.lat, o.lon_ref)
      limit least(greatest($2, 1), 100)
    $q$;
  else
    raise exception 'public.municipios must include lon or lng column to compute nearby municipalities.';
  end if;

  return query execute sql_query using p_slug, p_limit;
end;
$$;

-- Ejemplo:
-- select * from public.get_municipios_cercanos('madrid', 10);
