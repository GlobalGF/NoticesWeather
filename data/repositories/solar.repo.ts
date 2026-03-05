import { unstable_cache } from "next/cache";
import { cachePolicy } from "@/lib/cache/policy";
import { cacheTags } from "@/lib/cache/tags";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type SolarRow = { annual_irradiance_kwh_m2: number };

export async function getSolarMetricByMunicipalitySlug(slug: string): Promise<number> {
  const cached = unstable_cache(
    async () => {
      if (!hasSupabaseEnv()) {
        return 1650;
      }

      const supabase = await createSupabaseServerClient();
      const { data, error } = await supabase
        .from("solar_metrics")
        .select("annual_irradiance_kwh_m2")
        .eq("municipality_slug", slug)
        .maybeSingle();

      if (error || !data) {
        return 1650;
      }

      return (data as SolarRow).annual_irradiance_kwh_m2;
    },
    [`solar:${slug}`],
    { revalidate: cachePolicy.data.batteryAndSolar, tags: [cacheTags.solar(slug)] }
  );

  return cached();
}