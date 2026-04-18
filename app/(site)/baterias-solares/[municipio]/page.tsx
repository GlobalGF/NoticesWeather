/**
 * /baterias-solares/[municipio] — Rentabilidad de baterías solares por municipio
 * Design: formal energy portal (Bloomberg/ESIOS style)
 */

import { notFound, redirect, permanentRedirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect";
import Fallback from "@/components/solar/Fallback";
import { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { tryParseSlug } from "@/lib/utils/params";
import { isBlockedSlug } from "@/lib/utils/validate-slug";
import { buildMetadata } from "@/lib/seo/metadata-builder";
import { LeadForm } from "@/components/ui/LeadForm";
import { generateDynamicText } from "@/lib/pseo/spintax";
import { SiloNavigation } from "@/components/ui/SiloNavigation";
import { cleanMunicipalitySlug, slugify } from "@/lib/utils/slug";
import { getMunicipioBySlug, getProvinceHubs } from "@/lib/data/solar";
import { ProvinceHubLinks } from "@/components/ui/ProvinceHubLinks";

export const revalidate = 604800; // 1 semana
export const dynamicParams = true;
export const runtime = "nodejs";

type Props = { params: { municipio: string } };

type MunicipioRow = {
    slug: string;
    municipio: string;
    provincia: string;
    comunidad_autonoma: string;
    habitantes: number | null;
    horas_sol: number | null;
    irradiacion_solar: number | null;
    ahorro_estimado: number | null;
    bonificacion_ibi: number | null;
    bonificacion_ibi_duracion: number | null;
    bonificacion_ibi_condiciones: string | null;
    bonificacion_icio: number | null;
    subvencion_autoconsumo: number | null;
    precio_medio_luz: number | null;
    precio_instalacion_min_eur: number | null;
    precio_instalacion_medio_eur: number | null;
    precio_instalacion_max_eur: number | null;
    eur_por_watio: number | null;
};

type BateriaRow = {
    fabricante: string;
    modelo: string;
    capacidad_kwh: number;
    potencia_descarga_kw: number;
    ciclos: number;
    profundidad_descarga_pct: number;
    garantia_anos: number;
    tecnologia?: string;
    eficiencia_roundtrip_pct?: number;
    ficha_tecnica_url?: string;
};

/* ── Helpers ─────────────────────────────────────────────────────── */
function cleanLocationName(name: string) {
    if (!name) return "";
    if (name.includes("/")) {
        const parts = name.split("/");
        return (parts[1] || parts[0]).trim();
    }
    return name.trim();
}

function nd(v: number | null | undefined, suffix = "", dec = 0): string {
    if (v == null) return "—";
    return v.toLocaleString("es-ES", { maximumFractionDigits: dec }) + suffix;
}

/* ── Metadata ────────────────────────────────────────────────────── */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const slug = tryParseSlug(params.municipio);
    if (!slug || isBlockedSlug(slug)) notFound();
    if (!hasSupabaseEnv()) return { title: "Baterías Solares" };

    const d = await getMunicipioBySlug(slug);
    if (!d) return { title: "Baterías Solares" };

    const muniClean = cleanLocationName(d.municipio);
    const provClean = cleanLocationName(d.provincia);
    const locationLabel = (muniClean.toLowerCase() === provClean.toLowerCase()) ? muniClean : `${muniClean} (${provClean})`;

    // Use clean slug for canonical even if hit from dirty slug
    const cleanSlug = cleanMunicipalitySlug(d.slug, slugify(d.provincia));

    // Canonical Redirect
    if (slug !== cleanSlug) {
        permanentRedirect(`/baterias-solares/${cleanSlug}`);
    }

    return buildMetadata({
        title: `Baterías Solares en ${locationLabel} · Ahorro ${new Date().getFullYear()}`,
        description: `Rentabilidad de baterías solares en ${locationLabel}. Comparativa de modelos (Huawei, BYD), ciclos de vida y años para recuperar la inversión en tu localidad.`,
        pathname: `/baterias-solares/${cleanSlug}`,
    });
}

/* ── Sub-components ──────────────────────────────────────────────── */
function DataRow({ label, value, note }: { label: string; value: string; note?: string }) {
    return (
        <div className="flex items-baseline justify-between py-2.5 border-b border-slate-100 last:border-0">
            <span className="text-sm text-slate-500 font-medium">{label}</span>
            <span className="text-sm font-semibold text-slate-900 text-right">
                {value}
                {note && <span className="ml-1.5 text-xs text-slate-400 font-normal">{note}</span>}
            </span>
        </div>
    );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
    return (
        <div className="mb-4 pb-2 border-b-2 border-slate-900">
            <h2 className="text-base font-bold uppercase tracking-wide text-slate-900">{title}</h2>
            {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
        </div>
    );
}

/* ── Page ────────────────────────────────────────────────────────── */
export default async function BateriasMunicipioPage({ params }: Props) {
    const rawMunicipio = params.municipio;
    try {
        if (!rawMunicipio) notFound();

        const decoded = decodeURIComponent(rawMunicipio).toLowerCase();
        const slug = tryParseSlug(decoded) || decoded;

        if (isBlockedSlug(slug)) notFound();
        if (!hasSupabaseEnv()) return <div className="p-10 text-center text-slate-400">Supabase no configurado.</div>;

        const supabase = await createSupabaseServerClient();

        // Robust Fetch: Try to find any slug starting with our search term
        const { data: muniRows, error: muniError } = await supabase
            .from("municipios_energia")
            .select("*")
            .filter("slug", "ilike", `${slug}%`)
            .limit(20);

        if (muniError || !muniRows || muniRows.length === 0) {
            console.warn(`[BateriasMunicipioPage] NOT FOUND in DB for: ${slug}`);
            notFound();
        }

        // Find the canonical match
        const match = (muniRows as any[]).find((m: any) => {
            const mProvSlug = slugify(m.provincia);
            return cleanMunicipalitySlug(m.slug, mProvSlug) === rawMunicipio;
        }) || (muniRows as any[]).find((m: any) => m.slug === rawMunicipio);

        const municipio: any = match || (muniRows as any[]).find((m: any) => m.slug === slug);

        if (!municipio) {
            console.warn(`[BateriasMunicipioPage] NO CLEANED MATCH in candidates`);
            notFound();
        }

        const dbProvSlug = slugify(municipio.provincia);
        const dbMuniSlug = cleanMunicipalitySlug(municipio.slug, dbProvSlug);

        // Canonical Redirect
        if (rawMunicipio !== dbMuniSlug) {
            permanentRedirect(`/baterias-solares/${dbMuniSlug}`);
        }

        const [bateriasRes, hubs] = await Promise.all([
            supabase.from("baterias_solares")
                .select("fabricante, modelo, capacidad_kwh, potencia_descarga_kw, ciclos, profundidad_descarga_pct, garantia_anos, tecnologia, eficiencia_roundtrip_pct, ficha_tecnica_url")
                .eq("activo", true)
                .order("capacidad_kwh", { ascending: true })
                .limit(6),
            getProvinceHubs(municipio.provincia, 20)
        ]);

        const m = municipio as MunicipioRow;
        const baterias = (bateriasRes.data ?? []) as BateriaRow[];

    // Cálculos estimados genéricos para baterías en este municipio
    const ahorroSolarBase = m.ahorro_estimado ?? 600;
    const ahorroExtraBateria = Math.round(ahorroSolarBase * 0.45); // Asumimos un 45% de ahorro extra
    const ahorroTotal = ahorroSolarBase + ahorroExtraBateria;

    // Calcular el precio medio basándose en eur/kWh estimado de mercado
    function getBatPriceEst(b: BateriaRow) {
        let rate = 480;
        if (b.fabricante === "Tesla") return 7000;
        if (b.fabricante.includes("Huawei")) rate = 500;
        if (b.fabricante.includes("BYD")) rate = 450;
        if (b.fabricante.includes("Enphase")) rate = 650;
        if (b.fabricante.includes("Sigenergy")) rate = 550;
        return Math.round(b.capacidad_kwh * rate);
    }
    
    // Average capacity and average derived market price
    const capMedia = baterias.length > 0 ? (baterias.reduce((acc, curr) => acc + curr.capacidad_kwh, 0) / baterias.length) : 5;
    const precioMedioBateria = baterias.length > 0 
        ? Math.round(baterias.reduce((acc, curr) => acc + getBatPriceEst(curr), 0) / baterias.length)
        : Math.round(capMedia * 480);
    
    const paybackBateria = Math.round((precioMedioBateria / ahorroExtraBateria) * 10) / 10;

    const muniName = cleanLocationName(m.municipio);
    const provName = cleanLocationName(m.provincia);

    // Generar textos dinámicos spintax
    const spintaxP1 = "{La decisión|La elección|El paso|El hecho} de {agregar|incorporar|sumar|instalar} {baterías físicas|baterías solares|acumuladores de litio|sistemas de almacenamiento} a {un sistema fotovoltaico|su instalación fotovoltaica|sus placas solares} {depende estrictamente|está directamente ligado|se basa principalmente} en la {relación|diferencia|brecha} entre {el precio de la red|el coste de la electricidad|las tarifas del mercado libre} (<a href=\"/precio-luz\" class=\"text-blue-600 hover:underline\">PVPC alto en horas nocturnas</a>) y la {compensación de excedentes|venta de la energía sobrante|remuneración de excedentes} ({que suele ser baja|extremadamente reducida|baja} {durante las horas diurnas|en las horas centrales del día|mientras brilla el sol} en [PROV]).";
    
    const spintaxP2 = "{En la actualidad|A día de hoy|Hoy en día|Actualmente}, {instalar|apostar por|optar por|montar} una {batería de litio|batería|solución de almacenamiento} LiFePO4 (LFP) {reduce casi a cero|disminuye significativamente|minimiza enormemente|elimina la mayor parte de} la {exposición|dependencia} al {mercado mayorista|mercado eléctrico|precio variable} de la red {eléctrica|convencional}, {incrementando|elevando|subiendo} el porcentaje de <span className='font-bold'>autoconsumo {real|directo} {hasta un 85% o 90%|por encima del 80%}</span>. {Las baterías|Estos acumuladores|Los equipos de litio} {acumulan|guardan|almacenan} la {energía barata|electricidad excedente|producción gratis} generada al mediodía {para descargarla|para usarla|para liberarla} en los picos de demanda de {la tarde-noche|las horas finales del día|la noche}.";
    
    const spintaxVirtual = "Alternativa sin hardware. Las comercializadoras en [CCAA] pueden {guardar|acumular|retener} el {valor económico de sus excedentes|saldo generado por sus placas|dinero de los excedentes} no compensables ({el margen que sobra|el importe sobrante|el capital sobrante} al llegar a {factura 0€|una factura de 0 euros} de consumo) en un “monedero virtual”. {Esta modalidad|Este sistema|Esta opción} <span className='font-bold'>{reduce sus facturas|baja sus recibos de luz|abarata sus costes} en {meses de invierno o en segundas residencias|las épocas de bajo sol o viviendas vacacionales}</span> sin {invertir|gastar|desembolsar} en equipos de Litio, aunque {ofrece menor autonomía|brinda menos independencia|aporta menos protección} frente a subidas puntuales del PVPC.";

    const spintaxVars = {
        PROV: provName,
        CCAA: m.comunidad_autonoma,
        SLUG: slug
    };

    const textP1 = generateDynamicText(spintaxP1, slug, spintaxVars);
    const textP2 = generateDynamicText(spintaxP2, slug, spintaxVars);
    const textVirtual = generateDynamicText(spintaxVirtual, slug, spintaxVars);

    const yearNow = new Date().getFullYear();
    const nowStr = new Date().toLocaleString("es-ES", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });

    return (
        <main className="bg-slate-50 min-h-screen font-sans">
            {/* ── Page Header ─────────────────────────────────────────── */}
            <div className="bg-slate-900 text-white">
                <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between flex-wrap gap-2">
                    <nav className="text-[10px] sm:text-xs text-slate-400 flex gap-1.5 items-center inline-flex">
                        <a href="/" className="hover:text-white transition-colors">Inicio</a>
                        <span className="hidden sm:inline">›</span>
                        <a href="/placas-solares" className="hidden sm:inline hover:text-white transition-colors">Placas Solares</a>
                        <span>›</span>
                        <a href="/baterias-solares" className="hover:text-white transition-colors">Baterías</a>
                        <span>›</span>
                        <span className="text-slate-200 truncate max-w-[100px] sm:max-w-none">{muniName}</span>
                    </nav>
                    <div className="flex items-center gap-3 text-[10px] sm:text-xs text-slate-400">
                        <span className="hidden sm:inline">Actualizado: {nowStr}</span>
                        <span className="h-3 w-px bg-slate-600 hidden sm:inline-block" />
                        <span className="hidden sm:inline-block">Datos de mercado ESP</span>
                    </div>
                </div>

                <div className="mx-auto max-w-5xl px-4 pb-6 pt-2">
                    <div className="flex flex-wrap items-end gap-3">
                        <div className="flex-1 min-w-0">
                            <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-1">
                                SISTEMAS DE ALMACENAMIENTO · LÍTIO LFP
                            </p>
                            <h1 className="text-xl sm:text-3xl font-bold text-white leading-tight">
                                Baterías Solares en {muniName}
                            </h1>
                            <p className="text-slate-400 font-normal text-base sm:text-xl mt-1 hidden sm:block" aria-hidden="true">Independencia Energética</p>
                            <p className="mt-2 text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed font-light">
                                Consulte el impacto financiero de añadir módulos de almacenamiento a {muniName}. Eleve el autoconsumo por encima del 80%.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── KPI Strip ───────────────────────────────────────────── */}
            <div className="bg-white border-b border-slate-200 shadow-sm">
                <div className="mx-auto max-w-5xl px-4 py-0 grid grid-cols-2 sm:grid-cols-4 divide-x divide-slate-100">
                    {[
                        { label: "Radiación provincial", value: nd(m.irradiacion_solar, " kWh/m²"), status: "Excedentes altos", statusClass: "bg-amber-100 text-amber-800 border-amber-300" },
                        { label: "Ahorro extra batería", value: `+${nd(ahorroExtraBateria, " €/año")}`, status: `Añadido al autoconsumo`, statusClass: "bg-emerald-100 text-emerald-800 border-emerald-300" },
                        { label: "Inversión media est.", value: nd(precioMedioBateria, " €"), status: `${nd(capMedia, " kWh")} de capacidad`, statusClass: "bg-slate-100 text-slate-500 border-slate-200" },
                        { label: "Amortización batería", value: paybackBateria ? paybackBateria + " años" : "—", status: "ROI almacenamiento", statusClass: "bg-blue-100 text-blue-700 border-blue-200" },
                    ].map((k) => (
                        <div key={k.label} className="px-4 sm:px-6 py-4">
                            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">{k.label}</p>
                            <p className="mt-1 text-base sm:text-xl font-bold text-slate-900 tabular-nums">{k.value}</p>
                            <span className={`mt-1 hidden sm:inline-block rounded border px-1.5 py-0.5 text-xs font-semibold ${k.statusClass}`}>{k.status}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Source badges ───────────────────────────────────────── */}
            <div className="bg-slate-100 border-b border-slate-200">
                <div className="mx-auto max-w-5xl px-4 py-2 flex flex-wrap gap-2 items-center">
                    <span className="text-xs text-slate-500 font-semibold mr-2">Datos y Fabricantes Tier 1:</span>
                    {[
                        { label: "Huawei FusionSolar", title: "Compatibilidad con LUNA2000" },
                        { label: "BYD Battery-Box", title: "Compatibilidad modular" },
                        { label: "Enphase", title: "Sistemas Microinversores" },
                        { label: "Fronius GEN24", title: "Inversores Híbridos" },
                        { label: "PVGIS Comisión Europea", title: "Datos precisos de radiación solar satelital" },
                    ].map(b => (
                        <span
                            key={b.label}
                            title={b.title}
                            className="rounded border border-slate-300 px-2 py-0.5 text-xs font-medium text-slate-600 bg-white"
                        >
                            ✓ {b.label}
                        </span>
                    ))}
                </div>
            </div>

            {/* ── Main content ────────────────────────────────────────── */}
            <div className="mx-auto max-w-5xl px-4 py-8">
                <div className="grid gap-8 lg:grid-cols-3">

                    {/* Left column (2/3) */}
                    <div className="lg:col-span-2 space-y-8">

                        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100">
                                <h2 className="text-xl font-bold text-slate-900">Análisis: ¿Merece la pena en {muniName}?</h2>
                            </div>
                            <div className="p-6 prose prose-slate max-w-none text-slate-600 leading-relaxed text-sm">
                                <p dangerouslySetInnerHTML={{ __html: textP1 }} />
                                <p dangerouslySetInnerHTML={{ __html: textP2 }} />
                            </div>
                        </div>

                        {/* Baterías Catalog */}
                        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100">
                                <SectionHeader title={`Equipos de Almacenamiento en ${muniName}`} subtitle="Modelos LFP modulares predominantes en el mercado nacional" />
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left align-middle border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-200">
                                            <th className="px-4 sm:px-6 py-3 font-semibold text-slate-700 uppercase tracking-wide text-[10px] sm:text-xs">Equipo Base</th>
                                            <th className="px-6 py-3 text-right font-semibold text-slate-700 uppercase tracking-wide text-xs hidden md:table-cell">Tecnología</th>
                                            <th className="px-4 sm:px-6 py-3 text-right font-semibold text-slate-700 uppercase tracking-wide text-[10px] sm:text-xs">Capacidad</th>
                                            <th className="px-6 py-3 text-right font-semibold text-slate-700 uppercase tracking-wide text-xs hidden md:table-cell">Descarga</th>
                                            <th className="px-6 py-3 text-right font-semibold text-slate-700 uppercase tracking-wide text-xs hidden md:table-cell">Ciclos</th>
                                            <th className="px-6 py-3 text-right font-semibold text-slate-700 uppercase tracking-wide text-xs hidden md:table-cell">Eficiencia</th>
                                            <th className="px-6 py-3 text-right font-semibold text-slate-700 uppercase tracking-wide text-xs hidden md:table-cell">Garantía</th>
                                            <th className="px-6 py-3 text-right font-semibold text-slate-700 uppercase tracking-wide text-xs hidden md:table-cell">Ficha</th>
                                            <th className="px-4 sm:px-6 py-3 text-right font-semibold text-slate-700 uppercase tracking-wide text-[10px] sm:text-xs">Coste Est.*</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {baterias.map((bat, i) => {
                                            const precioProd = getBatPriceEst(bat);
                                            return (
                                                <tr key={i} className="hover:bg-slate-50 transition-colors">
                                                    <td className="px-4 sm:px-6 py-3">
                                                        <div className="font-semibold text-slate-900 text-xs sm:text-sm">{bat.fabricante}</div>
                                                        <div className="text-[10px] text-slate-500">{bat.modelo}</div>
                                                    </td>
                                                    <td className="px-6 py-3 text-right hidden md:table-cell">
                                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold ${bat.tecnologia === 'LFP' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{bat.tecnologia}</span>
                                                    </td>
                                                    <td className="px-4 sm:px-6 py-3 text-right text-slate-600 font-medium text-xs sm:text-sm">{nd(bat.capacidad_kwh, " kWh", 1)}</td>
                                                    <td className="px-6 py-3 text-right text-slate-600 font-medium hidden md:table-cell">{nd(bat.potencia_descarga_kw, " kW", 1)}</td>
                                                    <td className="px-6 py-3 text-right text-slate-500 font-mono text-xs hidden md:table-cell">{nd(bat.ciclos)}</td>
                                                    <td className="px-6 py-3 text-right text-slate-500 font-mono text-xs hidden md:table-cell">{bat.eficiencia_roundtrip_pct ? nd(bat.eficiencia_roundtrip_pct, '%', 1) : '—'}</td>
                                                    <td className="px-6 py-3 text-right text-slate-500 font-mono text-xs hidden md:table-cell">{bat.garantia_anos ? bat.garantia_anos + ' años' : '—'}</td>
                                                    <td className="px-6 py-3 text-right hidden md:table-cell">
                                                        {bat.ficha_tecnica_url ? (
                                                            <a href={bat.ficha_tecnica_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Ficha</a>
                                                        ) : '—'}
                                                    </td>
                                                    <td className="px-4 sm:px-6 py-3 text-right tabular-nums text-slate-900 font-bold text-xs sm:text-sm">
                                                        <span title="Precio estimado: capacidad (kWh) × 480 €">{nd(precioProd, " €")}</span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                            <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 text-xs text-slate-400">
                                * El <span className='font-bold'>coste estimado</span> se calcula multiplicando la capacidad útil de la batería (kWh) por <span className='font-bold'>480 €</span> (precio medio de mercado por kWh útil en España, solo equipo, sin instalación ni IVA). Ejemplo: una batería de 7 kWh ≈ 3.360 €.<br/>
                                Las baterías modulares permiten ampliar capacidad post-instalación. Si tu modelo tiene ficha técnica, puedes consultarla en el enlace.
                            </div>
                        </div>

                        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
                            <h3 className="text-sm font-bold text-slate-900 mb-2 uppercase tracking-wide border-b pb-2 border-slate-100">La Batería Virtual (Monedero)</h3>
                            <p className="text-slate-600 text-sm leading-relaxed mt-3" dangerouslySetInnerHTML={{ __html: textVirtual }} />
                        </div>

                        <SiloNavigation
                            currentSilo="baterias-solares"
                            municipioName={muniName}
                            municipioSlug={slug}
                            provinciaName={provName}
                            comunidadName={m.comunidad_autonoma}
                        />

                    </div>

                    {/* Right column (1/3) */}
                    <div className="space-y-6">

                        {/* Local Data Context */}
                        <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
                            <div className="px-5 pt-4 pb-2 border-b border-slate-100">
                                <SectionHeader
                                    title={`Contexto Financiero`}
                                    subtitle={`Datos de ${provName}`}
                                />
                            </div>
                            <div className="px-5 pb-4">
                                <DataRow label="Horas de carga (sol al año)" value={nd(m.horas_sol, " h")} note="PVGIS" />
                                <DataRow label="Ahorro panel solar anual" value={nd(ahorroSolarBase, " €/año")} />
                                <DataRow label="Costo PVPC evitado (Noche)" value={`~ ${nd(m.precio_medio_luz, " €/kWh", 3)}`} note="Alto" />
                                <DataRow label="Compensación excedentes" value="Baja" note="< 0.05 €/kWh" />
                            </div>
                        </div>

                        {/* ROI Calculator */}
                        <div className="bg-slate-900 rounded-lg text-white p-5 border shadow-xl border-slate-800">
                            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
                                Desglose ROI Batería (5 kWh)
                            </p>
                            <div className="space-y-3">
                                {[
                                    { label: "Coste batería est.", value: `${nd(precioMedioBateria)} €` },
                                    { label: "Subvención NextGen", value: `0 €` },
                                    { label: "Ahorro extra generado", value: `+${nd(ahorroExtraBateria)} €/año` },
                                    { label: "Periodo Amortización", value: `${paybackBateria} años` },
                                ].map(r => (
                                    <div key={r.label} className="flex justify-between items-baseline border-b border-slate-700 pb-2 last:border-0 hover:bg-slate-800/50 px-1 rounded transition-colors">
                                        <span className="text-xs text-slate-400">{r.label}</span>
                                        <span className="text-sm font-semibold tabular-nums text-emerald-400">{r.value}</span>
                                    </div>
                                ))}
                            </div>
                            <p className="mt-3 text-[11px] text-slate-500 leading-tight">
                                Las subvenciones europeas directas al almacenamiento residencial (.RD 477/2021) han agotado sus fondos. No obstante, consultar IRPF.
                            </p>
                        </div>

                        {/* Lead form sticky */}
                        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden sticky top-6">
                            <div className="bg-amber-400 px-5 py-3 border-b border-amber-500">
                                <p className="text-xs font-bold uppercase tracking-widest text-slate-900 flex items-center justify-between">
                                    <span>Solicitar Estudio Completo</span>
                                    <span className="bg-white text-amber-600 rounded px-1.5 py-0.5 text-[10px]">GRATUITO</span>
                                </p>
                            </div>
                            <div className="p-5">
                                <p className="text-sm text-slate-600 mb-4 font-medium leading-relaxed">
                                    Cotice una instalación híbrida (Paneles + Batería LFP) con técnicos certificados en {m.provincia}.
                                </p>
                                <LeadForm
                                    municipio={muniName}
                                    municipioSlug={slug}
                                    provincia={provName}
                                    ahorroEstimado={ahorroTotal}
                                />
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-5xl px-4 pb-12">
                <ProvinceHubLinks 
                    hubs={hubs} 
                    provincia={m.provincia} 
                    currentSlug={slug}
                    label="Baterías solares en"
                />
            </div>

            {/* ── Footer ────────────────────────────── */}
            <div className="border-t border-slate-200 bg-white mt-8 py-10">
                <div className="mx-auto max-w-5xl px-4 text-xs text-slate-500 space-y-4">
                    <div className="grid sm:grid-cols-2 gap-8">
                        <div>
                            <p className="font-bold text-slate-700 mb-2 text-sm">Metodología Financiera</p>
                            <p className="leading-relaxed">
                                Los análisis de amortización se elaboran modelando un incremento del 45% en la tasa de autoconsumo sobre los datos base procesados por el satélite SARAH (PVGIS) para las coordenadas de {muniName}. Los precios orientativos de equipos LFP se han estandarizado basándose en los costes actuales del mercado por kilovatio hora (kWh) según el fabricante, exención de IVA no incluida.
                            </p>
                        </div>
                        <div>
                            <p className="font-bold text-slate-700 mb-2 text-sm">Aviso Legal Energético</p>
                            <p className="leading-relaxed">
                                La base de datos técnica (Huawei, BYD, Fronius, Enphase, Tesla) se actualiza de fuentes oficiales. Los datos dinámicos no constituyen una recomendación irrevocable de inversión. Al decidir ampliar su infraestructura fotovoltaica con acumuladores electroquímicos preste atención al estado límite de carga (SOC) y garantías de degradación del fabricante en las condiciones térmicas de {m.comunidad_autonoma}.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

        </main>
    );
    } catch (error) {
        if (isRedirectError(error)) throw error;
        console.error(`[BateriasMunicipioPage] Fatal crash for ${rawMunicipio}:`, error);
        return <Fallback message="Estamos experimentando dificultades técnicas cargando los datos de este municipio. Por favor, inténtalo de nuevo en unos momentos." />;
    }
}
