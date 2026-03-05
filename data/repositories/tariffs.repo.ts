import type { ConsumptionBand, Tariff } from "@/data/types";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type TariffRow = { slug: string; name: string };
type BandRow = { slug: string; min_kwh: number; max_kwh: number };

const fallbackTariffs: Tariff[] = [{ slug: "2-0td", name: "Tarifa 2.0TD" }];
const fallbackBands: ConsumptionBand[] = [{ slug: "4000-5500", minKwh: 4000, maxKwh: 5500 }];

export async function getTopTariffs(limit: number): Promise<Tariff[]> {
  if (!hasSupabaseEnv()) return fallbackTariffs.slice(0, limit);

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("tariffs").select("slug,name").limit(limit);

  if (error || !data) return fallbackTariffs.slice(0, limit);
  return (data as TariffRow[]).map((row) => ({ slug: row.slug, name: row.name }));
}

export async function getTopConsumptionBands(limit: number): Promise<ConsumptionBand[]> {
  if (!hasSupabaseEnv()) return fallbackBands.slice(0, limit);

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("consumption_bands")
    .select("slug,min_kwh,max_kwh")
    .limit(limit);

  if (error || !data) return fallbackBands.slice(0, limit);
  return (data as BandRow[]).map((row) => ({ slug: row.slug, minKwh: row.min_kwh, maxKwh: row.max_kwh }));
}

export async function getTariffBySlug(slug: string): Promise<Tariff | null> {
  if (!hasSupabaseEnv()) return fallbackTariffs.find((t) => t.slug === slug) ?? null;
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("tariffs").select("slug,name").eq("slug", slug).maybeSingle();
  if (error || !data) return null;
  const row = data as TariffRow;
  return { slug: row.slug, name: row.name };
}

export async function getConsumptionBandBySlug(slug: string): Promise<ConsumptionBand | null> {
  if (!hasSupabaseEnv()) return fallbackBands.find((b) => b.slug === slug) ?? null;
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("consumption_bands")
    .select("slug,min_kwh,max_kwh")
    .eq("slug", slug)
    .maybeSingle();
  if (error || !data) return null;
  const row = data as BandRow;
  return { slug: row.slug, minKwh: row.min_kwh, maxKwh: row.max_kwh };
}