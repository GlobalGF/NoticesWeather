import { createSupabaseServerClient } from "@/lib/supabase/server";
import { fetchWeatherApi } from "@/lib/weather/fetchWeatherApi";

export async function getMunicipioBySlug(slug: string): Promise<any | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("municipios_energia")
    .select("municipio, provincia, slug, irradiacion_solar, horas_sol, bonificacion_ibi, bonificacion_icio, ahorro_estimado, precio_instalacion_medio_eur")
    .eq("slug", slug)
    .maybeSingle();
  if (error) return null;
  return data;
}

export async function getWeatherBySlug(slug: string) {
  // Puedes adaptar el slug para WeatherAPI si es necesario
  return fetchWeatherApi(slug.replace(/-.*/, ""));
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
