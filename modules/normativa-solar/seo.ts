import { buildMetadata } from "@/lib/seo/metadata-builder";

export function urbanRegulationMetadata(
  comunidad: string,
  provincia: string,
  municipio: string,
  norma: string,
  municipalityName: string,
  title: string
) {
  return buildMetadata({
    title: `Normativa solar en ${municipalityName}: ${title}`,
    description: `Requisitos urbanisticos para placas solares en ${municipalityName}, tramites y licencia municipal.`,
    pathname: `/normativa-solar/${comunidad}/${provincia}/${municipio}/${norma}`
  });
}
