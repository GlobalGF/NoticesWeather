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

  const unaccented = query.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const pattern = `%${query}%`;
  const slugPattern = `%${unaccented}%`;

  const supabase = await createSupabaseServerClient();
  // We search by municipio, provincia, and slug (which is always unaccented)
  const { data, error } = await supabase
    .from("municipios_energia")
    .select("municipio, provincia, slug")
    .or(`municipio.ilike.${pattern},provincia.ilike.${pattern},slug.ilike.${slugPattern}`)
    .order("habitantes", { ascending: false, nullsFirst: false })
    .limit(12);

  if (error || !data) {
    return [];
  }

  const rows = data as { municipio: string; provincia: string; slug: string }[];
  
  // Deduplicate and format
  const results: LocationResult[] = [];
  const addedProvinces = new Set<string>();

  const queryLC = query.toLowerCase();
  const unaccentedLC = unaccented.toLowerCase();

  for (const item of rows) {
    const provLC = item.provincia.toLowerCase();
    const munLC = item.municipio.toLowerCase();
    const slugLC = item.slug.toLowerCase();

      const isProvinciaMatch = provLC.includes(queryLC) || provLC.includes(unaccentedLC) || slugLC.includes(unaccentedLC);
      const isMunicipioMatch = munLC.includes(queryLC) || munLC.includes(unaccentedLC) || slugLC.includes(unaccentedLC);
  
      // Smart handling for bilingual names like "Araba/Álava" or "Alicante/Alacant"
      let cleanProvName = item.provincia;
      if (item.provincia.includes("/")) {
        const parts = item.provincia.split("/").map(p => p.trim());
        // If the query matches one part specifically, use that one. 
        // Otherwise, default to the first part.
        const matchingPart = parts.find(p => 
          p.toLowerCase().includes(queryLC) || 
          p.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().includes(unaccentedLC)
        );
        cleanProvName = matchingPart || parts[0];
      }
      
      // Standardize articles: "Balears, Illes" -> "Illes Balears"
      if (cleanProvName.includes(", ")) {
        const [main, article] = cleanProvName.split(", ");
        cleanProvName = `${article} ${main}`;
      }

      // Special case for Illes Balears -> Islas Baleares
      const provLower = cleanProvName.trim().toLowerCase();
      if (provLower === "illes balears" || provLower.includes("balears") || provLower === "baleares") {
          cleanProvName = "Islas Baleares";
      }
      
      const provSlug = slugify(cleanProvName);
  
      if (isProvinciaMatch && !addedProvinces.has(provSlug)) {
      addedProvinces.add(provSlug);
      results.push({
        type: "provincia",
        label: `${cleanProvName} (Provincia)`,
        slug: provSlug,
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
