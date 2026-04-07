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

  const allProvs = await getAllProvinces();
  const mappedProv = allProvs.find(p => p.slug === provinceSlug);
  if (!mappedProv) return null;

  const provinceName: string = mappedProv.name;
  const unaccented = provinceName.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  
  // Extract main part of the name for cases like "A Coruña" -> "Coruña" or "Las Palmas" -> "Palmas"
  const parts = provinceName.split(" ");
  const mainPart = parts.length > 1 ? parts[parts.length - 1] : provinceName;
  const unaccentedMain = mainPart.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // Specific search term optimization for bilingual provinces
  let searchPattern = `provincia.ilike.%${provinceName}%,provincia.ilike.%${unaccented}%,provincia.ilike.%${mainPart}%,provincia.ilike.%${unaccentedMain}%`;
  
  if (provinceName === "Islas Baleares") {
    searchPattern += `,provincia.ilike.%Balears%`;
  } else if (provinceName === "Álava") {
    searchPattern += `,provincia.ilike.%Araba%`;
  } else if (provinceName === "Gipuzkoa") {
    searchPattern += `,provincia.ilike.%Guipuzcoa%`;
  } else if (provinceName === "Bizkaia") {
    searchPattern += `,provincia.ilike.%Vizcaya%`;
  } else if (provinceName === "A Coruña") {
    searchPattern += `,provincia.ilike.%La Coruña%,provincia.ilike.%La Coruna%`;
  } else if (provinceName === "Ourense") {
    searchPattern += `,provincia.ilike.%Orense%`;
  } else if (provinceName === "Lleida") {
    searchPattern += `,provincia.ilike.%Lérida%,provincia.ilike.%Lerida%`;
  } else if (provinceName === "Girona") {
    searchPattern += `,provincia.ilike.%Gerona%`;
  } else if (provinceName === "Alicante") {
    searchPattern += `,provincia.ilike.%Alacant%`;
  } else if (provinceName === "Castellón") {
    searchPattern += `,provincia.ilike.%Castelló%,provincia.ilike.%Castello%`;
  } else if (provinceName === "Valencia") {
    searchPattern += `,provincia.ilike.%València%`;
  }

  const { data, error } = await supabase
    .from("municipios_energia")
    .select("municipio, provincia, slug, horas_sol, irradiacion_solar, ahorro_estimado, bonificacion_ibi, habitantes")
    .or(searchPattern)
    .not("municipio", "is", null)
    .limit(1000);

  if (error || !data || data.length === 0) return null;

  const rows = data as any[];

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

// 52 Spanish provinces static list to avoid hitting PostgREST max-row limits
const SPANISH_PROVINCES = [
  "A Coruña", "Álava", "Albacete", "Alicante", "Almería", "Asturias", "Ávila",
  "Badajoz", "Barcelona", "Bizkaia", "Burgos", "Cáceres", "Cádiz", "Cantabria", "Castellón",
  "Ceuta", "Ciudad Real", "Córdoba", "Cuenca", "Girona", "Granada", "Guadalajara",
  "Gipuzkoa", "Huelva", "Huesca", "Islas Baleares", "Jaén", "La Rioja", "Las Palmas",
  "León", "Lleida", "Lugo", "Madrid", "Málaga", "Melilla", "Murcia", "Navarra",
  "Ourense", "Palencia", "Pontevedra", "Salamanca", "Santa Cruz de Tenerife",
  "Segovia", "Sevilla", "Soria", "Tarragona", "Teruel", "Toledo", "Valencia",
  "Valladolid", "Zamora", "Zaragoza"
];

/**
 * Fetch just the list of all province names + slugs for the mini-selector dropdown.
 */
export async function getAllProvinces(): Promise<{ name: string; slug: string }[]> {
  return SPANISH_PROVINCES.map((name) => ({
    name,
    slug: slugify(name),
  })).sort((a, b) => a.name.localeCompare(b.name, "es"));
}
