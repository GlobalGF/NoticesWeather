/**
 * CityClimateSolarProfile — Server component
 * Renders a climate-zone-specific solar analysis with highly differentiated
 * text per municipality. Uses irradiation + sun hours + population to
 * classify into one of 4 climate buckets, each producing entirely different
 * copy, advice, and technical recommendations.
 *
 * This is the primary differentiator that makes each city page unique.
 */

type Props = {
  municipio: string;
  provincia: string;
  comunidadAutonoma: string;
  irradiacionSolar: number | null;
  horasSol: number | null;
  ahorroEstimado: number | null;
  bonificacionIbi: number | null;
  precioLuz: number;
  habitantes: number | null;
};

/* ── Helpers ────────────────────────────────────────────────────── */

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function pick<T>(arr: T[], h: number, offset = 0): T {
  return arr[(h + offset) % arr.length];
}

function fmt(v: number | null | undefined, d = 0): string {
  if (v == null || isNaN(Number(v))) return "—";
  return Number(v).toLocaleString("es-ES", { maximumFractionDigits: d });
}

function cleanName(name: string): string {
  if (!name) return "";
  if (name.includes("/")) return (name.split("/")[1] || name.split("/")[0]).trim();
  return name.trim();
}

/* ── Classification ─────────────────────────────────────────────── */

type SolarTier = "excepcional" | "alto" | "medio" | "moderado";

function getSolarTier(irrad: number, horas: number): SolarTier {
  const score = irrad * 0.6 + horas * 0.4;
  if (score >= 2200) return "excepcional";
  if (score >= 1800) return "alto";
  if (score >= 1500) return "medio";
  return "moderado";
}

type PopSize = "grande" | "mediana" | "pequena";

function getPopSize(hab: number | null): PopSize {
  if (!hab || hab >= 50000) return "grande";
  if (hab >= 5000) return "mediana";
  return "pequena";
}

/* ── Content banks ──────────────────────────────────────────────── */

