import { getNearbyMunicipiosEnergiaByProvince } from "@/data/repositories/municipios-energia.repo";
import { slugify } from "@/lib/utils/slug";

type InternalLinkContext = {
  municipioSlug: string;
  municipioName?: string;
  provincia?: string;
  comunidadAutonoma?: string;
  tarifa?: string;       
  consumo?: string;      
  nearbyLimit?: number;
};

export type InternalLink = {
  href: string;
  label: string;
  isNearby?: boolean;
};

function buildBatteryUrl(tarifa?: string, consumo?: string): string {
  if (tarifa && consumo) {
    return `/baterias-solares/${tarifa}/${consumo}`;
  }
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

function uniqueLinks(links: InternalLink[]): InternalLink[] {
  const seen = new Set<string>();
  return links.filter((link) => {
    if (seen.has(link.href)) return false;
    seen.add(link.href);
    return true;
  });
}

export async function buildAutomatedInternalLinks(context: InternalLinkContext): Promise<InternalLink[]> {
  const nearbyLimit = Math.max(1, Math.min(context.nearbyLimit ?? 5, 10));
  const mName = context.municipioName || context.municipioSlug;

  const geoPath = (base: string) => withGeoPath(
    base,
    context.provincia,
    context.comunidadAutonoma,
    context.municipioSlug
  );

  const subPath = geoPath("/subvenciones-solares");
  const radPath = geoPath("/radiacion-solar");

  // Links for the SAME municipality (The Silo Cluster)
  const clusterLinks: InternalLink[] = [
    { href: `/placas-solares/${context.municipioSlug}`, label: `Instalación de placas solares en ${mName}` },
    { href: `/precio-luz/${context.municipioSlug}`, label: `Precio de la luz hoy en ${mName}` },
    { href: `/bonificacion-ibi/${context.municipioSlug}`, label: `Bonificación del IBI en ${mName}` },
    { href: `/autoconsumo-compartido/${context.municipioSlug}`, label: `Autoconsumo compartido en ${mName}` },
  ];

  if (subPath) {
    clusterLinks.push({ href: subPath, label: `Subvenciones para autoconsumo en ${mName}` });
  }
  
  if (radPath) {
    clusterLinks.push({ href: radPath, label: `Radiación solar y producción en ${mName}` });
  }

  // Cross-silo specific links
  const normPath = geoPath("/normativa-solar");
  if (normPath) {
    clusterLinks.push({ href: `${normPath}/autoconsumo-residencial`, label: `Normativa solar en ${mName}` });
  }

  const coefPath = geoPath("/coeficiente-autoconsumo");
  if (coefPath) {
    clusterLinks.push({ href: `${coefPath}/reparto-fijo`, label: `Coeficientes de reparto en ${mName}` });
  }

  clusterLinks.push({ href: `/baterias-solares/${context.municipioSlug}`, label: `Baterías solares en ${mName}` });

  if (!context.provincia) {
    return uniqueLinks(clusterLinks);
  }

  // Nearby municipalities (SEO spread)
  const nearby = await getNearbyMunicipiosEnergiaByProvince(
    context.provincia,
    context.municipioSlug,
    nearbyLimit
  );

  const nearbyLinks = nearby.map((m) => ({
    href: `/placas-solares/${m.slug}`,
    label: `Placas solares en ${m.municipio}`,
    isNearby: true
  }));

  return uniqueLinks([...clusterLinks, ...nearbyLinks]);
}

export function buildMunicipalityLinks(slug: string) {
  return [
    `/placas-solares/${slug}`,
    `/baterias-solares/${slug}`
  ];
}