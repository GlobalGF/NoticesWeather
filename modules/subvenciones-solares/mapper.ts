import type { SolarSubsidy } from "@/data/types";
import type { MunicipioEnergia } from "@/data/repositories/municipios-energia.repo";
import { SUBVENCIONES_SPINTAX } from "@/data/seo/subsidy-content";

// Helper to resolve spintax and replace tokens
function processContent(template: string, tokens: Record<string, string>): string {
  // Simple spintax resolver {A|B|C}
  let content = template.replace(/\{([^{}]+)\}/g, (_, choices) => {
    const parts = choices.split("|");
    return parts[Math.floor(Math.random() * parts.length)];
  });

  // Replace tokens [TOKEN]
  Object.entries(tokens).forEach(([key, value]) => {
    const re = new RegExp(`\\[${key}\\]`, "g");
    content = content.replace(re, value);
  });

  return content;
}

// Simple string hash for deterministic "randomness"
function getSeed(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

// Deterministic shuffle
function shuffleArray<T>(array: T[], seed: number): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = (seed + i) % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function mapSubsidyCopy(municipality: MunicipioEnergia, subsidy: SolarSubsidy) {
  const muni = municipality.municipio;
  const prov = municipality.provincia;
  const ccaa = municipality.comunidadAutonoma;
  const prog = subsidy.programName;
  const seed = getSeed(muni);
  
  // 1. DATA WITH ROBUST FALLBACKS
  const subPct = (subsidy as any).percentage || 50;
  const ibiPct = municipality.bonificacionIbi || 30;
  const icioPct = municipality.bonificacionIcio || 95;
  const hSol = municipality.horasSol || 1800;
  const radValue = municipality.irradiacionSolar || 1700;
  const rad = radValue.toLocaleString("es-ES", { minimumFractionDigits: 1 });
  
  // Prices and Savings
  const priceEst = 7200;
  const annualProd = hSol * 5.0; // Assuming a 5kWp installation
  const annualSavingsEur = Math.round(annualProd * 0.18); // Conservative 0.18€/kWh savings
  const co2SavedKg = Math.round(annualProd * 0.4);
  
  // Payback calculation
  const subsidyAmount = subsidy.amountEur || (priceEst * (subPct / 100));
  const icioBenefit = 300 * (icioPct / 100);
  const ibiBenefitAnnual = 500 * (ibiPct / 100);
  const ibiYears = municipality.bonificacionIbiDuracion || 3;
  const totalIncentives = subsidyAmount + icioBenefit + (ibiBenefitAnnual * ibiYears) + (priceEst * 0.4); 
  
  const netCost = Math.max(priceEst * 0.2, priceEst - totalIncentives);
  let paybackYears = Math.round(netCost / annualSavingsEur);
  paybackYears = Math.max(3, Math.min(paybackYears, 8));

  const totalSavingPct = Math.min(85, subPct + (ibiPct / 5) + icioPct / 20);

  // 2. TOKEN DEFINITIONS
  const tokens = {
    MUNICIPIO: muni,
    PROVINCIA: prov,
    CCAA: ccaa,
    PROGRAMA: prog,
    PCT: subPct.toString(),
    MAX_EUR: subsidy.amountEur > 0 ? subsidy.amountEur.toLocaleString("es-ES") : "3.375",
    HORAS_SOL: hSol.toLocaleString("es-ES"),
    RADIACION: rad,
    BONIF_IBI: ibiPct.toString(),
    BONIF_ICIO: icioPct.toString(),
    CO2_SAVED: (co2SavedKg / 1000).toFixed(1),
    PAYBACK_YEARS: paybackYears.toString(),
    ANNUAL_SAVINGS: annualSavingsEur.toLocaleString("es-ES"),
    PRICE_ESTIMATE: priceEst.toLocaleString("es-ES"),
    AÑO: "2026",
    LOCALIZACION: muni.toLowerCase() === prov.toLowerCase() ? muni : `${muni} (${prov})`
  };

  // 3. DYNAMIC STRUCTURE SELECTION
  const titleTemplates = SUBVENCIONES_SPINTAX.municipio_titles;
  const selectedTitleTemplate = titleTemplates[seed % titleTemplates.length];

  const allSections = [
    {
      id: 1,
      title: `Marco Legal y Régimen de Autoconsumo (RD 244/2019)`,
      content: processContent(SUBVENCIONES_SPINTAX.marco_legal, tokens)
    },
    {
      id: 2,
      title: `Guía Técnica de Deducciones en el IRPF`,
      content: processContent(SUBVENCIONES_SPINTAX.irpf_guia_detallada, tokens)
    },
    {
      id: 3,
      title: `Roadmap Administrativo para conseguir las ayudas`,
      content: processContent(SUBVENCIONES_SPINTAX.pasos_detallados, tokens)
    },
    {
      id: 4,
      title: `Análisis de Bonificaciones Locales en ${muni}`,
      content: processContent(SUBVENCIONES_SPINTAX.bonificaciones_locales_detalladas, tokens)
    },
    {
      id: 5,
      title: `Subvenciones Autonómicas en ${ccaa}: Programa ${prog}`,
      content: processContent(SUBVENCIONES_SPINTAX.ayudas_ccaa_detalladas, tokens)
    }
  ];

  // Dynamic shuffle of sections based on municipality name
  const shuffledSections = shuffleArray(allSections, seed);

  // Selection of 3 unique FAQs from the pool
  const selectedFaqs = shuffleArray(SUBVENCIONES_SPINTAX.faqs_pool, seed + 1).slice(0, 4);

  return {
    title: processContent(selectedTitleTemplate, tokens),
    intro: processContent(SUBVENCIONES_SPINTAX.municipio_intro, tokens),
    header: {
      breadcrumb: `SUBVENCIONES / ${municipality.provincia.toUpperCase()} / ${muni.toUpperCase()}`,
      label: `GUÍA PROFESIONAL · 2026`,
      titlePrefix: `Ayudas y Subvenciones para`,
      titleHighlight: `Placas Solares en ${muni}`,
      description: processContent(SUBVENCIONES_SPINTAX.bonificaciones_detalladas, tokens),
    },
    metrics: {
      production: `${annualProd.toLocaleString("es-ES")} kWh`,
      co2: `${(co2SavedKg / 1000).toFixed(1)} toneladas`,
      payback: `${paybackYears} años`,
      savings: `${annualSavingsEur.toLocaleString("es-ES")}€ / año`
    },
    incentivesCard: {
      title: `ESTADÍSTICAS EN ${muni.toUpperCase()}`,
      rows: [
        {
          label0: `AYUDA ${ccaa.toUpperCase()}`,
          label1: "Subvención directa regional",
          value: `${subPct}%`
        },
        {
          label0: "IBI BONIFICADO",
          label1: `Ahorro durante ${ibiYears} años`,
          value: `${ibiPct}%`
        },
        {
          label0: "ICIO DESCONTADO",
          label1: "Ahorro en trámites",
          value: `${icioPct}%`
        }
      ],
      cta: `ESTUDIO SOLAR EN ${muni.toUpperCase()}`
    },
    mainContent: {
      status: {
        title: `Rentabilidad del Autoconsumo en ${muni}`,
        desc: processContent(SUBVENCIONES_SPINTAX.municipio_rentabilidad, tokens),
        highlight: `Sostenibilidad local: Al instalar placas en ${muni}, estarás ahorrando la emisión de ${tokens.CO2_SAVED} toneladas de gases contaminantes anualmente.`
      }
    },
    sections: shuffledSections,
    faqs: selectedFaqs.map(f => ({
      question: processContent(f.q, tokens),
      answer: processContent(f.a, tokens)
    })),
    sidebarAudit: {
      badge: "TRAMITACIÓN 100% GESTIONADA",
      title: "¿Te ayudamos?",
      desc: `Expertos en ${prov} se encargan de registrar tu solicitud del programa [PROGRAMA] para tu vivienda en ${muni}.`,
      cta: "SOLICITAR INFO"
    },
    simulation: {
      title: `Calculadora Solar ${muni}`,
      desc: `Comprueba el ahorro exacto para tu tejado en ${muni} de forma gratuita.`
    },
    municipioSlug: municipality.slug
  };
}
