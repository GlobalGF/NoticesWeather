-- =========================================================
-- Dataset de precios de instalacion solar por provincia
-- Formato SQL listo para importar en Supabase
-- Nota: valores orientativos para analitica/SEO (no presupuesto vinculante)
-- =========================================================

create table if not exists precios_instalacion_solar_provincial_es (
  provincia text primary key,
  precio_min_eur numeric(12,2) not null check (precio_min_eur >= 0),
  precio_medio_eur numeric(12,2) not null check (precio_medio_eur >= precio_min_eur),
  precio_max_eur numeric(12,2) not null check (precio_max_eur >= precio_medio_eur),
  eur_por_watio numeric(8,3) not null check (eur_por_watio > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function set_precios_instalacion_provincial_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_precios_instalacion_provincial_updated_at on precios_instalacion_solar_provincial_es;
create trigger trg_precios_instalacion_provincial_updated_at
before update on precios_instalacion_solar_provincial_es
for each row execute function set_precios_instalacion_provincial_updated_at();

insert into precios_instalacion_solar_provincial_es (
  provincia,
  precio_min_eur,
  precio_medio_eur,
  precio_max_eur,
  eur_por_watio
)
values
  ('A Coruna', 4900.00, 6500.00, 8600.00, 1.480),
  ('Alava', 5100.00, 6700.00, 8900.00, 1.520),
  ('Araba', 5100.00, 6700.00, 8900.00, 1.520),
  ('Albacete', 4700.00, 6200.00, 8200.00, 1.420),
  ('Alicante', 4500.00, 6000.00, 7900.00, 1.380),
  ('Almeria', 4300.00, 5800.00, 7600.00, 1.330),
  ('Asturias', 5100.00, 6800.00, 9000.00, 1.540),
  ('Avila', 4900.00, 6500.00, 8600.00, 1.480),
  ('Badajoz', 4600.00, 6100.00, 8100.00, 1.400),
  ('Barcelona', 5000.00, 6700.00, 9000.00, 1.530),
  ('Bizkaia', 5300.00, 7000.00, 9300.00, 1.590),
  ('Burgos', 5000.00, 6600.00, 8800.00, 1.500),
  ('Caceres', 4700.00, 6200.00, 8200.00, 1.420),
  ('Cadiz', 4500.00, 6000.00, 7900.00, 1.380),
  ('Cantabria', 5200.00, 6900.00, 9100.00, 1.560),
  ('Castellon', 4600.00, 6100.00, 8100.00, 1.400),
  ('Ciudad Real', 4700.00, 6200.00, 8200.00, 1.420),
  ('Cordoba', 4400.00, 5900.00, 7800.00, 1.350),
  ('Cuenca', 4800.00, 6300.00, 8300.00, 1.440),
  ('Gipuzkoa', 5300.00, 7000.00, 9300.00, 1.590),
  ('Girona', 4900.00, 6500.00, 8700.00, 1.490),
  ('Granada', 4500.00, 6000.00, 7900.00, 1.380),
  ('Guadalajara', 4900.00, 6500.00, 8600.00, 1.480),
  ('Huelva', 4500.00, 6000.00, 7900.00, 1.380),
  ('Huesca', 4900.00, 6500.00, 8600.00, 1.480),
  ('Illes Balears', 5200.00, 6900.00, 9200.00, 1.570),
  ('Jaen', 4400.00, 5900.00, 7800.00, 1.350),
  ('La Rioja', 4900.00, 6500.00, 8600.00, 1.480),
  ('Las Palmas', 5100.00, 6800.00, 9100.00, 1.550),
  ('Leon', 5000.00, 6600.00, 8800.00, 1.500),
  ('Lleida', 4800.00, 6400.00, 8500.00, 1.460),
  ('Lugo', 5000.00, 6600.00, 8800.00, 1.500),
  ('Madrid', 5200.00, 7000.00, 9400.00, 1.600),
  ('Malaga', 4500.00, 6000.00, 7900.00, 1.380),
  ('Murcia', 4400.00, 5900.00, 7800.00, 1.350),
  ('Navarra', 5000.00, 6700.00, 8900.00, 1.520),
  ('Ourense', 4900.00, 6500.00, 8600.00, 1.480),
  ('Palencia', 4900.00, 6500.00, 8600.00, 1.480),
  ('Pontevedra', 4900.00, 6500.00, 8600.00, 1.480),
  ('Salamanca', 4900.00, 6500.00, 8600.00, 1.480),
  ('Santa Cruz de Tenerife', 5100.00, 6800.00, 9100.00, 1.550),
  ('Segovia', 4900.00, 6500.00, 8600.00, 1.480),
  ('Sevilla', 4400.00, 5900.00, 7800.00, 1.350),
  ('Soria', 4900.00, 6500.00, 8600.00, 1.480),
  ('Tarragona', 4800.00, 6400.00, 8500.00, 1.460),
  ('Teruel', 4800.00, 6400.00, 8500.00, 1.460),
  ('Toledo', 4800.00, 6400.00, 8500.00, 1.460),
  ('Valencia', 4600.00, 6100.00, 8100.00, 1.400),
  ('Valladolid', 4900.00, 6500.00, 8600.00, 1.480),
  ('Zamora', 4900.00, 6500.00, 8600.00, 1.480),
  ('Zaragoza', 4700.00, 6200.00, 8200.00, 1.420),
  ('Ceuta', 5000.00, 6700.00, 9000.00, 1.530),
  ('Melilla', 5000.00, 6700.00, 9000.00, 1.530)
on conflict (provincia) do update set
  precio_min_eur = excluded.precio_min_eur,
  precio_medio_eur = excluded.precio_medio_eur,
  precio_max_eur = excluded.precio_max_eur,
  eur_por_watio = excluded.eur_por_watio,
  updated_at = now();

create index if not exists idx_precios_instalacion_provincia_medio
  on precios_instalacion_solar_provincial_es (precio_medio_eur);
