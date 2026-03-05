import { buildMetadata } from "@/lib/seo/metadata-builder";

export function batteryMetadata(tarifa: string, consumo: string) {
  return buildMetadata({
    title: `Baterias solares para tarifa ${tarifa} y consumo ${consumo}`,
    description: "Comparativa y dimensionado de baterias solares segun tarifa y consumo anual.",
    pathname: `/baterias-solares/${tarifa}/${consumo}`
  });
}