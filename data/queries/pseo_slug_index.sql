create table if not exists pseo_slug_index (
  id bigserial primary key,
  slug text not null unique,
  municipio text not null,
  provincia text not null,
  tarifa_electrica text not null,
  consumo text not null,
  tecnologia_solar text not null,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_pseo_slug_index_geo on pseo_slug_index (provincia, municipio);
create index if not exists idx_pseo_slug_index_tarifa_consumo on pseo_slug_index (tarifa_electrica, consumo);
create index if not exists idx_pseo_slug_index_tecnologia on pseo_slug_index (tecnologia_solar);

create or replace function set_pseo_slug_index_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_pseo_slug_index_updated_at on pseo_slug_index;
create trigger trg_pseo_slug_index_updated_at
before update on pseo_slug_index
for each row
execute function set_pseo_slug_index_updated_at();
