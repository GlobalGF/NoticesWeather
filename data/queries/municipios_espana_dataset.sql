-- =========================================================
-- Dataset de municipios de Espana (seed estructurado)
-- Formato SQL listo para importar en Supabase
-- =========================================================

create table if not exists municipios_dataset_es (
  id bigserial primary key,
  municipio text not null,
  provincia text not null,
  comunidad_autonoma text not null,
  poblacion integer not null,
  latitud numeric(9,6) not null,
  longitud numeric(9,6) not null,
  codigo_postal varchar(5) not null,
  slug text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function set_municipios_dataset_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_municipios_dataset_updated_at on municipios_dataset_es;
create trigger trg_municipios_dataset_updated_at
before update on municipios_dataset_es
for each row execute function set_municipios_dataset_updated_at();

create index if not exists idx_municipios_dataset_slug on municipios_dataset_es(slug);
create index if not exists idx_municipios_dataset_geo on municipios_dataset_es(comunidad_autonoma, provincia, municipio);
create index if not exists idx_municipios_dataset_poblacion on municipios_dataset_es(poblacion desc);
