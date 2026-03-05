-- =========================================================
-- PSEO SOLAR - GROWTH EXTENSIONS (future-proof baseline)
-- Objetivo: asegurar presencia de tablas clave y contratos estables
-- para evitar cambios de codigo al crecer volumen de datos.
-- =========================================================

create extension if not exists unaccent;
create extension if not exists pg_trgm;

-- ---------------------------------------------------------
-- 1) Municipios base
-- ---------------------------------------------------------
create table if not exists municipios_dataset_es (
  id bigserial primary key,
  municipio text not null,
  provincia text not null,
  comunidad_autonoma text not null,
  poblacion integer,
  latitud numeric(9,6),
  longitud numeric(9,6),
  codigo_postal varchar(5),
  slug text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (municipio, provincia),
  unique (slug)
);

-- ---------------------------------------------------------
-- 2) Slugs SEO de municipios
-- ---------------------------------------------------------
create table if not exists slugs_seo_municipios_espana_es (
  id bigserial primary key,
  municipio text not null,
  slug text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (municipio),
  unique (slug)
);

-- ---------------------------------------------------------
-- 3) Radiacion provincial
-- ---------------------------------------------------------
create table if not exists radiacion_solar_provincial_es (
  provincia text primary key,
  horas_sol_anuales integer not null,
  irradiacion_kwh_m2 numeric(8,1) not null,
  produccion_media_panel_1kw numeric(8,1) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------
-- 4) Tarifas electricas
-- ---------------------------------------------------------
create table if not exists tarifas_electricas_espana_es (
  id bigserial primary key,
  compania text not null,
  tarifa text not null,
  precio_kwh_dia numeric(10,5) not null check (precio_kwh_dia >= 0),
  precio_kwh_noche numeric(10,5) not null check (precio_kwh_noche >= 0),
  precio_kwh_valle numeric(10,5) not null check (precio_kwh_valle >= 0),
  tipo_tarifa text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (compania, tarifa)
);

-- ---------------------------------------------------------
-- 5) Subvenciones por CCAA
-- ---------------------------------------------------------
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

-- ---------------------------------------------------------
-- 6) Bonificaciones IBI por municipio
-- ---------------------------------------------------------
create table if not exists bonificaciones_ibi_municipios_es (
  id bigserial primary key,
  municipio text not null,
  provincia text not null,
  porcentaje_bonificacion numeric(5,2) not null check (porcentaje_bonificacion between 0 and 100),
  duracion_anos smallint not null check (duracion_anos between 0 and 50),
  condiciones text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (municipio, provincia)
);

-- ---------------------------------------------------------
-- 7) Catalogo de equipos solares
-- ---------------------------------------------------------
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

-- ---------------------------------------------------------
-- 8) Compatibilidad tecnica (simple)
-- ---------------------------------------------------------
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

-- ---------------------------------------------------------
-- 9) Estimaciones de ahorro
-- ---------------------------------------------------------
create table if not exists estimaciones_ahorro_anual_es (
  id bigserial primary key,
  consumo_mensual numeric(10,2) not null check (consumo_mensual > 0),
  horas_sol numeric(5,2) not null check (horas_sol > 0),
  potencia_instalacion numeric(10,2) not null check (potencia_instalacion > 0),
  ahorro_estimado numeric(12,2) not null check (ahorro_estimado >= 0),
  produccion_anual numeric(12,2) not null check (produccion_anual >= 0),
  porcentaje_autoconsumo numeric(5,2) not null check (porcentaje_autoconsumo between 0 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (consumo_mensual, horas_sol, potencia_instalacion)
);

-- ---------------------------------------------------------
-- 10) Compatibilidad avanzada (normalizada)
-- ---------------------------------------------------------
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
  communication_protocols text[] not null default '{}',
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
  communication_protocols text[] not null default '{}',
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
  chemistry text,
  usable_capacity_kwh numeric(8,3) not null,
  communication_protocols text[] not null default '{}',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (manufacturer_id, model)
);

-- ---------------------------------------------------------
-- 11) Vistas canonicas (contrato estable para app/API)
-- ---------------------------------------------------------
create or replace view v_tarifas_electricas as
select
  compania,
  tarifa,
  precio_kwh_dia,
  precio_kwh_noche,
  precio_kwh_valle,
  tipo_tarifa
from tarifas_electricas_espana_es;

create or replace view v_equipos_solares as
select
  marca,
  modelo,
  tipo,
  potencia,
  capacidad_kwh,
  eficiencia,
  precio_estimado
from equipos_solares_comunes_es;

create or replace view v_compatibilidad_kit as
select
  inversor,
  bateria,
  cargador_ev,
  compatible
from compatibilidad_inversor_bateria_cargador_ev_es;

create or replace view v_estimaciones_ahorro as
select
  consumo_mensual,
  horas_sol,
  potencia_instalacion,
  ahorro_estimado,
  produccion_anual,
  porcentaje_autoconsumo
from estimaciones_ahorro_anual_es;

-- ---------------------------------------------------------
-- 12) Indices para crecer sin rediseño
-- ---------------------------------------------------------
create index if not exists idx_municipios_dataset_geo
  on municipios_dataset_es (comunidad_autonoma, provincia, municipio);

create index if not exists idx_slugs_municipio
  on slugs_seo_municipios_espana_es (municipio);

create index if not exists idx_tarifas_compania_tipo
  on tarifas_electricas_espana_es (compania, tipo_tarifa);

create index if not exists idx_subvenciones_ccaa_fin
  on subvenciones_solares_ccaa_es (fecha_fin);

create index if not exists idx_ibi_municipio_provincia
  on bonificaciones_ibi_municipios_es (provincia, municipio);

create index if not exists idx_equipos_tipo_marca
  on equipos_solares_comunes_es (tipo, marca);

create index if not exists idx_compatibilidad_simple
  on compatibilidad_inversor_bateria_cargador_ev_es (compatible, inversor);

create index if not exists idx_estimaciones_input
  on estimaciones_ahorro_anual_es (consumo_mensual, horas_sol, potencia_instalacion);
