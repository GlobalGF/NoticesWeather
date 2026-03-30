"use client";

import { useState } from "react";
import { PanelCountCalculator } from "@/components/ui/PanelCountCalculator";
import { SurplusCompensationCalculator } from "@/components/ui/SurplusCompensationCalculator";
import { SolarFinancingCalculator } from "@/components/ui/SolarFinancingCalculator";
import { BatteryNeedsCalculator } from "@/components/ui/BatteryNeedsCalculator";

type Props = {
  municipioNombre: string;
  horasSolAnuales: number;
  costeMedio: number;
  ahorroAnual: number;
};

const TABS = [
  {
    id: "paneles",
    label: "Paneles",
    color: "blue",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/><path d="M15 21V9"/></svg>
    ),
    titulo: "Dimensionador de Paneles Solares",
    descripcion: "Calcula cuántos paneles necesitas para cubrir tu consumo eléctrico. Ajusta tu consumo mensual en kWh y la potencia de cada panel para obtener una estimación precisa del sistema fotovoltaico óptimo para tu vivienda.",
    pasos: [
      "Introduce tu consumo mensual en kWh (consulta tu última factura)",
      "Ajusta la potencia por panel según la tecnología que prefieras",
      "Revisa la cantidad de paneles recomendados y la potencia total del sistema",
    ],
  },
  {
    id: "baterias",
    label: "Baterías",
    color: "fuchsia",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="10" x="2" y="7" rx="2" ry="2"/><line x1="22" x2="22" y1="11" y2="13"/></svg>
    ),
    titulo: "Calculadora de Capacidad de Baterías",
    descripcion: "Determina la capacidad de almacenamiento que necesitas para maximizar tu autoconsumo. El sistema analiza tus patrones de consumo nocturno y recomienda la batería adecuada para tu instalación.",
    pasos: [
      "Indica tu consumo eléctrico mensual total",
      "Selecciona el porcentaje de consumo que realizas en horario nocturno",
      "Obtén la capacidad de batería recomendada en kWh",
    ],
  },
  {
    id: "financiacion",
    label: "Financiación",
    color: "emerald",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
    ),
    titulo: "Simulador de Rentabilidad y Amortización",
    descripcion: "Compara la cuota de financiación bancaria con el ahorro real en tu factura eléctrica. Esta herramienta te muestra si la instalación se paga sola y en cuántos años recuperarás la inversión.",
    pasos: [
      "El coste medio de instalación se carga automáticamente según tu localidad",
      "Ajusta el plazo de amortización (5-20 años) según tus preferencias",
      "Compara visualmente la cuota mensual frente al ahorro eléctrico",
    ],
  },
  {
    id: "excedentes",
    label: "Excedentes",
    color: "teal",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
    ),
    titulo: "Monetización de Excedentes a la Red",
    descripcion: "Calcula cuánto puedes ganar vendiendo la energía sobrante a la red eléctrica. El mecanismo de compensación simplificada te permite descontar de tu factura el excedente vertido.",
    pasos: [
      "Indica tu producción solar estimada y tu consumo real",
      "El sistema calcula la energía sobrante que viertes a la red",
      "Consulta el ahorro mensual y anual por compensación de excedentes",
    ],
  },
] as const;

const colorMap: Record<string, { gradient: string; bg: string; text: string; ring: string; light: string; border: string }> = {
  blue: { gradient: "from-blue-500 to-blue-700", bg: "bg-blue-600", text: "text-blue-600", ring: "ring-blue-500", light: "bg-blue-50", border: "border-blue-200" },
  fuchsia: { gradient: "from-fuchsia-500 to-fuchsia-700", bg: "bg-fuchsia-600", text: "text-fuchsia-600", ring: "ring-fuchsia-500", light: "bg-fuchsia-50", border: "border-fuchsia-200" },
  emerald: { gradient: "from-emerald-500 to-emerald-700", bg: "bg-emerald-600", text: "text-emerald-600", ring: "ring-emerald-500", light: "bg-emerald-50", border: "border-emerald-200" },
  teal: { gradient: "from-teal-500 to-teal-700", bg: "bg-teal-600", text: "text-teal-600", ring: "ring-teal-500", light: "bg-teal-50", border: "border-teal-200" },
};

