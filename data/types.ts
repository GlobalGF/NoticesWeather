export type Municipality = {
  slug: string;
  name: string;
  province: string;
  autonomousCommunity: string;
  priorityScore: number;
};

export type IbiBonification = {
  municipalitySlug: string;
  percentage: number;
  years: number;
  sourceUrl: string | null;
};

export type Tariff = {
  slug: string;
  name: string;
};

export type ConsumptionBand = {
  slug: string;
  minKwh: number;
  maxKwh: number;
};

export type SolarSubsidy = {
  municipalitySlug: string;
  programSlug: string;
  programName: string;
  amountEur: number;
  sourceUrl: string | null;
};

export type UrbanRegulation = {
  municipalitySlug: string;
  ruleSlug: string;
  title: string;
  licenseRequired: boolean;
  summary: string;
};

export type InverterEvCompatibility = {
  inverterSlug: string;
  chargerSlug: string;
  tariffSlug: string;
  compatible: boolean;
  notes: string | null;
  efficiencyScore: number;
};

export type RadiationProfile = {
  municipalitySlug: string;
  annualKwhM2: number;
  optimalTiltDeg: number;
  source: string | null;
};

export type SharedSelfConsumptionCoefficient = {
  municipalitySlug: string;
  modeSlug: string;
  coefficient: number;
  legalReference: string | null;
};