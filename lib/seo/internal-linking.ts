import { getNearbyMunicipiosEnergiaByProvince } from "@/data/repositories/municipios-energia.repo";
import { slugify, normalizeCcaaSlug, cleanMunicipalitySlug } from "@/lib/utils/slug";

type InternalLinkContext = {
  municipioSlug: string;
  municipioName?: string;
  provincia?: string;
  comunidadAutonoma?: string;
  tarifa?: string;       
  consumo?: string;      
  nearbyLimit?: number;
  currentModule?: "subvenciones" | "placas" | "precio-luz" | "ibi" | "radiacion" | "normativa" | "coeficiente" | "ev";
};

export type InternalLink = {
  href: string;
  label: string;
  isNearby?: boolean;
};

function withGeoPath(
  path: string,
  provincia?: string,
  comunidadAutonoma?: string,
  municipioSlug?: string
): string | null {
  if (!provincia || !comunidadAutonoma || !municipioSlug) return null;
  const comunidadSlug = normalizeCcaaSlug(comunidadAutonoma);
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

  // Links for the SAME municipality (The Silo Cluster)
  // Standardize these to deep paths if possible
  const clusterLinks: InternalLink[] = [
    { 
      href: withGeoPath("/placas-solares", context.provincia, context.comunidadAutonoma, context.municipioSlug) || `/placas-solares/${context.municipioSlug}`, 
      label: `Instalación de placas solares en ${mName}` 
    },
    { 
      href: `/precio-luz/${context.municipioSlug}`, // Precio luz stays shallow for now as per current routing
      label: `Precio de la luz hoy en ${mName}` 
    },
  ];

  if (!context.provincia) {
    return uniqueLinks(clusterLinks);
  }

  // Nearby municipalities (SEO spread)
  const nearby = await getNearbyMunicipiosEnergiaByProvince(
    context.provincia,
    context.municipioSlug,
    nearbyLimit
  );

  const nearbyLinks: InternalLink[] = nearby.map((m) => {
    const provSlug = slugify(m.provincia || "");
    const cleanSlug = cleanMunicipalitySlug(m.slug, provSlug);
    
    let href = `/placas-solares/${m.slug}`;
    let label = `Placas solares en ${m.municipio}`;

    // If on subvenciones, link to subvenciones for neighbors too (SEO optimization)
    if (context.currentModule === "subvenciones" && m.comunidadAutonoma && m.provincia) {
      const gPath = withGeoPath("/subvenciones-solares", m.provincia, m.comunidadAutonoma, cleanSlug);
      if (gPath) {
        href = gPath;
        label = `Ayudas y subvenciones en ${m.municipio}`;
      }
    }

    return {
      href,
      label,
      isNearby: true
    };
  });

  return uniqueLinks([...clusterLinks, ...nearbyLinks]);
}

export function buildMunicipalityLinks(slug: string) {
  return [
    `/placas-solares/${slug}`,
    `/baterias-solares/${slug}`
  ];
}