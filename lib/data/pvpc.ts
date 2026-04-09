/**
 * Server-side PVPC data helpers for /precio-luz pages.
 *
 * Fetches hourly data from pvpc_horario table and computes
 * cheap-hours analysis, summaries, and tomorrow predictions.
 */

import { createSupabaseServerClient } from "@/lib/supabase/server";

export type PvpcHora = {
  fecha: string;
  hora: number;
  precio_kwh: number;
  es_barata: boolean;
  percentil: number;
};

export type PvpcDaySummary = {
  fecha: string;
  horas: PvpcHora[];
  media: number;
  min: PvpcHora | null;
  max: PvpcHora | null;
  horasBaratas: PvpcHora[];
  horasCaras: PvpcHora[];
  franjaBarata: string; // e.g. "02:00 – 06:00"
  franjaCara: string;
};

export type PvpcAnalysis = {
  hoy: PvpcDaySummary | null;
  manana: PvpcDaySummary | null;
  /** Last 7-day average price */
  media7d: number;
  /** Trend vs yesterday: "sube" | "baja" | "estable" */
  tendencia: "sube" | "baja" | "estable";
  /** Yesterday's average for comparison */
  mediaAyer: number;
  updatedAt: string;
};

function toDateStr(d: Date): string {
  return d.toISOString().split("T")[0];
}

function buildSummary(fecha: string, rows: PvpcHora[]): PvpcDaySummary | null {
  if (rows.length === 0) return null;

  const sorted = [...rows].sort((a, b) => a.precio_kwh - b.precio_kwh);
  const media = rows.reduce((s, h) => s + h.precio_kwh, 0) / rows.length;

  const horasBaratas = sorted.slice(0, 6); // cheapest 6 hours
  const horasCaras = sorted.slice(-6).reverse(); // most expensive 6

  const baratasSorted = [...horasBaratas].sort((a, b) => a.hora - b.hora);
  const carasSorted = [...horasCaras].sort((a, b) => a.hora - b.hora);

  const franjaBarata = baratasSorted.length > 0
    ? `${String(baratasSorted[0].hora).padStart(2, "0")}:00 – ${String(baratasSorted[baratasSorted.length - 1].hora + 1).padStart(2, "0")}:00`
    : "–";
  const franjaCara = carasSorted.length > 0
    ? `${String(carasSorted[0].hora).padStart(2, "0")}:00 – ${String(carasSorted[carasSorted.length - 1].hora + 1).padStart(2, "0")}:00`
    : "–";

  return {
    fecha,
    horas: [...rows].sort((a, b) => a.hora - b.hora),
    media: Math.round(media * 1000) / 1000,
    min: sorted[0] ?? null,
    max: sorted[sorted.length - 1] ?? null,
    horasBaratas,
    horasCaras,
    franjaBarata,
    franjaCara,
  };
}

export async function getPvpcAnalysis(): Promise<PvpcAnalysis> {
  const supabase = await createSupabaseServerClient();
  const now = new Date();
  const hoy = toDateStr(now);

  const ayer = new Date(now);
  ayer.setDate(ayer.getDate() - 1);
  const ayerStr = toDateStr(ayer);

  const manana = new Date(now);
  manana.setDate(manana.getDate() + 1);
  const mananaStr = toDateStr(manana);

  // 7 days ago for weekly average
  const hace7 = new Date(now);
  hace7.setDate(hace7.getDate() - 7);
  const hace7Str = toDateStr(hace7);

  // Fetch all data in one query (last 8 days + tomorrow)
  const { data: rows } = await supabase
    .from("pvpc_horario")
    .select("fecha, hora, precio_kwh, es_barata, percentil")
    .gte("fecha", hace7Str)
    .lte("fecha", mananaStr)
    .order("fecha", { ascending: true })
    .order("hora", { ascending: true })
    .limit(500);

  const allRows = (rows ?? []) as PvpcHora[];

  const hoyRows = allRows.filter(r => r.fecha === hoy);
  const ayerRows = allRows.filter(r => r.fecha === ayerStr);
  const mananaRows = allRows.filter(r => r.fecha === mananaStr);

  // 7-day average (excluding today/tomorrow)
  const historicRows = allRows.filter(r => r.fecha >= hace7Str && r.fecha < hoy);
  const media7d = historicRows.length > 0
    ? Math.round((historicRows.reduce((s, h) => s + h.precio_kwh, 0) / historicRows.length) * 1000) / 1000
    : 0.16;

  const mediaAyer = ayerRows.length > 0
    ? ayerRows.reduce((s, h) => s + h.precio_kwh, 0) / ayerRows.length
    : media7d;

  const hoySummary = buildSummary(hoy, hoyRows);
  const mediaHoy = hoySummary?.media ?? media7d;

  const diff = mediaHoy - mediaAyer;
  const tendencia: "sube" | "baja" | "estable" =
    diff > 0.005 ? "sube" : diff < -0.005 ? "baja" : "estable";

  return {
    hoy: hoySummary,
    manana: buildSummary(mananaStr, mananaRows),
    media7d,
    tendencia,
    mediaAyer: Math.round(mediaAyer * 1000) / 1000,
    updatedAt: now.toISOString(),
  };
}
