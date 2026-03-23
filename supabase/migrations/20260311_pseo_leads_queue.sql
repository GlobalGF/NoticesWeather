-- ============================================================
-- PSEO Solar: New tables migration
-- Run this SQL in your Supabase SQL Editor (or via Supabase CLI).
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. LEADS TABLE
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS leads (
  id               BIGSERIAL    PRIMARY KEY,
  nombre           TEXT         NOT NULL CHECK (char_length(nombre) BETWEEN 2 AND 100),
  telefono         TEXT         NOT NULL CHECK (telefono ~ '^[6789][0-9]{8}$'),
  email            TEXT,
  tipo_vivienda    TEXT         CHECK (tipo_vivienda IN ('unifamiliar','piso','empresa')),
  consumo_kwh      NUMERIC,
  municipio_nombre TEXT,
  municipio_slug   TEXT,
  provincia        TEXT,
  estado           TEXT         NOT NULL DEFAULT 'nuevo'
                                CHECK (estado IN ('nuevo','contactado','vendido','descartado')),
  score            INTEGER      DEFAULT 0,         -- filled by n8n
  precio_venta_eur NUMERIC,                        -- when sold to installer
  utm_source       TEXT,
  utm_medium       TEXT,
  utm_campaign     TEXT,
  ip_hash          TEXT,                           -- SHA-256 of IP, NEVER raw IP
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS trg_leads_updated_at ON leads;
CREATE TRIGGER trg_leads_updated_at
  BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Index for deduplication query
CREATE INDEX IF NOT EXISTS idx_leads_telefono_created ON leads (telefono, created_at DESC);
-- Index for dashboard queries
CREATE INDEX IF NOT EXISTS idx_leads_estado           ON leads (estado);
CREATE INDEX IF NOT EXISTS idx_leads_municipio_slug   ON leads (municipio_slug);

-- RLS: only service_role can read/write leads
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "leads_service_only" ON leads;
CREATE POLICY "leads_service_only" ON leads
  FOR ALL USING (auth.role() = 'service_role');


-- ─────────────────────────────────────────────────────────────
-- 2. PUBLISH QUEUE TABLE (drip feeding)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS publish_queue (
  id             BIGSERIAL    PRIMARY KEY,
  slug           TEXT         NOT NULL UNIQUE,
  municipio      TEXT,
  provincia      TEXT,
  comunidad      TEXT,
  ruta_tipo      TEXT         DEFAULT 'placas-solares',  -- which page type
  priority_score INTEGER      DEFAULT 0,                 -- from municipios.seo_priority_score
  status         TEXT         NOT NULL DEFAULT 'pending'
                              CHECK (status IN ('pending','published','indexed','error')),
  sitemap_batch  TEXT,                                   -- e.g. 'sitemap-andalucia.xml'
  scheduled_for  TIMESTAMPTZ  DEFAULT NOW(),
  published_at   TIMESTAMPTZ,
  indexed_at     TIMESTAMPTZ,
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pq_status_scheduled  ON publish_queue (status, scheduled_for);
CREATE INDEX IF NOT EXISTS idx_pq_sitemap_batch      ON publish_queue (sitemap_batch);
CREATE INDEX IF NOT EXISTS idx_pq_comunidad_status   ON publish_queue (comunidad, status);

-- RLS: service_role only for writes, everyone can read (needed for sitemap generation)
ALTER TABLE publish_queue ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pq_public_read" ON publish_queue;
CREATE POLICY "pq_public_read" ON publish_queue
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "pq_service_write" ON publish_queue;
CREATE POLICY "pq_service_write" ON publish_queue
  FOR ALL USING (auth.role() = 'service_role');


-- ─────────────────────────────────────────────────────────────
-- 3. INDEXING LOG TABLE (Google Indexing API results)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS indexing_log (
  id              BIGSERIAL    PRIMARY KEY,
  url             TEXT         NOT NULL,
  status          TEXT         CHECK (status IN ('submitted','indexed','error','skipped')),
  http_status     INTEGER,
  google_response JSONB,
  queue_id        BIGINT       REFERENCES publish_queue (id) ON DELETE SET NULL,
  submitted_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_il_status      ON indexing_log (status);
CREATE INDEX IF NOT EXISTS idx_il_submitted   ON indexing_log (submitted_at DESC);

ALTER TABLE indexing_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "il_service_only" ON indexing_log;
CREATE POLICY "il_service_only" ON indexing_log
  FOR ALL USING (auth.role() = 'service_role');


-- ─────────────────────────────────────────────────────────────
-- 4. PAGE METRICS TABLE (GSC data, updated by n8n)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS page_metrics (
  id           BIGSERIAL  PRIMARY KEY,
  slug         TEXT       NOT NULL,
  date         DATE       NOT NULL,
  clicks       INTEGER    DEFAULT 0,
  impressions  INTEGER    DEFAULT 0,
  ctr          NUMERIC    DEFAULT 0,
  position     NUMERIC    DEFAULT 0,
  source       TEXT       DEFAULT 'gsc',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (slug, date, source)
);

CREATE INDEX IF NOT EXISTS idx_pm_slug_date ON page_metrics (slug, date DESC);
CREATE INDEX IF NOT EXISTS idx_pm_date      ON page_metrics (date DESC);

ALTER TABLE page_metrics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "pm_service_only" ON page_metrics;
CREATE POLICY "pm_service_only" ON page_metrics
  FOR ALL USING (auth.role() = 'service_role');


-- ─────────────────────────────────────────────────────────────
-- 5. Helper VIEW: dashboard summary
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW dashboard_summary AS
SELECT
  (SELECT count(*) FROM publish_queue WHERE status = 'pending')    AS pages_pending,
  (SELECT count(*) FROM publish_queue WHERE status = 'published')  AS pages_published,
  (SELECT count(*) FROM publish_queue WHERE status = 'indexed')    AS pages_indexed,
  (SELECT count(*) FROM leads WHERE created_at::date = CURRENT_DATE) AS leads_today,
  (SELECT count(*) FROM leads WHERE estado = 'nuevo')              AS leads_new,
  (SELECT count(*) FROM leads WHERE estado = 'vendido')            AS leads_sold,
  (SELECT count(*) FROM indexing_log WHERE status = 'error'
    AND submitted_at > NOW() - INTERVAL '24 hours')                AS indexing_errors_24h;

-- Grant service_role access to view
GRANT SELECT ON dashboard_summary TO service_role;
