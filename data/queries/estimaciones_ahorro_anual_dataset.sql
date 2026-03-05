-- =========================================================
-- Tabla de estimaciones de ahorro anual
-- Variables: consumo_mensual, horas_sol, potencia_instalacion
-- Salidas: ahorro_estimado, produccion_anual, porcentaje_autoconsumo
-- Formato SQL listo para importar en Supabase
-- =========================================================

create table if not exists estimaciones_ahorro_anual_es (
  id bigserial primary key,
  consumo_mensual numeric(10,2) not null check (consumo_mensual > 0),
  horas_sol numeric(5,2) not null check (horas_sol > 0),
  potencia_instalacion numeric(10,2) not null check (potencia_instalacion > 0),
  ahorro_estimado numeric(12,2) not null check (ahorro_estimado >= 0),
  produccion_anual numeric(12,2) not null check (produccion_anual >= 0),
  porcentaje_autoconsumo numeric(5,2) not null check (porcentaje_autoconsumo >= 0 and porcentaje_autoconsumo <= 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (consumo_mensual, horas_sol, potencia_instalacion)
);

create or replace function set_estimaciones_ahorro_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_estimaciones_ahorro_updated_at on estimaciones_ahorro_anual_es;
create trigger trg_estimaciones_ahorro_updated_at
before update on estimaciones_ahorro_anual_es
for each row execute function set_estimaciones_ahorro_updated_at();

with parametros as (
  select c.consumo_mensual, h.horas_sol, p.potencia_instalacion
  from (
    values (150::numeric), (250::numeric), (350::numeric), (450::numeric), (600::numeric), (800::numeric)
  ) as c(consumo_mensual)
  cross join (
    values (3.50::numeric), (4.00::numeric), (4.50::numeric), (5.00::numeric), (5.50::numeric)
  ) as h(horas_sol)
  cross join (
    values (2.00::numeric), (3.00::numeric), (4.00::numeric), (5.00::numeric), (6.00::numeric), (8.00::numeric), (10.00::numeric)
  ) as p(potencia_instalacion)
),
calculo as (
  select
    consumo_mensual,
    horas_sol,
    potencia_instalacion,
    (consumo_mensual * 12.0) as demanda_anual,
    round((potencia_instalacion * horas_sol * 365.0 * 0.80), 2) as produccion_anual
  from parametros
),
resultado as (
  select
    consumo_mensual,
    horas_sol,
    potencia_instalacion,
    produccion_anual,
    demanda_anual,
    least((produccion_anual * 0.78), (demanda_anual * 0.95)) as energia_autoconsumida
  from calculo
)
insert into estimaciones_ahorro_anual_es (
  consumo_mensual,
  horas_sol,
  potencia_instalacion,
  ahorro_estimado,
  produccion_anual,
  porcentaje_autoconsumo
)
select
  consumo_mensual,
  horas_sol,
  potencia_instalacion,
  round((energia_autoconsumida * 0.22), 2) as ahorro_estimado,
  produccion_anual,
  round((energia_autoconsumida / nullif(demanda_anual, 0)) * 100.0, 2) as porcentaje_autoconsumo
from resultado
on conflict (consumo_mensual, horas_sol, potencia_instalacion)
do update set
  ahorro_estimado = excluded.ahorro_estimado,
  produccion_anual = excluded.produccion_anual,
  porcentaje_autoconsumo = excluded.porcentaje_autoconsumo,
  updated_at = now();

create index if not exists idx_estimaciones_consumo on estimaciones_ahorro_anual_es (consumo_mensual);
create index if not exists idx_estimaciones_horas_sol on estimaciones_ahorro_anual_es (horas_sol);
create index if not exists idx_estimaciones_potencia on estimaciones_ahorro_anual_es (potencia_instalacion);
