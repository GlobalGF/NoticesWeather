import { slugify } from "@/lib/utils/slug";

export type SeoSlugInput = {
  municipio: string;
  provincia: string;
  tarifaElectrica: string;
  consumo: string;
  tecnologiaSolar: string;
};

const SPANISH_STOPWORDS = new Set([
  "de",
  "del",
  "la",
  "las",
  "el",
  "los",
  "en",
  "y",
  "para",
  "con"
]);

function cleanToken(value: string): string {
  const normalized = slugify(value);
  const parts = normalized.split("-").filter(Boolean);
  const filtered = parts.filter((part) => !SPANISH_STOPWORDS.has(part));
  return filtered.join("-");
}

function shortHash(input: string): string {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }

  const unsigned = hash >>> 0;
  return unsigned.toString(36).slice(0, 6);
}

function trimSlug(slug: string, maxLength = 120): string {
  if (slug.length <= maxLength) return slug;
  return slug.slice(0, maxLength).replace(/-+$/g, "");
}

export function buildSeoBaseSlug(input: SeoSlugInput): string {
  const tecnologia = cleanToken(input.tecnologiaSolar);
  const municipio = cleanToken(input.municipio);
  const provincia = cleanToken(input.provincia);
  const tarifa = cleanToken(input.tarifaElectrica);
  const consumo = cleanToken(input.consumo);

  const base = [tecnologia, municipio, provincia, tarifa, consumo].filter(Boolean).join("-");
  return trimSlug(base || "solar");
}

export function ensureUniqueSlug(baseSlug: string, seen: Set<string>, rawSeed: string): string {
  if (!seen.has(baseSlug)) {
    seen.add(baseSlug);
    return baseSlug;
  }

  const stable = `${baseSlug}-${shortHash(rawSeed)}`;
  if (!seen.has(stable)) {
    seen.add(stable);
    return trimSlug(stable);
  }

  let i = 2;
  while (i < 10000) {
    const candidate = trimSlug(`${stable}-${i}`);
    if (!seen.has(candidate)) {
      seen.add(candidate);
      return candidate;
    }
    i += 1;
  }

  const fallback = trimSlug(`${baseSlug}-${Date.now().toString(36)}`);
  seen.add(fallback);
  return fallback;
}

export function buildUniqueSeoSlug(input: SeoSlugInput, seen: Set<string>): string {
  const baseSlug = buildSeoBaseSlug(input);
  const rawSeed = [
    input.tecnologiaSolar,
    input.municipio,
    input.provincia,
    input.tarifaElectrica,
    input.consumo
  ].join("|");

  return ensureUniqueSlug(baseSlug, seen, rawSeed);
}
