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
  { path: "/baterias-solares", changefreq: "weekly", priority: 0.9 },
  { path: "/subvenciones-solares", changefreq: "weekly", priority: 0.9 },
  { path: "/calculadoras", changefreq: "monthly", priority: 0.7 },
  { path: "/calculadoras/placas-solares", changefreq: "weekly", priority: 0.8 },
  { path: "/calculadoras/financiacion", changefreq: "weekly", priority: 0.8 },
  { path: "/calculadoras/baterias", changefreq: "weekly", priority: 0.8 },
  { path: "/calculadoras/excedentes", changefreq: "weekly", priority: 0.8 },
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
  const { municipiosCount } = await getSitemapCounts();

  // 7 URL types per municipality:
  // 1. /placas-solares/[slug]
  // 2. /baterias-solares/[slug]
  // 3. /calculadoras/[slug]
  // 4. /calculadoras/placas-solares/[slug]
  // 5. /calculadoras/financiacion/[slug]
  // 6. /calculadoras/baterias/[slug]
  // 7. /calculadoras/excedentes/[slug]
  const dynamicLocalUrls = municipiosCount * 7;
  const staticUrls = STATIC_PAGES.length;
  const totalUrls = dynamicLocalUrls + staticUrls;

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
    { key: "placas" as const, from: STATIC_PAGES.length, to: STATIC_PAGES.length + totalMunicipioUrlsPerType - 1 },
    { key: "baterias" as const, from: STATIC_PAGES.length + totalMunicipioUrlsPerType, to: STATIC_PAGES.length + totalMunicipioUrlsPerType * 2 - 1 },
    { key: "calc_generic" as const, from: STATIC_PAGES.length + totalMunicipioUrlsPerType * 2, to: STATIC_PAGES.length + totalMunicipioUrlsPerType * 3 - 1 },
    { key: "calc_placas" as const, from: STATIC_PAGES.length + totalMunicipioUrlsPerType * 3, to: STATIC_PAGES.length + totalMunicipioUrlsPerType * 4 - 1 },
    { key: "calc_finan" as const, from: STATIC_PAGES.length + totalMunicipioUrlsPerType * 4, to: STATIC_PAGES.length + totalMunicipioUrlsPerType * 5 - 1 },
    { key: "calc_bat" as const, from: STATIC_PAGES.length + totalMunicipioUrlsPerType * 5, to: STATIC_PAGES.length + totalMunicipioUrlsPerType * 6 - 1 },
    { key: "calc_exced" as const, from: STATIC_PAGES.length + totalMunicipioUrlsPerType * 6, to: STATIC_PAGES.length + totalMunicipioUrlsPerType * 7 - 1 },
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

    const municipalityRangeFrom = overlapFrom - section.from;
    const municipalityRangeTo = overlapTo - section.from;
    const slugs = await getMunicipiosEnergiaSlugsRange(municipalityRangeFrom, municipalityRangeTo);

    for (const slug of slugs) {
      let path = "";
      let priority = 0.7;

      switch (section.key) {
        case "placas":
          path = `/placas-solares/${slug}`;
          priority = 0.8;
          break;
        case "baterias":
          path = `/baterias-solares/${slug}`;
          priority = 0.7;
          break;
        case "calc_generic":
          path = `/calculadoras/${slug}`;
          priority = 0.6;
          break;
        case "calc_placas":
          path = `/calculadoras/placas-solares/${slug}`;
          priority = 0.7;
          break;
        case "calc_finan":
          path = `/calculadoras/financiacion/${slug}`;
          priority = 0.6;
          break;
        case "calc_bat":
          path = `/calculadoras/baterias/${slug}`;
          priority = 0.6;
          break;
        case "calc_exced":
          path = `/calculadoras/excedentes/${slug}`;
          priority = 0.6;
          break;
      }

      urls.push({
        loc: `${baseUrl}${path}`,
        lastmod: resolveLastmod(null),
        changefreq: "weekly",
        priority
      });
    }
  }

  return urls;
}
