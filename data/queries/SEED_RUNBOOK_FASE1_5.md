# Runbook de carga de datos (Fase 1 a Fase 5)

Este flujo sirve para:
- Primera carga completa.
- Recargas periodicas sin romper nada (la mayoria usa `ON CONFLICT`).

## 1) Primera carga completa

Ejecuta en este orden en Supabase SQL Editor:

1. `data/queries/pseo_solar_schema.sql`
2. `data/queries/pseo_growth_extensions.sql`
3. `data/queries/municipios_espana_dataset.sql`
4. `data/queries/slugs_seo_municipios_espana_dataset.sql`
5. `data/queries/radiacion_solar_provincial_dataset.sql`
6. `data/queries/tarifas_electricas_espana_dataset.sql`
7. `data/queries/subvenciones_solares_ccaa_dataset.sql`
8. `data/queries/bonificaciones_ibi_municipios_dataset.sql`
9. `data/queries/equipos_solares_comunes_dataset.sql`
10. `data/queries/compatibilidad_inversor_bateria_cargador_ev_dataset.sql`
11. `data/queries/estimaciones_ahorro_anual_dataset.sql`
12. `data/queries/municipios_energia_performance.sql`
13. `data/queries/pseo_index.sql`
14. `data/queries/pseo_slug_index.sql`

Nota:
- Si prefieres carga por bloques de municipios, sustituye el paso 3 por:
  - `data/queries/municipios_parts/municipios_espana_dataset_part_01.sql`
  - `data/queries/municipios_parts/municipios_espana_dataset_part_02.sql`
  - `data/queries/municipios_parts/municipios_espana_dataset_part_03.sql`
  - `data/queries/municipios_parts/municipios_espana_dataset_part_04.sql`

## 2) Recarga periodica (mantenimiento)

Cuando actualices datos, vuelve a ejecutar solo estos archivos:

1. `data/queries/municipios_espana_dataset.sql` (solo si cambia base geografica)
2. `data/queries/slugs_seo_municipios_espana_dataset.sql`
3. `data/queries/radiacion_solar_provincial_dataset.sql`
4. `data/queries/tarifas_electricas_espana_dataset.sql`
5. `data/queries/subvenciones_solares_ccaa_dataset.sql`
6. `data/queries/bonificaciones_ibi_municipios_dataset.sql`
7. `data/queries/equipos_solares_comunes_dataset.sql`
8. `data/queries/compatibilidad_inversor_bateria_cargador_ev_dataset.sql`
9. `data/queries/estimaciones_ahorro_anual_dataset.sql`
10. `data/queries/municipios_energia_performance.sql` (reconstruye/actualiza tabla consolidada)
11. `data/queries/pseo_index.sql` (reconstruye indice de URLs)

## 3) Validacion rapida tras carga

```sql
select count(*) as municipios from public.municipios_dataset_es;
select count(*) as slugs_municipio from public.slugs_seo_municipios_espana_es;
select count(*) as radiacion_provincias from public.radiacion_solar_provincial_es;
select count(*) as tarifas from public.tarifas_electricas_espana_es;
select count(*) as subvenciones_ccaa from public.subvenciones_solares_ccaa_es;
select count(*) as ibi_municipios from public.bonificaciones_ibi_municipios_es;
select count(*) as equipos from public.equipos_solares_comunes_es;
select count(*) as compatibilidad from public.compatibilidad_inversor_bateria_cargador_ev_es;
select count(*) as estimaciones from public.estimaciones_ahorro_anual_es;
select count(*) as municipios_energia from public.municipios_energia;
select count(*) as pseo_urls from public.pseo_url_index;
```

## 4) Consulta de prueba final

```sql
select * from public.get_municipio_energia_by_slug('madrid');

select url, route_type, priority
from public.pseo_url_index
order by priority desc
limit 20;
```

## 5) Frecuencia recomendada

- Tarifas: semanal o quincenal.
- Subvenciones/IBI: semanal.
- Radiacion/equipos/compatibilidad: mensual.
- Reindexado pSEO (`pseo_index.sql`): despues de cada recarga.
