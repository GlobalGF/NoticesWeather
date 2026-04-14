import { NextRequest, NextResponse } from "next/server";
import { cachePolicy } from "@/lib/cache/policy";
import { getSitemapChunkUrls, getSitemapPageCount, toSitemapXml } from "@/lib/seo/sitemap-builder";
import { BASE_URL } from "@/lib/seo/seo-config";

export const revalidate = cachePolicy.sitemap.chunk;
export const dynamic = "force-dynamic";

type Params = {
  params: {
    page: string;
  };
};

export async function GET(_request: NextRequest, context?: Params) {
  const params = context?.params;
  if (!params?.page) {
    return new NextResponse("Sitemap page not found", { status: 404 });
  }

  const page = Number.parseInt(params.page, 10);
  const maxPages = await getSitemapPageCount();

  if (!Number.isFinite(page) || page < 0 || page >= maxPages) {
    return new NextResponse("Sitemap page not found", { status: 404 });
  }

  const base = BASE_URL;
  const urls = await getSitemapChunkUrls(page, base);
  const xml = toSitemapXml(urls);

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": `public, s-maxage=${cachePolicy.sitemap.chunk}, stale-while-revalidate=${cachePolicy.sitemap.staleWhileRevalidate}`
    }
  });
}
