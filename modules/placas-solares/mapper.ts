import type { Municipality } from "@/data/types";

export function mapPlacasCopy(municipality: Municipality, annualProductionKwh: number) {
  return {
    title: `Placas Solares en ${municipality.name}`,
    intro: `Estimacion de potencial fotovoltaico para ${municipality.name}, ${municipality.province}.`,
    highlights: [
      { label: "Produccion anual estimada", value: `${Math.round(annualProductionKwh)} kWh` },
      { label: "Provincia", value: municipality.province },
      { label: "Comunidad autonoma", value: municipality.autonomousCommunity }
    ]
  };
}