import {
  getMunicipiosEnergiaCount,
  getMunicipiosEnergiaSlugsRange
} from "@/data/repositories/municipios-energia.repo";
import {
  getPseoSlugIndexCount,
  getPseoSlugIndexSlugsRange
} from "@/data/repositories/pseo-slug-index.repo";
import { GUIDE_SLUGS } from "@/lib/seo/sitemap-guides";

export const SITEMAP_CHUNK_SIZE = 5000;

/** Important static / hub pages that should always be in the sitemap. */
const STATIC_PAGES: Array<{ path: string; changefreq: "daily" | "weekly" | "monthly"; priority: number }> = [
  { path: "/", changefreq: "daily", priority: 1.0 },
  { path: "/placas-solares", changefreq: "weekly", priority: 0.9 },
  { path: "/precio-luz", changefreq: "daily", priority: 0.9 },
  { path: "/precio-luz/horas-baratas", changefreq: "daily", priority: 0.8 },
  { path: "/baterias-solares", changefreq: "weekly", priority: 0.9 },
  { path: "/subvenciones-solares", changefreq: "weekly", priority: 0.9 },
  { path: "/bonificacion-ibi", changefreq: "weekly", priority: 0.8 },
  { path: "/calculadoras", changefreq: "monthly", priority: 0.7 },
  { path: "/radiacion-solar", changefreq: "monthly", priority: 0.7 },
  { path: "/autoconsumo-compartido", changefreq: "monthly", priority: 0.7 },
  { path: "/coeficiente-autoconsumo", changefreq: "monthly", priority: 0.7 },
  { path: "/normativa-solar", changefreq: "monthly", priority: 0.7 },
  { path: "/presupuesto-solar", changefreq: "monthly", priority: 0.8 },
  { path: "/sobre-nosotros", changefreq: "monthly", priority: 0.5 },
];

