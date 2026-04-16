export type HousingType = "piso" | "adosado" | "unifamiliar" | "empresa";

export type LeadValueInput = {
  monthlyConsumptionKwh: number;
  housingType: HousingType;
  location: string;
  electricityPriceEurKwh: number;
  hasInsterestInBatteries?: boolean;
};

export type LeadValueOutput = {
  leadScore: number;
  leadTier: "alto" | "medio" | "bajo";
  estimatedAnnualSpendEur: number;
  estimatedAnnualSavingsEur: number;
  estimatedLeadValueEur: number;
  assumptions: {
    housingFactor: number;
    locationFactor: number;
    savingsRate: number;
  };
};

const HOUSING_FACTOR: Record<HousingType, number> = {
  "unifamiliar": 1.0,
  "adosado": 0.95,
  "empresa": 0.9,
  "piso": 0.75
};

const LOCATION_FACTOR_BY_REGION: Record<string, number> = {
  andalucia: 1.12,
  murcia: 1.1,
  valencia: 1.08,
  extremadura: 1.08,
  "castilla-la-mancha": 1.05,
  madrid: 1.03,
  aragon: 1.02,
  cataluna: 1.02,
  "castilla-y-leon": 0.98,
  galicia: 0.95,
  asturias: 0.93,
  cantabria: 0.93,
  "pais-vasco": 0.94
};

function normalizeLocation(location: string): string {
  return location
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function calculateSolarLeadValue(input: LeadValueInput): LeadValueOutput {
  const monthlyConsumption = Math.max(0, input.monthlyConsumptionKwh);
  const price = Math.max(0.05, input.electricityPriceEurKwh);
  const annualConsumption = monthlyConsumption * 12;
  const annualSpend = annualConsumption * price;

  const housingFactor = HOUSING_FACTOR[input.housingType] ?? 0.8;
  const normalizedLocation = normalizeLocation(input.location);
  const locationFactor = LOCATION_FACTOR_BY_REGION[normalizedLocation] ?? 1;

  const baseSavingsRate = 0.34;
  const savingsRate = clamp(baseSavingsRate * housingFactor * locationFactor, 0.15, 0.5);
  const estimatedAnnualSavings = annualSpend * savingsRate;

  // Lead value approximates expected gross margin from captured and converted lead.
  // We increase it by 30% if batteries are involved (higher ticket price)
  let estimatedLeadValue = estimatedAnnualSavings * 0.55;
  if (input.hasInsterestInBatteries) {
    estimatedLeadValue *= 1.3;
  }

  const spendScore = clamp((annualSpend / 2600) * 45, 0, 45);
  const housingScore = clamp(housingFactor * 30, 0, 30);
  const locationScore = clamp(locationFactor * 15, 0, 15);
  const priceScore = clamp((price / 0.22) * 10, 0, 10);
  const batteryBonus = input.hasInsterestInBatteries ? 10 : 0;

  const leadScore = Math.round(clamp(spendScore + housingScore + locationScore + priceScore + batteryBonus, 0, 100));
  const leadTier = leadScore >= 70 ? "alto" : leadScore >= 45 ? "medio" : "bajo";

  return {
    leadScore,
    leadTier,
    estimatedAnnualSpendEur: Math.round(annualSpend),
    estimatedAnnualSavingsEur: Math.round(estimatedAnnualSavings),
    estimatedLeadValueEur: Math.round(estimatedLeadValue),
    assumptions: {
      housingFactor: Number(housingFactor.toFixed(2)),
      locationFactor: Number(locationFactor.toFixed(2)),
      savingsRate: Number((savingsRate * 100).toFixed(1))
    }
  };
}
