import { unstable_cache } from "next/cache";
import type { UrbanRegulation } from "@/data/types";
import { cachePolicy } from "@/lib/cache/policy";
import { cacheTags } from "@/lib/cache/tags";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type RegulationRow = {
  municipality_slug: string;
  rule_slug: string;
  title: string;
  license_required: boolean;
  summary: string;
};

const fallbackRules = ["licencia-obras", "declaracion-responsable"];

export async function getTopUrbanRuleSlugs(limit: number): Promise<string[]> {
  if (!hasSupabaseEnv()) return fallbackRules.slice(0, limit);

  const cached = unstable_cache(
    async () => {
      const supabase = await createSupabaseServerClient();
      const { data, error } = await supabase.from("urban_regulations").select("rule_slug").limit(limit);
      if (error || !data) return fallbackRules.slice(0, limit);

      const unique = new Set((data as Array<{ rule_slug: string }>).map((row) => row.rule_slug));
      return Array.from(unique).slice(0, limit);
    },
    [`urban-rules:top:${limit}`],
    { revalidate: cachePolicy.data.regulation, tags: [cacheTags.urbanRegulations] }
  );

  return cached();
}

export async function getUrbanRegulationByMunicipalityAndRule(
  municipalitySlug: string,
  ruleSlug: string
): Promise<UrbanRegulation | null> {
  if (!hasSupabaseEnv()) {
    return {
      municipalitySlug,
      ruleSlug,
      title: "Normativa local para instalaciones fotovoltaicas",
      licenseRequired: ruleSlug === "licencia-obras",
      summary: "Consulta previa en urbanismo municipal recomendada antes de iniciar la instalacion."
    };
  }

  const cached = unstable_cache(
    async () => {
      const supabase = await createSupabaseServerClient();
      const { data, error } = await supabase
        .from("urban_regulations")
        .select("municipality_slug,rule_slug,title,license_required,summary")
        .eq("municipality_slug", municipalitySlug)
        .eq("rule_slug", ruleSlug)
        .maybeSingle();

      if (error || !data) return null;
      const row = data as RegulationRow;

      return {
        municipalitySlug: row.municipality_slug,
        ruleSlug: row.rule_slug,
        title: row.title,
        licenseRequired: row.license_required,
        summary: row.summary
      };
    },
    [`urban-regulation:${municipalitySlug}:${ruleSlug}`],
    {
      revalidate: cachePolicy.data.regulation,
      tags: [cacheTags.urbanRegulations, cacheTags.urbanRule(municipalitySlug, ruleSlug)]
    }
  );

  return cached();
}
