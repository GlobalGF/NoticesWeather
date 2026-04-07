"use client";

import { useWeather, type WeatherData } from "@/components/providers/WeatherProvider";

/* ── Helpers ────────────────────────────────────────────────────── */

function uvColor(uv: number): string {
  if (uv <= 2) return "text-emerald-600";
  if (uv <= 5) return "text-amber-500";
  if (uv <= 7) return "text-orange-500";
  if (uv <= 10) return "text-red-500";
  return "text-purple-600";
}

function uvLabel(uv: number): string {
  if (uv <= 2) return "Bajo";
  if (uv <= 5) return "Moderado";
  if (uv <= 7) return "Alto";
  if (uv <= 10) return "Muy alto";
  return "Extremo";
}

function getIrradiance(d: WeatherData): number | null {
  return d.ghi ?? d.short_rad ?? null;
}

type SolarMessage = { text: string; cls: string; emoji: string };

function solarMessage(irradiance: number | null, isDay: boolean, municipio: string): SolarMessage {
  if (!isDay) {
    return {
      text: `Es de noche en ${municipio}. La producción solar se reanudará al amanecer.`,
      cls: "text-indigo-700 bg-indigo-50 border-indigo-200",
      emoji: "🌙",
    };
  }
  if (irradiance == null) {
    return {
      text: `Datos de irradiancia no disponibles para ${municipio} en este momento.`,
      cls: "text-slate-600 bg-slate-50 border-slate-200",
      emoji: "📡",
    };
  }
  if (irradiance > 300) {
    return {
      text: `Excelente momento para la producción solar en ${municipio}: irradiancia de ${Math.round(irradiance)} W/m². Los paneles están produciendo cerca de su capacidad máxima.`,
      cls: "text-amber-800 bg-amber-50 border-amber-200",
      emoji: "☀️",
    };
  }
  if (irradiance > 100) {
    return {
      text: `Producción solar moderada en ${municipio}: irradiancia de ${Math.round(irradiance)} W/m². Los paneles generan entre el 30% y el 60% de su capacidad.`,
      cls: "text-sky-800 bg-sky-50 border-sky-200",
      emoji: "⛅",
    };
  }
  return {
    text: `Producción solar baja en ${municipio}: irradiancia de ${Math.round(irradiance)} W/m². Los paneles siguen generando energía, aunque a menor rendimiento.`,
    cls: "text-slate-700 bg-slate-50 border-slate-200",
    emoji: "🌥️",
  };
}

/* ── Component ──────────────────────────────────────────────────── */

type SolarWeatherWidgetProps = {
  municipio: string;
  municipioSlug?: string; // kept for backwards compat, but context handles fetch
};

export function SolarWeatherWidget({ municipio }: SolarWeatherWidgetProps) {
  const { data, loading, error } = useWeather();

  /* ── Skeleton ─────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 min-h-[180px]">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-5 w-5 rounded bg-slate-200 animate-pulse" />
          <div className="h-4 w-48 rounded bg-slate-200 animate-pulse" />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="h-20 rounded-xl bg-slate-100 animate-pulse" />
          <div className="h-20 rounded-xl bg-slate-100 animate-pulse" />
          <div className="h-20 rounded-xl bg-slate-100 animate-pulse" />
          <div className="h-20 rounded-xl bg-slate-100 animate-pulse" />
        </div>
      </div>
    );
  }

  /* ── Error fallback ───────────────────────────────────────── */
  if (error || !data) {
    return (
      <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 min-h-[80px] flex items-center gap-3">
        <span className="text-2xl" aria-hidden="true">⚠️</span>
        <p className="text-sm font-medium text-amber-800">
          Datos solares no disponibles ahora mismo para {municipio}. La información se actualizará automáticamente.
        </p>
      </div>
    );
  }

  /* ── Render ─────────────────────────────────────────────── */
  const irradiance = getIrradiance(data);
  const isDay = data.is_day === 1;
  const message = solarMessage(irradiance, isDay, municipio);

  return (
    <section
      className="mb-6 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden"
      aria-label={`Condiciones solares en tiempo real en ${municipio}`}
    >
      {/* Header */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-600">
            ☀️ Condiciones solares en tiempo real
          </span>
        </div>
        <p className="text-xs text-slate-400">
          {data.city}{data.region ? `, ${data.region}` : ""} · {data.localtime}
        </p>
      </div>

      {/* KPI Grid */}
      <div className="px-5 pb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {/* Temperature */}
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={data.icon} alt={data.condition} width={32} height={32} className="shrink-0" loading="lazy" />
          </div>
          <p className="text-2xl font-extrabold tabular-nums text-slate-900">{Math.round(data.temp_c)}°</p>
          <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500 mt-0.5 truncate">{data.condition}</p>
        </div>

        {/* UV Index */}
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Índice UV</p>
          <p className={`text-2xl font-extrabold tabular-nums ${uvColor(data.uv)}`}>{data.uv}</p>
          <p className={`text-[10px] font-semibold uppercase tracking-wide mt-0.5 ${uvColor(data.uv)}`}>{uvLabel(data.uv)}</p>
        </div>

        {/* Irradiance */}
        <div className={`rounded-xl border p-3 text-center ${
          irradiance != null && irradiance > 300
            ? "border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50"
            : "border-slate-100 bg-slate-50"
        }`}>
          <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600 mb-1">Irradiancia</p>
          <p className="text-2xl font-extrabold tabular-nums text-amber-900">{irradiance != null ? Math.round(irradiance) : "—"}</p>
          <p className="text-[10px] font-medium uppercase tracking-wide text-amber-700 mt-0.5">W/m²</p>
        </div>

        {/* DNI */}
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">DNI</p>
          <p className="text-2xl font-extrabold tabular-nums text-slate-900">{data.dni != null ? Math.round(data.dni) : "—"}</p>
          <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500 mt-0.5">W/m²</p>
        </div>
      </div>

      {/* Dynamic CRO message */}
      <div className={`mx-5 mb-4 rounded-xl border p-4 ${message.cls}`}>
        <p className="text-sm font-medium leading-relaxed">
          <span className="mr-1.5" aria-hidden="true">{message.emoji}</span>
          {message.text}
        </p>
      </div>

      {/* Footer */}
      <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
        <p className="text-[10px] text-slate-400">Fuentes: WeatherAPI y Open-Meteo · Actualizado</p>
        <p className="text-[10px] text-slate-300">{isDay ? "☀️ Día" : "🌙 Noche"}</p>
      </div>
    </section>
  );
}
