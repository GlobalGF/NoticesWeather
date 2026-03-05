import { unstable_cache } from "next/cache";
import type { RadiationProfile } from "@/data/types";
import { getMunicipioEnergiaBySlug } from "@/data/repositories/municipios-energia.repo";
import { cachePolicy } from "@/lib/cache/policy";
import { cacheTags } from "@/lib/cache/tags";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type RadiationRow = {
  municipality_slug: string;
  annual_kwh_m2: number;
  optimal_tilt_deg: number;
  source: string | null;
};

export async function getRadiationByMunicipalitySlug(municipalitySlug: string): Promise<RadiationProfile | null> {
  const cached = unstable_cache(
    async () => {
      if (!hasSupabaseEnv()) {
        const municipio = await getMunicipioEnergiaBySlug(municipalitySlug);
        if (!municipio) return null;

        return {
          municipalitySlug,
          annualKwhM2: municipio.irradiacionSolar,
          optimalTiltDeg: 30,
          source: null
        };
      }

      const supabase = await createSupabaseServerClient();
      const { data, error } = await supabase
        .from("radiation_profiles")
        .select("municipality_slug,annual_kwh_m2,optimal_tilt_deg,source")
        .eq("municipality_slug", municipalitySlug)
        .maybeSingle();

      if (error || !data) return null;
      const row = data as RadiationRow;

      return {
        municipalitySlug: row.municipality_slug,
        annualKwhM2: row.annual_kwh_m2,
        optimalTiltDeg: row.optimal_tilt_deg,
        source: row.source
      };
    },
    [`radiation:${municipalitySlug}`],
    {
      revalidate: cachePolicy.data.radiation,
      tags: [cacheTags.radiation, cacheTags.radiationByMunicipality(municipalitySlug)]
    }
  );

  return cached();
}
