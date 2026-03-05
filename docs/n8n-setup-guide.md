# n8n ETL Pipeline – Setup Guide

## Archivos generados
| Archivo | Descripción |
|---|---|
| `docs/n8n-workflow.json` | Workflow n8n importable (este archivo) |
| `data/queries/n8n_etl_rpc_support.sql` | RPCs Postgres requeridas por el workflow |

---

## Paso 1 – Requisitos previos en Supabase

Antes de importar el workflow, ejecuta en el **SQL Editor de Supabase**:

```sql
-- 1. Todas las migraciones del proyecto (SQL_APPLY_ORDER.md)
-- 2. Las RPCs de soporte:
```

Abre `data/queries/n8n_etl_rpc_support.sql` y ejecútalo completo en Supabase.  
Esto crea:
- `precios_electricidad_es` (tabla plana de precios ESIOS)
- `rebuild_municipios_energia()` — RPC llamada por el nodo REBUILD
- `rebuild_pseo_url_index()` — RPC llamada por el nodo REBUILD
- `rebuild_pseo_slug_index()` — RPC llamada por el nodo REBUILD

---

## Paso 2 – Credenciales en n8n

Ve a **Settings → Credentials** en n8n y crea:

| Nombre sugerido | Tipo | Valor |
|---|---|---|
| `Supabase Service Role` | HTTP Header Auth | Header: `Authorization`, Value: `Bearer <SERVICE_ROLE_KEY>` |

No se necesitan credenciales adicionales para PVGIS (API pública gratuita) ni para el CSV de INE/CNIG.  
Para ESIOS, el token se pasa como variable de entorno (ver Paso 3).

---

## Paso 3 – Variables de entorno en n8n

En tu instancia n8n (`.env` si self-hosted, o Settings > Variables si cloud), añade:

```env
# Obligatorias
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Fuente geográfica (CSV de municipios con columnas: municipio, provincia, lat, lon)
GEO_SOURCE_CSV_URL=https://raw.githubusercontent.com/inigoflores/ds-codigos-postales-ine-es/master/data/codigos_postales.csv

# ESIOS – Red Eléctrica (solicitar token en: https://api.esios.ree.es/token)
ESIOS_API_TOKEN=
ESIOS_INDICATOR_ID=10391

# IBI/ICIO – URL a un JSON público o endpoint interno
# Formato: { "items": [ { "municipio": "...", "provincia": "...", "ibi_pct": 50, "ibi_anos": 5 } ] }
IBI_ICIO_JSON_URL=

# Compatibilidad técnica – URL a un CSV público
# Columnas requeridas: inversor, bateria, cargador_ev, compatible
COMPATIBILIDAD_CSV_URL=

# PVGIS base URL (no cambiar salvo mirror propio)
PVGIS_BASE_URL=https://re.jrc.ec.europa.eu/api/v5_2

# Control de ejecución
BATCH_SIZE=50
DRY_RUN=false
```

---

## Paso 4 – Importar el workflow en n8n

1. Abre n8n (`http://localhost:5678` o tu URL cloud).
2. Click en **Workflows → Import from File**.
3. Selecciona `docs/n8n-workflow.json`.
4. El workflow se importa con todos sus nodos y conexiones.

---

## Paso 5 – Verificar los nodos de Supabase

El workflow usa el nodo **HTTP Request** (no el nodo nativo de Supabase) para mayor control.  
Los headers `apikey` y `Authorization` se construyen dinámicamente desde `$env['SUPABASE_SERVICE_ROLE_KEY']`.  
**No necesitas configurar el nodo Supabase nativo** — todo va por REST API directamente.

---

## Paso 6 – Primera ejecución en modo DRY RUN

Antes de escribir en la base de datos, verifica que los parsers funcionan:

1. Establece `DRY_RUN=true` en n8n variables.
2. Abre el workflow → click **Execute Workflow** (manual trigger).
3. Revisa los logs de cada nodo Code (`DRY-RUN` aparecerá en todos los UPSERT nodes).
4. Verifica que GEO-PARSE devuelve municipios con slugs correctos.
5. Verifica que PVGIS-PARSE devuelve valores de radiación razonables (1200–1900 kWh/kWp/año).

---

## Paso 7 – Primera ejecución real

1. Establece `DRY_RUN=false`.
2. Ejecuta manualmente (botón **Execute Workflow**).
3. El flujo corre en este orden:
   - GEO → PVGIS → IBI → COMPAT → ESIOS (en paralelo desde Init Context)
   - Todos convergen en REBUILD → municipios_energia → pseo_url_index → pseo_slug_index
   - FINAL genera el reporte de stats
4. Tiempo estimado primera carga (~8.000 municipios): **45-90 minutos** (limitado por PVGIS 1 req/1.2s para ~50 provincias = ~1 min; el CSV principal es rápido).

---

## Paso 8 – Activar schedulers

