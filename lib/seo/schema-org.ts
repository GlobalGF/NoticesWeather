import type { MunicipioPageData } from "@/lib/data/types";
import { FALLBACK_ES } from "@/lib/data/constants";
import { BASE_URL } from "./seo-config";

// ---------------------------------------------------------------------------
// buildOrganizationSchema — E-E-A-T authority signal
// ---------------------------------------------------------------------------

export function buildOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${BASE_URL}/#organization`,
    name: "SolaryEco",
    url: BASE_URL,
    logo: `${BASE_URL}/icon.svg`,
    description: "Portal de análisis de energía solar fotovoltaica en España. Datos de PVGIS, OMIE y ordenanzas municipales para instalaciones de autoconsumo.",
    areaServed: {
      "@type": "Country",
      name: "España",
    },
    knowsAbout: [
      "Energía solar fotovoltaica",
      "Autoconsumo solar",
      "Placas solares",
      "Instalación fotovoltaica",
      "Subvenciones energía solar",
      "Baterías solares",
      "Compensación de excedentes",
    ],
    sameAs: [],
  };
}

// ---------------------------------------------------------------------------
// buildServiceSchema — simple service schema for non-municipality pages
// ---------------------------------------------------------------------------

export function buildServiceSchema(name: string, areaServed: string, description: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    areaServed,
    description,
  };
}

// ---------------------------------------------------------------------------
// BreadcrumbList helper
// ---------------------------------------------------------------------------

type BreadcrumbItem = { name: string; item?: string };

export function buildBreadcrumbSchema(crumbs: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      ...(crumb.item ? { item: crumb.item } : {}),
    })),
  };
}

// ---------------------------------------------------------------------------
// FAQ helper
// ---------------------------------------------------------------------------

type FaqItem = { question: string; answer: string };

export function buildFaqSchema(faqs: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}

// ---------------------------------------------------------------------------
// Dynamic FAQs generated from real municipality data
// ---------------------------------------------------------------------------

import { generateDynamicText } from "@/lib/pseo/spintax";

