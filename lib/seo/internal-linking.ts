import { getNearbyMunicipiosEnergiaByProvince } from "@/data/repositories/municipios-energia.repo";
import { slugify } from "@/lib/utils/slug";

type InternalLinkContext = {
  municipioSlug: string;
  provincia?: string;
  comunidadAutonoma?: string;
  nearbyLimit?: number;
};

function withGeoPath(path: string, provincia?: string, comunidadAutonoma?: string, municipioSlug?: string): string | null {
  if (!provincia || !comunidadAutonoma || !municipioSlug) return null;
  const comunidadSlug = slugify(comunidadAutonoma);
  const provinciaSlug = slugify(provincia);
  return `${path}/${comunidadSlug}/${provinciaSlug}/${municipioSlug}`;
}

function uniqueUrls(urls: Array<string | null | undefined>): string[] {
  const set = new Set<string>();
  for (const url of urls) {
    if (!url) continue;
    set.add(url);
  }
  return Array.from(set);
}

export async function buildAutomatedInternalLinks(context: InternalLinkContext): Promise<string[]> {
  const nearbyLimit = Math.max(1, Math.min(context.nearbyLimit ?? 5, 10));

  const baseUrls = [
    `/placas-solares/${context.municipioSlug}`,
    `/bonificacion-ibi/${context.municipioSlug}`,
    `/autoconsumo-compartido/${context.municipioSlug}`,
    `/baterias-solares/2-0td/4000-5500`,
    `/solucion-solar/placas-solares-${context.municipioSlug}`,
    withGeoPath("/subvenciones-solares", context.provincia, context.comunidadAutonoma, context.municipioSlug)
      ? `${withGeoPath("/subvenciones-solares", context.provincia, context.comunidadAutonoma, context.municipioSlug)}/nextgen-autoconsumo`
      : null,
    withGeoPath("/normativa-solar", context.provincia, context.comunidadAutonoma, context.municipioSlug)
      ? `${withGeoPath("/normativa-solar", context.provincia, context.comunidadAutonoma, context.municipioSlug)}/licencia-obras`
      : null
  ];

  if (!context.provincia) {
    return uniqueUrls(baseUrls);
  }

  const nearby = await getNearbyMunicipiosEnergiaByProvince(context.provincia, context.municipioSlug, nearbyLimit);
  const nearbyUrls = nearby.flatMap((m) => [
    `/placas-solares/${m.slug}`,
    `/autoconsumo-compartido/${m.slug}`,
    `/bonificacion-ibi/${m.slug}`
  ]);

  return uniqueUrls([...baseUrls, ...nearbyUrls]);
}

export function buildMunicipalityLinks(slug: string) {
  return [`/placas-solares/${slug}`, `/bonificacion-ibi/${slug}`, `/autoconsumo-compartido/${slug}`];
}