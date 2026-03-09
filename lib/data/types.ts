import type { MunicipioEnergia } from "@/data/repositories/municipios-energia.repo";

// ---------------------------------------------------------------------------
// Unified page data type — used by ALL municipality pages
// ---------------------------------------------------------------------------

export type MunicipioPageData = {
    // Identity
    slug: string;
    municipio: string;
    provincia: string;
    comunidadAutonoma: string;

    // Demographics
    habitantes: number;

    // Solar
    irradiacionSolar: number;   // kWh/m²/year
    horasSol: number;           // hours/year

    // Economic
    precioMedioLuz: number;             // EUR/kWh
    ahorroEstimado: number;             // EUR/year (or %)
    precioInstalacionMin: number | null;
    precioInstalacionMedio: number | null;
    precioInstalacionMax: number | null;
    eurPorWatio: number | null;

    // Fiscal
    bonificacionIbi: number | null;   // %
    bonificacionIcio: number | null;  // %

    // Aid
    subvencionAutoconsumo: number | null; // %

    // Internal metadata
    _dataQuality: "full" | "partial" | "minimal";
    _source: "municipios_energia" | "pseo_index" | "derived";
};

// ---------------------------------------------------------------------------
// Mapper: MunicipioEnergia → MunicipioPageData
// ---------------------------------------------------------------------------

export function mapEnergiaToPageData(row: MunicipioEnergia): MunicipioPageData {
    return {
        slug: row.slug,
        municipio: row.municipio,
        provincia: row.provincia,
        comunidadAutonoma: row.comunidadAutonoma,
        habitantes: row.habitantes,
        irradiacionSolar: row.irradiacionSolar,
        horasSol: row.horasSol,
        precioMedioLuz: row.precioMedioLuz,
        ahorroEstimado: row.ahorroEstimado,
        // Price fields not in MunicipioEnergia — will be null unless the underlying
        // table has them. Extended type in the future can expose them.
        precioInstalacionMin: (row as unknown as Record<string, unknown>)["precio_instalacion_min_eur"] as number | null ?? null,
        precioInstalacionMedio: (row as unknown as Record<string, unknown>)["precio_instalacion_medio_eur"] as number | null ?? null,
        precioInstalacionMax: (row as unknown as Record<string, unknown>)["precio_instalacion_max_eur"] as number | null ?? null,
        eurPorWatio: (row as unknown as Record<string, unknown>)["eur_por_watio"] as number | null ?? null,
        bonificacionIbi: row.bonificacionIbi,
        bonificacionIcio: row.bonificacionIcio,
        subvencionAutoconsumo: row.subvencionAutoconsumo,
        _dataQuality: "full",
        _source: "municipios_energia",
    };
}
