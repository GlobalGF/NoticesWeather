-- =========================================================
-- Dataset de subvenciones solares por comunidad autonoma
-- SQL listo para importar en Supabase
-- Nota: dataset orientativo para analitica/SEO (no sustituye fuente oficial)
-- =========================================================

create table if not exists subvenciones_solares_ccaa_es (
  comunidad_autonoma text primary key,
  subvencion_porcentaje numeric(5,2) not null check (subvencion_porcentaje between 0 and 100),
  max_subvencion_euros numeric(12,2) not null check (max_subvencion_euros >= 0),
  programa text not null,
  fecha_inicio date not null,
  fecha_fin date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (fecha_fin >= fecha_inicio)
);

create or replace function set_subvenciones_ccaa_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_subvenciones_ccaa_updated_at on subvenciones_solares_ccaa_es;
create trigger trg_subvenciones_ccaa_updated_at
before update on subvenciones_solares_ccaa_es
for each row execute function set_subvenciones_ccaa_updated_at();

insert into subvenciones_solares_ccaa_es (
  comunidad_autonoma,
  subvencion_porcentaje,
  max_subvencion_euros,
  programa,
  fecha_inicio,
  fecha_fin
)
values
  ('Andalucia', 45.00, 5000.00, 'Programa Autoconsumo Residencial 2026', '2026-01-15', '2026-12-31'),
  ('Aragon', 40.00, 4200.00, 'Plan Solar Hogar Aragon 2026', '2026-02-01', '2026-11-30'),
  ('Principado de Asturias', 40.00, 4300.00, 'Linea Renovables Asturias 2026', '2026-01-20', '2026-10-31'),
  ('Illes Balears', 45.00, 5200.00, 'Impulso Autoconsumo Balears 2026', '2026-01-10', '2026-12-15'),
  ('Canarias', 50.00, 6000.00, 'Canarias Energia Solar 2026', '2026-01-05', '2026-12-31'),
  ('Cantabria', 40.00, 4100.00, 'Programa Solar Cantabria 2026', '2026-02-10', '2026-11-15'),
  ('Castilla-La Mancha', 45.00, 4700.00, 'Ayudas Fotovoltaicas CLM 2026', '2026-01-25', '2026-12-10'),
  ('Castilla y Leon', 42.00, 4500.00, 'Plan Autoconsumo CyL 2026', '2026-02-01', '2026-11-30'),
  ('Cataluna', 40.00, 4500.00, 'Programa Transicio Energetica 2026', '2026-01-15', '2026-12-20'),
  ('Comunitat Valenciana', 45.00, 5000.00, 'Comunitat Solar 2026', '2026-01-12', '2026-12-31'),
  ('Extremadura', 45.00, 4900.00, 'Extremadura Solar 2026', '2026-01-18', '2026-11-30'),
  ('Galicia', 40.00, 4200.00, 'Galicia Renovable Autoconsumo 2026', '2026-02-05', '2026-10-31'),
  ('Comunidad de Madrid', 35.00, 3500.00, 'Plan Cambia 360 Solar 2026', '2026-02-01', '2026-12-15'),
  ('Region de Murcia', 45.00, 5000.00, 'Murcia Autoconsumo Eficiente 2026', '2026-01-20', '2026-12-31'),
  ('Comunidad Foral de Navarra', 40.00, 4300.00, 'Navarra Energia Limpia 2026', '2026-02-01', '2026-11-30'),
  ('Pais Vasco', 40.00, 4400.00, 'Euskadi Solar Etxea 2026', '2026-01-25', '2026-12-01'),
  ('La Rioja', 40.00, 4100.00, 'La Rioja Autoconsumo 2026', '2026-02-10', '2026-11-30'),
  ('Ceuta', 45.00, 4800.00, 'Ceuta Solar Residencial 2026', '2026-02-01', '2026-12-10'),
  ('Melilla', 45.00, 4800.00, 'Melilla Energia Solar 2026', '2026-02-01', '2026-12-10')
on conflict (comunidad_autonoma) do update set
  subvencion_porcentaje = excluded.subvencion_porcentaje,
  max_subvencion_euros = excluded.max_subvencion_euros,
  programa = excluded.programa,
  fecha_inicio = excluded.fecha_inicio,
  fecha_fin = excluded.fecha_fin,
  updated_at = now();

create index if not exists idx_subv_ccaa_pct on subvenciones_solares_ccaa_es (subvencion_porcentaje desc);
create index if not exists idx_subv_ccaa_fin on subvenciones_solares_ccaa_es (fecha_fin);
