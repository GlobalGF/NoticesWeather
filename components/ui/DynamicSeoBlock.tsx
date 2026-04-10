"use client";

import { useWeather } from "@/components/providers/WeatherProvider";
import { parseMarkdown } from "@/lib/utils/text";

/* ── Types ──────────────────────────────────────────────────────── */

type DynamicSeoBlockProps = {
  municipio: string;
  provincia: string;
  irradiacionAnual?: number | null;
  precioMedioLuz?: number;
};

/* ── Helpers ────────────────────────────────────────────────────── */

function getTimeSlot(): "morning" | "afternoon" | "night" {
  const h = new Date().getHours();
  if (h >= 6 && h < 14) return "morning";
  if (h >= 14 && h < 21) return "afternoon";
  return "night";
}

function getWeatherBucket(condition: string): "sunny" | "cloudy" | "rainy" {
  const c = condition.toLowerCase();
  if (c.includes("lluvia") || c.includes("tormenta") || c.includes("rain") || c.includes("thunder")) return "rainy";
  if (c.includes("nub") || c.includes("overcast") || c.includes("cloud") || c.includes("mist") || c.includes("fog")) return "cloudy";
  return "sunny";
}

function getIrradianceBucket(ghi: number | null): "high" | "medium" | "low" {
  if (ghi == null) return "medium";
  if (ghi > 400) return "high";
  if (ghi > 150) return "medium";
  return "low";
}

function fmt(n: number, d = 0): string {
  return n.toLocaleString("es-ES", { maximumFractionDigits: d });
}

function getStringHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function pick<T>(arr: T[], hash: number, offset: number): T {
  return arr[(hash + offset) % arr.length];
}

/* ── Text generator ──────────────────────────────────────────────── */

