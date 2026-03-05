import { unstable_cache } from "next/cache";
import type { SharedSelfConsumptionCoefficient } from "@/data/types";
import { cachePolicy } from "@/lib/cache/policy";
import { cacheTags } from "@/lib/cache/tags";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type CoefficientRow = {
  municipality_slug: string;
  mode_slug: string;
  coefficient: number;
  legal_reference: string | null;
};

const fallbackModes = ["reparto-estatico", "reparto-dinamico"];

export async function getTopCoefficientModes(limit: number): Promise<string[]> {
  if (!hasSupabaseEnv()) return fallbackModes.slice(0, limit);

  const cached = unstable_cache(
    async () => {
      const supabase = await createSupabaseServerClient();
      const { data, error } = await supabase
        .from("shared_self_consumption_coefficients")
        .select("mode_slug")
        .limit(limit);

      if (error || !data) return fallbackModes.slice(0, limit);

      const unique = new Set((data as Array<{ mode_slug: string }>).map((row) => row.mode_slug));
      return Array.from(unique).slice(0, limit);
    },
    [`shared-coefficients:modes:${limit}`],
    { revalidate: cachePolicy.data.sharedCoefficient, tags: [cacheTags.sharedCoefficients] }
  );

  return cached();
}

export async function getSharedCoefficientByMunicipalityAndMode(
  municipalitySlug: string,
  modeSlug: string
): Promise<SharedSelfConsumptionCoefficient | null> {
  if (!hasSupabaseEnv()) {
    return {
      municipalitySlug,
      modeSlug,
      coefficient: modeSlug === "reparto-dinamico" ? 0.65 : 0.5,
      legalReference: "RD 244/2019"
    };
  }

  const cached = unstable_cache(
    async () => {
      const supabase = await createSupabaseServerClient();
      const { data, error } = await supabase
        .from("shared_self_consumption_coefficients")
        .select("municipality_slug,mode_slug,coefficient,legal_reference")
        .eq("municipality_slug", municipalitySlug)
        .eq("mode_slug", modeSlug)
        .maybeSingle();

      if (error || !data) return null;
      const row = data as CoefficientRow;

      return {
        municipalitySlug: row.municipality_slug,
        modeSlug: row.mode_slug,
        coefficient: row.coefficient,
        legalReference: row.legal_reference
      };
    },
    [`shared-coefficient:${municipalitySlug}:${modeSlug}`],
    {
      revalidate: cachePolicy.data.sharedCoefficient,
      tags: [cacheTags.sharedCoefficients, cacheTags.sharedCoefficient(municipalitySlug, modeSlug)]
    }
  );

  return cached();
}
