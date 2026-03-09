import { getNearbyMunicipiosEnergiaByProvince } from "@/data/repositories/municipios-energia.repo";
import { slugify } from "@/lib/utils/slug";

type InternalLinkContext = {
  municipioSlug: string;
  provincia?: string;
  comunidadAutonoma?: string;
  tarifa?: string;       // e.g. "2-0td" — used for dynamic battery URL
  consumo?: string;      // e.g. "4000-5500kwh" — used for dynamic battery URL
  nearbyLimit?: number;
};

/**
 * Builds the battery page URL dynamically from the municipality's
 * tariff and consumption band (fetched from Supabase).
 * Falls back to a generic battery guide if data is missing.
 */
function buildBatteryUrl(tarifa?: string, consumo?: string): string {
  if (tarifa && consumo) {
    return `/baterias-solares/${tarifa}/${consumo}`;
  }
  // Safe fallback: general battery guide (always exists)
  return `/baterias-solares`;
}

function withGeoPath(
  path: string,
  provincia?: string,
  comunidadAutonoma?: string,
  municipioSlug?: string
): string | null {
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

  const subvencionesGeoPath = withGeoPath(
    "/subvenciones-solares",
    context.provincia,
    context.comunidadAutonoma,
    context.municipioSlug
  );

  const normativaGeoPath = withGeoPath(
    "/normativa-solar",
    context.provincia,
    context.comunidadAutonoma,
    context.municipioSlug
  );

  const baseUrls = [
    `/placas-solares/${context.municipioSlug}`,
    `/bonificacion-ibi/${context.municipioSlug}`,
    `/autoconsumo-compartido/${context.municipioSlug}`,
    buildBatteryUrl(context.tarifa, context.consumo),
    `/solucion-solar/placas-solares-${context.municipioSlug}`,
    subvencionesGeoPath ? `${subvencionesGeoPath}/nextgen-autoconsumo` : null,
    normativaGeoPath ? `${normativaGeoPath}/licencia-obras` : null
  ];

  if (!context.provincia) {
    return uniqueUrls(baseUrls);
  }

  const nearby = await getNearbyMunicipiosEnergiaByProvince(
    context.provincia,
    context.municipioSlug,
    nearbyLimit
  );

  const nearbyUrls = nearby.flatMap((m) => [
    `/placas-solares/${m.slug}`,
    `/autoconsumo-compartido/${m.slug}`,
    `/bonificacion-ibi/${m.slug}`
  ]);

  return uniqueUrls([...baseUrls, ...nearbyUrls]);
}

export function buildMunicipalityLinks(slug: string) {
  return [
    `/placas-solares/${slug}`,
    `/bonificacion-ibi/${slug}`,
    `/autoconsumo-compartido/${slug}`
  ];
}