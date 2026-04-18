import type { Municipality } from "@/data/types";

export function mapSharedSelfConsumptionCopy(municipality: Municipality) {
  return {
    header: {
      breadcrumb: `Proyectos / Autoconsumo Compartido / ${municipality.name}`,
      label: "Energía Comunitaria",
      titlePrefix: `Soluciones de`,
      titleHighlight: `Autoconsumo Compartido en ${municipality.name}`,
      description: `Reduce los costes energéticos de tu comunidad de vecinos o polígono industrial mediante la compartición de excedentes y el aprovechamiento de cubiertas comunes.`
    },
    incentivesCard: {
      title: "Claves de Rentabilidad",
      rows: [
        { label0: "Radio Máximo", label1: "Distancia entre puntos", value: `2.000m` },
        { label0: "Ahorro Estimado", label1: "Reducción en factura", value: `~40%` },
        { label0: "Escalabilidad", label1: "Reparto de coeficientes", value: "Dinámico" }
      ],
      cta: "Planificar Proyecto Común"
    },
    mainContent: {
      status: {
        title: `El Autoconsumo Colectivo en ${municipality.name}`,
        desc: `La normativa actual permite que varias viviendas o empresas en ${municipality.name} se beneficien de una única instalación solar situada a menos de 2 km. Esto democratiza el acceso a la energía barata, especialmente en centros urbanos de ${municipality.province}.`,
        highlight: `Es la opción más eficiente para comunidades de propietarios que desean bajar el recibo de la luz comunitario y privativo de forma simultánea.`
      }
    },
    sidebarAudit: {
      badge: "ESTUDIO DE VIABILIDAD",
      title: "Auditoría de cubiertas",
      desc: "Analizamos el potencial de tu tejado y el perfil de consumo de tus vecinos para diseñar el reparto óptimo.",
      cta: "Solicitar Presupuesto"
    },
    sections: [
      {
        id: 1,
        title: "Beneficios para Pymes y Vecinos",
        content: `Compartir los gastos de instalación y mantenimiento reduce drásticamente el tiempo de amortización. Además, el autoconsumo compartido en ${municipality.name} permite aprovechar superficies que de otro modo quedarían infrautilizadas.`
      }
    ],
    faqs: [
      {
        question: "¿Qué es el coeficiente dinámico?",
        answer: "Es un modelo que permite repartir la energía generada según el consumo real de cada participante en cada momento, maximizando el aprovechamiento."
      }
    ],
    simulation: {
      title: "Calculadora de Reparto",
      desc: "Simula cuánta energía recibiría cada vivienda según el coeficiente asignado."
    }
  };
}