import type { RadiationProfile } from "@/data/types";
import type { MunicipioEnergia } from "@/data/repositories/municipios-energia.repo";

export function mapRadiationCopy(municipality: MunicipioEnergia, radiation: RadiationProfile) {
  return {
    provinciaName: municipality.provincia,
    comunidadName: municipality.comunidadAutonoma,
    seoIntro: `Estudio técnico completo de la radiación solar, irradiación anual, producción estimada y horas de sol para la instalación de placas solares en ${municipality.municipio}.`,
    header: {
      breadcrumb: `Estudio Solar / Irradiación / ${municipality.municipio}`,
      label: "Potencial Fotovoltaico",
      titlePrefix: `Niveles de`,
      titleHighlight: `Radiación Solar en ${municipality.municipio}`,
      description: `Analizamos los datos históricos de irradiación y el ángulo de inclinación óptimo para maximizar la producción de tus placas solares en ${municipality.provincia}.`
    },
    incentivesCard: {
      title: "DATOS GEOGRÁFICOS",
      rows: [
        { label0: "Radiación Anual", label1: "Media de kWh por m2", value: `${Math.round(radiation.annualKwhM2).toLocaleString("es-ES")}kWh` },
        { label0: "Inclinación Óptima", label1: "Ángulo para producción max.", value: `${radiation.optimalTiltDeg}º` },
        { label0: "Horas de Sol", label1: "Disponibilidad anual", value: `${municipality.horasSol.toLocaleString("es-ES")}h` }
      ],
      cta: "Calcular Producción Total"
    },
    mainContent: {
      status: {
        title: `El recurso solar en ${municipality.municipio}`,
        desc: `Con una irradiación de ${radiation.annualKwhM2.toLocaleString("es-ES")} kWh/m2, ${municipality.municipio} se posiciona como una ubicación privilegiada para el autoconsumo. La instalación de paneles solares aquí ofrece un rendimiento excepcional debido a la baja nubosidad y alta exposición directa.`,
        highlight: `Un sistema fotovoltaico bien orientado en esta zona puede cubrir hasta el 70% de las necesidades eléctricas de una vivienda estándar.`
      }
    },
    sidebarAudit: {
      badge: "ANÁLISIS PVGIS",
      title: "Estudio de Sombras",
      desc: "Más allá de la radiación, analizamos obstáculos cercanos y climatología local para garantizar la generación prometida.",
      cta: "Solicitar Informe Técnico"
    },
    sections: [
      {
        id: 1,
        title: "Optimización del Ángulo",
        content: `Para captar la máxima energía en ${municipality.municipio}, recomendamos una inclinación de ${radiation.optimalTiltDeg} grados hacia el sur. Esto garantiza que durante los meses de invierno, cuando el sol está más bajo, la producción siga siendo competitiva.`
      },
      {
        id: 2,
        title: "Irradiación Global Horizontal (GHI) y Producción Anual",
        content: `La irradiación global horizontal en ${municipality.municipio} permite calcular con exactitud la producción anual esperada para un sistema fotovoltaico estándar. Los valores medios indican que cada kilovatio pico (kWp) instalado es capaz de producir entre 1.400 y 1.600 kWh anuales, dependiendo de las sombras locales y la eficiencia de los inversores solares utilizados.`
      },
      {
        id: 3,
        title: "Influencia del Clima y Nubosidad Local",
        content: `A diferencia de otras regiones del norte de Europa, el clima en la provincia de ${municipality.provincia} cuenta con un porcentaje mínimo de días completamente nublados al año. Esto permite que los paneles solares operen en su rango de rendimiento óptimo la mayor parte del tiempo, aprovechando también la radiación difusa en los días parcialmente cubiertos.`
      }
    ],
    faqs: [
      {
        question: "¿Afecta la temperatura a la producción?",
        answer: "Sí, aunque parezca contraintuitivo, los paneles pierden eficiencia con el calor extremo. Sin embargo, la alta radiación de la zona compensa sobradamente este efecto."
      },
      {
        question: "¿Cómo influye la orientación del tejado?",
        answer: "La orientación ideal es hacia el sur para maximizar la captación de radiación solar durante todo el año, aunque las orientaciones este y oeste también son muy viables."
      }
    ],
    simulation: {
      title: "Predicción de Generación",
      desc: "Simulamos mes a mes cuántos kWh generará tu tejado según estos datos oficiales."
    }
  };
}
