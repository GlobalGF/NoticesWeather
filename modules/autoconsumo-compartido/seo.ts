import { buildMetadata } from "@/lib/seo/metadata-builder";

const YEAR = new Date().getFullYear();

export function sharedMetadata(slug: string, municipalityName: string) {
  return buildMetadata({
    title: `Autoconsumo compartido en ${municipalityName} ${YEAR} — Normativa, coeficientes y ahorro`,
    description: `Guía de autoconsumo compartido colectivo en ${municipalityName}: coeficientes de reparto, requisitos legales, ventajas fiscales y estimación de ahorro.`,
    pathname: `/autoconsumo-compartido/${slug}`
  });
}