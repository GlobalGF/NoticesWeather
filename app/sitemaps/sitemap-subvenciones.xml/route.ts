/**
 * Sitemap for subvenciones-solares routes.
 *
 * Generates URLs for:
 *   /subvenciones-solares/[comunidad]          (~18)
 *   /subvenciones-solares/[comunidad]/[provincia]     (~52)
 *   /subvenciones-solares/[comunidad]/[provincia]/[municipio]  (~8132)
 *
 * Total: ~8,200 URLs — well under Google's 50K/file limit.
 */

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { slugify, normalizeCcaaSlug, cleanMunicipalitySlug } from "@/lib/utils/slug";

export const revalidate = 86400; // 24 hours

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export async function GET(): Promise<Response> {
  const supabase = createSupabaseAdminClient();

  // Fetch all municipalities with their CCAA + provincia
  const all: Array<{ slug: string; comunidad_autonoma: string; provincia: string }> = [];
  const BATCH = 1000;
  let offset = 0;

  while (true) {
    const { data } = await supabase
      .from("municipios_energia")
      .select("slug, comunidad_autonoma, provincia")
      .order("id", { ascending: true })
      .range(offset, offset + BATCH - 1);

    if (!data || data.length === 0) break;
    all.push(...data);
    offset += BATCH;
  }

  const today = new Date().toISOString().split("T")[0];

  // Collect distinct comunidades and comunidad+provincia pairs
  const ccaaSet = new Set<string>();
  const provSet = new Set<string>(); // "ccaaSlug/provSlug"

  const urls: string[] = [];

  for (const row of all) {
    const ccaaSlug = normalizeCcaaSlug(row.comunidad_autonoma);
    const provSlug = slugify(row.provincia);
    const muniSlug = cleanMunicipalitySlug(row.slug, provSlug);

    ccaaSet.add(ccaaSlug);
    provSet.add(`${ccaaSlug}/${provSlug}`);

    // Municipality-level URL
    urls.push(
      `<url><loc>${escapeXml(`${SITE_URL}/subvenciones-solares/${ccaaSlug}/${provSlug}/${muniSlug}`)}</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>`
    );
  }

  // CCAA-level URLs
  const ccaaUrls = [...ccaaSet].sort().map(
    (slug) =>
      `<url><loc>${escapeXml(`${SITE_URL}/subvenciones-solares/${slug}`)}</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>`
  );

  // Provincia-level URLs
  const provUrls = [...provSet].sort().map(
    (pair) =>
      `<url><loc>${escapeXml(`${SITE_URL}/subvenciones-solares/${pair}`)}</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>`
  );

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${ccaaUrls.join("\n")}
${provUrls.join("\n")}
${urls.join("\n")}
</urlset>`;

  return new Response(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=3600",
    },
  });
}
