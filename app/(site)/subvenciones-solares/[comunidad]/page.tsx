import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { tryParseSlug } from "@/lib/utils/params";
import { isBlockedSlug } from "@/lib/utils/validate-slug";
import { slugify } from "@/lib/utils/slug";
import { safeGenerateStaticParams } from "@/lib/pseo/safe-static-params";
import GeoDirectory from "@/components/ui/GeoDirectory";
import CitySearchInput from "@/components/ui/CitySearchInput";
import { parseSpintax, replaceTokens } from "@/lib/pseo/spintax";
import { SUBVENCIONES_SPINTAX } from "@/data/seo/subsidy-content";
import { buildMetadata } from "@/lib/seo/metadata-builder";

export const revalidate = 86400;
export const dynamicParams = true;
export const dynamic = "force-static";
export const runtime = "nodejs";

type Props = { params: { comunidad: string } };

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
    .limit(100);
  if (error) throw new Error(`Error loading subvenciones_solares_ccaa_es: ${error.message}`);
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
      q: `¿Qué ayudas solares hay en ${ccaaName}?`,
      a: `En ${ccaaName} existen programas de subvención directa para autoconsumo, con importes y condiciones según la convocatoria activa. Además, muchos municipios ofrecen bonificaciones de IBI e ICIO adicionales.`,
    },
    {
      q: "¿Cuánto puedo subvencionar de mi instalación?",
      a: `La referencia actual es ${pctText}. El porcentaje final depende del programa vigente, el perfil del solicitante (particular, empresa o comunidad de vecinos) y los requisitos técnicos de la instalación.`,
    },
    {
      q: "¿Cómo se solicita la subvención?",
      a: "La solicitud se tramita por la sede electrónica autonómica ANTES de iniciar las obras. Tras instalar y legalizar, se presenta la documentación justificativa para el cobro.",
    },
    {
      q: "¿Puedo acumular la subvención autonómica con la deducción de IRPF?",
      a: "Sí, en la mayoría de casos es posible combinar la subvención directa con la deducción estatal en el IRPF por mejoras de eficiencia energética, siempre que no se supere el importe de la inversión real.",
    },
  ];
}

const CCAA_NAME_MAP: Record<string, string> = {
  "andalucia": "Andalucía",
  "aragon": "Aragón",
  "principado-de-asturias": "Asturias",
  "asturias": "Asturias",
  "illes-balears": "Islas Baleares",
  "islas-baleares": "Islas Baleares",
  "canarias": "Canarias",
  "cantabria": "Cantabria",
  "castilla-y-leon": "Castilla y León",
  "castilla-la-mancha": "Castilla-La Mancha",
  "cataluna": "Cataluña",
  "comunitat-valenciana": "Comunidad Valenciana",
  "valencia": "Comunidad Valenciana",
  "extremadura": "Extremadura",
  "galicia": "Galicia",
  "comunidad-madrid": "Comunidad de Madrid",
  "madrid": "Comunidad de Madrid",
  "region-de-murcia": "Región de Murcia",
  "murcia": "Región de Murcia",
  "comunidad-foral-navarra": "Navarra",
  "navarra": "Navarra",
  "pais-vasco": "País Vasco",
  "euskadi": "País Vasco",
  "la-rioja": "La Rioja",
  "ceuta": "Ceuta",
  "ceuta-ceuta": "Ceuta",
  "melilla": "Melilla",
  "melilla-melilla": "Melilla",
};

