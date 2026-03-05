export function mapBatteryCopy(tariffName: string, consumptionLabel: string, recommendedKwh: number) {
  return {
    title: `Baterias solares para ${tariffName} y consumo ${consumptionLabel}`,
    intro: "Dimensionado orientativo de bateria residencial en funcion de tarifa y consumo.",
    highlights: [
      { label: "Tarifa", value: tariffName },
      { label: "Banda de consumo", value: consumptionLabel },
      { label: "Bateria recomendada", value: `${recommendedKwh} kWh` }
    ]
  };
}