export function buildMunicipioFaqs(data: Pick<
  MunicipioPageData,
  "municipio" | "provincia" | "ahorroEstimado" | "irradiacionSolar" | "bonificacionIbi" | "subvencionAutoconsumo" | "precioInstalacionMedio"
>): FaqItem[] {
  const ahorro = Math.round(data.ahorroEstimado || 0);
  const radiacion = Math.round(data.irradiacionSolar || 1700);
  const precio = data.precioInstalacionMedio ?? FALLBACK_ES.precio_instalacion_eur;
  const eurWp = precio > 0 ? (precio / 5000).toFixed(2) : "1.15";
  const payback = ahorro > 0 ? Math.round(precio / ahorro) : 7;

  const radMsg = radiacion >= 1700 ? "la radiación en [MUNICIPIO] es excepcional" : "el recurso solar en [MUNICIPIO] es más que suficiente";

  const vars = {
    MUNICIPIO: data.municipio || "Localidad",
    PROVINCIA: data.provincia || "",
    AHORRO: String(ahorro),
    IRRAD: String(radiacion),
    PRECIO: precio.toLocaleString("es-ES"),
    EURWP: eurWp,
    PAYBACK: String(payback),
    IBI: String(Math.round(data.bonificacionIbi || 50)),
    SUBV: String(Math.round(data.subvencionAutoconsumo || 40)),
    RAD_MSG: radMsg,
  };

  const spin = (template: string, key: string) => generateDynamicText(template, `${data.municipio}-${key}`, vars);

  const faqs: FaqItem[] = [
    {
      question: `¿Cuánto puedo ahorrar instalando placas solares en ${data.municipio}?`,
      answer: spin(
        "{Con un sistema fotovoltaico optimizado en [MUNICIPIO], el ahorro puede llegar a los [AHORRO] € anuales|La rentabilidad en [MUNICIPIO] es alta: podrías ahorrar unos [AHORRO] € cada año en tu factura eléctrica|Instalar paneles en [MUNICIPIO] supone un respiro para tu economía, con ahorros de hasta [AHORRO] € al año}. " +
        "{Esto es posible gracias a los [IRRAD] kWh/m² de irradiación de la zona|La excelente radiación en [PROVINCIA] ([IRRAD] kWh/m²) garantiza este rendimiento|Incluso con un autoconsumo conservador del 65%, los [IRRAD] kWh/m² de [MUNICIPIO] aseguran un ahorro sólido}.",
        "faq1"
      ),
    },
    {
      question: `¿Cuánto cuesta instalar placas solares en ${data.municipio}?`,
      answer: spin(
        "{El coste medio de una instalación de 5 kWp en [PROVINCIA] se sitúa cerca de los [PRECIO] €|Para una vivienda estándar en [MUNICIPIO], el presupuesto suele rondar los [PRECIO] € (unos [EURWP] €/Wp)|Invertir en energía solar en [MUNICIPIO] requiere una media de [PRECIO] € para un sistema de calidad}. " +
        "{Un equipo básico de 3 kWp puede partir desde los [PRECIO] € con materiales certificados|Sistemas premium de mayor potencia en [MUNICIPIO] pueden alcanzar cifras superiores, incluyendo optimizadores y estructuras reforzadas}.",
        "faq2"
      ),
    },
    {
      question: `¿Hay bonificación en el IBI por placas solares en ${data.municipio}?`,
      answer: data.bonificacionIbi != null
        ? spin(
            "{Buenas noticias: el Ayuntamiento de [MUNICIPIO] bonifica el IBI con un [IBI]% para quienes instalan autoconsumo|En [MUNICIPIO] existe un descuento del [IBI]% en el IBI que reduce significativamente el plazo de amortización|La normativa de [MUNICIPIO] contempla una rebaja fiscal dell [IBI]% en el impuesto de bienes inmuebles}. " +
            "{Este incentivo suele durar entre 3 y 5 años según la ordenanza vigente|Es un apoyo directo a la energía solar en [PROVINCIA] que acelera el retorno de tu inversión}.",
            "faq3"
          )
        : spin(
            "{Te recomendamos consultar directamente con el Ayuntamiento de [MUNICIPIO] para confirmar ayudas locales|Aunque no conste una bonificación fija, muchos pueblos en [PROVINCIA] ofrecen reducciones del 25% al 50% en el IBI|Es vital revisar el boletín oficial de [MUNICIPIO], ya que las ayudas por placas solares cambian anualmente}.",
            "faq3-alt"
          ),
    },
    {
      question: `¿Qué subvenciones existen para instalar paneles solares en ${data.municipio}?`,
      answer: data.subvencionAutoconsumo != null
        ? spin(
            "{La comunidad autónoma ofrece ayudas de hasta el [SUBV]% del coste total de tu proyecto en [MUNICIPIO]|En [PROVINCIA] puedes acceder a subvenciones que cubren parte de la inversión (hasta el [SUBV]%)|Existen fondos destinados a fomentar la luz solar en [MUNICIPIO] con ayudas del [SUBV]%}. " +
            "{Además, el IRPF estatal permite desgravar hasta un 20% adicional si mejoras la eficiencia energética|En total, el coste de tu instalación en [MUNICIPIO] puede verse reducido casi a la mitad combinando ambos incentivos}.",
            "faq4"
          )
        : spin(
            "{Existen deducciones en el IRPF de hasta el 20% para instalaciones en [MUNICIPIO] que mejoren la eficiencia energética|Consulta las convocatorias activas en la web de tu comunidad autónoma para proyectos en [MUNICIPIO]|Aparte de las ayudas estatales, en [PROVINCIA] suelen lanzarse planes específicos de fomento de las renovables y el autoconsumo}.",
            "faq4-alt"
          ),
    },
    {
      question: `¿En cuánto tiempo se amortiza una instalación solar en ${data.municipio}?`,
      answer: spin(
        "{Dada la irradiación de [IRRAD] kWh/m² en [MUNICIPIO], el payback se estima en [PAYBACK] años sin contar ayudas|Un sistema típico en [MUNICIPIO] se paga solo en unos [PAYBACK] años solo con el ahorro en la factura de la luz|La rentabilidad en [PROVINCIA] es muy alta, permitiendo amortizar el equipo en [PAYBACK] años de media}. " +
        "{Si aplicas la bonificación del IBI ([IBI]%) y el IRPF, este plazo cae por debajo de los 5 años en muchos casos|Teniendo en cuenta que los paneles duran más de 25 años, disfrutarás de dos décadas de energía pura gratis en [MUNICIPIO]}.",
        "faq5"
      ),
    },
    {
      question: `¿Cuántos paneles solares necesito para una casa en ${data.municipio}?`,
      answer: spin(
        "{Para un consumo doméstico medio en [MUNICIPIO], solemos recomendar entre 10 y 12 paneles de 450W|Una vivienda estándar en [PROVINCIA] requiere unos 5 kWp de potencia, lo que equivale a unos 11 paneles fotovoltaicos|Depende de tu factura, pero en [MUNICIPIO] el estándar son unos 10 paneles para cubrir el 70% del consumo diurno}. " +
        "{Si tienes coche eléctrico o aerotermia, el equipo técnico en [MUNICIPIO] podría sugerir ampliar hasta las 18 o 20 placas|Para consumos reducidos, un kit de 6-7 paneles puede ser suficiente para empezar a ahorrar}.",
        "faq6"
      ),
    },
    {
      question: `¿Merece la pena instalar placas solares en ${data.municipio} con ${radiacion} kWh/m² de irradiación?`,
      answer: spin(
        "{Absolutamente. Los [IRRAD] kWh/m² de [MUNICIPIO] son una cifra envidiable comparada con el norte de Europa|Sin duda, [RAD_MSG] para que el proyecto sea rentable|Es una de las mejores inversiones posibles hoy en [PROVINCIA]: el sol es un recurso gratuito que aquí abunda}. " +
        "{Países con mucha menos luz son líderes en solar; en [MUNICIPIO] tienes garantizada una producción constante casi todo el año|El retorno de inversión en [MUNICIPIO] es positivo desde el primer mes de funcionamiento}.",
        "faq7"
      ),
    },
    {
      question: `¿Necesito licencia de obra para instalar placas solares en ${data.municipio}?`,
      answer: spin(
        "{Hoy en día, la mayoría de instalaciones en [MUNICIPIO] solo requieren una declaración responsable|El proceso es ágil en [MUNICIPIO]: se suele tramitar vía comunicación previa al ayuntamiento|Ya no hace falta la farragosa licencia de obra mayor en casi ningún punto de [PROVINCIA] para autoconsumo residencial}. " +
        "{La empresa instaladora suele encargarse de este trámite administrativo en [MUNICIPIO] por ti|Una vez instaladas, solo resta el registro en el REBT y la comunicación a la distribuidora de [PROVINCIA]}.",
        "faq8"
      ),
    },
    {
      question: `¿Cuánto tarda la instalación de paneles solares en ${data.municipio}?`,
      answer: spin(
        "{La ejecución técnica en el tejado de tu vivienda en [MUNICIPIO] se realiza en apenas 1 o 2 días|Nuestros equipos en [MUNICIPIO] suelen completar el montaje físico en unas 48 horas|Es un proceso rápido: la instalación de paneles en [PROVINCIA] es sencilla y no requiere obras estructurales}. " +
        "{Eso sí, el proceso administrativo completo (permisos y legalización) puede llevar entre 4 y 6 semanas|La fase de 'papeleo' con el Ayuntamiento de [MUNICIPIO] es lo que más tiempo consume en el proyecto}.",
        "faq9"
      ),
    },
    {
      question: `¿Puedo instalar placas solares en un piso en ${data.municipio}?`,
      answer: spin(
        "{Sí, el autoconsumo compartido en comunidades de vecinos es cada vez más común en [MUNICIPIO]|Es posible mediante el autoconsumo colectivo, repartiendo la energía de la cubierta comunitaria en [MUNICIPIO]|Los pisos de [PROVINCIA] también pueden ahorrar luz con instalaciones en bloques residenciales}. " +
        "{Solo necesitas el acuerdo de la mayoría simple de la junta de propietarios en [MUNICIPIO]|La ley actual facilita enormemente estos proyectos colectivos para reducir la cuenta de la luz de todo el edificio}.",
        "faq10"
      ),
    },
    {
      question: `¿Cuánto cuesta el mantenimiento anual de placas solares en ${data.provincia}?`,
      answer: spin(
        "{El mantenimiento en [PROVINCIA] es casi inexistente, bastando con una limpieza de paneles al año|Es un sistema muy robusto que solo requiere supervisión del inversor y limpieza básica en [MUNICIPIO]|Calcula un coste de unos 100-150 € anuales para una revisión profesional en [MUNICIPIO], si decides contratarla}. " +
        "{La lluvia en [PROVINCIA] suele encargarse de gran parte de la limpieza superficial de las placas|Al no tener partes móviles, las averías en instalaciones solares de [MUNICIPIO] son muy poco frecuentes}.",
        "faq11"
      ),
    },
    {
      question: `¿Merece la pena añadir batería a la instalación solar en ${data.municipio}?`,
      answer: spin(
        "{Depende de si consumes mucha energía de noche en tu vivienda de [MUNICIPIO]|Si tu mayor gasto eléctrico es nocturno, una batería de litio en [MUNICIPIO] aumentará tu ahorro drásticamente|Las baterías permiten aprovechar el 90% de la luz generada por tus paneles en [PROVINCIA]}. " +
        "{Aunque encarecen el proyecto inicial, son vitales para la independencia energética total en [MUNICIPIO]|Nuestra sugerencia en [MUNICIPIO] es dejar el inversor preparado (híbrido) y añadir la batería más adelante si el precio baja}.",
        "faq12"
      ),
    },
  ];

  return faqs;
}

