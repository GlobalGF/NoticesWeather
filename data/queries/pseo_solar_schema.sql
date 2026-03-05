-- =========================================================
-- PSEO SOLAR SPAIN - NORMALIZED SCHEMA (SUPABASE/POSTGRES)
-- =========================================================

-- Extensions
create extension if not exists pgcrypto;
create extension if not exists unaccent;
create extension if not exists pg_trgm;

-- =========================================================
-- Enums
-- =========================================================
do $$ begin
  create type ambito_geo as enum ('nacional', 'comunidad', 'provincia', 'municipio');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type estado_convocatoria as enum ('abierta', 'cerrada', 'proxima', 'agotada');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type tipo_equipo_solar as enum ('panel', 'inversor', 'microinversor', 'optimizador', 'estructura', 'kit');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type tipo_bateria as enum ('LFP', 'NMC', 'AGM', 'GEL', 'LTO', 'OTRA');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type estado_compatibilidad as enum ('compatible', 'compatible_parcial', 'no_compatible', 'desconocida');
exception when duplicate_object then null;
end $$;

-- =========================================================
-- Trigger helper for updated_at columns
-- =========================================================
create or replace function set_updated_at_trigger()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =========================================================
-- 1) comunidades_autonomas
-- =========================================================
create table if not exists comunidades_autonomas (
  id bigserial primary key,
  nombre text not null unique,
  slug text not null unique,
  codigo_ine char(2) unique,
  lat numeric(9,6),
  lon numeric(9,6),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_comunidades_updated_at on comunidades_autonomas;
create trigger trg_comunidades_updated_at
before update on comunidades_autonomas
for each row execute function set_updated_at_trigger();

-- =========================================================
-- 2) provincias
-- =========================================================
create table if not exists provincias (
  id bigserial primary key,
  comunidad_id bigint not null references comunidades_autonomas(id) on delete restrict,
  nombre text not null,
  slug text not null,
  codigo_ine char(2) unique,
  lat numeric(9,6),
  lon numeric(9,6),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (comunidad_id, nombre),
  unique (comunidad_id, slug)
);

drop trigger if exists trg_provincias_updated_at on provincias;
create trigger trg_provincias_updated_at
before update on provincias
for each row execute function set_updated_at_trigger();

-- =========================================================
-- 3) municipios
-- =========================================================
create table if not exists municipios (
  id bigserial primary key,
  provincia_id bigint not null references provincias(id) on delete restrict,
  nombre text not null,
  slug text not null unique,
  codigo_ine char(5) unique,
  lat numeric(9,6),
  lon numeric(9,6),
  poblacion integer,
  superficie_km2 numeric(10,2),
  altitud_m integer,
  zona_climatica text,
  seo_priority_score smallint not null default 50 check (seo_priority_score between 0 and 100),
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_municipios_updated_at on municipios;
create trigger trg_municipios_updated_at
before update on municipios
for each row execute function set_updated_at_trigger();

-- =========================================================
-- 4) radiacion_solar
-- =========================================================
create table if not exists radiacion_solar (
  id bigserial primary key,
  municipio_id bigint not null references municipios(id) on delete cascade,
  fuente text not null default 'PVGIS',
  anual_kwh_m2 numeric(8,2) not null,
  horas_sol_anuales integer,
  inclinacion_optima_deg numeric(5,2),
  azimut_optimo_deg numeric(5,2),
  mensual_kwh_m2 numeric[] check (cardinality(mensual_kwh_m2) = 12),
  confidence_score numeric(5,2) check (confidence_score between 0 and 100),
  vigente_desde date,
  vigente_hasta date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (municipio_id, fuente, vigente_desde)
);

drop trigger if exists trg_radiacion_updated_at on radiacion_solar;
create trigger trg_radiacion_updated_at
before update on radiacion_solar
for each row execute function set_updated_at_trigger();

