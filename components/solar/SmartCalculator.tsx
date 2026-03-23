"use client";
import React, { useState } from "react";

interface SmartCalculatorProps {
  precioLuz: number;
}

const SmartCalculator: React.FC<SmartCalculatorProps> = ({ precioLuz }) => {
  const [consumo, setConsumo] = useState(350); // kWh/mes por defecto
  const [potencia, setPotencia] = useState(4.5); // kW por defecto
  const [superficie, setSuperficie] = useState(20); // m² por defecto
  const [eficiencia, setEficiencia] = useState(0.19); // 19% por defecto

  const produccionAnual = potencia * 1700; // kWh/año estimado
  const ahorroAnual = Math.min(produccionAnual, consumo * 12) * precioLuz;
  const presupuesto = potencia * 1100; // €/kW instalado
  const roi = ahorroAnual > 0 ? presupuesto / ahorroAnual : null;

  return (
    <section className="my-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-xl font-bold text-slate-900 mb-4">Calculadora Solar Inteligente</h3>
      <form className="flex flex-col md:flex-row gap-4 items-end">
        <div>
          <label className="block text-sm font-medium mb-1">Consumo mensual (kWh)</label>
          <input type="number" min={100} max={2000} value={consumo} onChange={e => setConsumo(Number(e.target.value))} className="rounded border p-2 w-28" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Potencia deseada (kW)</label>
          <input type="number" min={1} max={15} step={0.1} value={potencia} onChange={e => setPotencia(Number(e.target.value))} className="rounded border p-2 w-28" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Superficie disponible (m²)</label>
          <input type="number" min={5} max={100} value={superficie} onChange={e => setSuperficie(Number(e.target.value))} className="rounded border p-2 w-28" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Eficiencia panel (%)</label>
          <input type="number" min={10} max={25} step={0.1} value={eficiencia * 100} onChange={e => setEficiencia(Number(e.target.value) / 100)} className="rounded border p-2 w-28" />
        </div>
      </form>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
        <div>
          <div className="text-xs text-slate-500">Producción anual</div>
          <div className="text-2xl font-bold text-blue-900">{produccionAnual.toLocaleString("es-ES", { maximumFractionDigits: 0 })} kWh</div>
        </div>
        <div>
          <div className="text-xs text-slate-500">Ahorro anual</div>
          <div className="text-2xl font-bold text-emerald-700">{ahorroAnual.toLocaleString("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 })}</div>
        </div>
        <div>
          <div className="text-xs text-slate-500">Presupuesto estimado</div>
          <div className="text-2xl font-bold text-amber-700">{presupuesto.toLocaleString("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 })}</div>
        </div>
        <div>
          <div className="text-xs text-slate-500">Retorno inversión</div>
          <div className="text-2xl font-bold text-blue-700">{roi ? `${roi.toLocaleString("es-ES", { maximumFractionDigits: 1 })} años` : "-"}</div>
        </div>
      </div>
    </section>
  );
};

export default SmartCalculator;