const tierConfig = {
  excepcional: {
    badge: "Recurso solar excepcional",
    badgeClass: "bg-amber-100 text-amber-800 border-amber-300",
    barWidth: "w-[95%]",
    barColor: "bg-gradient-to-r from-amber-400 to-orange-500",
    summaryOptions: [
      (m: string, irr: string, h: string) =>
        `${m} se sitúa en el tramo más alto de recurso solar de España, con ${irr} kWh/m² de irradiación global anual y ${h} horas de sol. Estas cifras colocan a la localidad por encima del percentil 90 del territorio nacional, lo que convierte la inversión en autoconsumo fotovoltaico en una de las decisiones financieras más rentables para cualquier hogar.`,
      (m: string, irr: string, h: string) =>
        `Con ${h} horas de sol al año y una irradiación de ${irr} kWh/m², ${m} disfruta de un potencial fotovoltaico excepcional. Cada kWp instalado en esta localidad produce más energía que la media europea, acortando los plazos de amortización a 5–7 años incluso sin bonificación IBI.`,
      (m: string, irr: string, h: string) =>
        `Los datos satelitales de PVGIS (Comisión Europea, 2005–2020) confirman que ${m} recibe ${irr} kWh/m² de irradiación anual y ${h} horas de sol, situándose entre las localizaciones con mayor recurso solar de la Península Ibérica. Una instalación residencial de 5 kWp aquí genera energía suficiente para cubrir entre el 65% y el 80% del consumo medio de un hogar.`,
    ],
    techOptions: [
      (m: string) =>
        `En localidades con recurso solar excepcional como ${m}, los inversores híbridos con gestión de baterías se están convirtiendo en la configuración estándar. La alta producción permite llenar la batería durante las horas centrales del día y consumir energía almacenada por la noche, alcanzando ratios de autoconsumo superiores al 85%.`,
      (m: string) =>
        `Para ${m}, la configuración técnica óptima es un sistema con paneles monocristalinos PERC de alta eficiencia (20–22%) combinados con un inversor de potencia ajustada al consumo. El exceso de producción solar puede compensarse en factura a través del mecanismo de excedentes, generando retornos positivos incluso en los meses de menor demanda.`,
      (m: string) =>
        `La combinación de alta irradiación y temperaturas elevadas en ${m} hace recomendable paneles con bajo coeficiente de temperatura (–0,30 %/°C o inferior). Los módulos tipo half-cut o shingled mantienen mejor rendimiento en condiciones de calor extremo, que es precisamente cuando más producción solar se registra.`,
    ],
  },
  alto: {
    badge: "Recurso solar alto",
    badgeClass: "bg-yellow-100 text-yellow-800 border-yellow-300",
    barWidth: "w-[78%]",
    barColor: "bg-gradient-to-r from-yellow-400 to-amber-500",
    summaryOptions: [
      (m: string, irr: string, h: string) =>
        `${m} cuenta con ${irr} kWh/m² de irradiación y ${h} horas de sol anuales, lo que supone un recurso solar por encima de la media española. Estas condiciones garantizan una producción fotovoltaica estable a lo largo del año, con picos especialmente altos de marzo a septiembre.`,
      (m: string, irr: string, h: string) =>
        `Con una irradiación global de ${irr} kWh/m² y ${h} horas de sol registradas por PVGIS, ${m} ofrece condiciones solares favorables para autoconsumo residencial e industrial. La producción esperada de un sistema de 5 kWp supera los 7 000 kWh al año.`,
      (m: string, irr: string, h: string) =>
        `${m} registra ${h} horas de sol anuales con ${irr} kWh/m² de irradiación, datos que la sitúan en el tramo alto del mapa solar peninsular. La rentabilidad de una instalación fotovoltaica aquí es claramente positiva, con amortizaciones de 6–8 años en la mayoría de perfiles de consumo.`,
    ],
    techOptions: [
      (m: string) =>
        `En ${m}, las instalaciones de autoconsumo más eficientes combinan paneles de 400–450 W con inversor centralizado y monitorización por app. La relación inversión / producción es muy favorable, y la mayoría de sistemas alcanzan el punto de equilibrio antes del 7.º año.`,
      (m: string) =>
        `Para viviendas en ${m}, un sistema de inyección cero (sin verter excedentes) seguido de un redimensionamiento progresivo con batería es la estrategia más recomendada. Permite un desembolso inicial menor y una ampliación cuando los precios de la energía justifiquen el almacenamiento.`,
      (m: string) =>
        `La estacionalidad solar en ${m} muestra un diferencial significativo entre verano e invierno. Por ello, los sistemas con orientación este-oeste (split) están ganando popularidad: producen menos pico a mediodía pero más energía total a primeras y últimas horas, coincidiendo con los momentos de mayor consumo.`,
    ],
  },
  medio: {
    badge: "Recurso solar medio",
    badgeClass: "bg-sky-100 text-sky-800 border-sky-300",
    barWidth: "w-[60%]",
    barColor: "bg-gradient-to-r from-sky-400 to-blue-500",
    summaryOptions: [
      (m: string, irr: string, h: string) =>
        `${m} registra ${irr} kWh/m² de irradiación y ${h} horas de sol anuales. Aunque estas cifras son inferiores a las del sur peninsular, siguen situando a la localidad por encima de la media centroeuropea (donde la fotovoltaica ya es rentable). Un dimensionamiento adecuado es clave para maximizar el retorno de la inversión.`,
      (m: string, irr: string, h: string) =>
        `Con ${h} horas de sol y una irradiación de ${irr} kWh/m², ${m} tiene un recurso solar medio-alto dentro del contexto español. La rentabilidad depende del consumo del hogar: viviendas con facturas superiores a 60 €/mes obtienen amortizaciones de 7–9 años; por debajo de 40 €/mes conviene evaluar con un estudio técnico.`,
      (m: string, irr: string, h: string) =>
        `Los datos PVGIS para ${m} muestran ${irr} kWh/m² de irradiación y ${h} horas de sol. El autoconsumo fotovoltaico sigue siendo rentable: un sistema de 4 kWp produce entre 5 000 y 6 000 kWh al año, suficiente para cubrir el 50–65% del consumo medio de un hogar.`,
    ],
    techOptions: [
      (m: string) =>
        `En zonas con recurso solar medio como ${m}, la clave es ajustar la potencia instalada al consumo real. Sobredimensionar el sistema genera excedentes que solo se compensan a ~0,05 €/kWh, muy por debajo del precio de compra. Un estudio con datos reales de factura es imprescindible.`,
      (m: string) =>
        `Para ${m}, los paneles bifaciales suponen una ventaja competitiva: captan radiación difusa por la cara posterior, lo que aumenta la producción en un 5–10% respecto a módulos convencionales, especialmente en días nublados que son más frecuentes en esta zona.`,
      (m: string) =>
        `La orientación perfecta al sur con inclinación de 33–35° es especialmente importante en ${m}, donde cada grado de desviación tiene un impacto mayor en la producción anual que en zonas de alta irradiación. Un estudio de sombras 3D con lidar minimiza riesgos.`,
    ],
  },
  moderado: {
    badge: "Recurso solar moderado",
    badgeClass: "bg-slate-100 text-slate-700 border-slate-300",
    barWidth: "w-[42%]",
    barColor: "bg-gradient-to-r from-slate-400 to-slate-500",
    summaryOptions: [
      (m: string, irr: string, h: string) =>
        `${m} cuenta con ${irr} kWh/m² de irradiación y ${h} horas de sol anuales, valores en el tramo bajo del mapa solar español. No obstante, estas cifras superan ampliamente las de países como Alemania o Países Bajos (900–1 100 kWh/m²), donde la energía solar es una industria consolidada. Con un diseño correcto, la instalación sigue siendo rentable.`,
      (m: string, irr: string, h: string) =>
        `Con ${h} horas de sol y ${irr} kWh/m² de irradiación, ${m} presenta un recurso solar más contenido que la media. Sin embargo, los precios actuales de la electricidad (PVPC) y las bonificaciones fiscales locales compensan esta diferencia: la amortización se sitúa en 8–10 años, perfectamente viable para una tecnología con vida útil de 25+ años.`,
      (m: string, irr: string, h: string) =>
        `${m} está en la franja de recurso solar moderado (${irr} kWh/m², ${h} h de sol). Aquí, la diferencia entre una instalación rentable y una mediocre la marca el diseño técnico: orientación, inclinación, tecnología de panel y gestión de sombras son los factores decisivos.`,
    ],
    techOptions: [
      (m: string) =>
        `En ${m}, donde las horas de sol son más limitadas, los paneles de alta eficiencia tipo IBC o HJT (heterounión) rentabilizan cada rayo de sol. Aunque su precio es un 15–20% superior al estándar PERC, el diferencial de producción compensa la inversión adicional en 3–4 años.`,
      (m: string) =>
        `Para localidades como ${m} con recurso solar moderado, la recomendación técnica es una instalación conservadora (3–4 kWp) focalizada en cubrir el consumo base (standby, frigorífico, iluminación). Esto maximiza el ratio de autoconsumo (>70%) y minimiza excedentes poco retribuidos.`,
      (m: string) =>
        `La nubosidad frecuente en ${m} favorece paneles con buen comportamiento en radiación difusa. Los módulos de capa fina (thin-film) mantienen producción más estable que los cristalinos en condiciones de cielo cubierto, aunque requieren más superficie de cubierta.`,
    ],
  },
};

