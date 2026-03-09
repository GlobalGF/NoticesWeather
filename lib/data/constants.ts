/**
 * National-average fallback values for Spain (2024).
 * These are injected when a municipality record is missing specific fields
 * so that pSEO pages are never completely empty.
 */
export const FALLBACK_ES = {
    /** Average annual solar irradiation across Spain (kWh/m²/year) */
    irradiacion_kwh_m2: 1650,

    /** Average residential electricity price in Spain (EUR/kWh) */
    precio_luz_eur_kwh: 0.22,

    /** Conservative estimated annual savings with solar installation (%) */
    ahorro_estimado_pct: 35,

    /** Average IBI bonification offered by municipalities (%) */
    bonificacion_ibi_pct: 30,

    /** Average regional subsidy for self-consumption installation (EUR) */
    subvencion_eur: 1500,

    /** Average annual sun hours in Spain */
    horas_sol: 2500,

    /** Average installation price for 3 kWp system (EUR) */
    precio_instalacion_eur: 6200,

    /** Average price per watt installed (EUR/Wp) */
    eur_por_watio: 1.8,
} as const;
