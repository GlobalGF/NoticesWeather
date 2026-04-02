import { createSupabaseServerClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils/slug";

export interface ProvinceMunicipio {
  slug: string;
  municipio: string;
  habitantes?: number;
}

export interface ProvinceStats {
  provinceName: string;
  provinceSlug: string;
  totalMunicipios: number;
  avgSunHours: number;
  avgRadiation: number;
  avgSavings: number;
  avgIBI: number;
  municipios: ProvinceMunicipio[];
}

/**
 * Fetch aggregated statistics + full municipality list for a given province slug.
 * Returns null if no data found for the given slug.
 */
export async function getProvinceStats(provinceSlug: string): Promise<ProvinceStats | null> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("municipios_energia")
    .select("municipio, provincia, slug, horas_sol, irradiacion_solar, ahorro_estimado, bonificacion_ibi, habitantes")
    .not("municipio", "is", null);

  if (error || !data || data.length === 0) return null;

  const rows = (data as any[]).filter(
    (d) => slugify(d.provincia as string) === provinceSlug
  );

  if (rows.length === 0) return null;

  const provinceName: string = rows[0].provincia;

  let sumHours = 0, countHours = 0;
  let sumRad = 0, countRad = 0;
  let sumSavings = 0, countSavings = 0;
  let sumIBI = 0, countIBI = 0;

  const municipios: ProvinceMunicipio[] = [];

  for (const d of rows) {
    if (d.horas_sol) { sumHours += d.horas_sol; countHours++; }
    if (d.irradiacion_solar) { sumRad += d.irradiacion_solar; countRad++; }
    if (d.ahorro_estimado) { sumSavings += d.ahorro_estimado; countSavings++; }
    if (d.bonificacion_ibi) { sumIBI += d.bonificacion_ibi; countIBI++; }

    municipios.push({
      slug: d.slug as string,
      municipio: d.municipio as string,
      habitantes: d.habitantes ?? 0,
    });
  }

  // Sort municipalities alphabetically
  municipios.sort((a, b) => a.municipio.localeCompare(b.municipio, "es"));

  return {
    provinceName,
    provinceSlug,
    totalMunicipios: municipios.length,
    avgSunHours: countHours > 0 ? Math.round(sumHours / countHours) : 2500,
    avgRadiation: countRad > 0 ? Math.round(sumRad / countRad) : 1700,
    avgSavings: countSavings > 0 ? Math.round(sumSavings / countSavings) : 800,
    avgIBI: countIBI > 0 ? Math.round(sumIBI / countIBI) : 40,
    municipios,
  };
}

/**
 * Fetch just the list of all province names + slugs for the mini-selector dropdown.
 */
export async function getAllProvinces(): Promise<{ name: string; slug: string }[]> {
  const supabase = await createSupabaseServerClient();

  const { data } = await supabase
    .from("municipios_energia")
    .select("provincia")
    .not("provincia", "is", null);

  if (!data) return [];

  const unique = new Set<string>();
  (data as any[]).forEach((d) => {
    if (d.provincia) unique.add(d.provincia);
  });

  return Array.from(unique)
    .sort((a, b) => a.localeCompare(b, "es"))
    .map((name) => ({ name, slug: slugify(name) }));
}
