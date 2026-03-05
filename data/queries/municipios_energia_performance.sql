-- Query optimizada para detalle por slug (usa solo columnas necesarias)
select
  municipio,
  provincia,
  comunidad_autonoma,
  habitantes,
  horas_sol,
  ahorro_estimado,
  bonificacion_ibi,
  bonificacion_icio,
  subvencion_autoconsumo,
  irradiacion_solar,
  precio_medio_luz,
  slug
from public.municipios_energia
where slug = $1
limit 1;

-- Indice critico para asegurar latencia baja por slug (<200ms con cache caliente)
create index if not exists idx_municipios_energia_slug on public.municipios_energia (slug);

-- Indice de apoyo para generar params por prioridad de trafico/poblacion
create index if not exists idx_municipios_energia_habitantes on public.municipios_energia (habitantes desc);
