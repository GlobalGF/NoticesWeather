export type SharedConsumptionInput = {
  householdCount: number;
  averageMonthlyConsumptionKwh: number;
  installationPowerKw: number;
  installationDistanceKm: number;
};

export type SharedConsumptionOutput = {
  recommendedMode: "reparto-estatico" | "reparto-dinamico";
  recommendedCoefficientPerHousehold: number;
  coefficients: number[];
  monthlyCommunityDemandKwh: number;
  monthlyNetProductionKwh: number;
  gridLossPct: number;
  selfSupplyCoveragePct: number;
  monthlySurplusKwh: number;
};

const EQUIVALENT_FULL_LOAD_HOURS_MONTH = 120;

export function optimizeSharedSelfConsumption(input: SharedConsumptionInput): SharedConsumptionOutput {
  // Mathematical model:
  // D_m = N * C_avg
  // P_m = P_inst * H_eq
  // L_d = min(0.25, 0.01 * Dist_km)
  // P_net = P_m * (1 - L_d)
  // Cov = min(1, P_net / D_m)
  // coef_i = (C_avg / (N * C_avg)) * Cov = (1/N) * Cov  (uniform households)

  const households = Math.max(1, Math.floor(input.householdCount));
  const avgConsumption = Math.max(0, input.averageMonthlyConsumptionKwh);
  const installationPower = Math.max(0, input.installationPowerKw);
  const distanceKm = Math.max(0, input.installationDistanceKm);

  const monthlyCommunityDemandKwh = households * avgConsumption;
  const monthlyGrossProductionKwh = installationPower * EQUIVALENT_FULL_LOAD_HOURS_MONTH;
  const gridLossPct = Math.min(25, distanceKm * 1.0);
  const monthlyNetProductionKwh = monthlyGrossProductionKwh * (1 - gridLossPct / 100);

  const rawCoverage =
    monthlyCommunityDemandKwh === 0 ? 0 : monthlyNetProductionKwh / monthlyCommunityDemandKwh;
  const selfSupplyCoveragePct = Math.min(100, Math.max(0, rawCoverage * 100));

  // Dynamic distribution is usually better when generation is limited or network losses are high.
  const recommendedMode = selfSupplyCoveragePct < 80 || gridLossPct > 10 ? "reparto-dinamico" : "reparto-estatico";

  const recommendedCoefficientPerHousehold =
    households === 0 ? 0 : Number(Math.min(1, 1 / households).toFixed(4));

  const coefficients = Array.from({ length: households }, () => recommendedCoefficientPerHousehold);

  const monthlySurplusKwh = Number((monthlyNetProductionKwh - monthlyCommunityDemandKwh).toFixed(1));

  return {
    recommendedMode,
    recommendedCoefficientPerHousehold,
    coefficients,
    monthlyCommunityDemandKwh: Number(monthlyCommunityDemandKwh.toFixed(1)),
    monthlyNetProductionKwh: Number(monthlyNetProductionKwh.toFixed(1)),
    gridLossPct: Number(gridLossPct.toFixed(1)),
    selfSupplyCoveragePct: Number(selfSupplyCoveragePct.toFixed(1)),
    monthlySurplusKwh
  };
}
