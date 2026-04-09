export type TariffType = "2.0TD" | "indexada" | "fija";

export type BatteryCalculatorInput = {
  monthlyConsumptionKwh: number;
  installationPowerKw: number;
  tariff: TariffType;
  sunHoursPerDay: number;
};

export type BatteryCalculatorOutput = {
  recommendedBatteries: number;
  requiredCapacityKwh: number;
  estimatedAnnualSavingsEur: number;
  energyIndependencePct: number;
  estimatedCostEur: number;
  paybackYears: number;
};

const PRICE_BY_TARIFF: Record<TariffType, number> = {
  "2.0TD": 0.22,
  indexada: 0.19,
  fija: 0.25
};

const NIGHT_SHARE_BY_TARIFF: Record<TariffType, number> = {
  "2.0TD": 0.55,
  indexada: 0.5,
  fija: 0.6
};

export function calculateBatteryRecommendation(input: BatteryCalculatorInput): BatteryCalculatorOutput {
  const monthlyConsumption = Math.max(0, input.monthlyConsumptionKwh);
  const installationPower = Math.max(0, input.installationPowerKw);
  const sunHours = Math.max(0, input.sunHoursPerDay);

  const dailyConsumption = monthlyConsumption / 30;
  const performanceRatio = 0.78;
  const dailyPvProduction = installationPower * sunHours * performanceRatio;

  const nightShare = NIGHT_SHARE_BY_TARIFF[input.tariff];
  const daytimeConsumption = dailyConsumption * (1 - nightShare);
  const nightConsumption = dailyConsumption * nightShare;

  const daytimeSurplus = Math.max(0, dailyPvProduction - daytimeConsumption);

  // Each battery is modeled as 5 kWh nominal with DoD and round-trip efficiency.
  const usablePerBatteryKwh = 5 * 0.9 * 0.92;
  const storageNeedKwh = Math.max(0, nightConsumption - daytimeSurplus);
  const recommendedBatteries = storageNeedKwh < 0.8 ? 0 : Math.ceil(storageNeedKwh / usablePerBatteryKwh);
  const requiredCapacityKwh = Number(storageNeedKwh.toFixed(2));

  const directSolarUsed = Math.min(dailyConsumption, dailyPvProduction);
  const batteryShift = Math.min(storageNeedKwh, recommendedBatteries * usablePerBatteryKwh * 0.9);

  const annualSelfSupplied = (directSolarUsed + batteryShift) * 365;
  const price = PRICE_BY_TARIFF[input.tariff];
  const estimatedAnnualSavingsEur = annualSelfSupplied * price;

  const energyIndependencePct =
    dailyConsumption === 0 ? 0 : Math.min(99, ((directSolarUsed + batteryShift) / dailyConsumption) * 100);

  const estimatedCostEur = Math.round(recommendedBatteries * 5 * 550); // Módulos de 5kWh a 550€/kWh
  const paybackYears = estimatedAnnualSavingsEur > 0 ? estimatedCostEur / estimatedAnnualSavingsEur : 0;

  return {
    recommendedBatteries,
    requiredCapacityKwh,
    estimatedAnnualSavingsEur: Math.round(estimatedAnnualSavingsEur),
    energyIndependencePct: Number(energyIndependencePct.toFixed(1)),
    estimatedCostEur,
    paybackYears: Number(paybackYears.toFixed(1)),
  };
}