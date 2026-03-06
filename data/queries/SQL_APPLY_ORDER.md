# Orden recomendado para aplicar SQL (Supabase)

Este orden evita errores de dependencias y te deja una base preparada para crecer.

## Fase 1: Base estructural (obligatoria)

1. `data/queries/pseo_solar_schema.sql`
2. `data/queries/pseo_growth_extensions.sql`

## Fase 2: Datos geograficos y slugs (obligatoria)

1. `data/queries/municipios_espana_dataset.sql`
2. `data/queries/slugs_seo_municipios_espana_dataset.sql`
3. `data/queries/radiacion_solar_provincial_dataset.sql`

## Fase 3: Datos de mercado y normativa (obligatoria para pSEO)

1. `data/queries/tarifas_electricas_espana_dataset.sql`
2. `data/queries/subvenciones_solares_ccaa_dataset.sql`
3. `data/queries/bonificaciones_ibi_municipios_dataset.sql`
4. `data/queries/precios_instalacion_solar_provincial_dataset.sql`

## Fase 4: Catalogo tecnico y simulaciones (recomendada)

1. `data/queries/equipos_solares_comunes_dataset.sql`
2. `data/queries/compatibilidad_inversor_bateria_cargador_ev_dataset.sql`
3. `data/queries/estimaciones_ahorro_anual_dataset.sql`

## Fase 5: Indices pSEO y rendimiento (recomendada)

1. `data/queries/pseo_slug_index.sql`
2. `data/queries/pseo_index.sql`
3. `data/queries/municipios_energia_performance.sql`
4. `data/queries/municipios_cercanos_function.sql`

## Fase 6: Opcional avanzado (solo si vas a modelo relacional profundo)

1. `data/queries/hardware_compatibility.sql`
2. `data/queries/public_subsidies.sql`

## Fase 7: Opcional por volumen

1. `data/queries/municipios_parts/municipios_espana_dataset_part_01.sql`
2. `data/queries/municipios_parts/municipios_espana_dataset_part_02.sql`
3. `data/queries/municipios_parts/municipios_espana_dataset_part_03.sql`
4. `data/queries/municipios_parts/municipios_espana_dataset_part_04.sql`

## Fase 8: Opcional automatizacion INE/CNIG + PVGIS

1. Genera SQL automatico con:
	- `npm run geo:pvgis:generate -- --source-csv "URL_O_RUTA_CSV"`
2. Ejecuta salidas generadas:
	- `data/queries/generated/municipios_espana_dataset.generated.sql`
	- `data/queries/generated/radiacion_solar_provincial_dataset.generated.sql`
3. Recalcula derivados:
	- `data/queries/municipios_energia_performance.sql`
	- `data/queries/pseo_index.sql`

## Fase 9: Opcional automatizacion normativa/precios/compatibilidad

1. Bonificaciones IBI/ICIO desde JSON IA:
	- `npm run bonificaciones:generate:sql -- --input "RUTA_JSON"`
	- Ejecutar: `data/queries/generated/bonificaciones_ibi_icio.generated.sql`
2. Precios historicos ESIOS:
	- `npm run esios:generate:sql -- --token "TU_TOKEN" --start-date "YYYY-MM-DD" --end-date "YYYY-MM-DD"`
	- Ejecutar: `data/queries/generated/precios_electricidad_esios.generated.sql`
3. Compatibilidad desde CSV/OCR:
	- `npm run compatibilidad:generate:sql -- --input "RUTA_CSV"`
	- Ejecutar: `data/queries/generated/compatibilidad_inversor_bateria_cargador_ev.generated.sql`
4. Recalcular derivados pSEO:
	- `data/queries/municipios_energia_performance.sql`
	- `data/queries/pseo_index.sql`

Notas:
- Usa la Fase 7 solo si prefieres importar municipios por bloques en vez de `municipios_espana_dataset.sql`.
- Puedes ejecutar de nuevo los archivos de dataset porque usan `on conflict` en la mayoria de casos.
- Si ya aplicaste `hardware_compatibility.sql`, no hace falta borrar nada: simplemente decide si tu app consultara la tabla simple o el modelo avanzado.
- Documentacion de automatizacion: `docs/geo-pvgis-automation.md`.
