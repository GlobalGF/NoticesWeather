import type { SolarSubsidy } from "@/data/types";
import type { MunicipioEnergia } from "@/data/repositories/municipios-energia.repo";

export function mapSubsidyCopy(municipality: MunicipioEnergia, subsidy: SolarSubsidy) {
  return {
    title: `Subvenciones solares en ${municipality.municipio}: ${subsidy.programName}`,
    intro: `Resumen de ayudas en ${municipality.municipio} para autoconsumo fotovoltaico con cuantias y requisitos orientativos.`,
    highlights: [
      { label: "Municipio", value: municipality.municipio },
      { label: "Provincia", value: municipality.provincia },
      { label: "Programa", value: subsidy.programName },
      { label: "Importe", value: `${subsidy.amountEur.toLocaleString("es-ES")} EUR` },
      { label: "Bonificacion IBI", value: `${municipality.bonificacionIbi ?? 0}%` }
    ]
  };
}
