import { unstable_cache } from "next/cache";
import type { InverterEvCompatibility } from "@/data/types";
import { cachePolicy } from "@/lib/cache/policy";
import { cacheTags } from "@/lib/cache/tags";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type CompatibilityRow = {
  inverter_slug: string;
  charger_slug: string;
  tariff_slug: string;
  compatible: boolean;
  notes: string | null;
  efficiency_score: number;
};

export type CompatibilityCombo = {
  inversor: string;
  cargador: string;
  tarifa: string;
};

const fallbackCombos: CompatibilityCombo[] = [
  { inversor: "huawei-sun2000", cargador: "wallbox-pulsar-plus", tarifa: "2-0td" }
];

export async function getTopCompatibilityCombos(limit: number): Promise<CompatibilityCombo[]> {
  if (!hasSupabaseEnv()) return fallbackCombos.slice(0, limit);

  const cached = unstable_cache(
    async () => {
      const supabase = await createSupabaseServerClient();
      const { data, error } = await supabase
        .from("inverter_ev_compatibility")
        .select("inverter_slug,charger_slug,tariff_slug")
        .limit(limit);

      if (error || !data) return fallbackCombos.slice(0, limit);

      return (data as Array<{ inverter_slug: string; charger_slug: string; tariff_slug: string }>).map((row) => ({
        inversor: row.inverter_slug,
        cargador: row.charger_slug,
        tarifa: row.tariff_slug
      }));
    },
    [`inverter-ev:combos:${limit}`],
    { revalidate: cachePolicy.data.compatibility, tags: [cacheTags.inverterEv] }
  );

  return cached();
}

export async function getInverterEvCompatibility(
  inverterSlug: string,
  chargerSlug: string,
  tariffSlug: string
): Promise<InverterEvCompatibility | null> {
  if (!hasSupabaseEnv()) {
    return {
      inverterSlug,
      chargerSlug,
      tariffSlug,
      compatible: true,
      notes: "Compatibilidad validada en entorno residencial estandar.",
      efficiencyScore: 82
    };
  }

  const cached = unstable_cache(
    async () => {
      const supabase = await createSupabaseServerClient();
      const { data, error } = await supabase
        .from("inverter_ev_compatibility")
        .select("inverter_slug,charger_slug,tariff_slug,compatible,notes,efficiency_score")
        .eq("inverter_slug", inverterSlug)
        .eq("charger_slug", chargerSlug)
        .eq("tariff_slug", tariffSlug)
        .maybeSingle();

      if (error || !data) return null;
      const row = data as CompatibilityRow;

      return {
        inverterSlug: row.inverter_slug,
        chargerSlug: row.charger_slug,
        tariffSlug: row.tariff_slug,
        compatible: row.compatible,
        notes: row.notes,
        efficiencyScore: row.efficiency_score
      };
    },
    [`inverter-ev:${inverterSlug}:${chargerSlug}:${tariffSlug}`],
    {
      revalidate: cachePolicy.data.compatibility,
      tags: [cacheTags.inverterEv, cacheTags.inverterEvCombo(inverterSlug, chargerSlug, tariffSlug)]
    }
  );

  return cached();
}
