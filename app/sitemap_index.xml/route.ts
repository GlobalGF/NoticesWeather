import { NextResponse } from "next/server";
import { cachePolicy } from "@/lib/cache/policy";
import { getSitemapPageCount, toSitemapIndexXml } from "@/lib/seo/sitemap-builder";
import { BASE_URL } from "@/lib/seo/seo-config";

export const revalidate = cachePolicy.sitemap.index;

// CCAA slugs — one sitemap per autonomous community
const CCAA_SLUGS = [
  "andalucia", "aragon", "asturias", "baleares", "canarias",
  "cantabria", "castilla-la-mancha", "castilla-y-leon", "cataluna",
  "comunidad-valenciana", "extremadura", "galicia", "la-rioja",
  "madrid", "murcia", "navarra", "pais-vasco"
];

export async function GET() {
  const base = BASE_URL;
  const pageCount = await getSitemapPageCount();
  const nowIso = new Date().toISOString();

  // Existing paginated sitemaps
  const paginatedLocations = Array.from({ length: pageCount }, (_, page) => ({
    loc: `${base}/sitemaps/${page}.xml`,
    lastmod: nowIso
  }));

  // CCAA-based sitemaps (drip feeding)
  const ccaaLocations = CCAA_SLUGS.map((slug) => ({
    loc: `${base}/sitemaps/sitemap-${slug}.xml`,
    lastmod: nowIso
  }));

  // Subvenciones sitemap (CCAA + provincia + municipio hierarchy)
  const subvencionesLocation = {
    loc: `${base}/sitemaps/sitemap-subvenciones.xml`,
    lastmod: nowIso
  };

  const xml = toSitemapIndexXml([...paginatedLocations, ...ccaaLocations, subvencionesLocation]);

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": `public, s-maxage=${cachePolicy.sitemap.index}, stale-while-revalidate=${cachePolicy.sitemap.staleWhileRevalidate}`
    }
  });
}
