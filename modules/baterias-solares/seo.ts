import { buildMetadata } from "@/lib/seo/metadata-builder";

const YEAR = new Date().getFullYear();

export function batteryMetadata(tarifa: string, consumo: string) {
  return buildMetadata({
    title: `Baterías solares ${YEAR} para tarifa ${tarifa} — Consumo ${consumo}`,
    description: `Comparativa y dimensionado de baterías solares para la tarifa ${tarifa} y un consumo de ${consumo}: capacidad, ciclos y retorno de inversión.`,
    pathname: `/baterias-solares/${tarifa}/${consumo}`
  });
}