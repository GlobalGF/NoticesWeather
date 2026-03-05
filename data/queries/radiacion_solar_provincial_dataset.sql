-- =========================================================
-- Dataset de radiacion solar media anual por provincia (Espana)
-- Formato SQL listo para importar en Supabase
-- =========================================================

create table if not exists radiacion_solar_provincial_es (
  provincia text primary key,
  horas_sol_anuales integer not null check (horas_sol_anuales > 0),
  irradiacion_kwh_m2 numeric(8,1) not null check (irradiacion_kwh_m2 > 0),
  produccion_media_panel_1kw numeric(8,1) not null check (produccion_media_panel_1kw > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function set_radiacion_provincial_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_radiacion_provincial_updated_at on radiacion_solar_provincial_es;
create trigger trg_radiacion_provincial_updated_at
before update on radiacion_solar_provincial_es
for each row execute function set_radiacion_provincial_updated_at();

insert into radiacion_solar_provincial_es (
  provincia,
  horas_sol_anuales,
  irradiacion_kwh_m2,
  produccion_media_panel_1kw
)
values
  ('A Coruna', 2230, 1410.0, 1235.0),
  ('Alava', 2200, 1400.0, 1220.0),
  ('Albacete', 2870, 1800.0, 1650.0),
  ('Alicante', 3020, 1925.0, 1760.0),
  ('Almeria', 3250, 2080.0, 1885.0),
  ('Asturias', 2050, 1310.0, 1160.0),
  ('Avila', 2500, 1600.0, 1470.0),
  ('Badajoz', 2960, 1885.0, 1730.0),
  ('Barcelona', 2550, 1640.0, 1505.0),
  ('Bizkaia', 2050, 1290.0, 1145.0),
  ('Burgos', 2300, 1450.0, 1295.0),
  ('Caceres', 2900, 1855.0, 1705.0),
  ('Cadiz', 2980, 1900.0, 1740.0),
  ('Cantabria', 2050, 1320.0, 1170.0),
  ('Castellon', 2860, 1810.0, 1660.0),
  ('Ciudad Real', 2920, 1865.0, 1710.0),
  ('Cordoba', 3050, 1950.0, 1785.0),
  ('Cuenca', 2750, 1740.0, 1600.0),
  ('Gipuzkoa', 2020, 1280.0, 1135.0),
  ('Girona', 2520, 1600.0, 1470.0),
  ('Granada', 3050, 1955.0, 1785.0),
  ('Guadalajara', 2700, 1705.0, 1565.0),
  ('Huelva', 3050, 1940.0, 1775.0),
  ('Huesca', 2550, 1620.0, 1490.0),
  ('Illes Balears', 2870, 1840.0, 1690.0),
  ('Jaen', 3000, 1920.0, 1760.0),
  ('La Rioja', 2450, 1550.0, 1425.0),
  ('Las Palmas', 3040, 1960.0, 1795.0),
  ('Leon', 2250, 1430.0, 1275.0),
  ('Lleida', 2700, 1720.0, 1585.0),
  ('Lugo', 2180, 1380.0, 1215.0),
  ('Madrid', 2850, 1820.0, 1670.0),
  ('Malaga', 3020, 1930.0, 1765.0),
  ('Murcia', 3120, 2010.0, 1840.0),
  ('Navarra', 2320, 1470.0, 1320.0),
  ('Ourense', 2300, 1470.0, 1315.0),
  ('Palencia', 2320, 1470.0, 1320.0),
  ('Pontevedra', 2260, 1430.0, 1265.0),
  ('Salamanca', 2580, 1645.0, 1515.0),
  ('Santa Cruz de Tenerife', 2990, 1935.0, 1770.0),
  ('Segovia', 2570, 1635.0, 1505.0),
  ('Sevilla', 3060, 1960.0, 1795.0),
  ('Soria', 2450, 1550.0, 1420.0),
  ('Tarragona', 2820, 1780.0, 1635.0),
  ('Teruel', 2600, 1660.0, 1530.0),
  ('Toledo', 2890, 1845.0, 1695.0),
  ('Valencia', 2890, 1840.0, 1690.0),
  ('Valladolid', 2420, 1530.0, 1395.0),
  ('Zamora', 2460, 1560.0, 1430.0),
  ('Zaragoza', 2760, 1760.0, 1615.0),
  ('Ceuta', 2950, 1880.0, 1720.0),
  ('Melilla', 3000, 1910.0, 1745.0)
on conflict (provincia) do update set
  horas_sol_anuales = excluded.horas_sol_anuales,
  irradiacion_kwh_m2 = excluded.irradiacion_kwh_m2,
  produccion_media_panel_1kw = excluded.produccion_media_panel_1kw,
  updated_at = now();

create index if not exists idx_radiacion_provincial_horas on radiacion_solar_provincial_es (horas_sol_anuales desc);
create index if not exists idx_radiacion_provincial_irradiacion on radiacion_solar_provincial_es (irradiacion_kwh_m2 desc);
