import { cache } from "react";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function getRequiredEnv(name: "NEXT_PUBLIC_SUPABASE_URL" | "NEXT_PUBLIC_SUPABASE_ANON_KEY"): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name} in .env.local`);
  }
  return value;
}

const supabaseUrl = getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL");
const supabaseAnonKey = getRequiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");

// Reusable singleton for Client Components (browser runtime).
let browserClient: SupabaseClient | undefined;

export function getSupabaseBrowserClient(): SupabaseClient {
  if (!browserClient) {
    browserClient = createClient(supabaseUrl, supabaseAnonKey);
  }
  return browserClient;
}

// Per-request server client for SSR / Server Components.
// cache() avoids recreating the client many times during a single request render.
export const getSupabaseServerClient = cache((): SupabaseClient => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  });
});

// Example query to table "municipios".
export async function getMunicipios(limit = 20) {
  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase
    .from("municipios")
    .select("*")
    .order("municipio", { ascending: true })
    .limit(limit);

  if (error) {
    throw new Error(`Error loading municipios: ${error.message}`);
  }

  return data;
}
