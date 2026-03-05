import { unstable_cache } from "next/cache";
import type { Municipality } from "@/data/types";
import { cachePolicy } from "@/lib/cache/policy";
import { cacheTags } from "@/lib/cache/tags";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const fallbackMunicipalities: Municipality[] = [
  {
    slug: "madrid",
    name: "Madrid",
    province: "Madrid",
    autonomousCommunity: "Comunidad de Madrid",
    priorityScore: 100
  },
  {
    slug: "valencia",
    name: "Valencia",
    province: "Valencia",
    autonomousCommunity: "Comunitat Valenciana",
    priorityScore: 90
  },
  {
    slug: "sevilla",
    name: "Sevilla",
    province: "Sevilla",
    autonomousCommunity: "Andalucia",
    priorityScore: 80
  }
];

type MunicipalityRow = {
  slug: string;
  name: string;
  province: string;
  autonomous_community: string;
  priority_score: number;
};

export const getTopMunicipalitiesByPriority = unstable_cache(
  async (limit: number): Promise<Municipality[]> => {
    if (!hasSupabaseEnv()) {
      return fallbackMunicipalities.slice(0, limit);
    }

    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("municipalities")
      .select("slug,name,province,autonomous_community,priority_score")
      .order("priority_score", { ascending: false })
      .limit(limit);

    if (error || !data) {
      return fallbackMunicipalities.slice(0, limit);
    }

    return (data as MunicipalityRow[]).map((row) => ({
      slug: row.slug,
      name: row.name,
      province: row.province,
      autonomousCommunity: row.autonomous_community,
      priorityScore: row.priority_score
    }));
  },
  ["municipalities:top"],
  { revalidate: cachePolicy.data.municipalitiesIndex, tags: [cacheTags.municipalities] }
);

export async function getMunicipalityBySlug(slug: string): Promise<Municipality | null> {
  const cached = unstable_cache(
    async () => {
      if (!hasSupabaseEnv()) {
        return fallbackMunicipalities.find((m) => m.slug === slug) ?? null;
      }

      const supabase = await createSupabaseServerClient();
      const { data, error } = await supabase
        .from("municipalities")
        .select("slug,name,province,autonomous_community,priority_score")
        .eq("slug", slug)
        .maybeSingle();

      if (error || !data) {
        return fallbackMunicipalities.find((m) => m.slug === slug) ?? null;
      }

      const row = data as MunicipalityRow;

      return {
        slug: row.slug,
        name: row.name,
        province: row.province,
        autonomousCommunity: row.autonomous_community,
        priorityScore: row.priority_score
      };
    },
    [`municipality:${slug}`],
    { revalidate: cachePolicy.data.municipalityDetail, tags: [cacheTags.municipality(slug)] }
  );

  return cached();
}