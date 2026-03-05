-- =========================================================
-- Slugs SEO para municipios de Espana
-- Formato objetivo: /placas-solares/{municipio}
-- Tabla de salida: municipio, slug
-- =========================================================

create table if not exists slugs_seo_municipios_espana_es (
  id bigserial primary key,
  municipio text not null,
  slug text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (municipio),
  unique (slug)
);

create extension if not exists unaccent;

create or replace function seo_slug_municipio(input_text text)
returns text
language sql
immutable
as $$
  select '/placas-solares/' || trim(both '-' from regexp_replace(
    lower(unaccent(coalesce(input_text, ''))),
    '[^a-z0-9]+',
    '-',
    'g'
  ));
$$;

create or replace function set_slugs_municipios_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_slugs_municipios_updated_at on slugs_seo_municipios_espana_es;
create trigger trg_slugs_municipios_updated_at
before update on slugs_seo_municipios_espana_es
for each row execute function set_slugs_municipios_updated_at();

-- Si existe una tabla base de municipios, se genera el dataset completo.
do $$
begin
  if to_regclass('public.municipios_dataset_es') is not null then
    insert into slugs_seo_municipios_espana_es (municipio, slug)
    select
      m.municipio,
      seo_slug_municipio(m.municipio) as slug
    from (
      select distinct municipio
      from public.municipios_dataset_es
      where municipio is not null and btrim(municipio) <> ''
    ) as m
    on conflict (municipio) do update set
      slug = excluded.slug,
      updated_at = now();
  elsif to_regclass('public.municipios_espana_es') is not null then
    insert into slugs_seo_municipios_espana_es (municipio, slug)
    select
      m.municipio,
      seo_slug_municipio(m.municipio) as slug
    from (
      select distinct municipio
      from public.municipios_espana_es
      where municipio is not null and btrim(municipio) <> ''
    ) as m
    on conflict (municipio) do update set
      slug = excluded.slug,
      updated_at = now();
  else
    -- Fallback minimo para que el script sea autocontenido.
    insert into slugs_seo_municipios_espana_es (municipio, slug)
    values
      ('Madrid', '/placas-solares/madrid'),
      ('Barcelona', '/placas-solares/barcelona'),
      ('Valencia', '/placas-solares/valencia'),
      ('Sevilla', '/placas-solares/sevilla'),
      ('Zaragoza', '/placas-solares/zaragoza'),
      ('Malaga', '/placas-solares/malaga'),
      ('Murcia', '/placas-solares/murcia'),
      ('Palma', '/placas-solares/palma'),
      ('Las Palmas de Gran Canaria', '/placas-solares/las-palmas-de-gran-canaria'),
      ('Bilbao', '/placas-solares/bilbao'),
      ('Alicante', '/placas-solares/alicante'),
      ('Cordoba', '/placas-solares/cordoba'),
      ('Valladolid', '/placas-solares/valladolid'),
      ('Vigo', '/placas-solares/vigo'),
      ('Gijon', '/placas-solares/gijon'),
      ('Hospitalet de Llobregat', '/placas-solares/hospitalet-de-llobregat'),
      ('A Coruna', '/placas-solares/a-coruna'),
      ('Vitoria-Gasteiz', '/placas-solares/vitoria-gasteiz'),
      ('Granada', '/placas-solares/granada'),
      ('Elche', '/placas-solares/elche')
    on conflict (municipio) do update set
      slug = excluded.slug,
      updated_at = now();
  end if;
end $$;

create index if not exists idx_slugs_municipios_municipio on slugs_seo_municipios_espana_es (municipio);
create index if not exists idx_slugs_municipios_slug on slugs_seo_municipios_espana_es (slug);
