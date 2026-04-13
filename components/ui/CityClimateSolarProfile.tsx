import { generateDynamicText } from "@/lib/pseo/spintax";
import { cleanName, hash, pick, parseMarkdown, fmt } from "@/lib/utils/text";

const tierConfig = {
  excepcional: {
    badge: "Recurso solar excepcional",
    badgeClass: "bg-amber-100 text-amber-800 border-amber-300",
    barWidth: "w-[95%]",
    barColor: "bg-gradient-to-r from-amber-400 to-orange-500",
    summarySpintax: "{[MUNICIPIO] se sitúa en el tramo más alto de recurso solar de España|Con [HORAS] horas de sol al año y una irradiación de [IRRAD] kWh/m², [MUNICIPIO] disfruta de un potencial fotovoltaico excepcional|Los datos satelitales de PVGIS confirman que [MUNICIPIO] recibe [IRRAD] kWh/m² de irradiación anual}, {lo que convierte la inversión en autoconsumo fotovoltaico en una de las decisiones financieras más rentables|facilitando plazos de amortización récord de entre 5 y 7 años|posicionando a la localidad en el percentil 90 de rendimiento energético nacional}. {Cada kWp instalado aquí produce más energía que la media europea|Una instalación residencial de 5 kWp en [MUNICIPIO] genera energía suficiente para cubrir hasta el 80% del consumo de un hogar medio}.",
    techSpintax: "{En localidades con recurso solar excepcional como [MUNICIPIO], los inversores híbridos {con gestión de baterías|preparados para acumulación} se están convirtiendo en el estándar|Para [MUNICIPIO], la configuración técnica óptima es un sistema con paneles {monocristalinos PERC|de alta eficiencia N-Type} de última generación|La combinación de alta irradiación y temperaturas en [MUNICIPIO] hace recomendable usar paneles {con bajo coeficiente térmico|tipo half-cut}}. {Esto permite alcanzar ratios de autoconsumo superiores al 85%|El exceso de producción puede compensarse en factura a través del mecanismo de excedentes simplificado}.",
  },
  alto: {
    badge: "Recurso solar alto",
    badgeClass: "bg-yellow-100 text-yellow-800 border-yellow-300",
    barWidth: "w-[78%]",
    barColor: "bg-gradient-to-r from-yellow-400 to-amber-500",
    summarySpintax: "{[MUNICIPIO] cuenta con [IRRAD] kWh/m² de irradiación y [HORAS] horas de sol anuales|Con una irradiación global de [IRRAD] kWh/m² y [HORAS] h de sol, [MUNICIPIO] ofrece condiciones solares muy favorables|Los registros de la zona de [MUNICIPIO] muestran [HORAS] horas de sol con [IRRAD] kWh/m² de irradiación}. {Estas cifras garantizan una producción fotovoltaica estable durante todo el año|Estas condiciones aseguran una rentabilidad positiva con amortizaciones de 6–8 años en la mayoría de perfiles}. {La producción esperada de un sistema de 5 kWp suele superar los 7.000 kWh anuales en esta ubicación}.",
    techSpintax: "{En [MUNICIPIO], las instalaciones de autoconsumo más eficientes combinan paneles de 400-450W con inversor centralizado|Para viviendas en [MUNICIPIO], un sistema con {monitorización por app|gestión inteligente de vertido} es la estrategia más recomendada|La estacionalidad solar en [MUNICIPIO] favorece sistemas con orientación {perfecta al sur|este-oeste para aplanar la curva de producción}}. {La relación inversión/ahorro es muy favorable en esta zona de [PROVINCIA]|La mayoría de sistemas alcanzan el punto de equilibrio antes del séptimo año}.",
  },
  medio: {
    badge: "Recurso solar medio",
    badgeClass: "bg-sky-100 text-sky-800 border-sky-300",
    barWidth: "w-[60%]",
    barColor: "bg-gradient-to-r from-sky-400 to-blue-500",
    summarySpintax: "{[MUNICIPIO] registra [IRRAD] kWh/m² de irradiación y [HORAS] horas de sol anuales|Con [HORAS] horas de sol y una irradiación de [IRRAD] kWh/m², [MUNICIPIO] tiene un recurso solar medio-alto|Los datos PVGIS para [MUNICIPIO] muestran [IRRAD] kWh/m² de irradiación}. {Aunque estas cifras son inferiores al sur peninsular, superan ampliamente la media centroeuropea|El autoconsumo sigue siendo muy rentable aquí, cubriendo hasta el 65% del consumo medio de un hogar}. {Un dimensionamiento adecuado es clave en [MUNICIPIO] para maximizar el retorno}.",
    techSpintax: "{En zonas con recurso solar medio como [MUNICIPIO], la clave es ajustar la potencia instalada al consumo real|Para [MUNICIPIO], los paneles bifaciales suponen una ventaja competitiva al captar radiación difusa|La orientación perfecta al sur con inclinación de 30-35 grados es vital en [MUNICIPIO]}. {Un estudio con datos reales de factura es imprescindible para no sobredimensionar|Esto permite reducir el impacto de la nubosidad ocasional de la zona}.",
  },
  moderado: {
    badge: "Recurso solar moderado",
    badgeClass: "bg-slate-100 text-slate-700 border-slate-300",
    barWidth: "w-[42%]",
    barColor: "bg-gradient-to-r from-slate-400 to-slate-500",
    summarySpintax: "{[MUNICIPIO] cuenta con [IRRAD] kWh/m² de irradiación y [HORAS] horas de sol anuales|Con [HORAS] h de sol y [IRRAD] kWh/m² de irradiación, [MUNICIPIO] presenta un recurso solar más contenido|A pesar de estar en la franja moderada con [IRRAD] kWh/m², [MUNICIPIO] supera en recurso a países como Alemania}. {Con un diseño técnico correcto, la instalación fotovoltaica sigue siendo rentable aquí|La amortización se sitúa en torno a los 8-10 años, lo cual es excelente para una tecnología de 25 años de vida útil}. {Focalizar el proyecto en el consumo base es la mejor estrategia en [MUNICIPIO]}.",
    techSpintax: "{En [MUNICIPIO], donde las horas de sol son más limitadas, los paneles de alta eficiencia {tipo IBC|tipo HJT} rentabilizan mejor cada vatio|Para localidades como [MUNICIPIO], recomendamos una instalación conservadora orientada al ahorro directo|La nubosidad frecuente en la zona de [MUNICIPIO] favorece paneles con buen comportamiento en radiación difusa}. {Aunque la inversión inicial es ligeramente superior, el retorno anual en [PROVINCIA] justifica la apuesta técnica|Esto maximiza el ratio de autoconsumo directo por encima del 70%}.",
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

/* ── Helpers ────────────────────────────────────────────────────── */

function getSolarTier(irrad: number, horas: number): "excepcional" | "alto" | "medio" | "moderado" {
  if (irrad >= 1800 || horas >= 2600) return "excepcional";
  if (irrad >= 1600 || horas >= 2200) return "alto";
  if (irrad >= 1400 || horas >= 1800) return "medio";
  return "moderado";
}

function getPopSize(habitantes: number | null): "grande" | "mediana" | "pequena" {
  const h = habitantes ?? 0;
  if (h >= 50000) return "grande";
  if (h >= 5000) return "mediana";
  return "pequena";
}

/* ── Component ──────────────────────────────────────────────────── */

type CityClimateSolarProfileProps = {
  municipio: string;
  provincia: string;
  comunidadAutonoma: string;
  irradiacionSolar: number | null;
  horasSol: number | null;
  ahorroEstimado?: number | null;
  bonificacionIbi?: number | null;
  precioLuz: number;
  habitantes: number | null;
};

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
}: CityClimateSolarProfileProps) {
  const muniClean = cleanName(municipio);
  const provClean = cleanName(provincia);
  const h = hash(municipio);

  const irrad = Number(irradiacionSolar ?? 1650);
  const horas = Number(horasSol ?? 1800);
  const tier = getSolarTier(irrad, horas);
  const popSize = getPopSize(habitantes);
  const cfg = tierConfig[tier];

  const variables = {
    MUNICIPIO: muniClean,
    PROVINCIA: provClean,
    IRRAD: fmt(irrad),
    HORAS: fmt(horas),
  };

  const summary = generateDynamicText(cfg.summarySpintax, `${muniClean}-summary`, variables);
  const tech = generateDynamicText(cfg.techSpintax, `${muniClean}-tech`, variables);
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
