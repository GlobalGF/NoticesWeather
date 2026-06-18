import { buildMetadata } from "@/lib/seo/metadata-builder";

const YEAR = new Date().getFullYear();

export function urbanRegulationMetadata(
  comunidad: string,
  provincia: string,
  municipio: string,
  norma: string,
  municipalityName: string,
  title: string
) {
  return buildMetadata({
    title: `Normativa y Trámites de Placas Solares en ${municipalityName}`,
    description: `Requisitos urbanísticos para instalar placas solares en ${municipalityName}: licencias necesarias, trámites municipales y normativa vigente.`,
    pathname: `/normativa-solar/${comunidad}/${provincia}/${municipio}/${norma}`
  });
}
