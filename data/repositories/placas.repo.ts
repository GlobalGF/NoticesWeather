import { unstable_cache } from "next/cache";
import { cachePolicy } from "@/lib/cache/policy";
import { cacheTags } from "@/lib/cache/tags";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/config";

type MunicipalityRow = {
  slug: string;
  name: string;
  province: string;
  autonomous_community: string;
};

type SolarRow = {
  annual_irradiance_kwh_m2: number;
};

export type PlacasMunicipioData = {
  slug: string;
  name: string;
  province: string;
  autonomousCommunity: string;
  annualIrradianceKwhM2: number;
};

const fallback: PlacasMunicipioData[] = [
  {
    slug: "madrid",
    name: "Madrid",
    province: "Madrid",
    autonomousCommunity: "Comunidad de Madrid",
    annualIrradianceKwhM2: 1650
  },
  {
    slug: "valencia",
    name: "Valencia",
    province: "Valencia",
    autonomousCommunity: "Comunitat Valenciana",
    annualIrradianceKwhM2: 1750
  }
];

export async function getPlacasMunicipioBySlug(slug: string): Promise<PlacasMunicipioData | null> {
  const cached = unstable_cache(
    async () => {
      if (!hasSupabaseEnv()) {
        return fallback.find((m) => m.slug === slug) ?? null;
      }

      const supabase = await createSupabaseServerClient();

      const [{ data: municipalityData, error: municipalityError }, { data: solarData, error: solarError }] =
        await Promise.all([
          supabase
            .from("municipalities")
            .select("slug,name,province,autonomous_community")
            .eq("slug", slug)
            .maybeSingle(),
          supabase
            .from("solar_metrics")
            .select("annual_irradiance_kwh_m2")
            .eq("municipality_slug", slug)
            .maybeSingle()
        ]);

      if (municipalityError || !municipalityData) {
        return null;
      }

      const municipality = municipalityData as MunicipalityRow;
      const solar = (solarData as SolarRow | null) ?? { annual_irradiance_kwh_m2: 1650 };

      if (solarError) {
        return {
          slug: municipality.slug,
          name: municipality.name,
          province: municipality.province,
          autonomousCommunity: municipality.autonomous_community,
          annualIrradianceKwhM2: 1650
        };
      }

      return {
        slug: municipality.slug,
        name: municipality.name,
        province: municipality.province,
        autonomousCommunity: municipality.autonomous_community,
        annualIrradianceKwhM2: solar.annual_irradiance_kwh_m2
      };
    },
    [`placas:${slug}`],
    {
      revalidate: cachePolicy.data.municipalityDetail,
      tags: [cacheTags.placas(slug), cacheTags.municipality(slug)]
    }
  );

  return cached();
}
