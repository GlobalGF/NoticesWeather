// n8n Code node (Run once for all items)
// Analizador OMIE: adquisicion, limpieza, metricas, comparacion, patrones, prediccion opcional.
// Fuente esperada: CSV/JSON de precios horarios del mercado diario OMIE.

const input = $input.first()?.json || {};

function toNumber(value) {
  if (value === null || value === undefined) return null;
  const normalized = String(value).trim().replace(',', '.');
  const n = Number(normalized);
  return Number.isFinite(n) ? n : null;
}

function toDate(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isFinite(d.getTime()) ? d : null;
}

function parseCsvLine(line, sep) {
  const out = [];
  let curr = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const c = line[i];

    if (c === '"') {
      if (inQuotes && line[i + 1] === '"') {
        curr += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (c === sep && !inQuotes) {
      out.push(curr.trim());
      curr = '';
      continue;
    }

    curr += c;
  }

  out.push(curr.trim());
  return out;
}

function detectSeparator(headerLine) {
  const options = [';', ',', '\t', '|'];
  let best = ';';
  let score = -1;
  for (const sep of options) {
    const count = headerLine.split(sep).length;
    if (count > score) {
      score = count;
      best = sep;
    }
  }
  return best;
}

function normalizeKey(k) {
  return String(k || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function parseCsv(raw) {
  const lines = String(raw || '').split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  const sep = detectSeparator(lines[0]);
  const headers = parseCsvLine(lines[0], sep).map(normalizeKey);

  return lines.slice(1).map((line) => {
    const cells = parseCsvLine(line, sep);
    const row = {};
    for (let i = 0; i < headers.length; i++) {
      row[headers[i]] = cells[i] ?? '';
    }
    return row;
  });
}

function extractRows(objOrArray) {
  if (Array.isArray(objOrArray)) return objOrArray;
  if (!objOrArray || typeof objOrArray !== 'object') return [];

  const candidates = [
    objOrArray.data,
    objOrArray.rows,
    objOrArray.values,
    objOrArray.result,
    objOrArray.registros,
    objOrArray.prices,
  ];

  for (const c of candidates) {
    if (Array.isArray(c)) return c;
  }

  return [];
}

function mapRecord(rawRow) {
  const r = {};
  for (const [k, v] of Object.entries(rawRow || {})) {
    r[normalizeKey(k)] = v;
  }

  // Campos habituales OMIE o equivalentes
  const hour =
    toNumber(r.hora) ??
    toNumber(r.hour) ??
    toNumber(r.periodo) ??
    toNumber(r.period) ??
    null;

  const priceEurMwh =
    toNumber(r.precio_eur_mwh) ??
    toNumber(r.precio) ??
    toNumber(r.price_eur_mwh) ??
    toNumber(r.price) ??
    toNumber(r.value) ??
    null;

  const dateRaw =
    r.fecha ||
    r.date ||
    r.dia ||
    r.datetime ||
    r.fecha_hora ||
    null;

  let dt = toDate(dateRaw);
  if (!dt && dateRaw && hour !== null) {
    // Caso fecha sin hora: construimos hora local aproximada
    dt = toDate(`${String(dateRaw).slice(0, 10)}T${String(Math.max(0, hour - 1)).padStart(2, '0')}:00:00`);
  }

  return {
    datetime: dt,
    hour: hour,
    price_eur_mwh: priceEurMwh,
    source_raw: rawRow,
  };
}

function cleanRecords(records) {
  const cleaned = [];
  const dropped = [];

  for (const rec of records) {
    const mapped = mapRecord(rec);
    const valid = mapped.datetime && mapped.price_eur_mwh !== null;

    if (!valid) {
      dropped.push({ reason: 'incomplete_or_invalid', raw: rec });
      continue;
    }

    cleaned.push(mapped);
  }

  cleaned.sort((a, b) => a.datetime - b.datetime);
  return { cleaned, dropped };
}

function stdDev(values, mean) {
  if (!values.length) return null;
  const variance = values.reduce((acc, x) => acc + (x - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

function calcMetrics(records) {
  if (!records.length) return null;

  const prices = records.map((r) => r.price_eur_mwh);
  const mean = prices.reduce((a, b) => a + b, 0) / prices.length;
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const sd = stdDev(prices, mean);

  const minRec = records.find((r) => r.price_eur_mwh === min);
  const maxRec = records.find((r) => r.price_eur_mwh === max);

  return {
    sample_count: records.length,
    precio_max_eur_mwh: max,
    precio_min_eur_mwh: min,
    precio_medio_eur_mwh: mean,
    desviacion_estandar_eur_mwh: sd,
    hora_precio_max: maxRec?.datetime?.toISOString() || null,
    hora_precio_min: minRec?.datetime?.toISOString() || null,
  };
}

function detectPatterns(records, metrics) {
  if (!records.length || !metrics) return [];

  const insights = [];
  const prices = records.map((r) => r.price_eur_mwh);

  const first = prices[0];
  const last = prices[prices.length - 1];
  if (last > first * 1.03) insights.push('Tendencia alcista en el periodo analizado.');
  else if (last < first * 0.97) insights.push('Tendencia bajista en el periodo analizado.');
  else insights.push('Tendencia lateral sin cambio relevante.');

  const cv = metrics.desviacion_estandar_eur_mwh / (metrics.precio_medio_eur_mwh || 1);
  if (cv > 0.25) insights.push('Volatilidad alta (coeficiente de variacion > 25%).');
  else if (cv > 0.12) insights.push('Volatilidad media.');
  else insights.push('Volatilidad baja.');

  const thresholdHigh = metrics.precio_medio_eur_mwh + 2 * metrics.desviacion_estandar_eur_mwh;
  const thresholdLow = metrics.precio_medio_eur_mwh - 2 * metrics.desviacion_estandar_eur_mwh;
  const spikes = records.filter((r) => r.price_eur_mwh > thresholdHigh || r.price_eur_mwh < thresholdLow);
  if (spikes.length) {
    insights.push(`Detectados ${spikes.length} picos anomales (regla +/- 2 sigma).`);
  } else {
    insights.push('No se detectan picos anomales con la regla +/- 2 sigma.');
  }

  const hourStats = {};
  for (const r of records) {
    const h = r.datetime.getHours();
    if (!hourStats[h]) hourStats[h] = [];
    hourStats[h].push(r.price_eur_mwh);
  }

  const avgByHour = Object.entries(hourStats).map(([h, vals]) => ({
    hour: Number(h),
    avg: vals.reduce((a, b) => a + b, 0) / vals.length,
  }));

  avgByHour.sort((a, b) => b.avg - a.avg);
  if (avgByHour.length >= 2) {
    insights.push(`Hora tipicamente mas cara: ${String(avgByHour[0].hour).padStart(2, '0')}:00.`);
    insights.push(`Hora tipicamente mas barata: ${String(avgByHour[avgByHour.length - 1].hour).padStart(2, '0')}:00.`);
  }

  return insights;
}

function comparePeriods(current, previous) {
  const currentM = calcMetrics(current);
  const previousM = calcMetrics(previous);

  if (!currentM || !previousM) return null;

  const base = previousM.precio_medio_eur_mwh;
  const deltaPct = base ? ((currentM.precio_medio_eur_mwh - base) / base) * 100 : null;

  return {
    periodo_actual_media_eur_mwh: currentM.precio_medio_eur_mwh,
    periodo_anterior_media_eur_mwh: previousM.precio_medio_eur_mwh,
    variacion_porcentual_media: deltaPct,
  };
}

function simpleForecast(records, horizonHours) {
  if (!records.length || horizonHours <= 0) return [];

  // Tendencia lineal simple sobre indice temporal
  const y = records.map((r) => r.price_eur_mwh);
  const n = y.length;
  const xMean = (n - 1) / 2;
  const yMean = y.reduce((a, b) => a + b, 0) / n;

  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += (i - xMean) * (y[i] - yMean);
    den += (i - xMean) * (i - xMean);
  }

  const slope = den ? num / den : 0;
  const intercept = yMean - slope * xMean;
  const lastDate = records[records.length - 1].datetime;

  const forecast = [];
  for (let k = 1; k <= horizonHours; k++) {
    const idx = n - 1 + k;
    const pred = Math.max(0, intercept + slope * idx);
    const dt = new Date(lastDate.getTime() + k * 3600 * 1000);
    forecast.push({
      datetime: dt.toISOString(),
      precio_estimado_eur_mwh: pred,
      aviso: 'Estimacion aproximada basada en tendencia historica simple.',
    });
  }
  return forecast;
}

async function acquireRaw() {
  // 1) Si llega payload parseado, usarlo.
  if (Array.isArray(input.records)) return input.records;
  if (input.payload && typeof input.payload === 'object') {
    const rows = extractRows(input.payload);
    if (rows.length) return rows;
  }

  // 2) Si llega raw text/csv/json desde nodo HTTP previo.
  const raw = input.data || input.body || null;
  if (typeof raw === 'string' && raw.trim()) {
    try {
      const parsed = JSON.parse(raw);
      const rows = extractRows(parsed);
      if (rows.length) return rows;
      if (Array.isArray(parsed)) return parsed;
    } catch (_) {
      return parseCsv(raw);
    }
  }

  // 3) Si se pasa URL, descargar.
  if (input.omie_url && /^https?:\/\//i.test(String(input.omie_url))) {
    const textResp = await $helpers.httpRequest({
      method: 'GET',
      url: String(input.omie_url),
      timeout: 30000,
    });

    const asText = typeof textResp === 'string' ? textResp : JSON.stringify(textResp);
    try {
      const parsed = JSON.parse(asText);
      const rows = extractRows(parsed);
      if (rows.length) return rows;
      if (Array.isArray(parsed)) return parsed;
    } catch (_) {
      return parseCsv(asText);
    }
  }

  return [];
}

const sourceLabel = input.source_label || 'OMIE - Mercado diario';
const compareEnabled = !!input.compare_previous_period;
const predictEnabled = !!input.predict;
const forecastHours = Number.isFinite(Number(input.forecast_horizon_hours))
  ? Math.max(1, Number(input.forecast_horizon_hours))
  : 24;

const rawRows = await acquireRaw();
if (!rawRows.length) {
  return [{
    json: {
      status: 'NEED_MORE_DATA',
      source: sourceLabel,
      message: 'No hay registros suficientes para analizar. Se requieren datos horarios reales de OMIE.',
    },
  }];
}

const { cleaned, dropped } = cleanRecords(rawRows);
if (!cleaned.length) {
  return [{
    json: {
      status: 'NO_VALID_ROWS',
      source: sourceLabel,
      message: 'Todos los registros fueron descartados por datos incompletos o inconsistentes.',
      dropped_count: dropped.length,
    },
  }];
}

const currentMetrics = calcMetrics(cleaned);
const patterns = detectPatterns(cleaned, currentMetrics);

let comparison = null;
if (compareEnabled) {
  const n = cleaned.length;
  const half = Math.floor(n / 2);
  if (half >= 12) {
    const prev = cleaned.slice(0, half);
    const curr = cleaned.slice(half);
    comparison = comparePeriods(curr, prev);
  } else {
    comparison = {
      warning: 'No hay suficientes datos para comparar con un periodo anterior equivalente.'
    };
  }
}

let forecast = [];
if (predictEnabled) {
  forecast = simpleForecast(cleaned, forecastHours);
}

const chartSuggestions = [
  'Linea: precio horario vs tiempo',
  'Histograma: distribucion de precios',
  'Comparativa: dia actual vs dia anterior (media/min/max)'
];

return [{
  json: {
    status: 'OK',
    source: sourceLabel,
    compliance_note: 'Analisis basado en datos reales de OMIE proporcionados en la entrada.',
    cleaned_rows: cleaned.length,
    dropped_rows: dropped.length,
    metrics: currentMetrics,
    comparison,
    patterns,
    forecast,
    chart_suggestions: chartSuggestions,
    table_summary: [
      {
        metrica: 'Precio maximo (EUR/MWh)',
        valor: currentMetrics.precio_max_eur_mwh,
      },
      {
        metrica: 'Precio minimo (EUR/MWh)',
        valor: currentMetrics.precio_min_eur_mwh,
      },
      {
        metrica: 'Precio medio (EUR/MWh)',
        valor: currentMetrics.precio_medio_eur_mwh,
      },
      {
        metrica: 'Desviacion estandar (EUR/MWh)',
        valor: currentMetrics.desviacion_estandar_eur_mwh,
      },
      {
        metrica: 'Hora precio maximo',
        valor: currentMetrics.hora_precio_max,
      },
      {
        metrica: 'Hora precio minimo',
        valor: currentMetrics.hora_precio_min,
      },
    ],
  },
}];
