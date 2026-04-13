"use client";

import { useState, useEffect } from "react";
import { useWeather } from "@/components/providers/WeatherProvider";
import { generateDynamicText } from "@/lib/pseo/spintax";

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
  let headlineTemplate: string;
  let bodyTemplate: string;
  let badgeText: string | null = null;
  let bgClass: string;

  const vars = {
    MUNICIPIO: municipio,
    EUR: moneyPerHour.toFixed(2),
    KWH: currentProductionKwh.toFixed(1),
    GHI: String(Math.round(ghi ?? 0)),
  };

  if (!isDay) {
    headlineTemplate = "{Mañana, tus paneles en [MUNICIPIO] volverán a generar energía gratis|El sol volverá a [MUNICIPIO] mañana: prepárate para ahorrar|Tu sistema solar en [MUNICIPIO] se reactivará con la primera luz del día}";
    bodyTemplate = hour >= 20
      ? "{Solicita tu estudio gratuito esta noche y recíbelo mañana a primera hora|Aprovecha el descanso nocturno para planificar tu ahorro en [MUNICIPIO]|Gana tiempo: pide tu presupuesto solar ahora y lo tendrás listo al amanecer}"
      : "{Al amanecer, la producción solar en [MUNICIPIO] se reanuda automáticamente|La energía fotovoltaica en [MUNICIPIO] volverá a reducir tu factura en unas horas|Pausa nocturna: el sistema está listo para captar luz en cuanto salga el sol}";
    bgClass = "from-indigo-900 to-slate-900 text-white";
  } else if (ghi != null && ghi > 500) {
    headlineTemplate = "{Ahora mismo en [MUNICIPIO] se desperdician [EUR]€/hora de energía solar|Estás perdiendo [EUR]€ de ahorro solar cada hora en [MUNICIPIO]|Pico de sol en [MUNICIPIO]: dejas de ahorrar [EUR]€ por hora sin paneles}";
    bodyTemplate = "{Con una irradiancia de [GHI] W/m², una instalación de 5kW produciría [KWH] kWh cada hora|Máxima eficiencia ahora en [MUNICIPIO]: podrías generar [KWH] kWh/h gratis con el sol actual|Ese dinero ([EUR]€) sale de tu bolsillo cada hora que pasas sin energía fotovoltaica}";
    bgClass = "from-amber-500 to-orange-500 text-slate-900";
    if (data.uv > 8) badgeText = "UV extremo · máxima producción";
  } else if (ghi != null && ghi > 200) {
    headlineTemplate = "{Con esta irradiancia en [MUNICIPIO], estarías generando [KWH] kWh/h gratis|Luz solar aprovechable ahora en [MUNICIPIO]: produce [KWH] kWh cada hora|Oportunidad de ahorro real en [MUNICIPIO]: genera [KWH] kWh/h con luz ambiental}";
    bodyTemplate = "{Producción moderada ([GHI] W/m²) — los paneles siguen siendo rentables incluso sin sol directo|Incluso con nubes parciales en [MUNICIPIO], tu sistema fotovoltaico restaría euros a tu factura|La tecnología actual capta energía residual de [GHI] W/m² para alimentar tu hogar}";
    bgClass = "from-blue-500 to-sky-500 text-white";
  } else {
    const pct = ghi != null ? Math.round((ghi / 1000) * 100) : 15;
    headlineTemplate = `{Incluso hoy, los paneles en [MUNICIPIO] producen un ${pct}% de su capacidad|Cielo cubierto en [MUNICIPIO] pero ahorro activo: generas energía al ${pct}%|No subestimes las nubes: tus placas en [MUNICIPIO] rinden al ${pct}% hoy}`;
    bodyTemplate = "{Los paneles solares modernos generan energía incluso con cielos nublados|El equipo fotovoltaico de calidad capta radiación difusa para que el ahorro no se detenga|Día gris en [MUNICIPIO] pero tu cuenta de la luz sigue bajando gracias a la luz ambiental}";
    bgClass = "from-slate-600 to-slate-700 text-white";
  }

  const ctaTemplate = hour >= 6 && hour < 10
    ? "{Aprovecha las horas pico — Pide presupuesto|Empieza el día ahorrando — Consulta gratis|Sol matutino: solicita tu estudio ahora}"
    : hour >= 10 && hour < 16
      ? "{Máxima producción ahora — Solicita estudio gratis|No pierdas más vatios — Pide tu presupuesto|La mejor hora para pasarte al autoconsumo — Infórmate}"
      : hour >= 16 && hour < 20
        ? "{Empieza a ahorrar mañana — Presupuesto gratuito|Prepara tu tejado para el sol de mañana|Calcula tu ahorro vespertino ahora mismo}"
        : "{Solicita tu estudio gratuito esta noche|No esperes a la factura: pide presupuesto hoy|Tu ahorro de mañana empieza con este clic}";

  const headline = generateDynamicText(headlineTemplate, `${municipio}-cro-h`, vars);
  const body = generateDynamicText(bodyTemplate, `${municipio}-cro-b`, vars);
  const ctaText = generateDynamicText(ctaTemplate, `${municipio}-cro-cta`, vars);

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
