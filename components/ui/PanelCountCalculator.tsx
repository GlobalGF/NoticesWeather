"use client";

import { useState } from "react";

type PanelCountCalculatorProps = {
  municipio: string;
  horasSolAnuales: number;
};

export function PanelCountCalculator({ municipio, horasSolAnuales }: PanelCountCalculatorProps) {
  const [consumoMensual, setConsumoMensual] = useState<number>(350); // kWh
  const [potenciaPanel, setPotenciaPanel] = useState<number>(500); // W
  const rendimientoSistema = 0.80; // Tolerancia por pérdidas

  // Cálculo (simplificado SEO-friendly)
  const consumoDiario = consumoMensual / 30;
  const horasPicoDiarias = horasSolAnuales / 365;
  const energiaNecesariaDiaria = consumoDiario / rendimientoSistema;
  
  // kW de instalación sugerida
  const kwRecomendados = (energiaNecesariaDiaria / horasPicoDiarias);
  
  // Número de paneles de 500W
  const numPaneles = Math.ceil((kwRecomendados * 1000) / potenciaPanel);
  const potenciaTotal = (numPaneles * potenciaPanel) / 1000;
  const superficieEstimada = numPaneles * 2; // ~2m2 por panel

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/50 shadow-2xl overflow-hidden transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] relative">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 via-transparent to-transparent pointer-events-none"></div>
      
      <div className="bg-slate-900/95 backdrop-blur-md px-4 md:px-6 py-4 md:py-5 flex items-center gap-3 md:gap-4 relative z-10 border-b border-slate-800/60">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/30 to-blue-600/10 text-blue-400 border border-blue-500/20 shadow-inner">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/><path d="M15 21V9"/></svg>
        </div>
        <div>
          <h2 className="text-lg md:text-2xl font-black text-white tracking-tight">{municipio && municipio !== "España" ? `Dimensionador Solar — ${municipio}` : "Dimensionador Solar"}</h2>
          <p className="text-xs md:text-sm text-blue-200/70 font-medium mt-0.5">Calcula tus placas exactas mediante Inteligencia Energética</p>
        </div>
      </div>

      <div className="p-4 md:p-8 relative z-10">
        <div className="grid gap-6 md:gap-8 lg:grid-cols-5">
          {/* Controls */}
          <div className="lg:col-span-2 space-y-8 flex flex-col justify-center">
            <div className="bg-slate-50/50 p-4 md:p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6 md:space-y-8">
              <div>
                  <div className="flex items-center justify-between mb-4">
                    <label htmlFor="pc-consumo" className="block text-sm font-bold text-slate-700">
                      Consumo mensual eléctrico
                    </label>
                    <div className="flex items-baseline gap-1 bg-white px-3 py-1.5 rounded-lg shadow-sm border border-slate-200">
                      <span className="text-xl font-black text-blue-600 tabular-nums leading-none">{consumoMensual}</span>
                      <span className="text-xs font-bold text-slate-400">kWh</span>
                    </div>
                  </div>
                  <input
                    id="pc-consumo"
                    type="range"
                    min={100}
                    max={1500}
                    step={50}
                    value={consumoMensual}
                    onChange={(e) => setConsumoMensual(Number(e.target.value))}
                    className="w-full h-2.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-blue-600 hover:accent-blue-500 transition-all shadow-inner"
                  />
                  <div className="flex justify-between mt-3 text-[10px] text-slate-400 font-bold uppercase tracking-wider px-1">
                    <span>100 kWh</span>
                    <span>1500 kWh</span>
                  </div>
              </div>

              <div className="pt-2 border-t border-slate-200/60">
                  <div className="flex items-center justify-between mb-4 pt-4">
                    <label htmlFor="pc-potencia" className="block text-sm font-bold text-slate-700">
                      Potencia por Placa Solar
                    </label>
                    <div className="flex items-baseline gap-1 bg-white px-3 py-1.5 rounded-lg shadow-sm border border-slate-200">
                      <span className="text-xl font-black text-blue-600 tabular-nums leading-none">{potenciaPanel}</span>
                      <span className="text-xs font-bold text-slate-400">W</span>
                    </div>
                  </div>
                  <input
                    id="pc-potencia"
                    type="range"
                    min={300}
                    max={700}
                    step={10}
                    value={potenciaPanel}
                    onChange={(e) => setPotenciaPanel(Number(e.target.value))}
                    className="w-full h-2.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-blue-600 hover:accent-blue-500 transition-all shadow-inner"
                  />
                  <div className="flex justify-between mt-3 text-[10px] text-slate-400 font-bold uppercase tracking-wider px-1">
                    <span>300 W</span>
                    <span>700 W</span>
                  </div>
              </div>
            </div>
            
            <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-lg p-5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3 transition-transform group-hover:scale-110"></div>
              <div className="flex items-center gap-3 mb-3 relative z-10">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 text-yellow-400 text-sm shadow-inner">☀️</span>
                <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">Base Meteorológica Local</p>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed relative z-10">
                Utilizando el registro histórico de <strong className="text-white bg-white/10 px-1.5 py-0.5 rounded">{municipio}</strong> con <strong className="text-yellow-400">{horasSolAnuales} horas</strong> de sol al año.
              </p>
            </div>
          </div>

          {/* Results Area */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 h-full">
              <div className="bg-gradient-to-b from-white to-blue-50/30 border border-blue-100 rounded-2xl md:rounded-3xl p-4 md:p-5 flex flex-col justify-center text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group hover:border-blue-300 transition-colors">
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-blue-500/5 to-transparent pointer-events-none" />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 z-10">Placas Solares ({potenciaPanel}W)</p>
                <p className="text-4xl md:text-6xl font-black text-blue-600 tabular-nums z-10 drop-shadow-sm transition-transform duration-500 group-hover:scale-110">{numPaneles}</p>
                <p className="text-xs text-slate-500 font-medium mt-2 z-10 bg-white/80 py-1 px-2 rounded-full inline-block mx-auto backdrop-blur-sm border border-slate-100">unidades exactas</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl md:rounded-3xl p-4 md:p-5 flex flex-col justify-center text-center shadow-[0_8px_30px_rgb(0,0,0,0.02)] group hover:border-slate-300 transition-colors">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Potencia Pico</p>
                <div className="flex items-baseline justify-center gap-1">
                  <p className="text-3xl md:text-5xl font-black text-slate-800 tabular-nums transition-transform duration-500 group-hover:scale-110 tracking-tight">{potenciaTotal.toFixed(1)}</p>
                  <span className="text-sm font-bold text-slate-400">kW</span>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-2 bg-slate-50 py-1 px-2 rounded-full inline-block mx-auto border border-slate-100">instalación sugerida</p>
              </div>

              <div className="col-span-2 lg:col-span-1 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl md:rounded-3xl p-4 md:p-5 flex flex-col justify-center text-center shadow-[0_8px_30px_rgb(16,185,129,0.2)] group relative overflow-hidden text-white">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20 pointer-events-none"></div>
                <p className="text-[10px] font-bold text-emerald-100 uppercase tracking-widest mb-2 relative z-10">Tejado Necesario</p>
                <div className="flex items-baseline justify-center gap-1 relative z-10">
                  <p className="text-3xl md:text-5xl font-black tabular-nums transition-transform duration-500 group-hover:scale-110">{superficieEstimada}</p>
                  <span className="text-sm font-bold text-emerald-200">m²</span>
                </div>
                <p className="text-xs text-emerald-50 font-medium mt-2 bg-black/10 py-1 px-2 rounded-full inline-block mx-auto backdrop-blur-md relative z-10 border border-white/10">espacio mínimo viable</p>
              </div>
            </div>
            
            {/* Visualizer output */}
            <div className="mt-6 bg-slate-50 rounded-2xl p-5 border border-slate-200/60 flex flex-wrap gap-2 justify-center opacity-90 min-h-[80px] items-center shadow-inner relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-white/50 to-transparent pointer-events-none"></div>
                {Array.from({ length: Math.min(numPaneles, 30) }).map((_, i) => (
                    <div key={i} className="w-6 h-10 bg-gradient-to-b from-blue-400 to-blue-600 rounded shadow-[0_2px_4px_rgba(37,99,235,0.3)] border border-blue-400/50 flex flex-col justify-evenly opacity-0 animate-[fade-in_0.5s_ease-out_forwards] overflow-hidden" style={{ animationDelay: `${i * 30}ms`}}>
                       <div className="w-full h-[1px] bg-white/30" />
                       <div className="w-full h-[1px] bg-white/30" />
                    </div>
                ))}
                {numPaneles > 30 && <span className="text-xs font-bold text-slate-500 bg-white px-2 py-1 rounded-md border border-slate-200 shadow-sm ml-2">+{numPaneles - 30} más</span>}
                {numPaneles === 0 && <span className="text-xs font-medium text-slate-400">Mueve el deslizador para visualizar tu tejado</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
