import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { tryParseSlug } from "@/lib/utils/params";
import { isBlockedSlug } from "@/lib/utils/validate-slug";
import { slugify } from "@/lib/utils/slug";
import { safeGenerateStaticParams } from "@/lib/pseo/safe-static-params";
import { getStaticPrebuildBudget } from "@/lib/pseo/static-budget";
import { cachePolicy } from "@/lib/cache/policy";

import { WeatherProvider } from "@/components/providers/WeatherProvider";
import { CroUrgencyBanner } from "@/components/ui/CroUrgencyBanner";
import { SolarWeatherWidget } from "@/components/ui/SolarWeatherWidget";
import { DynamicSeoBlock } from "@/components/ui/DynamicSeoBlock";
import { LiveSolarCalculator } from "@/components/ui/LiveSolarCalculator";
import { LeadForm } from "@/components/ui/LeadForm";
import { getMunicipioBySlug, getSeoSnapshotBySlug, getWeatherForLocation, getNearbyMunicipiosEnergiaByProvince, getPrecioLuzHoy, getTopMunicipiosEnergia } from "@/lib/data/solar";
import dynamic from "next/dynamic";

/* ── Lazy Loaded Components (below the fold) ── */
const NearbyMunicipalityCards = dynamic(() => import("@/components/ui/NearbyMunicipalityCards").then(mod => mod.NearbyMunicipalityCards));
const GeoDirectory = dynamic(() => import("@/components/ui/GeoDirectory"));
const FaqAccordion = dynamic(() => import("@/components/ui/FaqAccordion").then(mod => mod.FaqAccordion));
const TrustMethodologyBlock = dynamic(() => import("@/components/ui/TrustMethodologyBlock").then(mod => mod.TrustMethodologyBlock));
const InstallationProcessTimeline = dynamic(() => import("@/components/ui/InstallationProcessTimeline").then(mod => mod.InstallationProcessTimeline));
const LocalInstallationCases = dynamic(() => import("@/components/ui/LocalInstallationCases").then(mod => mod.LocalInstallationCases));
const CityClimateSolarProfile = dynamic(() => import("@/components/ui/CityClimateSolarProfile").then(mod => mod.CityClimateSolarProfile));
const SubsidiesSeoBlock = dynamic(() => import("@/components/ui/SubsidiesSeoBlock").then(mod => mod.SubsidiesSeoBlock));

/* ── SEO: Schema, FAQ, Server SEO Block ── */
import { buildSolarEnergyPageSchema, buildMunicipioFaqs } from "@/lib/seo/schema-org";
import { buildMetadata } from "@/lib/seo/metadata-builder";
import { ServerSeoBlock } from "@/components/ui/ServerSeoBlock";

export const revalidate = cachePolicy.page.solarCity;
export const dynamicParams = true;

type Props = {
    params: { municipio: string };
};

const fmt = (v: number | null | undefined) => {
    if (v === null || v === undefined || isNaN(Number(v))) return "0";
    try {
        return new Intl.NumberFormat('es-ES').format(Number(v));
    } catch {
        return String(v);
    }
};

const fmtEur = (v: number | null | undefined) => {
    if (v === null || v === undefined || isNaN(Number(v))) return "0 €";
    try {
        return new Intl.NumberFormat('es-ES', { 
            style: 'currency', 
            currency: 'EUR', 
            maximumFractionDigits: 0 
        }).format(Number(v));
    } catch {
        return `${v} €`;
    }
};

const cleanLocationName = (name: string) => {
    if (!name) return "";
    if (name.includes("/")) {
        const parts = name.split("/");
        // In many datasets, it's "Bilingual/Spanish" or "Original/Official"
        // We prefer the second part if available, as it's often the more recognizable Spanish name
        return (parts[1] || parts[0]).trim();
    }
    return name.trim();
};


