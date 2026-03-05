export function estimateAnnualSavings(productionKwh: number, selfConsumptionRatio: number, energyPriceEurKwh: number): number {
  return productionKwh * selfConsumptionRatio * energyPriceEurKwh;
}