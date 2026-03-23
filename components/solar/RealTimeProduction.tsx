import React from "react";

interface RealTimeProductionProps {
  produccionActual: number; // W
  capacidadPorcentaje: number; // %
  ahorroHoy: number; // €
}

const RealTimeProduction: React.FC<RealTimeProductionProps> = ({ produccionActual, capacidadPorcentaje, ahorroHoy }) => (
  <section className="my-8 rounded-xl border-2 border-blue-300 bg-blue-50 p-6 shadow-md text-center">
    <h2 className="text-2xl font-bold text-blue-900 mb-2">Producción Solar Actual</h2>
    <div className="flex flex-col md:flex-row items-center justify-center gap-8">
      <div>
        <span className="block text-4xl font-extrabold text-blue-800">
          {produccionActual.toLocaleString("es-ES", { maximumFractionDigits: 0 })} W
        </span>
        <span className="block text-sm text-blue-600 mt-1">Ahora mismo</span>
      </div>
      <div>
        <span className="block text-3xl font-bold text-emerald-700">
          {capacidadPorcentaje.toLocaleString("es-ES", { maximumFractionDigits: 1 })}%
        </span>
        <span className="block text-sm text-emerald-600 mt-1">Capacidad de producción</span>
      </div>
      <div>
        <span className="block text-3xl font-bold text-amber-700">
          {ahorroHoy.toLocaleString("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 2 })}
        </span>
        <span className="block text-sm text-amber-600 mt-1">Ahorro hoy</span>
      </div>
    </div>
  </section>
);

export default RealTimeProduction;