export async function generateStaticParams() {
    return safeGenerateStaticParams(async () => {
        const budget = getStaticPrebuildBudget("PSEO_PREBUILD_MUNICIPIOS", 400);
        const top = await getTopMunicipiosEnergia(budget);
        
        // Final sanity filter: only pass slugs that are truly URL-safe
        const urlSafeRegex = /^[a-z0-9-]+$/;
        return top
            .filter(m => m.slug && urlSafeRegex.test(m.slug))
            .map((m) => ({ municipio: m.slug }));
    });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const rawMunicipio = params.municipio;
    const year = new Date().getFullYear();
    const defaultTitle = `Instalación de Placas Solares \u2013 Ahorro y subvenciones ${year}`;
    const defaultDescription = "Descubre cuánto puedes ahorrar instalando placas solares en tu municipio. Calculadora de rentabilidad, ayudas activas y presupuestos personalizados.";

    try {
        if (!rawMunicipio) return { title: defaultTitle, description: defaultDescription };
        
        const decoded = decodeURIComponent(rawMunicipio).toLowerCase();
        const slug = tryParseSlug(decoded) || decoded;

        if (isBlockedSlug(slug)) notFound();
        
        const data = await getMunicipioBySlug(slug);
        if (!data) {
            return { 
                title: defaultTitle, 
                description: defaultDescription,
                alternates: { canonical: `/placas-solares/${rawMunicipio}` }
            };
        }

        const muniName = cleanLocationName(data.municipio || "tu localidad");
        const provName = cleanLocationName(data.provincia || "");
        
        const title = `Placas solares en ${muniName} (${year})`;
        const description = `Instala paneles solares en ${muniName}${provName && provName !== muniName ? ` (${provName})` : ""}: ${fmt(data.horas_sol)} horas de sol, ahorro estimado de ${fmtEur(data.ahorro_estimado)} al a\u00f1o${data.bonificacion_ibi ? ` y ${data.bonificacion_ibi}% de bonificaci\u00f3n IBI` : ""}.`;

        return buildMetadata({
            title,
            description,
            pathname: `/placas-solares/${slug}`,
        });
    } catch (error) {
        console.error("[generateMetadata] Failed to generate metadata:", error);
        
        const fallbackName = rawMunicipio 
          ? rawMunicipio.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
          : "tu localidad";

        return buildMetadata({ 
            title: `Placas solares en ${fallbackName} (${year})`, 
            description: `Consulta el ahorro y disponibilidad para instalación de placas solares en ${fallbackName}. Datos y presupuestos sin compromiso garantizados.`,
            pathname: `/placas-solares/${rawMunicipio}`
        });
    }
}

/* ---------- page ---------- */

