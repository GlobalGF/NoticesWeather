import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { tryParseSlug } from "@/lib/utils/params";
import { slugify } from "@/lib/utils/slug";

export const revalidate = 86400;
export const dynamicParams = true;
export const dynamic = "force-static";
export const runtime = "nodejs";

type Props = {
  params: { comunidad: string };
};

type SubsidyCcaaRow = {
  comunidad_autonoma: string;
  subvencion_porcentaje: number | null;
  max_subvencion_euros: number | null;
  programa: string | null;
};

async function getAllCcaaSubsidies(): Promise<SubsidyCcaaRow[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("subvenciones_solares_ccaa_es")
    .select("comunidad_autonoma, subvencion_porcentaje, max_subvencion_euros, programa")
    .limit(5000);

  if (error) {
    throw new Error(`Error loading subvenciones_solares_ccaa_es: ${error.message}`);
  }

  return (data ?? []) as SubsidyCcaaRow[];
}

async function getCcaaSubsidiesBySlug(comunidadSlug: string): Promise<SubsidyCcaaRow[]> {
  const rows = await getAllCcaaSubsidies();
  return rows.filter((row) => slugify(row.comunidad_autonoma) === comunidadSlug);
}

function buildFaqs(ccaaName: string, avgPct: number | null) {
  const pctText = avgPct != null ? `${avgPct.toFixed(0)}%` : "un porcentaje variable";

  return [
    {
      q: `Que ayudas solares hay en ${ccaaName}?`,
      a: `En ${ccaaName} hay programas de subvencion para autoconsumo, con importes y condiciones segun convocatoria activa.`
    },
    {
      q: "Cuanto puedo subvencionar de mi instalacion?",
      a: `La referencia actual es ${pctText}, aunque el porcentaje final depende del programa, perfil del solicitante y requisitos tecnicos.`
    },
    {
      q: "Como se solicita la subvencion?",
      a: "Normalmente se tramita por sede electronica autonómica, aportando memoria tecnica, presupuesto y documentacion fiscal requerida."
    }
  ];
}

export async function generateStaticParams() {
  const rows = await getAllCcaaSubsidies();
  const unique = new Set<string>();

  for (const row of rows) {
    if (!row.comunidad_autonoma) continue;
    unique.add(slugify(row.comunidad_autonoma));
  }

  return Array.from(unique).map((comunidad) => ({ comunidad }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const parsed = tryParseSlug(params.comunidad);
  if (!parsed) return {};

  const rows = await getCcaaSubsidiesBySlug(parsed);
  if (!rows.length) return {};

  const ccaaName = rows[0].comunidad_autonoma;
  const percentages = rows
    .map((r) => r.subvencion_porcentaje)
    .filter((v): v is number => typeof v === "number");

  const maxPct = percentages.length ? Math.max(...percentages) : null;
  const title = `Subvenciones placas solares en ${ccaaName} | Ayudas y requisitos`;
  const description =
    maxPct != null
      ? `Consulta programas y ayudas solares en ${ccaaName} con porcentajes de hasta ${maxPct.toFixed(
          0
        )}%. Guia para solicitar la subvencion.`
      : `Consulta programas y ayudas solares en ${ccaaName}, requisitos y pasos para tramitar tu subvencion.`;

  return {
    title,
    description,
    alternates: {
      canonical: `/subvenciones-solares/${parsed}`
    },
    openGraph: {
      title,
      description,
      type: "article",
      locale: "es_ES",
      url: `/subvenciones-solares/${parsed}`
    }
  };
}

export default async function SubsidiesCcaaPage({ params }: Props) {
  const parsed = tryParseSlug(params.comunidad);
  if (!parsed) notFound();

  const rows = await getCcaaSubsidiesBySlug(parsed);
  if (!rows.length) notFound();

  const ccaaName = rows[0].comunidad_autonoma;

  const percentages = rows
    .map((r) => r.subvencion_porcentaje)
    .filter((v): v is number => typeof v === "number");
  const averagePct = percentages.length
    ? percentages.reduce((acc, n) => acc + n, 0) / percentages.length
    : null;

  const programs = Array.from(
    new Set(rows.map((r) => String(r.programa || "Programa no especificado").trim()))
  );

  const maxAmounts = Array.from(
    new Set(
      rows
        .map((r) => r.max_subvencion_euros)
        .filter((v): v is number => typeof v === "number")
        .map((v) => `${v.toLocaleString("es-ES")} EUR maximo por expediente`)
    )
  );

  const faqs = buildFaqs(ccaaName, averagePct);

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-10 md:px-6">
      <header>
        <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">Subvenciones solares</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
          Ayudas para placas solares en {ccaaName}
        </h1>
        <p className="mt-3 text-slate-600">
          Guia actualizada sobre programas de subvencion para autoconsumo, porcentajes y requisitos en {ccaaName}.
        </p>
      </header>

      <section className="rounded-xl border border-slate-200 p-5">
        <h2 className="text-2xl font-semibold">Explicacion de ayudas</h2>
        <p className="mt-3 text-slate-700">
          Las ayudas autonómicas para energia solar suelen cubrir parte de la inversion en instalaciones fotovoltaicas,
          baterias y mejoras asociadas a eficiencia. La concesion depende del programa activo, la disponibilidad
          presupuestaria y la documentacion presentada.
        </p>
      </section>

      <section className="rounded-xl border border-slate-200 p-5">
        <h2 className="text-2xl font-semibold">Porcentajes de subvencion</h2>
        <p className="mt-3 text-slate-700">
          Promedio estimado: {averagePct != null ? `${averagePct.toFixed(1)}%` : "No disponible"}.
        </p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-700">
          {programs.map((program) => (
            <li key={program}>{program}</li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border border-slate-200 p-5">
        <h2 className="text-2xl font-semibold">Como solicitarlas</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-slate-700">
          <li>Revisar convocatoria activa en la sede electronica autonómica.</li>
          <li>Preparar memoria tecnica, presupuesto y documentacion del inmueble.</li>
          <li>Presentar solicitud dentro del plazo oficial y conservar justificantes.</li>
          <li>Ejecutar la instalacion conforme a requisitos y aportar facturas finales.</li>
        </ol>
        <div className="mt-4 rounded-lg bg-slate-50 p-4 text-slate-700">
          <p className="font-medium">Requisitos frecuentes</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {maxAmounts.slice(0, 8).map((req) => (
              <li key={req}>{req}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 p-5">
        <h2 className="text-2xl font-semibold">Preguntas frecuentes</h2>
        <div className="mt-4 space-y-4">
          {faqs.map((faq) => (
            <article key={faq.q}>
              <h3 className="text-lg font-semibold text-slate-900">{faq.q}</h3>
              <p className="mt-1 text-slate-700">{faq.a}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
