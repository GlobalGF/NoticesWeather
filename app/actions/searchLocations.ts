"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils/slug";

export type LocationResult = {
  type: "provincia" | "municipio";
  label: string;
  slug: string;
  sublabel?: string;
};

export async function searchLocations(rawQuery: string): Promise<LocationResult[]> {
  const query = rawQuery.trim();
  if (!query || query.length < 2) return [];

  const supabase = await createSupabaseServerClient();
  const searchPattern = `%${query}%`;

  // We could just search municipios_energia where we have both provincia and municipio
  const { data, error } = await supabase
    .from("municipios_energia")
    .select("municipio, provincia, slug")
    .or(`municipio.ilike.${searchPattern},provincia.ilike.${searchPattern}`)
    .order("habitantes", { ascending: false, nullsFirst: false })
    .limit(10);

  if (error || !data) {
    return [];
  }

  const rows = data as { municipio: string; provincia: string; slug: string }[];
  
  // Deduplicate and format
  const results: LocationResult[] = [];
  const addedProvinces = new Set<string>();

  for (const item of rows) {
    const isProvinciaMatch = item.provincia.toLowerCase().includes(query.toLowerCase());
    const isMunicipioMatch = item.municipio.toLowerCase().includes(query.toLowerCase());

    if (isProvinciaMatch && !addedProvinces.has(item.provincia)) {
      addedProvinces.add(item.provincia);
      results.push({
        type: "provincia",
        label: `${item.provincia} (Provincia)`,
        slug: slugify(item.provincia),
        sublabel: "Ver todos los municipios"
      });
    }

    if (isMunicipioMatch) {
      // Si el municipio se llama igual que la provincia (Ej: Madrid, Barcelona), le añadimos "Ciudad" para mayor claridad visual
      const isCapitalOSimiliar = item.municipio.toLowerCase() === item.provincia.toLowerCase();
      results.push({
        type: "municipio",
        label: isCapitalOSimiliar ? `${item.municipio} (Ciudad)` : item.municipio,
        slug: item.slug,
        sublabel: `Municipio de ${item.provincia}`
      });
    }
  }

  // Return max 8 results
  return results.slice(0, 8);
}
