import type { InverterEvCompatibility } from "@/data/types";

export function mapInverterEvCompatibilityCopy(data: InverterEvCompatibility) {
  return {
    title: `Compatibilidad inversor ${data.inverterSlug} + cargador ${data.chargerSlug}`,
    intro: `Analisis tecnico de compatibilidad para configuracion fotovoltaica + recarga EV en tarifa ${data.tariffSlug}.`,
    highlights: [
      { label: "Inversor", value: data.inverterSlug },
      { label: "Cargador EV", value: data.chargerSlug },
      { label: "Tarifa", value: data.tariffSlug },
      { label: "Compatible", value: data.compatible ? "Si" : "No" },
      { label: "Eficiencia", value: `${data.efficiencyScore}%` }
    ]
  };
}
