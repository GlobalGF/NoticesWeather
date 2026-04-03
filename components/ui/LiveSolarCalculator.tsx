"use client";

import { useState } from "react";
import { useWeather } from "@/components/providers/WeatherProvider";

/* ── Solar physics constants ────────────────────────────────────── */

const PANEL_AREA_M2 = 1.7;           // typical 400W panel
const PANEL_EFFICIENCY = 0.20;        // 20% module efficiency
const PERFORMANCE_RATIO = 0.80;       // system losses (wiring, inverter, etc.)
const TEMP_COEFF = -0.004;            // -0.4%/°C above 25°C (typical mono-Si)
const REFERENCE_TEMP = 25;            // STC reference temp
const ELECTRICITY_PRICE = 0.22;       // default €/kWh (overrideable via prop)
const PANEL_PEAK_W = 440;             // peak wattage per panel

/* ── Types ──────────────────────────────────────────────────────── */

type LiveSolarCalculatorProps = {
  municipio: string;
  precioMedioLuz?: number;
};

type CalcResult = {
  currentOutputW: number;
  tempDeratingPct: number;
  dailyProductionKwh: number;
  recommendedPanels: number;
  monthlySavingsEur: number;
  annualSavingsEur: number;
  capacityPct: number;
};

/* ── Calculation engine ─────────────────────────────────────────── */

function calculate(
  ghiWm2: number,
  tempC: number,
  monthlyConsumptionKwh: number,
  precioKwh: number,
  numPanels: number | "auto"
): CalcResult {
  // Temperature derating: panels lose efficiency above 25°C
  const tempDelta = Math.max(0, tempC - REFERENCE_TEMP);
  const tempDerating = 1 + TEMP_COEFF * tempDelta; // e.g. 0.97 at 32°C
  const tempDeratingPct = Math.round((1 - tempDerating) * 100);

  // Current output per panel (W)
  const rawOutputW = ghiWm2 * PANEL_AREA_M2 * PANEL_EFFICIENCY * PERFORMANCE_RATIO;
  const currentOutputW = rawOutputW * tempDerating;

  // Capacity % relative to panel peak
  const capacityPct = Math.min(100, Math.round((currentOutputW / PANEL_PEAK_W) * 100));

  // Estimated daily production per panel (assume ~5.5 peak sun hours avg Spain)
  const peakSunHours = Math.max(2, Math.min(8, ghiWm2 / 200)); // rough scaling
  const dailyKwhPerPanel = (PANEL_PEAK_W / 1000) * peakSunHours * PERFORMANCE_RATIO * tempDerating;

  // Recommended panels
  const dailyConsumption = monthlyConsumptionKwh / 30;
  const autoconsumoRatio = 0.65; // assume 65% self-consumption
  const recommendedPanels = Math.max(2, Math.ceil(
    (dailyConsumption * autoconsumoRatio) / dailyKwhPerPanel
  ));

  const panels = numPanels === "auto" ? recommendedPanels : numPanels;

  const dailyProductionKwh = dailyKwhPerPanel * panels;
  const monthlySavingsEur = dailyProductionKwh * 30 * precioKwh * autoconsumoRatio;
  const annualSavingsEur = monthlySavingsEur * 12;

  return {
    currentOutputW: Math.round(currentOutputW * panels),
    tempDeratingPct,
    dailyProductionKwh: Math.round(dailyProductionKwh * 10) / 10,
    recommendedPanels,
    monthlySavingsEur: Math.round(monthlySavingsEur),
    annualSavingsEur: Math.round(annualSavingsEur),
    capacityPct,
  };
}

function fmt(n: number, d = 0): string {
  return n.toLocaleString("es-ES", { maximumFractionDigits: d });
}

/* ── Component ──────────────────────────────────────────────────── */

