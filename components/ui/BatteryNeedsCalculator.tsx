"use client";

import { useMemo, useState } from "react";
import {
  calculateBatteryRecommendation,
  type TariffType
} from "@/calculators/battery-calculator";

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
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/50 shadow-2xl overflow-hidden transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] relative mt-8">
      <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-50/20 via-transparent to-transparent pointer-events-none"></div>

      <div className="bg-slate-900/95 backdrop-blur-md px-4 md:px-6 py-4 md:py-5 flex items-center gap-3 md:gap-4 relative z-10 border-b border-slate-800/60">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-fuchsia-500/30 to-fuchsia-600/10 text-fuchsia-400 border border-fuchsia-500/20 shadow-inner">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="22" x="4" y="1" rx="2" ry="2"/><line x1="8" x2="16" y1="5" y2="5"/><line x1="12" x2="12" y1="9" y2="17"/><line x1="8" x2="16" y1="13" y2="13"/></svg>
        </div>
        <div>
          <h2 className="text-lg md:text-2xl font-black text-white tracking-tight">Capacidad de Almacenamiento</h2>
          <p className="text-xs md:text-sm text-fuchsia-200/70 font-medium mt-0.5">Calcula cuántas baterías solares podrías necesitar en {municipio}</p>
        </div>
      </div>

      <div className="p-4 md:p-8 relative z-10">
        <div className="grid gap-6 md:gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Controls */}
          <div className="lg:col-span-5 space-y-6 flex flex-col justify-center">
            <div className="bg-slate-50/50 p-4 md:p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-400/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
               <div className="relative z-10 grid gap-6">
                  <div className="grid gap-2">
                    <label className="text-sm font-bold text-slate-700">Consumo eléctrico mensual</label>
                    <div className="flex items-center">
                      <input
                        type="range"
                        min={50} max={1500} step={50}
                        value={monthlyConsumption}
                        onChange={(e) => setMonthlyConsumption(Number(e.target.value))}
                        className="flex-1 h-2.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-fuchsia-600 hover:accent-fuchsia-500 transition-all shadow-inner"
                      />
                      <span className="ml-4 tabular-nums font-black text-fuchsia-700 min-w-[60px] text-right">{monthlyConsumption} <span className="text-xs font-bold text-fuchsia-600/60">kWh</span></span>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <label className="text-sm font-bold text-slate-700">Potencia de instalación</label>
                    <div className="flex items-center">
                      <input
                        type="range"
                        min={1} max={10} step={0.1}
                        value={installationPower}
                        onChange={(e) => setInstallationPower(Number(e.target.value))}
                        className="flex-1 h-2.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-fuchsia-600 hover:accent-fuchsia-500 transition-all shadow-inner"
                      />
                      <span className="ml-4 tabular-nums font-black text-fuchsia-700 min-w-[60px] text-right">{installationPower} <span className="text-xs font-bold text-fuchsia-600/60">kW</span></span>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <label className="text-sm font-bold text-slate-700 justify-between flex">
                      <span>Horas de sol</span>
                      <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Local: {annualSunHours}h/año</span>
                    </label>
                    <div className="flex items-center">
                      <input
                        type="range"
                        min={1} max={12} step={0.1}
                        value={sunHoursPerDay}
                        onChange={(e) => setSunHoursPerDay(Number(e.target.value))}
                        className="flex-1 h-2.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-amber-500 shadow-inner"
                      />
                      <span className="ml-4 tabular-nums font-black text-amber-600 min-w-[60px] text-right">{sunHoursPerDay} <span className="text-xs font-bold text-amber-600/60">h/día</span></span>
                    </div>
                  </div>

                  <div className="grid gap-2 border-t border-slate-100 pt-5 mt-2">
                    <label className="text-sm font-bold text-slate-700">Tarifa eléctrica</label>
                    <select
                      value={tariff}
                      onChange={(e) => setTariff(e.target.value as TariffType)}
                      className="w-full bg-white border border-slate-200 text-slate-700 text-sm rounded-xl focus:ring-fuchsia-500 focus:border-fuchsia-500 block p-3 shadow-sm font-medium transition-colors cursor-pointer"
                    >
                      <option value="2.0TD">Tarifa 2.0TD (Regulada/Discriminación horaria)</option>
                      <option value="indexada">Mercado Indexado</option>
                      <option value="fija">Tarifa Fija a 24h</option>
                    </select>
                  </div>
               </div>
            </div>
          </div>

          {/* Results Area */}
          <div className="lg:col-span-7 flex flex-col h-full gap-5">
            <div className="grid grid-cols-2 lg:grid-cols-2 gap-4 flex-1">
               <div className="bg-gradient-to-br from-fuchsia-600 to-purple-800 rounded-3xl p-6 flex flex-col justify-center text-center shadow-[0_8px_30px_rgba(192,38,211,0.2)] group relative overflow-hidden text-white border border-fuchsia-500/30">
                  <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20 pointer-events-none"></div>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-400/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 transition-transform duration-700 group-hover:scale-150"></div>
                  <p className="text-[10px] font-bold text-fuchsia-100 uppercase tracking-widest mb-2 relative z-10">Baterías Físicas (Módulos)</p>
                  <p className="text-6xl font-black tabular-nums transition-transform duration-500 group-hover:scale-110 drop-shadow-md relative z-10">{result.recommendedBatteries}</p>
                  <p className="text-xs text-fuchsia-100 font-medium mt-3 bg-black/10 py-1.5 px-3 rounded-full inline-block mx-auto backdrop-blur-md relative z-10 border border-white/10 shadow-sm shadow-fuchsia-900/20">módulos recomendados</p>
               </div>

               <div className="bg-white border text-center border-slate-200 rounded-3xl p-6 flex flex-col justify-center relative overflow-hidden group hover:border-slate-300 transition-colors shadow-sm">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Capacidad Nevesaria</p>
                  <div className="flex items-baseline justify-center gap-1">
                    <p className="text-5xl font-black text-slate-800 tabular-nums transition-transform duration-500 group-hover:scale-110 tracking-tight">{result.requiredCapacityKwh.toLocaleString("es-ES")}</p>
                    <span className="text-sm font-bold text-slate-400">kWh</span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-3 bg-slate-50 py-1.5 px-3 rounded-full inline-block mx-auto border border-slate-100">almacenamiento óptimo</p>
               </div>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-2 gap-4 flex-1">
               <div className="bg-white border text-center border-slate-200 rounded-3xl p-6 flex flex-col justify-center relative overflow-hidden group hover:border-slate-300 transition-colors shadow-sm">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex justify-center items-center gap-1.5"><span className="text-emerald-500">💰</span> Ahorro Anual Estimado</p>
                  <div className="flex items-baseline justify-center gap-1">
                    <p className="text-4xl lg:text-5xl font-black text-emerald-600 tabular-nums transition-transform duration-500 group-hover:scale-105 tracking-tight">{result.estimatedAnnualSavingsEur.toLocaleString("es-ES")}</p>
                    <span className="text-sm font-bold text-emerald-600/60">€</span>
                  </div>
               </div>

               <div className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 text-white rounded-3xl p-6 flex flex-col justify-center text-center shadow-sm relative overflow-hidden group hover:border-slate-600 transition-colors">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 relative z-10">Independencia Red Eléctrica</p>
                  <p className="text-4xl lg:text-5xl font-black tabular-nums transition-transform duration-500 group-hover:scale-105 tracking-tight relative z-10 text-white drop-shadow-sm">{result.energyIndependencePct}%</p>
               </div>
            </div>

            <div className="bg-fuchsia-50/80 rounded-2xl p-4 border border-fuchsia-100 flex items-start gap-4 shadow-sm items-center">
               <div className="bg-white p-2 rounded-xl shadow-sm border border-fuchsia-100 shrink-0 text-fuchsia-500">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/></svg>
               </div>
               <p className="text-sm text-fuchsia-900/80 font-medium leading-relaxed">
                 Con este escenario, una vivienda en <strong className="text-fuchsia-900">{municipio}</strong> podría cubrir aproximadamente el <strong>{result.energyIndependencePct}%</strong> de su energía anual combinando producción fotovoltaica y sistema de baterías.
               </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
