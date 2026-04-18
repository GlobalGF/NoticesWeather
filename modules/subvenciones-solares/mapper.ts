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

export function mapSubsidyCopy(municipality: MunicipioEnergia, subsidy: SolarSubsidy) {
  const muni = municipality.municipio;
  const prov = municipality.provincia;
  const ccaa = municipality.comunidadAutonoma;
  const prog = subsidy.programName;
  
  // 1. DATA WITH ROBUST FALLBACKS
  const subPct = (subsidy as any).percentage || 50;
  const ibiPct = municipality.bonificacionIbi || 30;
  const icioPct = municipality.bonificacionIcio || 95;
  const hSol = municipality.horasSol || 1800;
  const radValue = municipality.irradiacionSolar || 1700;
  const rad = radValue.toLocaleString("es-ES", { minimumFractionDigits: 1 });
  
  // Prices and Savings (Using 7200€ as a realistic 5kWp baseline)
  const priceEst = 7200;
  const annualProd = hSol * 5.0; // Assuming a 5kWp installation
  const annualSavingsEur = Math.round(annualProd * 0.18); // Conservative 0.18€/kWh savings
  const co2SavedKg = Math.round(annualProd * 0.4);
  
  // Payback calculation
  // (Price - Subsidy - ICIO_Benefit - IBI_Benefit_Total) / AnnualSavings
  const subsidyAmount = subsidy.amountEur || (priceEst * (subPct / 100));
  const icioBenefit = 300 * (icioPct / 100); // 300€ baseline ICIO taxes
  const ibiBenefitAnnual = 500 * (ibiPct / 100); // 500€ baseline IBI
  const ibiYears = municipality.bonificacionIbiDuracion || 3;
  const totalIncentives = subsidyAmount + icioBenefit + (ibiBenefitAnnual * ibiYears) + (priceEst * 0.4); // 40% IRPF baseline
  
  const netCost = Math.max(priceEst * 0.2, priceEst - totalIncentives); // Floor at 20% cost
  let paybackYears = Math.round(netCost / annualSavingsEur);
  paybackYears = Math.max(3, Math.min(paybackYears, 8)); // Realistic range

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
  };

  return {
    title: `Subvenciones y Bonificación IBI en ${muni} 2026: Guía Autoconsumo [Ahorra hasta ${totalSavingPct}%]`,
    intro: processContent(SUBVENCIONES_SPINTAX.municipio_intro, tokens),
    header: {
      breadcrumb: `SUBVENCIONES / ${municipality.provincia.toUpperCase()} / ${muni.toUpperCase()}`,
      label: `GUÍA DE AUTOCONSUMO PROFESIONAL · 2026`,
      titlePrefix: `Subvenciones y Ayudas para`,
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
      title: `PERFIL DE AHORRO: ${muni.toUpperCase()}`,
      rows: [
        {
          label0: `SUBVENCIÓN ${ccaa.toUpperCase()}`,
          label1: "Fondo perdido (Next Gen / Regional)",
          value: `${subPct}%`
        },
        {
          label0: "BONIFICACIÓN IBI LOCAL",
          label1: `Ahorro durante ${ibiYears} años`,
          value: `${ibiPct}%`
        },
        {
          label0: "DESCUENTO ICIO TASAS",
          label1: "Ahorro en trámites de obra",
          value: `${icioPct}%`
        },
        {
          label0: "DEDUCCIÓN IRPF ESTATAL",
          label1: "Mejora de eficiencia energética",
          value: `40%*`
        }
      ],
      cta: `SOLICITAR ESTUDIO EN ${muni.toUpperCase()}`
    },
    mainContent: {
      status: {
        title: `Análisis Técnico de Rentabilidad en ${muni}`,
        desc: processContent(SUBVENCIONES_SPINTAX.municipio_rentabilidad, tokens),
        highlight: `Impacto Ambiental: Al instalar paneles en ${muni}, ahorrarás la emisión de ${tokens.CO2_SAVED} toneladas de CO2 al año. ${processContent(SUBVENCIONES_SPINTAX.impacto_ambiental, tokens)}`
      }
    },
    sections: [
      {
        id: 1,
        title: `1. Marco Legal y Régimen de Autoconsumo (RD 244/2019)`,
        content: processContent(SUBVENCIONES_SPINTAX.marco_legal, tokens)
      },
      {
        id: 2,
        title: `2. Guía Detallada de Deducciones en el IRPF`,
        content: processContent(SUBVENCIONES_SPINTAX.irpf_guia_detallada, tokens)
      },
      {
        id: 3,
        title: `3. Roadmap Administrativo: Pasos para el éxito`,
        content: processContent(SUBVENCIONES_SPINTAX.pasos_detallados, tokens)
      }
    ],
    faqs: SUBVENCIONES_SPINTAX.faqs_expertos.map(f => ({
      question: processContent(f.q, tokens),
      answer: processContent(f.a, tokens)
    })),
    sidebarAudit: {
      badge: "GIGAVATIOS DE EXPERIENCIA",
      title: "Gestionamos tus Ayudas",
      desc: `No te pierdas en la burocracia de ${ccaa}. Nuestros expertos en ${prov} tramitan el programa ${prog} y las deducciones de ${muni} por ti.`,
      cta: "SOLICITAR TRAMITACIÓN"
    },
    simulation: {
      title: `Calculadora de Ahorro para ${muni}`,
      desc: `Visualiza el retorno de inversión exacto para un sistema de autoconsumo en tu tejado de ${muni}.`
    },
    municipioSlug: municipality.slug
  };
}
