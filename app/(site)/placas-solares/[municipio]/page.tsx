import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { tryParseSlug } from "@/lib/utils/params";
import { safeGenerateStaticParams } from "@/lib/pseo/safe-static-params";
import { getStaticPrebuildBudget } from "@/lib/pseo/static-budget";
import { getTopMunicipalitiesByPriority } from "@/data/repositories/municipalities.repo";

import { WeatherProvider } from "@/components/providers/WeatherProvider";
import { CroUrgencyBanner } from "@/components/ui/CroUrgencyBanner";
import { SolarWeatherWidget } from "@/components/ui/SolarWeatherWidget";
import { DynamicSeoBlock } from "@/components/ui/DynamicSeoBlock";
import { LiveSolarCalculator } from "@/components/ui/LiveSolarCalculator";
import { LeadForm } from "@/components/ui/LeadForm";
import { SubsidiesSeoBlock } from "@/components/ui/SubsidiesSeoBlock";

import { BatteryNeedsCalculator } from "@/components/ui/BatteryNeedsCalculator";
import { SurplusCompensationCalculator } from "@/components/ui/SurplusCompensationCalculator";
import { PanelCountCalculator } from "@/components/ui/PanelCountCalculator";
import { SolarFinancingCalculator } from "@/components/ui/SolarFinancingCalculator";

import { NearbyMunicipalityCards } from "@/components/ui/NearbyMunicipalityCards";
import GeoDirectory from "@/components/ui/GeoDirectory";

import { LiveUpdateTime } from "@/components/ui/LiveUpdateTime";
import Fallback from "@/components/solar/Fallback";

import { getMunicipioBySlug, getWeatherForLocation, getNearbyMunicipiosEnergiaByProvince, getPrecioLuzHoy } from "@/lib/data/solar";

/* ── SEO: Schema, FAQ, Server SEO Block ── */
import { buildSolarEnergyPageSchema, buildMunicipioFaqs } from "@/lib/seo/schema-org";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { ServerSeoBlock } from "@/components/ui/ServerSeoBlock";

type Props = {
    params: Promise<{ municipio: string }>;
};

const fmt = (v: number | null | undefined) => v ? new Intl.NumberFormat('es-ES').format(v) : "";
const fmtEur = (v: number | null | undefined) => v ? new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(v) : "";


export async function generateStaticParams() {
    return safeGenerateStaticParams(async () => {
        const budget = getStaticPrebuildBudget("PSEO_PREBUILD_MUNICIPIOS", 400);
        const top = await getTopMunicipalitiesByPriority(budget);
        return top.map((m) => ({ municipio: m.slug }));
    });
}


export async function generateMetadata({ params }: Props): Promise<Metadata> {
    try {
        const { municipio: rawMunicipio } = await params;
        const slug = tryParseSlug(decodeURIComponent(rawMunicipio).toLowerCase()) || decodeURIComponent(rawMunicipio).toLowerCase();
        
        if (!slug) return {};
        
        const data = await getMunicipioBySlug(slug);
        if (!data) return {};

        const year = new Date().getFullYear();
        const muniName = data.municipio || "tu localidad";
        const provName = data.provincia || "";
        
        const title = `Placas solares en ${muniName} \u2013 Ahorro, ayudas y rentabilidad ${year}`;
        const description = `Instala paneles solares en ${muniName}${provName ? ` (${provName})` : ""}: ${fmt(data.horas_sol)} horas de sol, ahorro estimado de ${fmtEur(data.ahorro_estimado)} al a\u00f1o${data.bonificacion_ibi ? ` y ${data.bonificacion_ibi}% de bonificaci\u00f3n IBI` : ""}.`;

        return {
            title,
            description,
            openGraph: { title, description },
            alternates: { canonical: `/placas-solares/${slug}` },
        };
    } catch (error) {
        console.error("[generateMetadata] Failed to generate metadata:", error);
        return { title: "Instalación de Placas Solares" };
    }
}

/* ---------- page ---------- */