export default async function PlacasSolaresMunicipioPage({ params }: Props) {
    const rawMunicipio = params.municipio;
    
    try {
        console.info(`[PlacasSolaresMunicipioPage] 1. START for: ${rawMunicipio}`);
        if (!rawMunicipio) notFound();

        const decoded = decodeURIComponent(rawMunicipio).toLowerCase();
        const slug = tryParseSlug(decoded) || decoded;

        if (isBlockedSlug(slug)) notFound();
        
        console.info(`[PlacasSolaresMunicipioPage] 2. FETCHING DB for slug: ${slug}`);
        const [municipio, seoSnapshot] = await Promise.all([
            getMunicipioBySlug(slug),
            getSeoSnapshotBySlug(slug)
        ]);

        if (!municipio) {
            console.warn(`[PlacasSolaresMunicipioPage] 2b. NOT FOUND in DB`);
            notFound();
        }

        // SANITY CHECK: If critical fields are missing, don't crash, show 404
        if (!municipio.municipio || !municipio.provincia) {
            console.error(`[PlacasSolaresMunicipioPage] 2c. CRITICAL DATA MISSING for ${slug}`);
            notFound();
        }

        console.info(`[PlacasSolaresMunicipioPage] 3. FETCHING WEATHER for: ${municipio.municipio}`);
        const weather = await getWeatherForLocation(municipio.municipio, municipio.provincia);
        if (!weather) {
            console.warn(`[PlacasSolaresMunicipioPage] 3b. Weather failed (continuing with fallback)`);
        }

        // Fetch nearby
        console.info(`[PlacasSolaresMunicipioPage] 4. FETCHING NEARBY for province: ${municipio.provincia}`);
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

        console.info(`[PlacasSolaresMunicipioPage] 5. FETCHING ENERGY PRICE`);
        const precioLuz = await getPrecioLuzHoy();

        console.info(`[PlacasSolaresMunicipioPage] 6. CALCULATING STATS`);
        const ahorroHora = Number(precioLuz) * 4 * 0.20;
        const horasSol = Number(municipio.horas_sol ?? 1800);
        const ahorroAnual = Number(municipio.ahorro_estimado ?? Math.round(horasSol * ahorroHora));
        const precioInstalacion = Number(municipio.precio_instalacion_medio_eur ?? 6500);
        const payback = ahorroAnual > 0 ? Math.round(precioInstalacion / ahorroAnual) : null;

        console.info(`[PlacasSolaresMunicipioPage] 7. PREPARING SCHEMA & RENDER`);
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

        // Pre-calculate saving stats for the dashboard
        const savingsMonth = Math.round(ahorroAnual / 12);

        console.info(`[PlacasSolaresMunicipioPage] 8. RENDING JSX`);
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
                            <span className="text-slate-200">{cleanLocationName(municipio.municipio)}</span>
                        </nav>
                        <div className="flex items-center gap-3 text-xs text-slate-400">
                            <LiveUpdateTime />
                        </div>
                    </div>

                    <div className="mx-auto max-w-5xl px-4 pb-6 pt-2">
                        <div className="flex flex-wrap items-end gap-3">
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-1">
                                    Instalación fotovoltaica · Panel solar · Rentabilidad y ayudas
                                </p>
                                <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
                                    Placas solares en {cleanLocationName(municipio.municipio)}
                                    {cleanLocationName(municipio.municipio) !== cleanLocationName(municipio.provincia) && (
                                        <span className="text-slate-400 font-normal text-lg sm:text-xl"> · {cleanLocationName(municipio.provincia)}</span>
                                    )}
                                </h1>
                                <p className="text-sm text-slate-300 mt-1.5">
                                    Ahorra hasta {fmtEur(ahorroAnual)}/año · {fmt(municipio.horas_sol)} horas de sol · Amortización en {payback ?? "6–8"} años
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── KPI Strip ───────────── */}
                <div className="bg-white border-b border-slate-200 shadow-sm relative z-10 -mb-12">
                    <div className="mx-auto max-w-5xl px-4 py-0 grid grid-cols-2 sm:grid-cols-4 divide-x divide-slate-100">
                        {[
                            { label: "Irradiación solar", value: `${fmt(municipio.irradiacion_solar)} kWh/m²`, status: "Panel fotovoltaico", statusClass: "bg-slate-100 text-slate-500 border-slate-200" },
                            { label: "Horas de sol anuales", value: `${fmt(municipio.horas_sol)} h`, status: "PVGIS · Comisión Europea", statusClass: "bg-slate-100 text-slate-500 border-slate-200" },
                            { label: "Ahorro con placas solares", value: `${fmt(ahorroAnual)} €/año`, status: `Instalación fotovoltaica`, statusClass: "bg-blue-100 text-blue-700 border-blue-200" },
                            { label: "Amortización paneles", value: payback ? `${payback} años` : "—", status: "ROI instalación solar", statusClass: "bg-emerald-100 text-emerald-700 border-emerald-200" },
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
                                snapshot={seoSnapshot}
                                habitantes={municipio.habitantes}
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
                                comunidadSlug={slugify(municipio.comunidad_autonoma ?? municipio.provincia ?? "andalucia")}
                                provinciaSlug={slugify(municipio.provincia || "sevilla")}
                                bonificacionIbi={municipio.bonificacion_ibi}
                                nearbyItems={nearbyItems}
                            />

                            {/* City-specific climate & solar profile — high differentiation */}
                            <CityClimateSolarProfile
                                municipio={municipio.municipio}
                                provincia={municipio.provincia}
                                comunidadAutonoma={municipio.comunidad_autonoma ?? municipio.provincia ?? ""}
                                irradiacionSolar={municipio.irradiacion_solar}
                                horasSol={municipio.horas_sol}
                                ahorroEstimado={ahorroAnual}
                                bonificacionIbi={municipio.bonificacion_ibi}
                                precioLuz={precioLuz}
                                habitantes={municipio.habitantes}
                            />

                            {/* Realistic installation case studies (3 property types) */}
                            <LocalInstallationCases
                                municipio={municipio.municipio}
                                provincia={municipio.provincia}
                                comunidadAutonoma={municipio.comunidad_autonoma ?? municipio.provincia ?? ""}
                                irradiacionSolar={municipio.irradiacion_solar}
                                horasSol={municipio.horas_sol}
                                ahorroEstimado={ahorroAnual}
                                bonificacionIbi={municipio.bonificacion_ibi}
                                precioInstalacionMin={municipio.precio_instalacion_min_eur}
                                precioInstalacionMedio={municipio.precio_instalacion_medio_eur}
                                precioInstalacionMax={municipio.precio_instalacion_max_eur}
                                eurPorWatio={municipio.eur_por_watio}
                                precioLuz={precioLuz}
                                habitantes={municipio.habitantes}
                            />

                            {/* Step-by-step installation guide with local permits */}
                            <InstallationProcessTimeline
                                municipio={municipio.municipio}
                                provincia={municipio.provincia}
                                comunidadAutonoma={municipio.comunidad_autonoma ?? municipio.provincia ?? ""}
                                irradiacionSolar={municipio.irradiacion_solar}
                                horasSol={municipio.horas_sol}
                                bonificacionIbi={municipio.bonificacion_ibi}
                                precioInstalacionMedio={municipio.precio_instalacion_medio_eur}
                                habitantes={municipio.habitantes}
                            />

                            {/* CTA Calculadoras Avanzadas */}
                            <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-950 rounded-2xl shadow-xl mt-8 p-8 md:p-10 border border-indigo-900">
                                {/* Decorative elements */}
                                <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400 opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500 opacity-20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4"></div>

                                <div className="relative z-10 lg:flex items-center justify-between gap-8">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500/30 text-indigo-400 text-xs shadow-inner">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                                            </span>
                                            <p className="text-sm font-bold tracking-widest uppercase text-indigo-300">Simuladores Avanzados</p>
                                        </div>
                                        <h2 className="text-2xl md:text-3xl font-black text-white leading-tight tracking-tight mb-4">
                                            Calculadoras Solares para {municipio.municipio}
                                        </h2>
                                        <p className="text-slate-300 text-base leading-relaxed mb-6 max-w-lg font-light">
                                            Dimensiona tu instalación fotovoltaica: calcula el número exacto de paneles solares, simula la financiación de tus placas y estima los ingresos por verter excedentes a la red eléctrica en {municipio.provincia}.
                                        </p>
                                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                                            <li className="flex items-center gap-2 text-sm text-slate-400">
                                                <svg className="h-4 w-4 text-emerald-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>
                                                Dimensionador de Paneles Solares
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

                            <AntiCommercialWarning 
                                municipio={municipio.municipio} 
                                irradiacionAnual={municipio.irradiacion_solar}
                                horasSol={municipio.horas_sol}
                            />

                            {/* E-E-A-T: Trust signals, methodology, data sources */}
                            <TrustMethodologyBlock
                                municipio={municipio.municipio}
                                provincia={municipio.provincia}
                                comunidadAutonoma={municipio.comunidad_autonoma ?? municipio.provincia ?? ""}
                                irradiacionSolar={municipio.irradiacion_solar}
                                horasSol={municipio.horas_sol}
                                ahorroEstimado={ahorroAnual}
                                bonificacionIbi={municipio.bonificacion_ibi}
                                precioLuz={precioLuz}
                                habitantes={municipio.habitantes}
                            />

                            {/* ── FAQ Accordion (SSR — visible to Googlebot) ── */}
                            <FaqAccordion faqs={faqs} municipio={municipio.municipio} />

                            {/* Related municipalities */}
                            <NearbyMunicipalityCards items={nearbyItems} currentMunicipio={municipio.municipio} />

                            <SiloNavigation
                                currentSilo="placas-solares"
                                municipioName={cleanLocationName(municipio.municipio)}
                                municipioSlug={slug}
                                provinciaName={municipio.provincia}
                                comunidadName={municipio.comunidad_autonoma || undefined}
                            />

                            <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 overflow-hidden">
                                <h2 className="text-xl font-bold text-slate-900 mb-6">Instalación de paneles solares y placas fotovoltaicas por provincia</h2>
                                <GeoDirectory level="provincias" baseRoute="/placas-solares" queryParam="provincia" />
                            </section>
                        </div>

                        {/* Right Column */}
                        <div className="lg:col-span-1 space-y-6">
                            {/* Local Stats Box with source citations */}
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="bg-slate-900 px-5 py-4">
                                    <h3 className="text-lg font-bold text-white">Datos solares y fotovoltaicos de {cleanLocationName(municipio.municipio)}</h3>
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
                                        <span className="text-sm text-slate-500">Coste instalación solar</span>
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
                                    municipio={cleanLocationName(municipio.municipio)}
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