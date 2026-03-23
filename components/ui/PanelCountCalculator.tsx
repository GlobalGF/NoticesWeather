"use client";

import { useState } from "react";

type PanelCountCalculatorProps = {
  municipio: string;
  horasSolAnuales: number;
};

export function PanelCountCalculator({ municipio, horasSolAnuales }: PanelCountCalculatorProps) {
  const [consumoMensual, setConsumoMensual] = useState<number>(350); // kWh
  const potenciaPanel = 500; // W
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
    <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
      <div className="bg-slate-900 px-6 py-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/20 text-blue-400">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/><path d="M15 21V9"/></svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Dimensionador Solar</h2>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Calcula tus placas exactas mediante Inteligencia Energética</p>
        </div>
      </div>

      <div className="p-6">
        <div className="grid gap-8 lg:grid-cols-5">
          {/* Controls */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="pc-consumo" className="block text-sm font-bold text-slate-700">
                  Consumo mensual eléctrico
                </label>
                <span className="text-lg font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-lg tabular-nums">
                  {consumoMensual} kWh
                </span>
              </div>
              <input
                id="pc-consumo"
                type="range"
                min={100}
                max={1500}
                step={50}
                value={consumoMensual}
                onChange={(e) => setConsumoMensual(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 hover:accent-blue-700 transition-all"
              />
              <div className="flex justify-between mt-2 text-[10px] text-slate-400 font-medium px-1">
                <span>100 kWh/mes</span>
                <span>1500 kWh/mes</span>
              </div>
            </div>
            
            <div className="rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-amber-500 text-lg">☀️</span>
                <p className="text-xs font-bold text-slate-700 uppercase tracking-widest">Base Meteorológica Local</p>
              </div>
              <p className="text-sm text-slate-600 leading-snug">
                Utilizando el registro histórico de <strong>{municipio}</strong> con <strong>{horasSolAnuales} horas de sol reales</strong> al año.
              </p>
            </div>
          </div>

          {/* Results Area */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 h-full">
              <div className="bg-white border-2 border-blue-50 rounded-2xl p-4 flex flex-col justify-center text-center shadow-sm relative overflow-hidden group hover:border-blue-200 transition-colors">
                <div className="absolute inset-x-0 -bottom-2 h-1/2 bg-gradient-to-t from-blue-50/50 to-transparent pointer-events-none" />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 z-10">Placas Solares (500W)</p>
                <p className="text-5xl font-black text-blue-600 tabular-nums z-10 drop-shadow-sm transition-transform group-hover:scale-110">{numPaneles}</p>
                <p className="text-xs text-slate-500 font-medium mt-1 z-10">unidades exactas</p>
              </div>

              <div className="bg-white border-2 border-slate-100 rounded-2xl p-4 flex flex-col justify-center text-center shadow-sm group hover:border-slate-200 transition-colors">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Potencia Pico</p>
                <div className="flex items-baseline justify-center gap-1">
                  <p className="text-4xl font-black text-slate-800 tabular-nums transition-transform group-hover:scale-110">{potenciaTotal.toFixed(1)}</p>
                  <span className="text-sm font-bold text-slate-500">kW</span>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-1">instalación sugerida</p>
              </div>

              <div className="col-span-2 lg:col-span-1 bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-100 rounded-2xl p-4 flex flex-col justify-center text-center shadow-sm group hover:border-emerald-200 transition-colors">
                <p className="text-[10px] font-bold text-emerald-600/70 uppercase tracking-widest mb-1">Tejado Necesario</p>
                <div className="flex items-baseline justify-center gap-1 text-emerald-600">
                  <p className="text-4xl font-black tabular-nums transition-transform group-hover:scale-110">{superficieEstimada}</p>
                  <span className="text-sm font-bold">m²</span>
                </div>
                <p className="text-xs text-emerald-600/80 font-medium mt-1">espacio mínimo viable</p>
              </div>
            </div>
            
            {/* Visualizer output */}
            <div className="mt-4 bg-slate-50 rounded-xl p-4 border border-slate-100 flex flex-wrap gap-1.5 justify-center opacity-80 min-h-[60px] items-center">
                {Array.from({ length: Math.min(numPaneles, 30) }).map((_, i) => (
                    <div key={i} className="w-6 h-8 bg-blue-500 rounded-sm shadow-inner border border-blue-400 flex items-center justify-center opacity-0 animate-[fade-in_0.5s_ease-out_forwards]" style={{ animationDelay: `${i * 30}ms`}}>
                       <div className="w-full h-[1px] bg-blue-300/40" />
                    </div>
                ))}
                {numPaneles > 30 && <span className="text-xs font-bold text-slate-400 ml-2">+{numPaneles - 30} más</span>}
                {numPaneles === 0 && <span className="text-xs text-slate-400">Mueve el deslizador para empezar</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
