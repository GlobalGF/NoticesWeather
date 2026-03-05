import type { RadiationProfile } from "@/data/types";
import type { MunicipioEnergia } from "@/data/repositories/municipios-energia.repo";

export function mapRadiationCopy(municipality: MunicipioEnergia, radiation: RadiationProfile) {
  return {
    title: `Radiacion solar en ${municipality.municipio}`,
    intro: `Potencial de produccion fotovoltaica en ${municipality.municipio} segun irradiacion anual y angulo optimo.`,
    highlights: [
      { label: "Municipio", value: municipality.municipio },
      { label: "Provincia", value: municipality.provincia },
      { label: "Radiacion anual", value: `${radiation.annualKwhM2.toLocaleString("es-ES")} kWh/m2` },
      { label: "Inclinacion optima", value: `${radiation.optimalTiltDeg} grados` },
      { label: "Horas de sol", value: municipality.horasSol.toLocaleString("es-ES") }
    ]
  };
}
