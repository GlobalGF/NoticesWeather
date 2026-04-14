import { cache } from "react";
import { unstable_cache } from "next/cache";
import { cachePolicy } from "@/lib/cache/policy";
import { cacheTags } from "@/lib/cache/tags";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { slugify } from "@/lib/utils/slug";

export type MunicipioEnergia = {
  municipio: string;
  provincia: string;
  comunidadAutonoma: string;
  habitantes: number;
  horasSol: number;
  ahorroEstimado: number;
  bonificacionIbi: number | null;
  bonificacionIcio: number | null;
  subvencionAutoconsumo: number | null;
  irradiacionSolar: number;
  precioMedioLuz: number;
  slug: string;
};

export type MunicipioEnergiaGeoPath = {
  comunidad: string;
  provincia: string;
  municipio: string;
};

export type NearbyMunicipioEnergia = {
  slug: string;
  municipio: string;
  provincia: string;
  comunidadAutonoma: string;
};

type MunicipioEnergiaRow = {
  municipio: string;
  provincia: string;
  comunidad_autonoma: string;
  habitantes: number;
  horas_sol: number;
  ahorro_estimado: number;
  bonificacion_ibi: number | null;
  bonificacion_icio: number | null;
  subvencion_autoconsumo: number | null;
  irradiacion_solar: number;
  precio_medio_luz: number;
  slug: string;
};

const fallbackRows: MunicipioEnergia[] = [
  {
    municipio: "Madrid",
    provincia: "Madrid",
    comunidadAutonoma: "Comunidad de Madrid",
    habitantes: 3286662,
    horasSol: 2858,
    ahorroEstimado: 930,
    bonificacionIbi: 50,
    bonificacionIcio: 30,
    subvencionAutoconsumo: 1800,
    irradiacionSolar: 1650,
    precioMedioLuz: 0.22,
    slug: "madrid"
  }
];

function mapRow(row: MunicipioEnergiaRow): MunicipioEnergia {
  return {
    municipio: row.municipio,
    provincia: row.provincia,
    comunidadAutonoma: row.comunidad_autonoma,
    habitantes: row.habitantes,
    horasSol: row.horas_sol,
    ahorroEstimado: row.ahorro_estimado,
    bonificacionIbi: row.bonificacion_ibi,
    bonificacionIcio: row.bonificacion_icio,
    subvencionAutoconsumo: row.subvencion_autoconsumo,
    irradiacionSolar: row.irradiacion_solar,
    precioMedioLuz: row.precio_medio_luz,
    slug: row.slug
  };
}

export const getMunicipioEnergiaBySlug = cache(async (slug: string): Promise<MunicipioEnergia | null> => {
  const cachedQuery = unstable_cache(
    async () => {
      if (!hasSupabaseEnv()) {
        return fallbackRows.find((row) => row.slug === slug) ?? null;
      }

      const supabase = await createSupabaseServerClient();

      const { data, error } = await supabase
        .from("municipios_energia")
        .select(
          "municipio,provincia,comunidad_autonoma,habitantes,horas_sol,ahorro_estimado,bonificacion_ibi,bonificacion_icio,subvencion_autoconsumo,irradiacion_solar,precio_medio_luz,slug"
        )
        .eq("slug", slug)
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("[Supabase] municipios_energia query error", {
          slug,
          code: error.code,
          message: error.message
        });
        return null;
      }

      if (!data) {
        return null;
      }

      return mapRow(data as MunicipioEnergiaRow);
    },
    [`municipios-energia:${slug}`],
    {
      revalidate: cachePolicy.data.municipalityDetail,
      tags: [cacheTags.municipiosEnergiaBySlug(slug), cacheTags.municipiosEnergia]
    }
  );

  try {
    return await cachedQuery();
  } catch (error) {
    console.error("[Supabase] municipios_energia unexpected error", { slug, error });
    return null;
  }
});