function generateText(
  municipio: string,
  provincia: string,
  time: "morning" | "afternoon" | "night",
  weather: "sunny" | "cloudy" | "rainy",
  irr: "high" | "medium" | "low",
  ghi: number | null,
  precioKwh: number,
  irradiacionAnual: number | null,
): { title: string; body: string } {
  const ghiStr = ghi ? `${Math.round(ghi)} W/m²` : "datos no disponibles";
  const production5kw = ghi ? (ghi / 1000 * 5 * 0.80) : 0;
  const savingsToday = production5kw * 6 * precioKwh;
  const annualStr = irradiacionAnual ? `${fmt(irradiacionAnual)} kWh/m²` : null;

  const hashId = getStringHash(`${municipio}-${time}-${weather}-${irr}`);

  const timeTitles = {
    morning: [
      `Producción de energía solar esta mañana en ${municipio}`,
      `Rendimiento fotovoltaico actual en la provincia de ${provincia}`,
      `Análisis de luz solar matutina para el cliente en ${municipio}`,
      `Estado del sistema fotovoltaico al amanecer en ${municipio}`,
      `Generación de energía limpia hoy en ${municipio}`
    ],
    afternoon: [
      `Estado del proyecto solar esta tarde en ${municipio}`,
      `Rendimiento de cada panel solar hoy en ${municipio}`,
      `Ahorro fotovoltaico vespertino en ${municipio}`,
      `Monitorización de energía solar en vivo: ${municipio}`,
      `Balance de luz y economía solar esta tarde en ${municipio}`
    ],
    night: [
      `Balance de energía solar diaria en ${municipio}`,
      `Resumen de ahorro fotovoltaico hoy en ${municipio}`,
      `Datos finales del proyecto solar en ${municipio}`,
      `Economía y luz solar: cierre del día en ${municipio}`,
      `Análisis final de tu sistema fotovoltaico en ${municipio}`
    ],
  };

  const openings = {
    night: [
      `La jornada de **energía solar** en ${municipio} termina con una producción contabilizada para tu **economía**.`,
      `Noche en ${provincia}: el **sistema fotovoltaico** en ${municipio} descansa tras completar su ciclo de generación.`,
      `Sin **luz solar** directa ahora mismo en ${municipio}, es el momento de ver cuánto ha bajado hoy tu **cuenta de la luz**.`,
      `Cae la noche: la **empresa** instaladora asegura que el balance en ${municipio} ha sido positivo para el **ahorro** del **cliente**.`,
      `Fin del ciclo diurno: tu **proyecto solar** en ${municipio} ha captado toda la radiación posible de la jornada.`
    ],
    sunny: [
      `Cielos claros en ${municipio}: el rendimiento de cada **panel solar** es máximo con ${ghiStr} de irradiancia actual.`,
      `Bajo el sol de ${provincia}, el **sistema fotovoltaico** en ${municipio} opera con una **calidad** de luz excepcional hoy.`,
      `Radiación directa en ${municipio}: tu **instalación de energía solar** está vertiendo ahorros masivos a tu **economía**.`,
      `Escenario ideal hoy en ${municipio}: la **energía fotovoltaica** inyectada reduce significativamente tu **cuenta de la luz**.`,
      `Máxima eficiencia: los **sistemas** en ${municipio} aprovechan los ${ghiStr} para un autoconsumo pleno.`
    ],
    cloudy: [
      `Nubes en ${municipio}: los **paneles solares** de alta sensibilidad siguen captando ${ghiStr} de radiación difusa.`,
      `Incluso con nubes sobre ${provincia}, el **proyecto solar** en ${municipio} mantiene una generación de **luz** estable.`,
      `Día nublado en ${municipio}, pero la **calidad** del **equipo** fotovoltaico garantiza que el **ahorro** no se detenga.`,
      `Generación ambiental: tu **sistema fotovoltaico** en ${municipio} capta luz filtrada equivalente a ${ghiStr}.`,
      `Control técnico: el **atención** al rendimiento en ${municipio} confirma que sigues reduciendo tu factura hoy.`
    ],
    rainy: [
      `Día de lluvia en ${municipio}: los módulos se limpian naturalmente mientras siguen captando ${ghiStr} de **energía solar**.`,
      `Incluso con lluvia en ${provincia}, la **energía fotovoltaica** residual en ${municipio} sigue aportando a tu **economía**.`,
      `El clima lluvioso no apaga tu **sistema**: en ${municipio} se siguen aprovechando los fotones ambientales (${ghiStr}).`,
      `Ahorro bajo la lluvia: el **cliente** en ${municipio} ve cómo su **proyecto solar** sigue operativo pese al mal tiempo.`,
      `Eficiencia bajo el agua: tus **paneles** en ${municipio} rinden a nivel basal manteniendo la **calidad** del servicio.`
    ]
  };

  const middles = {
    high: [
      `Con esta potencia, tu **sistema fotovoltaico** en ${municipio} produce unos ${production5kw.toFixed(1)} kWh/h, ahorrando hasta ${savingsToday.toFixed(2)} € solo hoy.`,
      `Este pico de **luz solar** dispara la rentabilidad de cada **panel**, bajando tu **cuenta de la luz** de forma inmediata.`,
      `La **empresa** proyecta que hoy es un día de máxima **economía** para el autoconsumo en ${municipio}.`,
      `Cada **panel** está volcando casi ${production5kw.toFixed(1)} kWh directos, acelerando la amortización de tu **equipo**.`,
      `Rendimiento pico: la **energía solar** en ${municipio} fluye al máximo para cubrir todos los consumos de la vivienda.`
    ],
    medium: [
      `Producción moderada en ${municipio}: el **sistema** cubre el consumo base, restando euros directamente a tu **cuenta de la luz**.`,
      `Nivel estable de **energía fotovoltaica** en ${municipio}, garantizando el ahorro del **cliente** al precio actual de mercado.`,
      `El **proyecto solar** en ${provincia} mantiene un flujo de **luz** constante para proteger tu **economía** familiar.`,
      `Atención técnica: tu **instalación** en ${municipio} opera al 50% de su capacidad nominal con total **calidad**.`,
      `Curva de sol equilibrada en ${municipio}: ideal para cargar baterías o verter excedentes hoy.`
    ],
    low: [
      `Baja irradiancia en ${municipio}, pero los **sistemas** de **calidad** siguen inyectando **energía** residual útil.`,
      `Ahorro constante: incluso con poca luz, tu **placa solar** en ${municipio} evita que dependas totalmente de la red.`,
      `Mínima producción hoy en ${municipio}, suficiente para mantener la **atención** energética de consumos pasivos.`,
      `Cada vatio suma: la **energía fotovoltaica** en ${municipio} sigue bajando tu factura de la **luz** poco a poco.`,
      `El **equipo** de monitorización en ${municipio} confirma que el **ahorro** matutino compensará esta bajada temporal.`
    ],
    night: [
      `La noche permite que la red o los acumuladores den servicio, mientras tu **sistema fotovoltaico** espera el amanecer.`,
      `Descanso técnico en ${municipio}: el **proyecto solar** ha cumplido su objetivo de **ahorro** durante las horas de luz.`,
      `La monitorización en ${provincia} sigue activa, analizando el impacto positivo de hoy en tu **economía**.`,
      `Pausa solar: el momento de usar la **energía** limpia almacenada en el **panel** virtual o batería física.`,
      `Cierre de jornada: tu **cuenta de la luz** hoy es más baja gracias a la **energía** captada durante el día.`
    ]
  };

  const annuals = [
    `Anualmente, ${municipio} recibe ${annualStr ?? "altísimos niveles"} de sol, garantizando un **proyecto de energía solar** rentable.`,
    `La irradiación en ${municipio} es ideal para que cualquier **empresa** garantice un **ahorro** sólido y veraz al **cliente**.`,
    `En ${provincia}, el potencial de **energía fotovoltaica** acumulada hace de cada **panel** una fuente de ingresos estable.`,
    `Datos de PVGIS: los ${annualStr ?? "abundantes kWh/m²"} de ${municipio} blindan tu **economía** ante las subidas de la **luz**.`,
    `Esta geografía permite que un **sistema fotovoltaico** en ${municipio} rinda con **calidad** superior la mayoría del año.`
  ];

  const title = pick(timeTitles[time], hashId, 0);
  const part1 = pick(time === "night" ? openings.night : openings[weather], hashId, 1);
  const part2 = pick(time === "night" ? middles.night : middles[irr], hashId, 2);
  const part3 = pick(annuals, hashId, 3);

  const body = `${part1} ${part2} ${part3}`;
  return { title, body };
}

