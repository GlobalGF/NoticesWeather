"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type PvpcHora = {
    hora: number;
    precio_kwh: number;
    es_barata: boolean;
    percentil: number;
};

type PrecioLuzData = {
    ahora: PvpcHora | null;
    horas: PvpcHora[];
    minHora: PvpcHora | null;
    maxHora: PvpcHora | null;
    avgPrecio: number;
};

function barColor(h: PvpcHora, isSelected: boolean): string {
    if (isSelected) return "#3b82f6"; // blue-500
    if (h.precio_kwh < 0.10) return "#10b981"; // emerald-500
    if (h.precio_kwh < 0.15) return "#34d399"; // emerald-400
    if (h.precio_kwh < 0.20) return "#fbbf24"; // amber-400
    if (h.precio_kwh < 0.28) return "#f97316"; // orange-500
    return "#ef4444"; // red-500
}

function nivelLabel(precio: number): { label: string; cls: string } {
    if (precio < 0.10) return { label: "Muy barata", cls: "bg-emerald-100 text-emerald-800 border-emerald-300" };
    if (precio < 0.15) return { label: "Barata", cls: "bg-emerald-100 text-emerald-700 border-emerald-200" };
    if (precio < 0.20) return { label: "Normal", cls: "bg-amber-100  text-amber-800  border-amber-300" };
    if (precio < 0.28) return { label: "Cara", cls: "bg-orange-100 text-orange-800 border-orange-300" };
    return { label: "Muy cara", cls: "bg-red-100    text-red-800    border-red-300" };
}

function fmt(p: number) { return p.toFixed(3); }
function fmtFull(p: number) { return p.toFixed(3) + " €/kWh"; }

const CHART_H = 120; // px total chart height
const CHART_PADDING_TOP = 12; // px reserved above max bar

