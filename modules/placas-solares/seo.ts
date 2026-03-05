import { buildMetadata } from "@/lib/seo/metadata-builder";

export function placasMetadata(slug: string, municipalityName: string) {
  return buildMetadata({
    title: `Placas solares en ${municipalityName}: ayudas, ahorro y produccion`,
    description: `Analisis de placas solares en ${municipalityName} con datos de radiacion y ahorro estimado.`,
    pathname: `/placas-solares/${slug}`
  });
}