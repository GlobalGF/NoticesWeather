import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { notifyGoogleOfUrlBatch } from "@/lib/seo/google-indexing";

export const maxDuration = 300; // Increased for indexing network calls

export async function GET(req: NextRequest) {
    console.log("Starting Drip-Feed SEO Publish Cron Job");

    // Protect the route using CRON_SECRET from env
    // Vercel Cron sends the secret as an Authorization Bearer token header
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        console.error("Unauthorized cron access attempt.");
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const supabase = createSupabaseAdminClient();

        // 1. How many pages to publish today? (You can adjust this later)
        const PAGES_PER_DAY = 500;

        // 2. Find the top 500 pending pages sorted by priority score
        const { data: pendingItems, error: selectError } = await supabase
            .from("publish_queue")
            .select("id, slug, ruta_tipo")
            .eq("status", "pending")
            .order("priority_score", { ascending: false })
            .limit(PAGES_PER_DAY);

        if (selectError) {
            throw selectError;
        }

        if (!pendingItems || pendingItems.length === 0) {
            console.log("No pending items found in queue. Drip feed complete or empty.");
            return NextResponse.json({ message: "Queue is empty. 0 items processed." });
        }

        // 3. Extract the IDs we want to update
        const pendingData = pendingItems as any[];
        const itemIds = pendingData.map((item) => item.id);

        // 4. Update the selected rows status to "published"
        const query: any = supabase.from("publish_queue");
        const { error: updateError } = await query
            .update({
                status: "published",
                published_at: new Date().toISOString(),
                // If you want batching control for GSConsole, you can also inject batch IDs
                sitemap_batch: new Date().toISOString().split("T")[0] // YYYY-MM-DD format
            })
            .in("id", itemIds);

        if (updateError) {
            throw updateError;
        }

        // 5. Notify Google Indexing API (Drip indexing)
        const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://solaryeco.es";
        const urlsToIndex = pendingData.map(item => {
            const cleanSlug = item.slug.startsWith("/") ? item.slug.slice(1) : item.slug;
            return `${SITE_URL}/placas-solares/${cleanSlug}`;
        });

        console.log(`[Drip] Notifying Google of ${urlsToIndex.length} new URLs...`);
        
        // We do this asynchronously but wait for it to finish within the route's duration
        const indexingResults = await notifyGoogleOfUrlBatch(urlsToIndex);
        const indexedCount = indexingResults.filter(r => r.success).length;

        console.log(`Successfully published ${itemIds.length} pages and notified Google for ${indexedCount}/${urlsToIndex.length}.`);
        
        return NextResponse.json({
            success: true,
            message: `Published ${itemIds.length} pages. Indexed ${indexedCount}.`,
            publishedIds: itemIds,
            indexedCount
        });

    } catch (error: any) {
        console.error("Error executing publish cron:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
