import type { SharedSelfConsumptionCoefficient } from "@/data/types";
import type { MunicipioEnergia } from "@/data/repositories/municipios-energia.repo";

export function mapSharedCoefficientCopy(
  municipality: MunicipioEnergia,
  coefficient: SharedSelfConsumptionCoefficient
) {
  return {
    header: {
      breadcrumb: `Autoconsumo / Coeficientes / ${municipality.municipio}`,
      label: "Reparto de Energía",
      titlePrefix: `Cálculo de`,
      titleHighlight: `Coeficiente de Reparto en ${municipality.municipio}`,
      description: `Optimización técnica del coeficiente para la modalidad ${coefficient.modeSlug}. Asegura un reparto justo y legal de la generación solar comunitaria.`
    },
    incentivesCard: {
      title: "DATOS DEL REPARTO",
      rows: [
        { label0: "Coeficiente Asignado", label1: "Porcentaje de generación", value: `${coefficient.coefficient.toLocaleString("es-ES")}` },
        { label0: "Modalidad", label1: "Tipo de autoconsumo", value: coefficient.modeSlug },
        { label0: "Marco Legal", label1: "Referencia administrativa", value: "BOE/BOP" }
      ],
      cta: "Verificar Coeficientes"
    },
    mainContent: {
      status: {
        title: `Gestión de excedentes en ${municipality.municipio}`,
        desc: `Al participar en una red de autoconsumo compartido en ${municipality.municipio}, el coeficiente fijado determina qué parte de la energía producida por la planta común se resta de tu factura individual. Según la normativa en ${municipality.provincia}, este parámetro es clave para la viabilidad económica del proyecto.`,
        highlight: coefficient.legalReference ? `Referencia legal: ${coefficient.legalReference}` : "El coeficiente debe estar debidamente registrado ante la distribuidora para que las facturas reflejen el ahorro real."
      }
    },
    sidebarAudit: {
      badge: "CÁLCULO TÉCNICO",
      title: "Optimiza tu Coeficiente",
      desc: "Repartir la energía según el consumo histórico de cada vecino puede mejorar la rentabilidad colectiva en un 15%.",
      cta: "Solicitar Re-cálculo"
    },
    sections: [
      {
        id: 1,
        title: "Diferencia entre Fijo y Dinámico",
        content: `En ${municipality.municipio}, puedes optar por coeficientes fijos (siempre el mismo reparto) o dinámicos (cambian según el consumo horario). Esta última opción es ideal para maximizar el aprovechamiento de la energía solar en polígonos industriales o edificios con horarios dispares.`
      }
    ],
    faqs: [
      {
        question: "¿Se puede cambiar el coeficiente una vez pactado?",
        answer: "Sí, la normativa permite modificar los acuerdos de reparto, aunque requiere la firma de todos los participantes y la comunicación a la distribuidora."
      }
    ],
    simulation: {
      title: "Simulador de Factura",
      desc: "Comprueba cómo varía tu ahorro mensual si incrementas tu coeficiente de participación."
    }
  };
}
