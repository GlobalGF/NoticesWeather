export const cachePolicy = {
  page: {
    /** Municipality solar page — update 2x/day as data can change with tariffs */
    solarCity: 21600,
    /** Subsidy pages — update 3x/day as availability can change */
    subsidy: 10800,
    /** Urban regulations — stable, once per day is enough */
    regulation: 86400,
    /** Inverter/battery compatibility — very stable, update once per day */
    compatibility: 86400,
    /** Radiation data — very stable, update once per day */
    radiation: 86400,
    /** Shared self-consumption coefficients — stable, weekly */
    sharedCoefficient: 86400,
    /** Battery catalog pages — stable, 7 days */
    batteries: 604800,
    /** IBI bonification pages — very stable (municipal ordinances), 7 days */
    ibi: 604800,
    /** Shared self-consumption pages — stable, once per day */
    sharedSelfConsumption: 86400,
    /** Generic pSEO slug pages */
    genericSolarSlug: 21600
  },
  data: {
    /** municipios_energia index (counts, slug lists) — 6h */
    municipalitiesIndex: 21600,
    /** Individual municipality detail record — 6h */
    municipalityDetail: 21600,
    /** pseo_slug_index — 6h */
    pseoSlugIndex: 21600,
    /** Subsidy data — 3h (can become unavailable) */
    subsidy: 10800,
    /** Urban regulations — very stable, once per day */
    regulation: 86400,
    /** Compatibility table — very stable, once per day */
    compatibility: 86400,
    /** Radiation profiles — very stable, once per day */
    radiation: 86400,
    /** Battery and solar equipment catalog — stable, 7 days */
    batteryAndSolar: 604800,
    /** IBI bonification records — very stable (municipal ordinances), 7 days */
    ibi: 604800,
    /** Shared self-consumption coefficients — stable, once per day */
    sharedCoefficient: 86400
  },
  sitemap: {
    /** Sitemap index — regenerate every hour */
    index: 3600,
    /** Sitemap chunk — regenerate every hour */
    chunk: 3600,
    /** Stale-while-revalidate window for sitemaps */
    staleWhileRevalidate: 86400
  }
} as const;
