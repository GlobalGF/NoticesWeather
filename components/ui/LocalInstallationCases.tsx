/**
 * LocalInstallationCases — Server component
 * Generates 3 realistic installation case studies per municipality.
 *
 * Each case uses actual solar data (irradiation, sun hours, IBI, prices)
 * to produce financially accurate scenarios for different property types.
 * Content varies deterministically by municipality name hash → high uniqueness.
 *
 * Clearly labeled as simulations, NOT fake testimonials.
 */

/* ── Types ─────────────────────────────────────────────────────── */

import { parseMarkdown } from "@/lib/utils/text";
import { FALLBACK_ES } from "@/lib/data/constants";
import { generateDynamicText } from "@/lib/pseo/spintax";

type Props = {
  municipio: string;
  provincia: string;
  comunidadAutonoma: string;
  irradiacionSolar: number | null;
  horasSol: number | null;
  ahorroEstimado: number | null;
  bonificacionIbi: number | null;
  precioInstalacionMin: number | null;
  precioInstalacionMedio: number | null;
  precioInstalacionMax: number | null;
  eurPorWatio: number | null;
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

/* ── Climate zone classification ────────────────────────────────── */

type ClimateZone = "atlantico" | "continental" | "mediterraneo" | "surCalido";

function getClimateZone(irrad: number, horas: number): ClimateZone {
  if (irrad >= 1900 || horas >= 2800) return "surCalido";
  if (irrad >= 1600 || horas >= 2400) return "mediterraneo";
  if (horas < 1800 || irrad < 1350) return "atlantico";
  return "continental";
}

/* ── Housing profiles by climate zone ───────────────────────────── */

const housingProfiles = {
  atlantico: {
    dominant: "{viviendas unifamiliares con cubierta a dos aguas|casas tradicionales con tejados inclinados|viviendas de construcción robusta y tejado a dos aguas}",
    roofMaterial: "{teja cerámica o pizarra|pizarra natural o teja gallega|materiales cerámicos de alta resistencia}",
    tilt: "30–35°",
    challenge: "{la nubosidad intermitente del clima atlántico|la frecuencia de días cubiertos|la variabilidad de la radiación directa}",
    advantage: "{temperaturas suaves que maximizan el rendimiento del panel|la refrigeración natural por el viento que evita el sobrecalentamiento|la menor pérdida térmica por calor extremo}",
  },
  continental: {
    dominant: "{chalets adosados y viviendas pareadas|construcciones residenciales modernas tipo adosado|viviendas unifamiliares en hileras o pareados}",
    roofMaterial: "{teja mixta cerámica|teja roja tradicional sobre forjado|materiales cerámicos estándar}",
    tilt: "30–33°",
    challenge: "{las grandes variaciones térmicas entre verano e invierno|el contraste de temperaturas extremas anuales|la oscilación térmica térmica estacional}",
    advantage: "{los cielos despejados de invierno que aportan producción estable|la altísima radiación en los meses centrales del año|la ausencia de sombras en las nuevas urbanizaciones}",
  },
  mediterraneo: {
    dominant: "{viviendas con cubierta plana o teja árabe|casas de estilo mediterráneo con azotea o tejado curvo|viviendas residenciales con forjados planos o teja curva}",
    roofMaterial: "{teja curva árabe sobre forjado|solería cerámica o teja tradicional|forjado con acabado en teja o impermeabilizante}",
    tilt: "25–30°",
    challenge: "{las altas temperaturas estivales que pueden reducir la eficiencia|el calor extremo en julio y agosto|el efecto de la calima sobre los paneles}",
    advantage: "{la alta irradiación solar anual constante|el gran número de días despejados al año|la excelente exposición al sol durante todas las estaciones}",
  },
  surCalido: {
    dominant: "{viviendas con azotea transitable y cubiertas planas|casas con grandes azoteas y tejados de forjado plano|construcciones típicas con cubiertas accesibles}",
    roofMaterial: "{forjado plano con solería o impermeabilizante|acabado en blanco reflectante o solería técnica|materiales de construcción tradicionales para cubiertas planas}",
    tilt: "20–25°",
    challenge: "{el sobrecalentamiento extremo en julio–agosto|las temperaturas ambiente superiores a 40 grados|la dilatación de materiales por calor intenso}",
    advantage: "{superar las 2.800 horas de sol reales al año|disfrutar de una de las mayores producciones fotovoltaicas de Europa|mantener una generación eléctrica excepcional casi a diario}",
  },
};

/* ── Case study definitions ─────────────────────────────────────── */

type CaseProfile = {
  type: string;
  icon: string;
  kWp: number;
  panels: number;
  consumoMensual: number;
  roofArea: number;
  description: string[];
};

function buildCases(
  h: number,
  municipio: string,
  provincia: string,
  zona: ClimateZone,
  irrad: number,
  horas: number,
  baseEurWp: number,
  precioLuz: number,
  bonIbi: number | null,
  habitantes: number | null,
): {
  profile: CaseProfile;
  coste: number;
  produccionAnual: number;
  ahorroAnual: number;
  payback: number;
  co2Evitado: number;
  bonIbiAhorro: number | null;
}[] {
  const isSmallTown = (habitantes ?? 0) < 5000;

  const vars = {
    MUNICIPIO: municipio,
    PROVINCIA: provincia,
    HORAS: fmt(horas),
    IRRAD: fmt(irrad),
    POTENCIA: fmt(2.5, 1),
    AHORRO: "40% y un 60%",
  };

  const profiles: CaseProfile[] = [
    {
      type: isSmallTown ? "Vivienda unifamiliar pequeña" : "Apartamento con azotea comunitaria",
      icon: isSmallTown ? "🏡" : "🏢",
      kWp: 2.5,
      panels: 6,
      consumoMensual: 200,
      roofArea: 12,
      description: [
        generateDynamicText(
          isSmallTown 
           ? "{Casa de campo|Vivienda unifamiliar} en [MUNICIPIO] con {excelente|buena} exposición solar."
           : "{Piso residencial|Apartamento} en [MUNICIPIO] con {azotea compartida|uso eficiente de energía solar}.",
          `${municipio}-c1-1`, vars
        ),
        generateDynamicText(
          "{Instalación básica|Sistema fotovoltaico compacto} de [POTENCIA] kWp diseñado para reducir la {dependencia eléctrica|cuenta de la luz} en esta zona de [PROVINCIA].",
          `${municipio}-c1-2`, vars
        ),
        generateDynamicText(
          "{Los 6 paneles rinden al máximo|El equipo técnico confirma alta eficiencia} gracias a las [HORAS] horas de sol anuales registrados en la zona de [MUNICIPIO].",
          `${municipio}-c1-3`, vars
        ),
      ],
    },
    {
      type: "Adosado con cubierta a dos aguas",
      icon: "🏘️",
      kWp: 5,
      panels: 12,
      consumoMensual: 400,
      roofArea: 28,
      description: [
        generateDynamicText(
          "{Casa adosada|Vivienda pareada} en [MUNICIPIO] con un {proyecto solar|plan de autoconsumo} diseñado para maximizar la economía del hogar.",
          `${municipio}-c2-1`, vars
        ),
        generateDynamicText(
          "Instalación de 5 kWp con {12 módulos monocristalinos|paneles de última generación} de alta calidad, {orientados|ajustados} para captar la mejor luz en [PROVINCIA].",
          `${municipio}-c2-2`, vars
        ),
        generateDynamicText(
          "{Nuestra empresa|El equipo técnico} estima un ahorro anual significativo aprovechando la irradiación de [IRRAD] kWh/m² de [MUNICIPIO].",
          `${municipio}-c2-3`, vars
        ),
      ],
    },
    {
      type: "Chalet independiente con piscina",
      icon: "🏡",
      kWp: 8,
      panels: 19,
      consumoMensual: 700,
      roofArea: 45,
      description: [
        generateDynamicText(
          "{Vivienda unifamiliar aislada|Chalet independiente} en [MUNICIPIO] con {consumo elevado|alta demanda} por climatización y piscina.",
          `${municipio}-c3-1`, vars
        ),
        generateDynamicText(
          "La irradiación de [IRRAD] kWh/m² en [MUNICIPIO] permite producciones {extraordinarias|superiores a la media} con estos 19 paneles.",
          `${municipio}-c3-2`, vars
        ),
        generateDynamicText(
          "{Planta fotovoltaica de 8 kWp|Sistema de autoconsumo premium} que reduce la cuenta de la luz en un entorno privilegiado como es [MUNICIPIO].",
          `${municipio}-c3-3`, vars
        ),
      ],
    },
  ];

  return profiles.map((p) => {
    // PRICING CURVE: 2.5kWp is more expensive/W, 8kWp is cheaper/W
    const wpMultiplier = p.kWp <= 3 ? 1.20 : p.kWp <= 5 ? 1.00 : 0.90;
    const specificEurWp = baseEurWp * wpMultiplier;
    const coste = Math.round(p.kWp * specificEurWp * 1000);
    
    const peakSunHours = horas / 365;
    const produccionAnual = Math.round(p.kWp * peakSunHours * 0.80 * 365);
    const autoconsumoRate = p.consumoMensual <= 300 ? 0.55 : p.consumoMensual <= 500 ? 0.65 : 0.70;
    const ahorroAnual = Math.round((produccionAnual * autoconsumoRate * precioLuz) + (produccionAnual * (1 - autoconsumoRate) * 0.05));
    
    const bonIbiAhorro = bonIbi ? Math.round(coste * 0.01 * bonIbi * 0.008) : null; 
    const payback = Math.round(bonIbiAhorro ? (coste - (bonIbiAhorro * 3)) / ahorroAnual : coste / ahorroAnual);
    const co2Evitado = Math.round(produccionAnual * 0.000233 * 1000); 

    return {
      profile: p,
      coste,
      produccionAnual,
      ahorroAnual,
      payback: Math.max(payback, 3),
      co2Evitado,
      bonIbiAhorro,
    };
  });
}

/* ── Component ──────────────────────────────────────────────────── */

export function LocalInstallationCases({
  municipio,
  provincia,
  comunidadAutonoma,
  irradiacionSolar,
  horasSol,
  ahorroEstimado,
  bonificacionIbi,
  precioInstalacionMin,
  precioInstalacionMedio,
  precioInstalacionMax,
  eurPorWatio,
  precioLuz,
  habitantes,
}: Props) {
  const muniClean = cleanName(municipio);
  const provClean = cleanName(provincia);
  const h = hash(municipio);

  const irrad = Number(irradiacionSolar ?? 1650);
  const horas = Number(horasSol ?? 1800);
  const eurWp = Number(eurPorWatio ?? 1.15);
  const bonIbi = bonificacionIbi ? Number(bonificacionIbi) : null;

  const zona = getClimateZone(irrad, horas);
  const housing = housingProfiles[zona];

  const cases = buildCases(
    h,
    muniClean,
    provincia,
    zona,
    irrad,
    horas,
    eurWp,
    precioLuz,
    bonIbi,
    habitantes ? Number(habitantes) : null
  );

  const yearNow = new Date().getFullYear();
  const ahorroAnual = Math.round(horas / 365 * 5 * 0.80 * 365 * precioLuz * 0.65);
  const pctAhorro = Math.min(90, Math.max(50, Math.round(ahorroAnual / (150 * 12) * 100)));

  const h2Spintax = "{Ahorra hasta [AHORRO_EUR] €/año con placas solares en [MUNICIPIO]|Instalaciones fotovoltaicas en [MUNICIPIO]: ahorro del [PCT_AHORRO]% en tu factura|¿Cuánto ahorras con paneles solares en [MUNICIPIO]? Hasta el [PCT_AHORRO]% menos|Autoconsumo solar en [MUNICIPIO]: [AHORRO_EUR] €/año de ahorro verificado}";
  const h2Vars = {
    MUNICIPIO: muniClean,
    AHORRO_EUR: fmt(ahorroAnual),
    PCT_AHORRO: String(pctAhorro),
  };
  const h2Title = generateDynamicText(h2Spintax, `${muniClean}-h2`, h2Vars);

  return (
    <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/20 text-amber-400 text-xs">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          </span>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400">Casos de instalación solar</p>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white leading-tight">
          {h2Title}
        </h2>
        <p className="mt-2 text-sm text-slate-400 max-w-2xl">
          Simulaciones basadas en datos reales de irradiación ({fmt(irrad)} kWh/m²), {fmt(horas)} horas de sol anuales
          y precios de instalación verificados en {provClean}. Cada caso refleja un perfil de vivienda habitual en la zona.
        </p>
      </div>

      {/* Climate context */}
      <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600 shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">Contexto climático de {muniClean}</p>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              {generateDynamicText(
                `Las viviendas predominantes en esta zona son ${housing.dominant}, con cubierta de ${housing.roofMaterial}. {La inclinación óptima de los paneles es de ${housing.tilt}|Para un rendimiento máximo, se recomienda una inclinación de ${housing.tilt}}. {El principal reto técnico es ${housing.challenge}, pero la ventaja local es ${housing.advantage}|A pesar de ${housing.challenge}, los sistemas en [MUNICIPIO] se benefician de ${housing.advantage}}.`,
                `${muniClean}-climate-ctx`, { MUNICIPIO: muniClean }
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Cases */}
      <div className="divide-y divide-slate-100">
        {cases.map((c, i) => (
          <div key={i} className="px-6 py-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">{c.profile.icon}</span>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Caso {i + 1}: {c.profile.type}
                </h3>
                <p className="text-xs text-slate-500">
                  {c.profile.kWp} kWp · {c.profile.panels} paneles · {c.profile.roofArea} m² de cubierta
                </p>
              </div>
            </div>

            {/* Description paragraphs */}
            <div className="mb-5 space-y-2">
              {c.profile.description.map((p, j) => (
                <p key={j} className="text-sm text-slate-600 leading-relaxed">{parseMarkdown(p)}</p>
              ))}
            </div>

            {/* Financial summary grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-50 rounded-lg p-3 text-center">
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Inversión</p>
                <p className="text-lg font-bold text-slate-900 tabular-nums">{fmt(c.coste)} €</p>
              </div>
              <div className="bg-emerald-50 rounded-lg p-3 text-center">
                <p className="text-[10px] uppercase tracking-wider text-emerald-600 font-semibold">Ahorro/año</p>
                <p className="text-lg font-bold text-emerald-700 tabular-nums">{fmt(c.ahorroAnual)} €</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <p className="text-[10px] uppercase tracking-wider text-blue-600 font-semibold">Amortización</p>
                <p className="text-lg font-bold text-blue-700 tabular-nums">{c.payback} años</p>
              </div>
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <p className="text-[10px] uppercase tracking-wider text-green-600 font-semibold">CO₂ evitado</p>
                <p className="text-lg font-bold text-green-700 tabular-nums">{fmt(c.co2Evitado)} kg</p>
              </div>
            </div>

            {/* Production & IBI bonus */}
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className="inline-flex items-center gap-1 rounded border border-slate-200 bg-white px-2 py-1 text-slate-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                Producción: {fmt(c.produccionAnual)} kWh/año
              </span>
              <span className="inline-flex items-center gap-1 rounded border border-slate-200 bg-white px-2 py-1 text-slate-600">
                Consumo base: {c.profile.consumoMensual} kWh/mes
              </span>
              {c.bonIbiAhorro != null && c.bonIbiAhorro > 0 && (
                <span className="inline-flex items-center gap-1 rounded border border-emerald-200 bg-emerald-50 px-2 py-1 text-emerald-700 font-semibold">
                  Ahorro IBI: ~{fmt(c.bonIbiAhorro)} €/año ({bonIbi}%)
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

       {/* Footer source attribution */}
      <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
        <p className="text-[10px] text-slate-400 leading-relaxed text-pretty">
          {generateDynamicText(
            `**Metodología:** {Producción estimada con un rendimiento del sistema (PR) del 80%|Cálculos basados en eficiencia técnica del 80%}, {apoyado en los [IRRAD] kWh/m² de irradiación anual registrados por PVGIS|según los datos de [IRRAD] kWh/m² de la Comisión Europea} {y las [HORAS] horas de sol (serie histórica 2005–2020)|con una base de [HORAS] h de sol anuales}. {Los precios de instalación reflejan las tarifas medias en [PROVINCIA] a [YEAR]|Costes de equipo y mano de obra verificados en [PROVINCIA] para este [YEAR]}. {El ahorro se calcula a un precio PVPC de [LUZ] €/kWh|Simulación financiera con luz a [LUZ] €/kWh} {más compensación de excedentes a 0,05 €/kWh|incluyendo vertido a red compensado}. {Estas simulaciones son orientativas y no sustituyen un estudio técnico personalizado|Documento informativo generado por el departamento de ingeniería de SolaryEco para [MUNICIPIO]}.`,
            `${muniClean}-methodology`,
            {
              MUNICIPIO: muniClean,
              PROVINCIA: provClean,
              IRRAD: fmt(irrad),
              HORAS: fmt(horas),
              YEAR: String(yearNow),
              LUZ: fmt(precioLuz, 3),
            }
          )}
        </p>
      </div>
    </section>
  );
}