1. En n8n, activa el workflow (toggle **Active** en la esquina superior derecha).
2. Los 4 schedulers se activarán automáticamente:
   - **Mensual (día 1 a las 3:00)** → GEO + PVGIS
   - **Diario (04:00)** → ESIOS precios
   - **Lunes (05:00)** → IBI/ICIO bonificaciones
   - **Lunes (06:00)** → Compatibilidad técnica

---

## Paso 9 – Conectar alertas

El nodo **ALERT – Format Dead-Letter Message** y **GLOBAL ERROR – Format Alert** tienen el mensaje formateado listo.  
Añade después de cada uno el nodo de notificación que uses:

```
Slack  → n8n-nodes-base.slack    → campo "text": {{ $json.message }}
Telegram → n8n-nodes-base.telegram → campo "text": {{ $json.message }}
Email  → n8n-nodes-base.emailSend → body: {{ $json.message }}
```

---

## Paso 10 – Validación post-primera carga

Ejecuta en Supabase SQL Editor:

```sql
-- Conteos clave
select 'municipios_dataset_es'   as tabla, count(*) from municipios_dataset_es
union all
select 'radiacion_solar_provincial_es', count(*) from radiacion_solar_provincial_es
union all
select 'municipios_energia',           count(*) from municipios_energia
union all
select 'pseo_url_index',               count(*) from pseo_url_index
union all
select 'pseo_slug_index',              count(*) from pseo_slug_index
union all
select 'precios_electricidad_es',      count(*) from precios_electricidad_es
union all
select 'bonificaciones_ibi_municipios_es', count(*) from bonificaciones_ibi_municipios_es
union all
select 'compatibilidad_inversor_bateria_cargador_ev_es', count(*) from compatibilidad_inversor_bateria_cargador_ev_es;

-- Test municipio concreto
select municipio, provincia, horas_sol_anuales, irradiacion_kwh_m2,
       precio_kwh_actual, ahorro_anual_estimado_eur, subvencion_disponible
from municipios_energia
where slug = 'madrid'
limit 1;

-- Test URL index
select url, slug, municipio, provincia
from pseo_url_index
where url like '/placas-solares/bar%'
limit 5;

-- Calidad: municipios sin radiación (deberían ser 0 si PVGIS corrió bien)
select count(*) as sin_radiacion
from municipios_energia
where horas_sol_anuales = 1800; -- 1800 = valor por defecto (sin PVGIS)

-- Precios recientes
select fecha, tarifa_codigo, precio_kwh_media
from precios_electricidad_es
order by fecha desc
limit 7;
```

---

## Observabilidad – Métricas clave

| Métrica | Query | Alerta si... |
|---|---|---|
| Municipios totales | `count(*) from municipios_dataset_es` | < 7.000 |
| Cobertura PVGIS | `count(*) from radiacion_solar_provincial_es` | < 40 |
| Cobertura pSEO | `count(*) from pseo_url_index` | < 7.000 |
| Precio actualizado | `max(fecha) from precios_electricidad_es` | > 2 días de antigüedad |
| Dead letters | Nodo FINAL → `deadLetterCount` | > 0 |
| Duración pipeline | Nodo FINAL → `durationMs` | > 7.200.000 ms (2h) |

---

## Subflujos independientes (ejecución manual)

Para ejecutar solo un subflujo:

1. Abre el workflow en n8n.
2. Haz click derecho en el nodo trigger correspondiente.
3. Selecciona **Execute Node**.

O bien desconecta temporalmente las ramas que no quieres ejecutar usando el toggle de conexión.

---

## Notas sobre fuentes de datos

| Fuente | URL | Formato | Auth |
|---|---|---|---|
| INE/CNIG municipios | [inigoflores mirror](https://raw.githubusercontent.com/inigoflores/ds-codigos-postales-ine-es/master/data/codigos_postales.csv) | CSV `;` delimitado | No |
| PVGIS | `https://re.jrc.ec.europa.eu/api/v5_2/PVcalc` | JSON | No (gratis) |
| ESIOS PVPC | `https://api.esios.ree.es/indicators/10391` | JSON | `x-api-key` header |
| IBI/ICIO | Tu URL / JSON generado por IA | JSON `{ items: [] }` | Configurable |
| Compatibilidad | Tu URL / CSV OCR | CSV con 4 columnas | Configurable |

---

## Estructura de nodos del workflow

```
[Schedulers x4] ──┐
[Start (manual)] ──┤
                   ▼
             [Init Context]
                   │
        ┌──────────┼──────────┬──────────┬──────────┐
        ▼          ▼          ▼          ▼          ▼
   [GEO Flow]  [PVGIS Flow] [ESIOS] [IBI Flow] [COMPAT]
        │          │          │          │          │
        └──────────┴──────────┴──────────┴──────────┘
                             │
                    [REBUILD municipios_energia]
                             │
                    [REBUILD pseo_url_index]
                             │
                    [REBUILD pseo_slug_index]
                             │
                    [FINAL – Stats Report]
                             │
                    [Has Dead Letters?]
                    /                  \
          [ALERT node]           [SUCCESS log]

[Error Trigger] → [GLOBAL ERROR – Format Alert]
```
