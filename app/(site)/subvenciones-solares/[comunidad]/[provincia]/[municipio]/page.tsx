import { Metadata } from "next";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { parseSpintax, replaceTokens } from "@/lib/pseo/spintax";
import { SUBVENCIONES_SPINTAX } from "@/data/seo/subsidy-content";

type Props = { params: { comunidad: string; provincia: string; municipio: string } };

const CCAA_NAME_MAP: Record<string, string> = {
    "andalucia": "Andalucía", "aragon": "Aragón", "principado-de-asturias": "Asturias",
    "illes-balears": "Islas Baleares", "canarias": "Canarias", "cantabria": "Cantabria",
    "castilla-y-leon": "Castilla y León", "castilla-la-mancha": "Castilla-La Mancha",
    "cataluna": "Cataluña", "comunitat-valenciana": "Comunidad Valenciana",
    "extremadura": "Extremadura", "galicia": "Galicia", "comunidad-madrid": "Comunidad de Madrid",
    "region-de-murcia": "Región de Murcia", "comunidad-foral-navarra": "Navarra",
    "pais-vasco": "País Vasco", "la-rioja": "La Rioja", "ceuta-ceuta": "Ceuta", "melilla-melilla": "Melilla",
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { municipio, provincia, comunidad } = await params;
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase
        .from("municipios_energia")
        .select("municipio, provincia")
        .eq("slug", municipio)
        .limit(1)
        .single();

    const muniName = (data as any)?.municipio ?? municipio.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
    const provName = (data as any)?.provincia ?? provincia.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());

    return {
        title: `Subvenciones Placas Solares en ${muniName} (${provName}) 2026 | Ayudas e IBI`,
        description: `Consulta las subvenciones del ${CCAA_NAME_MAP[comunidad] ?? comunidad}, la bonificación de IBI y la deducción de IRPF disponibles para instalar placas solares en ${muniName}.`,
        alternates: { canonical: `/subvenciones-solares/${comunidad}/${provincia}/${municipio}` },
    };
}

