import type { Municipality } from "@/data/types";

export function mapIbiCopy(municipality: Municipality, percentage: number, years: number) {
  return {
    title: `Bonificacion IBI por placas solares en ${municipality.name}`,
    intro: `Consulta la bonificacion del IBI para instalaciones solares en ${municipality.name}.`,
    highlights: [
      { label: "Bonificacion", value: `${percentage}%` },
      { label: "Duracion", value: `${years} anos` },
      { label: "Provincia", value: municipality.province }
    ]
  };
}