const seasonalAdvice = {
  excepcional: [
    "producción muy alta de enero a diciembre con mínimo estacional en noviembre–diciembre",
    "pico de producción de mayo a septiembre con generación superior a 6 kWh/kWp/día",
    "incluso en invierno, la producción supera los 3,5 kWh/kWp/día gracias a los cielos despejados",
  ],
  alto: [
    "producción concentrada entre marzo y octubre, con máximo en junio–julio",
    "estacionalidad moderada: el ratio verano/invierno es de aproximadamente 2,5:1",
    "los meses de febrero y octubre son clave para el balance anual: buenas horas de sol con temperatura óptima",
  ],
  medio: [
    "producción significativa de abril a septiembre, con descenso en los meses de lluvias",
    "la primavera es la estación más productiva: buena irradiación sin las temperaturas extremas del verano",
    "en invierno, el sistema cubre el consumo base pero no el calefactable, reforzando el caso de la aerotermia",
  ],
  moderado: [
    "producción concentrada en verano (mayo–agosto), con fuerte caída en otoño–invierno",
    "los meses de junio y julio compensan la menor producción invernal: aprovechar excedentes es clave",
    "combinar fotovoltaica con aerotermia permite reducir la factura total (electricidad + calefacción) un 50–60%",
  ],
};

