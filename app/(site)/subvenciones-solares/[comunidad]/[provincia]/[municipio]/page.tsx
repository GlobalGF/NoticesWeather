import { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect, permanentRedirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect";
import Fallback from "@/components/solar/Fallback";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { buildMetadata } from "@/lib/seo/metadata-builder";
import { parseSpintax, replaceTokens } from "@/lib/pseo/spintax";
import { SUBVENCIONES_SPINTAX } from "@/data/seo/subsidy-content";
import { LocalCalculatorCTA } from "@/components/ui/LocalCalculatorCTA";
import { SeoLinkJuicer } from "@/components/ui/SeoLinkJuicer";
import { normalizeCcaaSlug, cleanMunicipalitySlug, slugify } from "@/lib/utils/slug";
import { 
  Gift, 
  ArrowRight, 
  CheckCircle2, 
  Building2, 
  Euro, 
  Zap, 
  Sun,
  ShieldCheck,
  Calculator,
  Info
} from "lucide-react";

export const dynamicParams = true;
export const revalidate = 86400;

type Props = { params: { comunidad: string; provincia: string; municipio: string } };

const CCAA_NAME_MAP: Record<string, string> = {
    "andalucia": "Andalucía", "aragon": "Aragón", "asturias": "Asturias",
    "illes-balears": "Islas Baleares", "canarias": "Canarias", "cantabria": "Cantabria",
    "castilla-y-leon": "Castilla y León", "castilla-la-mancha": "Castilla-La Mancha",
    "catalunya": "Cataluña", "comunitat-valenciana": "Comunidad Valenciana",
    "extremadura": "Extremadura", "galicia": "Galicia", "madrid": "Comunidad de Madrid",
    "region-de-murcia": "Región de Murcia", "navarra": "Navarra",
    "pais-vasco": "País Vasco", "la-rioja": "La Rioja", "ceuta": "Ceuta", "melilla": "Melilla",
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { municipio, provincia, comunidad } = params;
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase
        .from("municipios_energia")
        .select("municipio, provincia, comunidad_autonoma, slug")
        .eq("slug", municipio)
        .limit(1)
        .maybeSingle();

    const muniRow = data as any;
    const muniName = muniRow?.municipio || municipio.replace(/-/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase());
    const provName = muniRow?.provincia || provincia.replace(/-/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase());
    const year = new Date().getFullYear();

    // Force clean canonical slugs
    const dbCcaaSlug = muniRow ? normalizeCcaaSlug(muniRow.comunidad_autonoma) : comunidad;
    const dbProvSlug = muniRow ? slugify(muniRow.provincia) : provincia;
    const dbMuniSlug = muniRow ? cleanMunicipalitySlug(muniRow.slug, dbProvSlug) : municipio;

    // Canonical Redirect
    if (comunidad !== dbCcaaSlug || provincia !== dbProvSlug || municipio !== dbMuniSlug) {
        permanentRedirect(`/subvenciones-solares/${dbCcaaSlug}/${dbProvSlug}/${dbMuniSlug}`);
    }

    return buildMetadata({
        title: `Subvenciones Placas Solares en ${muniName} ${year} · Ayudas e IBI`,
        description: `Consulta las subvenciones del ${CCAA_NAME_MAP[dbCcaaSlug] ?? comunidad}, la bonificación de IBI y la deducción de IRPF disponibles para instalar placas solares en ${muniName}.`,
        pathname: `/subvenciones-solares/${dbCcaaSlug}/${dbProvSlug}/${dbMuniSlug}`,
    });
}

export default async function SubvencionesSolaresMunicipioPage({ params }: Props) {
    const { comunidad, provincia, municipio } = params;
    try {
        const supabase = await createSupabaseServerClient();
    
    const { data: muniRaw, error: muniError } = await supabase
        .from("municipios_energia")
        .select("municipio, provincia, comunidad_autonoma, slug, habitantes, horas_sol, irradiacion_solar, bonificacion_ibi, bonificacion_icio, ahorro_estimado")
        .or(`slug.eq.${municipio},slug.eq.${municipio}-${provincia}`)
        .limit(1)
        .maybeSingle();

    if (muniError || !muniRaw) notFound();

    const muniRow = muniRaw as any;
    const dbCcaaSlug = normalizeCcaaSlug(muniRow.comunidad_autonoma);
    const dbProvSlug = slugify(muniRow.provincia);
    const dbMuniSlug = cleanMunicipalitySlug(muniRow.slug, dbProvSlug);

    // Redirect to canonical URL if mismatch
    if (comunidad !== dbCcaaSlug || municipio !== dbMuniSlug) {
        permanentRedirect(`/subvenciones-solares/${dbCcaaSlug}/${dbProvSlug}/${dbMuniSlug}`);
    }

    const muniName: string = muniRow?.municipio ?? municipio.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
    const provName: string = muniRow?.provincia ?? provincia.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
    const ccaaName: string = muniRow.comunidad_autonoma;

    const { data: ccaaRaw } = await supabase
        .from("subvenciones_solares_ccaa_es")
        .select("subvencion_porcentaje, max_subvencion_euros, programa, fecha_fin")
        .eq("comunidad_autonoma", ccaaName)
        .limit(1)
        .maybeSingle();

    const ccaaRow = ccaaRaw as any;
    const pct: number = ccaaRow?.subvencion_porcentaje ?? 40;
    const maxEur: number = ccaaRow?.max_subvencion_euros ?? 3000;
    const programa: string = ccaaRow?.programa ?? `Ayudas Autoconsumo de ${ccaaName}`;
    const fechaFin: string | null = ccaaRow?.fecha_fin ?? null;
    const bonifIbi: number = muniRow?.bonificacion_ibi ?? 0;
    const bonifIcio: number = muniRow?.bonificacion_icio ?? 0;
    const horasSol: number = muniRow?.horas_sol ?? 2800;
    const radiacion: number = muniRow?.irradiacion_solar ?? 1600;
    const ahorroEstimado: number | null = muniRow?.ahorro_estimado ?? null;
    const hasSolarData = muniRow?.horas_sol && muniRow?.irradiacion_solar;

    const vars = {
        MUNICIPIO: muniName,
        PROVINCIA: provName,
        CCAA: ccaaName,
        PROGRAMA: programa,
        PCT: String(pct),
        MAX_EUR: Number(maxEur).toLocaleString("es-ES"),
        HORAS_SOL: hasSolarData ? Number(horasSol).toLocaleString("es-ES") : "2.800",
        RADIACION: hasSolarData ? Number(radiacion).toLocaleString("es-ES") : "1.600",
        BONIF_IBI: String(bonifIbi),
    };

    const introText = replaceTokens(parseSpintax(SUBVENCIONES_SPINTAX.municipio_intro, municipio), vars);
    const profitText = hasSolarData
        ? replaceTokens(parseSpintax(SUBVENCIONES_SPINTAX.municipio_rentabilidad, municipio + "profit"), vars)
        : null;
    const ccaaLongText = replaceTokens(parseSpintax(SUBVENCIONES_SPINTAX.ayudas_ccaa_detalladas, municipio + "ccaa"), vars);
    const localLongText = replaceTokens(parseSpintax(SUBVENCIONES_SPINTAX.bonificaciones_locales_detalladas, municipio + "local"), vars);
    const irpfLongText = replaceTokens(parseSpintax(SUBVENCIONES_SPINTAX.irpf_guia_detallada, municipio + "irpf"), vars);
    const stepsLongText = replaceTokens(parseSpintax(SUBVENCIONES_SPINTAX.pasos_detallados, municipio + "steps"), vars);
    const expertsFaqs = SUBVENCIONES_SPINTAX.faqs_expertos;

    return (
        <main className="bg-slate-50 min-h-screen font-sans selection:bg-emerald-100">
            {/* ── SUPREME HYBRID HERO ─────────────────────────────────────────── */}
            <section className="bg-slate-950 pt-12 pb-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.05] bg-center" />
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-600/10 blur-[120px] rounded-full pointer-events-none" />
                
                <div className="relative z-10 mx-auto max-w-7xl px-6 flex flex-col lg:flex-row items-start lg:items-center gap-12">
                    <div className="flex-1 space-y-8">
                        {/* Breadcrumb */}
                        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                            <Link href="/" className="hover:text-slate-300 transition-colors">Portal</Link>
                            <span className="text-slate-800">/</span>
                            <Link href="/subvenciones-solares" className="hover:text-slate-300 transition-colors">Subvenciones</Link>
                            <span className="text-slate-800">/</span>
                            <span className="text-emerald-400 font-bold">{muniName}</span>
                        </nav>

                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5">
                            <Gift className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Fondos Actualizados 2026 · {ccaaName}</span>
                        </div>

                        <h1 className="text-4xl md:text-6xl font-black text-white leading-[1.1] tracking-tighter">
                            Subvenciones para <br />
                            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent italic">
                                Placas Solares en {muniName}
                            </span>
                        </h1>
                        <p className="text-base md:text-xl text-slate-400 font-medium leading-relaxed max-w-2xl">
                            Accede al programa autonómico acumulable con la bonificación de IBI de tu ayuntamiento y la deducción de IRPF nacional por eficiencia energética.
                        </p>
                    </div>

                    {/* KPI Summary Card (Supreme Version) */}
                    <div className="w-full lg:w-[380px] shrink-0">
                        <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl border border-white/10 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-6 pointer-events-none">
                               <ShieldCheck className="w-6 h-6 text-slate-100 group-hover:text-emerald-500/10 transition-colors" />
                            </div>
                            
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-8 border-b border-slate-50 pb-4">Incentivos en {muniName}</h3>
                            
                            <div className="space-y-6">
                                <div className="flex justify-between items-center group/item">
                                    <div className="space-y-1">
                                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Subvención {ccaaName}</p>
                                       <p className="text-sm font-bold text-slate-800">Directa a cuenta</p>
                                    </div>
                                    <span className="font-black text-emerald-600 text-3xl tabular-nums">{pct}%</span>
                                </div>
                                <div className="flex justify-between items-center bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                                    <div className="space-y-1">
                                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Máximo Ayuda</p>
                                       <p className="text-xs text-slate-500">Por expediente 2026</p>
                                    </div>
                                    <span className="font-black text-slate-900 text-2xl tabular-nums">{Number(maxEur).toLocaleString("es-ES")}€</span>
                                </div>
                                {bonifIbi > 0 && (
                                    <div className="flex justify-between items-center p-4 bg-amber-50/50 border border-amber-100/50 rounded-2xl">
                                        <div className="space-y-1">
                                           <p className="text-[10px] font-bold text-amber-600/60 uppercase tracking-widest">Ahorro IBI</p>
                                           <p className="text-xs text-amber-900/60">Local {muniName}</p>
                                        </div>
                                        <span className="font-black text-amber-600 text-2xl tabular-nums">{bonifIbi}%</span>
                                    </div>
                                )}
                            </div>
                            
                            <Link href="/presupuesto-solar" className="mt-8 w-full group/btn inline-flex items-center justify-center gap-3 bg-slate-900 text-white font-black py-5 rounded-2xl shadow-xl transition-all hover:bg-slate-800 hover:-translate-y-1 active:scale-95 text-xs uppercase tracking-widest">
                                <span>Pedir Estudio Gratis</span>
                                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── LIGHT CONTENT ─────────────────────────────────────────── */}
            <div className="mx-auto max-w-7xl px-6 py-16 lg:py-24 grid gap-12 lg:grid-cols-12 relative z-10 -mt-16">
                <div className="lg:col-span-8 space-y-12">

                    {/* Intro Section */}
                    <section className="bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-slate-200/50">
                        <div className="flex items-center gap-3 mb-8">
                           <div className="h-10 w-10 rounded-2xl bg-emerald-100 flex items-center justify-center">
                              <Building2 className="w-5 h-5 text-emerald-600" />
                           </div>
                           <h2 className="text-lg font-black text-slate-900 tracking-tight italic">Estatus de los paneles solares en {muniName}</h2>
                        </div>
                        
                        <div className="space-y-6">
                            {introText.split("\n").filter(Boolean).map((para, i) => (
                                <p key={i} className="text-base text-slate-600 leading-relaxed font-medium">{para.trim()}</p>
                            ))}

                            {profitText && (
                                <div className="mt-8 p-8 bg-slate-50 border border-slate-200 rounded-[2rem] relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-4">
                                       <TrendingUp className="w-4 h-4 text-slate-200" />
                                    </div>
                                    {profitText.split("\n").filter(Boolean).map((para, i) => (
                                        <p key={i} className="text-sm text-slate-700 leading-relaxed font-semibold italic">{para.trim()}</p>
                                    ))}
                                </div>
                            )}

                            {hasSolarData && (
                                <div className="grid grid-cols-2 gap-6 mt-8">
                                    <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm text-center group transition-all hover:border-blue-200">
                                        <div className="flex justify-center mb-3">
                                           <Sun className="w-6 h-6 text-amber-500" />
                                        </div>
                                        <p className="text-3xl font-black text-slate-900 tabular-nums">{Number(horasSol).toLocaleString("es-ES")}</p>
                                        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black mt-2">Horas sol / año</p>
                                    </div>
                                    <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm text-center group transition-all hover:border-emerald-200">
                                        <div className="flex justify-center mb-3">
                                           <Zap className="w-6 h-6 text-emerald-500" />
                                        </div>
                                        <p className="text-3xl font-black text-slate-900 tabular-nums">{Number(radiacion).toLocaleString("es-ES")}</p>
                                        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black mt-2">Radiación kWh/m²</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>
                    <section id="ccaa" className="bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-slate-200/50">
                        <div className="flex items-center gap-3 mb-8">
                           <div className="h-10 w-10 rounded-2xl bg-blue-100 flex items-center justify-center">
                              <ShieldCheck className="w-5 h-5 text-blue-600" />
                           </div>
                           <h2 className="text-xl font-black text-slate-900 tracking-tight italic">1. Ayudas autonómicas para placas solares en {ccaaName}</h2>
                        </div>
                        <div className="space-y-6">
                            {ccaaLongText.split("\n").filter(Boolean).map((para, i) => (
                                <p key={i} className="text-base text-slate-600 leading-relaxed font-medium">{para.trim()}</p>
                            ))}
                        </div>
                    </section>

                    {/* 2. Bonificaciones Locales Long Form */}
                    <section id="locales" className="bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-slate-200/50">
                        <div className="flex items-center gap-3 mb-8">
                           <div className="h-10 w-10 rounded-2xl bg-amber-100 flex items-center justify-center">
                              <Euro className="w-5 h-5 text-amber-600" />
                           </div>
                           <h2 className="text-xl font-black text-slate-900 tracking-tight italic">2. Bonificaciones locales de IBI e ICIO en {muniName}</h2>
                        </div>
                        <div className="space-y-6">
                            {localLongText.split("\n").filter(Boolean).map((para, i) => (
                                <p key={i} className="text-base text-slate-600 leading-relaxed font-medium">{para.trim()}</p>
                            ))}
                            {bonifIbi > 0 && (
                                <div className="mt-8 p-6 bg-amber-50 rounded-2xl border border-amber-100">
                                    <p className="text-sm font-bold text-amber-900 italic">Dato confirmado: El ayuntamiento de {muniName} aplica un {bonifIbi}% de bonificación en el IBI por autoconsumo solar.</p>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* 3. Deducciones Fiscales IRPF Long Form */}
                    <section id="irpf" className="bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-slate-200/50">
                        <div className="flex items-center gap-3 mb-8">
                           <div className="h-10 w-10 rounded-2xl bg-emerald-100 flex items-center justify-center">
                              <Zap className="w-5 h-5 text-emerald-600" />
                           </div>
                           <h2 className="text-xl font-black text-slate-900 tracking-tight italic">3. Deducciones fiscales del IRPF nacional por paneles solares</h2>
                        </div>
                        <div className="space-y-6">
                            {irpfLongText.split("\n").filter(Boolean).map((para, i) => (
                                <p key={i} className="text-base text-slate-600 leading-relaxed font-medium">{para.trim()}</p>
                            ))}
                        </div>
                    </section>

                    <LocalCalculatorCTA 
                        municipio={muniName} 
                        slug={dbMuniSlug} 
                        variant="emerald"
                    />

                    {/* 4. Guía de Solicitud Long Form */}
                    <section id="solicitud" className="bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-slate-200/50">
                        <div className="flex items-center gap-3 mb-10">
                           <div className="h-10 w-10 rounded-2xl bg-slate-900 flex items-center justify-center">
                              <Info className="w-5 h-5 text-white" />
                           </div>
                           <h2 className="text-xl font-black text-slate-900 tracking-tight italic">4. Cómo solicitar las subvenciones en {muniName} paso a paso</h2>
                        </div>
                        <div className="space-y-8">
                            {stepsLongText.split("\n").filter(Boolean).map((para, i) => (
                                <p key={i} className="text-base text-slate-600 leading-relaxed font-medium">{para.trim()}</p>
                            ))}

                            {fechaFin && (
                                <div className="mt-8 p-4 bg-slate-100 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">
                                    Vigencia: hasta el {new Date(fechaFin).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}
                                </div>
                            )}
                        </div>
                    </section>

                    {/* 5. FAQs Expertos */}
                    <section id="faqs" className="bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-slate-200/50">
                        <div className="flex items-center gap-3 mb-12">
                           <div className="h-10 w-10 rounded-2xl bg-indigo-100 flex items-center justify-center">
                              <Sun className="w-5 h-5 text-indigo-600" />
                           </div>
                           <h2 className="text-xl font-black text-slate-900 tracking-tight italic">Preguntas frecuentes sobre autoconsumo solar en {muniName}</h2>
                        </div>
                        <div className="space-y-8">
                            {expertsFaqs.map((faq, i) => (
                                <div key={i} className="space-y-4 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                    <h3 className="text-base font-black text-slate-900">{replaceTokens(faq.q, vars)}</h3>
                                    <p className="text-sm text-slate-500 font-medium leading-relaxed">{replaceTokens(faq.a, vars)}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Sticky Sidebar */}
                <aside className="lg:col-span-4 space-y-8">
                    <div id="solicitar" className="bg-slate-950 rounded-[2.5rem] p-8 text-white shadow-2xl sticky top-8 border border-white/5 overflow-hidden group">
                        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03] group-hover:opacity-[0.05] transition-opacity" />
                        
                        <div className="relative z-10">
                            <div className="inline-flex px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-6">
                               <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Instalación Certificada</p>
                            </div>
                            
                            <h3 className="text-2xl font-black tracking-tight mb-4 italic leading-tight">Auditoría Gratuita de Subvención</h3>
                            <p className="text-sm text-slate-400 mb-8 leading-relaxed font-medium">
                                Los instaladores verificados en {provName} gestionan tu expediente del programa {programa} de principio a fin sin coste adicional.
                            </p>
                            
                            <Link
                                href="/presupuesto-solar"
                                className="block w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-5 rounded-2xl text-center shadow-lg shadow-emerald-600/20 transition-all active:scale-95 text-xs uppercase tracking-widest"
                            >
                                Contactar Ingeniero →
                            </Link>
                            
                            <div className="mt-10 pt-8 border-t border-white/5 space-y-4">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">Gestión Técnico-Administrativa</p>
                                <ul className="space-y-4">
                                    <li>
                                        <Link href={`/subvenciones-solares/${comunidad}/${provincia}`} className="text-xs font-bold text-slate-400 hover:text-white transition-colors flex items-center gap-2">
                                            <ArrowRight className="w-3 h-3 rotate-180" />
                                            Volver a {provName}
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href={`/calculadoras/${dbMuniSlug}`} className="group flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all">
                                           <div className="flex items-center gap-3">
                                              <Calculator className="w-4 h-4 text-blue-400" />
                                              <p className="text-[10px] font-black uppercase tracking-widest text-slate-200">Simulador Ahorro</p>
                                           </div>
                                           <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>

            <SeoLinkJuicer currentPath={`/subvenciones-solares/${dbCcaaSlug}/${dbProvSlug}/${dbMuniSlug}`} />
        </main>
    );
    } catch (error) {
        if (isRedirectError(error)) throw error;
        console.error(`[SubvencionesSolaresMunicipioPage] Fatal crash for ${municipio}:`, error);
        return <Fallback message="Estamos experimentando dificultades técnicas cargando los datos de este municipio. Por favor, inténtalo de nuevo en unos momentos." />;
    }
}

function TrendingUp({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
    );
}
