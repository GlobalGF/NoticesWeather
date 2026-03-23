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

import { BatteryNeedsCalculator } from "@/components/ui/BatteryNeedsCalculator";
import { SurplusCompensationCalculator } from "@/components/ui/SurplusCompensationCalculator";
import { PanelCountCalculator } from "@/components/ui/PanelCountCalculator";
import { SolarFinancingCalculator } from "@/components/ui/SolarFinancingCalculator";

import { NearbyMunicipalityCards } from "@/components/ui/NearbyMunicipalityCards";
import GeoDirectory from "@/components/ui/GeoDirectory";

import { LiveUpdateTime } from "@/components/ui/LiveUpdateTime";
import Fallback from "@/components/solar/Fallback";

import { getMunicipioBySlug, getWeatherBySlug, getNearbyMunicipiosEnergiaByProvince, getPrecioLuzHoy } from "@/lib/data/solar";

type Props = {
    params: Promise<{ municipio: string }>;
};

const fmt = (v: number | null | undefined) => v ? new Intl.NumberFormat('es-ES').format(v) : "";
const fmtEur = (v: number | null | undefined) => v ? new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(v) : "";


export async function generateStaticParams() {
    return safeGenerateStaticParams(async () => {
        const budget = getStaticPrebuildBudget("PSEO_PREBUILD_MUNICIPIOS", 1200);
        const top = await getTopMunicipalitiesByPriority(budget);
        return top.map((m) => ({ municipio: m.slug }));
    });
}


export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { municipio: rawMunicipio } = await params;
    const slug = tryParseSlug(decodeURIComponent(rawMunicipio).toLowerCase());
    if (!slug) return {};
    const data = await getMunicipioBySlug(slug);
    if (!data) return {};

    const year = new Date().getFullYear();
    const title = `Placas solares en ${data.municipio} \u2013 Ahorro, ayudas y rentabilidad ${year}`;
    const description = `Instala paneles solares en ${data.municipio} (${data.provincia}): ${fmt(data.horas_sol)} horas de sol, ahorro estimado de ${fmtEur(data.ahorro_estimado)} al a\u00f1o${data.bonificacion_ibi ? ` y ${data.bonificacion_ibi}% de bonificaci\u00f3n IBI` : ""}.`;

    return {
        title,
        description,
        openGraph: { title, description },
        alternates: { canonical: `/placas-solares/${slug}` },
    };
}

/* ---------- page ---------- */

export default async function PlacasSolaresMunicipioPage({ params }: Props) {
    const { municipio: rawMunicipio } = await params;
    const slug = tryParseSlug(decodeURIComponent(rawMunicipio).toLowerCase()) || decodeURIComponent(rawMunicipio).toLowerCase();
    const municipio = await getMunicipioBySlug(slug);
    const weather = await getWeatherBySlug(slug);

    if (!municipio) return <Fallback message="No se encontró el municipio." />;
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

    const ahorroHora = precioLuz * 4 * 0.20;
    const horasSol = municipio.horas_sol ?? 1800;
    const ahorroAnual = municipio.ahorro_estimado ?? Math.round(horasSol * ahorroHora);
    const payback = municipio.precio_instalacion_medio_eur && ahorroAnual > 0
        ? Math.round(municipio.precio_instalacion_medio_eur / ahorroAnual) : null;

    return (
        <WeatherProvider municipio={municipio.municipio} municipioSlug={slug}>
            <main className="bg-slate-50 min-h-screen font-sans pb-16">

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
                                    {municipio.municipio}
                                    <span className="text-slate-400 font-normal"> · {municipio.provincia}</span>
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
                        <div className="lg:col-span-2 space-y-8">
                            <CroUrgencyBanner municipio={municipio.municipio} />

                            <LiveSolarCalculator
                                municipio={municipio.municipio}
                                precioMedioLuz={precioLuz}
                            />

                            <SolarWeatherWidget municipio={municipio.municipio} />

                            <DynamicSeoBlock
                                municipio={municipio.municipio}
                                provincia={municipio.provincia}
                                irradiacionAnual={municipio.irradiacion_solar}
                                precioMedioLuz={precioLuz}
                            />

                            {/* Battery Needs */}
                            <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mt-8">
                                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                                    <span aria-hidden="true">🔋</span> Calculadora de Baterías
                                </h2>
                                <BatteryNeedsCalculator
                                    municipio={municipio.municipio}
                                    annualSunHours={municipio.horas_sol ?? 2000}
                                />
                            </section>

                            <PanelCountCalculator 
                                municipio={municipio.municipio}
                                horasSolAnuales={municipio.horas_sol ?? 1800}
                            />
                            
                            <SurplusCompensationCalculator
                                municipio={municipio.municipio}
                            />
                            
                            <SolarFinancingCalculator
                                municipio={municipio.municipio}
                                costeMedio={municipio.precio_instalacion_medio_eur ?? 5000}
                                ahorroAnual={ahorroAnual}
                            />

                            {/* Related municipalities */}
                            <NearbyMunicipalityCards items={nearbyItems} currentMunicipio={municipio.municipio} />

                            <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 overflow-hidden">
                                <h2 className="text-xl font-bold text-slate-900 mb-6">Explora otras provincias</h2>
                                <GeoDirectory level="provincias" baseRoute="/placas-solares" />
                            </section>
                        </div>

                        {/* Right Column */}
                        <div className="lg:col-span-1 space-y-6">
                            {/* Local Stats Box */}
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="bg-slate-900 px-5 py-4">
                                    <h3 className="text-lg font-bold text-white">Datos Técnicos {municipio.municipio}</h3>
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
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-slate-500">Bonificación IBI</span>
                                        <span className="font-semibold text-slate-900">{municipio.bonificacion_ibi ? `${municipio.bonificacion_ibi}%` : 'No'}</span>
                                    </div>
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
}