type SitemapUrl = {
  loc: string;
  lastmod?: string;
  changefreq?: "daily" | "weekly" | "monthly";
  priority?: number;
};

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export function toSitemapXml(urls: SitemapUrl[]): string {
  const items = urls
    .map((url) => {
      const lastmod = url.lastmod ? `<lastmod>${escapeXml(url.lastmod)}</lastmod>` : "";
      const changefreq = url.changefreq ? `<changefreq>${url.changefreq}</changefreq>` : "";
      const priority = typeof url.priority === "number" ? `<priority>${url.priority.toFixed(1)}</priority>` : "";
      return `<url><loc>${escapeXml(url.loc)}</loc>${lastmod}${changefreq}${priority}</url>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${items}</urlset>`;
}

export function toSitemapIndexXml(locations: Array<{ loc: string; lastmod?: string }>): string {
  const items = locations
    .map((item) => {
      const lastmod = item.lastmod ? `<lastmod>${escapeXml(item.lastmod)}</lastmod>` : "";
      return `<sitemap><loc>${escapeXml(item.loc)}</loc>${lastmod}</sitemap>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${items}</sitemapindex>`;
}

// ---------------------------------------------------------------------------
// Shared count helper — called once and reused by both functions to avoid
// hitting the DB twice for the same information in a single request.
// ---------------------------------------------------------------------------

type SitemapCounts = { municipiosCount: number; pseoSlugCount: number };

async function getSitemapCounts(): Promise<SitemapCounts> {
  const [municipiosCount, pseoSlugCount] = await Promise.all([
    getMunicipiosEnergiaCount(),
    getPseoSlugIndexCount()
  ]);
  return { municipiosCount, pseoSlugCount };
}

export async function getSitemapPageCount(): Promise<number> {
  const { municipiosCount, pseoSlugCount } = await getSitemapCounts();

  // 2 URL types per municipality (placas-solares, baterias-solares)
  const dynamicLocalUrls = municipiosCount * 2;
  const guideUrls = GUIDE_SLUGS.length;
  const staticUrls = STATIC_PAGES.length;
  const totalUrls = dynamicLocalUrls + guideUrls + pseoSlugCount + staticUrls;

  return Math.max(1, Math.ceil(totalUrls / SITEMAP_CHUNK_SIZE));
}

// ---------------------------------------------------------------------------
// Build the lastmod date string.
// Priority: updatedAt from the data → fall back to current deploy date.
// Using a static deploy-time date avoids constantly signalling "changed" to
// crawlers for content that hasn't actually changed.
// ---------------------------------------------------------------------------

const DEPLOY_DATE = new Date().toISOString().split("T")[0]; // e.g. "2026-03-09"

function resolveLastmod(updatedAt?: string | null): string {
  if (updatedAt) {
    try {
      return new Date(updatedAt).toISOString().split("T")[0];
    } catch {
      // ignore malformed dates
    }
  }
  return DEPLOY_DATE;
}

export async function getSitemapChunkUrls(page: number, baseUrl: string): Promise<SitemapUrl[]> {
  const { municipiosCount, pseoSlugCount } = await getSitemapCounts();
  const totalMunicipioUrlsPerType = municipiosCount;

  const start = page * SITEMAP_CHUNK_SIZE;
  const end = start + SITEMAP_CHUNK_SIZE - 1;

  const sections = [
    { key: "static" as const, from: 0, to: STATIC_PAGES.length - 1 },
    { key: "municipio" as const, from: STATIC_PAGES.length, to: STATIC_PAGES.length + totalMunicipioUrlsPerType - 1 },
    { key: "baterias" as const, from: STATIC_PAGES.length + totalMunicipioUrlsPerType, to: STATIC_PAGES.length + totalMunicipioUrlsPerType * 2 - 1 },
    {
      key: "guia" as const,
      from: STATIC_PAGES.length + totalMunicipioUrlsPerType * 2,
      to: STATIC_PAGES.length + totalMunicipioUrlsPerType * 2 + GUIDE_SLUGS.length - 1
    },
    {
      key: "pseo_slug" as const,
      from: STATIC_PAGES.length + totalMunicipioUrlsPerType * 2 + GUIDE_SLUGS.length,
      to: STATIC_PAGES.length + totalMunicipioUrlsPerType * 2 + GUIDE_SLUGS.length + pseoSlugCount - 1
    }
  ];

  const urls: SitemapUrl[] = [];

  for (const section of sections) {
    const overlapFrom = Math.max(start, section.from);
    const overlapTo = Math.min(end, section.to);

    if (overlapFrom > overlapTo) continue;

    if (section.key === "static") {
      const staticStart = overlapFrom - section.from;
      const staticEnd = overlapTo - section.from;
      for (const page of STATIC_PAGES.slice(staticStart, staticEnd + 1)) {
        urls.push({
          loc: `${baseUrl}${page.path}`,
          lastmod: DEPLOY_DATE,
          changefreq: page.changefreq,
          priority: page.priority
        });
      }
      continue;
    }

    if (section.key === "guia") {
      const guideStart = overlapFrom - section.from;
      const guideEnd = overlapTo - section.from;
      for (const guideSlug of GUIDE_SLUGS.slice(guideStart, guideEnd + 1)) {
        urls.push({
          loc: `${baseUrl}/guias/${guideSlug}`,
          lastmod: DEPLOY_DATE,
          changefreq: "weekly",
          priority: 0.7
        });
      }
      continue;
    }

    if (section.key === "pseo_slug") {
      const pseoRangeFrom = overlapFrom - section.from;
      const pseoRangeTo = overlapTo - section.from;
      const slugs = await getPseoSlugIndexSlugsRange(pseoRangeFrom, pseoRangeTo);

      for (const slug of slugs) {
        urls.push({
          loc: `${baseUrl}/solucion-solar/${slug}`,
          lastmod: DEPLOY_DATE,
          changefreq: "weekly",
          priority: 0.7
        });
      }
      continue;
    }

    const municipalityRangeFrom = overlapFrom - section.from;
    const municipalityRangeTo = overlapTo - section.from;
    const slugs = await getMunicipiosEnergiaSlugsRange(municipalityRangeFrom, municipalityRangeTo);

    for (const slug of slugs) {
      const path =
        section.key === "municipio"
          ? `/placas-solares/${slug}`
          : `/baterias-solares/${slug}`;

      urls.push({
        loc: `${baseUrl}${path}`,
        lastmod: resolveLastmod(null), // uses DEPLOY_DATE; extend slug fetch to include updated_at if needed
        changefreq: "weekly",
        priority: section.key === "municipio" ? 0.8 : 0.7
      });
    }
  }

  return urls;
}
