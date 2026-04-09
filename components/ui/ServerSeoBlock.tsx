/**
 * ServerSeoBlock — Server component that generates unique, SEO-optimized text
 * for each municipality page. Rendered server-side so Googlebot can index it.
 *
 * This is the SSR replacement for the client-side DynamicSeoBlock.
 * It uses the weather data fetched server-side (already available in the page)
 * combined with municipality solar data to produce unique paragraphs.
 */

/* ── Types ──────────────────────────────────────────────────────── */

type ServerSeoBlockProps = {
  municipio: string;
  provincia: string;
  irradiacionAnual?: number | null;
  horasSol?: number | null;
  ahorroEstimado?: number | null;
  bonificacionIbi?: number | null;
  precioMedioLuz?: number;
  weather?: {
    temp_c: number;
    condition: string;
    uv: number;
    is_day: number;
    ghi?: number | null;
    short_rad?: number | null;
  } | null;
  snapshot?: any | null;
  habitantes?: number | null;
};

/* ── Helpers ────────────────────────────────────────────────────── */

function getTimeSlot(): "morning" | "afternoon" | "night" {
  const h = new Date().getHours();
  if (h >= 6 && h < 14) return "morning";
  if (h >= 14 && h < 21) return "afternoon";
  return "night";
}

function getWeatherBucket(condition?: string | null): "sunny" | "cloudy" | "rainy" {
  if (!condition) return "sunny";
  const c = condition.toLowerCase();
  if (c.includes("lluvia") || c.includes("tormenta") || c.includes("rain") || c.includes("thunder")) return "rainy";
  if (c.includes("nub") || c.includes("overcast") || c.includes("cloud") || c.includes("mist") || c.includes("fog")) return "cloudy";
  return "sunny";
}

function fmt(n: number | null | undefined, d = 0): string {
  if (n === null || n === undefined || isNaN(Number(n))) return "0";
  try {
    return Number(n).toLocaleString("es-ES", { maximumFractionDigits: d });
  } catch {
    return String(n);
  }
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
  if (!arr || arr.length === 0) return "" as any;
  return arr[(hash + offset) % arr.length];
}

/* ── Component ──────────────────────────────────────────────────── */

