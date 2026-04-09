"use client";

import { useMemo, useState } from "react";
import { estimateAnnualPvProduction } from "@/calculators/pv-production";
import { estimateAnnualSavings } from "@/calculators/savings";
import { estimatePaybackYears } from "@/calculators/payback";
import { calculateBatteryRecommendation } from "@/calculators/battery-calculator";

type Props = {
  irradiancia?: number;
  precioMedioLuz?: number;
  precioInstalacion?: number;
  subvencionPct?: number;
  bonificacionIbi?: number;
  municipio?: string;
  provincia?: string;
  slug?: string;
};

const PANEL_W = 440;
const COST_PER_KWP = 1500;
const COMPENSATION_PRICE = 0.06;
const BATTERY_COST_PER_KWH = 450;

type TipoVivienda = "piso" | "adosado" | "unifamiliar";
type InputMode = "kwh" | "eur";

const VIVIENDA_CONFIG: Record<TipoVivienda, { label: string; tejadom2: number; consumoDefecto: number; autoconsumoBase: number }> = {
  piso:         { label: "Piso / apartamento",  tejadom2: 20,  consumoDefecto: 200, autoconsumoBase: 45 },
  adosado:      { label: "Adosado / dúplex",    tejadom2: 40,  consumoDefecto: 350, autoconsumoBase: 55 },
  unifamiliar:  { label: "Unifamiliar / chalet", tejadom2: 80, consumoDefecto: 500, autoconsumoBase: 60 },
};

