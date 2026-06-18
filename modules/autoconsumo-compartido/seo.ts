import { buildMetadata } from "@/lib/seo/metadata-builder";

const YEAR = new Date().getFullYear();

export function sharedMetadata(slug: string, municipalityName: string) {
  return buildMetadata({
    title: `Autoconsumo Compartido y Colectivo en ${municipalityName}`,
    description: `Guía de autoconsumo compartido colectivo en ${municipalityName}: coeficientes de reparto, requisitos legales, ventajas fiscales y estimación de ahorro.`,
    pathname: `/autoconsumo-compartido/${slug}`
  });
}