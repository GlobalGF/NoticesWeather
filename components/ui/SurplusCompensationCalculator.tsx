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
    <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl mt-8">
      <div className="bg-slate-900 px-6 py-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Monetización de Excedentes</h2>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Calcula tus ingresos por verter energía sobrante a la red en {municipio}</p>
        </div>
      </div>

      <div className="p-6">
        <div className="grid gap-8 md:grid-cols-2">
          {/* Controls */}
          <div className="space-y-8 flex flex-col justify-center">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="exc-diario" className="block text-sm font-bold text-slate-700">
                  Energía sobrante volcada
                </label>
                <span className="text-sm font-black text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg tabular-nums border border-emerald-100">
                  {excedenteDiario} kWh/día
                </span>
              </div>
              <input
                id="exc-diario"
                type="range"
                min={1}
                max={40}
                step={1}
                value={excedenteDiario}
                onChange={(e) => setExcedenteDiario(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600 hover:accent-emerald-700 transition-all"
              />
              <div className="flex justify-between mt-2 text-[10px] text-slate-400 font-medium px-1">
                <span>1 kWh</span>
                <span>40 kWh</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="exc-precio" className="block text-sm font-bold text-slate-700">
                  Precio de compensación
                </label>
                <span className="text-sm font-black text-slate-700 bg-slate-100 px-3 py-1 rounded-lg tabular-nums border border-slate-200">
                  {precioCompensacion.toFixed(3)} €/kWh
                </span>
              </div>
              <input
                id="exc-precio"
                type="range"
                min={0.03}
                max={0.20}
                step={0.01}
                value={precioCompensacion}
                onChange={(e) => setPrecioCompensacion(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-600 hover:accent-slate-700 transition-all"
              />
              <div className="flex justify-between mt-2 text-[10px] text-slate-400 font-medium px-1">
                <span>0.03 €</span>
                <span>0.20 €</span>
              </div>
              <p className="mt-3 text-xs text-slate-500 font-medium bg-slate-50 p-2 rounded-lg border border-slate-100">💡 La media del mercado mayorista oscila entre 0.05€ y 0.10€ según la comercializadora.</p>
            </div>
          </div>

          {/* Receipt View */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 shadow-inner flex flex-col relative overflow-hidden">
             
             {/* Dynamic background ring */}
             <div className="absolute -right-10 -top-10 w-40 h-40 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

             <div className="flex items-center gap-2 border-b border-slate-200 pb-4 mb-4">
                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400"><path d="M4 4h16v16H4z"/><path d="M4 8h16"/><path d="M8 4v4"/></svg>
                 <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Balance de Facturación</span>
             </div>

             <div className="space-y-4 mb-6 relative z-10">
                <div className="flex justify-between items-end">
                  <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Impacto Diario</p>
                      <p className="text-lg font-bold text-slate-700 tabular-nums">+{ingresoDiario.toLocaleString("es-ES", { style: "currency", currency: "EUR" })}</p>
                  </div>
                  <div className="h-[2px] w-8 bg-slate-200 mb-2 invisible sm:visible" />
                  <div className="text-right">
                      <p className="text-[10px] font-bold text-emerald-600/70 uppercase tracking-wider mb-1">Descuento Mensual</p>
                      <p className="text-3xl font-black text-emerald-600 tabular-nums drop-shadow-sm transition-all">{ingresoMensual.toLocaleString("es-ES", { style: "currency", currency: "EUR" })}</p>
                  </div>
                </div>
             </div>

             <div className="mt-auto bg-slate-900 rounded-xl p-4 text-white relative z-10 flex items-center justify-between shadow-lg">
                <div>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Ahorro Extra Anual</p>
                   <p className="text-xs text-slate-400 max-w-[150px] leading-tight">Dinero que dejas de pagar a tu eléctrica al año</p>
                </div>
                <div className="text-right">
                   <p className="text-3xl font-black tabular-nums tracking-tight text-white">{ingresoAnual.toLocaleString("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 })}</p>
                </div>
             </div>

             <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500" />
          </div>
        </div>
      </div>
    </div>
  );
}
