import { unstable_cache } from "next/cache";
import type { IbiBonification } from "@/data/types";
import { cachePolicy } from "@/lib/cache/policy";
import { cacheTags } from "@/lib/cache/tags";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type IbiRow = {
  municipality_slug: string;
  percentage: number;
  years: number;
  source_url: string | null;
};

export async function getIbiByMunicipalitySlug(slug: string): Promise<IbiBonification | null> {
  const cached = unstable_cache(
    async () => {
      if (!hasSupabaseEnv()) {
        return {
          municipalitySlug: slug,
          percentage: 30,
          years: 3,
          sourceUrl: null
        };
      }

      const supabase = await createSupabaseServerClient();
      const { data, error } = await supabase
        .from("ibi_bonifications")
        .select("municipality_slug,percentage,years,source_url")
        .eq("municipality_slug", slug)
        .maybeSingle();

      if (error || !data) {
        return null;
      }

      const row = data as IbiRow;

      return {
        municipalitySlug: row.municipality_slug,
        percentage: row.percentage,
        years: row.years,
        sourceUrl: row.source_url
      };
    },
    [`ibi:${slug}`],
    { revalidate: cachePolicy.data.ibi, tags: [cacheTags.ibi(slug)] }
  );

  return cached();
}