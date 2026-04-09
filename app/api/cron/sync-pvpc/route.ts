/**
 * /api/cron/sync-pvpc — Vercel Cron
 * Sincroniza precios PVPC desde la API de REE.
 *
 * Escribe en DOS tablas:
 *   1. precios_electricidad_es — agregados diarios (media, min, max)
 *   2. pvpc_horario            — 24 filas por día (hora a hora)
 *
 * Rango: ayer + hoy + mañana (REE publica mañana a las ~20:15 CET).
 * Cron: 21:15 CET (vercel.json: "15 19 * * *")
 */

import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

export async function GET(req: NextRequest) {
    // Proteger con CRON_SECRET (Vercel lo envía como Bearer token)
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!SUPABASE_URL || !SUPABASE_KEY) {
        return NextResponse.json({ error: "Missing Supabase env vars" }, { status: 500 });
    }

    const REE_BASE = "https://apidatos.ree.es/es/datos/mercados/precios-mercados-tiempo-real";

    try {
        // Sincronizar ayer, hoy y mañana
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        const dates = [
            yesterday.toISOString().split("T")[0],
            today.toISOString().split("T")[0],
            tomorrow.toISOString().split("T")[0],
        ];

        const { createClient } = await import("@supabase/supabase-js");
        const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

        const results: Array<{ fecha: string; status: string; media?: number; horas?: number }> = [];

        for (const fecha of dates) {
            try {
                // Fetch de la API de REE
                const url = `${REE_BASE}?start_date=${fecha}T00:00&end_date=${fecha}T23:59&time_trunc=hour&geo_limit=peninsular`;
                const resp = await fetch(url, {
                    headers: { "Accept": "application/json" },
                });

                if (!resp.ok) {
                    results.push({ fecha, status: `REE_HTTP_${resp.status}` });
                    continue;
                }

                const json = await resp.json();
                const included = json?.included || [];

                // Buscar indicador PVPC
                let values: Array<{ value: number; datetime: string }> = [];
                for (const ind of included) {
                    const title = (ind?.attributes?.title || "").toLowerCase();
                    const id = String(ind?.id || "");
                    if (title.includes("pvpc") || id.includes("1001") || title.includes("precio voluntario")) {
                        values = ind?.attributes?.values || [];
                        break;
                    }
                }

                // Fallback: primer indicador con datos
                if (!values.length && included.length > 0) {
                    for (const ind of included) {
                        const vals = ind?.attributes?.values || [];
                        if (vals.length > 0) { values = vals; break; }
                    }
                }

                if (!values.length) {
                    results.push({ fecha, status: "NO_DATA" });
                    continue;
                }

                // €/MWh → €/kWh
                const prices = values.map((v) => v.value / 1000);
                const media = Number((prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(5));

                // ── 1. Upsert agregado diario en precios_electricidad_es ──
                const { error: dailyErr } = await supabase
                    .from("precios_electricidad_es")
                    .upsert({
                        fecha,
                        tarifa_codigo: "pvpc_2_0td",
                        precio_kwh_media: media,
                        precio_kwh_min: Number(Math.min(...prices).toFixed(5)),
                        precio_kwh_max: Number(Math.max(...prices).toFixed(5)),
                        fuente: "ree_apidatos",
                        indicador_id: "1001",
                    }, { onConflict: "fecha,tarifa_codigo" });

                if (dailyErr) {
                    results.push({ fecha, status: `DAILY_ERR: ${dailyErr.message}` });
                    continue;
                }

                // ── 2. Upsert filas horarias en pvpc_horario ──
                // Calcular percentil y es_barata
                const sorted = [...prices].sort((a, b) => a - b);
                const hourlyRows = prices.map((precio, hora) => {
                    const rank = sorted.indexOf(precio);
                    const percentil = Math.round((rank / (sorted.length - 1 || 1)) * 100);
                    return {
                        fecha,
                        hora,
                        precio_kwh: Number(precio.toFixed(6)),
                        es_barata: percentil <= 25,         // bottom 25% of the day
                        percentil,
                    };
                });

                const { error: hourlyErr } = await supabase
                    .from("pvpc_horario")
                    .upsert(hourlyRows, { onConflict: "fecha,hora" });

                if (hourlyErr) {
                    results.push({ fecha, status: `HOURLY_ERR: ${hourlyErr.message}`, media });
                } else {
                    results.push({ fecha, status: "OK", media, horas: hourlyRows.length });
                }
            } catch (e: any) {
                results.push({ fecha, status: `ERROR: ${e.message}` });
            }
        }

        console.log("PVPC sync results:", JSON.stringify(results));
        return NextResponse.json({ success: true, results });

    } catch (error: any) {
        console.error("PVPC cron error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
