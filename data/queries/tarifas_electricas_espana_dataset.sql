-- =========================================================
-- Dataset de tarifas electricas disponibles en Espana
-- Formato SQL listo para importar en Supabase
-- Nota: precios orientativos para analitica/SEO (no oferta vinculante)
-- =========================================================

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

create or replace function set_tarifas_espana_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_tarifas_espana_updated_at on tarifas_electricas_espana_es;
create trigger trg_tarifas_espana_updated_at
before update on tarifas_electricas_espana_es
for each row execute function set_tarifas_espana_updated_at();

insert into tarifas_electricas_espana_es (
  compania,
  tarifa,
  precio_kwh_dia,
  precio_kwh_noche,
  precio_kwh_valle,
  tipo_tarifa
)
values
  ('Iberdrola', 'Plan Estable', 0.18990, 0.18990, 0.18990, 'precio-fijo'),
  ('Iberdrola', 'Plan Noche', 0.21990, 0.12990, 0.10990, 'discriminacion-horaria'),
  ('Iberdrola', 'Plan Online 3 Periodos', 0.22990, 0.14990, 0.10990, '3-periodos'),

  ('Endesa', 'One Luz', 0.19900, 0.19900, 0.19900, 'precio-fijo'),
  ('Endesa', 'One Luz 3 Periodos', 0.23900, 0.15900, 0.10900, '3-periodos'),
  ('Endesa', 'Tempo Happy Horas Promo', 0.22900, 0.13900, 0.09900, 'discriminacion-horaria'),

  ('Naturgy', 'Tarifa Por Uso Luz', 0.20900, 0.20900, 0.20900, 'precio-fijo'),
  ('Naturgy', 'Noche Luz', 0.22900, 0.13900, 0.09900, 'discriminacion-horaria'),
  ('Naturgy', 'Tarifa 3 Tramos', 0.23900, 0.15900, 0.10900, '3-periodos'),

  ('Repsol', 'Ahorro Plus', 0.19500, 0.19500, 0.19500, 'precio-fijo'),
  ('Repsol', 'Discriminacion Horaria', 0.22900, 0.13900, 0.09900, 'discriminacion-horaria'),
  ('Repsol', 'Tarifa 3 Periodos', 0.23500, 0.15500, 0.10500, '3-periodos'),

  ('TotalEnergies', 'A Tu Aire Luz Siempre', 0.19900, 0.19900, 0.19900, 'precio-fijo'),
  ('TotalEnergies', 'A Tu Aire Luz Programa Tu Ahorro', 0.22900, 0.13900, 0.09900, 'discriminacion-horaria'),
  ('TotalEnergies', 'A Tu Aire Luz 3 Periodos', 0.23900, 0.15900, 0.10900, '3-periodos'),

  ('Holaluz', 'Tarifa Clasica', 0.20500, 0.20500, 0.20500, 'precio-fijo'),
  ('Holaluz', 'Tarifa Dos Tramos', 0.22900, 0.13900, 0.09900, 'discriminacion-horaria'),
  ('Holaluz', 'Tarifa Tres Tramos', 0.23900, 0.15900, 0.10900, '3-periodos'),

  ('Octopus Energy', 'Octopus Relax', 0.18700, 0.18700, 0.18700, 'precio-fijo'),
  ('Octopus Energy', 'Octopus 3', 0.22700, 0.13700, 0.09700, '3-periodos'),
  ('Octopus Energy', 'Octopus Index', 0.17000, 0.13000, 0.09000, 'indexada'),

  ('Curenergia', 'PVPC 2.0TD', 0.18400, 0.12800, 0.08900, 'regulada-pvpc'),
  ('Baser', 'PVPC 2.0TD', 0.18500, 0.12900, 0.09000, 'regulada-pvpc'),
  ('Energia XXI', 'PVPC 2.0TD', 0.18600, 0.13000, 0.09100, 'regulada-pvpc'),
  ('Regsiti', 'PVPC 2.0TD', 0.18500, 0.12900, 0.09000, 'regulada-pvpc'),
  ('Comercializadora Regulada Naturgy', 'PVPC 2.0TD', 0.18600, 0.13000, 0.09100, 'regulada-pvpc'),

  ('Factorenergia', 'Tarifa Fija Hogar', 0.19800, 0.19800, 0.19800, 'precio-fijo'),
  ('Factorenergia', 'Tarifa DH Hogar', 0.22800, 0.13800, 0.09800, 'discriminacion-horaria'),

  ('Podo', 'Tarifa Fija', 0.19600, 0.19600, 0.19600, 'precio-fijo'),
  ('Podo', 'Tarifa 3 Periodos', 0.23400, 0.15400, 0.10400, '3-periodos'),

  ('Pepeenergy', 'Tarifa Indexada', 0.17100, 0.13100, 0.09100, 'indexada'),
  ('Pepeenergy', 'Tarifa Fija', 0.19400, 0.19400, 0.19400, 'precio-fijo')
on conflict (compania, tarifa) do update set
  precio_kwh_dia = excluded.precio_kwh_dia,
  precio_kwh_noche = excluded.precio_kwh_noche,
  precio_kwh_valle = excluded.precio_kwh_valle,
  tipo_tarifa = excluded.tipo_tarifa,
  updated_at = now();

create index if not exists idx_tarifas_es_compania on tarifas_electricas_espana_es (compania);
create index if not exists idx_tarifas_es_tipo on tarifas_electricas_espana_es (tipo_tarifa);
create index if not exists idx_tarifas_es_precio_dia on tarifas_electricas_espana_es (precio_kwh_dia);
create index if not exists idx_tarifas_es_precio_noche on tarifas_electricas_espana_es (precio_kwh_noche);
create index if not exists idx_tarifas_es_precio_valle on tarifas_electricas_espana_es (precio_kwh_valle);
