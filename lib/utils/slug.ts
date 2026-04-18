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
  // Aggressively remove province suffix if it matches the current province
  // e.g. "salamanca-salamanca" -> "salamanca", "piera-barcelona" -> "piera"
  if (muniSlug.endsWith(`-${provSlug}`)) {
    const base = muniSlug.slice(0, -(provSlug.length + 1));
    if (base.length > 0) return base;
  }
  return muniSlug;
}