export async function getTopMunicipiosEnergiaSlugs(limit: number): Promise<Array<{ slug: string; municipio: string; provincia: string }>> {
  const cachedQuery = unstable_cache(
    async () => {
      if (!hasSupabaseEnv()) {
        return fallbackRows.slice(0, limit).map((row) => ({ slug: row.slug, municipio: row.municipio, provincia: row.provincia }));
      }

      try {
        const supabase = await createSupabaseServerClient();
        const { data, error } = await supabase
          .from("municipios_energia")
          .select("slug, municipio, provincia")
          .order("habitantes", { ascending: false })
          .limit(limit);

        if (error || !data) {
          if (error) {
            console.error("[Supabase] municipios_energia slugs query error", {
              code: error.code,
              message: error.message
            });
          }
          return fallbackRows.slice(0, limit).map((row) => ({ slug: row.slug, municipio: row.municipio, provincia: row.provincia }));
        }

        return (data as Array<{ slug: string; municipio: string; provincia: string }>).map((row) => ({ 
          slug: row.slug,
          municipio: row.municipio,
          provincia: row.provincia
        }));
      } catch (error) {
        console.error("[Supabase] municipios_energia slugs unexpected error", error);
        return fallbackRows.slice(0, limit).map((row) => ({ slug: row.slug, municipio: row.municipio, provincia: row.provincia }));
      }
    },
    [`municipios-energia:top-slugs:${limit}`],
    { revalidate: cachePolicy.data.municipalitiesIndex, tags: [cacheTags.municipiosEnergia] }
  );

  return cachedQuery();
}

export const getMunicipiosEnergiaCount = cache(async (): Promise<number> => {
  const cachedCount = unstable_cache(
    async () => {
      if (!hasSupabaseEnv()) {
        return fallbackRows.length;
      }

      const supabase = await createSupabaseServerClient();
      const { count, error } = await supabase
        .from("municipios_energia")
        .select("slug", { count: "exact", head: true });

      if (error) {
        console.error("[Supabase] municipios_energia count query error", {
          code: error.code,
          message: error.message
        });
        return fallbackRows.length;
      }

      return count ?? 0;
    },
    ["municipios-energia:count"],
    { revalidate: cachePolicy.data.municipalitiesIndex, tags: [cacheTags.municipiosEnergia] }
  );

  return cachedCount();
});

export async function getMunicipiosEnergiaSlugsRange(from: number, to: number): Promise<Array<{ slug: string; provincia: string }>> {
  const safeFrom = Math.max(0, from);
  const safeTo = Math.max(safeFrom, to);

  const cachedQuery = unstable_cache(
    async () => {
      if (!hasSupabaseEnv()) {
        return fallbackRows.slice(safeFrom, safeTo + 1).map((row) => ({ slug: row.slug, provincia: row.provincia }));
      }

      try {
        const supabase = await createSupabaseServerClient();
        const { data, error } = await supabase
          .from("municipios_energia")
          .select("slug, provincia")
          .order("slug", { ascending: true })
          .range(safeFrom, safeTo);

        if (error || !data) {
          if (error) {
            console.error("[Supabase] municipios_energia slug range query error", {
              code: error.code,
              message: error.message,
              from: safeFrom,
              to: safeTo
            });
          }
          return fallbackRows.slice(safeFrom, safeTo + 1).map((row) => ({ slug: row.slug, provincia: row.provincia }));
        }

        return (data as Array<{ slug: string; provincia: string }>).map((row) => ({
          slug: row.slug,
          provincia: row.provincia
        }));
      } catch (error) {
        console.error("[Supabase] municipios_energia slug range unexpected error", {
          from: safeFrom,
          to: safeTo,
          error
        });
        return fallbackRows.slice(safeFrom, safeTo + 1).map((row) => ({ slug: row.slug, provincia: row.provincia }));
      }
    },
    [`municipios-energia:slug-range-v2:${safeFrom}:${safeTo}`],
    { revalidate: cachePolicy.data.municipalitiesIndex, tags: [cacheTags.municipiosEnergia] }
  );

  return cachedQuery();
}

