export const cacheTags = {
  municipalities: "municipalities",
  municipiosEnergia: "municipios-energia",
  subsidies: "solar-subsidies",
  urbanRegulations: "urban-regulations",
  inverterEv: "inverter-ev",
  radiation: "radiation",
  sharedCoefficients: "shared-coefficients",
  pseoSlugs: "pseo-slugs",
  sitemaps: "sitemaps",
  municipality: (slug: string) => `municipality:${slug}`,
  municipiosEnergiaBySlug: (slug: string) => `municipios-energia:${slug}`,
  ibi: (slug: string) => `ibi:${slug}`,
  solar: (slug: string) => `solar:${slug}`,
  batteries: (tariff: string, consumption: string) => `batteries:${tariff}:${consumption}`,
  placas: (slug: string) => `placas:${slug}`,
  subsidy: (municipalitySlug: string, programSlug: string) => `solar-subsidy:${municipalitySlug}:${programSlug}`,
  urbanRule: (municipalitySlug: string, ruleSlug: string) => `urban-rule:${municipalitySlug}:${ruleSlug}`,
  inverterEvCombo: (inverterSlug: string, chargerSlug: string, tariffSlug: string) =>
    `inverter-ev:${inverterSlug}:${chargerSlug}:${tariffSlug}`,
  radiationByMunicipality: (municipalitySlug: string) => `radiation:${municipalitySlug}`,
  sharedCoefficient: (municipalitySlug: string, modeSlug: string) =>
    `shared-coefficient:${municipalitySlug}:${modeSlug}`,
  pseoSlug: (slug: string) => `pseo-slug:${slug}`
};