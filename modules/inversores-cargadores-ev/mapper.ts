import type { InverterEvCompatibility } from "@/data/types";

export function mapInverterEvCompatibilityCopy(data: InverterEvCompatibility) {
  return {
    header: {
      breadcrumb: `Tecnología / Compatibilidad / EV`,
      label: "Movilidad Eléctrica",
      titlePrefix: `Informe de`,
      titleHighlight: `Compatibilidad Inversor ${data.inverterSlug} + ${data.chargerSlug}`,
      description: `Validación técnica para sistemas integrados de autoconsumo y recarga de vehículo eléctrico. Optimizamos la gestión de carga para maximizar el uso de energía solar.`
    },
    incentivesCard: {
      title: "ANÁLISIS DE COMPATIBILIDAD",
      rows: [
        { label0: "Estado Conexión", label1: "Comunicación RS485/WiFi", value: data.compatible ? "OK" : "NO" },
        { label0: "Eficiencia Conjunta", label1: "Rendimiento del sistema", value: `${data.efficiencyScore}%` },
        { label0: "Tarifa Optimizada", label1: "Configuración recomendada", value: data.tariffSlug }
      ],
      cta: "Ver Esquema de Conexión"
    },
    mainContent: {
      status: {
        title: `Sinergia entre Fotovoltaica y EV`,
        desc: `Combinar el inversor ${data.inverterSlug} con el cargador ${data.chargerSlug} permite implementar funciones avanzadas como el "Green Mode", donde el coche solo se carga con los excedentes solares, evitando verter energía a la red a bajo precio.`,
        highlight: data.notes || `Esta configuración garantiza que la potencia contratada no se vea superada durante los picos de carga simultánea.`
      }
    },
    sidebarAudit: {
      badge: "ESPECIFICACIONES",
      title: "Optimización Dinámica",
      desc: "La integración inteligente permite ajustar la potencia de carga en tiempo real según la generación fotovoltaica disponible.",
      cta: "Descargar Guía Técnica"
    },
    sections: [
      {
        id: 1,
        title: "Integración con Tarifa ${data.tariffSlug}",
        content: `Hemos validado que bajo la tarifa ${data.tariffSlug}, este combo tecnológico permite programar las cargas en las horas más económicas, complementando la generación solar diurna con el consumo valle nocturno.`
      }
    ],
    faqs: [
      {
        question: "¿Es necesaria una pasarela de comunicación extra?",
        answer: "Dependerá de la versión del firmware, pero generalmente estos modelos se comunican de forma nativa mediante protocolo Modbus o API cloud."
      }
    ],
    simulation: {
      title: "Ahorro Anual Estimado",
      desc: "Calcula cuánto dejas de gastar en combustible al cargar tu coche 100% con energía propia."
    }
  };
}
