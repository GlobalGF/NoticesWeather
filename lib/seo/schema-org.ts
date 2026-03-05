export function buildServiceSchema(name: string, areaServed: string, description: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    areaServed,
    description
  };
}

type FaqItem = {
  question: string;
  answer: string;
};

type SolarPageSchemaInput = {
  municipality: string;
  province: string;
  pagePath: string;
  serviceName: string;
  serviceDescription: string;
  productName: string;
  productDescription: string;
  productPriceEur?: number;
  imageUrl?: string;
  faqs: FaqItem[];
};

export function buildSolarEnergyPageSchema(input: SolarPageSchemaInput) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";
  const canonicalUrl = `${baseUrl}${input.pagePath}`;
  const imageUrl = input.imageUrl ?? `${baseUrl}/next.svg`;

  const localBusinessId = `${canonicalUrl}#local-business`;
  const serviceId = `${canonicalUrl}#service`;
  const productId = `${canonicalUrl}#product`;
  const faqId = `${canonicalUrl}#faq`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LocalBusiness",
        "@id": localBusinessId,
        name: `Instaladores solares en ${input.municipality}`,
        areaServed: [input.municipality, input.province],
        image: imageUrl,
        url: canonicalUrl,
        priceRange: "EUR"
      },
      {
        "@type": "Service",
        "@id": serviceId,
        name: input.serviceName,
        description: input.serviceDescription,
        areaServed: input.municipality,
        provider: {
          "@id": localBusinessId
        },
        url: canonicalUrl
      },
      {
        "@type": "Product",
        "@id": productId,
        name: input.productName,
        description: input.productDescription,
        category: "Energia solar",
        image: imageUrl,
        brand: {
          "@type": "Brand",
          name: "Solar"
        },
        offers: {
          "@type": "Offer",
          priceCurrency: "EUR",
          price: input.productPriceEur ?? 6200,
          availability: "https://schema.org/InStock",
          itemCondition: "https://schema.org/NewCondition",
          url: canonicalUrl
        }
      },
      {
        "@type": "FAQPage",
        "@id": faqId,
        mainEntity: input.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer
          }
        }))
      }
    ]
  };
}