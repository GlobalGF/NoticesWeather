-- =========================================================
-- Dataset de compatibilidad tecnica
-- Inversor + bateria domestica + cargador EV
-- Formato SQL listo para importar en Supabase
-- =========================================================

create table if not exists compatibilidad_inversor_bateria_cargador_ev_es (
  id bigserial primary key,
  inversor text not null,
  bateria text not null,
  cargador_ev text not null,
  compatible boolean not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (inversor, bateria, cargador_ev)
);

create or replace function set_compatibilidad_tecnica_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_compatibilidad_tecnica_updated_at on compatibilidad_inversor_bateria_cargador_ev_es;
create trigger trg_compatibilidad_tecnica_updated_at
before update on compatibilidad_inversor_bateria_cargador_ev_es
for each row execute function set_compatibilidad_tecnica_updated_at();

insert into compatibilidad_inversor_bateria_cargador_ev_es (
  inversor,
  bateria,
  cargador_ev,
  compatible
)
values
  ('Huawei SUN2000-5KTL-L1', 'Huawei LUNA2000-10-S0', 'Huawei FusionCharge AC 7.4kW', true),
  ('Huawei SUN2000-10KTL-M1', 'Huawei LUNA2000-15-S0', 'Huawei FusionCharge AC 22kW', true),
  ('Huawei SUN2000-5KTL-L1', 'BYD Battery-Box Premium HVS 10.2', 'Wallbox Pulsar Plus', false),

  ('Fronius Primo 5.0-1', 'BYD Battery-Box Premium HVS 10.2', 'Fronius Wattpilot Home 11 J', true),
  ('Fronius Primo 5.0-1', 'BYD Battery-Box Premium HVM 11.0', 'Wallbox Pulsar Plus', true),
  ('Fronius Primo 5.0-1', 'Tesla Powerwall 3', 'Fronius Wattpilot Home 11 J', false),

  ('SolarEdge SE5000H HD-Wave', 'LG RESU10H Prime', 'SolarEdge Home EV Charger', true),
  ('SolarEdge SE5000H HD-Wave', 'SolarEdge Home Battery 10kWh', 'SolarEdge Home EV Charger', true),
  ('SolarEdge SE5000H HD-Wave', 'Pylontech US5000', 'SolarEdge Home EV Charger', false),

  ('SMA Sunny Boy 5.0', 'SMA Home Storage 9.8', 'SMA EV Charger 7.4', true),
  ('SMA Sunny Boy 5.0', 'BYD Battery-Box Premium HVS 10.2', 'SMA EV Charger 7.4', true),
  ('SMA Sunny Boy 5.0', 'Huawei LUNA2000-10-S0', 'SMA EV Charger 7.4', false),

  ('GoodWe GW5000D-NS', 'BYD Battery-Box Premium HVS 10.2', 'Wallbox Pulsar Plus', true),
  ('GoodWe GW5000D-NS', 'Pylontech US5000', 'Zappi v2', true),
  ('GoodWe GW5000D-NS', 'Tesla Powerwall 3', 'Zappi v2', false),

  ('Sungrow SH5.0RT', 'Sungrow SBR096', 'Sungrow AC011E-01', true),
  ('Sungrow SH10RT', 'Sungrow SBR128', 'Sungrow AC022E-01', true),
  ('Sungrow SH5.0RT', 'LG RESU10H Prime', 'Sungrow AC011E-01', false),

  ('Victron MultiPlus-II 48/5000', 'Pylontech US5000', 'Wallbox Pulsar Plus', true),
  ('Victron MultiPlus-II 48/5000', 'BYD Battery-Box Premium HVS 10.2', 'Zappi v2', true),
  ('Victron MultiPlus-II 48/5000', 'Huawei LUNA2000-10-S0', 'Wallbox Pulsar Plus', false),

  ('Enphase IQ8 (sistema con IQ Gateway)', 'Enphase IQ Battery 10T', 'Enphase IQ EV Charger 2', true),
  ('Enphase IQ8 (sistema con IQ Gateway)', 'Tesla Powerwall 3', 'Enphase IQ EV Charger 2', false),
  ('Enphase IQ8 (sistema con IQ Gateway)', 'Enphase IQ Battery 5P', 'Wallbox Pulsar Plus', true)
on conflict (inversor, bateria, cargador_ev) do update set
  compatible = excluded.compatible,
  updated_at = now();

create index if not exists idx_compatibilidad_inversor on compatibilidad_inversor_bateria_cargador_ev_es (inversor);
create index if not exists idx_compatibilidad_bateria on compatibilidad_inversor_bateria_cargador_ev_es (bateria);
create index if not exists idx_compatibilidad_cargador on compatibilidad_inversor_bateria_cargador_ev_es (cargador_ev);
create index if not exists idx_compatibilidad_flag on compatibilidad_inversor_bateria_cargador_ev_es (compatible);
