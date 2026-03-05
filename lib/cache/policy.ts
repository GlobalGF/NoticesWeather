export const cachePolicy = {
  page: {
    solarCity: 21600,
    subsidy: 10800,
    regulation: 21600,
    compatibility: 21600,
    radiation: 21600,
    sharedCoefficient: 21600,
    batteries: 86400,
    ibi: 86400,
    sharedSelfConsumption: 86400,
    genericSolarSlug: 21600
  },
  data: {
    municipalitiesIndex: 21600,
    municipalityDetail: 21600,
    pseoSlugIndex: 21600,
    subsidy: 10800,
    regulation: 21600,
    compatibility: 21600,
    radiation: 21600,
    batteryAndSolar: 86400,
    ibi: 86400,
    sharedCoefficient: 21600
  },
  sitemap: {
    index: 3600,
    chunk: 3600,
    staleWhileRevalidate: 86400
  }
} as const;
