import type { MunicipioEnergia } from "@/data/repositories/municipios-energia.repo";

export function mapIbiCopy(municipality: MunicipioEnergia) {
  const percentage = municipality.bonificacionIbi || 30;
  const years = municipality.bonificacionIbiDuracion || 3;
  const conditions = municipality.bonificacionIbiCondiciones;

  return {
    header: {
      breadcrumb: `Subvenciones / IBI / ${municipality.municipio}`,
      label: "Impuestos Municipales",
      titlePrefix: `Bonificación del IBI por`,
      titleHighlight: `Placas Solares en ${municipality.municipio}`,
      description: `Consulta la rebaja fiscal en el Impuesto sobre Bienes Inmuebles (IBI) tras instalar energía solar fotovoltaica. Un ahorro directo que acelera la amortización de tu inversión.`
    },
    incentivesCard: {
      title: "Resumen de Ayudas locales",
      rows: [
        { label0: "Descuento en el IBI", label1: "Porcentaje sobre el recibo", value: `-${percentage}%` },
        { label0: "Plazo de Aplicación", label1: "Años de bonificación", value: `${years} años` },
        { label0: "Requisito Principal", label1: "Eficiencia técnica", value: "Homologado" }
      ],
      cta: "Verificar Plazos y BOP"
    },
    mainContent: {
      status: {
        title: `Situación del IBI en ${municipality.municipio}`,
        desc: `El ayuntamiento de ${municipality.municipio} contempla en sus ordenanzas fiscales una reducción del ${percentage}% en el recibo anual del IBI para viviendas que apuesten por el autoconsumo. Esta medida busca fomentar la transición energética en ${municipality.provincia}.`,
        highlight: conditions || `La bonificación se aplica habitualmente durante los primeros ${years} años tras la legalización de la instalación fotovoltaica.`
      }
    },
    sidebarAudit: {
      badge: "TRÁMITE GRATUITO",
      title: "Gestionamos tus bonificaciones",
      desc: "Nuestros instaladores asociados se encargan de los trámites ante el ayuntamiento para que no pierdas tus ayudas.",
      cta: "Solicitar Gestión"
    },
    sections: [
      {
        id: 1,
        title: "¿Cómo solicitarla?",
        content: `Para beneficiarte de esta rebaja en ${municipality.municipio}, es imprescindible presentar la solicitud antes de que finalice el año fiscal de la instalación. Necesitarás el certificado de fin de obra y la resolución de industria.`
      }
    ],
    faqs: [
      {
        question: "¿Es compatible con el ICIO?",
        answer: "Sí, la mayoría de los ayuntamientos permiten sumar la bonificación del IBI al descuento en el impuesto de construcciones (ICIO)."
      }
    ],
    simulation: {
      title: "Calcula tu ahorro total",
      desc: "Sumando subvenciones europeas e incentivos fiscales municipales."
    }
  };
}