import type { SharedSelfConsumptionCoefficient } from "@/data/types";
import type { MunicipioEnergia } from "@/data/repositories/municipios-energia.repo";

export function mapSharedCoefficientCopy(
  municipality: MunicipioEnergia,
  coefficient: SharedSelfConsumptionCoefficient
) {
  return {
    title: `Coeficiente de autoconsumo compartido en ${municipality.municipio}`,
    intro: `Referencia de coeficiente para modalidad ${coefficient.modeSlug} en ${municipality.municipio}.`,
    highlights: [
      { label: "Municipio", value: municipality.municipio },
      { label: "Provincia", value: municipality.provincia },
      { label: "Modalidad", value: coefficient.modeSlug },
      { label: "Coeficiente", value: coefficient.coefficient.toLocaleString("es-ES") },
      { label: "Referencia legal", value: coefficient.legalReference ?? "No disponible" }
    ]
  };
}
