# Guía de Automatización (Sin n8n)

He migrado las tareas principales de n8n a scripts nativos de TypeScript. Esto permite ejecutar las tareas de mantenimiento y generación de contenido directamente desde la terminal o mediante Vercel Crons.

## Scripts de Mantenimiento

### 1. Generación de Contenido SEO (IA)
Reemplaza a `pSEO Solar Content Generator`. Procesa los municipios pendientes de la cola y genera bloques de texto únicos usando OpenAI.

**Comando:**
```bash
npx tsx scripts/generate-seo-openai.ts
```
> [!IMPORTANT]
> Requiere `OPENAI_API_KEY` o `AI_API_KEY` en el archivo `.env`.

### 2. Sincronización de Precios de Luz (PVPC)
Sincroniza los precios desde REE o `preciodelaluz.org`.

**Comando:**
```bash
npx tsx scripts/sync-pvpc-prices.ts
```

### 3. Sincronización de Bonificaciones IBI/ICIO
Descarga las últimas bonificaciones fiscales desde el repositorio de datos.

**Comando:**
```bash
npx tsx scripts/sync-bonificaciones.ts
```

## Tareas Programadas (Vercel Crons)

El proyecto está configurado para ejecutar automáticamente los siguientes endpoints (definidos en `vercel.json`):

| Endpoint | Frecuencia | Propósito |
|---|---|---|
| `/api/cron/publish-drip` | Diario (02:00) | Publica 400-500 páginas nuevas cada día. |
| `/api/cron/sync-pvpc` | Diario (21:15) | Obtiene los precios de la luz para hoy y mañana. |

## Variables de Entorno Requeridas

Para que estos scripts funcionen correctamente fuera de n8n, asegúrate de tener estas variables en tu `.env`:

```env
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...
AI_API_KEY=sk-proj-...
GOOGLE_INDEXING_SA_KEY='{"type":"service_account",...}'
```