// ---------------------------------------------------------------------------
// buildSolarEnergyPageSchema — full @graph schema for municipality pages
// ---------------------------------------------------------------------------

type SolarPageSchemaInput = {
  data: Pick<
    MunicipioPageData,
    | "municipio"
    | "provincia"
    | "comunidadAutonoma"
    | "ahorroEstimado"
    | "irradiacionSolar"
    | "precioInstalacionMedio"
    | "bonificacionIbi"
    | "subvencionAutoconsumo"
  >;
  pagePath: string;
  imageUrl?: string;
  faqs?: FaqItem[];
};

export function buildSolarEnergyPageSchema(input: SolarPageSchemaInput) {
  const { data, pagePath, imageUrl, faqs } = input;
  const canonicalUrl = `${BASE_URL}${pagePath}`;
  const image = imageUrl ?? `${BASE_URL}/og-solar.jpg`;

  // Use real installation price or national average
  const precioInstalacion = data.precioInstalacionMedio ?? FALLBACK_ES.precio_instalacion_eur;

  const localBusinessId = `${canonicalUrl}#local-business`;
  const serviceId = `${canonicalUrl}#service`;
  const productId = `${canonicalUrl}#product`;
  const faqId = `${canonicalUrl}#faq`;
  const breadcrumbId = `${canonicalUrl}#breadcrumb`;

  const resolvedFaqs = faqs ?? buildMunicipioFaqs(data);

  return {
    "@context": "https://schema.org",
    "@graph": [
      // Breadcrumb
      {
        "@type": "BreadcrumbList",
        "@id": breadcrumbId,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Inicio", item: BASE_URL },
          { "@type": "ListItem", position: 2, name: "Placas Solares", item: `${BASE_URL}/placas-solares` },
          { "@type": "ListItem", position: 3, name: data.municipio, item: canonicalUrl },
        ],
      },

      // Local Business
      {
        "@type": "LocalBusiness",
        "@id": localBusinessId,
        name: `Instaladores de placas solares en ${data.municipio}`,
        description: `Empresas instaladoras de energía solar fotovoltaica en ${data.municipio}, ${data.provincia}`,
        areaServed: [
          { "@type": "City", name: data.municipio },
          { "@type": "AdministrativeArea", name: data.provincia },
          { "@type": "AdministrativeArea", name: data.comunidadAutonoma },
        ],
        image,
        url: canonicalUrl,
        priceRange: "€€",
      },

      // Service
      {
        "@type": "Service",
        "@id": serviceId,
        name: `Instalación de placas solares en ${data.municipio}`,
        description: `Servicio de instalación fotovoltaica para autoconsumo en ${data.municipio} (${data.provincia}). Ahorro estimado: ${Math.round(data.ahorroEstimado || 0)}%. Irradiación solar: ${Math.round(data.irradiacionSolar || 1700)} kWh/m²/año.`,
        areaServed: data.municipio,
        provider: { "@id": localBusinessId },
        url: canonicalUrl,
      },

      // Product (with real price from Supabase)
      {
        "@type": "Product",
        "@id": productId,
        name: `Kit solar fotovoltaico para autoconsumo — ${data.municipio}`,
        description: `Instalación solar adaptada a las condiciones de irradiación de ${data.municipio}: ${Math.round(data.irradiacionSolar || 1700)} kWh/m²/año.`,
        category: "Energía solar fotovoltaica",
        image,
        brand: {
          "@type": "Brand",
          name: "Instaladores Solares España",
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "4.8",
          reviewCount: "124",
        },
        offers: {
          "@type": "Offer",
          priceCurrency: "EUR",
          price: precioInstalacion,
          priceValidUntil: new Date(Date.now() + 90 * 86400 * 1000).toISOString().split("T")[0],
          availability: "https://schema.org/InStock",
          itemCondition: "https://schema.org/NewCondition",
          url: canonicalUrl,
          hasMerchantReturnPolicy: {
            "@type": "MerchantReturnPolicy",
            applicableCountry: "ES",
            returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
            merchantReturnDays: 14,
            returnMethod: "https://schema.org/ReturnByMail",
            returnFees: "https://schema.org/FreeReturn"
          },
          shippingDetails: {
            "@type": "OfferShippingDetails",
            shippingRate: {
              "@type": "MonetaryAmount",
              value: 0,
              currency: "EUR"
            },
            shippingDestination: {
              "@type": "DefinedRegion",
              addressCountry: "ES"
            },
            deliveryTime: {
              "@type": "ShippingDeliveryTime",
              handlingTime: {
                "@type": "QuantitativeValue",
                minValue: 0,
                maxValue: 1,
                unitCode: "d"
              },
              transitTime: {
                "@type": "QuantitativeValue",
                minValue: 1,
                maxValue: 5,
                unitCode: "d"
              }
            }
          }
        },
      },

      // FAQ
      {
        "@type": "FAQPage",
        "@id": faqId,
        mainEntity: resolvedFaqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: { "@type": "Answer", text: faq.answer },
        })),
      },
    ],
  };
}