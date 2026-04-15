import { createSupabaseServerClient } from "@/lib/supabase/server";
import { fetchWeatherApi } from "@/lib/weather/fetchWeatherApi";
import { unstable_cache } from "next/cache";
import { cachePolicy } from "@/lib/cache/policy";

export async function getMunicipioBySlug(slug: string): Promise<any | null> {
    const COLS = "municipio, provincia, comunidad_autonoma, slug, irradiacion_solar, horas_sol, bonificacion_ibi, bonificacion_icio, ahorro_estimado, precio_instalacion_medio_eur, subvencion_autoconsumo, precio_medio_luz";

    const fetchFunc = async (s: string) => {
        if (!s || typeof s !== "string") return null;
        const supabase = await createSupabaseServerClient();
        
        // 1. Try EXACT slug match first (e.g. "madrid-madrid", "onis-asturias")
        const { data: exactData } = await supabase
            .from("municipios_energia")
            .select(COLS)
            .eq("slug", s.trim())
            .maybeSingle();

        if (exactData) return exactData;

        // 2. Try slug-as-prefix pattern: "madrid" → "madrid-%"
        //    This catches cases where the URL slug omits the province suffix
        const { data: prefixRows } = await supabase
            .from("municipios_energia")
            .select(COLS)
            .ilike("slug", `${s.trim()}-%`)
            .limit(5);

        if (prefixRows && prefixRows.length > 0) {
            // Prefer the row whose slug starts with our exact input
            const best = (prefixRows as any[]).find(d => d.slug.startsWith(s + "-")) || prefixRows[0];
            if (best) return best;
        }

        // 3. Strict fuzzy: only if slug has multiple parts, require ALL parts to appear
        if (s.includes("-")) {
            const parts = s.split("-").filter(p => p.length > 2);
            if (parts.length > 0) {
                // Use the longest distinctive part to narrow the DB search
                const longestPart = parts.reduce((a, b) => a.length >= b.length ? a : b);
                const { data: fuzzyRows } = await supabase
                    .from("municipios_energia")
                    .select(COLS)
                    .ilike("slug", `%${longestPart}%`)
                    .limit(20);

                if (fuzzyRows && fuzzyRows.length > 0) {
                    // STRICT: require ALL meaningful parts to be present in the slug
                    const strictMatch = (fuzzyRows as any[]).find(d => 
                        parts.every(p => d.slug.includes(p))
                    );
                    if (strictMatch) return strictMatch;
                }
            }
        }

        return null;
    };

    return unstable_cache(
        () => fetchFunc(slug),
        [`muni-detail-${slug}`],
        { revalidate: cachePolicy.data.municipalityDetail, tags: ["municipios"] }
    )();
}

export async function getSeoSnapshotBySlug(slug: string): Promise<any | null> {
    const fetchFunc = async (s: string) => {
        if (!s || typeof s !== "string") return null;
        const supabase = await createSupabaseServerClient();
        const { data } = await supabase
            .from("seo_municipio_snapshot")
            .select("*")
            .ilike("slug", s.trim())
            .maybeSingle();
        return data;
    };

    return unstable_cache(
        () => fetchFunc(slug),
        [`seo-snapshot-${slug}`],
        { revalidate: cachePolicy.data.municipalityDetail, tags: ["seo"] }
    )();
}

export async function getWeatherForLocation(municipioName: string, provinciaName: string) {
  try {
    if (!municipioName) {
        console.warn(`[getWeatherForLocation] Missing municipio name!`);
        return null;
    }
    // DEBUG LOG 3: Weather request
    console.info(`[getWeatherForLocation] Requesting weather for: ${municipioName}, ${provinciaName}`);
    const weather = await fetchWeatherApi(municipioName, provinciaName || "", "Spain");
    console.info(`[getWeatherForLocation] Weather fetch success.`);
    return weather;
  } catch (error) {
    console.error(`[getWeatherForLocation] Failed to fetch weather for ${municipioName}, ${provinciaName}:`, error);
    return null;
  }
}

export async function getNearbyMunicipiosEnergiaByProvince(provincia: string, limit = 6): Promise<any[]> {
    const fetchFunc = async (p: string, l: number) => {
        if (!p) return [];
        const supabase = await createSupabaseServerClient();
        const { data } = await supabase
            .from("municipios_energia")
            .select("slug, municipio, provincia, habitantes, ahorro_estimado, irradiacion_solar, bonificacion_ibi")
            .eq("provincia", p)
            .order("habitantes", { ascending: false, nullsFirst: false })
            .limit(l);
        return data || [];
    };

    return unstable_cache(
        () => fetchFunc(provincia, limit),
        [`nearby-muni-${provincia}-${limit}`],
        { revalidate: cachePolicy.data.municipalityDetail, tags: ["nearby"] }
    )();
}

