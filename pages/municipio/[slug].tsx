/**
 * LEGACY: pages/municipio/[slug].tsx — Pages Router page
 *
 * NOTE: This is a legacy entry point (Next.js Pages Router).
 * The main pSEO pages live in app/(site)/placas-solares/[municipio]/page.tsx (App Router).
 * This page is kept only so that /municipio/* paths don't 404 for old links.
 *
 * IMPORTANT: Pages Router getStaticProps cannot use next/headers (App Router only).
 * We use createClient() directly here — no cookie-based auth, no unstable_cache.
 */

import type { GetStaticPaths, GetStaticProps, NextPage } from "next";
import { createClient } from "@supabase/supabase-js";
import { isValidSlug } from "../../lib/utils/validate-slug";
import { municipiosTop100 } from "../../lib/municipiosTop100";

/* ── Types ── */
interface MunicipioData {
  slug: string;
  municipio: string;
  provincia: string;
  comunidadAutonoma: string;
  habitantes: number;
  irradiacionSolar: number;
  horasSol: number;
  precioMedioLuz: number;
  ahorroEstimado: number | null;
  bonificacionIbi: number | null;
  subvencionAutoconsumo: number | null;
}

interface PageProps {
  data: MunicipioData;
}

/* ── Standalone Supabase client (no next/headers, no cookies) ── */
function createPagesClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY ?? "";
  return createClient(url, key);
}

/* ── Page component ── */
const MunicipioPage: NextPage<PageProps> = ({ data }) => {
  if (!data?.municipio) {
    return <div>Municipio no encontrado.</div>;
  }

  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "2rem 1rem" }}>
      <h1>Placas solares en {data.municipio}</h1>
      <ul>
        <li>Provincia: {data.provincia}</li>
        <li>Población: {data.habitantes.toLocaleString("es-ES")} habitantes</li>
        <li>Radiación solar: {Math.round(data.irradiacionSolar)} kWh/m²</li>
        <li>Horas de sol: {Math.round(data.horasSol)} h/año</li>
        <li>Precio luz: {data.precioMedioLuz.toFixed(4)} €/kWh</li>
        {data.bonificacionIbi != null && (
          <li>Bonificación IBI: {Math.round(data.bonificacionIbi)}%</li>
        )}
        {data.subvencionAutoconsumo != null && (
          <li>Subvención autoconsumo: {Math.round(data.subvencionAutoconsumo)}%</li>
        )}
        {data.ahorroEstimado != null && (
          <li>Ahorro estimado: {Math.round(data.ahorroEstimado)} €/año</li>
        )}
      </ul>
      <p style={{ marginTop: "1.5rem" }}>
        <a href={`/placas-solares/${data.slug}`} style={{ color: "#1e7f4f", fontWeight: 600 }}>
          Ver página completa de placas solares en {data.municipio} →
        </a>
      </p>
    </main>
  );
};

export default MunicipioPage;

/* ── Static generation ── */
export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: municipiosTop100.map((slug) => ({ params: { slug } })),
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps<PageProps> = async ({ params }) => {
  const slug = params?.slug as string | undefined;
  if (!slug || !isValidSlug(slug)) return { notFound: true };

  try {
    const supabase = createPagesClient();
    const { data, error } = await supabase
      .from("municipios_energia")
      .select(
        "slug, municipio, provincia, comunidad_autonoma, habitantes, irradiacion_solar, horas_sol, precio_medio_luz, ahorro_estimado, bonificacion_ibi, subvencion_autoconsumo"
      )
      .eq("slug", slug)
      .maybeSingle();

    if (error || !data) return { notFound: true };

    const row = data as {
      slug: string;
      municipio: string;
      provincia: string;
      comunidad_autonoma: string;
      habitantes: number;
      irradiacion_solar: number;
      horas_sol: number;
      precio_medio_luz: number;
      ahorro_estimado: number | null;
      bonificacion_ibi: number | null;
      subvencion_autoconsumo: number | null;
    };

    const pageData: MunicipioData = {
      slug: row.slug,
      municipio: row.municipio,
      provincia: row.provincia,
      comunidadAutonoma: row.comunidad_autonoma,
      habitantes: row.habitantes ?? 0,
      irradiacionSolar: row.irradiacion_solar ?? 0,
      horasSol: row.horas_sol ?? 0,
      precioMedioLuz: row.precio_medio_luz ?? 0,
      ahorroEstimado: row.ahorro_estimado,
      bonificacionIbi: row.bonificacion_ibi,
      subvencionAutoconsumo: row.subvencion_autoconsumo,
    };

    return {
      props: { data: pageData },
      revalidate: 86400, // ISR: 24 h
    };
  } catch (err) {
    console.error("[pages/municipio] getStaticProps error:", err);
    return { notFound: true };
  }
};
