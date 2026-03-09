import { buildMetadata } from "@/lib/seo/metadata-builder";

const YEAR = new Date().getFullYear();

export function subsidyMetadata(
  comunidad: string,
  provincia: string,
  municipio: string,
  programa: string,
  municipalityName: string,
  programName: string
) {
  return buildMetadata({
    title: `Subvención solar ${YEAR} en ${municipalityName}: ${programName} — Importe y requisitos`,
    description: `Todo sobre el programa ${programName} para instalaciones solares en ${municipalityName}: importes, porcentajes subvencionables y cómo solicitarlo.`,
    pathname: `/subvenciones-solares/${comunidad}/${provincia}/${municipio}/${programa}`
  });
}
