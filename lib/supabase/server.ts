import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/lib/supabase/types";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/config";
import { createClient } from "@supabase/supabase-js";
import { cachePolicy } from "@/lib/cache/policy";

export async function createSupabaseServerClient() {
  const url = getSupabaseUrl();
  const anonKey = getSupabaseAnonKey();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // For server-rendered public pages, prefer service role when available
  // so reads are not blocked by anon RLS policies.
  if (serviceRoleKey) {
    return createClient<Database>(url, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      global: {
        fetch: (input, init) =>
          fetch(input, {
            ...init,
            next: { revalidate: cachePolicy.data.municipalityDetail },
          }),
      },
    });
  }

  // During build/static generation there is no request context.
  // Fallback to a stateless server client so generateStaticParams can query data.
  try {
    const cookieStore = await cookies();

    return createServerClient<Database>(
      url,
      anonKey,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options as never);
            }
          }
        }
      }
    );
  } catch {
    return createClient<Database>(url, anonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }
}