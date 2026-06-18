export function slugify(input: string): string {
  return input
    .split("/")[0]      // bilingual names: keep first variant only
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * Normalizes CCAA names to a canonical slug regardless of database variation.
 */
export function normalizeCcaaSlug(ccaa: string): string {
  const name = ccaa.toLowerCase();
  
  if (name.includes("castilla") && name.includes("leon")) return "castilla-y-leon";
  if (name.includes("castilla") && name.includes("mancha")) return "castilla-la-mancha";
  if (name.includes("illes balears") || name.includes("islas baleares")) return "illes-balears";
  if (name.includes("valenciana")) return "comunitat-valenciana";
  if (name.includes("madrid")) return "comunidad-madrid";
  if (name.includes("murcia")) return "region-de-murcia";
  if (name.includes("navarra")) return "comunidad-foral-navarra";
  if (name.includes("asturias")) return "principado-de-asturias";
  if (name.includes("catalunya") || name.includes("cataluña") || name.includes("cataluna")) return "cataluna";
  
  return slugify(ccaa);
}

/**
 * Removes redundant province suffixes from municipality slugs.
 * e.g. "salamanca-salamanca" -> "salamanca"
 */
export function cleanMunicipalitySlug(muniSlug: string, provSlug: string): string {
  const PROV_SYNONYMS: Record<string, string[]> = {
    "balears-illes": ["illes-balears", "baleares", "illes-balears-balears-illes"],
    "coruna-a": ["a-coruna", "coruna"],
    "ourense": ["orense"],
    "girona": ["gerona"],
    "bizkaia": ["vizcaya"],
    "gipuzkoa": ["guipuzcoa"],
    "araba-alava": ["alava", "araba"],
    "valencia-valencia": ["valencia"],
    "alicante-alacant": ["alicante", "alacant"],
    "castellon-castello": ["castellon", "castello"]
  };

  const synonyms = PROV_SYNONYMS[provSlug] || [];
  const targets = [provSlug, ...synonyms];

  for (const target of targets) {
    if (muniSlug.endsWith(`-${target}`)) {
      const base = muniSlug.slice(0, -(target.length + 1));
      if (base.length > 0) return base;
    }
    if (muniSlug.startsWith(`${target}-`)) {
      const base = muniSlug.slice(target.length + 1);
      if (base.length > 0) return base;
    }
  }

  return muniSlug;
}

/**
 * Returns all possible slug synonyms for a given CCAA.
 */
export function getComunidadSynonyms(comunidadSlug: string): string[] {
  const norm = normalizeCcaaSlug(comunidadSlug);
  const mapping: Record<string, string[]> = {
    "comunidad-madrid": ["comunidad-madrid", "comunidad-de-madrid", "madrid"],
    "cataluna": ["cataluna", "cataluña", "catalunya"],
    "comunitat-valenciana": ["comunitat-valenciana", "comunidad-valenciana", "valencia"],
    "castilla-y-leon": ["castilla-y-leon", "castilla-leon"],
    "castilla-la-mancha": ["castilla-la-mancha", "castilla-mancha"],
    "illes-balears": ["illes-balears", "illes-balears-balears-illes", "islas-baleares", "baleares"],
    "principado-de-asturias": ["principado-de-asturias", "asturias"],
    "region-de-murcia": ["region-de-murcia", "murcia"],
    "comunidad-foral-navarra": ["comunidad-foral-navarra", "navarra"],
    "pais-vasco": ["pais-vasco", "euskadi"],
  };
  return mapping[norm] || [norm, comunidadSlug];
}