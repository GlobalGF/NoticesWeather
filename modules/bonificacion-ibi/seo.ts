import { buildMetadata } from "@/lib/seo/metadata-builder";

const YEAR = new Date().getFullYear();

export function ibiMetadata(slug: string, municipalityName: string) {
  return buildMetadata({
    title: `Bonificación IBI ${YEAR} por placas solares en ${municipalityName} — Porcentaje y requisitos`,
    description: `Guía completa de la bonificación del IBI por instalar energía solar en ${municipalityName}: porcentaje, años de duración y cómo solicitarla.`,
    pathname: `/bonificacion-ibi/${slug}`
  });
}