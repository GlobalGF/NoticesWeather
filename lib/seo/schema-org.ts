import type { MunicipioPageData } from "@/lib/data/types";
import { FALLBACK_ES } from "@/lib/data/constants";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";

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

export function buildMunicipioFaqs(data: Pick<
  MunicipioPageData,
  "municipio" | "provincia" | "ahorroEstimado" | "irradiacionSolar" | "bonificacionIbi" | "subvencionAutoconsumo" | "precioInstalacionMedio"
>): FaqItem[] {
  const ahorro = Math.round(data.ahorroEstimado || 0);
  const radiacion = Math.round(data.irradiacionSolar || 1700);
  const precio = data.precioInstalacionMedio ?? FALLBACK_ES.precio_instalacion_eur;
  const eurWp = precio > 0 ? (precio / 5000).toFixed(2) : "1.15";
  const payback = ahorro > 0 ? Math.round(precio / ahorro) : 7;

  const faqs: FaqItem[] = [
    {
      question: `¿Cuánto puedo ahorrar instalando placas solares en ${data.municipio}?`,
      answer: `Con una instalación fotovoltaica bien dimensionada en ${data.municipio}, el ahorro estimado es de hasta ${ahorro} € anuales en la factura eléctrica, gracias a los ${radiacion} kWh/m² de irradiación solar de la zona. Este cálculo considera un ratio de autoconsumo del 65% y compensación de excedentes a 0,05 €/kWh.`,
    },
    {
      question: `¿Cuánto cuesta instalar placas solares en ${data.municipio}?`,
      answer: `El precio medio de una instalación solar doméstica de 5 kWp en ${data.provincia} ronda los ${precio.toLocaleString("es-ES")} € (aprox. ${eurWp} €/Wp). Una instalación básica de 3 kWp parte desde ${Math.round(precio * 0.6).toLocaleString("es-ES")} €, y un sistema premium de 8 kWp con optimizadores alcanza los ${Math.round(precio * 1.6).toLocaleString("es-ES")} €. Estos precios incluyen paneles, inversor, estructura, cableado e instalación.`,
    },
    {
      question: `¿Hay bonificación en el IBI por placas solares en ${data.municipio}?`,
      answer: data.bonificacionIbi != null
        ? `Sí. El ayuntamiento de ${data.municipio} ofrece una bonificación del ${Math.round(data.bonificacionIbi)}% en el IBI para inmuebles con instalación fotovoltaica, aplicable normalmente durante 3 a 5 años. Esto supone un ahorro fiscal adicional que acelera la amortización. Consulta la ordenanza municipal vigente para conocer los requisitos exactos.`
        : `Consulta con el ayuntamiento de ${data.municipio} para comprobar si existe bonificación del IBI para instalaciones de autoconsumo solar. Muchos municipios de ${data.provincia} ofrecen reducciones del 25% al 50%.`,
    },
    {
      question: `¿Qué subvenciones existen para instalar paneles solares en ${data.municipio}?`,
      answer: data.subvencionAutoconsumo != null
        ? `La comunidad autónoma ofrece subvenciones de hasta el ${Math.round(data.subvencionAutoconsumo)}% del coste de instalación. Además, puedes deducir hasta un 20% en el IRPF (máximo 5.000 €) si la instalación mejora la eficiencia energética. Combinando ambas ayudas, el coste efectivo de una instalación en ${data.municipio} puede reducirse entre un 30% y un 50%.`
        : `Existen subvenciones autonómicas y la deducción estatal del IRPF (hasta 20%, máximo 5.000 €) para instalaciones de autoconsumo en ${data.municipio}. Consulta el IDAE y la web de tu comunidad autónoma para las convocatorias vigentes.`,
    },
    {
      question: `¿En cuánto tiempo se amortiza una instalación solar en ${data.municipio}?`,
      answer: `Con el precio actual de la electricidad y la irradiación de ${radiacion} kWh/m² en ${data.municipio}, una instalación de 5 kWp se amortiza en aproximadamente ${payback} años sin ayudas. Aplicando la bonificación del IBI${data.bonificacionIbi ? ` (${Math.round(data.bonificacionIbi)}%)` : ""} y la deducción del IRPF, el plazo se reduce a ${Math.max(3, payback - 2)}–${Math.max(4, payback - 1)} años. Los paneles tienen una vida útil de 25-30 años, lo que supone más de ${25 - payback} años de energía prácticamente gratuita.`,
    },
    {
      question: `¿Cuántos paneles solares necesito para una casa en ${data.municipio}?`,
      answer: `Depende del consumo del hogar. Para una vivienda media en ${data.municipio} con un consumo de 300-400 kWh/mes, necesitas entre 10 y 12 paneles de 450 W (instalación de 5 kWp), que ocupan unos 24 m² de cubierta. Si tu consumo es bajo (<200 kWh/mes), con 7 paneles (3 kWp) es suficiente. Para viviendas con alto consumo, piscina o coche eléctrico, se recomiendan 18-20 paneles (8 kWp).`,
    },
    {
      question: `¿Merece la pena instalar placas solares en ${data.municipio} con ${radiacion} kWh/m² de irradiación?`,
      answer: `Sí. ${data.municipio} recibe ${radiacion} kWh/m² de irradiación anual, lo que ${radiacion >= 1800 ? "supera ampliamente" : radiacion >= 1500 ? "está por encima de" : "es comparable con"} la media de países como Alemania (1.050 kWh/m²), donde la energía solar es una industria consolidada y rentable. Con los precios actuales de la electricidad en España, una instalación en ${data.municipio} genera un retorno positivo desde el primer año.`,
    },
    {
      question: `¿Necesito licencia de obra para instalar placas solares en ${data.municipio}?`,
      answer: `En la mayoría de casos, la instalación de paneles solares para autoconsumo en ${data.municipio} requiere una declaración responsable o comunicación previa al ayuntamiento, no una licencia de obra completa. La empresa instaladora se encarga habitualmente de toda la tramitación. Además, necesitarás registrar la instalación en el REBT y tramitar el alta como autoconsumidor ante la distribuidora eléctrica.`,
    },
    {
      question: `¿Cuánto tarda la instalación de paneles solares en ${data.municipio}?`,
      answer: `La instalación física de las placas solares en un tejado residencial en ${data.municipio} se completa habitualmente en 1-3 días laborables. Sin embargo, el proceso completo (estudio técnico, tramitación de permisos, instalación y legalización) suele durar entre 4 y 8 semanas. La fase más lenta es la tramitación administrativa con el ayuntamiento y la distribuidora eléctrica.`,
    },
    {
      question: `¿Puedo instalar placas solares en un piso en ${data.municipio}?`,
      answer: `Sí, existen dos opciones para pisos en ${data.municipio}: el autoconsumo colectivo (compartido entre vecinos en la cubierta del edificio) y el autoconsumo individual si tienes acceso exclusivo a parte de la azotea. La Ley 7/2021 y el RD 244/2019 facilitan las instalaciones compartidas. Necesitas el acuerdo de la comunidad de propietarios (mayoría simple) y un estudio de reparto de la energía entre los participantes.`,
    },
    {
      question: `¿Cuánto cuesta el mantenimiento anual de placas solares en ${data.provincia}?`,
      answer: `El mantenimiento de una instalación solar residencial en ${data.provincia} es mínimo y económico: entre 100 € y 200 € al año. Consiste básicamente en una limpieza semestral de los paneles (que la lluvia ayuda a realizar) y una revisión anual del inversor y las conexiones. Los paneles tienen garantía de producción de 25 años y el inversor de 5 a 10 años.`,
    },
    {
      question: `¿Merece la pena añadir batería a la instalación solar en ${data.municipio}?`,
      answer: `Depende de tu patrón de consumo. En ${data.municipio}, si la mayor parte de tu consumo eléctrico es por la noche (cuando no hay producción solar), una batería de litio de 5-10 kWh puede aumentar tu autoconsumo del 60% al 85%. Sin embargo, el coste de la batería (3.000-6.000 €) alarga la amortización 3-5 años. La recomendación técnica es empezar sin batería y añadirla más adelante cuando los precios bajen.`,
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