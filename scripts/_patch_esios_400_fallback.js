const fs = require('fs');

const filePath = 'docs/n8nweb.json';
const wf = JSON.parse(fs.readFileSync(filePath, 'utf8'));
const node = wf.nodes.find((n) => (n.id || '').startsWith('6c0935ea'));
if (!node) throw new Error('ESIOS node not found');

node.parameters.jsCode = `// ESIOS - Upsert tarifas_electricas_espana_es + precios_electricidad_es
function getCtx() {
  const names = ['INIT – Env & Config', 'INIT - Env & Config', 'INIT â€” Env & Config'];
  for (const n of names) {
    try {
      const j = $(n).first().json;
      if (j && typeof j === 'object') return j;
    } catch (_) {}
  }
  return {};
}

const ctx = getCtx();
const item = $input.first();
if (!item) return [{ json: { ...ctx, stage: 'ESIOS_UPSERT_SKIP', count: 0 } }];
if (ctx.DRY_RUN) return [{ json: { ...ctx, stage: 'ESIOS_UPSERT_DRYRUN', count: 0 } }];

const httpRequest = this?.helpers?.httpRequest;
if (typeof httpRequest !== 'function') {
  throw new Error('this.helpers.httpRequest is not available in this Code node runtime');
}

const r = item.json.record || {};

async function postSupabase(pathWithQuery, payload) {
  return await httpRequest({
    method: 'POST',
    url: `${process.env.SUPABASE_URL}/rest/v1/${pathWithQuery}`,
    headers: {
      apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=minimal',
    },
    body: payload,
    json: true,
  });
}

async function postWithFallback(pathWithConflict, pathWithoutConflict, payload, label) {
  try {
    await postSupabase(pathWithConflict, payload);
    return { mode: 'upsert' };
  } catch (e) {
    const msg = String(e?.message || '');
    const is400 = msg.includes('status code 400') || msg.includes('HTTP 400');

    if (!is400) throw e;

    console.warn(JSON.stringify({
      stage: 'ESIOS_UPSERT_RETRY_NO_CONFLICT',
      label,
      reason: msg,
    }));

    await postSupabase(pathWithoutConflict, payload);
    return { mode: 'insert' };
  }
}

const tarifasPayload = [{
  compania: 'ESIOS',
  tarifa: 'PVPC 2.0TD',
  precio_kwh_dia: r.precio_kwh_media,
  precio_kwh_noche: r.precio_kwh_media,
  precio_kwh_valle: r.precio_kwh_media,
  tipo_tarifa: 'regulada-pvpc',
}];

const preciosPayload = [{
  fecha: r.fecha,
  tarifa_codigo: r.tarifa_codigo || 'pvpc_2_0td',
  precio_kwh_media: r.precio_kwh_media,
  precio_kwh_min: r.precio_kwh_min,
  precio_kwh_max: r.precio_kwh_max,
  fuente: r.fuente || 'esios',
  indicador_id: r.indicador_id || '1001',
}];

const t1 = await postWithFallback(
  'tarifas_electricas_espana_es?on_conflict=compania,tarifa',
  'tarifas_electricas_espana_es',
  tarifasPayload,
  'tarifas'
);

const t2 = await postWithFallback(
  'precios_electricidad_es?on_conflict=fecha,tarifa_codigo',
  'precios_electricidad_es',
  preciosPayload,
  'precios'
);

console.log(JSON.stringify({
  stage: 'ESIOS_UPSERT_DONE',
  fecha: r.fecha || null,
  tarifasMode: t1.mode,
  preciosMode: t2.mode,
}));

return [{
  json: {
    ...ctx,
    stage: 'ESIOS_UPSERT_DONE',
    count: 1,
    fecha: r.fecha || null,
    tarifasMode: t1.mode,
    preciosMode: t2.mode,
  },
}];`;

fs.writeFileSync(filePath, JSON.stringify(wf, null, 2), 'utf8');
console.log('Patched ESIOS upsert node with 400 fallback');
