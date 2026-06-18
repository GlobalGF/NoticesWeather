import type { MunicipioEnergia } from "@/data/repositories/municipios-energia.repo";

export function mapIbiCopy(municipality: MunicipioEnergia) {
  const percentage = municipality.bonificacionIbi || 30;
  const years = municipality.bonificacionIbiDuracion || 3;
  const conditions = municipality.bonificacionIbiCondiciones;

  return {
    provinciaName: municipality.provincia,
    comunidadName: municipality.comunidadAutonoma,
    seoIntro: `Guía completa sobre el porcentaje de descuento, plazos y requisitos de la bonificación del IBI por instalar placas solares y paneles fotovoltaicos en el municipio de ${municipality.municipio}.`,
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
      },
      {
        id: 2,
        title: "Requisitos Técnicos y Plazos de Solicitud",
        content: `El plazo para solicitar la bonificación del IBI por placas solares en ${municipality.municipio} suele ser de seis meses a un año desde la fecha de finalización y legalización de la obra. El solicitante debe aportar el justificante del pago de la tasa municipal de obras, la declaración responsable o licencia, y un certificado técnico oficial de la instalación fotovoltaica que demuestre la homologación de los paneles instalados.`
      },
      {
        id: 3,
        title: "Compatibilidad con el ICIO y Deducciones del IRPF",
        content: `Esta bonificación del IBI es complementaria al descuento en el Impuesto de Construcciones, Instalaciones y Obras (ICIO), que en la provincia de ${municipality.provincia} puede llegar al 95% del total del impuesto. Además, el propietario de la vivienda puede solicitar la deducción estatal en la declaración del IRPF, acumulando múltiples capas de ahorro fiscal que reducen el coste neto de la instalación solar a una fracción del precio de tarifa.`
      }
    ],
    faqs: [
      {
        question: "¿Es compatible con el ICIO?",
        answer: "Sí, la mayoría de los ayuntamientos permiten sumar la bonificación del IBI al descuento en el impuesto de construcciones (ICIO)."
      },
      {
        question: "¿Qué pasa si vendo la casa durante la bonificación?",
        answer: "La bonificación del IBI está ligada al inmueble y su catastro en el ayuntamiento, por lo que el nuevo propietario se seguirá beneficiando del descuento restante durante los años de vigencia establecidos."
      }
    ],
    simulation: {
      title: "Calcula tu ahorro total",
      desc: "Sumando subvenciones europeas e incentivos fiscales municipales."
    }
  };
}