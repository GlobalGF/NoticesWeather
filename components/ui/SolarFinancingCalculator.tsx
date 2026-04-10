"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Wallet, 
  TrendingUp, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Timer, 
  Activity,
  Zap,
  Building,
  Euro,
  Scale
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type SolarFinancingCalculatorProps = {
  municipio: string;
  costeMedio: number;
  ahorroAnual: number;
};

export function SolarFinancingCalculator({ municipio, costeMedio, ahorroAnual }: SolarFinancingCalculatorProps) {
  const [costo, setCosto] = useState<number>(costeMedio > 0 ? costeMedio : 5500);
  const [plazo, setPlazo] = useState<number>(5); // Años
  const [tin, setTin] = useState<number>(5.5); // %

  const result = useMemo(() => {
    const interesMensual = (tin / 100) / 12;
    const numPagos = plazo * 12;
    
    let cuotaMensual = 0;
    if (interesMensual > 0) {
      cuotaMensual = (costo * interesMensual * Math.pow(1 + interesMensual, numPagos)) / (Math.pow(1 + interesMensual, numPagos) - 1);
    } else {
      cuotaMensual = costo / numPagos;
    }

    const totalPagado = cuotaMensual * numPagos;
    const ahorroMensualValue = ahorroAnual / 12;
    const flujoCajaMensual = ahorroMensualValue - cuotaMensual;
    const ganancia25Anos = ahorroAnual * 25 - totalPagado;

    return {
      cuotaMensual: Math.round(cuotaMensual),
      totalPagado: Math.round(totalPagado),
      ahorroMensual: Math.round(ahorroMensualValue),
      flujoCajaMensual: Math.round(flujoCajaMensual),
      ganancia25Anos: Math.round(ganancia25Anos),
      interesesTotales: Math.round(totalPagado - costo),
      paybackAnos: Math.round((costo / ahorroAnual) * 10) / 10,
    };
  }, [costo, ahorroAnual, plazo, tin]);

  return (
    <div className="relative group mt-12">
      {/* Decorative background glow */}
      <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600/20 to-blue-600/20 rounded-[2.5rem] blur-2xl opacity-50 transition duration-1000 group-hover:opacity-75"></div>
      
      <div className="relative bg-slate-950 rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden">
        {/* Pattern overlay */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03] pointer-events-none" />
        
        {/* HEADER */}
        <div className="px-8 py-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-b from-white/[0.02] to-transparent">
           <div className="flex items-center gap-5">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 ring-1 ring-white/20">
                 <Wallet className="w-7 h-7 text-white" />
              </div>
              <div>
                 <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">Análisis de Financiación</h2>
                 <p className="text-emerald-300/60 text-sm font-medium">ROI y Rentabilidad Bancaria en {municipio}</p>
              </div>
           </div>
           
           <div className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/20 bg-emerald-500/5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Cálculo Protegido y Transparente</p>
           </div>
        </div>

        <div className="p-8 md:p-10">
           <div className="grid lg:grid-cols-12 gap-12 items-start">
              {/* CONTROLS (5 Cols) */}
              <div className="lg:col-span-12 xl:col-span-5 space-y-8">
                 <div className="grid gap-8">
                    {/* Inversión */}
                    <div className="space-y-4">
                       <div className="flex items-center justify-between">
                          <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                             <Zap className="w-3.5 h-3.5 text-amber-500" /> Presupuesto a Financiar
                          </label>
                          <span className="text-xl font-black text-white tabular-nums">{costo.toLocaleString()} <span className="text-[10px] text-slate-500">€</span></span>
                       </div>
                       <input 
                         type="range" min={2000} max={20000} step={250} value={costo}
                         onChange={(e) => setCosto(Number(e.target.value))}
                         className="w-full h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer accent-emerald-500"
                       />
                    </div>

                    {/* Plazo */}
                    <div className="space-y-4">
                       <div className="flex items-center justify-between">
                          <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                             <Timer className="w-3.5 h-3.5 text-blue-500" /> Plazo (Años)
                          </label>
                          <span className="text-xl font-black text-white tabular-nums">{plazo} <span className="text-[10px] text-slate-500">años</span></span>
                       </div>
                       <div className="grid grid-cols-4 gap-2">
                          {[3, 5, 8, 10].map(y => (
                             <button
                               key={y}
                               onClick={() => setPlazo(y)}
                               className={cn(
                                  "py-2 rounded-xl border text-xs font-bold transition-all",
                                  plazo === y
                                    ? "bg-blue-500 border-blue-400 text-white"
                                    : "bg-white/5 border-transparent text-slate-400 hover:bg-white/10"
                               )}
                             >
                               {y}a
                             </button>
                          ))}
                       </div>
                    </div>

                    {/* Interés */}
                    <div className="space-y-4">
                       <div className="flex items-center justify-between">
                          <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                             <Activity className="w-3.5 h-3.5 text-amber-500" /> Tasa de Interés (TIN)
                          </label>
                          <span className="text-xl font-black text-white tabular-nums">{tin}%</span>
                       </div>
                       <input 
                         type="range" min={0} max={15} step={0.1} value={tin}
                         onChange={(e) => setTin(Number(e.target.value))}
                         className="w-full h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer accent-amber-500"
                       />
                    </div>
                 </div>
              </div>

              {/* RESULTS (7 Cols) */}
              <div className="lg:col-span-12 xl:col-span-7">
                 <div className="grid md:grid-cols-2 gap-8">
                    {/* Visual Profitability Side */}
                    <div className="space-y-8 flex flex-col items-center">
                       {/* DIAL GAUGE */}
                       <div className="relative w-48 h-48 md:w-64 md:h-64 flex items-center justify-center">
                          <svg className="w-full h-full transform -rotate-90">
                             <circle 
                               cx="50%" cy="50%" r="45%" 
                               className="stroke-white/[0.05] fill-none" 
                               strokeWidth="12" 
                             />
                             <motion.circle 
                               cx="50%" cy="50%" r="45%" 
                               className="stroke-emerald-500 fill-none" 
                               strokeWidth="12"
                               strokeDasharray="100 100"
                               initial={{ strokeDashoffset: 100 }}
                               animate={{ strokeDashoffset: result.flujoCajaMensual > 0 ? 30 : 70 }}
                               transition={{ duration: 1.5, ease: "easeOut" }}
                               strokeLinecap="round"
                             />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                             <p className={cn("text-4xl md:text-5xl font-black tabular-nums tracking-tighter", result.flujoCajaMensual >= 0 ? "text-emerald-400" : "text-amber-400")}>
                                {result.flujoCajaMensual > 0 ? `+${result.flujoCajaMensual}` : result.flujoCajaMensual}€
                             </p>
                             <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Efectivo/Mes</p>
                          </div>
                       </div>
                       
                       {/* Comparison Summary Card */}
                       <div className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 relative overflow-hidden group">
                          <div className="flex items-center justify-between mb-6">
                             <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Balance Proyectado</p>
                             <Scale className="w-4 h-4 text-slate-700" />
                          </div>
                          
                          <div className="space-y-4">
                             <div className="flex justify-between items-center">
                                <span className="text-xs text-slate-400">Total Financiado</span>
                                <span className="text-xs font-bold text-white italic">{result.totalPagado.toLocaleString()}€</span>
                             </div>
                             <div className="flex justify-between items-center">
                                <span className="text-xs text-slate-400">Ahorro Generado</span>
                                <span className="text-xs font-bold text-emerald-400">{ (ahorroAnual * 25).toLocaleString() }€</span>
                             </div>
                             <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                                <span className="text-sm font-black text-white uppercase tracking-tight">Beneficio Neto</span>
                                <span className="text-2xl font-black text-emerald-500">{result.ganancia25Anos.toLocaleString()}€</span>
                             </div>
                          </div>
                       </div>
                    </div>

                    {/* Data List Side */}
                    <div className="grid gap-4">
                       <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col justify-between hover:bg-white/[0.08] transition-colors relative group">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Cuota Mensual</p>
                          <div className="flex items-baseline justify-between mt-2">
                             <p className="text-3xl font-black text-white tracking-tighter">{result.cuotaMensual} <span className="text-sm text-slate-500">€/mes</span></p>
                             <Euro className="w-5 h-5 text-blue-400" />
                          </div>
                          {result.flujoCajaMensual > 0 && (
                             <div className="absolute -top-2 -right-2 bg-emerald-500 text-[8px] font-black text-white px-2 py-1 rounded-full uppercase tracking-tighter shadow-lg">Autofinanciado</div>
                          )}
                       </div>

                       <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col justify-between hover:bg-white/[0.08] transition-colors">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Ahorro Mensual Luz</p>
                          <div className="flex items-baseline justify-between mt-2">
                             <p className="text-3xl font-black text-emerald-400 tracking-tighter">-{result.ahorroMensual} <span className="text-sm text-emerald-400/40">€/mes</span></p>
                             <Zap className="w-5 h-5 text-amber-500" />
                          </div>
                       </div>

                       <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col justify-between hover:bg-white/[0.08] transition-colors">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Intereses Pagados</p>
                          <div className="flex items-baseline justify-between mt-2">
                             <p className="text-3xl font-black text-white tracking-tighter">{result.interesesTotales.toLocaleString()} <span className="text-sm text-slate-500">€</span></p>
                             <Activity className="w-5 h-5 text-amber-400" />
                          </div>
                       </div>

                       <div className="bg-slate-900 border border-white/5 rounded-2xl p-6 flex flex-col justify-between shadow-inner">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">Break-Even (Contado)</p>
                          <div className="flex items-baseline justify-between mt-2">
                             <p className="text-3xl font-black text-white tracking-tighter">{result.paybackAnos} <span className="text-sm text-slate-600 font-bold uppercase">años</span></p>
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
                          <Building className="w-8 h-8 md:w-10 md:h-10 text-emerald-400" />
                       </div>
                       <div className="flex-1 text-center md:text-left">
                          <h4 className="text-lg font-black text-white tracking-tight mb-2">Presupuesto Bancario Diferenciado</h4>
                          <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-sm">Accede a líneas de crédito verde exclusivas en {municipio} con cuotas reducidas. Si tu ahorro es mayor a la cuota, la instalación se paga sola.</p>
                       </div>
                       <div className="h-12 w-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white group-hover:bg-emerald-500 group-hover:border-emerald-400 transition-all">
                          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        <div className="px-10 py-4 bg-white/[0.02] border-t border-white/5 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-600 text-center">
           ESCENARIO FINANCIERO ESTIMADO PARA {municipio} · ACTUALIZADO {new Date().toLocaleDateString("es-ES")}
        </div>
      </div>
    </div>
  );
}
