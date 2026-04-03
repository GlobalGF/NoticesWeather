/**
 * sync-pvpc-prices.ts
 * Sincroniza precios PVPC desde la API oficial de Red Eléctrica (apidatos.ree.es)
 * y los almacena en Supabase (precios_electricidad_es).
 *
 * Uso manual:  npx tsx scripts/sync-pvpc-prices.ts
 * Uso auto:    Vercel Cron → /api/cron/sync-pvpc (ejecuta la misma lógica)
 */

import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Configurable: fecha de inicio para backfill
const START_DATE = process.env.PVPC_START_DATE || "2026-03-12";

// ── API de REE (pública, no necesita token) ────────────────────────
const REE_BASE = "https://apidatos.ree.es/es/datos/mercados/precios-mercados-tiempo-real";

type ReeValue = { value: number; datetime: string };

async function fetchPvpcFromREE(fecha: string): Promise<number[]> {
    const url = `${REE_BASE}?start_date=${fecha}T00:00&end_date=${fecha}T23:59&time_trunc=hour&geo_limit=peninsular`;

    const resp = await fetch(url, {
        headers: { "Accept": "application/json" },
    });

    if (!resp.ok) {
        throw new Error(`REE API ${resp.status}: ${resp.statusText}`);
    }

    const json = await resp.json();

    // La API devuelve included[] con múltiples indicadores.
    // El PVPC está en el indicador con id que contiene "1001" o título "PVPC"
    const included = json?.included || [];

    let pvpcValues: ReeValue[] = [];

    for (const indicator of included) {
        const title = (indicator?.attributes?.title || "").toLowerCase();
        const id = String(indicator?.id || "");
        // Buscar el indicador PVPC (puede ser "PVPC", "pvpc", o id "1001")
        if (title.includes("pvpc") || id.includes("1001") || title.includes("precio voluntario")) {
            pvpcValues = indicator?.attributes?.values || [];
            break;
        }
    }

    // Si no encontramos PVPC específico, intentar el primer indicador con valores
    if (!pvpcValues.length && included.length > 0) {
        for (const indicator of included) {
            const vals = indicator?.attributes?.values || [];
            if (vals.length > 0) {
                pvpcValues = vals;
                break;
            }
        }
    }

    if (!pvpcValues.length) {
        throw new Error("No se encontraron valores PVPC en la respuesta de REE");
    }

    // Los valores vienen en €/MWh, convertimos a €/kWh
    return pvpcValues.map((v: ReeValue) => v.value / 1000);
}

// ── Fallback: api.preciodelaluz.org ─────────────────────────────────
async function fetchPvpcFromPrecioDeLaLuz(fecha: string): Promise<number[]> {
    const url = `https://api.preciodelaluz.org/v1/prices/all?zone=PCB&date=${fecha}`;
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`preciodelaluz ${resp.status}`);
    const data = await resp.json();
    return Object.values(data).map((v: any) => v.price / 1000);
}

// ── Lógica principal ────────────────────────────────────────────────
export async function syncPvpcPrices(options?: { startDate?: string; supabaseUrl?: string; supabaseKey?: string }) {
    const url = options?.supabaseUrl || SUPABASE_URL;
    const key = options?.supabaseKey || SUPABASE_KEY;

    if (!url || !key) {
        throw new Error("❌ Faltan variables Supabase (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)");
    }

    const supabase = createClient(url, key);

    // Generar lista de fechas a sincronizar
    const dates: string[] = [];
    const start = new Date(options?.startDate || START_DATE);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    let current = new Date(start);
    while (current <= yesterday) {
        dates.push(current.toISOString().split("T")[0]);
        current.setDate(current.getDate() + 1);
    }

    if (dates.length === 0) {
        console.log("✅ Los datos ya parecen estar al día.");
        return { synced: 0, errors: 0, message: "Already up to date" };
    }

    console.log(`🚀 Sincronizando ${dates.length} días desde API REE (apidatos.ree.es)...`);

    let synced = 0;
    let errors = 0;

    for (const d of dates) {
        console.log(`📅 [${d}] Consultando apidatos.ree.es...`);

        try {
            let prices: number[];

            try {
                // Intento 1: API oficial de REE
                prices = await fetchPvpcFromREE(d);
            } catch (reeErr: any) {
                console.warn(`      ⚠️  REE falló (${reeErr.message}), intentando preciodelaluz.org...`);
                try {
                    // Intento 2: Fallback a preciodelaluz.org
                    prices = await fetchPvpcFromPrecioDeLaLuz(d);
                } catch {
                    console.error(`      ❌ Ambas APIs fallaron para ${d}`);
                    errors++;
                    continue;
                }
            }

            if (prices.length === 0) {
                console.warn(`      ⚠️  Sin precios para ${d}`);
                errors++;
                continue;
            }

            const payload = {
                fecha: d,
                tarifa_codigo: "pvpc_2_0td",
                precio_kwh_media: Number((prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(5)),
                precio_kwh_min: Number(Math.min(...prices).toFixed(5)),
                precio_kwh_max: Number(Math.max(...prices).toFixed(5)),
                fuente: "ree_apidatos",
                indicador_id: "1001"
            };

            const { error } = await supabase
                .from("precios_electricidad_es")
                .upsert(payload, { onConflict: "fecha,tarifa_codigo" });

            if (error) {
                console.error(`      ❌ Supabase: ${error.message}`);
                errors++;
            } else {
                console.log(`      ✅ OK! Media: ${payload.precio_kwh_media} €/kWh (${prices.length} horas)`);
                synced++;
            }
        } catch (e: any) {
            console.error(`      ❌ Error: ${e.message}`);
            errors++;
        }

        // Rate limit: 500ms entre peticiones
        await new Promise(r => setTimeout(r, 500));
    }

    const summary = `\n✨ Sincronización completada: ${synced} OK, ${errors} errores de ${dates.length} días.`;
    console.log(summary);
    return { synced, errors, total: dates.length, message: summary };
}

// ── Ejecutar directamente si es CLI ─────────────────────────────────
syncPvpcPrices();
