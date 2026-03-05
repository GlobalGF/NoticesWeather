# Automatizacion Geografica + PVGIS (Quick Wins)

Objetivo:
- Cargar municipios/provincias de forma masiva desde un CSV abierto (INE/CNIG u otra fuente).
- Enriquecer radiacion con API PVGIS.
- Generar SQL listo para `municipios_dataset_es` y `radiacion_solar_provincial_es`.

## Requisitos

1. Instalar dependencias Python:

```bash
npm run subsidies:install
```

2. Tener una fuente CSV con al menos estas columnas (o equivalentes):
- `municipio`
- `provincia`
- `comunidad_autonoma`
- `poblacion`
- `latitud`
- `longitud`
- `codigo_postal` (opcional, usa `00000` si no existe)

## Ejecucion rapida (prueba)

```bash
npm run geo:pvgis:test -- --source-csv "https://TU_FUENTE_CSV_ABIERTA.csv"
```

## Ejecucion completa

```bash
npm run geo:pvgis:generate -- --source-csv "https://TU_FUENTE_CSV_ABIERTA.csv"
```

## Salidas generadas

- `data/queries/generated/municipios_espana_dataset.generated.sql`
- `data/queries/generated/radiacion_solar_provincial_dataset.generated.sql`
- `data/cache/pvgis_cache.json`

## Importacion en Supabase

1. Ejecuta:
- `data/queries/generated/municipios_espana_dataset.generated.sql`
- `data/queries/generated/radiacion_solar_provincial_dataset.generated.sql`

2. Recalcula tablas derivadas:
- `data/queries/municipios_energia_performance.sql`
- `data/queries/pseo_index.sql`

## Notas tecnicas

- El script usa cache por coordenada para no repetir llamadas a PVGIS.
- Incluye reintentos y pausa entre peticiones para evitar bloqueos.
- `irradiacion_kwh_m2` se estima como proxy desde produccion anual especifica (1kWp), suficiente para SEO/analitica inicial.
- Cuando tengas una fuente oficial de irradiacion directa, puedes sustituir solo ese campo sin rehacer la estructura.
