# Plan de lanzamiento pSEO (1k -> 100k)

Este playbook define el ritmo de escalado y los gates de calidad para crecer sin activar filtros algorítmicos por thin content, duplicidad o crawl waste.

## Fase 1 (1,000 URLs)

- Ritmo recomendado: 250-400 URLs nuevas/semana.
- Objetivo: validar indexabilidad y engagement en clusters prioritarios.
- Señales de calidad:
  - Datos locales completos (irradiacion, precio luz, ayudas).
  - Contenido con variaciones semanticas reales por municipio.
  - Enlazado interno de apoyo por entidad local.
- Gates para pasar de fase:
  - Indexed rate >= 65%.
  - Soft 404 <= 3%.
  - CTR organico >= 2.5%.
  - Engaged time >= 45s.

## Fase 2 (5,000 URLs)

- Ritmo recomendado: 800-1,200 URLs nuevas/semana.
- Objetivo: escalar a nuevos clusters geografico-tematicos.
- Señales de calidad:
  - Fuentes y metodologia visibles (E-E-A-T).
  - Cobertura de ayudas/bonificaciones locales.
  - Plantillas con bloques dinamicos por provincia/comunidad.
- Gates para pasar de fase:
  - Indexed rate >= 72%.
  - Soft 404 <= 2.5%.
  - CTR organico >= 2.7%.
  - Engaged time >= 50s.

## Fase 3 (20,000 URLs)

- Ritmo recomendado: 2,000-3,000 URLs nuevas/semana.
- Objetivo: consolidar cobertura semantica completa.
- Señales de calidad:
  - Cluster completo por intentos (placas, IBI, autoconsumo, baterias).
  - Refresh de contenido y revalidacion selectiva por tags.
  - Poda de URLs con bajo valor SEO tras ventana de observacion.
- Gates para pasar de fase:
  - Indexed rate >= 78%.
  - Soft 404 <= 2%.
  - CTR organico >= 3%.
  - Engaged time >= 55s.

## Fase 4 (100,000 URLs)

- Ritmo recomendado: 5,000-8,000 URLs nuevas/semana.
- Objetivo: escalar con control de calidad continuo.
- Señales de calidad:
  - Quality score minimo mas alto para publicar.
  - Reindexado/revalidado de URLs top.
  - Revision mensual de canibalizacion y thin content.
- Metricas de control:
  - Indexed rate >= 80%.
  - Soft 404 <= 2%.
  - CTR organico >= 3%.
  - Engaged time >= 60s.

## Operativa semanal

1. Lunes: revisar GSC (coverage, CTR, query mix) y decidir ritmo semanal.
2. Miercoles: lanzar lote de URLs de la fase activa (sitemap chunk + revalidation).
3. Viernes: auditar engagement, errores, soft 404 y decidir acelerar/mantener/pausar.

## Workflow ejecutable (go/no-go)

1. Cargar metricas observadas de la semana en variables `SEO_OBS_*`.
2. Ejecutar `npm run seo:phase-report` para validar objetivo de la fase.
3. Ejecutar `npm run seo:go-no-go` para decidir escalado.
4. Si resultado es `GO`, aumentar volumen semanal dentro del rango de la fase.
5. Si resultado es `HOLD` o `NO-GO`, no escalar y abrir plan de correccion.

Alternativa automatizada por CSV:

1. Exportar/actualizar CSV semanal con columnas `indexed_rate`, `soft404_rate`, `organic_ctr`, `engaged_seconds`.
2. Ejecutar `npm run seo:go-no-go:csv -- --file ruta/al/archivo.csv`.
3. El script usa la ultima fila del CSV como observacion semanal.

Interpretacion de resultado:

- `GO`: cumple gates y no hay alertas.
- `HOLD`: no escala por alertas activas (riesgo de degradacion).
- `NO-GO`: no cumple gates minimos de fase.

## Politica de alertas

- Alertas tempranas para evitar publicar mas URLs con calidad de indexacion inestable.
- Si se activa 1 alerta: congelar expansion durante 1 ciclo semanal.
- Si se activan 2+ alertas: reducir publicacion al 50% del minimo semanal de fase.
- Si se activan durante 2 semanas seguidas: pausar nuevas cohorts y ejecutar poda/correccion.

Checklist de respuesta a alertas:

1. Revisar cobertura por tipo de URL (no indexada, rastreada no indexada, soft 404).
2. Revisar canibalizacion por cluster y consolidar URLs similares.
3. Reforzar bloques de valor diferencial (datos locales, FAQ especifica, metodologia).
4. Revalidar sitemap y enlazado interno para cohort afectada.
5. Re-evaluar con `npm run seo:go-no-go` al cierre del ciclo.

## Variables de entorno

- `PSEO_LAUNCH_PHASE=phase1|phase2|phase3|phase4`
- `PSEO_PREBUILD_MUNICIPIOS`, `PSEO_PREBUILD_IBI`, etc. (limites de static params)
- `SEO_OBS_INDEXED_RATE`, `SEO_OBS_SOFT404_RATE`, `SEO_OBS_ORGANIC_CTR`, `SEO_OBS_ENGAGED_SECONDS`
- `SEO_METRICS_CSV_PATH` (opcional para `seo:go-no-go:csv`)
- `SEO_ALERT_MIN_INDEXED_RATE`, `SEO_ALERT_SOFT404_RATE`, `SEO_ALERT_MIN_ORGANIC_CTR`, `SEO_ALERT_MIN_ENGAGED_SECONDS`

## Comandos utiles

- `npm run seo:phase-report`
- `npm run seo:go-no-go`
- `npm run seo:go-no-go:csv -- --file docs/seo-metrics-weekly.example.csv`
- `npm run generate:pseo-index`
- `npm run validate:slugs`
- `npm run sync:slugs`
