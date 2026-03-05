import { buildMetadata } from "@/lib/seo/metadata-builder";

export function radiationMetadata(
  comunidad: string,
  provincia: string,
  municipio: string,
  municipalityName: string
) {
  return buildMetadata({
    title: `Radiacion solar en ${municipalityName}: produccion estimada`,
    description: `Datos de irradiacion y orientacion optima para instalaciones solares en ${municipalityName}.`,
    pathname: `/radiacion-solar/${comunidad}/${provincia}/${municipio}`
  });
}
