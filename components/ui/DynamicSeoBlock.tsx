"use client";

import { generateDynamicText } from "@/lib/pseo/spintax";
import { fmt, parseMarkdown } from "@/lib/utils/text";
import { useWeather } from "@/components/providers/WeatherProvider";

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

  const vars = {
    MUNICIPIO: municipio,
    PROVINCIA: provincia,
    GHI: ghiStr,
    KWH: production5kw.toFixed(1),
    EUR: savingsToday.toFixed(2),
    ANNUAL: annualStr ?? "alta irradiación",
  };

  const titleSpintax = {
    morning: "{Producción de energía solar esta mañana en [MUNICIPIO]|Rendimiento fotovoltaico actual en la provincia de [PROVINCIA]|Análisis de luz solar matutina en [MUNICIPIO]|Estado del sistema fotovoltaico al amanecer en [MUNICIPIO]|Generación de energía limpia hoy en [MUNICIPIO]}",
    afternoon: "{Estado del proyecto solar esta tarde en [MUNICIPIO]|Rendimiento de cada panel solar hoy en [MUNICIPIO]|Ahorro fotovoltaico vespertino en [MUNICIPIO]|Monitorización de energía solar en vivo: [MUNICIPIO]|Balance de luz y economía solar esta tarde en [MUNICIPIO]}",
    night: "{Balance de energía solar diaria en [MUNICIPIO]|Resumen de ahorro fotovoltaico hoy en [MUNICIPIO]|Datos finales del proyecto solar en [MUNICIPIO]|Economía y luz solar: cierre del día en [MUNICIPIO]|Análisis final de tu sistema fotovoltaico en [MUNICIPIO]}",
  };

  const openingSpintax = {
    night: "{La jornada de **energía solar** en [MUNICIPIO] termina con una producción contabilizada para tu **economía**|Noche en [PROVINCIA]: el **sistema fotovoltaico** en [MUNICIPIO] descansa tras completar su ciclo de generación|Sin **luz solar** directa ahora mismo en [MUNICIPIO], es el momento de ver cuánto ha bajado hoy tu **cuenta de la luz**}. {Cae la noche: la **empresa** instaladora asegura que el balance en [MUNICIPIO] ha sido positivo|Fin del ciclo diurno: tu **proyecto solar** ha captado toda la radiación posible}.",
    sunny: "{Cielos claros en [MUNICIPIO]: el rendimiento de cada **panel solar** es máximo con [GHI] de irradiancia actual|Bajo el sol de [PROVINCIA], el **sistema fotovoltaico** en [MUNICIPIO] opera con una **calidad** de luz excepcional hoy|Radiación directa en [MUNICIPIO]: tu **instalación de energía solar** está vertiendo ahorros masivos}. {Escenario ideal hoy en [MUNICIPIO]: la **energía fotovoltaica** inyectada reduce significativamente tu factura|Máxima eficiencia: los **sistemas** en [MUNICIPIO] aprovechan los [GHI] para un autoconsumo pleno}.",
    cloudy: "{Nubes en [MUNICIPIO]: los **paneles solares** de alta sensibilidad siguen captando [GHI] de radiación difusa|Incluso con nubes sobre [PROVINCIA], el **proyecto solar** en [MUNICIPIO] mantiene una generación de **luz** estable|Día nublado en [MUNICIPIO], pero la **calidad** del **equipo** fotovoltaico garantiza que el **ahorro** no se detenga}. {Generación ambiental: tu **sistema fotovoltaico** capta luz filtrada equivalente a [GHI]|Control técnico: el **atención** al rendimiento en [MUNICIPIO] confirma que sigues reduciendo tu factura}.",
    rainy: "{Día de lluvia en [MUNICIPIO]: los módulos se limpian naturalmente mientras siguen captando [GHI] de **energía solar**|Incluso con lluvia en [PROVINCIA], la **energía fotovoltaica** residual en [MUNICIPIO] sigue aportando a tu **economía**|El clima lluvioso no apaga tu **sistema**: en [MUNICIPIO] se siguen aprovechando los fotones ambientales}. {Ahorro bajo la lluvia: el **cliente** ve cómo su **proyecto solar** sigue operativo pese al mal tiempo|Eficiencia bajo el agua: tus **paneles** rinden a nivel basal manteniendo la **calidad** de la luz}.",
  };

  const middleSpintax = {
    high: "{Con esta potencia, tu **sistema fotovoltaico** produce unos [KWH] kWh/h, ahorrando hasta [EUR] € solo hoy|Este pico de **luz solar** dispara la rentabilidad de cada **panel**, bajando tu **cuenta de la luz** de forma inmediata|La **empresa** proyecta que hoy es un día de máxima **economía** para el autoconsumo en [MUNICIPIO]}. {Cada **panel** está volcando casi [KWH] kWh directos, acelerando la amortización de tu **equipo**|Rendimiento pico: la **energía solar** en [MUNICIPIO] fluye al máximo para cubrir todos los consumos}.",
    medium: "{Producción moderada en [MUNICIPIO]: el **sistema** cubre el consumo base, restando euros directamente a tu factura|Nivel estable de **energía fotovoltaica** en [MUNICIPIO], garantizando el ahorro del **cliente** al precio de mercado|El **proyecto solar** en [PROVINCIA] mantiene un flujo de **luz** constante para proteger tu **economía**}. {Atención técnica: tu **instalación** opera con total **calidad**|Curva de sol equilibrada en [MUNICIPIO]: ideal para cargar baterías o verter excedentes hoy}.",
    low: "{Baja irradiancia en [MUNICIPIO], pero los **sistemas** de **calidad** siguen inyectando **energía** residual útil|Ahorro constante: incluso con poca luz, tu **placa solar** evita que dependas totalmente de la red|Mínima producción hoy en [MUNICIPIO], suficiente para mantener la **atención** energética de consumos pasivos}. {Cada vatio suma: la **energía fotovoltaica** sigue bajando tu factura de la **luz** poco a poco|El **equipo** de monitorización confirma que el **ahorro** se mantiene activo}.",
    night: "{La noche permite que la red o los acumuladores den servicio, mientras tu **sistema** espera el amanecer|Descanso técnico en [MUNICIPIO]: el **proyecto solar** ha cumplido su objetivo de **ahorro** durante las horas de luz|La monitorización en [PROVINCIA] sigue activa, analizando el impacto positivo de hoy en tu **economía**}. {Pausa solar: el momento de usar la **energía** limpia almacenada en el **panel** virtual o batería física|Cierre de jornada: tu **cuenta de la luz** hoy es más baja gracias a la **energía** captada}.",
  };

  const annualSpintax = "{Anualmente, [MUNICIPIO] recibe [ANNUAL] de irradiación, garantizando un **proyecto de energía solar** rentable|La irradiación en [MUNICIPIO] permite que cualquier **empresa** garantice un **ahorro** sólido y veraz al **cliente**|En [PROVINCIA], el potencial de **energía fotovoltaica** acumulada hace de cada **panel** una fuente de ingresos estable}. {Los abundantes kWh/m² de [MUNICIPIO] blindan tu **economía** ante las subidas de la **luz**|Esta geografía permite que un **sistema fotovoltaico** en [MUNICIPIO] rinda con **calidad** superior la mayoría del año}.";

  const title = generateDynamicText(titleSpintax[time], `${municipio}-dyn-title`, vars);
  const part1 = generateDynamicText(time === "night" ? openingSpintax.night : openingSpintax[weather], `${municipio}-dyn-p1`, vars);
  const part2 = generateDynamicText(time === "night" ? middleSpintax.night : middleSpintax[irr], `${municipio}-dyn-p2`, vars);
  const part3 = generateDynamicText(annualSpintax, `${municipio}-dyn-p3`, vars);

  const body = `${part1} ${part2} ${part3}`;
  return { title, body };
}

function getTimeSlot(): "morning" | "afternoon" | "night" {
  const h = new Date().getHours();
  if (h >= 6 && h < 14) return "morning";
  if (h >= 14 && h < 21) return "afternoon";
  return "night";
}

function getWeatherBucket(condition: any): "sunny" | "cloudy" | "rainy" {
  const cond = String(condition).toLowerCase();
  if (cond.includes("clear") || cond.includes("sun") || cond.includes("sunny") || cond.includes("sol") || cond.includes("despejado")) return "sunny";
  if (cond.includes("rain") || cond.includes("lluvia") || cond.includes("storm") || cond.includes("tormenta") || cond.includes("shower")) return "rainy";
  return "cloudy";
}

function getIrradianceBucket(ghi: number | null): "high" | "medium" | "low" {
  if (ghi == null) return "low";
  if (ghi > 500) return "high";
  if (ghi > 200) return "medium";
  return "low";
}

/* ── Component ──────────────────────────────────────────────────── */

type DynamicSeoBlockProps = {
  municipio: string;
  provincia: string;
  irradiacionAnual?: number | null;
  precioMedioLuz?: number;
};

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