export function PrecioLuzWidget({ initialPrecio }: { initialPrecio?: number }) {
    const [data, setData] = useState<PrecioLuzData | null>(null);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(false);
    const [hovered, setHovered] = useState<number | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            const supabase = createSupabaseBrowserClient();
            const today = new Date().toISOString().split("T")[0];
            const horaActual = new Date().getHours();

            const { data: rows } = await supabase
                .from("pvpc_horario")
                .select("hora, precio_kwh, es_barata, percentil")
                .eq("fecha", today)
                .order("hora", { ascending: true });

            if (cancelled) return;

            if (!rows || rows.length === 0) {
                setData(null);
                setLoading(false);
                return;
            }

            const horas = rows as PvpcHora[];
            const ahora =
                horas.find(h => h.hora === horaActual) ??
                [...horas].sort((a, b) => b.hora - a.hora)[0] ??
                null;
            const minHora = [...horas].sort((a, b) => a.precio_kwh - b.precio_kwh)[0] ?? null;
            const maxHora = [...horas].sort((a, b) => b.precio_kwh - a.precio_kwh)[0] ?? null;
            const avgPrecio = horas.reduce((s, h) => s + h.precio_kwh, 0) / horas.length;

            setData({ ahora, horas, minHora, maxHora, avgPrecio });
            setLoading(false);
        }

        load();
        const interval = setInterval(load, 300_000);
        return () => { cancelled = true; clearInterval(interval); };
    }, []);

    if (loading) {
        if (initialPrecio != null) {
            const nivel = nivelLabel(initialPrecio);
            return (
                <div className="rounded-lg border border-slate-200 p-5 bg-white">
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Precio PVPC · Media diaria</p>
                    <div className="mt-1 flex items-baseline gap-2">
                        <span className="text-4xl font-black tabular-nums tracking-tight text-slate-900">{fmt(initialPrecio)}</span>
                        <span className="text-base text-slate-500 font-medium">€/kWh</span>
                    </div>
                    <span className={`mt-2 inline-block rounded border px-2 py-0.5 text-xs font-bold ${nivel.cls}`}>{nivel.label}</span>
                    <p className="mt-2 text-xs text-slate-400">Cargando datos hora a hora…</p>
                </div>
            );
        }
        return (
            <div className="rounded-lg border border-slate-200 p-5 animate-pulse bg-white">
                <div className="h-4 w-48 bg-slate-200 rounded mb-4" />
                <div className="h-12 w-36 bg-slate-100 rounded mb-2" />
                <div className="h-3 w-56 bg-slate-100 rounded" />
            </div>
        );
    }

    if (!data || !data.ahora) {
        return (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm font-semibold text-amber-800">Datos horarios pendientes</p>
                <p className="mt-1 text-xs text-amber-600">
                    El workflow n8n actualiza los precios PVPC cada hora. Disponible tras la primera ejecución.
                </p>
            </div>
        );
    }

    const { ahora, horas, minHora, maxHora, avgPrecio } = data;
    const nivel = nivelLabel(ahora.precio_kwh);
    const esActual = ahora.hora === new Date().getHours();

    // Chart math
    const maxP = Math.max(...horas.map(x => x.precio_kwh));
    const minP = Math.min(...horas.map(x => x.precio_kwh));
    const usableH = CHART_H - CHART_PADDING_TOP;

    function barH(precio: number) {
        return Math.max(4, Math.round(((precio - 0) / (maxP * 1.05)) * usableH));
    }

    // Y-axis ticks: 3 levels
    const yTicks = [maxP * 0.25, maxP * 0.5, maxP * 0.75, maxP].map(v => ({
        value: v,
        y: usableH - Math.round(((v - 0) / (maxP * 1.05)) * usableH) + CHART_PADDING_TOP,
        label: fmt(v),
    }));

    // Avg line Y
    const avgY = usableH - Math.round(((avgPrecio - 0) / (maxP * 1.05)) * usableH) + CHART_PADDING_TOP;

    const hoveredBar = hovered !== null ? horas.find(h => h.hora === hovered) : null;

    return (
        <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">

            {/* ── Price header ─────────────────────────────────── */}
            <div className="px-5 py-4 border-b border-slate-100">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                            {esActual ? "Consumo de red · Ahora" : `Consumo de red · ${String(ahora.hora).padStart(2, "0")}:00`}
                        </p>
                        <div className="mt-1 flex items-baseline gap-2">
                            <span className="text-4xl font-black tabular-nums tracking-tight text-slate-900" title={`${(ahora.precio_kwh * 100).toFixed(1)} céntimos/kWh`}>
                                {fmt(ahora.precio_kwh)}
                            </span>
                            <div className="flex flex-col">
                                <span className="text-base text-slate-500 font-medium leading-none">€/kWh</span>
                                <span className="text-[10px] text-slate-400 font-medium mt-1">{(ahora.precio_kwh * 100).toFixed(1)} céntimos</span>
                            </div>
                        </div>
                        <p className="mt-1 text-xs text-slate-400">
                            Aplica a la luz que compras directamente de la compañía
                        </p>
                        <div className="mt-3 inline-flex items-center gap-2 bg-amber-50 rounded-lg px-3 py-1.5 border border-amber-100">
                            <span className="text-sm">☀️</span>
                            <p className="text-[10px] text-amber-800 font-semibold leading-tight">
                                Con paneles solares, <br />
                                <span className="text-amber-600">este coste sería de 0.00 €</span>
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                        <span className={`rounded border px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-xs font-bold ${nivel.cls}`}>
                            {nivel.label}
                        </span>
                        <span className="text-[10px] sm:text-xs text-slate-400">Media: <span className="text-slate-600 font-bold">{fmt(avgPrecio)}€</span></span>
                    </div>
                </div>

                {/* Min/Max inline */}
                {minHora && maxHora && (
                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[10px] sm:text-xs">
                        <span className="flex items-center gap-1.5 text-emerald-700">
                            <span className="font-semibold">↓ Mín</span>
                            <span className="font-mono font-bold">{String(minHora.hora).padStart(2, "0")}:00</span>
                            <span className="text-emerald-500">{fmt(minHora.precio_kwh)}€</span>
                        </span>
                        <span className="text-slate-300 hidden sm:inline">|</span>
                        <span className="flex items-center gap-1.5 text-red-600">
                            <span className="font-semibold">↑ Máx</span>
                            <span className="font-mono font-bold">{String(maxHora.hora).padStart(2, "0")}:00</span>
                            <span className="text-red-400">{fmt(maxHora.precio_kwh)}€</span>
                        </span>
                        <span className="text-slate-300 hidden sm:inline">|</span>
                        <span className="text-slate-500 hidden sm:inline">Δ {fmt(maxHora.precio_kwh - minHora.precio_kwh)}€</span>
                    </div>
                )}
            </div>

            {/* ── Expand toggle ────────────────────────────────── */}
            <button
                type="button"
                onClick={() => setExpanded(e => !e)}
                className="w-full px-5 py-2.5 flex items-center justify-between text-xs font-semibold text-slate-500 hover:bg-slate-50 transition-colors border-b border-slate-100"
            >
                <span className="uppercase tracking-widest">
                    {expanded ? "Ocultar evolución horaria" : `Ver evolución horaria (${horas.length}h)`}
                </span>
                <span className="text-slate-400">{expanded ? "▲" : "▼"}</span>
            </button>

            {/* ── Chart ────────────────────────────────────────── */}
            {expanded && horas.length > 0 && (
                <div className="px-4 pt-3 pb-4 bg-slate-50">

                    {/* Hover tooltip */}
                    <div className="h-8 mb-1 flex items-center">
                        {hoveredBar ? (
                            <div className="flex items-center gap-3 text-xs">
                                <span className="font-mono font-bold text-slate-700">
                                    {String(hoveredBar.hora).padStart(2, "0")}:00
                                </span>
                                <span
                                    className="font-bold"
                                    style={{ color: barColor(hoveredBar, hoveredBar.hora === ahora.hora) }}
                                >
                                    {fmtFull(hoveredBar.precio_kwh)}
                                </span>
                                <span className={`rounded border px-1.5 py-0.5 text-xs font-semibold ${nivelLabel(hoveredBar.precio_kwh).cls}`}>
                                    {nivelLabel(hoveredBar.precio_kwh).label}
                                </span>
                            </div>
                        ) : (
                            <span className="text-xs text-slate-400 italic">Pasa el cursor sobre una hora</span>
                        )}
                    </div>

                    {/* Chart area */}
                    <div className="relative flex gap-px items-end" style={{ height: `${CHART_H}px` }}>

                        {/* Y-axis grid lines */}
                        {yTicks.map(tick => (
                            <div
                                key={tick.label}
                                className="absolute left-0 right-0 border-t border-slate-200"
                                style={{ top: `${tick.y}px` }}
                            >
                                <span className="absolute -left-1 -translate-x-full -translate-y-1/2 text-xs text-slate-400 font-mono tabular-nums whitespace-nowrap pr-1">
                                    {tick.label}
                                </span>
                            </div>
                        ))}

                        {/* Average line */}
                        <div
                            className="absolute left-0 right-0 border-t border-dashed border-blue-400 z-10"
                            style={{ top: `${avgY}px` }}
                        >
                            <span className="absolute right-0 -translate-y-full text-xs text-blue-500 font-semibold pr-1">
                                Ø {fmt(avgPrecio)}
                            </span>
                        </div>

                        {/* Bars */}
                        {horas.map(h => {
                            const bh = barH(h.precio_kwh);
                            const isSelected = h.hora === ahora.hora;
                            const color = barColor(h, isSelected);
                            return (
                                <div
                                    key={h.hora}
                                    className="flex-1 flex flex-col justify-end cursor-crosshair relative group"
                                    style={{ height: `${CHART_H}px` }}
                                    onMouseEnter={() => setHovered(h.hora)}
                                    onMouseLeave={() => setHovered(null)}
                                >
                                    <div
                                        className="w-full rounded-t-sm transition-opacity"
                                        style={{
                                            height: `${bh}px`,
                                            backgroundColor: color,
                                            opacity: hovered !== null && hovered !== h.hora ? 0.45 : 1,
                                        }}
                                    />
                                    {/* Current hour marker */}
                                    {isSelected && (
                                        <div
                                            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0.5 bg-blue-500"
                                            style={{ height: `${bh + 4}px` }}
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* X-axis labels */}
                    <div className="flex mt-1" style={{ paddingLeft: "0px" }}>
                        {horas.map(h => (
                            <div key={h.hora} className="flex-1 text-center">
                                {h.hora % 6 === 0 && (
                                    <span className="text-xs text-slate-400 tabular-nums font-mono">
                                        {String(h.hora).padStart(2, "0")}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Legend */}
                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 border-t border-slate-200 pt-3">
                        {[
                            { color: "#10b981", label: "< 0.10 € Muy barata" },
                            { color: "#34d399", label: "0.10–0.15 € Barata" },
                            { color: "#fbbf24", label: "0.15–0.20 € Normal" },
                            { color: "#f97316", label: "0.20–0.28 € Cara" },
                            { color: "#ef4444", label: "> 0.28 € Muy cara" },
                            { color: "#3b82f6", label: "Hora actual" },
                        ].map(({ color, label }) => (
                            <span key={label} className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-sm inline-block shrink-0" style={{ backgroundColor: color }} />
                                {label}
                            </span>
                        ))}
                        <span className="flex items-center gap-1.5">
                            <span className="w-4 border-t-2 border-dashed border-blue-400 inline-block" />
                            Media del día
                        </span>
                    </div>
                </div>
            )}

            {/* Footer */}
            <div className="px-5 py-2 bg-white border-t border-slate-100 flex items-center justify-between">
                <p className="text-xs text-slate-400">
                    Fuente: REE · PVPC 2.0TD · Actualización horaria
                </p>
                <p className="text-xs text-slate-300">
                    {new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
                </p>
            </div>
        </div>
    );
}
