import { Metadata } from "next";
import { notFound, redirect, permanentRedirect } from "next/navigation";
import GeoDirectory from "@/components/ui/GeoDirectory";
import CitySearchInput from "@/components/ui/CitySearchInput";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { slugify, cleanMunicipalitySlug, normalizeCcaaSlug as getCanonicalSlug } from "@/lib/utils/slug";
import { buildMetadata } from "@/lib/seo/metadata-builder";
import { parseSpintax, replaceTokens } from "@/lib/pseo/spintax";
import { SUBVENCIONES_SPINTAX } from "@/data/seo/subsidy-content";
import { ProvinceCrossLinks } from "@/components/ui/ProvinceCrossLinks";

export const dynamicParams = true;
export const revalidate = 86400;

type Props = { params: { comunidad: string; provincia: string } };

/**
 * CANONICAL SLUG MAPPING: Standardize all synonyms to these official slugs
 */
const CANONICAL_CCAA_SLUGS: Record<string, string> = {
  "valencia": "comunitat-valenciana",
  "madrid": "comunidad-madrid",
  "murcia": "region-de-murcia",
  "asturias": "principado-de-asturias",
  "islas-baleares": "illes-balears",
  "catalunya": "cataluna",
  "euskadi": "pais-vasco",
  "navarra": "comunidad-foral-navarra",
  "ceuta-ceuta": "ceuta",
  "melilla-melilla": "melilla",
  "castilla-leon": "castilla-y-leon",
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { provincia, comunidad } = params;

    // Canonical Redirect for CCAA synonym
    const canonicalCcaa = CANONICAL_CCAA_SLUGS[comunidad];
    if (canonicalCcaa && canonicalCcaa !== comunidad) {
        permanentRedirect(`/subvenciones-solares/${canonicalCcaa}/${provincia}`);
    }

    const supabase = await createSupabaseServerClient();

    // Self-healing: Check if 'provincia' is actually a 'municipio' to redirect to 3-level route
    const { data: muniData } = await supabase
        .from("municipios_energia")
        .select("slug, provincia, comunidad_autonoma")
        .eq("slug", provincia)
        .limit(1)
        .maybeSingle();

    if (muniData) {
        const m = muniData as any;
        const cSlug = getCanonicalSlug(slugify(m.comunidad_autonoma));
        const pSlug = slugify(m.provincia);
        permanentRedirect(`/subvenciones-solares/${cSlug}/${pSlug}/${m.slug}`);
    }

    const provName = provincia.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
    return buildMetadata({
        title: `Ayudas placas solares en ${provName}`,
        description: `Consulta las subvenciones autonómicas y las bonificaciones de IBI e ICIO disponibles en cada municipio de ${provName}. Datos actualizados ${new Date().getFullYear()}.`,
        pathname: `/subvenciones-solares/${comunidad}/${provincia}`,
    });
}

const CCAA_NAME_MAP: Record<string, string> = {
    "andalucia": "Andalucía", "aragon": "Aragón", "asturias": "Asturias",
    "illes-balears": "Islas Baleares", "canarias": "Canarias", "cantabria": "Cantabria",
    "castilla-y-leon": "Castilla y León", "castilla-leon": "Castilla y León", "castilla-la-mancha": "Castilla-La Mancha",
    "catalunya": "Cataluña", "comunitat-valenciana": "Comunidad Valenciana",
    "extremadura": "Extremadura", "galicia": "Galicia", "madrid": "Comunidad de Madrid",
    "region-de-murcia": "Región de Murcia", "navarra": "Navarra",
    "pais-vasco": "País Vasco", "la-rioja": "La Rioja", "ceuta": "Ceuta", "melilla": "Melilla",
};

