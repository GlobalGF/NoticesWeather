import { createSupabaseServerClient } from "@/lib/supabase/server";
import { fetchWeatherApi } from "@/lib/weather/fetchWeatherApi";

export async function getMunicipioBySlug(slug: string): Promise<any | null> {
  // DEBUG LOG 1: Start fetch
  if (!slug || typeof slug !== "string") return null;
  console.info(`[getMunicipioBySlug] Fetching slug: ${slug}`);
  const supabase = await createSupabaseServerClient();
  
  // Try exact match first
  let { data, error } = await supabase
    .from("municipios_energia")
    .select("municipio, provincia, comunidad_autonoma, slug, irradiacion_solar, horas_sol, bonificacion_ibi, bonificacion_icio, ahorro_estimado, precio_instalacion_medio_eur, subvencion_autoconsumo, precio_medio_luz")
    .ilike("slug", slug.trim())
    .maybeSingle();

  // FUZZY FALLBACK: If Galician slugs like "ares-coruna-a" fail, try searching for the main parts
  if (!data && !error && slug.includes("-")) {
    const parts = slug.split("-").filter(p => p.length > 2);
    const mainNames = parts.filter(p => !["coruna", "pontevedra", "lugo", "ourense", "galicia", "a"].includes(p));
    
    if (mainNames.length > 0) {
      const searchPattern = `%${mainNames[0]}%`;
      console.info(`[getMunicipioBySlug] Trying fuzzy for: ${searchPattern}`);
      const fuzzyResult = await supabase
        .from("municipios_energia")
        .select("municipio, provincia, comunidad_autonoma, slug, irradiacion_solar, horas_sol, bonificacion_ibi, bonificacion_icio, ahorro_estimado, precio_instalacion_medio_eur, subvencion_autoconsumo, precio_medio_luz")
        .ilike("slug", searchPattern)
        .limit(10);
        
      const fuzzyData = fuzzyResult.data as any[];
      if (fuzzyData && fuzzyData.length > 0) {
        // Try to find the best match containing most parts of the original slug
        const matching = fuzzyData.find(d => parts.every(p => d.slug.includes(p))) || fuzzyData[0];
        if (matching) {
          console.info(`[getMunicipioBySlug] Fuzzy match found: ${matching.slug}`);
          data = matching;
        }
      }
    }
  }
    
  if (error) {
    console.error(`[getMunicipioBySlug] Supabase Error:`, error);
    return null;
  }
  
  if (!data) {
    console.warn(`[getMunicipioBySlug] No record found for: ${slug}`);
    return null;
  }

  // DEBUG LOG 2: Data success
  const mData = data as any;
  if (mData) {
    console.info(`[getMunicipioBySlug] Found: ${mData.municipio}, ${mData.provincia}`);
  }
  return data;
}

export async function getSeoSnapshotBySlug(slug: string): Promise<any | null> {
  if (!slug || typeof slug !== "string") return null;
  const supabase = await createSupabaseServerClient();
  
  const { data, error } = await supabase
    .from("seo_municipio_snapshot")
    .select("*")
    .ilike("slug", slug.trim())
    .maybeSingle();

  if (error) {
    console.error(`[getSeoSnapshotBySlug] Supabase Error:`, error);
    return null;
  }
  
  return data;
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
  if (!provincia) return [];
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("municipios_energia")
    .select("slug, municipio, provincia, habitantes, ahorro_estimado, irradiacion_solar, bonificacion_ibi")
    .eq("provincia", provincia)
    .order("habitantes", { ascending: false, nullsFirst: false })
    .limit(limit);
  
  if (error || !data) return [];
  return data;
}

export async function getPrecioLuzHoy(): Promise<number> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("precios_electricidad_es")
    .select("precio_kwh_media")
    .order("fecha", { ascending: false })
    .limit(1)
    .maybeSingle();

  const precioData = data as any;
  return precioData?.precio_kwh_media ?? 0.16;
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
  const supabase = await createSupabaseServerClient();
  
  // Optimización: Intentar obtener agregados directamente de la DB para evitar cargar 8k filas
  // Si PostgREST no soporta agregados directamente, usamos una muestra representativa o valores por defecto
  const { data, error } = await supabase
    .from("municipios_energia")
    .select("horas_sol, irradiacion_solar, precio_instalacion_medio_eur, ahorro_estimado, bonificacion_ibi")
    .limit(500); // Muestra de 500 es más que suficiente para promedios nacionales y mucho más segura

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
    totalMunicipios: 8131, // Valor aproximado real en España para SEO
    avgIBI: countIBI > 0 ? Math.round(sumIBI / countIBI) : 40,
  };
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

