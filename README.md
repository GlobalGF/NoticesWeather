# Solar PSEO Spain (Next.js + Supabase + Vercel)

Arquitectura de referencia para Programmatic SEO sobre energia solar en Espana con escalado a 100k URLs.

## Stack

- Next.js App Router + TypeScript
- Supabase (Postgres)
- Vercel (ISR + On-Demand Revalidation)
- Zod para validacion de params

## Estructura

```txt
app/                        # Rutas y composicion de paginas
components/                 # UI y bloques de presentacion
modules/                    # Casos de uso por vertical SEO
data/                       # Repositorios y SQL
calculators/                # Logica energetica pura
lib/                        # Infra transversal (Supabase, SEO, cache)
scripts/                    # Mantenimiento y generacion de indices
```

## Rutas dinamicas pSEO

- `/placas-solares/[municipio]`
- `/placas-solares/geo/[comunidad]/[provincia]/[municipio]` (ruta jerarquica, redirige a canonica)
- `/bonificacion-ibi/[municipio]`
- `/baterias-solares/[tarifa]/[consumo]`
- `/autoconsumo-compartido/[municipio]`

## ISR y comportamiento tipo fallback blocking

En App Router no existe `fallback: "blocking"` literal. El equivalente aplicado es:

- `generateStaticParams` parcial (solo URLs hot)
- `dynamicParams = true` para resolver resto on-demand
- `revalidate = 86400` para ISR

Esto permite no preconstruir 100k paginas en build y delegar a generacion bajo demanda con cache.

Presupuestos de prebuild configurables por entorno (evitar builds enormes):

- `PSEO_PREBUILD_MUNICIPIOS`
- `PSEO_PREBUILD_MUNICIPIOS_GEO`
- `PSEO_PREBUILD_IBI`
- `PSEO_PREBUILD_AUTOCONSUMO`
- `PSEO_PREBUILD_TARIFFS`
- `PSEO_PREBUILD_CONSUMPTION_BANDS`

## Capa de datos y Supabase

- `data/repositories/*` concentra todo acceso a DB
- `lib/supabase/*` separa clientes browser/server/admin
- `app/api/revalidate` habilita invalidacion selectiva por tags/paths

Variables necesarias:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
REVALIDATE_SECRET=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
PSEO_LAUNCH_PHASE=phase1
```

## Plan de lanzamiento SEO (4 fases)

- Configuracion central en `lib/pseo/launch-phases.ts`.
- Playbook operativo en `docs/pseo-launch-playbook.md`.
- Reporte de fase activa: `npm run seo:phase-report`.
- Decision automatizada de escalado: `npm run seo:go-no-go`.
- El script `generate:pseo-index` limita automaticamente el volumen de URLs segun la fase activa.

Workflow recomendado semanal:

1. Cargar metricas observadas (`SEO_OBS_*`) en entorno.
2. Ejecutar `npm run seo:phase-report`.
3. Ejecutar `npm run seo:go-no-go`.
4. Escalar solo si resultado es `GO`.

Modo CSV (sin carga manual de env vars):

- Preparar CSV semanal con columnas: `indexed_rate`, `soft404_rate`, `organic_ctr`, `engaged_seconds`.
- Ejecutar: `npm run seo:go-no-go:csv -- --file docs/seo-metrics-weekly.example.csv`

## Slugs automaticos

- `lib/utils/slug.ts` contiene `slugify` para normalizacion consistente.
- `scripts/validate-slugs.ts` audita slugs invalidos o duplicados en `municipios_energia`.
- `scripts/generate-pseo-index.ts` genera/actualiza `pseo_url_index` para jobs de sitemap/revalidacion.

## Escalar a 100k paginas en Vercel

- Prebuild solo el 1-5% de URLs con mayor prioridad (`generateStaticParams`)
- Resolver long-tail on-demand (ISR)
- Usar `revalidateTag` por entidad (`municipality:slug`, etc.)
- Mantener un indice `pseo_url_index` en Supabase para priorizacion
- Dividir sitemap en multiples archivos cuando superes 50k URLs por sitemap

## Politica de cache pSEO (centralizada)

- TTLs centralizados en `lib/cache/policy.ts` para evitar valores hardcoded dispersos.
- Taxonomia de tags centralizada en `lib/cache/tags.ts` para revalidacion consistente por vertical.
- Refresh operativo en `app/api/sitemap/refresh` revalida tags globales y entidad por `changedSlug`.

Matriz TTL actual:

- Paginas base de municipio/slug/radiacion/normativa/compatibilidad: `21600` (6h)
- Subvenciones: `10800` (3h)
- IBI/autoconsumo/baterias: `86400` (24h)
- Sitemaps (`index` y chunks): `3600` con `stale-while-revalidate=86400`
- Repositorios de datos: alineados con la misma matriz por vertical

## Build rapido

- Evita fetch masivos en build
- Precalcula joins pesados en Supabase (views/materialized views)
- Usa scripts para generar indice pSEO fuera del build

## Modelos de datos SQL

- Dataset estructurado de municipios (seed): `data/queries/municipios_espana_dataset.sql`
- Dataset de radiacion solar por provincia: `data/queries/radiacion_solar_provincial_dataset.sql`
- Dataset de subvenciones solares por CCAA: `data/queries/subvenciones_solares_ccaa_dataset.sql`
- Dataset de bonificaciones IBI por municipio: `data/queries/bonificaciones_ibi_municipios_dataset.sql`
- Dataset dividido por partes (import masivo): `data/queries/municipios_parts/municipios_espana_dataset_part_*.sql`
- Esquema pSEO solar completo: `data/queries/pseo_solar_schema.sql`
- Extension de crecimiento (tablas clave + vistas canonicas): `data/queries/pseo_growth_extensions.sql`
- Snapshot materializado para paginas dinamicas: `data/queries/pseo_solar_snapshot.sql`
- Subvenciones publicas: `data/queries/public_subsidies.sql`
- Compatibilidad hardware solar/EV/baterias: `data/queries/hardware_compatibility.sql`
- Indice de slugs pSEO: `data/queries/pseo_slug_index.sql`
- Orden recomendado de ejecucion SQL: `data/queries/SQL_APPLY_ORDER.md`
- Playbook de automatizacion de datos: `docs/data-automation-playbook.md`

## Comandos

```bash
npm install
npm run dev
npm run build
npm run typecheck
npm run seo:phase-report
npm run seo:go-no-go
npm run seo:go-no-go:csv -- --file docs/seo-metrics-weekly.example.csv
npm run generate:municipios:parts
npm run validate:slugs
npm run sync:slugs
npm run generate:pseo-index
npm run generate:seo-slugs
```