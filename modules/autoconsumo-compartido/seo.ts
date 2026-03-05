import { buildMetadata } from "@/lib/seo/metadata-builder";

export function sharedMetadata(slug: string, municipalityName: string) {
  return buildMetadata({
    title: `Autoconsumo compartido en ${municipalityName}: normativa y ahorro`,
    description: `Todo sobre autoconsumo compartido en ${municipalityName}, requisitos y beneficios.`,
    pathname: `/autoconsumo-compartido/${slug}`
  });
}