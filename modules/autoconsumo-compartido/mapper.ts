import type { Municipality } from "@/data/types";

export function mapSharedSelfConsumptionCopy(municipality: Municipality) {
  return {
    title: `Autoconsumo compartido en ${municipality.name}`,
    intro: `Guia de autoconsumo compartido para comunidades y pymes en ${municipality.name}.`,
    highlights: [
      { label: "Municipio", value: municipality.name },
      { label: "Provincia", value: municipality.province },
      { label: "Modelo", value: "Instalacion compartida <= 2 km" }
    ]
  };
}