"use client";

import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sun, 
  Battery as BatteryIcon, 
  Zap, 
  Euro, 
  ArrowRight, 
  CheckCircle2, 
  Info, 
  Home, 
  Building2, 
  Building,
  TrendingUp,
  ShieldCheck,
  Star,
  Users,
  Timer,
  Wallet,
  Lock,
  Activity
} from "lucide-react";
import { estimateAnnualPvProduction } from "@/calculators/pv-production";
import { estimateAnnualSavings } from "@/calculators/savings";
import { estimatePaybackYears } from "@/calculators/payback";
import { calculateBatteryRecommendation } from "@/calculators/battery-calculator";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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

const VIVIENDA_CONFIG: Record<TipoVivienda, { label: string; icon: any; tejadom2: number; consumoDefecto: number; autoconsumoBase: number }> = {
  piso:         { label: "Piso / Apartamento", icon: Building2, tejadom2: 20,  consumoDefecto: 200, autoconsumoBase: 45 },
  adosado:      { label: "Adosado / Dúplex", icon: Building, tejadom2: 40,  consumoDefecto: 350, autoconsumoBase: 55 },
  unifamiliar:  { label: "Unifamiliar / Chalet", icon: Home, tejadom2: 80, consumoDefecto: 500, autoconsumoBase: 60 },
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

  // Form states
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

    const costeSolar = precioInstalacion ?? kwpRound * COST_PER_KWP;
    const superficieTejado = paneles * 2;
    const tejadom2Max = VIVIENDA_CONFIG[tipoVivienda].tejadom2;

    const bat = calculateBatteryRecommendation({
      monthlyConsumptionKwh: consumoKwh,
      installationPowerKw: kwpRound,
      tariff: "2.0TD",
      sunHoursPerDay: sunHoursDay,
    });
    const costeBaterias = conBaterias ? bat.requiredCapacityKwh * BATTERY_COST_PER_KWH : 0;
    const costeTotal = (costeSolar + costeBaterias) * (1 - subvencionPct / 100);
    const ahorroIbi = bonificacionIbi > 0 ? bonificacionIbi * 20 : 0;

    const amortizacion = estimatePaybackYears(costeTotal - ahorroIbi, ahorroTotalAnual);
    const ahorro25 = ahorroTotalAnual * 25 - costeTotal + ahorroIbi;
    const roi25 = costeTotal > 0 ? ((ahorroTotalAnual * 25 + ahorroIbi - costeTotal) / costeTotal) * 100 : 0;

    const cumulativeSin: number[] = [];
    const cumulativeCon: number[] = [];
    const ratioSin = VIVIENDA_CONFIG[tipoVivienda].autoconsumoBase / 100;
    const ahorroSin = estimateAnnualSavings(produccionAnual, ratioSin, precioLuz) + produccionAnual * (1 - ratioSin) * COMPENSATION_PRICE;
    const costeSin = precioInstalacion ?? kwpRound * COST_PER_KWP;
    const costeSinSub = costeSin * (1 - subvencionPct / 100);
    
    const ratioCon = Math.min(VIVIENDA_CONFIG[tipoVivienda].autoconsumoBase + 30, 95) / 100;
    const ahorroCon = estimateAnnualSavings(produccionAnual, ratioCon, precioLuz) + produccionAnual * (1 - ratioCon) * COMPENSATION_PRICE;
    const costeConBat = (costeSin + bat.requiredCapacityKwh * BATTERY_COST_PER_KWH) * (1 - subvencionPct / 100);

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

  const maxCum = Math.max(...result.cumulativeSin.map(Math.abs), ...result.cumulativeCon.map(Math.abs), 1);

  return (
    <div className="space-y-12">
      {/* ── TOP HEADER / AI INSIGHT ── */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[2.5rem] bg-slate-950 p-6 md:p-10 text-white shadow-2xl border border-white/10"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-amber-500/5" />
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-[100px]" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 space-y-4 text-center md:text-left">
             <div className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">
               <span className="relative flex h-2 w-2">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                 <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
               </span>
               Análisis en Tiempo Real para {municipio}
             </div>
             <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
               Tu rentabilidad solar es <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">imparable</span>.
             </h2>
             <p className="text-slate-400 text-base md:text-lg font-light leading-relaxed max-w-2xl">
               Basado en tu consumo y la irradiación local ({irradiancia} kWh/m²), podrías ahorrar <span className="text-white font-bold">{result.ahorroTotalAnual.toLocaleString("es-ES")}€</span> este mismo año.
             </p>
          </div>
          
          <div className="shrink-0 flex flex-col items-center justify-center p-8 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-xl group">
             <TrendingUp className="w-10 h-10 text-emerald-400 mb-4 group-hover:scale-110 transition-transform" />
             <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-1">Ahorro 25 años</p>
             <p className="text-4xl font-black text-white">{result.ahorro25.toLocaleString("es-ES")}€</p>
             <div className="mt-4 flex items-center gap-2 text-[11px] font-bold text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-full">
                <CheckCircle2 className="w-3 h-3" />
                ROI {result.roi25}%
             </div>
          </div>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* ── LEFT COLUMN: INPUTS (4 Cols) ── */}
        <div className="lg:col-span-5 space-y-6">
          {/* Housing Selection Card */}
          <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-sm font-bold text-slate-900 mb-5 flex items-center gap-2">
              <Home className="w-4 h-4 text-blue-500" />
              Tipo de Vivienda en {provincia}
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {(Object.entries(VIVIENDA_CONFIG) as [TipoVivienda, typeof VIVIENDA_CONFIG["piso"]][]).map(([key, cfg]) => {
                const Icon = cfg.icon;
                return (
                  <button
                    key={key}
                    onClick={() => { setTipoVivienda(key); setConsumoMensual(cfg.consumoDefecto); }}
                    className={cn(
                      "group relative flex flex-col items-center justify-center rounded-2xl border-2 p-4 transition-all duration-300",
                      tipoVivienda === key 
                        ? "border-blue-600 bg-blue-50 text-blue-900 shadow-inner"
                        : "border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200 hover:bg-white"
                    )}
                  >
                    <Icon className={cn("mb-2 h-6 w-6 transition-transform group-hover:scale-110", tipoVivienda === key ? "text-blue-600" : "text-slate-300")} />
                    <span className="text-[10px] font-black uppercase tracking-wider text-center leading-none">{cfg.label.split(" / ")[0]}</span>
                    {tipoVivienda === key && (
                      <motion.div layoutId="housing-highlight" className="absolute -bottom-1 left-1/2 h-1 w-4 -translate-x-1/2 rounded-full bg-blue-600" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Consumption Card */}
          <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
               <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                 <Zap className="w-4 h-4 text-amber-500" />
                 Gasto Energético
               </h3>
               <div className="bg-slate-100 p-1 rounded-xl flex">
                  <button 
                    onClick={() => setInputMode("kwh")}
                    className={cn("px-4 py-1.5 rounded-lg text-[10px] font-black transition-all", inputMode === "kwh" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500")}
                  >kwh</button>
                  <button 
                    onClick={() => setInputMode("eur")}
                    className={cn("px-4 py-1.5 rounded-lg text-[10px] font-black transition-all", inputMode === "eur" ? "bg-white text-amber-600 shadow-sm" : "text-slate-500")}
                  >€/mes</button>
               </div>
            </div>

            <div className="space-y-8">
               <div className="text-center">
                  <p className="text-5xl font-black tracking-tighter text-slate-900 tabular-nums">
                    {inputMode === "kwh" ? consumoMensual : facturaMensual}
                    <span className="text-xl ml-1 text-slate-400">{inputMode === "kwh" ? "kWh" : "€"}</span>
                  </p>
               </div>
               
               <div className="relative pt-2">
                  <input 
                    type="range" 
                    min={inputMode === "kwh" ? 80 : 30} 
                    max={inputMode === "kwh" ? 1200 : 400} 
                    step={inputMode === "kwh" ? 10 : 5} 
                    value={inputMode === "kwh" ? consumoMensual : facturaMensual}
                    onChange={(e) => inputMode === "kwh" ? setConsumoMensual(+e.target.value) : setFacturaMensual(+e.target.value)}
                    className="w-full h-1.5 bg-slate-100 rounded-full appearance-none cursor-pointer accent-blue-600 hover:accent-blue-500 transition-all"
                  />
                  <div className="flex justify-between mt-3 text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                    <span>Mín</span>
                    <span>Máx</span>
                  </div>
               </div>

               <div className="rounded-2xl bg-blue-50/50 p-4 border border-blue-100 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest leading-none mb-1">Precio Luz</p>
                    <p className="text-sm font-black text-blue-900">{precioLuz.toFixed(2)}€/kWh</p>
                  </div>
                  <input 
                    type="range" min={0.10} max={0.35} step={0.01} value={precioLuz}
                    onChange={e => setPrecioLuz(+e.target.value)}
                    className="w-24 h-1.5 accent-blue-600"
                  />
               </div>
            </div>
          </div>

          {/* Battery Comparison Card */}
          <button 
            onClick={() => setConBaterias(!conBaterias)}
            className={cn(
              "w-full rounded-3xl p-6 border-2 transition-all duration-500 flex items-center justify-between group overflow-hidden relative",
              conBaterias 
                ? "bg-slate-900 border-fuchsia-500 text-white shadow-xl shadow-fuchsia-500/10" 
                : "bg-white border-slate-100 text-slate-600 hover:border-slate-200"
            )}
          >
            {conBaterias && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} className="absolute inset-0 bg-[url('/grid.svg')] pointer-events-none" />
            )}
            <div className="flex items-center gap-4 relative z-10">
              <div className={cn("p-3 rounded-2xl transition-all duration-500", conBaterias ? "bg-fuchsia-500 text-white" : "bg-slate-50 text-slate-400 group-hover:bg-slate-100")}>
                <BatteryIcon className="w-6 h-6" />
              </div>
              <div className="text-left">
                <p className={cn("text-xs font-black uppercase tracking-widest mb-0.5", conBaterias ? "text-fuchsia-400" : "text-slate-400")}>Configuración</p>
                <p className="text-lg font-black tracking-tight">{conBaterias ? "Con Baterías" : "Batería no Incluida"}</p>
              </div>
            </div>
            <div className={cn("w-12 h-6 flex items-center rounded-full px-1 transition-all relative z-10", conBaterias ? "bg-fuchsia-500" : "bg-slate-200")}>
               <motion.div 
                 animate={{ x: conBaterias ? 24 : 0 }}
                 className="h-4 w-4 rounded-full bg-white shadow-sm" 
               />
            </div>
          </button>
        </div>

        {/* ── RIGHT COLUMN: RESULTS (7 Cols) ── */}
        <div className="lg:col-span-7 space-y-8">
          {/* Main Hero Results */}
          <div className="grid grid-cols-2 gap-4">
             <motion.div 
               layout
               className="rounded-3xl bg-emerald-50 border border-emerald-100 p-6 shadow-sm flex flex-col justify-between"
             >
                <Euro className="w-5 h-5 text-emerald-600 mb-4" />
                <div>
                  <p className="text-xs font-bold text-emerald-700/60 uppercase tracking-widest mb-1">Ahorro Mensual</p>
                  <p className="text-4xl font-black text-emerald-700 tracking-tighter transition-all">
                    {Math.round(result.ahorroTotalAnual / 12)}€
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-emerald-200/50 flex items-center gap-2 text-[10px] font-bold text-emerald-800">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                   {result.ingresoExcedentes > 0 ? `Incluye ${Math.round(result.ingresoExcedentes / 12)}€ excedentes` : 'Autoconsumo óptimo'}
                </div>
             </motion.div>

             <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 flex flex-col justify-between text-white shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                <Timer className="w-5 h-5 text-blue-400 mb-4" />
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Amortización</p>
                  <p className="text-4xl font-black text-white tracking-tighter">
                    {result.amortizacion} <span className="text-xl text-slate-500">años</span>
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-800 flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                   {result.amortizacion <= 6 ? '⚡ Inversión Maestra' : '✓ Rango Estándar'}
                </div>
             </div>
          </div>

          {/* Technical Specs & Visualization */}
          <div className="rounded-[2.5rem] bg-slate-50 border border-slate-200 p-8 shadow-inner">
             <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1 w-full space-y-8">
                   <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                     <Sun className="w-4 h-4" />
                     Configuración del Sistema
                   </h3>
                   
                   <div className="grid gap-6">
                      <div className="flex items-center justify-between group">
                         <div>
                            <p className="text-xl font-black text-slate-900 leading-none mb-1 transition-transform group-hover:translate-x-1">{result.paneles} Paneles</p>
                            <p className="text-xs text-slate-500 font-medium">{PANEL_W}W · Mono-cristalinos Full Black</p>
                         </div>
                         <div className="h-12 w-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                            <Zap className="w-5 h-5 text-amber-500" />
                         </div>
                      </div>

                      <div className="flex items-center justify-between group">
                         <div>
                            <p className="text-xl font-black text-slate-900 leading-none mb-1 transition-transform group-hover:translate-x-1">{result.kwp} kWp Potencia</p>
                            <p className="text-xs text-slate-500 font-medium">Inversor de alta eficiencia incluido</p>
                         </div>
                         <div className="h-12 w-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                            <TrendingUp className="w-5 h-5 text-emerald-500" />
                         </div>
                      </div>

                      <div className="flex items-center justify-between group">
                         <div>
                            <p className="text-xl font-black text-slate-900 leading-none mb-1 transition-transform group-hover:translate-x-1">{result.costeTotal.toLocaleString("es-ES")}€ Inversión</p>
                            <p className="text-xs text-slate-500 font-medium">
                               {subvencionPct > 0 ? `Incluye ayuda del ${subvencionPct}%` : 'Presupuesto llave en mano'}
                            </p>
                         </div>
                         <div className="h-12 w-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                            <Wallet className="w-5 h-5 text-blue-500" />
                         </div>
                      </div>
                   </div>
                </div>

                {/* VISUAL CHART 25y */}
                <div className="w-full md:w-[280px] space-y-4">
                   <div className="rounded-3xl bg-white p-5 border border-slate-200 shadow-sm relative overflow-hidden h-64 flex flex-col">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">Proyección de Ahorro</p>
                      <div className="flex-1 flex items-end gap-[1px]">
                         {result.cumulativeSin.map((val, i) => {
                            const valCon = result.cumulativeCon[i];
                            const currentVal = conBaterias ? valCon : val;
                            const pct = (Math.abs(currentVal) / maxCum) * 100;
                            const isPositive = currentVal >= 0;
                            
                            return (
                               <div key={i} className="flex-1 group relative h-full flex flex-col justify-end">
                                  <motion.div 
                                    initial={{ height: 0 }}
                                    animate={{ height: `${Math.max(pct, 4)}%` }}
                                    className={cn(
                                       "w-full rounded-t-[2px] transition-colors",
                                       isPositive 
                                         ? (conBaterias ? "bg-fuchsia-400" : "bg-emerald-400")
                                         : "bg-slate-200"
                                    )}
                                  />
                                  {/* Tooltip on hover */}
                                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 hidden group-hover:block bg-slate-900 text-white text-[8px] font-bold px-2 py-1 rounded-md z-20 whitespace-nowrap shadow-xl">
                                     Año {i+1}: {Math.round(currentVal).toLocaleString()}€
                                  </div>
                               </div>
                            )
                         })}
                      </div>
                      <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                         <div className="flex items-center gap-1.5 grayscale opacity-50">
                            <div className="w-2 h-2 rounded-full bg-emerald-400" />
                            <span className="text-[8px] font-bold uppercase text-slate-500 tracking-tighter">ROI alcanzado</span>
                         </div>
                         <div className="text-[10px] font-black text-slate-300">25 AÑOS</div>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* ── SUPREME CONVERSION FUNNEL ── */}
      <div id="cta" className="relative group">
         <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 to-amber-500 rounded-[3rem] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
         <div className="relative rounded-[3rem] bg-white border border-slate-100 p-8 md:p-14 overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            
            <AnimatePresence mode="wait">
               {!formSubmitted ? (
                  <motion.div 
                    key="form-step"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    className="relative z-10 grid lg:grid-cols-2 gap-12 items-center"
                  >
                     <div className="space-y-8">
                        <div>
                           <div className="inline-flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border border-amber-100 italic">
                             <Star className="w-3 h-3 fill-amber-500" /> Oferta Limitada en {municipio}
                           </div>
                           <h3 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-[1.1] mb-6">
                              Transforma tu tejado en un <span className="text-emerald-600 italic">activo premium</span>.
                           </h3>
                           <p className="text-lg text-slate-500 font-light leading-relaxed max-w-md">
                              No solo es ahorro, es independencia. Hemos pre-calculado para tu vivienda en {provincia} un sistema que amortiza en solo <span className="text-slate-900 font-bold">{result.amortizacion} años</span>.
                           </p>
                        </div>
                        
                        <div className="space-y-4">
                           <div className="flex items-center gap-4 group">
                              <div className="h-12 w-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 group-hover:bg-emerald-50 group-hover:border-emerald-200 transition-colors">
                                 <ShieldCheck className="w-6 h-6 text-emerald-500" />
                              </div>
                              <p className="text-sm font-bold text-slate-600">Garantía de rendimiento lineal por contrato durante 25 años.</p>
                           </div>
                           <div className="flex items-center gap-4 group">
                              <div className="h-12 w-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 group-hover:bg-blue-50 group-hover:border-blue-200 transition-colors">
                                 <Activity className="w-6 h-6 text-blue-500" />
                              </div>
                              <p className="text-sm font-bold text-slate-600">Simulación técnica basada en datos meteorológicos reales (PVGIS).</p>
                           </div>
                           <div className="flex items-center gap-4 group">
                              <div className="h-12 w-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 group-hover:bg-amber-50 group-hover:border-amber-200 transition-colors">
                                 <Lock className="w-6 h-6 text-amber-500" />
                              </div>
                              <p className="text-sm font-bold text-slate-600">Tus datos están protegidos por la RGPD. Sin compromiso comercial.</p>
                           </div>
                        </div>
                     </div>

                     <div className="bg-slate-50 rounded-[2.5rem] p-8 md:p-10 border border-slate-100 shadow-inner">
                        {!showForm ? (
                           <div className="text-center space-y-6">
                              <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm text-left">
                                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Estudio Preliminar</p>
                                 <div className="space-y-2">
                                    <div className="flex justify-between items-center text-sm font-bold">
                                       <span className="text-slate-500">Paneles</span>
                                       <span className="text-slate-900">{result.paneles} x {PANEL_W}W</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm font-bold">
                                       <span className="text-slate-500">Ahorro total</span>
                                       <span className="text-emerald-600">{result.ahorro25.toLocaleString()}€</span>
                                    </div>
                                 </div>
                              </div>
                              
                              <button 
                                 onClick={() => setShowForm(true)}
                                 className="w-full bg-slate-900 hover:bg-black text-white px-10 py-5 rounded-2xl font-black text-lg transition-all shadow-2xl hover:-translate-y-1 relative group overflow-hidden"
                              >
                                 <span className="relative z-10 flex items-center justify-center gap-3">
                                    ¡Solicitar Presupuesto VIP! <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                 </span>
                                 <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                              </button>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest tracking-tight">Estudio gratuito · Sin compromiso · Datos cifrados</p>
                           </div>
                        ) : (
                           <form 
                              onSubmit={async (e) => {
                                 e.preventDefault();
                                 setFormError(null);
                                 const { nombre, telefono, email, ciudad } = formData;
                                 if (nombre.trim().length < 2) { setFormError("Danos tu nombre"); return; }
                                 const cleanPhone = telefono.replace(/\s/g, "");
                                 if (!/^[6789]\d{8}$/.test(cleanPhone)) { setFormError("Teléfono inválido"); return; }
                                 if (!email.includes("@")) { setFormError("Email inválido"); return; }
                                 
                                 setFormSubmitting(true);
                                 try {
                                    const res = await fetch("/api/leads", {
                                       method: "POST",
                                       headers: { "Content-Type": "application/json" },
                                       body: JSON.stringify({
                                          ...formData,
                                          tipo_vivienda: tipoVivienda,
                                          consumo_kwh: result.consumoAnual,
                                          municipio: municipio ?? ciudad,
                                          municipio_slug: slug ?? "",
                                          provincia: provincia ?? "",
                                          bateria: conBaterias ? "Sí" : "No",
                                          kwp: result.kwp,
                                          coste_est: result.costeTotal
                                       }),
                                    });
                                    if (res.ok) setFormSubmitted(true);
                                    else setFormError("Error al enviar");
                                 } catch {
                                    setFormError("Error de conexión");
                                 } finally {
                                    setFormSubmitting(false);
                                 }
                              }}
                              className="space-y-4"
                           >
                              <div className="grid grid-cols-2 gap-4">
                                 <input 
                                    type="text" placeholder="Nombre completo" required
                                    className="w-full bg-white border border-slate-200 rounded-xl p-4 text-sm focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                                    value={formData.nombre} onChange={(e) => setFormData(f => ({ ...f, nombre: e.target.value }))}
                                 />
                                 <input 
                                    type="tel" placeholder="Tu Teléfono" required
                                    className="w-full bg-white border border-slate-200 rounded-xl p-4 text-sm focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                                    value={formData.telefono} onChange={(e) => setFormData(f => ({ ...f, telefono: e.target.value }))}
                                 />
                              </div>
                              <input 
                                 type="email" placeholder="Email de contacto" required
                                 className="w-full bg-white border border-slate-200 rounded-xl p-4 text-sm focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                                 value={formData.email} onChange={(e) => setFormData(f => ({ ...f, email: e.target.value }))}
                              />
                              {!municipio && (
                                 <input 
                                    type="text" placeholder="Tu Ciudad" required
                                    className="w-full bg-white border border-slate-200 rounded-xl p-4 text-sm focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                                    value={formData.ciudad} onChange={(e) => setFormData(f => ({ ...f, ciudad: e.target.value }))}
                                 />
                              )}
                              
                              {formError && <p className="text-[10px] font-black text-rose-500 uppercase">{formError}</p>}
                              
                              <button 
                                 type="submit" disabled={formSubmitting}
                                 className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-emerald-600/20 disabled:opacity-50 transition-all uppercase tracking-widest text-xs"
                              >
                                 {formSubmitting ? "Enviando..." : "Enviar a Expertos →"}
                              </button>

                              <p className="text-[9px] text-slate-400 text-center leading-relaxed">
                                 Al pulsar confirmas que has leído y aceptas nuestra política de privacidad. Tus datos serán tratados exclusivamente para este estudio solar personalizado.
                              </p>
                           </form>
                        )}
                     </div>
                  </motion.div>
               ) : (
                  /* ── SUCCESS STATE ── */
                  <motion.div 
                    key="success"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center py-20 text-center space-y-6"
                  >
                     <div className="h-24 w-24 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2 }}>
                           <CheckCircle2 className="w-12 h-12" />
                        </motion.div>
                     </div>
                     <h3 className="text-4xl font-black tracking-tight">¡Solicitud VIP recibida!</h3>
                     <p className="text-slate-500 max-w-sm mx-auto leading-relaxed">
                        Un asesor experto para la zona de <span className="text-slate-900 font-bold">{municipio}</span> revisará tu estudio y te contactará en menos de 24h.
                     </p>
                     <div className="pt-4">
                        <button 
                          onClick={() => setFormSubmitted(false)}
                          className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors"
                        >
                          Volver al Simulador
                        </button>
                     </div>
                  </motion.div>
               )}
            </AnimatePresence>
         </div>
      </div>
    </div>
  );
}
