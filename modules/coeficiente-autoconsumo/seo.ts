import { buildMetadata } from "@/lib/seo/metadata-builder";

export function sharedCoefficientMetadata(
  comunidad: string,
  provincia: string,
  municipio: string,
  modalidad: string,
  municipalityName: string
) {
  return buildMetadata({
    title: `Coeficiente de autoconsumo compartido en ${municipalityName}`,
    description: `Valores orientativos de reparto para autoconsumo compartido en ${municipalityName} (${modalidad}).`,
    pathname: `/coeficiente-autoconsumo/${comunidad}/${provincia}/${municipio}/${modalidad}`
  });
}