export function CalculadorasClient({ municipioNombre, horasSolAnuales, costeMedio, ahorroAnual }: Props) {
  const [activeTab, setActiveTab] = useState(0);
  const tab = TABS[activeTab];
  const colors = colorMap[tab.color];

  return (
    <main className="min-h-screen bg-slate-50 font-sans pb-24">
      {/* ── Compact Header ── */}
      <div className="bg-slate-900 border-t border-slate-800 pb-10 pt-8 md:pb-12 md:pt-10 overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0))]"></div>
        <div className="mx-auto max-w-4xl px-4 relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <span className="h-px w-8 bg-cyan-500"></span>
            <p className="text-cyan-400 font-bold tracking-widest uppercase text-[10px]">Área Técnica</p>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight">Calculadoras Solares</h1>
              <p className="mt-2 text-sm text-slate-400 font-light max-w-xl">
                Herramientas profesionales diseñadas para proyectar el máximo rendimiento de tu instalación fotovoltaica.
              </p>
            </div>
            <div className="shrink-0 flex items-center gap-3 bg-white/5 backdrop-blur border border-white/10 rounded-xl px-4 py-2.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-400"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
              <div>
                <p className="text-[9px] uppercase tracking-widest text-slate-500 font-bold">Datos de</p>
                <p className="text-sm font-bold text-white">{municipioNombre}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Calculator Content Area ── */}
      <div className="mx-auto max-w-4xl px-3 md:px-4 -mt-6 relative z-20">
        {/* Explanation Card */}
        <div className={`${colors.light} ${colors.border} border rounded-xl md:rounded-2xl p-4 md:p-6 mb-3 md:mb-4`}>
          <div className="flex items-start gap-3">
            <div className={`w-9 h-9 md:w-11 md:h-11 shrink-0 rounded-lg md:rounded-xl bg-gradient-to-br ${colors.gradient} text-white flex items-center justify-center shadow-lg`}>
              {tab.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base md:text-xl font-black text-slate-900 tracking-tight mb-0.5 md:mb-1">{tab.titulo}</h2>
              <p className="text-xs md:text-sm text-slate-600 leading-relaxed mb-2 md:mb-3">{tab.descripcion}</p>
              <ol className="flex flex-col gap-1.5">
                {tab.pasos.map((paso, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-500">
                    <span className={`${colors.bg} text-white w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold mt-0.5`}>{i + 1}</span>
                    {paso}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>

        {/* Calculator Widget */}
        <div className="bg-white rounded-xl md:rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          {activeTab === 0 && (
            <PanelCountCalculator
              municipio={municipioNombre}
              horasSolAnuales={horasSolAnuales}
            />
          )}
          {activeTab === 1 && (
            <BatteryNeedsCalculator
              municipio={municipioNombre}
              annualSunHours={horasSolAnuales}
            />
          )}
          {activeTab === 2 && (
            <SolarFinancingCalculator
              municipio={municipioNombre}
              costeMedio={costeMedio}
              ahorroAnual={ahorroAnual}
            />
          )}
          {activeTab === 3 && (
            <SurplusCompensationCalculator
              municipio={municipioNombre}
            />
          )}
        </div>
      </div>

      {/* ── Floating Tab Bar ── */}
      <div className="fixed bottom-3 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-1.5rem)] sm:w-auto">
        <div className="flex items-center gap-0.5 sm:gap-1 bg-slate-900/95 backdrop-blur-xl rounded-xl sm:rounded-2xl p-1 sm:p-1.5 shadow-2xl shadow-slate-900/40 border border-white/10">
          {TABS.map((t, i) => {
            const isActive = i === activeTab;
            const tc = colorMap[t.color];
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(i)}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-2 py-2 sm:px-4 sm:py-2.5 rounded-lg sm:rounded-xl text-[11px] sm:text-sm font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? `bg-white text-slate-900 shadow-lg`
                    : "text-slate-400 hover:text-white hover:bg-white/10"
                }`}
              >
                <span className={`hidden sm:inline ${isActive ? tc.text : ""}`}>{t.icon}</span>
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </main>
  );
}
