import type { MunicipioEnergia } from "@/data/repositories/municipios-energia.repo";

type FaqItem = {
  question: string;
  answer: string;
};

export type PlacasContentTemplate = {
  h1: string;
  intro: string;
  ahorroTitle: string;
  ahorroBody: string;
  horasSolTitle: string;
  horasSolBody: string;
  ayudasTitle: string;
  ayudasBody: string;
  roiTitle: string;
  roiBody: string;
  ctaTitle: string;
  ctaBody: string;
  ctaButtonLabel: string;
  faqs: FaqItem[];
};

function hashSlug(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function pickVariant(slug: string, options: string[]): string {
  const index = hashSlug(slug) % options.length;
  return options[index];
}

function buildFaqs(data: MunicipioEnergia, roiYears: number): FaqItem[] {
  return [
    {
      question: `\u00bfCompensa instalar placas solares en ${data.municipio}?`,
      answer: `Si. Con ${data.horasSol.toLocaleString("es-ES")} horas de sol al ano y un precio medio de ${data.precioMedioLuz.toLocaleString("es-ES", { maximumFractionDigits: 3 })} EUR/kWh, el contexto es favorable para el autoconsumo.`
    },
    {
      question: "\u00bfCuanto se puede ahorrar al ano?",
      answer: `En este municipio el ahorro estimado de referencia ronda los ${data.ahorroEstimado.toLocaleString("es-ES")} EUR anuales, aunque puede variar segun potencia instalada y habitos de consumo.`
    },
    {
      question: "\u00bfQue ayudas hay disponibles?",
      answer: `Actualmente se puede optar a bonificacion IBI de hasta ${data.bonificacionIbi ?? 0}% y subvencion de autoconsumo orientativa de ${(
        data.subvencionAutoconsumo ?? 0
      ).toLocaleString("es-ES")} EUR, siempre segun convocatoria vigente.`
    },
    {
      question: "\u00bfEn cuanto tiempo se recupera la inversion?",
      answer: `Con una inversion tipo, el retorno estimado esta alrededor de ${roiYears.toFixed(1)} anos, condicionado por ayudas, autoconsumo real y evolucion del precio de la luz.`
    }
  ];
}

export function buildPlacasContentTemplate(data: MunicipioEnergia, roiYears: number): PlacasContentTemplate {
  const h1 = `Placas solares en ${data.municipio}: ahorro real, ayudas y rentabilidad`;

  const intro = pickVariant(data.slug, [
    `En ${data.municipio}, dentro de ${data.provincia}, el autoconsumo fotovoltaico gana peso por una combinacion clara: ${data.horasSol.toLocaleString("es-ES")} horas de sol al ano y un coste electrico medio de ${data.precioMedioLuz.toLocaleString("es-ES", {
      maximumFractionDigits: 3
    })} EUR/kWh.`,
    `${data.municipio} cuenta con un recurso solar especialmente interesante para viviendas y pequenos negocios. Con ${data.horasSol.toLocaleString("es-ES")} horas de sol anuales, las placas solares permiten reducir la dependencia de la red y estabilizar el gasto energetico.`,
    `Si vives en ${data.municipio}, ya tienes una base favorable para amortizar una instalacion solar: buena exposicion anual y un precio de energia que hace mas visible el ahorro mes a mes.`
  ]);

  return {
    h1,
    intro,
    ahorroTitle: `Ahorro estimado con placas solares en ${data.municipio}`,
    ahorroBody: `Tomando como referencia los datos del municipio, el ahorro anual estimado puede situarse alrededor de ${data.ahorroEstimado.toLocaleString("es-ES")} EUR. El valor final depende del consumo diurno, la orientacion de la cubierta y el dimensionado de la instalacion.`,
    horasSolTitle: `Impacto de las horas de sol en la produccion fotovoltaica`,
    horasSolBody: `${data.municipio} registra aproximadamente ${data.horasSol.toLocaleString("es-ES")} horas de sol al ano. Este nivel de recurso solar favorece una produccion estable y mejora el aprovechamiento de cada kW instalado.`,
    ayudasTitle: `Ayudas y bonificaciones disponibles en ${data.municipio}`,
    ayudasBody: `A nivel local y auton\u00f3mico, puedes encontrar incentivos como bonificacion IBI de hasta ${
      data.bonificacionIbi ?? 0
    }% y subvencion de autoconsumo cercana a ${(data.subvencionAutoconsumo ?? 0).toLocaleString("es-ES")} EUR, segun convocatoria y requisitos tecnicos.`,
    roiTitle: "ROI estimado de la instalacion",
    roiBody: `Con el contexto actual de irradiacion (${data.irradiacionSolar.toLocaleString("es-ES")} kWh/m2), precio medio de luz y ayudas, el retorno de inversion estimado puede rondar ${roiYears.toFixed(
      1
    )} anos en escenarios residenciales estandar.`,
    ctaTitle: `Solicita un estudio solar gratuito en ${data.municipio}`,
    ctaBody: `Te entregamos una simulacion personalizada con produccion esperada, ahorro realista, ayudas aplicables y plazo de amortizacion para tu vivienda en ${data.provincia}.`,
    ctaButtonLabel: "Quiero mi estudio gratuito",
    faqs: buildFaqs(data, roiYears)
  };
}
