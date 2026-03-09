import { hasSupabaseEnv } from "@/lib/supabase/config";

/**
 * Wraps a generateStaticParams implementation with two guards:
 *
 * 1. hasSupabaseEnv() — returns [] immediately if the Supabase environment
 *    variables are not set (e.g. during a Vercel build that doesn't have
 *    secrets). The page will still be server-rendered on-demand via ISR
 *    (dynamicParams = true).
 *
 * 2. try/catch — swallows any unexpected error from Supabase at build time
 *    so a transient network issue never fails the whole build.
 */
export async function safeGenerateStaticParams<T extends Record<string, string>>(
    fn: () => Promise<T[]>
): Promise<T[]> {
    if (!hasSupabaseEnv()) {
        console.warn(
            "[safeGenerateStaticParams] Supabase env vars not set — skipping static pre-render."
        );
        return [];
    }

    try {
        return await fn();
    } catch (err) {
        console.error("[safeGenerateStaticParams] Failed to load static params:", err);
        return [];
    }
}
