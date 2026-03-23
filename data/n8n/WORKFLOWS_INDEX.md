# n8n Workflows Index

Este archivo resume que hace cada JSON dentro de `data/n8n`.

## `n8nweb.json`
- Workflow maestro de ingesta y enriquecimiento de datos.
- Orquesta cron jobs de:
  - GEO mensual (municipios + coordenadas).
  - ESIOS diario (precios electricos).
  - Bonificaciones semanal.
  - Flujo manual para ejecucion bajo demanda.
- Usa `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ESIOS_API_TOKEN`, y variables de control (`DRY_RUN`, `STRICT_PROD`, `BATCH_SIZE`).
- Objetivo: poblar y mantener actualizadas las tablas fuente (`municipios_dataset_es`, `radiacion_solar_provincial_es`, bonificaciones, etc.).

## `pseo_solar_content_generator.n8n.json`
- Generador SEO centrado en `municipios_energia` + RPC `get_seo_generation_queue`.
- Toma una cola de municipios pendientes, genera contenido con OpenAI, valida JSON y longitud minima, y hace upsert en `seo_municipio_snapshot`.
- Incluye rama de logging de errores a `seo_generation_errors`.
- Objetivo: producir bloques SEO por municipio de forma incremental y segura.

## `pseo_solar_full_tables_writer.n8n.json`
- Generador SEO ampliado que consulta multiples tablas de Supabase antes de redactar:
  - `municipios_dataset_es`
  - `radiacion_solar_provincial_es`
  - `bonificaciones_ibi_municipios_es`
  - `subvenciones_solares_ccaa_es`
  - `tarifas_electricas_espana_es`
  - `equipos_solares_comunes_es`
  - `estimaciones_ahorro_anual_es`
  - `precios_instalacion_solar_provincial_es`
  - `compatibilidad_inversor_bateria_cargador_ev_es`
  - `pseo_slug_index`
  - `pseo_url_index`
- Arranca con `INIT - Env & Config` para normalizar y validar variables de entorno (incluye fallback `NEXT_PUBLIC_SUPABASE_URL` cuando falta `SUPABASE_URL`).
- Construye prompt rico en datos, genera JSON con bloques SEO, valida formato y guarda en `seo_municipio_snapshot`.
- Objetivo: maximizar diferenciacion de contenido (anti-duplicado) usando todas las fuentes disponibles.

## Variables de entorno comunes
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `AI_API_KEY` (misma variable usada en `n8nweb.json`)
- `AI_BASE_URL` (misma variable usada en `n8nweb.json`)
- `AI_MODEL` (opcional, por defecto `gpt-4o-mini`)

## Recomendacion de uso
- Usa `n8nweb.json` para mantener el dato maestro actualizado.
- Usa `pseo_solar_content_generator.n8n.json` para una version estable y ligera.
- Usa `pseo_solar_full_tables_writer.n8n.json` cuando quieras maxima riqueza de contenido y mayor Information Gain.
- Usa `pseo_drip_indexing.n8n.json` para la publicacion diaria y envio automatico a Google Indexing API.

## `pseo_drip_indexing.n8n.json`
- Cron diario a las 09:00. Lee `DRIP_BATCH_SIZE` slugs (default: 400) de `publish_queue` en estado `pending`.
- Para cada slug: actualiza `status = 'published'`, llama a la Google Indexing API (URL_UPDATED), y guarda la respuesta en `indexing_log`.
- Si la tasa de error supera el 10%, envia alerta por Telegram (`TELEGRAM_CHAT_ID`).
- Variables necesarias: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `GOOGLE_GSC_SITE_URL`, `DRIP_BATCH_SIZE`, `TELEGRAM_CHAT_ID`.

## Variables de entorno comunes
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `AI_API_KEY` (misma variable usada en `n8nweb.json`)
- `AI_BASE_URL` (misma variable usada en `n8nweb.json`)
- `AI_MODEL` (opcional, por defecto `gpt-4o-mini`)
- `DRIP_BATCH_SIZE` (default 400 URLs/día)
- `GOOGLE_GSC_SITE_URL` (URL canonica del sitio, ej: https://calculos-solares.es)
- `TELEGRAM_CHAT_ID` (para alertas de error)

