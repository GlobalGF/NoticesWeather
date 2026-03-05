import { cache } from "react";
import { unstable_cache } from "next/cache";
import { cachePolicy } from "@/lib/cache/policy";
import { cacheTags } from "@/lib/cache/tags";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type PseoSlugIndexEntry = {
  slug: string;
  municipio: string;
  provincia: string;
  tarifaElectrica: string;
  consumo: string;
  tecnologiaSolar: string;
  seoTitle: string | null;
  seoDescription: string | null;
};

type PseoSlugIndexRow = {
  slug: string;
  municipio: string;
  provincia: string;
  tarifa_electrica: string;
  consumo: string;
  tecnologia_solar: string;
  seo_title: string | null;
  seo_description: string | null;
};

const fallbackEntries: PseoSlugIndexEntry[] = [
  {
    slug: "placas-solares-madrid-madrid-2-0td-4000-5500kwh",
    municipio: "Madrid",
    provincia: "Madrid",
    tarifaElectrica: "2-0td",
    consumo: "4000-5500kwh",
    tecnologiaSolar: "placas-solares",
    seoTitle: "Placas solares en Madrid (Madrid) con tarifa 2-0td y consumo 4000-5500kwh",
    seoDescription:
      "Analisis de placas-solares en Madrid: tarifa 2-0td, consumo 4000-5500kwh y recomendaciones personalizadas."
  }
];

function mapRow(row: PseoSlugIndexRow): PseoSlugIndexEntry {
  return {
    slug: row.slug,
    municipio: row.municipio,
    provincia: row.provincia,
    tarifaElectrica: row.tarifa_electrica,
    consumo: row.consumo,
    tecnologiaSolar: row.tecnologia_solar,
    seoTitle: row.seo_title,
    seoDescription: row.seo_description
  };
}

export const getPseoSlugBySlug = cache(async (slug: string): Promise<PseoSlugIndexEntry | null> => {
  const cached = unstable_cache(
    async () => {
      if (!hasSupabaseEnv()) {
        return fallbackEntries.find((entry) => entry.slug === slug) ?? null;
      }

      const supabase = await createSupabaseServerClient();
      const { data, error } = await supabase
        .from("pseo_slug_index")
        .select("slug,municipio,provincia,tarifa_electrica,consumo,tecnologia_solar,seo_title,seo_description")
        .eq("slug", slug)
        .maybeSingle();

      if (error || !data) return null;
      return mapRow(data as PseoSlugIndexRow);
    },
    [`pseo-slug:${slug}`],
    {
      revalidate: cachePolicy.data.pseoSlugIndex,
      tags: [cacheTags.pseoSlugs, cacheTags.pseoSlug(slug)]
    }
  );

  return cached();
});

export const getPseoSlugIndexCount = cache(async (): Promise<number> => {
  const cached = unstable_cache(
    async () => {
      if (!hasSupabaseEnv()) return fallbackEntries.length;

      const supabase = await createSupabaseServerClient();
      const { count, error } = await supabase.from("pseo_slug_index").select("slug", { count: "exact", head: true });

      if (error) return fallbackEntries.length;
      return count ?? 0;
    },
    ["pseo-slugs:count"],
    { revalidate: cachePolicy.data.pseoSlugIndex, tags: [cacheTags.pseoSlugs] }
  );

  return cached();
});

export async function getTopPseoSlugIndexSlugs(limit: number): Promise<string[]> {
  const cached = unstable_cache(
    async () => {
      if (!hasSupabaseEnv()) {
        return fallbackEntries.slice(0, limit).map((entry) => entry.slug);
      }

      const supabase = await createSupabaseServerClient();
      const { data, error } = await supabase.from("pseo_slug_index").select("slug").limit(limit);
      if (error || !data) {
        return fallbackEntries.slice(0, limit).map((entry) => entry.slug);
      }

      return (data as Array<{ slug: string }>).map((row) => row.slug);
    },
    [`pseo-slugs:top:${limit}`],
    { revalidate: cachePolicy.data.pseoSlugIndex, tags: [cacheTags.pseoSlugs] }
  );

  return cached();
}

export async function getPseoSlugIndexSlugsRange(from: number, to: number): Promise<string[]> {
  const safeFrom = Math.max(0, from);
  const safeTo = Math.max(safeFrom, to);

  const cached = unstable_cache(
    async () => {
      if (!hasSupabaseEnv()) {
        return fallbackEntries.slice(safeFrom, safeTo + 1).map((entry) => entry.slug);
      }

      const supabase = await createSupabaseServerClient();
      const { data, error } = await supabase
        .from("pseo_slug_index")
        .select("slug")
        .order("slug", { ascending: true })
        .range(safeFrom, safeTo);

      if (error || !data) {
        return fallbackEntries.slice(safeFrom, safeTo + 1).map((entry) => entry.slug);
      }

      return (data as Array<{ slug: string }>).map((row) => row.slug);
    },
    [`pseo-slugs:range:${safeFrom}:${safeTo}`],
    { revalidate: cachePolicy.data.pseoSlugIndex, tags: [cacheTags.pseoSlugs] }
  );

  return cached();
}