export function LiveSolarCalculator({
  municipio,
  precioMedioLuz = ELECTRICITY_PRICE,
}: LiveSolarCalculatorProps) {
  const { data, loading, error } = useWeather();
  const [consumo, setConsumo] = useState(300); // kWh/month

  // No weather data? Show minimal fallback
  if (loading) {
    return (
      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 min-h-[220px]">
        <div className="h-6 w-64 bg-slate-200 rounded animate-pulse mb-4" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="h-24 rounded-xl bg-slate-100 animate-pulse" />
          <div className="h-24 rounded-xl bg-slate-100 animate-pulse" />
          <div className="h-24 rounded-xl bg-slate-100 animate-pulse" />
          <div className="h-24 rounded-xl bg-slate-100 animate-pulse" />
        </div>
      </section>
    );
  }

  if (error || !data) {
    return null; // silently hide — AhorroCalculator is the fallback
  }

  const ghi = data.ghi ?? data.short_rad ?? null;
  if (ghi == null || ghi <= 0) return null; // no solar data — hide

  const result = calculate(ghi, data.temp_c, consumo, precioMedioLuz, "auto");

  // Capacity ring (SVG)
  const ringRadius = 36;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference - (result.capacityPct / 100) * ringCircumference;

  return (
    <section
      className="mt-8 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden"
      aria-label={`Calculadora solar en tiempo real para ${municipio}`}
    >
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
          <span aria-hidden="true" className="text-amber-500">⚡</span>
          Producción solar en tiempo real
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Cálculo basado en irradiancia actual de <strong>{Math.round(ghi)} W/m²</strong> y temperatura de <strong>{Math.round(data.temp_c)}°C</strong> en {municipio}.
        </p>
      </div>

      {/* Production gauge + KPIs */}
      <div className="px-6 pb-4 flex flex-col items-center sm:flex-row sm:items-start gap-6">
        {/* SVG Capacity Ring + Desc */}
        <div className="flex flex-col items-center shrink-0">
          <div className="relative w-24 h-24 mb-2">
            <svg width="96" height="96" className="transform -rotate-90">
              <circle
                cx="48" cy="48" r={ringRadius}
                stroke="#f1f5f9" strokeWidth="6" fill="none"
              />
              <circle
                cx="48" cy="48" r={ringRadius}
                stroke={result.capacityPct > 60 ? "#f59e0b" : result.capacityPct > 30 ? "#3b82f6" : "#94a3b8"}
                strokeWidth="6"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={ringCircumference}
                strokeDashoffset={ringOffset}
                className="transition-all duration-1000 ease-in-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="text-2xl font-black tabular-nums text-slate-900 leading-none">{result.capacityPct}%</p>
              <p className="text-[8px] font-bold uppercase tracking-widest text-slate-400 mt-1">Capacidad</p>
            </div>
          </div>
          <p className="text-xs text-slate-500 text-center max-w-[120px]">
            Produciendo <strong className="text-slate-900">{fmt(result.currentOutputW)} W</strong> ahora
          </p>
        </div>

        {/* KPIs */}
        <div className="flex-1 grid grid-cols-2 gap-3 w-full">
          <div className="rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 p-4 text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600">Producción hoy</p>
            <p className="mt-1 text-2xl font-extrabold tabular-nums text-amber-900">{fmt(result.dailyProductionKwh, 1)}</p>
            <p className="text-[10px] font-medium text-amber-700">kWh estimados</p>
          </div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">Ahorro mensual</p>
            <p className="mt-1 text-2xl font-extrabold tabular-nums text-emerald-900">{fmt(result.monthlySavingsEur)} €</p>
            <p className="text-[10px] font-medium text-emerald-700">con {result.recommendedPanels} paneles</p>
          </div>
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600">Ahorro anual</p>
            <p className="mt-1 text-2xl font-extrabold tabular-nums text-blue-900">{fmt(result.annualSavingsEur)} €</p>
            <p className="text-[10px] font-medium text-blue-700 leading-tight mt-0.5">
              🛒 Equivale a {Math.max(1, Math.round(result.annualSavingsEur / 200))} {Math.max(1, Math.round(result.annualSavingsEur / 200)) === 1 ? 'cesta' : 'cestas'} de la compra completas
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Paneles recomendados</p>
            <p className="mt-1 text-2xl font-extrabold tabular-nums text-slate-900">{result.recommendedPanels}</p>
            <p className="text-[10px] font-medium text-slate-500">de {PANEL_PEAK_W}W</p>
          </div>
        </div>
      </div>

      {/* Consumption slider */}
      <div className="px-6 pb-4">
        <label htmlFor="live-calc-consumo" className="block text-sm font-semibold text-slate-700 mb-1">
          Tu consumo mensual
        </label>
        <div className="flex items-center gap-3">
          <input
            id="live-calc-consumo"
            type="range"
            min={100}
            max={1000}
            step={25}
            value={consumo}
            onChange={(e) => setConsumo(Number(e.target.value))}
            className="flex-1 accent-amber-500"
          />
          <span className="text-lg font-bold tabular-nums text-slate-900 min-w-[80px] text-right">
            {fmt(consumo)} kWh
          </span>
        </div>
      </div>

      {/* Temperature derating note */}
      {result.tempDeratingPct > 0 && (
        <div className="mx-6 mb-4 rounded-lg bg-slate-50 border border-slate-100 px-4 py-2.5 text-xs text-slate-500">
          🌡️ A <strong>{Math.round(data.temp_c)}°C</strong>, la eficiencia de los paneles se reduce un <strong>{result.tempDeratingPct}%</strong> respecto a condiciones estándar (25°C). Este efecto se ha incorporado al cálculo.
        </div>
      )}

      {/* CTA */}
      <div className="px-6 pb-5">
        <a
          href="#lead-form"
          className="block w-full rounded-xl bg-amber-400 px-6 py-3.5 text-center text-sm font-bold text-slate-900 shadow hover:bg-amber-500 active:scale-[0.98] transition-all"
        >
          Solicitar presupuesto para {result.recommendedPanels} paneles en {municipio} →
        </a>
      </div>

      {/* Footer */}
      <div className="px-6 py-2.5 bg-slate-50 border-t border-slate-100">
        <p className="text-[10px] text-slate-400">
          Cálculo basado en datos en tiempo real · Panel de {PANEL_PEAK_W}W · Autoconsumo 65% · Precio {precioMedioLuz.toFixed(2)} €/kWh
        </p>
      </div>
    </section>
  );
}