export async function getTopMunicipiosEnergiaGeoPaths(limit: number): Promise<MunicipioEnergiaGeoPath[]> {
  if (!hasSupabaseEnv()) {
    return fallbackRows.slice(0, limit).map((row) => ({
      comunidad: slugify(row.comunidadAutonoma),
      provincia: slugify(row.provincia),
      municipio: row.slug
    }));
  }

  const cachedQuery = unstable_cache(
    async () => {
      try {
        const supabase = await createSupabaseServerClient();
        const { data, error } = await supabase
          .from("municipios_energia")
          .select("slug,provincia,comunidad_autonoma")
          .order("habitantes", { ascending: false })
          .limit(limit);

        if (error || !data) {
          if (error) {
            console.error("[Supabase] municipios_energia geo paths query error", {
              code: error.code,
              message: error.message
            });
          }
          return fallbackRows.slice(0, limit).map((row) => ({
            comunidad: slugify(row.comunidadAutonoma),
            provincia: slugify(row.provincia),
            municipio: row.slug
          }));
        }

        return (data as Array<{ slug: string; provincia: string; comunidad_autonoma: string }>).map((row) => ({
          comunidad: slugify(row.comunidad_autonoma),
          provincia: slugify(row.provincia),
          municipio: row.slug
        }));
      } catch (error) {
        console.error("[Supabase] municipios_energia geo paths unexpected error", error);
        return fallbackRows.slice(0, limit).map((row) => ({
          comunidad: slugify(row.comunidadAutonoma),
          provincia: slugify(row.provincia),
          municipio: row.slug
        }));
      }
    },
    [`municipios-energia:top-geo-paths:${limit}`],
    { revalidate: cachePolicy.data.municipalitiesIndex, tags: [cacheTags.municipiosEnergia] }
  );

  return cachedQuery();
}

export async function getNearbyMunicipiosEnergiaByProvince(
  provincia: string,
  excludeSlug: string,
  limit: number
): Promise<NearbyMunicipioEnergia[]> {
  const safeLimit = Math.max(1, Math.min(limit, 20));

  // Limitamos a un set un poco más grande (p.ej. 25) para tener margen al filtrar 
  // el municipio excluido y cumplir con el safeLimit exacto.
  const cachedProvinceQuery = unstable_cache(
    async () => {
      if (!hasSupabaseEnv()) {
        return fallbackRows
          .filter((row) => slugify(row.provincia) === slugify(provincia))
          .map((row) => ({
            slug: row.slug,
            municipio: row.municipio,
            provincia: row.provincia,
            comunidadAutonoma: row.comunidadAutonoma
          }));
      }

      try {
        const supabase = await createSupabaseServerClient();
        const { data, error } = await supabase
          .from("municipios_energia")
          .select("slug,municipio,provincia,comunidad_autonoma")
          .eq("provincia", provincia)
          .order("habitantes", { ascending: false })
          .limit(30);

        if (error || !data) {
          return [];
        }

        return (data as Array<{ slug: string; municipio: string; provincia: string; comunidad_autonoma: string }>).map(
          (row) => ({
            slug: row.slug,
            municipio: row.municipio,
            provincia: row.provincia,
            comunidadAutonoma: row.comunidad_autonoma
          })
        );
      } catch {
        return [];
      }
    },
    [`municipios-energia:nearby-province:${slugify(provincia)}`],
    { revalidate: cachePolicy.data.municipalitiesIndex, tags: [cacheTags.municipiosEnergia] }
  );

  const provinceRows = await cachedProvinceQuery();
  return provinceRows
    .filter(row => row.slug !== excludeSlug)
    .slice(0, safeLimit);
}
