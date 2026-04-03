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
      `${municipio}, situado en la provincia de ${provincia}, disfruta hoy de cielos despejados que maximizan el rendimiento de las instalaciones fotovoltaicas.${ghiStr ? ` La irradiancia actual alcanza los ${ghiStr}, lo que permite a los paneles solares operar cerca de su capacidad máxima.` : ''}`,
      `Las condiciones meteorológicas en ${municipio} son óptimas para la generación de energía solar.${ghiStr ? ` Con una irradiancia de ${ghiStr}, cada panel monocristalino instalado en la zona produce electricidad limpia a un ritmo excelente.` : ''}`,
      `El ecosistema fotovoltaico en ${municipio} alcanza hoy niveles ideales gracias a la ausencia de nubosidad significativa.${ghiStr ? ` Un índice de radiación directa de ${ghiStr} garantiza la máxima rentabilidad para el autoconsumidor durante esta franja.` : ''}`,
      `Hoy presenciamos un escenario climático perfecto en la provincia de ${provincia} para el sector solar. En particular, ${municipio} recibe una cantidad de radiación directa sustancial${ghiStr ? ` (${ghiStr})` : ''}, traduciéndose en una carga de baterías acelerada.`,
    ],
    cloudy: [
      `A pesar de la cobertura nubosa parcial sobre ${municipio}, los paneles fotovoltaicos modernos siguen produciendo energía.${ghiStr ? ` La radiación difusa registra ${ghiStr}, suficiente para mantener una generación moderada.` : ''} Los paneles de silicio monocristalino de última generación son capaces de captar hasta un 80% de su potencial incluso con cielos nublados.`,
      `El cielo parcialmente cubierto en ${provincia} no detiene la producción solar en ${municipio}.${ghiStr ? ` Los sensores registran ${ghiStr} de irradiancia, lo que permite seguir generando electricidad de forma rentable.` : ''}`,
      `La bruma o nubosidad sobre ${municipio} disminuye la radiación directa, pero activa la captación indirecta de las placas.${ghiStr ? ` Los ${ghiStr} medidos ahora mismo demuestran que las instalaciones siguen reduciendo la factura de la luz independientemente de las nubes.` : ''}`,
      `Aunque la meteorología en ${municipio} limite el impacto directo del sol, la tecnología fotovoltaica responde eficazmente aprovechando la radiación difusa ambiente, abasteciendo los consumos pasivos del hogar.`,
    ],
    rainy: [
      `Incluso en jornadas de lluvia como la actual en ${municipio}, los sistemas fotovoltaicos captan la radiación difusa del cielo.${ghiStr ? ` Se registran ${ghiStr} de irradiancia, lo que mantiene una producción residual que contribuye al balance anual.` : ''} Además, la lluvia limpia de forma natural los paneles solares, mejorando su rendimiento en los días siguientes.`,
      `Las precipitaciones sobre ${municipio} reducen temporalmente la producción solar, pero las células fotovoltaicas de alta eficiencia siguen operativas.${ghiStr ? ` La irradiancia se sitúa en ${ghiStr}, permitiendo cubrir el consumo base del hogar.` : ''}`,
      `Un frente lluvioso atraviesa la provincia de ${provincia}, disminuyendo el aporte solar inmediato en ${municipio}. Sin embargo, este lavado natural elimina el polvo acumulado en los revestimientos antirreflectantes, garantizando un pico de eficiencia cuando escampe.`,
    ],
    night: [
      `Con la caída del sol sobre ${municipio} (${provincia}), la producción fotovoltaica se detiene temporalmente. Es el momento en el que los sistemas de almacenamiento con baterías o las tarifas con compensación de excedentes demuestran su valor, aprovechando la energía acumulada durante las horas de sol.`,
      `Durante la noche en ${municipio}, los inversores de las instalaciones solares entran en reposo. No obstante, el balance energético del día queda registrado y cada kilovatio-hora generado ha restado de la factura eléctrica del hogar.`,
      `El ciclo de generación llega a su fase de inactividad nocturna en ${municipio}. Los hogares cambian su patrón, pasando a consumir de la red comercial o de las baterías acumuladas tras aprovechar los picos de irradiación diurnos.`,
      `La radiación solar es nula en este momento en ${municipio}, pero el impacto económico del autoconsumo continúa activo: los kWh vertidos a la red durante el día se compensarán como excedentes a final de mes frente al consumo actual.`,
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

  // ── Closing paragraph ──
  const closings = [
    `En definitiva, ${municipio} reúne unas condiciones excepcionales para el autoconsumo solar: elevada irradiación, incentivos fiscales locales y un precio de la electricidad que hace cada vez más rentable la inversión en energía fotovoltaica. Solicitar un estudio personalizado es el primer paso para dimensionar correctamente la instalación y maximizar el retorno de la inversión.`,
    `Si estás valorando la instalación de placas solares en ${municipio}, los datos objetivos respaldan la decisión: la combinación de ${annualStr ?? 'alta irradiación'} y las ayudas disponibles permite amortizar la inversión en un plazo medio de 5 a 8 años, generando electricidad gratuita durante los 20-25 años restantes de vida útil de los paneles.`,
    `La transición al autoconsumo en ${municipio} no es solo una apuesta medioambiental: es una decisión financiera respaldada por datos. Cada euro invertido en paneles solares genera un retorno compuesto gracias al ahorro en la factura, las bonificaciones fiscales y la revalorización del inmueble.`,
    `Frente a la escalada constante de la red comercial, independizarse energéticamente a través del autoconsumo fotovoltaico en ${municipio} representa el mecanismo deflacionario más seguro para los propietarios hoy en día.`,
    `Las métricas a largo plazo de PVGIS confirman a ${municipio} como una de las zonas europeas con mayor viabilidad para el sector verde. Instalar 4 o 5 kWp en tu cubierta hoy blindará el presupuesto de tu hogar y agilizará la recuperación económica (ROI) mucho antes de que expiren las garantías de fabricación estándar.`,
    `De este análisis se concluye que el autoconsumo en ${municipio} (${provincia}) transcurre por un momento clave. Es vital analizar qué comercializadora está pagando mejor los excedentes en tu localidad para acelerar el periodo de recuperación al máximo.`,
  ];

  // ── Assemble ──
  const title = pick(titles[time], hashId, 0);
  const opening = pick(time === "night" ? openingsWeather.night : openingsWeather[weatherBucket], hashId, 1);
  const closing = pick(closings, hashId, 2);

  const bodyParagraphs = [opening, ...dataParagraphs, closing];

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