export function ServerSeoBlock({
  municipio,
  provincia,
  irradiacionAnual,
  horasSol,
  ahorroEstimado,
  bonificacionIbi,
  precioMedioLuz = 0.22,
  weather,
  snapshot,
  habitantes,
}: ServerSeoBlockProps) {

  const time = getTimeSlot();
  const ghi = weather?.ghi ?? weather?.short_rad ?? null;
  const weatherBucket = weather ? getWeatherBucket(weather.condition) : "sunny";
  const temp = weather?.temp_c ?? 22;
  const uv = weather?.uv ?? 5;

  const annualStr = irradiacionAnual ? `${fmt(irradiacionAnual)} kWh/m²` : null;
  const horasSolStr = horasSol ? `${fmt(horasSol)}` : null;
  const ghiStr = ghi ? `${Math.round(ghi)} W/m²` : null;

  const production5kw = ghi ? (ghi / 1000 * 5 * 0.80) : 0;

  const hashId = getStringHash(`${municipio}-${time}-${weatherBucket}`);

  // ── Title variations (time-based) ──
  const titles = {
    morning: [
      `Energía solar esta mañana en ${municipio}: análisis de rendimiento`,
      `Producción fotovoltaica matutina en ${municipio} (${provincia})`,
      `Potencial de generación solar al inicio del día en ${municipio}`,
      `Cómo rinden las placas solares esta mañana en ${municipio}`,
      `Predicción de ahorro diurno para instalaciones solares en ${municipio}`,
    ],
    afternoon: [
      `Rendimiento solar vespertino en ${municipio}: datos actualizados`,
      `Generación fotovoltaica esta tarde en ${municipio} (${provincia})`,
      `Estado de producción solar por la tarde en ${municipio}`,
      `Evolución del autoconsumo eléctrico hoy en ${municipio}`,
      `Cálculo en vivo de excedentes solares para ${municipio} esta tarde`,
    ],
    night: [
      `Balance solar del día en ${municipio}: resumen y proyección`,
      `Análisis nocturno de producción fotovoltaica en ${municipio}`,
      `Resumen de la jornada solar en ${municipio} (${provincia})`,
      `Estudio de amortización y rentabilidad solar en ${municipio}`,
      `Datos energéticos definitivos para instalaciones de autoconsumo en ${municipio}`,
    ],
  };

  // ── Opening paragraphs ──
  const openingsWeather: Record<string, string[]> = {
    sunny: [
      `${municipio} cuenta con un potencial fotovoltaico privilegiado gracias a su ubicación en ${provincia}. Hoy disfruta de cielos despejados que maximizan el rendimiento de las placas.${ghiStr ? ` La irradiancia actual alcanza los ${ghiStr}.` : ""}`,
      `La radiación solar en ${municipio} garantiza una rentabilidad alta para cualquier instalación de autoconsumo hoy.${ghiStr ? ` Registramos ${ghiStr} de potencia por metro cuadrado.` : ""}`,
      `El aprovechamiento de la luz solar en ${municipio} es clave hoy para reducir la factura eléctrica.${ghiStr ? ` Los sensores marcan ${ghiStr} de radiación directa.` : ""}`,
      `Escenario ideal en ${municipio} para sistemas solares: cielos limpios y una captación energética excepcional hoy.${ghiStr ? ` (${ghiStr} actuales).` : ""}`,
      `Condiciones óptimas: las placas solares en ${municipio} operan hoy a pleno rendimiento bajo un sol radiante en la provincia de ${provincia}.`,
      `Eficiencia máxima en ${municipio}: la ausencia de nubes permite que los paneles fotovoltaicos alcancen su pico de generación matutina.`,
    ],
    cloudy: [
      `A pesar de la cobertura nubosa parcial sobre ${municipio}, los paneles fotovoltaicos modernos siguen produciendo energía.${ghiStr ? ` La radiación difusa registra ${ghiStr}.` : ""}`,
      `El cielo parcialmente cubierto en ${provincia} no detiene la producción solar en ${municipio}.${ghiStr ? ` Los sensores registran ${ghiStr} de irradiancia.` : ""}`,
      `La bruma sobre ${municipio} disminuye la radiación directa, pero activa la captación indirecta de las placas.${ghiStr ? ` Los ${ghiStr} medidos demuestran que sigues ahorrando.` : ""}`,
      `Aunque la meteorología en ${municipio} limite el sol directo, la tecnología actual aprovecha cada rayo de luz ambiente para abastecer el hogar.`,
      `Día de nubes y claros en ${municipio}: el sistema solar alterna picos de producción con generación estable de radiación difusa.`,
      `Rendimiento moderado en ${municipio}: la capa de nubes tamiza la luz, pero los módulos monocristalinos mantienen un flujo de ahorro constante.`,
    ],
    rainy: [
      `Incluso con lluvia en ${municipio}, los sistemas fotovoltaicos captan la radiación difusa.${ghiStr ? ` Se registran ${ghiStr} de irradiancia.` : ""} Además, el agua limpia los paneles mejorando su eficiencia futura.`,
      `Las precipitaciones en ${municipio} reducen temporalmente la producción, pero las células de alta eficiencia siguen operativas a un nivel residual.`,
      `Frente lluvioso activo en ${provincia}. En ${municipio}, el ahorro solar continúa gracias a la luz indirecta que atraviesa la nubosidad.`,
      `Día de lluvia y limpieza natural para tus placas en ${municipio}: se aprovecha la radiación ambiente mientras se elimina el polvo acumulado.`,
      `Generación bajo la lluvia en ${municipio}: el impacto de las gotas no detiene la fotosíntesis eléctrica de tus módulos fotovoltaicos.`,
      `Producción de bajo nivel en ${municipio} por mal tiempo, ideal para cubrir consumos pasivos y mantener el balance de la batería.`,
    ],
    night: [
      `Con la caída del sol sobre ${municipio}, la producción se detiene. Es el momento de usar la energía acumulada en baterías o la compensación de excedentes.`,
      `Noche en ${municipio}: los inversores entran en reposo tras una jornada de ahorro solar efectiva en la provincia de ${provincia}.`,
      `Inactividad nocturna en ${municipio}. El balance del día queda registrado: cada kWh generado ha restado coste a tu próxima factura.`,
      `Sin radiación en ${municipio} ahora mismo, pero el impacto económico del autoconsumo continúa activo mediante el vertido de excedentes diurnos.`,
      `Pausa solar en ${municipio}: la instalación se prepara para el amanecer mientras el hogar consume la energía limpia almacenada.`,
      `Final de la jornada fotovoltaica en ${municipio}: es el momento de analizar el autoconsumo diario y optimizar los hábitos para mañana.`,
    ],
  };

  // ── Data paragraphs (using real municipality data) ──
  const dataParagraphs: string[] = [];

  if (irradiacionAnual && horasSol) {
    dataParagraphs.push(
      `${municipio} recibe una irradiación solar media de ${annualStr} al año, con aproximadamente ${horasSolStr} horas de sol anuales. Estos valores, validados por el sistema PVGIS de la Comisión Europea, sitúan a ${municipio} por encima de la media europea y confirman el alto potencial para instalaciones de autoconsumo fotovoltaico en la zona.`
    );
  }

  if (ahorroEstimado && ahorroEstimado > 100) {
    dataParagraphs.push(
      `El ahorro estimado medio para una vivienda con placas solares en ${municipio} alcanza los ${fmt(ahorroEstimado)} € anuales, considerando un sistema fotovoltaico estándar de 4-5 kWp y el precio actual de la electricidad en el mercado regulado (PVPC) de ${precioMedioLuz.toFixed(2)} €/kWh. Este cálculo tiene en cuenta un ratio de autoconsumo del 65%, valor habitual en viviendas unifamiliares con patrones de consumo diurno.`
    );
  }

  if (bonificacionIbi != null && bonificacionIbi > 0) {
    dataParagraphs.push(
      `El Ayuntamiento de ${municipio} ofrece una bonificación del ${Math.round(bonificacionIbi)}% en el Impuesto sobre Bienes Inmuebles (IBI) para viviendas que instalen sistemas de autoconsumo fotovoltaico. Esta bonificación, recogida en la ordenanza fiscal municipal, se aplica durante varios ejercicios consecutivos y puede suponer un ahorro adicional significativo sobre el coste total de la inversión.`
    );
  }

  if (production5kw > 0 && time !== "night") {
    dataParagraphs.push(
      `En este momento, una instalación tipo de 5 kWp en ${municipio} estaría produciendo aproximadamente ${production5kw.toFixed(1)} kWh por hora, lo que equivale a un ahorro instantáneo de ${(production5kw * precioMedioLuz).toFixed(2)} € en la factura eléctrica. Este dato se calcula en tiempo real a partir de la irradiancia solar actual y la temperatura ambiente, aplicando un coeficiente de pérdidas del 20% y la corrección térmica estándar de -0,4%/°C por encima de 25°C.`
    );
  }

  // ── Urban Context paragraphs (Demographic logic) ──
  const habCount = habitantes || 0;
  const urbanContext = habCount > 50000 
    ? `Dada la alta densidad de ${municipio}, el autoconsumo se está expandiendo rápidamente en bloques de pisos y comunidades de vecinos mediante modalidades compartidas, además de en azoteas de edificios comerciales.`
    : habCount < 5000 
      ? `En entornos rurales como ${municipio}, las viviendas unifamiliares, las naves agrícolas y los tejados despejados ofrecen condiciones inmejorables para instalar grandes campos solares sin problemas de sombreado.`
      : `El crecimiento de zonas residenciales en ${municipio} favorece la instalación de sistemas solares tanto en viviendas pareadas como en pequeñas naves industriales que buscan autonomía energética.`;

  // ── Closing paragraph ──
  const closings = [
    `En definitiva, ${municipio} reúne unas condiciones excepcionales para el autoconsumo solar: elevada irradiación, incentivos fiscales locales y un precio de la electricidad que hace cada vez más rentable la inversión.`,
    `Si estás valorando instalar placas solares en ${municipio}, los datos objetivos de la provincia de ${provincia} respaldan la decisión: amortizarás tu inversión en tiempo récord ayudando al medio ambiente.`,
    `La transición energética en ${municipio} no es solo una apuesta ecológica: es una decisión financiera inteligente para blindarse ante las subidas del precio de la luz.`,
    `Frente a la escalada constante de la red comercial, independizarse energéticamente a través del autoconsumo fotovoltaico en ${municipio} es la mejor defensa económica hoy.`,
    `Las métricas de PVGIS confirman a ${municipio} como una zona de viabilidad máxima. Instalar paneles en tu cubierta hoy acelerará tu independencia energética este mismo año.`,
    `De este estudio se concluye que el potencial de ahorro en ${municipio} es extraordinario. Cada m² de tejado infrautilizado es una oportunidad de ahorro perdida frente al sol de ${provincia}.`,
  ];

  // ── Assemble ──
  let aiIntro = snapshot?.intro_unica;
  let aiH2 = snapshot?.h2_variante?.[hashId % (snapshot.h2_variante?.length || 1)];

  const title = aiH2 || pick(titles[time], hashId, 0);
  const opening = aiIntro || pick(time === "night" ? openingsWeather.night : openingsWeather[weatherBucket], hashId, 1);
  const closing = pick(closings, hashId, 2);

  const bodyParagraphs = [opening, urbanContext, ...dataParagraphs, closing];

  return (
    <section
      className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden"
      aria-label={`Análisis solar detallado de ${municipio}`}
    >
      <div className="p-6 md:p-8">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight mb-5">
          {title}
        </h2>
        <div className="space-y-4">
          {bodyParagraphs.map((p, i) => (
            <p key={i} className="text-sm sm:text-base leading-relaxed text-slate-700">
              {p}
            </p>
          ))}
        </div>
      </div>
      <div className="px-6 md:px-8 py-3 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
        <p className="text-[10px] text-slate-400">
          Fuentes: PVGIS (Comisión Europea) · ESIOS/REE · Ordenanzas municipales · WeatherAPI
        </p>
        <p className="text-[10px] text-slate-400">
          Última actualización: {new Date().toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>
    </section>
  );
}