/* ── Component ──────────────────────────────────────────────────── */

export function DynamicSeoBlock({
  municipio,
  provincia,
  irradiacionAnual,
  precioMedioLuz = 0.22,
}: DynamicSeoBlockProps) {
  const { data, loading, error } = useWeather();

  const cardClasses = "mt-10 rounded-[2.5rem] border border-slate-200/60 p-8 md:p-12 bg-gradient-to-br from-white to-slate-50/50 shadow-2xl shadow-slate-200/40 relative overflow-hidden backdrop-blur-sm";

  if (loading || error || !data) {
    const annualStr = irradiacionAnual ? `${irradiacionAnual.toLocaleString("es-ES")} kWh/m²` : "alta irradiación";
    
    return (
      <section className={cardClasses}>
        <div className="absolute top-0 right-0 p-6 opacity-[0.03]">
           <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v1m0 16v1m9-9h-1M4 9H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 7a5 5 0 100 10 5 5 0 000-10z"/></svg>
        </div>
        <h2 className="text-3xl font-black text-slate-900 mb-6 tracking-tight leading-tight">Rendimiento solar de {municipio}</h2>
        <p className="leading-relaxed text-slate-600 font-medium text-lg">
          {municipio} registra {annualStr} de irradiación anual, lo que garantiza una <strong className="text-slate-900">energía solar</strong> rentable para tu vivienda. Los datos del <strong className="text-slate-900">sistema fotovoltaico</strong> en tiempo real se cargarán al actualizar la meteorología local.
        </p>
        <p className="mt-8 text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 animate-pulse">Sincronizando con WeatherAPI 2026…</p>
      </section>
    );
  }

  const ghi = data.ghi ?? data.short_rad ?? null;
  const time = getTimeSlot();
  const weather = getWeatherBucket(data.condition);
  const irr = getIrradianceBucket(ghi);

  const { title, body } = generateText(
    municipio, provincia, time, weather, irr,
    ghi, precioMedioLuz, irradiacionAnual ?? null,
  );

  return (
    <section className={cardClasses}>
      <div className="absolute top-0 right-0 p-6 opacity-[0.03]">
         <svg className="w-24 h-24 text-blue-900" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v1m0 16v1m9-9h-1M4 9H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 7a5 5 0 100 10 5 5 0 000-10z"/></svg>
      </div>
      
      <div className="relative z-10 font-manrope">
        <h2 className="text-3xl font-black text-slate-900 mb-6 tracking-tight leading-tight border-b border-slate-100 pb-6">
          {title}
        </h2>
        
        <p className="leading-relaxed text-slate-600 font-medium text-lg">
          {parseMarkdown(body)}
        </p>
        
        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-6">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
            <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400">
              Datos Satelitales · {data.localtime}
            </p>
          </div>
          
          <div className="px-3 py-1 rounded-full bg-blue-50 border border-blue-100">
            <p className="text-[10px] font-black uppercase tracking-widest text-blue-600">
              Ingeniería SolaryEco 2026
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