export async function generateStaticParams() {
  return safeGenerateStaticParams(async () => {
    const rows = await getAllCcaaSubsidies();
    const unique = new Set<string>();
    for (const row of rows) {
      if (!row.comunidad_autonoma) continue;
      unique.add(slugify(row.comunidad_autonoma));
    }
    Object.keys(CCAA_NAME_MAP).forEach((slug) => unique.add(slug));
    return Array.from(unique).map((comunidad) => ({ comunidad }));
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { comunidad } = params;
  const parsed = tryParseSlug(comunidad);
  if (!parsed || isBlockedSlug(parsed)) notFound();
  const normalized = (parsed === "ceuta-ceuta" || parsed === "melilla-melilla") ? parsed.split("-")[0] : parsed;
  const rows = await getCcaaSubsidiesBySlug(normalized);
  const ccaaName = rows.length > 0 ? rows[0].comunidad_autonoma : (CCAA_NAME_MAP[parsed] || parsed.replace(/-/g, " "));
  const percentages = rows.map((r) => r.subvencion_porcentaje).filter((v): v is number => typeof v === "number");
  const maxPct = percentages.length ? Math.max(...percentages) : 40;
  const title = `Ayudas placas solares en ${ccaaName}`;
  const description = rows.length > 0
    ? `Programa vigente en ${ccaaName}: hasta ${maxPct}% de subvención. Guía completa para solicitar correctamente la ayuda fotovoltaica.`
    : `Ayudas y deducciones fiscales para instalar placas solares en ${ccaaName}. Requisitos, procedimiento y bonificaciones IBI e ICIO.`;
  return buildMetadata({
    title,
    description,
    pathname: `/subvenciones-solares/${parsed}`,
  });
}


export default async function SubsidiesCcaaPage({ params }: Props) {
  const { comunidad } = params;
  const parsed = tryParseSlug(comunidad);
  if (!parsed || isBlockedSlug(parsed)) notFound();

  // If the slug is NOT a known CCAA, check if it's a municipality to redirect to the deep route
  const isCcaa = !!CCAA_NAME_MAP[parsed];
  if (!isCcaa) {
    const supabase = await createSupabaseServerClient();
    
    // Check if it's a Province
    const { data: provData } = await supabase
      .from("municipios_energia")
      .select("provincia, comunidad_autonoma")
      .ilike("provincia", parsed.replace(/-/g, " "))
      .limit(1)
      .maybeSingle();

    const prov = provData as any;
    if (prov && prov.comunidad_autonoma && prov.provincia) {
      const cSlug = slugify(prov.comunidad_autonoma);
      const pSlug = slugify(prov.provincia);
      redirect(`/subvenciones-solares/${cSlug}/${pSlug}`);
    }

    // Check if it's a Municipio
    const { data: muni } = await supabase
      .from("municipios_energia")
      .select("slug, provincia, comunidad_autonoma")
      .eq("slug", parsed)
      .maybeSingle();

    if (muni) {
      const m = muni as any;
      const cSlug = slugify(m.comunidad_autonoma);
      const pSlug = slugify(m.provincia);
      redirect(`/subvenciones-solares/${cSlug}/${pSlug}/${m.slug}`);
    }

    // Slug is not a valid CCAA, province, or municipio — 404
    notFound();
  }

  const normalized = (parsed === "ceuta-ceuta" || parsed === "melilla-melilla") ? parsed.split("-")[0] : parsed;
  const rows = await getCcaaSubsidiesBySlug(normalized);
  const ccaaName = rows.length > 0 ? rows[0].comunidad_autonoma : (CCAA_NAME_MAP[parsed] || parsed.replace(/-/g, " "));

  // Fetch two cities for the dynamic search placeholder
  const supabase = await createSupabaseServerClient();
  const { data: topCitiesData } = await supabase
    .from("municipios_energia")
    .select("municipio")
    .ilike("comunidad_autonoma", `%${ccaaName.split(" ")[0]}%`)
    .limit(2);
  const topCities = (topCitiesData || []).map((r: any) => r.municipio).filter(Boolean);
  const placeholderText = topCities.length === 2
    ? `Escribe tu ciudad (ej. ${topCities[0]}, ${topCities[1]}...)`
    : "Escribe tu ciudad (ej. Madrid, Valencia...)";

  const percentages = rows.map((r) => r.subvencion_porcentaje).filter((v): v is number => typeof v === "number");
  const maxPct = percentages.length ? Math.max(...percentages) : 40;
  const maxEurAmount = rows.length > 0
    ? (rows.map(r => r.max_subvencion_euros).filter((v): v is number => typeof v === "number").reduce((a, b) => Math.max(a, b), 0) || null)
    : null;
  const averagePct = percentages.length ? percentages.reduce((acc, n) => acc + n, 0) / percentages.length : null;

  const programs: string[] = rows.length > 0
    ? Array.from(new Set(rows.map((r) => String(r.programa || "Programa no especificado").trim())))
    : ["Deducciones autonómicas por eficiencia energética", "Bonificaciones locales (IBI e ICIO)", "IRPF estatal por mejora energética"];

  const maxAmounts: string[] = rows.length > 0
    ? Array.from(new Set(rows.map((r) => r.max_subvencion_euros).filter((v): v is number => typeof v === "number").map((v) => `${v.toLocaleString("es-ES")} € máximo por expediente`)))
    : ["Importe variable según potencia instalada", "Deducción de hasta el 40% en IRPF", "Bonificación de hasta el 50% en el IBI local"];

  const faqs = buildFaqs(ccaaName, averagePct);

  // ── SEO Paragraph Generation (Spintax + IF data logic) ───────────
  const spintaxVars = {
    CCAA: ccaaName,
    PCT: String(maxPct),
    MAX_EUR: maxEurAmount ? Number(maxEurAmount).toLocaleString("es-ES") : "3.000",
    PROGRAMA: programs[0] || `Ayudas Autoconsumo ${ccaaName}`,
  };

  // Choose template based on real percentage: high (>=50%), medium (<50%), or fiscal (no direct subsidy)
  const introParagraph = rows.length === 0
    ? null
    : maxPct >= 50
      ? replaceTokens(parseSpintax(SUBVENCIONES_SPINTAX.ccaa_intro_alta, comunidad), spintaxVars)
      : maxPct >= 30
        ? replaceTokens(parseSpintax(SUBVENCIONES_SPINTAX.ccaa_intro_media, comunidad), spintaxVars)
        : replaceTokens(parseSpintax(SUBVENCIONES_SPINTAX.ccaa_intro_fiscal, comunidad), spintaxVars);

  const requisitosText = replaceTokens(parseSpintax(SUBVENCIONES_SPINTAX.requisitos, comunidad + "req"), spintaxVars);

  return (
    <main className="bg-white min-h-screen font-sans">

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="bg-slate-900 pt-14 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.04] bg-center" />
        <div className="absolute right-0 top-0 w-[500px] h-[500px] rounded-full bg-emerald-600/10 blur-[100px] pointer-events-none translate-x-1/3 -translate-y-1/2" />

        <div className="relative z-10 mx-auto max-w-5xl px-4">
          <nav className="text-xs text-slate-500 flex items-center gap-2 mb-10" aria-label="Breadcrumb">
            <a href="/" className="hover:text-slate-300 transition-colors">Inicio</a>
            <span className="text-slate-700">›</span>
            <a href="/subvenciones-solares" className="hover:text-slate-300 transition-colors">Subvenciones</a>
            <span className="text-slate-700">›</span>
            <span className="text-slate-400">{ccaaName}</span>
          </nav>

          <div className="max-w-3xl space-y-5">
              <div className="inline-flex items-center gap-2 border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 rounded-md">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-emerald-400 text-xs font-semibold tracking-wide uppercase">Comunidad Autónoma · Datos 2026</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight tracking-tight">
                Subvenciones para{" "}
                <span className="text-emerald-400">placas solares</span>
                <br />en {ccaaName}
              </h1>
              <p className="text-slate-400 text-lg leading-relaxed">
                Programa autonómico vigente, requisitos y procedimiento de solicitud. Selecciona tu municipio para ver también la bonificación de IBI e ICIO de tu ayuntamiento.
              </p>
              {rows.length > 0 && (
                <div className="flex flex-wrap gap-4 pt-2">
                  <div className="border border-slate-700 bg-slate-800/60 rounded-lg px-4 py-2.5">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mb-0.5">Subvención máxima</p>
                    <p className="text-xl font-black text-white">{maxPct}%</p>
                  </div>
                  {maxEurAmount ? (
                    <div className="border border-slate-700 bg-slate-800/60 rounded-lg px-4 py-2.5">
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mb-0.5">Tope por expediente</p>
                      <p className="text-xl font-black text-emerald-400">{maxEurAmount.toLocaleString("es-ES")} €</p>
                    </div>
                  ) : null}
                </div>
              )}
          </div>
        </div>
      </section>

      {/* ── Buscador ──────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-4 pt-10 pb-6">
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 md:p-8 max-w-2xl mx-auto shadow-xl">
          <p className="text-white font-bold text-xl mb-2">Busca tu municipio</p>
          <p className="text-slate-400 text-sm mb-6">Localiza las ayudas locales de tu ayuntamiento en segundos y comprueba cuánto puedes ahorrar.</p>
          <CitySearchInput placeholder={placeholderText} />
        </div>
      </section>

      {/* ── Provincial Directory (Internal Linking) ───── */}
      <section className="mx-auto max-w-5xl px-4 pb-12">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Directorio por provincia en {ccaaName}</h2>
          <p className="text-slate-500 text-sm">Selecciona una provincia para ver el listado de municipios y sus bonificaciones de IBI e ICIO.</p>
        </div>
        <GeoDirectory 
          level="provincias"
          parentSlug={parsed}
          baseRoute={`/subvenciones-solares/${parsed}`}
        />
      </section>

      {/* ── Main Content + Sidebar ─────────────────────────────── */}
      <div className="mx-auto max-w-5xl px-4 pb-16 grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2 space-y-8">

          {/* Programs */}
          <section className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
              <h2 className="text-base font-bold text-slate-900">Programas de ayuda vigentes en {ccaaName}</h2>
            </div>
            <div className="p-6 space-y-5">
              {/* Dynamic intro paragraph — changes based on % (high/medium/fiscal) */}
              {introParagraph ? (
                <div className="space-y-3">
                  {introParagraph.split("\n").filter(Boolean).map((para, i) => (
                    <p key={i} className="text-slate-600 text-sm leading-relaxed">{para.trim()}</p>
                  ))}
                </div>
              ) : (
                <p className="text-slate-600 text-sm leading-relaxed">
                  Las subvenciones en {ccaaName} se articulan a través de fondos gestionados por la administración autonómica,
                  complementados con incentivos fiscales locales. La cuantía final depende del perfil del solicitante y de la potencia instalada.
                </p>
              )}
              <div className="space-y-2">
                {programs.map((program, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-emerald-50 border border-emerald-100">
                    <svg className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                    <p className="text-sm font-medium text-slate-800">{program}</p>
                  </div>
                ))}
              </div>
              {maxAmounts.length > 0 && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <h3 className="text-sm font-bold text-slate-900 mb-3">Cuantías máximas estimadas</h3>
                  <ul className="space-y-1.5">
                    {maxAmounts.slice(0, 3).map((amt, i) => (
                      <li key={i} className="text-sm text-slate-700 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0"></span>
                        {amt}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </section>

          {/* Procedimiento */}
          <section className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
              <h2 className="text-base font-bold text-slate-900">Procedimiento de solicitud</h2>
            </div>
            <div className="p-6">
              {/* Dynamic requisitos paragraph — generated from Spintax */}
              <div className="space-y-2 mb-6">
                {requisitosText.split("\n").filter(Boolean).map((para, i) => (
                  <p key={i} className="text-slate-600 text-sm leading-relaxed">{para.trim()}</p>
                ))}
              </div>
              <ol className="space-y-5">
                {[
                  { t: "Solicitud previa obligatoria", d: "Presentación telemática en sede electrónica autonómica antes del inicio de las obras o de abonar ningún anticipo." },
                  { t: "Documentación técnica", d: "Memoria de diseño, presupuesto desglosado firmado por instalador habilitado y certificados energéticos requeridos." },
                  { t: "Instalación y legalización", d: "Ejecución de la obra fotovoltaica. Registro en Industria o equivalente autonómico para la legalización del autoconsumo." },
                  { t: "Justificación y cobro", d: "Presentación de facturas y justificantes de pago bancario. La administración abona la subvención tras validar la documentación." },
                ].map((step, i) => (
                  <li key={i} className="flex gap-4">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">{i + 1}</span>
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">{step.t}</p>
                      <p className="text-sm text-slate-500 mt-0.5 leading-relaxed">{step.d}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          {/* FAQs */}
          <section className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
              <h2 className="text-base font-bold text-slate-900">Preguntas frecuentes sobre subvenciones en {ccaaName}</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {faqs.map((faq) => (
                <article key={faq.q} className="px-6 py-5">
                  <h3 className="font-semibold text-slate-900 text-sm mb-2">{faq.q}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{faq.a}</p>
                </article>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-5">
          <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-lg sticky top-6 border border-slate-800">
            <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 mb-3">Instaladores verificados</p>
            <h3 className="text-lg font-bold mb-3 leading-snug">¿Quieres que gestionen la subvención por ti?</h3>
            <p className="text-sm text-slate-400 mb-5 leading-relaxed">
              Nuestros partners en {ccaaName} tramitan el expediente completo, desde la solicitud previa hasta el cobro final.
            </p>
            <a
              href="/presupuesto-solar"
              className="block w-full bg-emerald-600 hover:bg-emerald-500 text-white text-center py-3 rounded-xl font-bold transition-colors text-sm"
            >
              Solicitar Presupuesto Gratis →
            </a>
            <div className="mt-5 pt-5 border-t border-slate-800">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-3">Ver también</p>
              <ul className="space-y-2 text-sm">
                <li><a href="/precio-luz" className="text-slate-400 hover:text-white transition-colors">→ Precio de la luz hoy</a></li>
                <li><a href="/placas-solares" className="text-slate-400 hover:text-white transition-colors">→ Precios instalación solar</a></li>
                <li><a href="/calculadoras" className="text-slate-400 hover:text-white transition-colors">→ Calculadora de ahorro</a></li>
                <li><a href="/subvenciones-solares" className="text-slate-400 hover:text-white transition-colors">→ Comparar todas las CCAA</a></li>
              </ul>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
