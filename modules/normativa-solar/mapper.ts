import type { UrbanRegulation } from "@/data/types";
import type { MunicipioEnergia } from "@/data/repositories/municipios-energia.repo";

export function mapUrbanRegulationCopy(municipality: MunicipioEnergia, regulation: UrbanRegulation) {
  return {
    provinciaName: municipality.provincia,
    comunidadName: municipality.comunidadAutonoma,
    seoIntro: `Información oficial sobre la normativa de autoconsumo solar, trámites de urbanismo, licencias de obra y declaración responsable para placas solares en ${municipality.municipio}.`,
    header: {
      breadcrumb: `Normativa / Urbanismo / ${municipality.municipio}`,
      label: "Marco Jurídico",
      titlePrefix: `Normativa de`,
      titleHighlight: `Autoconsumo Solar: ${regulation.title}`,
      description: `Guía técnica sobre los trámites administrativos y licencias necesarias para instalar paneles solares en ${municipality.municipio} según el ordenamiento técnico vigente.`
    },
    incentivesCard: {
      title: "ESTADO TRAMITACIÓN",
      rows: [
        { label0: "Tipo de Licencia", label1: "Trámite urbanístico", value: regulation.licenseRequired ? "Obra Mayor" : "Comunicación" },
        { label0: "Bonificación ICIO", label1: "Impuesto construcciones", value: municipality.bonificacionIcio ? `-${municipality.bonificacionIcio}%` : "Consulta" },
        { label0: "Vigencia", label1: "Actualización normativa", value: "2026" }
      ],
      cta: "Descargar Ordenanza"
    },
    mainContent: {
      status: {
        title: `Facilidades administrativas en ${municipality.municipio}`,
        desc: `Para agilizar la transición energética, el ayuntamiento de ${municipality.municipio} ha simplificado los pasos para legalizar instalaciones de autoconsumo. En la mayoría de los casos en ${municipality.provincia}, basta con una declaración responsable o comunicación previa, evitando las esperas de la licencia de obra tradicional.`,
        highlight: regulation.summary || `La normativa local está alineada con el Real Decreto-ley 29/2021 para el fomento del autoconsumo en España.`
      }
    },
    sidebarAudit: {
      badge: "TRÁMITE RÁPIDO",
      title: "Gestoría Técnica",
      desc: "Nuestros técnicos asociados en ${municipality.provincia} se encargan de preparar toda la documentación técnica para el ayuntamiento.",
      cta: "Consutar Expediente"
    },
    sections: [
      {
        id: 1,
        title: "Requisitos para la Bonificación",
        content: `Para no perder el derecho a las bonificaciones locales, es fundamental que el proyecto cumpla con los estándares técnicos de ${municipality.municipio}. Asegúrate de que tu instalador disponga de los certificados de homologación necesarios.`
      },
      {
        id: 2,
        title: "Declaración Responsable frente a Licencia de Obra Mayor",
        content: `De acuerdo con la legislación vigente en ${municipality.municipio}, la mayoría de las instalaciones solares fotovoltaicas residenciales sobre cubierta no requieren una licencia de obra mayor previa. En su lugar, el promotor o la empresa instaladora debe tramitar una declaración responsable acompañada de una memoria técnica de diseño, lo que acorta los tiempos de inicio a escasos días.`
      },
      {
        id: 3,
        title: "Condiciones de Integración Estética y Patrimonio Histórico",
        content: `En zonas de especial protección patrimonial o cascos históricos en la provincia de ${municipality.provincia}, el ayuntamiento puede exigir que los paneles solares mantengan una disposición coplanar con la cubierta, evitando el uso de soportes con inclinación excesiva que alteren el paisaje urbano o la estética tradicional protegida.`
      }
    ],
    faqs: [
      {
        question: "¿Puedo instalar placas en suelo urbano?",
        answer: "Sí, la mayoría de normativas en ${municipality.provincia} permiten la instalación tanto en cubiertas como en estructuras auxiliares dentro de la parcela, siempre que se respete la estética urbana."
      },
      {
        question: "¿Qué es el código técnico de la edificación (CTE)?",
        answer: "Es la normativa marco en España que regula los estándares de seguridad estructural, habitabilidad y eficiencia energética que deben cumplir las edificaciones, afectando a la instalación de paneles."
      }
    ],
    simulation: {
      title: "Verificador de Licencias",
      desc: "Introduce tu dirección exacta para confirmar si tu vivienda tiene alguna restricción patrimonial."
    }
  };
}
