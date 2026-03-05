import { buildMetadata } from "@/lib/seo/metadata-builder";

export function ibiMetadata(slug: string, municipalityName: string) {
  return buildMetadata({
    title: `Bonificacion IBI en ${municipalityName} por instalar placas solares`,
    description: `Guia de porcentaje y duracion de la bonificacion IBI en ${municipalityName}.`,
    pathname: `/bonificacion-ibi/${slug}`
  });
}