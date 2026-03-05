-- Solar hardware compatibility model for inverters, EV chargers and home batteries.

create extension if not exists pgcrypto;

create type compatibility_level as enum (
  'compatible',
  'compatible_with_limits',
  'not_compatible',
  'unknown'
);

create type test_status as enum (
  'lab_tested',
  'field_validated',
  'vendor_declared',
  'pending_review'
);

create table if not exists hardware_manufacturers (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  country_code text,
  website text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists solar_inverters (
  id uuid primary key default gen_random_uuid(),
  manufacturer_id uuid not null references hardware_manufacturers(id),
  model text not null,
  slug text not null unique,
  phases smallint not null check (phases in (1, 3)),
  max_ac_power_kw numeric(8,3) not null,
  mppt_count smallint,
  battery_ready boolean not null default false,
  communication_protocols text[] not null default '{}', -- modbus, can, sunspec, ocpp, eebus
  firmware_min text,
  firmware_latest text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (manufacturer_id, model)
);

create table if not exists ev_chargers (
  id uuid primary key default gen_random_uuid(),
  manufacturer_id uuid not null references hardware_manufacturers(id),
  model text not null,
  slug text not null unique,
  phases smallint not null check (phases in (1, 3)),
  max_charge_power_kw numeric(8,3) not null,
  supports_dynamic_load_balancing boolean not null default false,
  supports_solar_surplus_mode boolean not null default false,
  communication_protocols text[] not null default '{}',
  firmware_min text,
  firmware_latest text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (manufacturer_id, model)
);

create table if not exists home_batteries (
  id uuid primary key default gen_random_uuid(),
  manufacturer_id uuid not null references hardware_manufacturers(id),
  model text not null,
  slug text not null unique,
  chemistry text, -- LFP, NMC...
  usable_capacity_kwh numeric(8,3) not null,
  max_charge_power_kw numeric(8,3),
  max_discharge_power_kw numeric(8,3),
  communication_protocols text[] not null default '{}',
  firmware_min text,
  firmware_latest text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (manufacturer_id, model)
);

-- Pairwise compatibility matrix.
create table if not exists compatibility_pairs (
  id uuid primary key default gen_random_uuid(),
  inverter_id uuid not null references solar_inverters(id),
  charger_id uuid references ev_chargers(id),
  battery_id uuid references home_batteries(id),
  compatibility compatibility_level not null,
  status test_status not null default 'pending_review',
  min_inverter_firmware text,
  min_charger_firmware text,
  min_battery_firmware text,
  technical_limitations text,
  notes text,
  verified_at timestamptz,
  source_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (charger_id is not null and battery_id is null) or
    (charger_id is null and battery_id is not null)
  ),
  unique (inverter_id, charger_id, battery_id)
);

-- Full kit compatibility for inverter + charger + battery combinations.
create table if not exists compatibility_kits (
  id uuid primary key default gen_random_uuid(),
  inverter_id uuid not null references solar_inverters(id),
  charger_id uuid not null references ev_chargers(id),
  battery_id uuid not null references home_batteries(id),
  compatibility compatibility_level not null,
  status test_status not null default 'pending_review',
  estimated_efficiency_pct numeric(5,2),
  supports_zero_export boolean,
  supports_peak_shaving boolean,
  supports_backup_mode boolean,
  technical_limitations text,
  notes text,
  verified_at timestamptz,
  source_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (inverter_id, charger_id, battery_id)
);

create index if not exists idx_pairs_inverter on compatibility_pairs(inverter_id);
create index if not exists idx_pairs_charger on compatibility_pairs(charger_id);
create index if not exists idx_pairs_battery on compatibility_pairs(battery_id);
create index if not exists idx_pairs_compatibility on compatibility_pairs(compatibility);

create index if not exists idx_kits_inverter on compatibility_kits(inverter_id);
create index if not exists idx_kits_charger on compatibility_kits(charger_id);
create index if not exists idx_kits_battery on compatibility_kits(battery_id);
create index if not exists idx_kits_compatibility on compatibility_kits(compatibility);
create index if not exists idx_kits_efficiency on compatibility_kits(estimated_efficiency_pct desc);

create or replace function set_updated_at_trigger()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_hw_manufacturers_updated_at on hardware_manufacturers;
create trigger trg_hw_manufacturers_updated_at
before update on hardware_manufacturers
for each row execute function set_updated_at_trigger();

drop trigger if exists trg_solar_inverters_updated_at on solar_inverters;
create trigger trg_solar_inverters_updated_at
before update on solar_inverters
for each row execute function set_updated_at_trigger();

drop trigger if exists trg_ev_chargers_updated_at on ev_chargers;
create trigger trg_ev_chargers_updated_at
before update on ev_chargers
for each row execute function set_updated_at_trigger();

drop trigger if exists trg_home_batteries_updated_at on home_batteries;
create trigger trg_home_batteries_updated_at
before update on home_batteries
for each row execute function set_updated_at_trigger();

drop trigger if exists trg_compatibility_pairs_updated_at on compatibility_pairs;
create trigger trg_compatibility_pairs_updated_at
before update on compatibility_pairs
for each row execute function set_updated_at_trigger();

drop trigger if exists trg_compatibility_kits_updated_at on compatibility_kits;
create trigger trg_compatibility_kits_updated_at
before update on compatibility_kits
for each row execute function set_updated_at_trigger();

-- Example query 1: best compatible kits for one inverter.
-- select
--   ck.id,
--   c.model as charger_model,
--   b.model as battery_model,
--   ck.estimated_efficiency_pct,
--   ck.supports_zero_export,
--   ck.supports_peak_shaving,
--   ck.supports_backup_mode
-- from compatibility_kits ck
-- join ev_chargers c on c.id = ck.charger_id
-- join home_batteries b on b.id = ck.battery_id
-- where ck.inverter_id = 'PUT-INVERTER-UUID'
--   and ck.compatibility in ('compatible', 'compatible_with_limits')
-- order by ck.estimated_efficiency_pct desc nulls last;

-- Example query 2: incompatible combinations to review.
-- select
--   i.model as inverter_model,
--   c.model as charger_model,
--   b.model as battery_model,
--   ck.technical_limitations,
--   ck.notes,
--   ck.source_url
-- from compatibility_kits ck
-- join solar_inverters i on i.id = ck.inverter_id
-- join ev_chargers c on c.id = ck.charger_id
-- join home_batteries b on b.id = ck.battery_id
-- where ck.compatibility = 'not_compatible'
-- order by ck.updated_at desc;

-- Example query 3: EV charger compatibility coverage by inverter.
-- select
--   i.slug as inverter_slug,
--   count(*) filter (where p.compatibility = 'compatible') as compatible_count,
--   count(*) filter (where p.compatibility = 'compatible_with_limits') as limited_count,
--   count(*) filter (where p.compatibility = 'not_compatible') as incompatible_count
-- from compatibility_pairs p
-- join solar_inverters i on i.id = p.inverter_id
-- where p.charger_id is not null
-- group by i.slug
-- order by compatible_count desc;
