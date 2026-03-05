# pSEO Slug Generation System

Automatic SEO slug generation based on:

- municipio
- tarifa electrica
- consumo
- provincia
- tecnologia solar

## Components

- `lib/seo/slug-generator.ts`: core slug engine.
- `scripts/generate-seo-slugs.ts`: bulk generation + Supabase upsert.
- `data/queries/pseo_slug_index.sql`: storage table.

## SEO logic

1. Normalize and slugify all inputs.
2. Remove low-value stopwords (`de`, `la`, `del`, etc.).
3. Keep deterministic field order:
   - tecnologia -> municipio -> provincia -> tarifa -> consumo
4. Trim slug length to avoid oversized URLs.

## Duplicate prevention

1. Build base slug from canonical field order.
2. Check in-memory set for collisions.
3. On collision, append stable short hash derived from raw source values.
4. If collision persists, append incremental suffix (`-2`, `-3`, ...).

This keeps slugs SEO-readable while guaranteeing uniqueness.

## Run

```bash
npm run generate:seo-slugs
```

## Example

Input:

- municipio: `Alcala de Henares`
- provincia: `Madrid`
- tarifa: `2-0td`
- consumo: `4000-5500kwh`
- tecnologia: `placas-solares`

Output slug:

`placas-solares-alcala-henares-madrid-2-0td-4000-5500kwh`