export default async function SubvencionesSolaresProvinciaPage({ params }: Props) {
    const { comunidad, provincia } = params;

    // Canonical Redirect for CCAA synonym (Sync with metadata)
    const canonicalCcaa = CANONICAL_CCAA_SLUGS[comunidad];
    if (canonicalCcaa && canonicalCcaa !== comunidad) {
        permanentRedirect(`/subvenciones-solares/${canonicalCcaa}/${provincia}`);
    }

    const supabase = await createSupabaseServerClient();

    // Self-healing Redirect: Check if 'provincia' is actually a 'municipio'
    const { data: routeMuni } = await supabase
        .from("municipios_energia")
        .select("slug, provincia, comunidad_autonoma")
        .eq("slug", provincia)
        .limit(1)
        .maybeSingle();

    if (routeMuni) {
        const m = routeMuni as any;
        const cSlug = getCanonicalSlug(slugify(m.comunidad_autonoma));
        const pSlug = slugify(m.provincia);
        permanentRedirect(`/subvenciones-solares/${cSlug}/${pSlug}/${m.slug}`);
    }

    // ── URL Validation: Ensure province belongs to the CCAA ──
    const searchPattern = provincia.replace(/-/g, " ").replace(/[aeiou]/gi, "_");
    const { data: provValidDataRaw } = await supabase
        .from("municipios_energia")
        .select("comunidad_autonoma, provincia")
        .or(`provincia.ilike.%${searchPattern}%, slug.ilike.%-${provincia}`)
        .limit(1)
        .maybeSingle();

    const provValidData = provValidDataRaw as any;
    if (!provValidData || !provValidData.comunidad_autonoma || !provValidData.provincia) {
        notFound();
    }

    const realCcaaSlug = slugify(provValidData.comunidad_autonoma);

    // Si la CCAA real no coincide con la URL (ej. catalunya/madrid), redirigimos a la correcta (madrid/madrid)
    if (realCcaaSlug !== slugify(comunidad)) {
        redirect(`/subvenciones-solares/${realCcaaSlug}/${slugify(provValidData.provincia)}`);
    }

    const provName = provValidData.provincia;
    const ccaaName = CCAA_NAME_MAP[comunidad] || provValidData.comunidad_autonoma || comunidad.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());

    // Fetch CCAA subsidy data to show in the province page
    const { data: ccaaRows } = await supabase
        .from("subvenciones_solares_ccaa_es")
        .select("comunidad_autonoma, subvencion_porcentaje, max_subvencion_euros, programa, fecha_fin")
        .eq("comunidad_autonoma", ccaaName)
        .limit(1)
        .maybeSingle();

    const pct = (ccaaRows as any)?.subvencion_porcentaje ?? null;
    const maxEur = (ccaaRows as any)?.max_subvencion_euros ?? null;
    const programa = (ccaaRows as any)?.programa ?? null;
    const fechaFin = (ccaaRows as any)?.fecha_fin ?? null;

    // Fetch province-level stats (radiation, sun hours) from municipios
    const searchProvPattern = provName.split(" ")[0].replace(/[aeiou]/gi, "_");
    const { data: statsRows } = await supabase
        .from("municipios_energia")
        .select("municipio, slug, irradiacion_solar, horas_sol, bonificacion_ibi")
        .ilike("provincia", `%${searchProvPattern}%`)
        .limit(1000);

    const statsArr = (statsRows as any[]) ?? [];
    const avgRadiation = statsArr.length > 0
        ? Math.round(statsArr.filter(r => r.irradiacion_solar).reduce((s, r) => s + r.irradiacion_solar, 0) / Math.max(1, statsArr.filter(r => r.irradiacion_solar).length))
        : null;
    const avgSunHours = statsArr.length > 0
        ? Math.round(statsArr.filter(r => r.horas_sol).reduce((s, r) => s + r.horas_sol, 0) / Math.max(1, statsArr.filter(r => r.horas_sol).length))
        : null;
    const municipiosWithIbi = statsArr.filter(r => r.bonificacion_ibi && r.bonificacion_ibi > 0).length;

    const topCitiesForPlaceholder = statsArr.slice(0, 2).map(r => r.municipio).filter(Boolean);
    const placeholderText = topCitiesForPlaceholder.length === 2
        ? `Escribe tu ciudad (ej. ${topCitiesForPlaceholder[0]}, ${topCitiesForPlaceholder[1]}...)`
        : "Escribe tu ciudad (ej. Madrid, Valencia...)";

    // ── Spintax SEO Paragraphs with IF data logic ─────────────────
    const spintaxVars = {
        PROVINCIA: provName,
        CCAA: ccaaName,
        PCT: String(pct ?? 40),
        MAX_EUR: maxEur ? Number(maxEur).toLocaleString("es-ES") : "3.000",
        PROGRAMA: programa ?? `Ayudas Autoconsumo de ${ccaaName}`,
        HORAS_SOL: avgSunHours ? avgSunHours.toLocaleString("es-ES") : "2.800",
        RADIACION: avgRadiation ? avgRadiation.toLocaleString("es-ES") : "1.600",
    };

    // Párrafo de introducción de la provincia
    const provIntroText = replaceTokens(
        parseSpintax(SUBVENCIONES_SPINTAX.provincia_intro, provincia),
        spintaxVars
    );

    // Párrafo solar: si tenemos datos reales de radiación, usamos la plantilla solar; si no, el fallback
    const provSolarText = replaceTokens(
        parseSpintax(
            avgRadiation && avgSunHours
                ? SUBVENCIONES_SPINTAX.provincia_solar
                : SUBVENCIONES_SPINTAX.provincia_solar_fallback,
            provincia + "solar"
        ),
        spintaxVars
    );

    // Párrafo de requisitos
    const requisitosText = replaceTokens(
        parseSpintax(SUBVENCIONES_SPINTAX.requisitos, provincia + "req"),
        spintaxVars
    );

    return (
        <main className="bg-white min-h-screen font-sans">

            {/* ── Hero ──────────────────────────────────────────────── */}
            <section className="bg-slate-900 pt-14 pb-20 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.04] bg-center" />
                <div className="absolute right-0 top-0 w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-[100px] pointer-events-none translate-x-1/3 -translate-y-1/2" />

                <div className="relative z-10 mx-auto max-w-5xl px-4">
                    <nav className="text-xs text-slate-500 flex flex-wrap items-center gap-2 mb-10" aria-label="Breadcrumb">
                        <a href="/" className="hover:text-slate-300 transition-colors">Inicio</a>
                        <span className="text-slate-700">›</span>
                        <a href="/subvenciones-solares" className="hover:text-slate-300 transition-colors">Subvenciones</a>
                        <span className="text-slate-700">›</span>
                        <a href={`/subvenciones-solares/${comunidad}`} className="hover:text-slate-300 transition-colors">{ccaaName}</a>
                        <span className="text-slate-700">›</span>
                        <span className="text-slate-400">{provName}</span>
                    </nav>

                    <div className="max-w-3xl space-y-5">
                        <div className="inline-flex items-center gap-2 border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 rounded-md">
                            <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse"></span>
                            <span className="text-blue-400 text-xs font-semibold tracking-wide uppercase">Provincia · {ccaaName}</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight tracking-tight">
                            Subvenciones solares en <span className="text-blue-400">{provName}</span>
                        </h1>
                        <p className="text-slate-400 text-base leading-relaxed">
                            Ayudas del programa de {ccaaName} disponibles en los municipios de {provName}.
                            Selecciona tu localidad para ver las bonificaciones de IBI e ICIO específicas de tu ayuntamiento.
                        </p>

                        {/* KPI data pills */}
                        <div className="flex flex-wrap gap-3 pt-2">
                            {pct && (
                                <div className="border border-slate-700 bg-slate-800/60 rounded-lg px-4 py-2.5">
                                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mb-0.5">Subvención autonómica</p>
                                    <p className="text-xl font-black text-white">{pct}%</p>
                                </div>
                            )}
                            {maxEur && (
                                <div className="border border-slate-700 bg-slate-800/60 rounded-lg px-4 py-2.5">
                                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mb-0.5">Máximo por expediente</p>
                                    <p className="text-xl font-black text-emerald-400">{Number(maxEur).toLocaleString("es-ES")} €</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Stats strip ────────────────────────────────────────── */}
            {(avgRadiation || municipiosWithIbi > 0) && (
                <div className="mx-auto max-w-5xl px-4 -mt-6 mb-10 relative z-10">
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 grid grid-cols-2 md:grid-cols-4 gap-4 divide-x divide-slate-100">
                        {avgRadiation && (
                            <div className="flex flex-col items-center text-center px-2">
                                <p className="text-[9px] uppercase tracking-widest text-slate-400 font-bold mb-1">Radiación solar media</p>
                                <p className="text-2xl font-black text-slate-800">{avgRadiation.toLocaleString("es-ES")}</p>
                                <p className="text-[11px] text-slate-500 font-medium">kWh/m² año</p>
                            </div>
                        )}
                        {avgSunHours && (
                            <div className="flex flex-col items-center text-center px-2 pl-4 md:pl-6">
                                <p className="text-[9px] uppercase tracking-widest text-slate-400 font-bold mb-1">Horas de sol anuales</p>
                                <p className="text-2xl font-black text-amber-600">~{avgSunHours.toLocaleString("es-ES")}</p>
                                <p className="text-[11px] text-slate-500 font-medium">horas/año</p>
                            </div>
                        )}
                        {municipiosWithIbi > 0 && (
                            <div className="flex flex-col items-center text-center px-2 pl-4 md:pl-6">
                                <p className="text-[9px] uppercase tracking-widest text-slate-400 font-bold mb-1">Municipios con IBI</p>
                                <p className="text-2xl font-black text-emerald-600">{municipiosWithIbi}</p>
                                <p className="text-[11px] text-slate-500 font-medium">bonificación activa</p>
                            </div>
                        )}
                        {pct && (
                            <div className="flex flex-col items-center text-center px-2 pl-4 md:pl-6">
                                <p className="text-[9px] uppercase tracking-widest text-slate-400 font-bold mb-1">Subvención base</p>
                                <p className="text-2xl font-black text-blue-600">{pct}%</p>
                                <p className="text-[11px] text-slate-500 font-medium">programa autonómico</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── Municipality Directory ──────────────────────────────── */}
            <div className="mx-auto max-w-5xl px-4 pb-10 grid gap-8 md:grid-cols-3">
                <div className="md:col-span-2 space-y-8">

                    {/* ── Buscador ──────────────────────────────────── */}
                    <section className="bg-slate-800 border border-slate-700 rounded-2xl p-6 md:p-8 max-w-2xl mx-auto shadow-xl">
                        <p className="text-white font-bold text-xl mb-2">Busca tu localidad</p>
                        <p className="text-slate-400 text-sm mb-6">Localiza las ayudas locales de IBI e ICIO exactas de tu ayuntamiento y comprueba cuánto te descuentan.</p>
                        <CitySearchInput placeholder={placeholderText} />
                    </section>

                    {/* Directory of all municipalities in this province (SEO Internal Linking) */}
                    <section className="space-y-4">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                             <h2 className="text-lg font-bold text-slate-800">Municipios en {provName}</h2>
                             <span className="text-xs text-slate-400 font-medium">{statsArr.length} localidades</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {statsArr.map((m: any) => {
                                const cleanMuniSlug = cleanMunicipalitySlug(m.slug, slugify(provValidData.provincia));
                                return (
                                    <a
                                        key={m.slug}
                                        href={`/subvenciones-solares/${comunidad}/${provincia}/${cleanMuniSlug}`}
                                        className="group block bg-white rounded-xl border border-slate-200 px-3 py-2.5 hover:border-blue-400 hover:shadow-md transition-all duration-200"
                                    >
                                        <span className="text-xs font-medium text-slate-700 group-hover:text-blue-700 transition-colors truncate block">
                                            {m.municipio}
                                        </span>
                                    </a>
                                );
                            })}
                        </div>
                    </section>

                    {/* Info panel about provincial subsidies */}
                    {programa && (
                        <section className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                                <h2 className="text-base font-bold text-slate-900">Programa vigente en {ccaaName}</h2>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="flex items-start gap-3 p-3 rounded-lg bg-emerald-50 border border-emerald-100">
                                    <svg className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                                    <p className="text-sm font-medium text-slate-800">{programa}</p>
                                </div>
                                {fechaFin && (
                                    <p className="text-xs text-slate-500">
                                        Vigencia del programa: hasta el{" "}
                                        <span className="text-slate-700 font-bold">{new Date(fechaFin).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}</span>.
                                        Consulta la sede electrónica de {ccaaName} para confirmar plazos.
                                    </p>
                                )}
                                <div className="grid grid-cols-2 gap-4 mt-2">
                                    {pct && (
                                        <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-center">
                                            <p className="text-[9px] uppercase tracking-widest text-slate-400 font-bold mb-1">Porcentaje base</p>
                                            <p className="text-2xl font-black text-slate-800">{pct}%</p>
                                        </div>
                                    )}
                                    {maxEur && (
                                        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl text-center">
                                            <p className="text-[9px] uppercase tracking-widest text-slate-400 font-bold mb-1">Importe máximo</p>
                                            <p className="text-2xl font-black text-emerald-700">{Number(maxEur).toLocaleString("es-ES")} €</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>
                    )}

                    {/* How to apply info block */}
                    <section className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                            <h2 className="text-base font-bold text-slate-900">¿Cómo solicitar la subvención en {provName}?</h2>
                        </div>
                        <div className="p-6">
                            {/* Intro paragraph — spintax with provincia_intro template */}
                            <div className="space-y-3 mb-5">
                                {provIntroText.split("\n").filter(Boolean).map((para, i) => (
                                    <p key={i} className="text-sm text-slate-600 leading-relaxed">{para.trim()}</p>
                                ))}
                            </div>
                            {/* Solar data paragraph — uses real radiation/sun data if available */}
                            <div className="mb-5 p-4 bg-amber-50 border border-amber-100 rounded-xl space-y-2">
                                {provSolarText.split("\n").filter(Boolean).map((para, i) => (
                                    <p key={i} className="text-sm text-slate-700 leading-relaxed">{para.trim()}</p>
                                ))}
                            </div>
                            {/* Requisitos paragraph — spintax determinístico */}
                            <div className="space-y-2 mb-6">
                                {requisitosText.split("\n").filter(Boolean).map((para, i) => (
                                    <p key={i} className="text-sm text-slate-600 leading-relaxed">{para.trim()}</p>
                                ))}
                            </div>
                            <ol className="space-y-4">
                                {[
                                    { t: "Presentación telemática previa", d: `Solicitar en la sede electrónica de ${ccaaName} antes de iniciar cualquier obra o pago. Sin este paso, la subvención es inválida.` },
                                    { t: "Gestoría y documentación técnica", d: "Tu instalador habilitado elabora la memoria técnica, presupuesto desglosado y los certificados de rendimiento." },
                                    { t: "Instalación y legalización", d: "Ejecución y registro ante el organismo provincial de Industria. Imprescindible para validar la instalación." },
                                    { t: "Justificación y cobro", d: "Se presentan facturas y justificantes bancarios. La administración emite el pago en un plazo variable según la comunidad." },
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
                </div>

                {/* Sidebar */}
                <aside className="space-y-5">
                    <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-lg sticky top-6 border border-slate-800">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 mb-3">Gestión completa</p>
                        <h3 className="text-lg font-bold mb-3 leading-snug">Gestores especializados en {provName}</h3>
                        <p className="text-sm text-slate-400 mb-5 leading-relaxed">
                            Instaladores de nuestra red en {provName} tramitan el expediente completo de la subvención sin coste adicional.
                        </p>
                        <a
                            href="/presupuesto-solar"
                            className="block w-full bg-emerald-600 hover:bg-emerald-500 text-white text-center py-3 rounded-xl font-bold transition-colors text-sm"
                        >
                            Solicitar Presupuesto Gratis →
                        </a>
                        <div className="mt-5 pt-5 border-t border-slate-800">
                            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-3">Navegación</p>
                            <ul className="space-y-2 text-sm">
                                <li>
                                    <a href={`/subvenciones-solares/${comunidad}`} className="text-slate-400 hover:text-white transition-colors">
                                        ← Volver a {ccaaName}
                                    </a>
                                </li>
                                <li><a href="/subvenciones-solares" className="text-slate-400 hover:text-white transition-colors">← Todas las comunidades</a></li>
                                <li><a href="/placas-solares" className="text-slate-400 hover:text-white transition-colors">→ Precios instalación solar</a></li>
                                <li><a href="/calculadoras" className="text-slate-400 hover:text-white transition-colors">→ Calculadora de ahorro</a></li>
                            </ul>
                        </div>
                    </div>
                </aside>
            </div>

            {/* ── Cross-Silo Provincial Interlinks ── */}
            <ProvinceCrossLinks
              provinceName={provName}
              provinceSlug={provincia}
              currentSilo="subvenciones"
              comunidadSlug={comunidad}
            />
        </main>
    );
}
