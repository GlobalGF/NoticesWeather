import type { UrbanRegulation } from "@/data/types";
import type { MunicipioEnergia } from "@/data/repositories/municipios-energia.repo";

export function mapUrbanRegulationCopy(municipality: MunicipioEnergia, regulation: UrbanRegulation) {
  return {
    title: `Normativa solar en ${municipality.municipio}: ${regulation.title}`,
    intro: `Informacion orientativa sobre tramites urbanisticos para instalar placas solares en ${municipality.municipio}.`,
    highlights: [
      { label: "Municipio", value: municipality.municipio },
      { label: "Provincia", value: municipality.provincia },
      { label: "Norma", value: regulation.title },
      { label: "Licencia", value: regulation.licenseRequired ? "Requerida" : "No requerida" },
      { label: "Resumen", value: regulation.summary }
    ]
  };
}
