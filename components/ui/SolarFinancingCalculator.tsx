"use client";

import { useState } from "react";

type SolarFinancingCalculatorProps = {
  municipio: string;
  costeMedio: number;
  ahorroAnual: number;
};

export function SolarFinancingCalculator({ municipio, costeMedio, ahorroAnual }: SolarFinancingCalculatorProps) {
  const [costo, setCosto] = useState<number>(costeMedio > 0 ? costeMedio : 5500);
  const [plazo, setPlazo] = useState<number>(5); // Años
  const [tin, setTin] = useState<number>(5.5); // %
  
  const ahorroMensual = ahorroAnual / 12;

  // Fórmula de amortización francesa
  const r = (tin / 100) / 12;
  const n = plazo * 12;
  const cuotaMensual = costo > 0 && n > 0 && r > 0
    ? (costo * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
    : (costo / n);

  const totalPagado = cuotaMensual * n;
  const esRentable = ahorroMensual >= cuotaMensual;

  // Calculo de proporciones para el gráfico de barras CSS
  const maxVal = Math.max(ahorroMensual, cuotaMensual);
  const pctAhorro = maxVal > 0 ? (ahorroMensual / maxVal) * 100 : 0;
  const pctCuota = maxVal > 0 ? (cuotaMensual / maxVal) * 100 : 0;

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/50 shadow-2xl overflow-hidden transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] relative mt-8">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/20 via-transparent to-transparent pointer-events-none"></div>

      <div className="bg-slate-900/95 backdrop-blur-md px-4 md:px-6 py-4 md:py-5 flex items-center gap-3 md:gap-4 relative z-10 border-b border-slate-800/60">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/30 to-indigo-600/10 text-indigo-400 border border-indigo-500/20 shadow-inner">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
        </div>
        <div>
          <h2 className="text-lg md:text-2xl font-black text-white tracking-tight">Análisis de Financiación</h2>
          <p className="text-xs md:text-sm text-indigo-200/70 font-medium mt-0.5">Comprueba si tus placas solares se pagan solas en {municipio}</p>
        </div>
      </div>

      <div className="p-4 md:p-8 relative z-10">
        <div className="grid gap-6 md:gap-10 lg:grid-cols-2 lg:gap-12">
          {/* Controls */}
          <div className="space-y-6 md:space-y-8">
            <div className="bg-slate-50/50 p-4 md:p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-400/5 rounded-full blur-2xl -translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <label htmlFor="fin-costo" className="block text-sm font-bold text-slate-700">
                    Presupuesto Total Estimado
                  </label>
                  <div className="flex items-baseline gap-1 bg-white px-3 py-1.5 rounded-lg shadow-sm border border-indigo-100 ring-1 ring-indigo-50">
                    <span className="text-xl font-black text-indigo-700 tabular-nums leading-none">{costo.toLocaleString("es-ES")}</span>
                    <span className="text-xs font-bold text-indigo-600/60">€</span>
                  </div>
                </div>
                <input
                  id="fin-costo"
                  type="range"
                  min={2000}
                  max={20000}
                  step={250}
                  value={costo}
                  onChange={(e) => setCosto(Number(e.target.value))}
                  className="w-full h-2.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-indigo-600 hover:accent-indigo-500 transition-all shadow-inner"
                />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-8 relative overflow-hidden">
                <div className="absolute bottom-0 right-0 w-40 h-40 bg-slate-400/5 rounded-full blur-3xl translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
                <div className="relative z-10">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    Plazo de amortización (Años)
                  </label>
                  <div className="flex gap-2 sm:gap-3">
                    {[3, 5, 7, 10].map(p => (
                        <button 
                            key={p}
                            onClick={() => setPlazo(p)}
                            className={`flex flex-col items-center justify-center flex-1 py-3 text-lg tabular-nums font-black rounded-xl transition-all duration-300 ${plazo === p ? "bg-gradient-to-b from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/30 scale-105 border-0" : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 hover:border-slate-300"}`}
                        >
                            {p}
                        </button>
                    ))}
                  </div>
                </div>

                <div className="relative z-10 pt-6 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-4">
                    <label htmlFor="fin-tin" className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                      Tipo de Interés (TIN)
                    </label>
                    <div className="bg-slate-50 px-3 py-1 rounded-md border border-slate-200">
                      <span className="text-sm font-black text-slate-700">{tin.toFixed(1)}%</span>
                    </div>
                  </div>
                  <input
                    id="fin-tin"
                    type="range"
                    min={0}
                    max={15}
                    step={0.1}
                    value={tin}
                    onChange={(e) => setTin(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-slate-700 hover:accent-slate-600 transition-all shadow-inner"
                  />
                  <div className="flex justify-between mt-2 text-[10px] text-slate-400 font-bold px-1">
                      <span>0%</span><span>15%</span>
                  </div>
                </div>
            </div>
          </div>

          {/* Visual Chart Comparison */}
          <div className="flex flex-col bg-slate-50/50 rounded-3xl p-6 md:p-8 border border-slate-100 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] relative overflow-hidden">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-8 flex items-center justify-center gap-2">
              Balance Mensual
            </h3>
            
            <div className="flex-1 flex gap-12 sm:gap-16 items-end justify-center mb-8 h-48 sm:h-56 relative z-10">
               {/* Grid lines */}
               <div className="absolute inset-x-0 bottom-0 h-[1px] bg-slate-300" />
               <div className="absolute inset-x-0 bottom-[25%] h-[1px] bg-slate-200 border-dashed" />
               <div className="absolute inset-x-0 bottom-[50%] h-[1px] bg-slate-200 border-dashed" />
               <div className="absolute inset-x-0 bottom-[75%] h-[1px] bg-slate-200 border-dashed" />
               <div className="absolute inset-x-0 bottom-[100%] h-[1px] bg-slate-200 border-dashed" />

               {/* Bank Bar */}
               <div className="w-20 sm:w-24 flex flex-col items-center group relative z-10">
                 <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transform group-hover:-translate-y-2 transition-all duration-300 pointer-events-none">
                   <div className="bg-slate-900 text-white text-[10px] font-bold py-1 px-3 rounded-md whitespace-nowrap shadow-lg">Cuota Bancaria</div>
                   <div className="w-2 h-2 bg-slate-900 rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2"></div>
                 </div>
                 <div className="text-2xl font-black text-indigo-700 mb-2 tabular-nums drop-shadow-sm">
                    {cuotaMensual.toFixed(0)}<span className="text-sm">€</span>
                 </div>
                 <div 
                   className="w-full bg-gradient-to-t from-indigo-500 to-indigo-400 rounded-t-2xl shadow-[0_0_15px_rgba(99,102,241,0.4)] transition-all duration-700 ease-out" 
                   style={{ height: `${pctCuota}%`, minHeight: '12%' }}
                 >
                   <div className="w-full h-3 bg-white/20 rounded-t-2xl" />
                 </div>
                 <p className="mt-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Cuota Préstamo</p>
               </div>

               {/* VS Badge */}
               <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[10px] font-black text-slate-400 absolute left-1/2 -translate-x-1/2 bottom-12 z-20 shadow-md transform -translate-y-4">
                  VS
               </div>

               {/* Savings Bar */}
               <div className="w-20 sm:w-24 flex flex-col items-center group relative z-10">
                 <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transform group-hover:-translate-y-2 transition-all duration-300 pointer-events-none">
                   <div className="bg-slate-900 text-white text-[10px] font-bold py-1 px-3 rounded-md whitespace-nowrap shadow-lg">Ahorro en Factura</div>
                   <div className="w-2 h-2 bg-slate-900 rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2"></div>
                 </div>
                 <div className="text-2xl font-black text-emerald-600 mb-2 tabular-nums drop-shadow-sm">
                    {ahorroMensual.toFixed(0)}<span className="text-sm">€</span>
                 </div>
                 <div 
                   className="w-full bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t-2xl shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all duration-700 ease-out relative" 
                   style={{ height: `${pctAhorro}%`, minHeight: '12%' }}
                 >
                   <div className="w-full h-3 bg-white/20 rounded-t-2xl" />
                   {esRentable && (
                       <div className="absolute -top-4 -right-4 w-10 h-10 bg-gradient-to-br from-yellow-300 to-amber-400 rounded-full flex items-center justify-center shadow-lg border-2 border-white transform rotate-12 animate-[bounce_2s_infinite]">
                          ⭐
                       </div>
                   )}
                 </div>
                 <p className="mt-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Ahorro Luz</p>
               </div>
            </div>

            {/* Conclusion Message */}
            <div className={`mt-auto p-5 rounded-2xl border backdrop-blur-sm ${esRentable ? 'bg-emerald-50/80 border-emerald-100 shadow-[0_8px_20px_rgba(16,185,129,0.08)]' : 'bg-rose-50/80 border-rose-100 shadow-[0_8px_20px_rgba(244,63,94,0.08)]'} transition-colors relative z-10`}>
                <div className="flex gap-4">
                   <div className={`mt-1 bg-white p-2 rounded-xl shadow-sm border ${esRentable ? 'text-emerald-500 border-emerald-100' : 'text-rose-500 border-rose-100'}`}>
                      {esRentable ? (
                          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                      ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                      )}
                   </div>
                   <div>
                       <p className={`text-base font-black tracking-tight mb-1 ${esRentable ? 'text-emerald-800' : 'text-rose-800'}`}>
                           {esRentable ? 'La instalación se paga sola.' : 'Alarga el plazo de financiación'}
                       </p>
                       <p className={`text-sm leading-relaxed ${esRentable ? 'text-emerald-700/80' : 'text-rose-700/80'}`}>
                           {esRentable 
                               ? `El ahorro mensual en tu factura de luz supera a la cuota del banco. Te quedarán unos ${(ahorroMensual - cuotaMensual).toFixed(2)}€ a tu favor cada mes desde el día 1.` 
                               : `Para que la subida del recibo no afecte tu economía diaria en ${municipio}, intenta elegir un plazo de ${plazo < 10 ? 'más años' : 'financiación alternativo'}.`}
                       </p>
                   </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
