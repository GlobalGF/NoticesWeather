import { getMunicipioEnergiaBySlug } from "@/data/repositories/municipios-energia.repo";
import { isValidSlug } from "@/lib/utils/validate-slug";
import { FALLBACK_ES } from "@/lib/data/constants";
import { mapEnergiaToPageData, type MunicipioPageData } from "@/lib/data/types";

// ---------------------------------------------------------------------------
// getMunicipioPageData
//
// Central data-access function for all municipality pages.
// Uses a proper 3-level fallback cascade:
//   Level 1 → municipios_energia (denormalized pSEO table, fastest)
//   Level 2 → minimal derived data from slug + national averages
//   Level 3 → null → page should return notFound()
//
// All Supabase access goes through createSupabaseServerClient() (in the repo)
// so service-role, auth config and caching are always applied.
// ---------------------------------------------------------------------------

export async function getMunicipioPageData(slug: string): Promise<MunicipioPageData | null> {
    // Guard: reject invalid slugs before hitting the database
    if (!isValidSlug(slug)) {
        return null;
    }

    // Level 1 — primary denormalized table (covers ~8.000+ municipalities)
    const primary = await getMunicipioEnergiaBySlug(slug);
    if (primary) {
        return mapEnergiaToPageData(primary);
    }

    // Level 2 — derive basic data from the slug itself + national averages
    // This allows the page to render something meaningful rather than 404-ing
    // for municipalities that exist in the slug index but not yet in municipios_energia.
    const municipioName = slugToDisplayName(slug);
    const partial: MunicipioPageData = {
        slug,
        municipio: municipioName,
        provincia: "",
        comunidadAutonoma: "",
        habitantes: 0,
        irradiacionSolar: FALLBACK_ES.irradiacion_kwh_m2,
        horasSol: FALLBACK_ES.horas_sol,
        precioMedioLuz: FALLBACK_ES.precio_luz_eur_kwh,
        ahorroEstimado: FALLBACK_ES.ahorro_estimado_pct,
        precioInstalacionMin: null,
        precioInstalacionMedio: FALLBACK_ES.precio_instalacion_eur,
        precioInstalacionMax: null,
        eurPorWatio: FALLBACK_ES.eur_por_watio,
        bonificacionIbi: FALLBACK_ES.bonificacion_ibi_pct,
        bonificacionIcio: null,
        subvencionAutoconsumo: null,
        _dataQuality: "minimal",
        _source: "derived",
    };

    return partial;
}

// ---------------------------------------------------------------------------
// Helper: convert a slug back to a display name
// e.g. "san-sebastian-de-los-reyes" → "San Sebastian de los Reyes"
// ---------------------------------------------------------------------------

const LOWERCASE_WORDS = new Set(["de", "del", "la", "las", "los", "el", "y", "e", "a", "en"]);

function slugToDisplayName(slug: string): string {
    return slug
        .split("-")
        .map((word, index) => {
            if (index > 0 && LOWERCASE_WORDS.has(word)) return word;
            return word.charAt(0).toUpperCase() + word.slice(1);
        })
        .join(" ");
}
