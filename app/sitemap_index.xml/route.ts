import { NextResponse } from "next/server";
import { cachePolicy } from "@/lib/cache/policy";
import { getSitemapPageCount, toSitemapIndexXml } from "@/lib/seo/sitemap-builder";

export const revalidate = cachePolicy.sitemap.index;

export async function GET() {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";
  const pageCount = await getSitemapPageCount();
  const nowIso = new Date().toISOString();

  const locations = Array.from({ length: pageCount }, (_, page) => ({
    loc: `${base}/sitemaps/${page}.xml`,
    lastmod: nowIso
  }));

  const xml = toSitemapIndexXml(locations);

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": `public, s-maxage=${cachePolicy.sitemap.index}, stale-while-revalidate=${cachePolicy.sitemap.staleWhileRevalidate}`
    }
  });
}
