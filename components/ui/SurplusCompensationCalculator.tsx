"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Zap, 
  ArrowRight, 
  CheckCircle2, 
  Euro, 
  Sun, 
  TrendingUp,
  Activity,
  History,
  Coins,
  ArrowDownLeft,
  ShieldCheck
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type SurplusCompensationCalculatorProps = {
  municipio: string;
  irradiancia?: number; // kWh/m²/año — para estimar excedentes diarios
  precioMedioLuz?: number; // €/kWh — precio medio local
};

export function SurplusCompensationCalculator({ municipio, irradiancia = 1700, precioMedioLuz }: SurplusCompensationCalculatorProps) {
  // Estimar excedente diario basado en irradiancia local (3kWp, 78% rendimiento, 40% excedentes)
  const excedenteDiarioEstimado = Math.round((3 * irradiancia * 0.78 * 0.4) / 365);
  const [excedenteDiario, setExcedenteDiario] = useState<number>(excedenteDiarioEstimado);
  const [precioCompensacion, setPrecioCompensacion] = useState<number>(precioMedioLuz ? Math.round(precioMedioLuz * 0.45 * 100) / 100 : 0.08);

  const result = useMemo(() => {
    const ingresoDiario = excedenteDiario * precioCompensacion;
    const ingresoMensual = ingresoDiario * 30;
    const ingresoAnual = ingresoDiario * 365;

    return {
      ingresoDiario,
      ingresoMensual: Math.round(ingresoMensual),
      ingresoAnual: Math.round(ingresoAnual),
    };
  }, [excedenteDiario, precioCompensacion]);

  return (
    <div className="relative group mt-12">
      {/* Decorative background glow */}
      <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600/20 to-teal-600/20 rounded-[2.5rem] blur-2xl opacity-50 transition duration-1000 group-hover:opacity-75"></div>
      
      <div className="relative bg-slate-950 rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden">
        {/* Pattern overlay */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03] pointer-events-none" />
        
        {/* HEADER */}
        <div className="px-8 py-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-b from-white/[0.02] to-transparent">
           <div className="flex items-center gap-5">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 ring-1 ring-white/20">
                 <Coins className="w-7 h-7 text-white" />
              </div>
              <div>
                 <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">Estrategia de Excedentes</h2>
                 <p className="text-emerald-300/60 text-sm font-medium">Maximización de Compensación en {municipio}</p>
              </div>
           </div>
           
           <div className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/20 bg-emerald-500/5">
              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Referencia Transparente OMIE</p>
           </div>
        </div>

        <div className="p-8 md:p-10">
           <div className="grid lg:grid-cols-12 gap-12 items-start">
              {/* CONTROLS (5 Cols) */}
              <div className="lg:col-span-12 xl:col-span-5 space-y-8">
                 <div className="grid gap-8">
                    {/* Excedente */}
                    <div className="space-y-4">
                       <div className="flex items-center justify-between">
                          <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                             <Zap className="w-3.5 h-3.5 text-amber-500" /> Energía Volcada a Red
                          </label>
                          <span className="text-xl font-black text-white tabular-nums">{excedenteDiario} <span className="text-[10px] text-slate-500">kWh/día</span></span>
                       </div>
                       <input 
                         type="range" min={1} max={50} step={1} value={excedenteDiario}
                         onChange={(e) => setExcedenteDiario(Number(e.target.value))}
                         className="w-full h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer accent-emerald-500"
                       />
                       <div className="flex justify-between text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                          <span>Mín</span>
                          <span>Máx (50 kWh)</span>
                       </div>
                    </div>

                    {/* Precio Compensacion */}
                    <div className="space-y-4">
                       <div className="flex items-center justify-between">
                          <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                             <TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> Precio Compensación
                          </label>
                          <span className="text-xl font-black text-emerald-400 tabular-nums">{precioCompensacion.toFixed(3)} <span className="text-[10px] text-emerald-400/40">€/kWh</span></span>
                       </div>
                       <input 
                         type="range" min={0.03} max={0.25} step={0.005} value={precioCompensacion}
                         onChange={(e) => setPrecioCompensacion(Number(e.target.value))}
                         className="w-full h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer accent-emerald-400"
                       />
                       <div className="rounded-2xl bg-white/5 p-4 border border-white/10 flex items-start gap-3">
                          <Activity className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                          <p className="text-[10px] font-medium text-slate-400 leading-relaxed uppercase tracking-tight">
                             El precio en <span className="text-white font-bold">{municipio}</span> suele variar entre 0.04€ y 0.12€. Algunas comercializadoras ofrecen "Batería Virtual" para compensar la factura a 0€.
                          </p>
                       </div>
                    </div>
                 </div>
              </div>

              {/* RESULTS (7 Cols) */}
              <div className="lg:col-span-12 xl:col-span-7">
                 <div className="grid md:grid-cols-2 gap-8">
                    {/* Visual Cashflow Side */}
                    <div className="space-y-8">
                        {/* FLOW VISUALIZATION */}
                        <div className="relative w-full min-h-[350px] md:aspect-video flex flex-col items-center justify-between bg-white/[0.02] border border-white/5 rounded-[2.5rem] group/viz px-8 py-10 lg:py-12">
                           <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent rounded-[2.5rem]" />
                           
                           {/* TOP RESULT */}
                           <div className="text-center relative z-20">
                              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-2">Ahorro Mensual Estimado</p>
                              <div className="relative inline-block">
                                 <div className="absolute -inset-8 bg-emerald-500/10 blur-2xl opacity-0 group-hover/viz:opacity-100 transition-opacity duration-1000" />
                                 <p className="text-4xl md:text-6xl font-black text-white tabular-nums tracking-tighter relative">+{result.ingresoMensual}€</p>
                              </div>
                           </div>

                           {/* THE FLOW */}
                           <div className="relative w-full flex items-center justify-between gap-4 max-w-sm mt-auto">
                              {/* Particles container */}
                              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                 <AnimatePresence>
                                    {[...Array(3)].map((_, i) => (
                                       <motion.div 
                                          key={i}
                                          animate={{ 
                                             x: [-120, 120], 
                                             opacity: [0, 1, 0],
                                             scale: [0.5, 1.2, 0.5]
                                          }}
                                          transition={{ 
                                             repeat: Infinity, 
                                             duration: 2.5, 
                                             delay: i * 0.8,
                                             ease: "easeInOut"
                                          }}
                                          className="absolute h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.8)]"
                                       />
                                    ))}
                                 </AnimatePresence>
                              </div>

                              <div className="flex flex-col items-center gap-3 relative z-10">
                                 <div className="h-16 w-16 md:h-20 md:w-20 rounded-3xl bg-slate-900 border border-white/10 flex items-center justify-center shadow-2xl group-hover/viz:border-emerald-500/40 transition-colors">
                                    <Sun className="w-8 h-8 md:w-10 md:h-10 text-amber-500" />
                                 </div>
                                 <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Excedente</p>
                              </div>

                              <div className="flex flex-col items-center gap-3 relative z-10">
                                 <div className="h-16 w-16 md:h-20 md:w-20 rounded-3xl bg-slate-900 border border-white/10 flex items-center justify-center shadow-2xl group-hover/viz:border-emerald-500/40 transition-colors">
                                    <ArrowDownLeft className="w-8 h-8 md:w-10 md:h-10 text-emerald-500" />
                                 </div>
                                 <p className="text-[9px] font-black uppercase tracking-widest text-emerald-400">Factura</p>
                              </div>
                           </div>
                        </div>
                       
                       {/* Annual Shield Card */}
                       <div className="w-full bg-slate-900 border border-white/5 rounded-3xl p-6 flex items-center justify-between text-white shadow-xl group">
                          <div className="flex-1">
                             <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-1 flex items-center gap-1.5">
                                <CheckCircle2 className="w-3 h-3" /> Escudo Energético Año 1
                             </p>
                             <p className="text-2xl font-black">-{result.ingresoAnual}€ <span className="text-xs text-slate-400 font-medium tracking-normal">en tu factura</span></p>
                          </div>
                          <History className="w-10 h-10 text-slate-700 group-hover:rotate-[-45deg] transition-transform duration-700" />
                       </div>
                    </div>

                    {/* Data List Side */}
                    <div className="grid gap-4">
                       <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col justify-between hover:bg-white/[0.08] transition-colors relative group">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Ahorro Diario Red</p>
                          <div className="flex items-baseline justify-between mt-2">
                             <p className="text-3xl font-black text-white tracking-tighter">+{result.ingresoDiario.toFixed(2)} <span className="text-sm text-slate-500">€</span></p>
                             <Euro className="w-5 h-5 text-emerald-400" />
                          </div>
                       </div>

                       <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col justify-between hover:bg-white/[0.08] transition-colors">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Valor Excedente Anual</p>
                          <div className="flex items-baseline justify-between mt-2">
                             <p className="text-3xl font-black text-emerald-400 tracking-tighter">{result.ingresoAnual.toLocaleString()} <span className="text-sm text-emerald-400/40">€/año</span></p>
                             <TrendingUp className="w-5 h-5 text-emerald-400" />
                          </div>
                       </div>

                       <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col justify-between hover:bg-white/[0.08] transition-colors">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Equivalencia Almacenada</p>
                          <div className="flex items-baseline justify-between mt-2">
                             <p className="text-3xl font-black text-white tracking-tighter">{(excedenteDiario * 365).toLocaleString()} <span className="text-sm text-slate-500">kWh</span></p>
                             <Activity className="w-5 h-5 text-amber-400" />
                          </div>
                       </div>

                       <div className="bg-slate-900 border border-white/5 rounded-2xl p-6 flex flex-col justify-between shadow-inner">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">Impacto en ROI</p>
                          <div className="flex items-baseline justify-between mt-2">
                             <p className="text-3xl font-black text-white tracking-tighter">✓ Acelerado</p>
                             <ShieldCheck className="w-5 h-5 text-blue-500" />
                          </div>
                       </div>
                    </div>
                 </div>

                 {/* CTA / BANNER */}
                 <div className="mt-8 relative group cursor-pointer overflow-hidden rounded-2xl border border-white/10 transition-all hover:border-emerald-500/50">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent pointer-events-none" />
                    <div className="p-6 md:p-8 flex flex-col md:flex-row items-center gap-8 bg-slate-900/50">
                       <div className="h-16 w-16 md:h-20 md:w-20 rounded-[1.5rem] bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                          <ArrowDownLeft className="w-8 h-8 md:w-10 md:h-10 text-emerald-400" />
                       </div>
                       <div className="flex-1 text-center md:text-left">
                          <h4 className="text-lg font-black text-white tracking-tight mb-2">Activa tu "Batería Virtual" en {municipio}</h4>
                          <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-sm">No pierdas ni un solo vatio. Hemos seleccionado las comercializadoras en {municipio} con los mejores precios de excedentes y servicios de hucha solar para llevar tu factura a <span className="text-white font-bold">0 €</span>.</p>
                       </div>
                       <div className="h-12 w-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white group-hover:bg-emerald-500 group-hover:border-emerald-400 transition-all">
                          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        <div className="px-10 py-4 bg-white/[0.02] border-t border-white/5 text-[9px] font-black uppercase tracking-[0.2em] text-slate-600 text-center">
           ANÁLISIS DE MONETIZACIÓN ESTIMADO PARA {municipio} · DATOS PVGIS 2026
        </div>
      </div>
    </div>
  );
}
