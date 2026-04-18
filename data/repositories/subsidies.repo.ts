import { unstable_cache } from "next/cache";
import type { SolarSubsidy, SolarSubsidyStatus } from "@/data/types";
import { cachePolicy } from "@/lib/cache/policy";
import { cacheTags } from "@/lib/cache/tags";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type SubsidyRow = {
  municipality_slug: string;
  program_slug: string;
  program_name: string;
  amount_eur: number;
  source_url: string | null;
  status?: string | null;
  fin_plazo?: string | null;
  bdns_id?: string | null;
};

const fallbackPrograms = ["nextgen-autoconsumo", "subvencion-autonomica"];

const fallbackSubsidy: SolarSubsidy = {
  municipalitySlug: "madrid",
  programSlug: "nextgen-autoconsumo",
  programName: "Programa NextGen Autoconsumo",
  amountEur: 1800,
  sourceUrl: null,
  status: "ABIERTA" as SolarSubsidyStatus,
  finPlazo: "2026-12-31"
};

export async function getTopSubsidyProgramSlugs(limit: number): Promise<string[]> {
  if (!hasSupabaseEnv()) return fallbackPrograms.slice(0, limit);

  const cached = unstable_cache(
    async () => {
      const supabase = await createSupabaseServerClient();
      const { data, error } = await supabase
        .from("solar_subsidies")
        .select("program_slug")
        .limit(limit);

      if (error || !data) return fallbackPrograms.slice(0, limit);

      const unique = new Set((data as Array<{ program_slug: string }>).map((row) => row.program_slug));
      return Array.from(unique).slice(0, limit);
    },
    [`subsidies:programs:${limit}`],
    { revalidate: cachePolicy.data.subsidy, tags: [cacheTags.subsidies] }
  );

  return cached();
}

export async function getSubsidyByMunicipalityAndProgram(
  municipalitySlug: string,
  programSlug: string
): Promise<SolarSubsidy | null> {
  if (!hasSupabaseEnv()) {
    return { ...fallbackSubsidy, municipalitySlug, programSlug };
  }

    const cached = unstable_cache(
      async () => {
        const supabase = await createSupabaseServerClient();
        const { data, error } = await supabase
          .from("solar_subsidies")
          .select("municipality_slug,program_slug,program_name,amount_eur,source_url,status,fin_plazo,bdns_id")
          .eq("municipality_slug", municipalitySlug)
          .eq("program_slug", programSlug)
          .maybeSingle();

        if (error || !data) return null;
        const row = data as SubsidyRow;

        return {
          municipalitySlug: row.municipality_slug,
          programSlug: row.program_slug,
          programName: row.program_name,
          amountEur: row.amount_eur,
          sourceUrl: row.source_url,
          status: (row.status as SolarSubsidyStatus) || undefined,
          finPlazo: row.fin_plazo,
          bdnsId: row.bdns_id
        };
      },
      [`subsidies:${municipalitySlug}:${programSlug}`],
      {
        revalidate: cachePolicy.data.subsidy,
        tags: [cacheTags.subsidies, cacheTags.subsidy(municipalitySlug, programSlug)]
      }
    );

    return cached();

}

export async function getActiveSubsidyByMunicipality(
  municipalitySlug: string
): Promise<SolarSubsidy | null> {
  if (!hasSupabaseEnv()) {
    return { ...fallbackSubsidy, municipalitySlug };
  }

  const cached = unstable_cache(
    async () => {
      const supabase = await createSupabaseServerClient();
      const { data, error } = await supabase
        .from("solar_subsidies")
        .select("municipality_slug,program_slug,program_name,amount_eur,source_url,status,fin_plazo,bdns_id")
        .eq("municipality_slug", municipalitySlug)
        .order("status", { ascending: true }) // ABIERTA comes before CERRADA
        .order("amount_eur", { ascending: false }) // higher amount first
        .limit(1)
        .maybeSingle();

      if (error || !data) return { ...fallbackSubsidy, municipalitySlug };
      const row = data as SubsidyRow;

      return {
        municipalitySlug: row.municipality_slug,
        programSlug: row.program_slug,
        programName: row.program_name,
        amountEur: row.amount_eur,
        sourceUrl: row.source_url,
        status: (row.status as SolarSubsidyStatus) || undefined,
        finPlazo: row.fin_plazo,
        bdnsId: row.bdns_id
      };
    },
    [`subsidies:active:${municipalitySlug}`],
    {
      revalidate: cachePolicy.data.subsidy,
      tags: [cacheTags.subsidies]
    }
  );

  return cached();
}
