# Data Automation Playbook (INE/CNIG + PVGIS + IBI/ICIO + ESIOS + Compatibilidad)

Este playbook convierte tu enfoque en pipeline de datos para poblar tablas en horas, no dias.

## 1) Geografia + radiacion (Quick Win)

### 1.1 Generar SQL desde CSV abierto + PVGIS

```bash
npm run geo:pvgis:generate -- --source-csv "URL_O_RUTA_CSV"
```

Salida:
- `data/queries/generated/municipios_espana_dataset.generated.sql`
- `data/queries/generated/radiacion_solar_provincial_dataset.generated.sql`

### 1.2 Importar en Supabase

1. `data/queries/generated/municipios_espana_dataset.generated.sql`
2. `data/queries/generated/radiacion_solar_provincial_dataset.generated.sql`

## 2) IBI/ICIO automatizado

### 2.1 Extraccion IA (Gemini u otro) -> JSON estructurado

Usa esta estructura de salida:
- `scripts/python/ibi_icio_extractions.example.json`

Campos clave por item:
- `municipio`
- `provincia`
- `ibi_pct`
- `ibi_anos`
- `icio_pct`
- `icio_anos`
- `condiciones`
- `source_url`

### 2.2 Convertir JSON a SQL

```bash
npm run bonificaciones:generate:sql -- --input "scripts/python/ibi_icio_extractions.example.json"
```

Salida:
- `data/queries/generated/bonificaciones_ibi_icio.generated.sql`

### 2.3 Importar en Supabase

- `data/queries/generated/bonificaciones_ibi_icio.generated.sql`

## 3) Precios de electricidad desde ESIOS

### 3.1 Generar SQL historico/actual

```bash
npm run esios:generate:sql -- --token "TU_ESIOS_API_TOKEN" --start-date "2025-01-01" --end-date "2026-12-31"
```

Salida:
- `data/queries/generated/precios_electricidad_esios.generated.sql`

### 3.2 Importar en Supabase

- `data/queries/generated/precios_electricidad_esios.generated.sql`

## 4) Compatibilidad tecnica desde OCR/CSV

### 4.1 Preparar CSV de entrada

Plantilla:
- `scripts/python/compatibility_input.example.csv`

Columnas requeridas:
- `inversor`
- `bateria`
- `cargador_ev`
- `compatible`

### 4.2 Convertir CSV a SQL

```bash
npm run compatibilidad:generate:sql -- --input "scripts/python/compatibility_input.example.csv"
```

Salida:
- `data/queries/generated/compatibilidad_inversor_bateria_cargador_ev.generated.sql`

### 4.3 Importar en Supabase

- `data/queries/generated/compatibilidad_inversor_bateria_cargador_ev.generated.sql`

## 5) Recalcular tablas derivadas pSEO

Despues de cada ronda de importacion:

1. `data/queries/municipios_energia_performance.sql`
2. `data/queries/pseo_index.sql`
3. `npm run generate:pseo-index`
4. `npm run generate:seo-slugs`

## 6) Flujo semanal recomendado

1. Actualizar IBI/ICIO (JSON IA -> SQL -> import)
2. Actualizar ESIOS (SQL -> import)
3. Actualizar compatibilidad (CSV/OCR -> SQL -> import)
4. Recalcular derivados pSEO
5. Revisar conteos y cobertura

## 7) Validacion minima

```sql
select count(*) from public.municipios_dataset_es;
select count(*) from public.radiacion_solar_provincial_es;
select count(*) from public.bonificaciones_ibi_municipios_es;
select count(*) from public.municipios_energia;
select count(*) from public.pseo_url_index;
```
