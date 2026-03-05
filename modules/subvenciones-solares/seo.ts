import { buildMetadata } from "@/lib/seo/metadata-builder";

export function subsidyMetadata(
  comunidad: string,
  provincia: string,
  municipio: string,
  programa: string,
  municipalityName: string,
  programName: string
) {
  return buildMetadata({
    title: `Subvenciones solares en ${municipalityName}: ${programName}`,
    description: `Ayudas y subvenciones solares en ${municipalityName} con importes orientativos y requisitos principales.`,
    pathname: `/subvenciones-solares/${comunidad}/${provincia}/${municipio}/${programa}`
  });
}