export default async function PlacasSolaresMunicipioPage({ params }: Props) {
    const { municipio: rawMunicipio } = await params;
    
    try {
        const slug = tryParseSlug(decodeURIComponent(rawMunicipio).toLowerCase()) || decodeURIComponent(rawMunicipio).toLowerCase();
        const municipio = await getMunicipioBySlug(slug);

        if (!municipio) return <Fallback message="No se encontró el municipio." />;

        const weather = await getWeatherForLocation(municipio.municipio, municipio.provincia);
        if (!weather) return <Fallback message="No se pudo cargar el clima actual." />;

        // Fetch nearby
        const nearbyMunicipios = await getNearbyMunicipiosEnergiaByProvince(municipio.provincia, 6);
        const nearbyItems = nearbyMunicipios
            .filter(m => m.slug !== slug)
            .slice(0, 3)
            .map(m => ({
                slug: m.slug,
                municipio: m.municipio,
                provincia: m.provincia,
                ahorroEstimado: m.ahorro_estimado,
                irradiacionSolar: m.irradiacion_solar,
                bonificacionIbi: m.bonificacion_ibi,
            }));

        const precioLuz = await getPrecioLuzHoy();

        const ahorroHora = Number(precioLuz) * 4 * 0.20;
        const horasSol = Number(municipio.horas_sol ?? 1800);
        const ahorroAnual = Number(municipio.ahorro_estimado ?? Math.round(horasSol * ahorroHora));
        const payback = municipio.precio_instalacion_medio_eur && ahorroAnual > 0
            ? Math.round(Number(municipio.precio_instalacion_medio_eur) / ahorroAnual) : null;

        /* ── Build JSON-LD structured data ── */
        const schemaData = {
            municipio: municipio.municipio || "Localidad",
            provincia: municipio.provincia || "",
            comunidadAutonoma: municipio.comunidad_autonoma ?? municipio.provincia ?? "",
            ahorroEstimado: ahorroAnual || 0,
            irradiacionSolar: Number(municipio.irradiacion_solar ?? 1700),
            precioInstalacionMedio: municipio.precio_instalacion_medio_eur ? Number(municipio.precio_instalacion_medio_eur) : null,
            bonificacionIbi: municipio.bonificacion_ibi ? Number(municipio.bonificacion_ibi) : null,
            subvencionAutoconsumo: municipio.subvencion_autoconsumo ? Number(municipio.subvencion_autoconsumo) : null,
        };
        const faqs = buildMunicipioFaqs(schemaData);
        const jsonLd = buildSolarEnergyPageSchema({
            data: schemaData,
            pagePath: `/placas-solares/${slug}`,
            faqs,
        });

    return (
        <WeatherProvider municipio={municipio.municipio} provincia={municipio.provincia} municipioSlug={slug}>
            {/* ── JSON-LD Structured Data (visible to Googlebot) ── */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <main className="bg-slate-50 min-h-screen font-sans pb-16 overflow-x-hidden">

                {/* ── Page Header (ESIOS style) ───────────── */}
                <div className="bg-slate-900 text-white">
                    <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between flex-wrap gap-2">
                        <nav className="text-xs text-slate-400 flex gap-1.5 items-center">
                            <a href="/" className="hover:text-white transition-colors">Inicio</a>
                            <span>›</span>
                            <a href="/placas-solares" className="hover:text-white transition-colors">Energía Solar</a>
                            <span>›</span>
                            <span className="text-slate-200">{municipio.municipio}</span>
                        </nav>
                        <div className="flex items-center gap-3 text-xs text-slate-400">
                            <LiveUpdateTime />
                        </div>
                    </div>

                    <div className="mx-auto max-w-5xl px-4 pb-6 pt-2">
                        <div className="flex flex-wrap items-end gap-3">
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-1">
                                    Calculadora solar · Rentabilidad y ayudas
                                </p>
                                <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
                                    Placas solares en {municipio.municipio}
                                    <span className="text-slate-400 font-normal text-lg sm:text-xl"> · {municipio.provincia}</span>
                                </h1>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── KPI Strip ───────────── */}
                <div className="bg-white border-b border-slate-200 shadow-sm relative z-10 -mb-12">
                    <div className="mx-auto max-w-5xl px-4 py-0 grid grid-cols-2 sm:grid-cols-4 divide-x divide-slate-100">
                        {[
                            { label: "Irradiación solar", value: `${fmt(municipio.irradiacion_solar)} kWh/m²`, status: "Dato estimado", statusClass: "bg-slate-100 text-slate-500 border-slate-200" },
                            { label: "Horas de sol anuales", value: `${fmt(municipio.horas_sol)} h`, status: "PVGIS · Comisión Europea", statusClass: "bg-slate-100 text-slate-500 border-slate-200" },
                            { label: "Ahorro estimado anual", value: `${fmt(ahorroAnual)} €`, status: `Potencial máximo`, statusClass: "bg-blue-100 text-blue-700 border-blue-200" },
                            { label: "Periodo de retorno", value: payback ? `${payback} años` : "—", status: "ROI estimado", statusClass: "bg-emerald-100 text-emerald-700 border-emerald-200" },
                        ].map((k) => (
                            <div key={k.label} className="px-4 sm:px-6 py-4 bg-white">
                                <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">{k.label}</p>
                                <p className="mt-1 text-xl font-bold text-slate-900 tabular-nums">{k.value}</p>
                                <span className={`mt-1 inline-block rounded border px-1.5 py-0.5 text-xs font-semibold ${k.statusClass}`}>{k.status}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Main content (2/3 + 1/3 layout) ───────────── */}
                <div className="mx-auto max-w-5xl px-4 pt-20">
                    <div className="grid gap-8 lg:grid-cols-3">
                        {/* Left Column */}
                        <div className="lg:col-span-2 space-y-8 min-w-0">
                            <CroUrgencyBanner municipio={municipio.municipio} />

                            <LiveSolarCalculator
                                municipio={municipio.municipio}
                                precioMedioLuz={precioLuz}
                            />

                            <SolarWeatherWidget municipio={municipio.municipio} />

                            {/* Server-rendered SEO text (visible to Googlebot) */}
                            <ServerSeoBlock
                                municipio={municipio.municipio}
                                provincia={municipio.provincia}
                                irradiacionAnual={municipio.irradiacion_solar}
                                horasSol={municipio.horas_sol}
                                ahorroEstimado={ahorroAnual}
                                bonificacionIbi={municipio.bonificacion_ibi}
                                precioMedioLuz={precioLuz}
                                weather={weather}
                            />

                            {/* Client-side dynamic block (additional content, updates with live weather) */}
                            <DynamicSeoBlock
                                municipio={municipio.municipio}
                                provincia={municipio.provincia}
                                irradiacionAnual={municipio.irradiacion_solar}
                                precioMedioLuz={precioLuz}
                            />

                            {/* Subvenciones y Bonificaciones Dynamic Block */}
                            <SubsidiesSeoBlock
                                municipio={municipio.municipio}
                                provincia={municipio.provincia || ""}
                                slug={slug}
                                comunidadSlug={tryParseSlug(municipio.comunidad_autonoma ?? municipio.provincia ?? "") || decodeURIComponent(rawMunicipio).split('-')[1] || "andalucia"}
                                provinciaSlug={tryParseSlug(municipio.provincia || "") || decodeURIComponent(rawMunicipio).split('-')[1] || "sevilla"}
                                bonificacionIbi={municipio.bonificacion_ibi}
                                nearbyItems={nearbyItems}
                            />

                            {/* CTA Calculadoras Avanzadas */}
                            <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-950 rounded-2xl shadow-xl mt-8 p-8 md:p-10 border border-indigo-900">
                                {/* Decorative elements */}
                                <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400 opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500 opacity-20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4"></div>

                                <div className="relative z-10 lg:flex items-center justify-between gap-8">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500/30 text-indigo-400 text-xs shadow-inner">⚡</span>
                                            <p className="text-sm font-bold tracking-widest uppercase text-indigo-300">Simuladores Avanzados</p>
                                        </div>
                                        <h2 className="text-2xl md:text-3xl font-black text-white leading-tight tracking-tight mb-4">
                                            Calculadoras Solares para {municipio.municipio}
                                        </h2>
                                        <p className="text-slate-300 text-base leading-relaxed mb-6 max-w-lg font-light">
                                            Descubre el número exacto de placas que necesitas, calcula el impacto real de financiar tu instalación y estima los ingresos por verter tus excedentes a la red en {municipio.provincia}.
                                        </p>
                                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                                            <li className="flex items-center gap-2 text-sm text-slate-400">
                                                <svg className="h-4 w-4 text-emerald-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>
                                                Dimensionador de Paneles
                                            </li>
                                            <li className="flex items-center gap-2 text-sm text-slate-400">
                                                <svg className="h-4 w-4 text-emerald-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>
                                                Simulador de Financiación
                                            </li>
                                            <li className="flex items-center gap-2 text-sm text-slate-400">
                                                <svg className="h-4 w-4 text-emerald-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>
                                                Monetización de Excedentes
                                            </li>
                                            <li className="flex items-center gap-2 text-sm text-slate-400">
                                                <svg className="h-4 w-4 text-emerald-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>
                                                Calculadora de Baterías
                                            </li>
                                        </ul>
                                    </div>
                                    <div className="shrink-0 mt-6 lg:mt-0 flex lg:flex-col gap-4">
                                        <a
                                            href={`/calculadoras?m=${slug}`}
                                            className="group relative inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 px-8 py-4 text-sm font-bold text-amber-950 shadow-lg shadow-yellow-500/30 transition-all hover:scale-105 hover:shadow-yellow-500/50"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:rotate-12"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" /></svg>
                                            Probar Calculadoras
                                            <span className="absolute -inset-0.5 -z-10 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 opacity-0 blur backdrop-filter transition-opacity duration-300 group-hover:opacity-60"></span>
                                        </a>
                                    </div>
                                </div>
                            </section>

                            {/* ── FAQ Accordion (SSR — visible to Googlebot) ── */}
                            <FaqAccordion faqs={faqs} municipio={municipio.municipio} />

                            {/* Related municipalities */}
                            <NearbyMunicipalityCards items={nearbyItems} currentMunicipio={municipio.municipio} />

                            <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 overflow-hidden">
                                <h2 className="text-xl font-bold text-slate-900 mb-6">Más localidades con placas solares por provincia</h2>
                                <GeoDirectory level="provincias" baseRoute="/placas-solares" />
                            </section>
                        </div>

                        {/* Right Column */}
                        <div className="lg:col-span-1 space-y-6">
                            {/* Local Stats Box with source citations */}
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="bg-slate-900 px-5 py-4">
                                    <h3 className="text-lg font-bold text-white">Datos solares de {municipio.municipio}</h3>
                                </div>
                                <div className="p-5 space-y-4">
                                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                                        <span className="text-sm text-slate-500">Horas Sol/Año</span>
                                        <span className="font-semibold text-slate-900">{fmt(municipio.horas_sol)}</span>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                                        <span className="text-sm text-slate-500">Irradiación</span>
                                        <span className="font-semibold text-slate-900">{fmt(municipio.irradiacion_solar)} kWh/m²</span>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                                        <span className="text-sm text-slate-500">Coste Medio Instal.</span>
                                        <span className="font-semibold text-slate-900">{municipio.precio_instalacion_medio_eur ? `${fmt(municipio.precio_instalacion_medio_eur)}€` : 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                                        <span className="text-sm text-slate-500">Bonificación IBI</span>
                                        <span className="font-semibold text-slate-900">{municipio.bonificacion_ibi ? `${municipio.bonificacion_ibi}%` : 'No'}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-slate-500">Precio PVPC hoy</span>
                                        <span className="font-semibold text-slate-900">{precioLuz.toFixed(3)} €/kWh</span>
                                    </div>
                                </div>
                                <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-100">
                                    <p className="text-[9px] text-slate-400 leading-relaxed">
                                        Fuentes: PVGIS (Comisión Europea) · ESIOS/REE · Ordenanzas municipales de {municipio.provincia}
                                    </p>
                                    <p className="text-[9px] text-slate-400 mt-0.5">
                                        Actualizado: {new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </p>
                                </div>
                            </div>

                            {/* Hook Lead Form into sidebar */}
                            <div className="sticky top-6">
                                <LeadForm
                                    municipio={municipio.municipio}
                                    municipioSlug={slug}
                                    provincia={municipio.provincia}
                                    ahorroEstimado={municipio.ahorro_estimado}
                                    irradiacionSolar={municipio.irradiacion_solar}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </WeatherProvider>
        );
    } catch (error) {
        console.error(`[PlacasSolaresMunicipioPage] Fatal crash for ${rawMunicipio}:`, error);
        return <Fallback message="Estamos experimentando dificultades técnicas cargando los datos de este municipio. Por favor, inténtalo de nuevo en unos momentos." />;
    }
}