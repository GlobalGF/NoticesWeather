import { NextRequest, NextResponse } from "next/server";
import { cachePolicy } from "@/lib/cache/policy";
import { getSitemapChunkUrls, getSitemapPageCount, toSitemapXml } from "@/lib/seo/sitemap-builder";

export const revalidate = cachePolicy.sitemap.chunk;
export const dynamic = "force-dynamic";

type Params = {
  params: {
    page: string;
  };
};

export async function GET(_request: NextRequest, { params }: Params) {
  if (!params?.page) {
    return new NextResponse("Sitemap page not found", { status: 404 });
  }

  const page = Number.parseInt(params.page, 10);
  const maxPages = await getSitemapPageCount();

  if (!Number.isFinite(page) || page < 0 || page >= maxPages) {
    return new NextResponse("Sitemap page not found", { status: 404 });
  }

  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";
  const urls = await getSitemapChunkUrls(page, base);
  const xml = toSitemapXml(urls);

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": `public, s-maxage=${cachePolicy.sitemap.chunk}, stale-while-revalidate=${cachePolicy.sitemap.staleWhileRevalidate}`
    }
  });
}
