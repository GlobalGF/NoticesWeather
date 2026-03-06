import { NextRequest, NextResponse } from "next/server";
import { getTopMunicipiosEnergiaSlugs } from "@/data/repositories/municipios-energia.repo";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type SlugRow = {
  slug: string | null;
};

function toPositiveInt(value: string | null, fallbackValue: number): number {
  if (!value) return fallbackValue;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallbackValue;
  return parsed;
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const limit = Math.min(toPositiveInt(url.searchParams.get("limit"), 20), 200);

  let slugs: string[] = [];

  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("municipios_energia")
      .select("slug")
      .order("habitantes", { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(error.message);
    }

    const rows = (data ?? []) as SlugRow[];
    slugs = rows.map((row) => String(row.slug ?? "")).filter(Boolean);
  } catch {
    // Fallback for environments without service role key.
    const rows = await getTopMunicipiosEnergiaSlugs(limit);
    slugs = rows.map((row) => row.slug).filter(Boolean);
  }

  const urls: string[] = [];
  for (const slug of slugs) {
    urls.push(`/placas-solares/${slug}`);
    urls.push(`/bonificacion-ibi/${slug}`);
    urls.push(`/autoconsumo-compartido/${slug}`);
  }

  return NextResponse.json(
    {
      count: urls.length,
      sourceMunicipios: slugs.length,
      urls
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600"
      }
    }
  );
}
