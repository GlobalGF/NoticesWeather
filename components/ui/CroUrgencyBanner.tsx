"use client";

import { useState, useEffect } from "react";
import { useWeather } from "@/components/providers/WeatherProvider";

/* ── Types ──────────────────────────────────────────────────────── */

type CroUrgencyBannerProps = {
  municipio: string;
  precioMedioLuz?: number;
};

/* ── Constants ──────────────────────────────────────────────────── */

const DISMISS_KEY = "cro-banner-dismissed";
const DISMISS_TTL_MS = 24 * 60 * 60 * 1000; // 24h

const PANEL_SYSTEM_KW = 5; // reference system size
const PERFORMANCE_RATIO = 0.80;
const DEFAULT_ELECTRICITY_PRICE = 0.22;

/* ── Component ──────────────────────────────────────────────────── */

export function CroUrgencyBanner({
  municipio,
  precioMedioLuz = DEFAULT_ELECTRICITY_PRICE,
}: CroUrgencyBannerProps) {
  const { data, loading, error } = useWeather();
  const [dismissed, setDismissed] = useState(true); // default hidden until checked

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DISMISS_KEY);
      if (raw) {
        const ts = parseInt(raw, 10);
        if (Date.now() - ts < DISMISS_TTL_MS) return; // still dismissed
      }
      setDismissed(false);
    } catch {
      setDismissed(false);
    }
  }, []);

  if (dismissed || loading || error || !data) return null;

  const ghi = data.ghi ?? data.short_rad ?? null;
  const isDay = data.is_day === 1;
  const hour = new Date().getHours();

  // Calculate money being "wasted" per hour without solar
  const currentProductionKwh = ghi != null
    ? (ghi / 1000) * PANEL_SYSTEM_KW * PERFORMANCE_RATIO
    : 0;
  const moneyPerHour = currentProductionKwh * precioMedioLuz;

  function dismiss() {
    setDismissed(true);
    try { localStorage.setItem(DISMISS_KEY, String(Date.now())); } catch { /* ok */ }
  }

  // ── Message logic ────────────────────────────────────────────
  let emoji: string;
  let headline: string;
  let body: string;
  let badgeText: string | null = null;
  let bgClass: string;

  if (!isDay) {
    emoji = "🌙";
    headline = `Mañana, tus paneles en ${municipio} volverán a generar energía gratis`;
    body = hour >= 20
      ? "Solicita tu estudio gratuito esta noche y recíbelo mañana a primera hora."
      : "Al amanecer, la producción solar se reanuda automáticamente.";
    bgClass = "from-indigo-900 to-slate-900 text-white";
  } else if (ghi != null && ghi > 500) {
    emoji = "☀️";
    headline = `Ahora mismo en ${municipio} se desperdician ${moneyPerHour.toFixed(2)}€/hora de energía solar`;
    body = `Con una irradiancia de ${Math.round(ghi)} W/m², una instalación de ${PANEL_SYSTEM_KW}kW produciría ${currentProductionKwh.toFixed(1)} kWh cada hora. Ese dinero sale de tu bolsillo.`;
    bgClass = "from-amber-500 to-orange-500 text-slate-900";
    if (data.uv > 8) badgeText = "UV extremo · máxima producción";
  } else if (ghi != null && ghi > 200) {
    emoji = "⚡";
    headline = `Con esta irradiancia en ${municipio}, estarías generando ${currentProductionKwh.toFixed(1)} kWh/h gratis`;
    body = `Producción moderada (${Math.round(ghi)} W/m²) — los paneles siguen siendo rentables incluso sin sol directo.`;
    bgClass = "from-blue-500 to-sky-500 text-white";
  } else {
    emoji = "🌤️";
    const pct = ghi != null ? Math.round((ghi / 1000) * 100) : 15;
    headline = `Incluso hoy, los paneles en ${municipio} producen un ${pct}% de su capacidad`;
    body = `Los paneles solares modernos generan energía incluso con cielos nublados. El ahorro se acumula día tras día.`;
    bgClass = "from-slate-600 to-slate-700 text-white";
  }

  // Time-of-day CTA twist
  let ctaText: string;
  if (hour >= 6 && hour < 10) {
    ctaText = "Aprovecha las horas pico — Pide presupuesto";
  } else if (hour >= 10 && hour < 16) {
    ctaText = "Máxima producción ahora — Solicita estudio gratis";
  } else if (hour >= 16 && hour < 20) {
    ctaText = "Empieza a ahorrar mañana — Presupuesto gratuito";
  } else {
    ctaText = "Solicita tu estudio gratuito esta noche";
  }

  return (
    <div
      className={`mb-6 rounded-2xl bg-gradient-to-r ${bgClass} shadow-lg overflow-hidden relative`}
      role="alert"
    >
      {/* Dismiss button */}
      <button
        type="button"
        onClick={dismiss}
        className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full bg-black/10 hover:bg-black/20 text-white/70 hover:text-white text-sm transition-all"
        aria-label="Cerrar"
      >
        ✕
      </button>

      <div className="px-5 py-5 sm:px-6 sm:py-6">
        {/* Badge */}
        {badgeText && (
          <span className="inline-block mb-2 rounded-full bg-white/20 px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest">
            {badgeText}
          </span>
        )}

        {/* Content */}
        <p className="text-lg sm:text-xl font-extrabold leading-tight pr-8">
          <span className="mr-2" aria-hidden="true">{emoji}</span>
          {headline}
        </p>
        <p className="mt-2 text-sm opacity-90 leading-relaxed max-w-xl">
          {body}
        </p>

        {/* CTA */}
        <a
          href="#lead-form"
          className="mt-4 inline-block rounded-xl bg-white px-6 py-3 text-sm font-bold text-slate-900 shadow hover:shadow-md active:scale-[0.98] transition-all"
        >
          {ctaText} →
        </a>
      </div>
    </div>
  );
}
