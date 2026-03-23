"use client";

import { useWeather } from "@/components/providers/WeatherProvider";

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

/* ── Text generator (27 combinations) ───────────────────────────── */

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

function generateText(
  municipio: string,
  provincia: string,
  time: "morning" | "afternoon" | "night",
  weather: "sunny" | "cloudy" | "rainy",
  irr: "high" | "medium" | "low",
  ghi: number | null,
  temp: number,
  uv: number,
  precioKwh: number,
  irradiacionAnual: number | null,
): { title: string; body: string } {
  const ghiStr = ghi ? `${Math.round(ghi)} W/m²` : "datos no disponibles";
  const production5kw = ghi ? (ghi / 1000 * 5 * 0.80) : 0;
  const savingsToday = production5kw * 6 * precioKwh;
  const annualStr = irradiacionAnual ? `${fmt(irradiacionAnual)} kWh/m²` : null;

  const hashId = getStringHash(`${municipio}-${time}-${weather}-${irr}`);

  // Time-variant title variations
  const timeTitles = {
    morning: [
      `Producción solar esta mañana en ${municipio}`,
      `Amanece en ${municipio}: Rendimiento fotovoltaico actual`,
      `Datos de radiación solar matutina para ${municipio}`,
      `Energía solar al comienzo del día en ${municipio}`,
      `El sol de la mañana en ${municipio}: Generación en vivo`
    ],
    afternoon: [
      `Rendimiento solar esta tarde en ${municipio}`,
      `Generación fotovoltaica vespertina en ${municipio}`,
      `Balance de energía solar en ${municipio} esta tarde`,
      `Estado de tu instalación solar hoy en ${municipio}`,
      `Aprovechamiento solar durante la tarde en ${municipio}`
    ],
    night: [
      `Balance solar del día en ${municipio}`,
      `Resumen nocturno de energía solar en ${municipio}`,
      `Cae la noche en ${municipio}: Análisis de producción`,
      `Datos de rentabilidad solar diaria para ${municipio}`,
      `Termina la jornada solar en ${municipio} (${provincia})`
    ],
  };

  const openings = {
    night: [
      `Al caer la noche sobre ${municipio} (${provincia}), la producción solar se detiene, pero el balance del día ha sido contabilizado.`,
      `Con el sol ya puesto en ${municipio}, los sistemas de autoconsumo fotovoltaico entran en reposo tras una jornada de captación óptima.`,
      `Durante estas horas nocturnas en ${municipio}, las placas solares no generan energía directa, permitiendo analizar el volumen de ahorro conseguido hoy.`,
      `El cielo nocturno de ${provincia} cubre ${municipio}, marcando el fin del ciclo de generación diurna y el momento ideal para que las baterías solares tomen el relevo.`,
      `La instalación fotovoltaica en ${municipio} descansa a esta hora, habiendo completado su ciclo diario de transformación de luz en ahorro directo.`
    ],
    sunny: [
      `${time === "morning" ? "Esta mañana" : "Esta tarde"}, ${municipio} disfruta de cielos despejados con una destacada irradiancia solar de ${ghiStr}.`,
      `Bajo el cielo claro de ${municipio}, los módulos solares están trabajando a un excelente ritmo gracias a los ${ghiStr} de radiación directa.`,
      `Actualmente, las condiciones meteorológicas despejadas en ${provincia} permiten que las placas en ${municipio} capten ${ghiStr} de forma ininterrumpida.`,
      `El potente sol que brilla sobre ${municipio} garantiza una alta eficiencia energética, registrando niveles de ${ghiStr} en tiempo real.`,
      `Con la ausencia de nubes en ${municipio}, la generación fotovoltaica goza de una entrada limpia de luz equivalente a ${ghiStr}.`
    ],
    cloudy: [
      `A pesar de los cielos parcialmente nublados sobre ${municipio}, los paneles fotovoltaicos siguen produciendo energía con una irradiancia de ${ghiStr}.`,
      `Aunque la cubierta nubosa filtra parte de la luz en ${provincia}, las instalaciones en ${municipio} mantienen su actividad captando ${ghiStr} de radiación difusa.`,
      `Las nubes actuales en ${municipio} reducen el impacto directo del sol, pero la tecnología solar moderna logra extraer ${ghiStr} efectivos.`,
      `El clima nublado de hoy en ${municipio} demuestra que el autoconsumo no se detiene, consiguiendo una irradiancia operativa de ${ghiStr}.`,
      `Incluso sin sol directo, el entorno de ${municipio} recibe suficiente claridad para que el sistema marque ${ghiStr} de captación solar.`
    ],
    rainy: [
      `Incluso con lluvia en ${municipio}, los paneles solares modernos captan radiación difusa, registrando ${ghiStr} de irradiancia.`,
      `Bajo el clima lluvioso que cruza ${provincia}, las placas en ${municipio} siguen operativas aprovechando los fotones residuales (${ghiStr}).`,
      `A pesar del temporal en ${municipio}, los cristales fotovoltaicos se limpian naturalmente mientras siguen generando a partir del resplandor de ${ghiStr}.`,
      `La lluvia actual sobre ${municipio} reduce el rendimiento pico, pero no apaga el sistema, que sigue produciendo con base en ${ghiStr}.`,
      `El cielo encapotado y lluvioso en ${municipio} nos recuerda que las nuevas células monocristalinas rinden incluso con mal tiempo, capturando ${ghiStr}.`
    ]
  };

  const middles = {
    high: [
      `Con esta radiación, una instalación típica de 5 kW en ${municipio} produce aproximadamente ${production5kw.toFixed(1)} kWh cada hora, sumando un ahorro estimado de ${savingsToday.toFixed(2)} € solo hoy.`,
      `Este pico de potencia permite generar hasta ${production5kw.toFixed(1)} kWh por hora de funcionamiento continuo, restando directamente unos ${savingsToday.toFixed(2)} € a tu próxima factura.`,
      `Semejante nivel de irradiancia impulsa el sistema casi al máximo, vertiendo ${production5kw.toFixed(1)} kW de potencia útil y disparando los márgenes de rentabilidad.`,
      `Las placas monocristalinas instaladas en tejados de ${municipio} están generando ahora mismo unos ${production5kw.toFixed(1)} kWh en instalaciones estándar, acelerando el retorno de la inversión.`,
      `Si aprovechas esta curva de sol para encender electrodomésticos, el ahorro en ${municipio} se multiplicará, al estar volcando casi ${production5kw.toFixed(1)} kWh/h limpios.`
    ],
    medium: [
      `La producción actual en ${municipio} se sitúa en torno al 40-60% de la capacidad máxima del sistema. Aun así, cada kWh generado reduce la factura eléctrica al precio actual de ${precioKwh.toFixed(2)} €/kWh.`,
      `Esta generación moderada es suficiente para cubrir el consumo base permanente de una vivienda en ${municipio}, evitando depender de la red al precio de ${precioKwh.toFixed(2)} €.`,
      `El ritmo actual estabiliza el consumo familiar; todo lo generado en ${municipio} durante estas horas supone una inyección directa de eficiencia y ahorro recurrente.`,
      `A este nivel medio, las baterías solares (si las hay) comienzan a cargarse lentamente mientras cubren simultáneamente los gastos eléctricos de la casa.`,
      `Con la curva de producción de hoy, los hogares con energía solar en ${provincia} mantienen un nivel de autosuficiencia muy equilibrado sin gastos imprevistos.`
    ],
    low: [
      `En condiciones de baja irradiancia, los paneles de última generación mantienen entre un 10% y un 25% de su producción nominal gracias a su alta sensibilidad.`,
      `Aunque la curva baje, la tensión constante en el inversor asegura que en ${municipio} se siga aprovechando hasta la más mínima claridad del día.`,
      `Es en estos momentos de baja exposición cuando la alta eficiencia de las placas tier-1 marca la diferencia respecto a sistemas obsoletos.`,
      `La energía basal que entra sirve perfectamente para mantener el frigorífico, el router y la electrónica en reposo de un hogar en ${municipio} a coste cero.`,
      `Esta bajada temporal afecta al pico máximo, pero el balance final diario en ${municipio} suele compensarse con las horas centrales de gran producción.`
    ],
    night: [
      `El descanso nocturno de las placas solares permite a la red eléctrica o a los acumuladores de las baterías satisfacer la demanda nocturna habitual.`,
      `Quienes disponen de almacenamiento virtual o baterías físicas en ${municipio} aprovechan las horas nocturnas para usar el excedente previamente acumulado.`,
      `Mientras el sistema descansa, los inversores inteligentes mantienen monitorizado todo el circuito, listos para arrancar con los primeros rayos de sol del día siguiente en ${provincia}.`,
      `La desconexión natural del sol marca el cierre cronológico donde tu aplicación solar calculará exactamente cuántos kilogramos de CO2 has evitado hoy.`,
      `Esta pausa térmica favorece la vida útil de los semiconductores integrados en las placas, preparándolos para un nuevo ciclo fotovoltaico al amanecer en ${municipio}.`
    ]
  };

  const annuals = [
    `A lo largo del año, ${municipio} acumula una irradiación solar de ${annualStr ?? "altísimos valores"}, posicionándose como una zona privilegiada para el autoconsumo dentro de ${provincia}.`,
    `Si revisamos la media histórica, los tejados de ${municipio} reciben unos formidables ${annualStr ?? "niveles sobresalientes"} de Sol al año, haciendo de cada instalación una inversión extremadamente segura.`,
    `Toda la comarca y la zona alrededor de ${municipio} despuntan a nivel europeo al registrar medias de radiación muy constantes, superando fácilmente la cuota de ${annualStr ?? "rentabilidad básica"}.`,
    `En perspectiva macro, los más de ${annualStr ?? "numerosos kWh/m²"} que caen anualmente aseguran que cualquier panel fotovoltaico en ${municipio} se amortice rápida y limpiamente.`,
    `Esta privilegiada geografía permite que ${municipio} alcance un registro fotovoltaico anual de ${annualStr ?? "gran calibre"}, atrayendo cada vez a más familias y empresas a la transición energética.`
  ];

  // Pick variations using deterministic offsets so they feel beautifully composed
  const title = pick(timeTitles[time], hashId, 0);
  const part1 = pick(time === "night" ? openings.night : openings[weather], hashId, 1);
  const part2 = pick(time === "night" ? middles.night : middles[irr], hashId, 2);
  const part3 = pick(annuals, hashId, 3);

  // Closing — contextual modifiers (optional if certain conditions hit)
  let partContext = "";
  if (temp > 30 && time !== "night") {
    const tempOpts = [
      `La actual temperatura de ${Math.round(temp)}°C provoca una ligera caída en el voltaje de salida (-0.4% por cada grado extra), compensada sobradamente por la luminosidad.`,
      `Con el termómetro marcando ${Math.round(temp)}°C, las placas experimentan calor operativo, algo totalmente dentro del rango normal de cualquier panel moderno de silicio.`,
      `A pesar de los ${Math.round(temp)}°C actuando sobre los cristales térmicos, los paneles seguirán inyectando potencia continua en las redes de ${municipio}.`
    ];
    partContext = " " + pick(tempOpts, hashId, 4);
  } else if (uv > 6 && time !== "night") {
    const uvOpts = [
      `El potente índice UV (${uv}) nos subraya la intensidad pura de la radiación existente ahora mismo, algo ideal para maximizar la curva de potencia eléctrica.`,
      `La fuerte carga ultravioleta de nivel ${uv} que atraviesa la atmósfera de ${municipio} dispara la generación de foto-electrones en las placas instaladas.`,
      `Alcanzar un índice de radiación UV de ${uv} acelera drásticamente la capacidad de carga de cualquier batería solar y garantiza un autoconsumo pleno.`
    ];
    partContext = " " + pick(uvOpts, hashId, 5);
  }

  const body = `${part1} ${part2}${partContext} ${part3}`;

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

  if (loading || error || !data) return null;

  const ghi = data.ghi ?? data.short_rad ?? null;
  const time = getTimeSlot();
  const weather = getWeatherBucket(data.condition);
  const irr = getIrradianceBucket(ghi);

  const { title, body } = generateText(
    municipio, provincia, time, weather, irr,
    ghi, data.temp_c, data.uv, precioMedioLuz, irradiacionAnual ?? null,
  );

  return (
    <section className="mt-5 rounded-xl border border-slate-200 p-5">
      <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>
      <p className="mt-3 leading-relaxed text-slate-700">{body}</p>
      <p className="mt-2 text-xs text-slate-400">
        Datos actualizados en tiempo real · {data.localtime} · Fuente: WeatherAPI
      </p>
    </section>
  );
}
