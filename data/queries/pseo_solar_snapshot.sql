-- =========================================================
-- PSEO SNAPSHOT VIEW FOR DYNAMIC SEO PAGES
-- =========================================================
-- This materialized view denormalizes the latest values needed to render
-- high-scale municipal SEO pages with minimal query cost.

create materialized view if not exists seo_municipio_snapshot as
with latest_radiacion as (
  select distinct on (r.municipio_id)
    r.municipio_id,
    r.anual_kwh_m2,
    r.horas_sol_anuales,
    r.inclinacion_optima_deg,
    r.azimut_optimo_deg,
    r.fuente as radiacion_fuente,
    r.vigente_desde
  from radiacion_solar r
  order by r.municipio_id, coalesce(r.vigente_desde, date '1900-01-01') desc, r.id desc
),
latest_precio as (
  select distinct on (p.municipio_id, p.tarifa_id)
    p.municipio_id,
    p.tarifa_id,
    p.fecha,
    p.precio_kwh_eur,
    p.precio_punta_eur,
    p.precio_llano_eur,
    p.precio_valle_eur
  from precios_electricidad p
  where p.municipio_id is not null
  order by p.municipio_id, p.tarifa_id, p.fecha desc, p.id desc
),
latest_ibi as (
  select distinct on (b.municipio_id)
    b.municipio_id,
    b.porcentaje as ibi_porcentaje,
    b.anos_vigencia as ibi_anos,
    b.fecha_inicio as ibi_inicio,
    b.fecha_fin as ibi_fin
  from bonificaciones_ibi b
  where b.activo = true
  order by b.municipio_id, coalesce(b.fecha_inicio, date '1900-01-01') desc, b.id desc
),
latest_icio as (
  select distinct on (c.municipio_id)
    c.municipio_id,
    c.porcentaje as icio_porcentaje,
    c.tope_eur as icio_tope_eur,
    c.fecha_inicio as icio_inicio,
    c.fecha_fin as icio_fin
  from bonificaciones_icio c
  where c.activo = true
  order by c.municipio_id, coalesce(c.fecha_inicio, date '1900-01-01') desc, c.id desc
),
active_subsidies as (
  select
    s.municipio_id,
    count(*) filter (where s.estado = 'abierta') as subvenciones_abiertas,
    max(s.porcentaje_subvencion) as subvencion_max_pct,
    max(s.importe_max_eur) as subvencion_max_eur,
    max(s.fecha_fin) as subvencion_proxima_fin
  from subvenciones_solares s
  where s.municipio_id is not null
  group by s.municipio_id
)
select
  m.id as municipio_id,
  m.slug as municipio_slug,
  m.nombre as municipio,
  m.poblacion,
  m.seo_priority_score,
  p.id as provincia_id,
  p.slug as provincia_slug,
  p.nombre as provincia,
  ca.id as comunidad_id,
  ca.slug as comunidad_slug,
  ca.nombre as comunidad_autonoma,

  lr.anual_kwh_m2,
  lr.horas_sol_anuales,
  lr.inclinacion_optima_deg,
  lr.azimut_optimo_deg,
  lr.radiacion_fuente,

  lp.tarifa_id,
  t.codigo as tarifa_codigo,
  t.nombre as tarifa_nombre,
  lp.fecha as precio_fecha,
  lp.precio_kwh_eur,
  lp.precio_punta_eur,
  lp.precio_llano_eur,
  lp.precio_valle_eur,

  li.ibi_porcentaje,
  li.ibi_anos,
  lc.icio_porcentaje,
  lc.icio_tope_eur,

  coalesce(asub.subvenciones_abiertas, 0) as subvenciones_abiertas,
  asub.subvencion_max_pct,
  asub.subvencion_max_eur,
  asub.subvencion_proxima_fin,

  now() as snapshot_generated_at
from municipios m
join provincias p on p.id = m.provincia_id
join comunidades_autonomas ca on ca.id = p.comunidad_id
left join latest_radiacion lr on lr.municipio_id = m.id
left join latest_precio lp on lp.municipio_id = m.id
left join tarifas_electricas t on t.id = lp.tarifa_id
left join latest_ibi li on li.municipio_id = m.id
left join latest_icio lc on lc.municipio_id = m.id
left join active_subsidies asub on asub.municipio_id = m.id
where m.activo = true;

-- Required for concurrent refresh.
create unique index if not exists ux_seo_municipio_snapshot_muni_tarifa
  on seo_municipio_snapshot (municipio_id, coalesce(tarifa_id, 0));

create index if not exists idx_seo_snapshot_municipio_slug
  on seo_municipio_snapshot (municipio_slug);

create index if not exists idx_seo_snapshot_geo
  on seo_municipio_snapshot (comunidad_slug, provincia_slug, municipio_slug);

create index if not exists idx_seo_snapshot_priority
  on seo_municipio_snapshot (seo_priority_score desc);

-- Maintenance
-- refresh materialized view concurrently seo_municipio_snapshot;
