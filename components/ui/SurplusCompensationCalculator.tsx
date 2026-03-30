"use client";

import { useState } from "react";

type SurplusCompensationCalculatorProps = {
  municipio: string;
};

export function SurplusCompensationCalculator({ municipio }: SurplusCompensationCalculatorProps) {
  const [excedenteDiario, setExcedenteDiario] = useState<number>(8); // kWh
  const [precioCompensacion, setPrecioCompensacion] = useState<number>(0.08); // €/kWh

  const ingresoDiario = excedenteDiario * precioCompensacion;
  const ingresoMensual = ingresoDiario * 30;
  const ingresoAnual = ingresoDiario * 365;

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/50 shadow-2xl overflow-hidden transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] relative mt-8">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/20 via-transparent to-transparent pointer-events-none"></div>

      <div className="bg-slate-900/95 backdrop-blur-md px-4 md:px-6 py-4 md:py-5 flex items-center gap-3 md:gap-4 relative z-10 border-b border-slate-800/60">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/30 to-emerald-600/10 text-emerald-400 border border-emerald-500/20 shadow-inner">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
        </div>
        <div>
          <h2 className="text-lg md:text-2xl font-black text-white tracking-tight">Monetización de Excedentes</h2>
          <p className="text-xs md:text-sm text-emerald-200/70 font-medium mt-0.5">Calcula tus ingresos por verter energía sobrante a la red en {municipio}</p>
        </div>
      </div>

      <div className="p-6 md:p-8 relative z-10">
        <div className="grid gap-8 md:grid-cols-2 lg:gap-12">
          {/* Controls */}
          <div className="space-y-8 flex flex-col justify-center">
            <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <label htmlFor="exc-diario" className="block text-sm font-bold text-slate-700">
                    Energía sobrante volcada
                  </label>
                  <div className="flex items-baseline gap-1 bg-white px-3 py-1.5 rounded-lg shadow-sm border border-emerald-100 ring-1 ring-emerald-50">
                    <span className="text-xl font-black text-emerald-600 tabular-nums leading-none">{excedenteDiario}</span>
                    <span className="text-xs font-bold text-emerald-600/60">kWh/día</span>
                  </div>
                </div>
                <input
                  id="exc-diario"
                  type="range"
                  min={1}
                  max={40}
                  step={1}
                  value={excedenteDiario}
                  onChange={(e) => setExcedenteDiario(Number(e.target.value))}
                  className="w-full h-2.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-emerald-500 hover:accent-emerald-400 transition-all shadow-inner"
                />
                <div className="flex justify-between mt-3 text-[10px] text-slate-400 font-bold uppercase tracking-wider px-1">
                  <span>1 kWh</span>
                  <span>40 kWh</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-slate-400/5 rounded-full blur-2xl translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <label htmlFor="exc-precio" className="block text-sm font-bold text-slate-700">
                    Precio de compensación
                  </label>
                  <div className="flex items-baseline gap-1 bg-white px-3 py-1.5 rounded-lg shadow-sm border border-slate-200">
                    <span className="text-xl font-black text-slate-700 tabular-nums leading-none">{precioCompensacion.toFixed(3)}</span>
                    <span className="text-xs font-bold text-slate-400">€/kWh</span>
                  </div>
                </div>
                <input
                  id="exc-precio"
                  type="range"
                  min={0.03}
                  max={0.20}
                  step={0.01}
                  value={precioCompensacion}
                  onChange={(e) => setPrecioCompensacion(Number(e.target.value))}
                  className="w-full h-2.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-slate-600 hover:accent-slate-500 transition-all shadow-inner"
                />
                <div className="flex justify-between mt-3 text-[10px] text-slate-400 font-bold uppercase tracking-wider px-1 mb-4">
                  <span>0.03 €</span>
                  <span>0.20 €</span>
                </div>
                <div className="flex items-start gap-2 text-xs text-slate-500 font-medium bg-white/60 backdrop-blur-sm p-3 rounded-xl border border-slate-100 shadow-sm">
                  <span className="text-base shrink-0">💡</span>
                  <p className="leading-relaxed">La media del mercado mayorista oscila entre <strong>0.05€ y 0.10€</strong> según la comercializadora.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Receipt View */}
          <div className="bg-white rounded-3xl p-1 border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative">
            <div className="bg-slate-50/50 rounded-[1.4rem] h-full p-6 md:p-8 flex flex-col relative overflow-hidden">
               
               {/* Dynamic background rings */}
               <div className="absolute -right-20 -top-20 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none transition-all duration-700" 
                    style={{ transform: `scale(${1 + (ingresoMensual / 100)})` }} />
               <div className="absolute -left-10 bottom-20 w-40 h-40 bg-teal-400/5 rounded-full blur-2xl pointer-events-none" />

               <div className="flex items-center gap-3 border-b border-slate-200/80 pb-5 mb-6 relative z-10">
                   <div className="bg-white p-2 rounded-lg shadow-sm border border-slate-100">
                     <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-slate-400"><path d="M4 4h16v16H4z"/><path d="M4 8h16"/><path d="M8 4v4"/></svg>
                   </div>
                   <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Balance de Facturación</span>
               </div>

               <div className="space-y-6 mb-8 relative z-10">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-6 sm:gap-2">
                    <div className="bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-slate-100 shadow-sm flex-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Impacto Diario</p>
                        <p className="text-2xl font-black text-slate-700 tabular-nums">+{ingresoDiario.toLocaleString("es-ES", { style: "currency", currency: "EUR" })}</p>
                    </div>
                    
                    <div className="hidden sm:flex h-[2px] w-8 bg-slate-200 mb-6 shrink-0" />
                    
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50/30 p-4 rounded-2xl border border-emerald-100 shadow-sm flex-1 sm:text-right relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-400/10 rounded-full blur-xl -translate-y-1/2 translate-x-1/2"></div>
                        <p className="text-[10px] font-bold text-emerald-600/70 uppercase tracking-wider mb-2 relative z-10">Descuento Mensual</p>
                        <p className="text-4xl md:text-5xl font-black text-emerald-600 tabular-nums drop-shadow-sm transition-all duration-500 tracking-tight relative z-10">{ingresoMensual.toLocaleString("es-ES", { style: "currency", currency: "EUR" })}</p>
                    </div>
                  </div>
               </div>

               <div className="mt-auto bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between shadow-xl gap-4 border border-slate-700/50">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/4"></div>
                  <div className="relative z-10">
                     <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                       <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                       Ahorro Extra Anual
                     </p>
                     <p className="text-xs text-slate-400 max-w-[180px] leading-relaxed">Dinero que dejas de pagar a tu compañía eléctrica al año</p>
                  </div>
                  <div className="sm:text-right relative z-10">
                     <p className="text-4xl md:text-5xl font-black tabular-nums tracking-tight text-white drop-shadow-md">{ingresoAnual.toLocaleString("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 })}</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