const popSizeLabels = {
  grande: "municipio urbano con alta densidad de edificación en bloques y zonas residenciales periféricas con chalets",
  mediana: "localidad de tamaño medio con predominio de vivienda unifamiliar adosada y pequeños bloques de 3–5 plantas",
  pequena: "pueblo con mayoría de viviendas unifamiliares aisladas, cubiertas grandes y escasas restricciones de sombreado",
};

/* ── Component ──────────────────────────────────────────────────── */

export function CityClimateSolarProfile({
  municipio,
  provincia,
  comunidadAutonoma,
  irradiacionSolar,
  horasSol,
  ahorroEstimado,
  bonificacionIbi,
  precioLuz,
  habitantes,
}: Props) {
  const muniClean = cleanName(municipio);
  const provClean = cleanName(provincia);
  const h = hash(municipio);

  const irrad = Number(irradiacionSolar ?? 1650);
  const horas = Number(horasSol ?? 1800);
  const tier = getSolarTier(irrad, horas);
  const popSize = getPopSize(habitantes);
  const cfg = tierConfig[tier];

  const summary = pick(cfg.summaryOptions, h, 0)(muniClean, fmt(irrad), fmt(horas));
  const tech = pick(cfg.techOptions, h, 1)(muniClean);
  const seasonal = pick(seasonalAdvice[tier], h, 2);

  const yearNow = new Date().getFullYear();

  // Comparative reference points
  const vsGermany = Math.round((irrad / 1050) * 100 - 100);
  const vsSpainAvg = Math.round((irrad / 1660) * 100 - 100);
  const product5kw = Math.round(horas / 365 * 5 * 0.80 * 365);

  const profileTitles = [
    `Perfil solar de ${muniClean}: ${fmt(irrad)} kWh/m² — Análisis ${yearNow}`,
    `${muniClean} recibe ${fmt(horas)} horas de sol al año — Informe climático ${yearNow}`,
    `Recurso solar de ${muniClean}: ${vsGermany > 0 ? `+${vsGermany}%` : `${vsGermany}%`} vs. Alemania`,
    `Análisis fotovoltaico de ${muniClean}: ${fmt(irrad)} kWh/m² y ${fmt(horas)} h de sol`,
  ];

  return (
    <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-100">
        <div className="flex items-center gap-3 flex-wrap mb-3">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">
            {pick(profileTitles, h, 4)}
          </h2>
          <span className={`rounded border px-2 py-0.5 text-xs font-bold ${cfg.badgeClass}`}>
            {cfg.badge}
          </span>
        </div>
        <p className="text-xs text-slate-500">
          Datos: PVGIS (Comisión Europea) · Serie 2005–2020 · Provincia de {provClean}, {cleanName(comunidadAutonoma)}
        </p>
      </div>

      <div className="px-6 py-5 space-y-6">
        {/* Solar resource bar */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-slate-700">Potencial fotovoltaico</span>
            <span className="text-xs text-slate-500">{fmt(irrad)} kWh/m² · {fmt(horas)} h sol/año</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
            <div className={`h-full rounded-full ${cfg.barColor} ${cfg.barWidth} transition-all duration-500`} />
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 mt-1">
            <span>900 kWh/m²</span>
            <span>1 400</span>
            <span>1 800</span>
            <span>2 200+</span>
          </div>
        </div>

        {/* Main analysis text */}
        <div className="prose prose-sm max-w-none text-slate-600">
          <p>{summary}</p>
          <p className="mt-3">{tech}</p>
          <p className="mt-3">
            <strong>Estacionalidad:</strong> {seasonal}. Este patrón debe tenerse en cuenta al dimensionar 
            la instalación y negociar la compensación de excedentes con la distribuidora.
          </p>
        </div>

        {/* Comparative data grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-lg bg-slate-50 border border-slate-100 p-4 text-center">
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">vs. Media de España</p>
            <p className={`text-2xl font-black tabular-nums ${vsSpainAvg >= 0 ? "text-emerald-600" : "text-amber-600"}`}>
              {vsSpainAvg >= 0 ? "+" : ""}{vsSpainAvg}%
            </p>
            <p className="text-[10px] text-slate-400 mt-1">irradiación (ref. 1 660 kWh/m²)</p>
          </div>
          <div className="rounded-lg bg-slate-50 border border-slate-100 p-4 text-center">
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">vs. Alemania</p>
            <p className="text-2xl font-black text-emerald-600 tabular-nums">+{vsGermany}%</p>
            <p className="text-[10px] text-slate-400 mt-1">irradiación (ref. 1 050 kWh/m²)</p>
          </div>
          <div className="rounded-lg bg-slate-50 border border-slate-100 p-4 text-center">
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">Producción 5 kWp</p>
            <p className="text-2xl font-black text-blue-600 tabular-nums">{fmt(product5kw)}</p>
            <p className="text-[10px] text-slate-400 mt-1">kWh/año estimados</p>
          </div>
        </div>

        {/* Urbanistic context */}
        <div className="rounded-lg bg-blue-50 border border-blue-100 p-4">
          <p className="text-xs font-semibold text-blue-800 mb-1">Contexto urbanístico de {muniClean}</p>
          <p className="text-xs text-blue-700 leading-relaxed">
            {muniClean} es un {popSizeLabels[popSize]}.
            {habitantes && <> Con una población de {fmt(habitantes)} habitantes, </>}
            {popSize === "grande" && "las instalaciones sobre cubierta plana representan la mayor oportunidad, tanto para autoconsumo individual como compartido. La normativa urbanística local puede requerir licencia de obra menor según la ordenanza municipal vigente."}
            {popSize === "mediana" && "la demanda de autoconsumo residencial crece cada año. Las cubiertas inclinadas son habituales y generalmente no requieren estructura soporte adicional, reduciendo el coste de la instalación un 10–15%."}
            {popSize === "pequena" && "la escasa obstrucción entre edificios permite aprovechar al máximo la irradiación solar. Los tejados amplios y bien orientados son la principal ventaja frente a entornos urbanos más densos."}
          </p>
        </div>

        {/* Financial context */}
        {bonificacionIbi != null && bonificacionIbi > 0 && (
          <div className="rounded-lg bg-emerald-50 border border-emerald-100 p-4">
            <p className="text-xs font-semibold text-emerald-800 mb-1">Ventaja fiscal en {muniClean}</p>
            <p className="text-xs text-emerald-700 leading-relaxed">
              El Ayuntamiento de {muniClean} aplica una bonificación del {bonificacionIbi}% sobre el IBI
              durante los primeros años tras la instalación de placas solares. Este incentivo fiscal, combinado
              con un ahorro estimado de {fmt(ahorroEstimado)} €/año en la factura eléctrica, reduce la
              amortización real de la inversión por debajo de las estimaciones estándar.
            </p>
          </div>
        )}
      </div>

      {/* Source footer */}
      <div className="px-6 py-3 bg-slate-50 border-t border-slate-200">
        <p className="text-[10px] text-slate-400">
          Fuentes: PVGIS (Joint Research Centre, Comisión Europea) · Datos satelitales 2005–2020 · INE (población)
          · Ordenanzas fiscales de {cleanName(comunidadAutonoma)} · Actualizado {yearNow}
        </p>
      </div>
    </section>
  );
}
