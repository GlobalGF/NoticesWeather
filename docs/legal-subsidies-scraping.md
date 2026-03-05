# Legal Subsidies Scraping System

Automated pipeline to collect public solar subsidy records from BOE, provincial bulletins and autonomous community sources.

## Components

- `scripts/python/subsidies_scraper.py`: scraping + cleaning + Supabase upsert.
- `scripts/python/subsidies_sources.json`: configurable source list.
- `data/queries/public_subsidies.sql`: Supabase table schema.
- `.github/workflows/subsidies-weekly.yml`: weekly automation.

## Environment variables

- `SUPABASE_URL` (or `NEXT_PUBLIC_SUPABASE_URL`)
- `SUPABASE_SERVICE_ROLE_KEY`
- `SCRAPER_SOURCES_FILE` (default `scripts/python/subsidies_sources.json`)
- `SCRAPER_OUTPUT_FILE` (default `data/subsidies_latest.json`)

## Data cleaning applied

- Whitespace normalization in title and summary.
- Solar relevance filtering by keywords.
- Date parsing to ISO-8601 UTC.
- Amount extraction in EUR by regex.
- Deadline extraction from common legal text patterns.
- Record deduplication using SHA-256 `source_hash`.

## JSON structure

See `scripts/python/subsidies_record.example.json`.

## Weekly automation

GitHub Action runs every Monday at 05:00 UTC and can also run manually.

## Execution local

```bash
python -m pip install -r scripts/python/requirements.txt
python scripts/python/subsidies_scraper.py
```

## Legal note

Use only public sources that allow indexing or public consultation. Respect robots.txt, terms of use and rate limits for each bulletin website.
