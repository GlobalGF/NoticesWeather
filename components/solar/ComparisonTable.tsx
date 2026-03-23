import React from "react";

interface ComparisonTableProps {
  supabaseData: {
    irradiacion: number;
    horasSol: number;
    ahorro: number;
  };
  weatherData: {
    gti?: number;
    uv?: number;
    shortRad?: number;
  };
}

const ComparisonTable: React.FC<ComparisonTableProps> = ({ supabaseData, weatherData }) => (
  <section className="my-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
    <h3 className="text-xl font-bold text-slate-900 mb-4">Comparativa Solar: Media Anual vs Hoy</h3>
    <table className="w-full text-left border-collapse">
      <thead>
        <tr>
          <th className="border-b p-2">Métrica</th>
          <th className="border-b p-2">Media Anual</th>
          <th className="border-b p-2">Hoy (WeatherAPI)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className="p-2">Irradiación</td>
          <td className="p-2">{supabaseData.irradiacion.toLocaleString("es-ES", { maximumFractionDigits: 0 })} kWh/m²</td>
          <td className="p-2">{weatherData.gti ? `${weatherData.gti.toLocaleString("es-ES", { maximumFractionDigits: 0 })} W/m²` : "-"}</td>
        </tr>
        <tr>
          <td className="p-2">Horas de sol</td>
          <td className="p-2">{supabaseData.horasSol.toLocaleString("es-ES")}</td>
          <td className="p-2">{weatherData.uv ? `${weatherData.uv.toLocaleString("es-ES", { maximumFractionDigits: 1 })} (UV)` : "-"}</td>
        </tr>
        <tr>
          <td className="p-2">Ahorro estimado</td>
          <td className="p-2">{supabaseData.ahorro.toLocaleString("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 })}</td>
          <td className="p-2">{weatherData.shortRad ? `${weatherData.shortRad.toLocaleString("es-ES", { maximumFractionDigits: 0 })} W/m²` : "-"}</td>
        </tr>
      </tbody>
    </table>
  </section>
);

export default ComparisonTable;