-- =========================================================
-- 5) tarifas_electricas
-- =========================================================
create table if not exists tarifas_electricas (
  id bigserial primary key,
  codigo text not null unique,
  nombre text not null,
  tipo_consumidor text not null check (tipo_consumidor in ('domestico', 'pyme', 'industrial', 'mixto')),
  discriminacion_horaria boolean not null default true,
  peaje_acceso text,
  comercializadora text,
  activa boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_tarifas_updated_at on tarifas_electricas;
create trigger trg_tarifas_updated_at
before update on tarifas_electricas
for each row execute function set_updated_at_trigger();

-- =========================================================
-- 6) precios_electricidad
-- =========================================================
create table if not exists precios_electricidad (
  id bigserial primary key,
  tarifa_id bigint not null references tarifas_electricas(id) on delete restrict,
  ambito ambito_geo not null default 'nacional',
  comunidad_id bigint references comunidades_autonomas(id) on delete restrict,
  provincia_id bigint references provincias(id) on delete restrict,
  municipio_id bigint references municipios(id) on delete restrict,
  fecha date not null,
  precio_kwh_eur numeric(10,6) not null check (precio_kwh_eur >= 0),
  precio_punta_eur numeric(10,6),
  precio_llano_eur numeric(10,6),
  precio_valle_eur numeric(10,6),
  fuente text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (ambito = 'nacional' and comunidad_id is null and provincia_id is null and municipio_id is null) or
    (ambito = 'comunidad' and comunidad_id is not null and provincia_id is null and municipio_id is null) or
    (ambito = 'provincia' and provincia_id is not null and municipio_id is null) or
    (ambito = 'municipio' and municipio_id is not null)
  )
);

drop trigger if exists trg_precios_updated_at on precios_electricidad;
create trigger trg_precios_updated_at
before update on precios_electricidad
for each row execute function set_updated_at_trigger();

-- =========================================================
-- 7) subvenciones_solares
-- =========================================================
create table if not exists subvenciones_solares (
  id bigserial primary key,
  titulo text not null,
  slug text not null unique,
  ambito ambito_geo not null,
  comunidad_id bigint references comunidades_autonomas(id) on delete restrict,
  provincia_id bigint references provincias(id) on delete restrict,
  municipio_id bigint references municipios(id) on delete restrict,
  organismo_convocante text not null,
  programa text,
  codigo_programa text,
  porcentaje_subvencion numeric(5,2) check (porcentaje_subvencion between 0 and 100),
  importe_min_eur numeric(12,2),
  importe_max_eur numeric(12,2),
  estado estado_convocatoria not null default 'abierta',
  fecha_inicio date,
  fecha_fin date,
  requisitos jsonb,
  url_oficial text,
  notas text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (ambito = 'nacional' and comunidad_id is null and provincia_id is null and municipio_id is null) or
    (ambito = 'comunidad' and comunidad_id is not null and provincia_id is null and municipio_id is null) or
    (ambito = 'provincia' and provincia_id is not null and municipio_id is null) or
    (ambito = 'municipio' and municipio_id is not null)
  )
);

drop trigger if exists trg_subvenciones_updated_at on subvenciones_solares;
create trigger trg_subvenciones_updated_at
before update on subvenciones_solares
for each row execute function set_updated_at_trigger();

-- =========================================================
-- 8) bonificaciones_ibi
-- =========================================================
create table if not exists bonificaciones_ibi (
  id bigserial primary key,
  municipio_id bigint not null references municipios(id) on delete cascade,
  porcentaje numeric(5,2) not null check (porcentaje between 0 and 100),
  anos_vigencia smallint,
  limite_cuota_eur numeric(12,2),
  aplica_residencial boolean not null default true,
  aplica_empresas boolean not null default true,
  requisitos jsonb,
  fecha_inicio date,
  fecha_fin date,
  fuente_url text,
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (municipio_id, fecha_inicio)
);

drop trigger if exists trg_ibi_updated_at on bonificaciones_ibi;
create trigger trg_ibi_updated_at
before update on bonificaciones_ibi
for each row execute function set_updated_at_trigger();

-- =========================================================
-- 9) bonificaciones_icio
-- =========================================================
create table if not exists bonificaciones_icio (
  id bigserial primary key,
  municipio_id bigint not null references municipios(id) on delete cascade,
  porcentaje numeric(5,2) not null check (porcentaje between 0 and 100),
  tope_eur numeric(12,2),
  aplica_residencial boolean not null default true,
  aplica_empresas boolean not null default true,
  requisitos jsonb,
  fecha_inicio date,
  fecha_fin date,
  fuente_url text,
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (municipio_id, fecha_inicio)
);

drop trigger if exists trg_icio_updated_at on bonificaciones_icio;
create trigger trg_icio_updated_at
before update on bonificaciones_icio
for each row execute function set_updated_at_trigger();