export async function getPrecioLuzHoy(): Promise<number> {
    const fetchFunc = async () => {
        const supabase = await createSupabaseServerClient();
        const { data } = await supabase
            .from("precios_electricidad_es")
            .select("precio_kwh_media")
            .order("fecha", { ascending: false })
            .limit(1)
            .maybeSingle();

        const precioData = data as any;
        return precioData?.precio_kwh_media ?? 0.16;
    };

    return unstable_cache(
        () => fetchFunc(),
        ["precio-luz-hoy"],
        { revalidate: 3600, tags: ["tarifa"] } // Revalidate every hour
    )();
}

/**
 * Fetch the largest municipalities in a province (Hubs) by population.
 * Strategic for SEO internal linking.
 */
export async function getProvinceHubs(provincia: string, limit = 15): Promise<any[]> {
    const fetchFunc = async (p: string, l: number) => {
        if (!p) return [];
        const supabase = await createSupabaseServerClient();
        const { data } = await supabase
            .from("municipios_energia")
            .select("slug, municipio, provincia, habitantes")
            .eq("provincia", p)
            .order("habitantes", { ascending: false, nullsFirst: false })
            .limit(l);
        return data || [];
    };

    return unstable_cache(
        () => fetchFunc(provincia, limit),
        [`hubs-muni-${provincia}-${limit}`],
        { revalidate: cachePolicy.data.municipalityDetail, tags: ["hubs"] }
    )();
}

export type NationalStats = {
  avgSunHours: number;
  avgRadiation: number;
  avgInstallCost: number;
  avgSavings: number;
  totalMunicipios: number;
  avgIBI: number;
};

export async function getNationalStats(): Promise<NationalStats> {
    const fetchFunc = async () => {
        const supabase = await createSupabaseServerClient();
        const { data, error } = await supabase
            .from("municipios_energia")
            .select("horas_sol, irradiacion_solar, precio_instalacion_medio_eur, ahorro_estimado, bonificacion_ibi")
            .limit(500);

        if (error || !data || data.length === 0) {
            return { avgSunHours: 2500, avgRadiation: 1700, avgInstallCost: 5000, avgSavings: 800, totalMunicipios: 8131, avgIBI: 40 };
        }

        const typed = data as any[];
        let sumHours = 0, countHours = 0;
        let sumRad = 0, countRad = 0;
        let sumCost = 0, countCost = 0;
        let sumSavings = 0, countSavings = 0;
        let sumIBI = 0, countIBI = 0;

        for (const d of typed) {
            if (d.horas_sol) { sumHours += d.horas_sol; countHours++; }
            if (d.irradiacion_solar) { sumRad += d.irradiacion_solar; countRad++; }
            if (d.precio_instalacion_medio_eur) { sumCost += d.precio_instalacion_medio_eur; countCost++; }
            if (d.ahorro_estimado) { sumSavings += d.ahorro_estimado; countSavings++; }
            if (d.bonificacion_ibi) { sumIBI += d.bonificacion_ibi; countIBI++; }
        }

        return {
            avgSunHours: countHours > 0 ? Math.round(sumHours / countHours) : 2500,
            avgRadiation: countRad > 0 ? Math.round(sumRad / countRad) : 1700,
            avgInstallCost: countCost > 0 ? Math.round(sumCost / countCost) : 5000,
            avgSavings: countSavings > 0 ? Math.round(sumSavings / countSavings) : 800,
            totalMunicipios: 8131,
            avgIBI: countIBI > 0 ? Math.round(sumIBI / countIBI) : 40,
        };
    };

    return unstable_cache(
        () => fetchFunc(),
        ["national-stats"],
        { revalidate: 86400, tags: ["stats"] } // Once per day
    )();
}

/**
 * Fetch a list of slugs for the most populated or prioritized municipalities 
 * for static pre-building (ISR).
 * Uses the same 'municipios_energia' table as the page content to ensure parity.
 */
export async function getTopMunicipiosEnergia(limit = 400): Promise<{ slug: string }[]> {
  const supabase = await createSupabaseServerClient();
  
  // We prioritize by 'habitantes' to pre-build the most visited pages
  const { data, error } = await supabase
    .from("municipios_energia")
    .select("slug")
    .not("municipio", "is", null)
    .order("habitantes", { ascending: false, nullsFirst: false })
    .limit(limit);

  if (error || !data) {
    console.warn(`[getTopMunicipiosEnergia] Error fetching top municipios:`, error);
    return [];
  }

  const typed = data as any[];
  return typed.map(d => ({ slug: d.slug }));
}

