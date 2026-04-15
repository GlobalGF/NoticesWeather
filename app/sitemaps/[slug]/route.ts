/**
 * Unified Sitemap Route Handler
 *
 * Supports:
 * 1. Paginated sitemaps (/sitemaps/[0-9].xml)
 * 2. Regional sitemaps (/sitemaps/sitemap-[region].xml)
 * 3. Special sitemaps (/sitemaps/sitemap-subvenciones.xml)
 */

import { NextRequest } from "next/server";
import { cachePolicy } from "@/lib/cache/policy";
import { getSitemapChunkUrls, getSitemapPageCount, toSitemapXml } from "@/lib/seo/sitemap-builder";
import { BASE_URL } from "@/lib/seo/seo-config";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { cleanMunicipalitySlug, slugify } from "@/lib/utils/slug";

export const revalidate = cachePolicy.sitemap.chunk;
export const dynamic = "force-dynamic";

type Params = { params: { slug: string } };

export async function GET(_request: NextRequest, context?: Params) {
    let slug = context?.params?.slug;
    if (!slug) return new Response("Not found", { status: 404 });

    // Handle .xml extension
    if (slug.endsWith(".xml")) {
        slug = slug.slice(0, -4);
    }

    // ── CASE 1: Paginated sitemaps (0, 1, 2...) ──────────────────────────
    const pageNum = Number.parseInt(slug, 10);
    if (!isNaN(pageNum) && /^\d+$/.test(slug)) {
        const maxPages = await getSitemapPageCount();
        if (pageNum < 0 || pageNum >= maxPages) {
            return new Response("Sitemap page not found", { status: 404 });
        }

        const urls = await getSitemapChunkUrls(pageNum, BASE_URL);
        return xmlResponse(toSitemapXml(urls));
    }

    // ── CASE 2: Regional sitemaps (sitemap-andalucia, sitemap-madrid...) ──
    if (slug.startsWith("sitemap-") && slug !== "sitemap-subvenciones") {
        const comunidad = slug.replace("sitemap-", "");
        return generateRegionalSitemap(comunidad);
    }

    // ── CASE 3: Special sitemaps (sitemap-subvenciones) ──────────────────
    if (slug === "sitemap-subvenciones") {
        return generateSubvencionesSitemap();
    }

    return new Response("Not found", { status: 404 });
}

async function generateRegionalSitemap(comunidad: string) {
    const supabase = createSupabaseAdminClient();
    
    // We prioritize published entries from the queue for regional drip-feeding
    const { data: items, error } = await supabase
        .from("publish_queue")
        .select("slug, published_at, municipios_energia(provincia)")
        .eq("comunidad", comunidad)
        .eq("status", "published")
        .order("priority_score", { ascending: false })
        .limit(30000);

    if (error) {
        console.error("[generateRegionalSitemap]", comunidad, error.message);
        return new Response("Error generating sitemap", { status: 500 });
    }

    if (!items || items.length === 0) {
        return xmlResponse(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`);
    }

    const ROUTE_CONFIG = [
        { type: "placas-solares", priority: "0.8" },
        { type: "baterias-solares", priority: "0.7" },
        { type: "calculadoras", priority: "0.6" },
        { type: "calculadoras/placas-solares", priority: "0.7" },
        { type: "calculadoras/financiacion", priority: "0.6" },
        { type: "calculadoras/baterias", priority: "0.6" },
        { type: "calculadoras/excedentes", priority: "0.6" },
    ];

    const urls = items.flatMap((item: any) => {
        const lastmod = item.published_at?.split("T")[0] || new Date().toISOString().split("T")[0];
        const provSlug = slugify(item.municipios_energia?.provincia || "");
        const cleanSlug = cleanMunicipalitySlug(item.slug, provSlug);

        return ROUTE_CONFIG.map(config => `
  <url>
    <loc>${BASE_URL}/${config.type}/${cleanSlug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${config.priority}</priority>
  </url>`).join("");
    });

    return xmlResponse(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join("")}</urlset>`);
}

async function generateSubvencionesSitemap() {
    const supabase = createSupabaseAdminClient();
    const { data: items } = await supabase
        .from("publish_queue")
        .select("slug, comunidad, municipios_energia(provincia)")
        .eq("status", "published")
        .limit(20000);

    const urls = (items || []).map((item: any) => {
        const cSlug = item.comunidad;
        const pSlug = slugify(item.municipios_energia?.provincia || "");
        const cleanMuni = cleanMunicipalitySlug(item.slug, pSlug);
        const loc = `${BASE_URL}/subvenciones-solares/${cSlug}/${pSlug}/${cleanMuni}`;
        return `<url><loc>${loc}</loc><changefreq>weekly</changefreq><priority>0.6</priority></url>`;
    });

    return xmlResponse(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join("")}</urlset>`);
}

function xmlResponse(body: string): Response {
    return new Response(body, {
        status: 200,
        headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": `public, s-maxage=${cachePolicy.sitemap.chunk}, stale-while-revalidate=${cachePolicy.sitemap.staleWhileRevalidate}`
        },
    });
}