export function CalculadoraSolarCompleta({
  irradiancia = 1700,
  precioMedioLuz = 0.18,
  precioInstalacion,
  subvencionPct = 0,
  bonificacionIbi = 0,
  municipio,
  provincia,
  slug,
}: Props) {
  const [tipoVivienda, setTipoVivienda] = useState<TipoVivienda>("unifamiliar");
  const [inputMode, setInputMode] = useState<InputMode>("kwh");
  const [consumoMensual, setConsumoMensual] = useState(VIVIENDA_CONFIG.unifamiliar.consumoDefecto);
  const [facturaMensual, setFacturaMensual] = useState(90);
  const [precioLuz, setPrecioLuz] = useState(precioMedioLuz);
  const [conBaterias, setConBaterias] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ nombre: "", telefono: "", email: "", ciudad: "" });
  const [formError, setFormError] = useState<string | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Derive kWh from € if needed
  const consumoKwh = inputMode === "eur" ? Math.round(facturaMensual / precioLuz) : consumoMensual;

  // Auto-compute autoconsumo based on housing type + battery
  const autoconsumoBase = VIVIENDA_CONFIG[tipoVivienda].autoconsumoBase;
  const autoconsumo = conBaterias ? Math.min(autoconsumoBase + 30, 95) : autoconsumoBase;

  // Solar hours per day (for battery calc)
  const sunHoursDay = irradiancia / 365;

  const result = useMemo(() => {
    const consumoAnual = consumoKwh * 12;
    const kwp = consumoAnual / (irradiancia * 0.78);
    const kwpRound = Math.ceil(kwp * 10) / 10;
    const paneles = Math.ceil((kwpRound * 1000) / PANEL_W);
    const produccionAnual = estimateAnnualPvProduction(irradiancia, kwpRound);
    const ratio = autoconsumo / 100;
    const ahorroAutoconsumo = estimateAnnualSavings(produccionAnual, ratio, precioLuz);
    const excedentes = produccionAnual * (1 - ratio);
    const ingresoExcedentes = excedentes * COMPENSATION_PRICE;
    const ahorroTotalAnual = ahorroAutoconsumo + ingresoExcedentes;

    // Installation cost: use local data if available, else formula
    const costeSolar = precioInstalacion ?? kwpRound * COST_PER_KWP;
    const superficieTejado = paneles * 2;
    const tejadom2Max = VIVIENDA_CONFIG[tipoVivienda].tejadom2;

    // Battery calculation
    const bat = calculateBatteryRecommendation({
      monthlyConsumptionKwh: consumoKwh,
      installationPowerKw: kwpRound,
      tariff: "2.0TD",
      sunHoursPerDay: sunHoursDay,
    });
    const costeBaterias = conBaterias ? bat.requiredCapacityKwh * BATTERY_COST_PER_KWH : 0;

    // Total cost with subvention
    const costeTotal = (costeSolar + costeBaterias) * (1 - subvencionPct / 100);

    // IBI bonus (over 20 years typical)
    const ahorroIbi = bonificacionIbi > 0 ? bonificacionIbi * 20 : 0;

    const amortizacion = estimatePaybackYears(costeTotal - ahorroIbi, ahorroTotalAnual);
    const ahorro25 = ahorroTotalAnual * 25 - costeTotal + ahorroIbi;

    // ROI %
    const roi25 = costeTotal > 0 ? ((ahorroTotalAnual * 25 + ahorroIbi - costeTotal) / costeTotal) * 100 : 0;

    // Cumulative for chart
    const cumulativeSin: number[] = [];
    const cumulativeCon: number[] = [];
    // "Sin baterías" scenario
    const ratioSin = VIVIENDA_CONFIG[tipoVivienda].autoconsumoBase / 100;
    const ahorroSin = estimateAnnualSavings(produccionAnual, ratioSin, precioLuz) + produccionAnual * (1 - ratioSin) * COMPENSATION_PRICE;
    const costeSin = precioInstalacion ?? kwpRound * COST_PER_KWP;
    const costeSinSub = costeSin * (1 - subvencionPct / 100);
    // "Con baterías" scenario
    const ratioCon = Math.min(VIVIENDA_CONFIG[tipoVivienda].autoconsumoBase + 30, 95) / 100;
    const ahorroCon = estimateAnnualSavings(produccionAnual, ratioCon, precioLuz) + produccionAnual * (1 - ratioCon) * COMPENSATION_PRICE;
    const costeConBat = costeSinSub + bat.requiredCapacityKwh * BATTERY_COST_PER_KWH * (1 - subvencionPct / 100);

    for (let y = 1; y <= 25; y++) {
      cumulativeSin.push(ahorroSin * y - costeSinSub);
      cumulativeCon.push(ahorroCon * y - costeConBat);
    }

    return {
      consumoAnual,
      kwp: kwpRound,
      paneles,
      produccionAnual: Math.round(produccionAnual),
      ahorroAutoconsumo: Math.round(ahorroAutoconsumo),
      ingresoExcedentes: Math.round(ingresoExcedentes),
      ahorroTotalAnual: Math.round(ahorroTotalAnual),
      costeSolar: Math.round(costeSolar),
      costeBaterias: Math.round(costeBaterias),
      costeTotal: Math.round(costeTotal),
      amortizacion: Math.round(amortizacion * 10) / 10,
      ahorro25: Math.round(ahorro25),
      roi25: Math.round(roi25),
      superficieTejado,
      tejadom2Max,
      cabeEnTejado: superficieTejado <= tejadom2Max,
      bat,
      cumulativeSin,
      cumulativeCon,
      ahorroSinAnual: Math.round(ahorroSin),
      ahorroConAnual: Math.round(ahorroCon),
    };
  }, [consumoKwh, precioLuz, autoconsumo, irradiancia, conBaterias, tipoVivienda, sunHoursDay, precioInstalacion, subvencionPct, bonificacionIbi]);

  const maxCum = Math.max(
    ...result.cumulativeSin.map(Math.abs),
    ...result.cumulativeCon.map(Math.abs),
    1
  );

  // Recommendation engine
  const rec = useMemo(() => {
    const msgs: string[] = [];
    msgs.push(`Te recomendamos instalar ${result.kwp} kWp (${result.paneles} paneles de ${PANEL_W}W).`);
    if (!result.cabeEnTejado) {
      msgs.push(`Necesitas ~${result.superficieTejado} m² de tejado, pero un ${VIVIENDA_CONFIG[tipoVivienda].label.toLowerCase()} suele tener ~${result.tejadom2Max} m². Considera reducir el tamaño o un sistema comunitario.`);
    }
    if (conBaterias && result.bat.recommendedBatteries > 0) {
      msgs.push(`Baterías: ${result.bat.recommendedBatteries} × 5 kWh (${result.bat.requiredCapacityKwh.toFixed(1)} kWh útiles). Independencia energética: ${result.bat.energyIndependencePct}%.`);
    } else if (!conBaterias && result.bat.requiredCapacityKwh > 2) {
      msgs.push(`Sin baterías, solo aprovechas ~${autoconsumoBase}% de tu producción. Con baterías podrías llegar al ~${autoconsumoBase + 30}%.`);
    }
    if (result.amortizacion <= 6) msgs.push("Amortización rápida — excelente inversión.");
    else if (result.amortizacion <= 10) msgs.push("Amortización en rango normal.");
    else msgs.push("Amortización larga. Revisa si hay subvenciones disponibles en tu zona.");
    return msgs;
  }, [result, conBaterias, tipoVivienda, autoconsumoBase]);

  return (
    <div className="space-y-8">
      {/* ── INPUTS ── */}
      <div className="space-y-4">
        {/* Row 1: Tipo vivienda + modo input */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Tipo vivienda */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5">
            <label className="text-sm font-bold text-slate-700 mb-3 block">Tipo de vivienda</label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.entries(VIVIENDA_CONFIG) as [TipoVivienda, typeof VIVIENDA_CONFIG["piso"]][]).map(([key, cfg]) => (
                <button
                  key={key}
                  onClick={() => { setTipoVivienda(key); setConsumoMensual(cfg.consumoDefecto); }}
                  className={`rounded-xl border-2 px-3 py-3 text-center transition-all text-xs font-bold ${
                    tipoVivienda === key
                      ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm"
                      : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                  }`}
                >
                  <span className="block text-lg mb-1">{key === "piso" ? "🏢" : key === "adosado" ? "🏘️" : "🏡"}</span>
                  {cfg.label.split(" / ")[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Modo input: kWh or € */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5">
            <label className="text-sm font-bold text-slate-700 mb-3 block">¿Cómo quieres introducir tu consumo?</label>
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setInputMode("kwh")}
                className={`flex-1 rounded-xl border-2 py-2.5 text-sm font-bold transition-all ${
                  inputMode === "kwh"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                }`}
              >kWh / mes</button>
              <button
                onClick={() => setInputMode("eur")}
                className={`flex-1 rounded-xl border-2 py-2.5 text-sm font-bold transition-all ${
                  inputMode === "eur"
                    ? "border-amber-500 bg-amber-50 text-amber-700"
                    : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                }`}
              >€ / mes</button>
            </div>
            {inputMode === "kwh" ? (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-500">Consumo mensual</span>
                  <div className="flex items-baseline gap-1 bg-white px-3 py-1.5 rounded-lg shadow-sm border border-blue-100">
                    <span className="text-xl font-black text-blue-600 tabular-nums">{consumoMensual}</span>
                    <span className="text-xs font-bold text-blue-400">kWh</span>
                  </div>
                </div>
                <input type="range" min={80} max={1200} step={10} value={consumoMensual}
                  onChange={e => setConsumoMensual(+e.target.value)} className="w-full accent-blue-600" />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1"><span>80</span><span>1.200 kWh</span></div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-500">Factura mensual</span>
                  <div className="flex items-baseline gap-1 bg-white px-3 py-1.5 rounded-lg shadow-sm border border-amber-100">
                    <span className="text-xl font-black text-amber-600 tabular-nums">{facturaMensual}</span>
                    <span className="text-xs font-bold text-amber-400">€</span>
                  </div>
                </div>
                <input type="range" min={30} max={400} step={5} value={facturaMensual}
                  onChange={e => setFacturaMensual(+e.target.value)} className="w-full accent-amber-600" />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1"><span>30 €</span><span>400 €</span></div>
                <p className="text-[10px] text-slate-400 mt-1">Equivale a ~{consumoKwh} kWh/mes</p>
              </div>
            )}
          </div>
        </div>

        {/* Row 2: Precio luz + Baterías toggle */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-bold text-slate-700">Precio medio electricidad</label>
              <div className="flex items-baseline gap-1 bg-white px-3 py-1.5 rounded-lg shadow-sm border border-amber-100">
                <span className="text-xl font-black text-amber-600 tabular-nums">{precioLuz.toFixed(2)}</span>
                <span className="text-xs font-bold text-amber-400">€/kWh</span>
              </div>
            </div>
            <input type="range" min={0.10} max={0.35} step={0.01} value={precioLuz}
              onChange={e => setPrecioLuz(+e.target.value)} className="w-full accent-amber-600" />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1"><span>0,10 €</span><span>0,35 €</span></div>
            {municipio && <p className="text-[10px] text-blue-500 mt-2 font-medium">Precio medio en {municipio}: {precioMedioLuz.toFixed(3)} €/kWh</p>}
          </div>

          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 flex flex-col justify-between">
            <label className="text-sm font-bold text-slate-700 mb-3 block">Comparar con baterías</label>
            <button
              onClick={() => setConBaterias(c => !c)}
              className={`w-full rounded-xl border-2 py-4 text-sm font-bold transition-all flex items-center justify-center gap-3 ${
                conBaterias
                  ? "border-fuchsia-500 bg-fuchsia-50 text-fuchsia-700"
                  : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="22" x="4" y="1" rx="2" ry="2"/><line x1="8" x2="16" y1="5" y2="5"/><line x1="12" x2="12" y1="9" y2="17"/><line x1="8" x2="16" y1="13" y2="13"/></svg>
              {conBaterias ? "Con baterías activado" : "Sin baterías (pulsa para comparar)"}
            </button>
            {conBaterias && (
              <p className="text-[10px] text-fuchsia-500 mt-2 font-medium">
                Autoconsumo pasa de {autoconsumoBase}% a {autoconsumo}% con baterías
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── RECOMMENDATION BANNER ── */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-5 text-white">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0 mt-0.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2a7 7 0 0 1 7 7c0 3-1.5 4.5-3 6-1 1-2 2.5-2 4H10c0-1.5-1-3-2-4-1.5-1.5-3-3-3-6a7 7 0 0 1 7-7z"/><path d="M10 21h4"/></svg>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-black uppercase tracking-widest">Recomendación para ti</h3>
            {rec.map((msg, i) => (
              <p key={i} className="text-sm text-blue-100 leading-relaxed">{msg}</p>
            ))}
          </div>
        </div>
      </div>

      {/* ── RESULTS PANEL ── */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 md:p-8 text-white">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
          <div>
            <h3 className="text-lg font-black tracking-tight">Tu instalación solar personalizada</h3>
            <p className="text-xs text-slate-400">
              {result.kwp} kWp · {result.paneles} paneles · {autoconsumo}% autoconsumo
              {conBaterias ? ` · ${result.bat.recommendedBatteries} baterías` : ""}
            </p>
          </div>
        </div>

        {/* KPI Grid — 7 cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-8">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Tamaño sistema</p>
            <p className="text-2xl font-black text-amber-400">{result.kwp} <span className="text-sm font-bold text-amber-400/60">kWp</span></p>
            <p className="text-[11px] text-slate-500 mt-1">{result.paneles} paneles · {result.superficieTejado} m²</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Producción anual</p>
            <p className="text-2xl font-black text-blue-400">{result.produccionAnual.toLocaleString("es-ES")} <span className="text-sm font-bold text-blue-400/60">kWh</span></p>
            <p className="text-[11px] text-slate-500 mt-1">Consumo: {result.consumoAnual.toLocaleString("es-ES")} kWh</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Coste instalación</p>
            <p className="text-2xl font-black text-white">{result.costeSolar.toLocaleString("es-ES")} <span className="text-sm font-bold text-white/60">€</span></p>
            <p className="text-[11px] text-slate-500 mt-1">{precioInstalacion ? "Precio local" : `~${COST_PER_KWP} €/kWp`}</p>
          </div>
          {conBaterias && result.costeBaterias > 0 && (
            <div className="bg-fuchsia-500/10 border border-fuchsia-500/20 rounded-2xl p-4">
              <p className="text-[10px] uppercase tracking-widest text-fuchsia-400 font-bold mb-1">Baterías</p>
              <p className="text-2xl font-black text-fuchsia-400">{result.costeBaterias.toLocaleString("es-ES")} <span className="text-sm font-bold text-fuchsia-400/60">€</span></p>
              <p className="text-[11px] text-fuchsia-500/60 mt-1">{result.bat.recommendedBatteries}× 5 kWh · {result.bat.energyIndependencePct}% indep.</p>
            </div>
          )}
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4">
            <p className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold mb-1">Ahorro anual</p>
            <p className="text-2xl font-black text-emerald-400">{result.ahorroTotalAnual.toLocaleString("es-ES")} <span className="text-sm font-bold text-emerald-400/60">€</span></p>
            <p className="text-[11px] text-emerald-500/60 mt-1">Autoconsumo {result.ahorroAutoconsumo}€ + excedentes {result.ingresoExcedentes}€</p>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4">
            <p className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold mb-1">Ahorro 25 años</p>
            <p className="text-2xl font-black text-emerald-400">{result.ahorro25.toLocaleString("es-ES")} <span className="text-sm font-bold text-emerald-400/60">€</span></p>
            <p className="text-[11px] text-emerald-500/60 mt-1">Beneficio neto total</p>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4">
            <p className="text-[10px] uppercase tracking-widest text-amber-400 font-bold mb-1">Amortización</p>
            <p className="text-2xl font-black text-amber-400">{result.amortizacion} <span className="text-sm font-bold text-amber-400/60">años</span></p>
            <p className="text-[11px] text-amber-500/60 mt-1">ROI: {result.roi25}%</p>
          </div>
          {subvencionPct > 0 && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4">
              <p className="text-[10px] uppercase tracking-widest text-blue-400 font-bold mb-1">Subvención</p>
              <p className="text-2xl font-black text-blue-400">-{subvencionPct} <span className="text-sm font-bold text-blue-400/60">%</span></p>
              <p className="text-[11px] text-blue-500/60 mt-1">Coste final: {result.costeTotal.toLocaleString("es-ES")} €</p>
            </div>
          )}
        </div>

        {/* ── COMPARISON CHART: sin vs con baterías ── */}
        <div>
          <h4 className="text-sm font-bold text-slate-300 mb-1">Ahorro acumulado — 25 años</h4>
          <p className="text-[11px] text-slate-500 mb-3">
            {conBaterias
              ? `Comparación: sin baterías (${result.ahorroSinAnual} €/año) vs con baterías (${result.ahorroConAnual} €/año)`
              : `Evolución del ahorro anual de ${result.ahorroTotalAnual.toLocaleString("es-ES")} €`}
          </p>
          <div className="flex items-end gap-[2px] h-36 md:h-44">
            {result.cumulativeSin.map((valSin, i) => {
              const valCon = result.cumulativeCon[i];
              const pctSin = maxCum > 0 ? (Math.abs(valSin) / maxCum) * 100 : 0;
              const pctCon = maxCum > 0 ? (Math.abs(valCon) / maxCum) * 100 : 0;
              const posSin = valSin >= 0;
              const posCon = valCon >= 0;
              return (
                <div key={i} className="flex-1 flex flex-col justify-end group relative" style={{ height: "100%" }}>
                  {conBaterias ? (
                    <div className="flex gap-[1px] w-full h-full items-end">
                      <div
                        className={`flex-1 rounded-t transition-all ${posSin ? "bg-emerald-500/60" : "bg-red-400/60"}`}
                        style={{ height: `${Math.max(pctSin, 2)}%` }}
                      />
                      <div
                        className={`flex-1 rounded-t transition-all ${posCon ? "bg-fuchsia-500" : "bg-red-400"}`}
                        style={{ height: `${Math.max(pctCon, 2)}%` }}
                      />
                    </div>
                  ) : (
                    <div
                      className={`w-full rounded-t transition-all ${posSin ? "bg-emerald-500" : "bg-red-400"} group-hover:opacity-80`}
                      style={{ height: `${Math.max(pctSin, 2)}%` }}
                    />
                  )}
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 hidden group-hover:block bg-slate-700 text-[10px] text-white px-2 py-1 rounded whitespace-nowrap z-10 shadow-lg">
                    <p>Año {i + 1}: {valSin >= 0 ? "+" : ""}{valSin.toLocaleString("es-ES")} €</p>
                    {conBaterias && <p className="text-fuchsia-300">+ bat: {valCon >= 0 ? "+" : ""}{valCon.toLocaleString("es-ES")} €</p>}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between text-[10px] text-slate-500 mt-1">
            <span>Año 1</span>
            <span>Año {Math.ceil(result.amortizacion)} = ROI</span>
            <span>Año 25</span>
          </div>
          <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-400">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-emerald-500" />{conBaterias ? "Sin baterías" : "Beneficio neto"}</span>
            {conBaterias && <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-fuchsia-500" />Con baterías</span>}
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-400" />Amortizando</span>
          </div>
        </div>
      </div>

      {/* ── CTA: ¿Quieres hacerlo realidad? ── */}
      {!formSubmitted ? (
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl border-2 border-emerald-200 p-6 md:p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />

          {!showForm ? (
            /* ── Collapsed: Summary + CTA button ── */
            <div className="text-center relative z-10">
              <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight mb-2">
                ¿Quieres hacer esto realidad?
              </h3>
              <p className="text-sm text-slate-600 max-w-lg mx-auto mb-4 leading-relaxed">
                Con tu perfil ya calculado ({result.kwp} kWp, {result.paneles} paneles,
                ahorro de {result.ahorroTotalAnual.toLocaleString("es-ES")} €/año),
                solo faltan tus datos de contacto para recibir un presupuesto real sin compromiso.
              </p>

              {/* Pre-filled summary chips */}
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                <span className="inline-flex items-center gap-1.5 bg-white border border-emerald-200 rounded-full px-3 py-1.5 text-xs font-bold text-emerald-700">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  {VIVIENDA_CONFIG[tipoVivienda].label}
                </span>
                <span className="inline-flex items-center gap-1.5 bg-white border border-emerald-200 rounded-full px-3 py-1.5 text-xs font-bold text-emerald-700">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  {consumoKwh} kWh/mes
                </span>
                <span className="inline-flex items-center gap-1.5 bg-white border border-emerald-200 rounded-full px-3 py-1.5 text-xs font-bold text-emerald-700">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  {result.kwp} kWp · {result.paneles} paneles
                </span>
                {conBaterias && (
                  <span className="inline-flex items-center gap-1.5 bg-white border border-fuchsia-200 rounded-full px-3 py-1.5 text-xs font-bold text-fuchsia-700">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    Con baterías
                  </span>
                )}
                {municipio && (
                  <span className="inline-flex items-center gap-1.5 bg-white border border-blue-200 rounded-full px-3 py-1.5 text-xs font-bold text-blue-700">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    {municipio}
                  </span>
                )}
              </div>

              <button
                onClick={() => setShowForm(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm px-8 py-4 rounded-2xl transition-all shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30 hover:-translate-y-0.5"
              >
                Solicitar presupuesto gratis
              </button>
              <p className="text-[11px] text-slate-400 mt-3">Sin compromiso · Respuesta en menos de 24h</p>
            </div>
          ) : (
            /* ── Expanded: Contact form ── */
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">Tu presupuesto personalizado</h3>
                  <p className="text-xs text-slate-500">Solo necesitamos 3 datos — el resto ya lo tenemos de la calculadora</p>
                </div>
              </div>

              {/* Already captured data */}
              <div className="bg-white/80 rounded-xl border border-emerald-100 p-4 mb-5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Sistema</p>
                  <p className="text-sm font-black text-slate-800">{result.kwp} kWp</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Coste est.</p>
                  <p className="text-sm font-black text-slate-800">{result.costeTotal.toLocaleString("es-ES")} €</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Ahorro/año</p>
                  <p className="text-sm font-black text-emerald-600">{result.ahorroTotalAnual.toLocaleString("es-ES")} €</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Amortización</p>
                  <p className="text-sm font-black text-amber-600">{result.amortizacion} años</p>
                </div>
              </div>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setFormError(null);

                  const { nombre, telefono, email, ciudad } = formData;
                  if (nombre.trim().length < 2) { setFormError("Escribe tu nombre (min. 2 caracteres)."); return; }
                  const cleanPhone = telefono.replace(/[\s\-\.]/g, "");
                  if (!/^[6789]\d{8}$/.test(cleanPhone)) { setFormError("Teléfono español inválido (9 dígitos)."); return; }
                  if (!email.includes("@") || !email.includes(".")) { setFormError("Email inválido."); return; }
                  if (!municipio && ciudad.trim().length < 2) { setFormError("Indica tu ciudad o municipio."); return; }

                  setFormSubmitting(true);
                  try {
                    const tipoMap: Record<string, string> = { piso: "piso", adosado: "unifamiliar", unifamiliar: "unifamiliar" };
                    const res = await fetch("/api/leads", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        nombre: nombre.trim(),
                        telefono: cleanPhone,
                        email: email.trim(),
                        tipo_vivienda: tipoMap[tipoVivienda] ?? "unifamiliar",
                        consumo_kwh: result.consumoAnual,
                        municipio: municipio ?? ciudad.trim(),
                        municipio_slug: slug ?? "",
                        provincia: provincia ?? "",
                        bateria: conBaterias ? "Sí" : "No",
                      }),
                    });
                    if (!res.ok) {
                      const data = await res.json().catch(() => null);
                      setFormError(data?.error ?? "Error al enviar. Inténtalo de nuevo.");
                      setFormSubmitting(false);
                      return;
                    }
                    setFormSubmitted(true);
                  } catch {
                    setFormError("Error de conexión. Inténtalo de nuevo.");
                    setFormSubmitting(false);
                  }
                }}
                className="grid gap-4 sm:grid-cols-3"
              >
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-bold text-slate-700">Nombre</span>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData(d => ({ ...d, nombre: e.target.value }))}
                    className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                    placeholder="Tu nombre"
                  />
                </label>

                {/* Campo ciudad solo si no hay municipio */}
                {!municipio && (
                  <label className="flex flex-col gap-1.5">
                    <span className="text-xs font-bold text-slate-700">Ciudad o municipio</span>
                    <input
                      type="text"
                      value={formData.ciudad}
                      onChange={(e) => setFormData(d => ({ ...d, ciudad: e.target.value }))}
                      className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                      placeholder="Ej: Madrid, Valencia..."
                    />
                  </label>
                )}
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-bold text-slate-700">Teléfono</span>
                  <input
                    type="tel"
                    value={formData.telefono}
                    onChange={(e) => setFormData(d => ({ ...d, telefono: e.target.value }))}
                    className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                    placeholder="600 123 456"
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-bold text-slate-700">Email</span>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(d => ({ ...d, email: e.target.value }))}
                    className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                    placeholder="tu@email.com"
                  />
                </label>

                {formError && <p className="sm:col-span-3 text-sm font-medium text-red-600">{formError}</p>}

                <div className="sm:col-span-3 flex flex-col sm:flex-row items-center gap-3">
                  <button
                    type="submit"
                    disabled={formSubmitting}
                    className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-600/20"
                  >
                    {formSubmitting ? "Enviando..." : "Recibir presupuesto gratis"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </form>

              <p className="text-[10px] text-slate-400 mt-4 leading-relaxed">
                Al enviar aceptas que tus datos sean cedidos a instaladores solares certificados en tu zona.
                Consulta nuestra <a href="/legal/politica-privacidad" className="underline hover:text-slate-600">política de privacidad</a>.
              </p>
            </div>
          )}
        </div>
      ) : (
        /* ── Success state ── */
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl border-2 border-emerald-300 p-6 md:p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-600 flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <h3 className="text-xl font-black text-slate-900 mb-2">Solicitud recibida</h3>
          <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            Un asesor solar te contactará en menos de 24 horas con un presupuesto detallado
            para tu instalación de {result.kwp} kWp{municipio ? ` en ${municipio}` : ""}.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 bg-emerald-100 rounded-full px-4 py-2 text-xs font-bold text-emerald-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Ahorro estimado: {result.ahorroTotalAnual.toLocaleString("es-ES")} €/año
          </div>
        </div>
      )}
    </div>
  );
}
