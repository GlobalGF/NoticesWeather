import type { RadiationProfile } from "@/data/types";
import type { MunicipioEnergia } from "@/data/repositories/municipios-energia.repo";

export function mapRadiationCopy(municipality: MunicipioEnergia, radiation: RadiationProfile) {
  return {
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
      }
    ],
    faqs: [
      {
        question: "¿Afecta la temperatura a la producción?",
        answer: "Sí, aunque parezca contraintuitivo, los paneles pierden eficiencia con el calor extremo. Sin embargo, la alta radiación de la zona compensa sobradamente este efecto."
      }
    ],
    simulation: {
      title: "Predicción de Generación",
      desc: "Simulamos mes a mes cuántos kWh generará tu tejado según estos datos oficiales."
    }
  };
}
