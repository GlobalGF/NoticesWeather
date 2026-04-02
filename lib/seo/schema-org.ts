import type { MunicipioPageData } from "@/lib/data/types";
import { FALLBACK_ES } from "@/lib/data/constants";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://solarespaña.es";

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

  const faqs: FaqItem[] = [
    {
      question: `¿Cuánto puedo ahorrar instalando placas solares en ${data.municipio}?`,
      answer: `Con una instalación fotovoltaica bien dimensionada en ${data.municipio}, el ahorro estimado es de hasta un ${ahorro}% anual en la factura eléctrica, gracias a los ${radiacion} kWh/m² de irradiación solar de la zona.`,
    },
    {
      question: `¿Cuánto cuesta instalar placas solares en ${data.municipio}?`,
      answer: `El precio medio de una instalación solar doméstica (3-5 kWp) en ${data.provincia} ronda los ${precio.toLocaleString("es-ES")} €. El coste puede reducirse con subvenciones autonómicas y bonificaciones municipales.`,
    },
    {
      question: `¿Hay bonificación en el IBI por placas solares en ${data.municipio}?`,
      answer: data.bonificacionIbi != null
        ? `Sí. El ayuntamiento de ${data.municipio} ofrece una bonificación del ${Math.round(data.bonificacionIbi)}% en el IBI para inmuebles con instalación fotovoltaica. Consulta la ordenanza municipal vigente para conocer los requisitos exactos.`
        : `Consulta con el ayuntamiento de ${data.municipio} para comprobar si existe bonificación del IBI para instalaciones de autoconsumo solar.`,
    },
    {
      question: `¿Qué subvenciones existen para instalar paneles solares en ${data.municipio}?`,
      answer: data.subvencionAutoconsumo != null
        ? `La comunidad autónoma ofrece subvenciones de hasta el ${Math.round(data.subvencionAutoconsumo)}% del coste de instalación. Además, el Plan de Recuperación europeo (Next Generation EU) financia instalaciones de autoconsumo en toda España.`
        : `Existen subvenciones del Plan de Recuperación (Next Generation EU) y de la comunidad autónoma para instalaciones de autoconsumo en ${data.municipio}. Consulta el IDAE para más información.`,
    },
    {
      question: `¿En cuánto tiempo se amortiza una instalación solar en ${data.municipio}?`,
      answer: `Con el precio actual de la electricidad y la irradiación de ${radiacion} kWh/m² en ${data.municipio}, una instalación de 3 kWp suele amortizarse entre 5 y 8 años. Con las subvenciones disponibles, este plazo puede reducirse significativamente.`,
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
        offers: {
          "@type": "Offer",
          priceCurrency: "EUR",
          price: precioInstalacion,
          priceValidUntil: new Date(Date.now() + 90 * 86400 * 1000).toISOString().split("T")[0],
          availability: "https://schema.org/InStock",
          itemCondition: "https://schema.org/NewCondition",
          url: canonicalUrl,
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