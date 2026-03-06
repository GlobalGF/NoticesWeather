function requireEnv(value: string | undefined, label: string): string {
  if (!value) {
    throw new Error(`Missing environment variable: ${label}`);
  }
  return value;
}

export function getSupabaseUrl(): string {
  // Keep static reads so Next.js can inline NEXT_PUBLIC_* in client bundles.
  return requireEnv(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL,
    "NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL on server)"
  );
}

export function getSupabaseAnonKey(): string {
  return requireEnv(
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY,
    "NEXT_PUBLIC_SUPABASE_ANON_KEY (or SUPABASE_ANON_KEY on server)"
  );
}

export function hasSupabaseEnv(): boolean {
  return Boolean((process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL) &&
    (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY));
}