export default async function SubvencionesSolaresMunicipioPage({ params }: Props) {
    const { comunidad, provincia, municipio } = await params;

    const ccaaName = CCAA_NAME_MAP[comunidad] ?? comunidad.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
    const supabase = await createSupabaseServerClient();

    // 1. Fetch municipio data — use real "municipio" name from DB (avoids slug artifact like "Aiguafreda Barcelona")
    const { data: muniRaw } = await supabase
        .from("municipios_energia")
        .select("municipio, provincia, habitants, horas_sol, irradiacion_solar, bonificacion_ibi, bonificacion_icio, ahorro_estimado")
        .eq("slug", municipio)
        .limit(1)
        .single();

    const muniRow = muniRaw as any;

    // Real name from DB — avoids converting "aiguafreda-barcelona" → "Aiguafreda Barcelona"
    const muniName: string = muniRow?.municipio ?? municipio.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
    const provName: string = muniRow?.provincia ?? provincia.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());

    // 2. Fetch CCAA subsidy data
    const { data: ccaaRaw } = await supabase
        .from("subvenciones_solares_ccaa_es")
        .select("subvencion_porcentaje, max_subvencion_euros, programa, fecha_fin")
        .ilike("comunidad_autonoma", `%${ccaaName.split(" ")[0]}%`)
        .limit(1)
        .single();

    const ccaaRow = ccaaRaw as any;

    // Real data or fallbacks
    const pct: number = ccaaRow?.subvencion_porcentaje ?? 40;
    const maxEur: number = ccaaRow?.max_subvencion_euros ?? 3000;
    const programa: string = ccaaRow?.programa ?? `Ayudas Autoconsumo de ${ccaaName}`;
    const fechaFin: string | null = ccaaRow?.fecha_fin ?? null;
    const bonifIbi: number = muniRow?.bonificacion_ibi ?? 0;
    const bonifIcio: number = muniRow?.bonificacion_icio ?? 0;
    const horasSol: number = muniRow?.horas_sol ?? 2800;
    const radiacion: number = muniRow?.irradiacion_solar ?? 1600;
    const ahorroEstimado: number | null = muniRow?.ahorro_estimado ?? null;

    // Determine if we have real solar data 
    const hasSolarData = muniRow?.horas_sol && muniRow?.irradiacion_solar;

    // ── Spintax paragraph generation ──────────────────────────────
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
    // Only show rentabilidad paragraph if we have real solar data
    const profitText = hasSolarData
        ? replaceTokens(parseSpintax(SUBVENCIONES_SPINTAX.municipio_rentabilidad, municipio + "profit"), vars)
        : null;
    // Conditional IBI paragraph based on real data
    const ibiText = replaceTokens(
        parseSpintax(
            bonifIbi > 0 ? SUBVENCIONES_SPINTAX.municipio_ibi_activo : SUBVENCIONES_SPINTAX.municipio_ibi_inactivo,
            municipio + "ibi"
        ),
        vars
    );
    const reqText = replaceTokens(parseSpintax(SUBVENCIONES_SPINTAX.requisitos, municipio + "req"), vars);

    return (
        <main className="bg-white min-h-screen font-sans">
            {/* ── HERO ─────────────────────────────────────────────── */}
            <section className="bg-slate-900 pt-14 pb-20 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.04] bg-center" />
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none translate-x-1/2 -translate-y-1/2" />

                <div className="relative z-10 mx-auto max-w-5xl px-4 flex flex-col md:flex-row md:items-center gap-10">
                    <div className="flex-1 space-y-5">
                        <nav className="text-xs text-slate-500 flex flex-wrap gap-2 items-center">
                            <a href="/" className="hover:text-slate-300 transition-colors">Inicio</a>
                            <span className="text-slate-700">›</span>
                            <a href="/subvenciones-solares" className="hover:text-slate-300 transition-colors">Subvenciones</a>
                            <span className="text-slate-700">›</span>
                            <a href={`/subvenciones-solares/${comunidad}`} className="hover:text-slate-300 transition-colors">{ccaaName}</a>
                            <span className="text-slate-700">›</span>
                            <a href={`/subvenciones-solares/${comunidad}/${provincia}`} className="hover:text-slate-300 transition-colors">{provName}</a>
                            <span className="text-slate-700">›</span>
                            <span className="text-emerald-400 font-medium">{muniName}</span>
                        </nav>

                        <div className="inline-flex items-center gap-2 border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 rounded-md">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                            <span className="text-emerald-400 text-xs font-semibold tracking-wide uppercase">Datos 2026 · {ccaaName}</span>
                        </div>

                        <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight tracking-tight">
                            Subvenciones solares en <br />
                            <span className="text-emerald-400">{muniName}</span>
                        </h1>
                        <p className="text-slate-400 text-base leading-relaxed max-w-lg">
                            Ayudas del programa autonómico, bonificación de IBI e ICIO de tu Ayuntamiento y deducción de IRPF acumulables para instalar placas solares en {muniName}.
                        </p>
                    </div>

                    {/* KPI Summary Card */}
                    <div className="md:w-[320px] flex-shrink-0">
                        <div className="bg-white rounded-2xl p-6 shadow-2xl border border-slate-100">
                            <h3 className="font-bold text-slate-900 text-sm mb-4 uppercase tracking-widest text-center">Ayudas disponibles</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center py-2.5 border-b border-slate-50">
                                    <span className="text-sm text-slate-500">Subvención {ccaaName}</span>
                                    <span className="font-black text-emerald-600 text-xl">Hasta {pct}%</span>
                                </div>
                                <div className="flex justify-between items-center py-2.5 border-b border-slate-50">
                                    <span className="text-sm text-slate-500">Máximo por expediente</span>
                                    <span className="font-black text-blue-600 text-xl">{Number(maxEur).toLocaleString("es-ES")} €</span>
                                </div>
                                {bonifIbi > 0 && (
                                    <div className="flex justify-between items-center py-2.5 border-b border-slate-50">
                                        <span className="text-sm text-slate-500">Bonificación IBI local</span>
                                        <span className="font-black text-amber-600 text-xl">{bonifIbi}%</span>
                                    </div>
                                )}
                                {bonifIcio > 0 && (
                                    <div className="flex justify-between items-center py-2.5 border-b border-slate-50">
                                        <span className="text-sm text-slate-500">Descuento ICIO</span>
                                        <span className="font-black text-purple-600 text-xl">{bonifIcio}%</span>
                                    </div>
                                )}
                                {ahorroEstimado && (
                                    <div className="flex justify-between items-center py-2.5">
                                        <span className="text-sm text-slate-500">Ahorro anual est.</span>
                                        <span className="font-black text-slate-800 text-xl">{Number(ahorroEstimado).toLocaleString("es-ES")} €</span>
                                    </div>
                                )}
                            </div>
                            <a href="/presupuesto-solar" className="mt-5 w-full block bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl text-center shadow-lg shadow-emerald-600/20 transition-all text-sm">
                                Pedir Presupuesto Gratis →
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── CONTENT ─────────────────────────────────────────── */}
            <div className="mx-auto max-w-5xl px-4 py-10 grid gap-8 md:grid-cols-3">
                <div className="md:col-span-2 space-y-8">

                    {/* Intro + Rentabilidad */}
                    <section className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                            <h2 className="text-base font-bold text-slate-900">Acceso a las ayudas en {muniName}</h2>
                        </div>
                        <div className="p-6 space-y-4">
                            {/* Intro paragraph — spintax municipio_intro */}
                            {introText.split("\n").filter(Boolean).map((para, i) => (
                                <p key={i} className="text-sm text-slate-600 leading-relaxed">{para.trim()}</p>
                            ))}

                            {/* Rentabilidad — only if real solar data exists */}
                            {profitText && (
                                <div className="mt-4 p-4 bg-amber-50 border border-amber-100 rounded-xl space-y-2">
                                    {profitText.split("\n").filter(Boolean).map((para, i) => (
                                        <p key={i} className="text-sm text-slate-700 leading-relaxed">{para.trim()}</p>
                                    ))}
                                </div>
                            )}

                            {/* Solar data KPIs — only if available */}
                            {hasSolarData && (
                                <div className="grid grid-cols-2 gap-4 mt-2">
                                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl text-center">
                                        <p className="text-2xl font-black text-blue-700">{Number(horasSol).toLocaleString("es-ES")}</p>
                                        <p className="text-[10px] uppercase tracking-widest text-blue-500 font-bold mt-1">Horas sol / año</p>
                                    </div>
                                    <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl text-center">
                                        <p className="text-2xl font-black text-amber-700">{Number(radiacion).toLocaleString("es-ES")}</p>
                                        <p className="text-[10px] uppercase tracking-widest text-amber-500 font-bold mt-1">kWh/m² año</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Bonificación IBI/ICIO — conditional on real data */}
                    <section className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                            <h2 className="text-base font-bold text-slate-900">
                                {bonifIbi > 0
                                    ? `Bonificación de IBI en ${muniName}: ${bonifIbi}% activo`
                                    : `¿Tiene ${muniName} bonificación de IBI solar?`}
                            </h2>
                        </div>
                        <div className="p-6 space-y-4">
                            {/* Conditional IBI paragraph */}
                            {ibiText.split("\n").filter(Boolean).map((para, i) => (
                                <p key={i} className="text-sm text-slate-600 leading-relaxed">{para.trim()}</p>
                            ))}
                            {/* Show ICIO if exists */}
                            {bonifIcio > 0 && (
                                <div className="mt-2 p-4 bg-purple-50 border border-purple-100 rounded-xl flex justify-between items-center">
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-widest text-purple-700 mb-0.5">Descuento ICIO</p>
                                        <p className="text-sm text-slate-600">El Ayuntamiento de {muniName} también aplica un {bonifIcio}% de descuento en la Tasa de Obras (ICIO).</p>
                                    </div>
                                    <span className="text-3xl font-black text-purple-700 flex-shrink-0 ml-4">{bonifIcio}%</span>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Procedimiento */}
                    <section className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                            <h2 className="text-base font-bold text-slate-900">Cómo solicitar la subvención en {muniName}</h2>
                        </div>
                        <div className="p-6 space-y-5">
                            {/* Requisitos spintax paragraph */}
                            <div className="space-y-3">
                                {reqText.split("\n").filter(Boolean).map((para, i) => (
                                    <p key={i} className="text-sm text-slate-600 leading-relaxed">{para.trim()}</p>
                                ))}
                            </div>
                            <ol className="space-y-4 pt-2">
                                {[
                                    { t: "Solicitud previa obligatoria", d: `Registra la solicitud en la sede electrónica de ${ccaaName} antes de instalar nada. Sin este paso, la subvención es inválida.` },
                                    { t: "Documentación técnica", d: "Tu instalador elabora la memoria de diseño, presupuesto detallado y certificados energéticos necesarios." },
                                    { t: "Instalación y legalización", d: `Montaje de las placas solares y registro en el organismo de Industria de ${provName} para legalizar el autoconsumo.` },
                                    { t: "Justificación y cobro", d: "Presentación de facturas y justificantes de pago bancario. La administración ingresa la ayuda tras su validación." },
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
                            {fechaFin && (
                                <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500">
                                    <strong className="text-slate-700">Vigencia del programa:</strong> hasta el{" "}
                                    {new Date(fechaFin).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}.
                                    Consulta la sede electrónica de {ccaaName} para confirmar plazos actualizados.
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                {/* Sidebar */}
                <aside className="space-y-5">
                    <div id="solicitar" className="bg-slate-900 rounded-2xl p-6 text-white shadow-lg sticky top-6 border border-slate-800">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 mb-3">Instaladores certificados</p>
                        <h3 className="text-lg font-bold mb-3 leading-snug">Gestión completa de la subvención</h3>
                        <p className="text-sm text-slate-400 mb-5 leading-relaxed">
                            Nuestros instaladores en {provName} tramitan el expediente del programa {programa} de principio a fin, sin coste adicional para ti.
                        </p>
                        <a
                            href="/presupuesto-solar"
                            className="block w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl text-center shadow-lg shadow-emerald-600/20 transition-all text-sm"
                        >
                            Hablar con un Experto →
                        </a>
                        <div className="mt-5 pt-5 border-t border-slate-800">
                            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-3">Navegación</p>
                            <ul className="space-y-2 text-sm">
                                <li>
                                    <a href={`/subvenciones-solares/${comunidad}/${provincia}`} className="text-slate-400 hover:text-white transition-colors">
                                        ← Volver a {provName}
                                    </a>
                                </li>
                                <li><a href={`/subvenciones-solares/${comunidad}`} className="text-slate-400 hover:text-white transition-colors">← {ccaaName}</a></li>
                                <li><a href="/bonificacion-ibi" className="text-slate-400 hover:text-white transition-colors">→ Buscador IBI Nacional</a></li>
                                <li><a href="/calculadoras" className="text-slate-400 hover:text-white transition-colors">→ Calculadora de ahorro</a></li>
                            </ul>
                        </div>
                    </div>
                </aside>
            </div>
        </main>
    );
}
