/**
 * Dynamic sitemap per CCAA (Comunidad Autónoma).
 *
 * Route: /sitemaps/sitemap-[comunidad].xml
 *
 * Only URLs with status='published' in publish_queue are included.
 * Updates automatically as drip feeding adds more pages.
 *
 * Cache: 6 hours (ISR). No need to rebuild for every single URL published.
 */

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { NextRequest } from "next/server";

export const revalidate = 21600; // 6 hours

const SITE_URL =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";

type Params = {
    params: { comunidad: string };
};

export async function GET(_req: NextRequest, context?: Params): Promise<Response> {
    const comunidad = context?.params?.comunidad;

    if (!comunidad || !/^[a-z0-9-]+$/.test(comunidad)) {
        return new Response("Not found", { status: 404 });
    }

    const supabase = createSupabaseAdminClient();

    type QueueRow = { slug: string; ruta_tipo: string | null; published_at: string | null };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: items, error } = (await supabase
        .from("publish_queue")
        .select("slug, ruta_tipo, published_at")
        .eq("comunidad", comunidad)
        .eq("status", "published")
        .order("priority_score", { ascending: false })
        .limit(30000)) as { data: QueueRow[] | null; error: { message: string } | null };

    if (error) {
        console.error("[sitemap]", comunidad, error.message);
        return new Response("Error generating sitemap", { status: 500 });
    }

    if (!items || items.length === 0) {
        // Return empty but valid sitemap (don't 404 — robots.txt references these)
        return xmlResponse(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`);
    }

    // Each published municipality gets 3 URLs (one per route type)
    const ROUTE_TYPES = ["placas-solares", "precio-luz", "baterias-solares"];

    const urls = items.flatMap((item) => {
        const lastmod = item.published_at
            ? item.published_at.split("T")[0]
            : new Date().toISOString().split("T")[0];

        return ROUTE_TYPES.map((ruta) => {
            const loc = `${SITE_URL}/${ruta}/${item.slug}`;
            return `  <url>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${ruta === "placas-solares" ? "0.8" : "0.7"}</priority>
  </url>`;
        });
    });

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;

    return xmlResponse(xml);
}

function xmlResponse(body: string): Response {
    return new Response(body, {
        status: 200,
        headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, s-maxage=21600, stale-while-revalidate=3600",
        },
    });
}

function escapeXml(str: string): string {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}
