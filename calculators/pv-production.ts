export function estimateAnnualPvProduction(irradianceKwhM2: number, kwp: number, performanceRatio = 0.78): number {
  return irradianceKwhM2 * kwp * performanceRatio;
}