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
    <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl mt-8">
      <div className="bg-slate-900 px-6 py-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Análisis de Financiación</h2>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Comprueba si tus placas solares se pagan solas en {municipio}</p>
        </div>
      </div>

      <div className="p-6">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Controls */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="fin-costo" className="block text-sm font-bold text-slate-700">
                  Presupuesto Total Estimado
                </label>
                <span className="text-sm font-black text-indigo-700 bg-indigo-50 px-3 py-1 rounded-lg tabular-nums border border-indigo-100">
                  {costo.toLocaleString("es-ES")} €
                </span>
              </div>
              <input
                id="fin-costo"
                type="range"
                min={2000}
                max={20000}
                step={250}
                value={costo}
                onChange={(e) => setCosto(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 hover:accent-indigo-700 transition-all"
              />
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
                    Plazo de amortización (Años)
                  </label>
                  <div className="flex gap-2">
                    {[3, 5, 7, 10].map(p => (
                        <button 
                            key={p}
                            onClick={() => setPlazo(p)}
                            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${plazo === p ? "bg-indigo-600 text-white shadow-md ring-2 ring-indigo-600 ring-offset-1" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"}`}
                        >
                            {p}
                        </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="fin-tin" className="block text-xs font-bold text-slate-500 uppercase tracking-widest">
                      Tipo de Interés (TIN)
                    </label>
                    <span className="text-sm font-bold text-slate-700">{tin}%</span>
                  </div>
                  <input
                    id="fin-tin"
                    type="range"
                    min={0}
                    max={15}
                    step={0.1}
                    value={tin}
                    onChange={(e) => setTin(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-600"
                  />
                  <div className="flex justify-between mt-1 text-[10px] text-slate-400 font-medium">
                      <span>0%</span><span>15%</span>
                  </div>
                </div>
            </div>
          </div>

          {/* Visual Chart Comparison */}
          <div className="flex flex-col">
            <h3 className="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2">
              Balance Mensual (Cuota vs Ahorro)
            </h3>
            
            <div className="flex-1 flex gap-8 items-end justify-center mb-6 pt-4 h-48 border-b border-slate-200 relative">
               {/* Y-axis helper lines */}
               <div className="absolute inset-x-0 bottom-[25%] h-[1px] bg-slate-100 -z-10" />
               <div className="absolute inset-x-0 bottom-[50%] h-[1px] bg-slate-100 -z-10" />
               <div className="absolute inset-x-0 bottom-[75%] h-[1px] bg-slate-100 -z-10" />

               {/* Bank Bar */}
               <div className="w-24 flex flex-col items-center group">
                 <div className="text-xs font-bold text-slate-400 mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    Banco
                 </div>
                 <div className="text-lg font-black text-indigo-700 mb-2 tabular-nums">
                    {cuotaMensual.toFixed(0)}€
                 </div>
                 <div 
                   className="w-16 bg-gradient-to-t from-indigo-500 to-indigo-400 rounded-t-xl shadow-md transition-all duration-500 ease-out" 
                   style={{ height: `${pctCuota}%`, minHeight: '10%' }}
                 >
                   <div className="w-full h-2 bg-white/20 rounded-t-xl" />
                 </div>
                 <p className="mt-3 text-xs font-bold text-slate-600 uppercase tracking-wider text-center">Cuota Préstamo</p>
               </div>

               {/* VS Badge */}
               <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] font-black text-slate-400 absolute left-1/2 -translate-x-1/2 bottom-12 z-10 shadow-sm">
                  VS
               </div>

               {/* Savings Bar */}
               <div className="w-24 flex flex-col items-center group">
                 <div className="text-xs font-bold text-slate-400 mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    Eléctrica
                 </div>
                 <div className="text-lg font-black text-emerald-600 mb-2 tabular-nums">
                    {ahorroMensual.toFixed(0)}€
                 </div>
                 <div 
                   className="w-16 bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t-xl shadow-md transition-all duration-500 ease-out relative" 
                   style={{ height: `${pctAhorro}%`, minHeight: '10%' }}
                 >
                   <div className="w-full h-2 bg-white/20 rounded-t-xl" />
                   {esRentable && (
                       <div className="absolute -top-3 -right-3 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center shadow-sm border border-yellow-200">
                          ⭐
                       </div>
                   )}
                 </div>
                 <p className="mt-3 text-xs font-bold text-slate-600 uppercase tracking-wider text-center">Ahorro Luz</p>
               </div>
            </div>

            {/* Conclusion Message */}
            <div className={`p-4 rounded-xl border ${esRentable ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'} transition-colors`}>
                <div className="flex gap-3">
                   <div className={`mt-0.5 ${esRentable ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {esRentable ? (
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                      ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                      )}
                   </div>
                   <div>
                       <p className={`text-sm font-bold ${esRentable ? 'text-emerald-800' : 'text-rose-800'}`}>
                           {esRentable ? 'La instalación se paga sola.' : 'Alarga el plazo de financiación.'}
                       </p>
                       <p className={`text-xs mt-1 leading-snug ${esRentable ? 'text-emerald-700/80' : 'text-rose-700/80'}`}>
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
