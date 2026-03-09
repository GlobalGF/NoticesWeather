/**
 * Validates that a slug only contains safe URL characters.
 * Prevents invalid or malicious values from reaching Supabase queries.
 */
const SLUG_REGEX = /^[a-z0-9][a-z0-9\-]{0,98}[a-z0-9]$|^[a-z0-9]$/;

export function isValidSlug(slug: unknown): slug is string {
  return typeof slug === "string" && SLUG_REGEX.test(slug);
}

/**
 * Deterministic variant selector. Maps a slug to a stable 0|1|2 value.
 * Used to pick a unique SEO text variant per municipality without randomness.
 */
export function slugToVariant(slug: string, numVariants = 3): number {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = (hash * 31 + slug.charCodeAt(i)) >>> 0;
  }
  return hash % numVariants;
}
