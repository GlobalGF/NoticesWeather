-- ============================================================
-- PVPC Horario: precios hora a hora de la luz (España peninsular)
-- Run in Supabase → SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS pvpc_horario (
  id          BIGSERIAL    PRIMARY KEY,
  fecha       DATE         NOT NULL,
  hora        SMALLINT     NOT NULL CHECK (hora BETWEEN 0 AND 23),
  precio_kwh  NUMERIC(8,6) NOT NULL,   -- €/kWh (ej: 0.151190)
  es_barata   BOOLEAN      DEFAULT FALSE,
  percentil   SMALLINT,                -- 0-100, qué tan barata es vs el día
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  UNIQUE (fecha, hora)
);

-- Índices para consultas rápidas del widget
CREATE INDEX IF NOT EXISTS idx_pvpc_fecha      ON pvpc_horario (fecha DESC);
CREATE INDEX IF NOT EXISTS idx_pvpc_fecha_hora ON pvpc_horario (fecha, hora);

-- RLS: lectura pública (widget en web), escritura solo service_role
ALTER TABLE pvpc_horario ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pvpc_public_read" ON pvpc_horario;
CREATE POLICY "pvpc_public_read" ON pvpc_horario
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "pvpc_service_write" ON pvpc_horario;
CREATE POLICY "pvpc_service_write" ON pvpc_horario
  FOR ALL USING (auth.role() = 'service_role');

-- Vista útil: precio actual de la hora en curso
CREATE OR REPLACE VIEW pvpc_ahora AS
SELECT
  fecha,
  hora,
  precio_kwh,
  es_barata,
  percentil,
  CASE
    WHEN precio_kwh < 0.10 THEN 'muy_barata'
    WHEN precio_kwh < 0.15 THEN 'barata'
    WHEN precio_kwh < 0.20 THEN 'normal'
    WHEN precio_kwh < 0.28 THEN 'cara'
    ELSE 'muy_cara'
  END AS nivel
FROM pvpc_horario
WHERE fecha = CURRENT_DATE
  AND hora  = EXTRACT(HOUR FROM NOW() AT TIME ZONE 'Europe/Madrid')::SMALLINT
LIMIT 1;

GRANT SELECT ON pvpc_ahora TO anon, authenticated;

-- Verificación
SELECT 'Tabla pvpc_horario creada correctamente' AS resultado;