-- =========================================================
-- 10) equipos_solares
-- =========================================================
create table if not exists equipos_solares (
  id bigserial primary key,
  tipo tipo_equipo_solar not null,
  fabricante text not null,
  modelo text not null,
  slug text not null unique,
  potencia_w integer,
  eficiencia_pct numeric(5,2),
  fases smallint check (fases in (1, 3)),
  mppt smallint,
  tension_v numeric(8,2),
  compatible_bateria boolean not null default false,
  ficha_tecnica_url text,
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (fabricante, modelo)
);

drop trigger if exists trg_equipos_updated_at on equipos_solares;
create trigger trg_equipos_updated_at
before update on equipos_solares
for each row execute function set_updated_at_trigger();

-- =========================================================
-- 11) baterias_solares
-- =========================================================
create table if not exists baterias_solares (
  id bigserial primary key,
  fabricante text not null,
  modelo text not null,
  slug text not null unique,
  tecnologia tipo_bateria not null,
  capacidad_kwh numeric(8,2) not null check (capacidad_kwh > 0),
  potencia_descarga_kw numeric(8,2),
  ciclos integer,
  profundidad_descarga_pct numeric(5,2) check (profundidad_descarga_pct between 0 and 100),
  eficiencia_roundtrip_pct numeric(5,2) check (eficiencia_roundtrip_pct between 0 and 100),
  tension_v numeric(8,2),
  garantia_anos smallint,
  ficha_tecnica_url text,
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (fabricante, modelo)
);

drop trigger if exists trg_baterias_updated_at on baterias_solares;
create trigger trg_baterias_updated_at
before update on baterias_solares
for each row execute function set_updated_at_trigger();

-- =========================================================
-- 12) compatibilidad_inversores
-- =========================================================
create table if not exists compatibilidad_inversores (
  id bigserial primary key,
  inversor_equipo_id bigint not null references equipos_solares(id) on delete cascade,
  bateria_id bigint not null references baterias_solares(id) on delete cascade,
  tarifa_id bigint references tarifas_electricas(id) on delete set null,
  estado estado_compatibilidad not null default 'desconocida',
  score_compatibilidad smallint check (score_compatibilidad between 0 and 100),
  firmware_minimo text,
  notas text,
  fuente_url text,
  probado_en date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (inversor_equipo_id, bateria_id, tarifa_id)
);

drop trigger if exists trg_compat_updated_at on compatibilidad_inversores;
create trigger trg_compat_updated_at
before update on compatibilidad_inversores
for each row execute function set_updated_at_trigger();

-- =========================================================
-- Indexes (SEO + performance)
-- =========================================================
create index if not exists idx_comunidades_slug on comunidades_autonomas(slug);
create index if not exists idx_provincias_slug on provincias(slug);
create index if not exists idx_provincias_comunidad on provincias(comunidad_id);

create index if not exists idx_municipios_provincia on municipios(provincia_id);
create index if not exists idx_municipios_activo_priority on municipios(activo, seo_priority_score desc);
create index if not exists idx_municipios_nombre_trgm on municipios using gin (nombre gin_trgm_ops);

create index if not exists idx_radiacion_municipio on radiacion_solar(municipio_id);
create index if not exists idx_radiacion_vigencia on radiacion_solar(vigente_desde, vigente_hasta);

create index if not exists idx_precios_tarifa_fecha on precios_electricidad(tarifa_id, fecha desc);
create index if not exists idx_precios_municipio_fecha on precios_electricidad(municipio_id, fecha desc);

create index if not exists idx_subvenciones_estado_fecha on subvenciones_solares(estado, fecha_fin);
create index if not exists idx_subvenciones_municipio on subvenciones_solares(municipio_id);
create index if not exists idx_subvenciones_provincia on subvenciones_solares(provincia_id);
create index if not exists idx_subvenciones_comunidad on subvenciones_solares(comunidad_id);

create index if not exists idx_ibi_municipio_activo on bonificaciones_ibi(municipio_id, activo);
create index if not exists idx_icio_municipio_activo on bonificaciones_icio(municipio_id, activo);

create index if not exists idx_equipos_tipo_activo on equipos_solares(tipo, activo);
create index if not exists idx_baterias_activo on baterias_solares(activo);

create index if not exists idx_compat_inversor on compatibilidad_inversores(inversor_equipo_id);
create index if not exists idx_compat_bateria on compatibilidad_inversores(bateria_id);
