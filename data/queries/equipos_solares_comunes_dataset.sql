-- =========================================================
-- Dataset de equipos solares comunes
-- Formato SQL listo para importar en Supabase
-- Nota: valores orientativos de mercado para analitica/SEO
-- =========================================================

create table if not exists equipos_solares_comunes_es (
  id bigserial primary key,
  marca text not null,
  modelo text not null,
  tipo text not null,
  potencia numeric(10,2) not null default 0 check (potencia >= 0),
  capacidad_kwh numeric(10,2) not null default 0 check (capacidad_kwh >= 0),
  eficiencia numeric(5,2) not null check (eficiencia >= 0 and eficiencia <= 100),
  precio_estimado numeric(10,2) not null check (precio_estimado >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (marca, modelo)
);

create or replace function set_equipos_solares_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_equipos_solares_updated_at on equipos_solares_comunes_es;
create trigger trg_equipos_solares_updated_at
before update on equipos_solares_comunes_es
for each row execute function set_equipos_solares_updated_at();

insert into equipos_solares_comunes_es (
  marca,
  modelo,
  tipo,
  potencia,
  capacidad_kwh,
  eficiencia,
  precio_estimado
)
values
  -- Paneles solares (potencia en W)
  ('LONGi', 'Hi-MO 6 LR5-54HTH-440M', 'panel-solar', 440.00, 0.00, 22.50, 125.00),
  ('JA Solar', 'JAM54S31-430', 'panel-solar', 430.00, 0.00, 21.80, 118.00),
  ('Trina Solar', 'Vertex S TSM-NEG9R.28-425', 'panel-solar', 425.00, 0.00, 21.30, 115.00),
  ('Canadian Solar', 'HiKu6 CS6R-420MS', 'panel-solar', 420.00, 0.00, 21.00, 112.00),
  ('JinkoSolar', 'Tiger Neo N-type 435', 'panel-solar', 435.00, 0.00, 21.90, 122.00),
  ('Risen', 'RSM40-8-410M', 'panel-solar', 410.00, 0.00, 20.90, 106.00),
  ('SunPower', 'Maxeon 6 AC 440', 'panel-solar', 440.00, 0.00, 22.80, 245.00),
  ('Qcells', 'Q.PEAK DUO ML-G11S+ 410', 'panel-solar', 410.00, 0.00, 21.10, 132.00),

  -- Inversores (potencia en W)
  ('Huawei', 'SUN2000-5KTL-L1', 'inversor', 5000.00, 0.00, 98.40, 1200.00),
  ('Huawei', 'SUN2000-10KTL-M1', 'inversor', 10000.00, 0.00, 98.60, 1820.00),
  ('Fronius', 'Primo 5.0-1', 'inversor', 5000.00, 0.00, 97.90, 1650.00),
  ('SMA', 'Sunny Boy 5.0', 'inversor', 5000.00, 0.00, 97.00, 1490.00),
  ('SolarEdge', 'SE5000H HD-Wave', 'inversor', 5000.00, 0.00, 99.00, 1580.00),
  ('GoodWe', 'GW5000D-NS', 'inversor', 5000.00, 0.00, 97.80, 980.00),
  ('Solis', 'S6-GR1P5K', 'inversor', 5000.00, 0.00, 97.70, 860.00),
  ('Enphase', 'IQ8HC', 'microinversor', 384.00, 0.00, 97.30, 190.00),

  -- Baterias (capacidad en kWh)
  ('Tesla', 'Powerwall 3', 'bateria', 0.00, 13.50, 90.00, 8200.00),
  ('BYD', 'Battery-Box Premium HVS 10.2', 'bateria', 0.00, 10.24, 95.00, 6100.00),
  ('BYD', 'Battery-Box Premium HVM 11.0', 'bateria', 0.00, 11.04, 95.00, 6600.00),
  ('Huawei', 'LUNA2000-10-S0', 'bateria', 0.00, 10.00, 94.50, 5900.00),
  ('Huawei', 'LUNA2000-15-S0', 'bateria', 0.00, 15.00, 94.50, 8100.00),
  ('Pylontech', 'US5000', 'bateria', 0.00, 4.80, 95.00, 1850.00),
  ('Pylontech', 'US3000C', 'bateria', 0.00, 3.55, 95.00, 1420.00),
  ('LG Energy Solution', 'RESU10H Prime', 'bateria', 0.00, 9.60, 94.00, 6100.00),
  ('Sonnen', 'sonnenBatterie 10 performance', 'bateria', 0.00, 11.00, 90.00, 9200.00),
  ('Dyness', 'Tower T10', 'bateria', 0.00, 10.66, 95.00, 5400.00),

  -- Equipos hibridos / optimizadores
  ('Victron Energy', 'MultiPlus-II 48/5000', 'inversor-hibrido', 5000.00, 0.00, 95.00, 1750.00),
  ('Sungrow', 'SH5.0RT', 'inversor-hibrido', 5000.00, 0.00, 98.20, 1690.00),
  ('Sungrow', 'SH10RT', 'inversor-hibrido', 10000.00, 0.00, 98.40, 2490.00),
  ('SolarEdge', 'P505', 'optimizador', 505.00, 0.00, 99.50, 78.00),
  ('Tigo', 'TS4-A-O', 'optimizador', 700.00, 0.00, 99.40, 64.00)
on conflict (marca, modelo) do update set
  tipo = excluded.tipo,
  potencia = excluded.potencia,
  capacidad_kwh = excluded.capacidad_kwh,
  eficiencia = excluded.eficiencia,
  precio_estimado = excluded.precio_estimado,
  updated_at = now();

create index if not exists idx_equipos_solares_marca on equipos_solares_comunes_es (marca);
create index if not exists idx_equipos_solares_tipo on equipos_solares_comunes_es (tipo);
create index if not exists idx_equipos_solares_potencia on equipos_solares_comunes_es (potencia);
create index if not exists idx_equipos_solares_capacidad on equipos_solares_comunes_es (capacidad_kwh);
create index if not exists idx_equipos_solares_precio on equipos_solares_comunes_es (precio_estimado);
