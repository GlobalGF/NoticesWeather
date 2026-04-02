import { createSupabaseServerClient } from "@/lib/supabase/server";
import { fetchWeatherApi } from "@/lib/weather/fetchWeatherApi";

export async function getMunicipioBySlug(slug: string): Promise<any | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("municipios_energia")
    .select("municipio, provincia, comunidad_autonoma, slug, irradiacion_solar, horas_sol, bonificacion_ibi, bonificacion_icio, ahorro_estimado, precio_instalacion_medio_eur, subvencion_autoconsumo")
    .eq("slug", slug)
    .maybeSingle();
  if (error) return null;
  return data;
}

export async function getWeatherBySlug(slug: string) {
  try {
    return await fetchWeatherApi(slug.replace(/-.*/, ""));
  } catch (error) {
    console.error(`[getWeatherBySlug] Failed to fetch weather for ${slug}:`, error);
    return null;
  }
}

export async function getNearbyMunicipiosEnergiaByProvince(provincia: string, limit = 6): Promise<any[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("municipios_energia")
    .select("slug, municipio, provincia, ahorro_estimado, irradiacion_solar, bonificacion_ibi")
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
  const { data } = await supabase
    .from("municipios_energia")
    .select("horas_sol, irradiacion_solar, precio_instalacion_medio_eur, ahorro_estimado, bonificacion_ibi");

  if (!data || data.length === 0) {
    return { avgSunHours: 2500, avgRadiation: 1700, avgInstallCost: 5000, avgSavings: 800, totalMunicipios: 0, avgIBI: 40 };
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
    totalMunicipios: typed.length,
    avgIBI: countIBI > 0 ? Math.round(sumIBI / countIBI) : 40,
  };
}

