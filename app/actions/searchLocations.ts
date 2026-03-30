"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export type LocationResult = {
  type: "provincia" | "municipio";
  label: string;
  slug: string;
  sublabel?: string;
};

export async function searchLocations(query: string): Promise<LocationResult[]> {
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
        label: item.provincia,
        slug: item.provincia.toLowerCase().replace(/ /g, "-").normalize("NFD").replace(/[\u0300-\u036f]/g, ""),
        sublabel: "Provincia"
      });
    }

    if (isMunicipioMatch) {
      results.push({
        type: "municipio",
        label: item.municipio,
        slug: item.slug,
        sublabel: item.provincia
      });
    }
  }

  // Return max 8 results
  return results.slice(0, 8);
}
