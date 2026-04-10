"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Battery as BatteryIcon, 
  Zap, 
  Sun, 
  ArrowRight, 
  ShieldCheck, 
  TrendingUp, 
  Info,
  Layers,
  Activity,
  Timer,
  CheckCircle2,
  Euro
} from "lucide-react";
import {
  calculateBatteryRecommendation,
  type TariffType
} from "@/calculators/battery-calculator";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type Props = {
  municipio: string;
  annualSunHours: number;
};

export function BatteryNeedsCalculator({ municipio, annualSunHours }: Props) {
  const [monthlyConsumption, setMonthlyConsumption] = useState(350);
  const [installationPower, setInstallationPower] = useState(4.5);
  const [tariff, setTariff] = useState<TariffType>("2.0TD");
  const [sunHoursPerDay, setSunHoursPerDay] = useState(Number((annualSunHours / 365).toFixed(2)));

  const result = useMemo(
    () =>
      calculateBatteryRecommendation({
        monthlyConsumptionKwh: monthlyConsumption,
        installationPowerKw: installationPower,
        tariff,
        sunHoursPerDay
      }),
    [monthlyConsumption, installationPower, tariff, sunHoursPerDay]
  );

  return (
    <div className="relative group mt-12">
      {/* Decorative background glow */}
      <div className="absolute -inset-1 bg-gradient-to-r from-fuchsia-600/20 to-purple-600/20 rounded-[2.5rem] blur-2xl opacity-50 transition duration-1000 group-hover:opacity-75"></div>
      
      <div className="relative bg-slate-950 rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden">
        {/* Pattern overlay */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03] pointer-events-none" />
        
        {/* HEADER */}
        <div className="px-8 py-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-b from-white/[0.02] to-transparent">
           <div className="flex items-center gap-5">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center shadow-lg shadow-fuchsia-500/20 ring-1 ring-white/20">
                 <BatteryIcon className="w-7 h-7 text-white" />
              </div>
              <div>
                 <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">Ecosistema de Almacenamiento</h2>
                 <p className="text-fuchsia-300/60 text-sm font-medium">Dimensionamiento físico y financiero para {municipio}</p>
              </div>
           </div>
           
           <div className="hidden lg:flex items-center gap-3 px-4 py-2 rounded-full border border-fuchsia-500/20 bg-fuchsia-500/5">
              <ShieldCheck className="w-3.5 h-3.5 text-fuchsia-400" />
              <p className="text-[10px] font-black uppercase tracking-widest text-fuchsia-400">Dimensionamiento Seguro y Privado</p>
           </div>
        </div>

        <div className="p-8 md:p-10">
           <div className="grid lg:grid-cols-12 gap-12 items-start">
              {/* CONTROLS (5 Cols) */}
              <div className="lg:col-span-12 xl:col-span-5 space-y-8">
                 <div className="grid gap-8">
                    {/* Consumo */}
                    <div className="space-y-4">
                       <div className="flex items-center justify-between">
                          <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                             <Activity className="w-3.5 h-3.5 text-fuchsia-500" /> Consumo Mensual
                          </label>
                          <span className="text-xl font-black text-white tabular-nums">{monthlyConsumption} <span className="text-[10px] text-slate-500">kWh</span></span>
                       </div>
                       <input 
                         type="range" min={50} max={1500} step={50} value={monthlyConsumption}
                         onChange={(e) => setMonthlyConsumption(Number(e.target.value))}
                         className="w-full h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer accent-fuchsia-500"
                       />
                    </div>

                    {/* Potencia */}
                    <div className="space-y-4">
                       <div className="flex items-center justify-between">
                          <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                             <Sun className="w-3.5 h-3.5 text-amber-500" /> Potencia Fotovoltaica
                          </label>
                          <span className="text-xl font-black text-white tabular-nums">{installationPower} <span className="text-[10px] text-slate-500">kWp</span></span>
                       </div>
                       <input 
                         type="range" min={1} max={10} step={0.1} value={installationPower}
                         onChange={(e) => setInstallationPower(Number(e.target.value))}
                         className="w-full h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer accent-amber-500"
                       />
                    </div>

                    {/* Horas Sol */}
                    <div className="space-y-4">
                       <div className="flex items-center justify-between">
                          <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                             <Timer className="w-3.5 h-3.5 text-blue-500" /> Horas Sol Efectivas
                          </label>
                          <span className="text-xl font-black text-white tabular-nums">{sunHoursPerDay} <span className="text-[10px] text-slate-500">h/día</span></span>
                       </div>
                       <input 
                         type="range" min={1} max={12} step={0.1} value={sunHoursPerDay}
                         onChange={(e) => setSunHoursPerDay(Number(e.target.value))}
                         className="w-full h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer accent-blue-500"
                       />
                    </div>

                    {/* Tarifa */}
                    <div className="pt-6 border-t border-white/5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-3">Modalidad de Facturación</label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                           {(["2.0TD", "indexada", "fija"] as TariffType[]).map(t => (
                              <button
                                key={t}
                                onClick={() => setTariff(t)}
                                className={cn(
                                   "py-3 px-2 rounded-xl border-2 text-[10px] font-black uppercase tracking-tighter transition-all",
                                   tariff === t 
                                     ? "bg-fuchsia-500/10 border-fuchsia-500 text-fuchsia-400 shadow-[0_0_20px_rgba(232,121,249,0.1)]"
                                     : "bg-white/5 border-transparent text-slate-400 hover:bg-white/10"
                                )}
                              >
                                {t === "2.0TD" ? "Estándar 2.0" : t === "indexada" ? "Mercado PVPC" : "Tarifa Plana"}
                              </button>
                           ))}
                        </div>
                    </div>
                 </div>
              </div>

              {/* RESULTS (7 Cols) */}
              <div className="lg:col-span-12 xl:col-span-7">
                 <div className="grid md:grid-cols-2 gap-8">
                    {/* Visual Gauge Side */}
                    <div className="space-y-8 flex flex-col items-center">
                       {/* INDEPENDENCE GAUGE */}
                       <div className="relative w-48 h-48 md:w-64 md:h-64 flex items-center justify-center">
                          <svg className="w-full h-full transform -rotate-90">
                             <circle 
                               cx="50%" cy="50%" r="45%" 
                               className="stroke-white/[0.05] fill-none" 
                               strokeWidth="8" 
                             />
                             <motion.circle 
                               cx="50%" cy="50%" r="45%" 
                               className="stroke-fuchsia-500 fill-none" 
                               strokeWidth="8"
                               strokeDasharray="100 100"
                               initial={{ strokeDashoffset: 100 }}
                               animate={{ strokeDashoffset: 100 - result.energyIndependencePct }}
                               transition={{ duration: 1.5, ease: "easeOut" }}
                               strokeLinecap="round"
                             />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                             <p className="text-4xl md:text-6xl font-black text-white tabular-nums tracking-tighter">{result.energyIndependencePct}%</p>
                             <p className="text-[10px] font-black uppercase tracking-widest text-fuchsia-400/80">Independencia</p>
                          </div>
                       </div>
                       
                       {/* Battery Stack Visualization */}
                       <div className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 relative overflow-hidden group">
                          <div className="absolute top-0 right-0 p-4">
                             <Layers className="w-4 h-4 text-slate-700" />
                          </div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-6">Módulos Físicos (LFP)</p>
                          <div className="flex flex-wrap gap-2 justify-center">
                             <AnimatePresence>
                                {[...Array(Math.max(result.recommendedBatteries, 1))].map((_, i) => (
                                   <motion.div 
                                      key={i}
                                      initial={{ opacity: 0, scale: 0.5, y: 20 }}
                                      animate={{ opacity: 1, scale: 1, y: 0 }}
                                      exit={{ opacity: 0, scale: 0.5, y: -20 }}
                                      transition={{ delay: i * 0.1 }}
                                      className="w-12 h-6 md:w-16 md:h-8 rounded-lg bg-gradient-to-br from-fuchsia-500 to-purple-600 shadow-lg shadow-fuchsia-500/20 flex items-center justify-center border border-white/20"
                                   >
                                      <div className="w-1/2 h-0.5 bg-white/30 rounded-full" />
                                   </motion.div>
                                ))}
                             </AnimatePresence>
                          </div>
                          <p className="text-center mt-6 text-xl font-black text-white">{result.recommendedBatteries} Módulos <span className="text-xs text-slate-500 font-bold tracking-normal">× 5kWh cada uno</span></p>
                       </div>
                    </div>

                    {/* Data List Side */}
                    <div className="grid gap-4">
                       <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col justify-between hover:bg-white/[0.08] transition-colors">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Capacidad Total</p>
                          <div className="flex items-baseline justify-between mt-2">
                             <p className="text-3xl font-black text-white tracking-tighter">{result.requiredCapacityKwh.toLocaleString()} <span className="text-sm text-slate-500">kWh</span></p>
                             <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                          </div>
                       </div>

                       <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col justify-between hover:bg-white/[0.08] transition-colors">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Ahorro Extra Anual</p>
                          <div className="flex items-baseline justify-between mt-2">
                             <p className="text-3xl font-black text-emerald-400 tracking-tighter">+{result.estimatedAnnualSavingsEur.toLocaleString()} <span className="text-sm text-emerald-400/40">€</span></p>
                             <TrendingUp className="w-5 h-5 text-emerald-400" />
                          </div>
                       </div>

                       <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col justify-between hover:bg-white/[0.08] transition-colors">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Inversión Estimada</p>
                          <div className="flex items-baseline justify-between mt-2">
                             <p className="text-3xl font-black text-white tracking-tighter">{result.estimatedCostEur.toLocaleString()} <span className="text-sm text-slate-500">€</span></p>
                             <Euro className="w-5 h-5 text-fuchsia-500" />
                          </div>
                       </div>

                       <div className="bg-slate-900 border border-white/5 rounded-2xl p-6 flex flex-col justify-between shadow-inner">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">Periodo Retorno</p>
                          <div className="flex items-baseline justify-between mt-2">
                             <p className="text-3xl font-black text-white tracking-tighter">{result.paybackYears} <span className="text-sm text-slate-600 font-bold uppercase">años</span></p>
                             <ShieldCheck className="w-5 h-5 text-blue-500" />
                          </div>
                       </div>
                    </div>
                 </div>

                 {/* CTA / BANNER */}
                 <div className="mt-8 relative group cursor-pointer">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-fuchsia-500 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition cursor-default"></div>
                    <div className="relative bg-slate-900 border border-white/10 rounded-2xl p-6 flex items-center justify-between gap-6 transition-all group-hover:bg-slate-800/80 overflow-hidden">
                       <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-500/5 to-transparent pointer-events-none" />
                       <div className="flex-1">
                          <h4 className="text-white font-black tracking-tight mb-1">Optimiza tu independencia en {municipio}</h4>
                          <p className="text-xs text-slate-400 font-medium leading-relaxed">Combinando tu producción fotovoltaica con {result.requiredCapacityKwh}kWh de almacenamiento, cubrirás casi el <span className="text-fuchsia-400 font-bold">{result.energyIndependencePct}%</span> de tu consumo anual.</p>
                       </div>
                       <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white group-hover:bg-fuchsia-500 group-hover:border-fuchsia-400 transition-all">
                          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        <div className="px-10 py-4 bg-white/[0.02] border-t border-white/5 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-600 text-center">
           ESTUDIO PRELIMINAR GENERADO PARA {municipio} · DATOS PVGIS 2026 · {new Date().toLocaleDateString("es-ES")}
        </div>
      </div>
    </div>
  );
}
