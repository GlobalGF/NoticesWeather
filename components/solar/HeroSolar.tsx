"use client";

import React from "react";
import { useWeather } from "@/components/providers/WeatherProvider";

interface HeroSolarProps {
  municipio: string;
  provincia: string;
}

const HeroSolar: React.FC<HeroSolarProps> = ({ municipio, provincia }) => {
  const { data } = useWeather();

  return (
  <header className="mb-10 relative overflow-hidden rounded-3xl bg-gradient-to-br from-yellow-100 via-blue-50 to-emerald-100 shadow-lg p-8 flex flex-col items-center text-center">
    <span className="relative z-10 inline-flex items-center gap-2 px-4 py-1 mb-4 rounded-full bg-white/80 border border-amber-200 text-amber-700 font-bold text-xs uppercase tracking-widest shadow-sm">
      ☀️ Potencial Solar en {provincia}
    </span>
    <h1 className="relative z-10 text-5xl md:text-6xl font-extrabold tracking-tight text-blue-900 drop-shadow-lg mb-2">
      {municipio}
    </h1>
    <div className="relative z-10 flex flex-wrap justify-center gap-2 mt-2">
      {data && typeof data.temp_c === "number" && data.condition && (
        <span className="inline-flex items-center gap-1.5 rounded bg-blue-100 border border-blue-300 px-3 py-1 text-xs font-semibold text-blue-800">
          🌡️ {Math.round(data.temp_c)}°C · {data.condition}
        </span>
      )}
      <span className="inline-flex items-center gap-1.5 rounded bg-emerald-100 border border-emerald-300 px-3 py-1 text-xs font-semibold text-emerald-800">✅ 100% Legal y seguro</span>
      <span className="inline-flex items-center gap-1.5 rounded bg-amber-100 border border-amber-300 px-3 py-1 text-xs font-semibold text-amber-800">💸 Ahorro garantizado</span>
    </div>
    <a href="#lead-form" className="relative z-10 mt-6 inline-block rounded-full bg-gradient-to-r from-amber-400 to-emerald-400 px-8 py-3 text-lg font-bold text-white shadow-lg hover:scale-105 transition-transform">
      Solicita tu estudio solar gratis
    </a>
  </header>
  );
};

export default HeroSolar;
