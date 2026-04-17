/**
 * /precio-luz/[municipio] — Precio de la luz en vivo + datos solares locales
 * Design: formal energy portal (ESIOS/Bloomberg style)
 */

import { notFound, permanentRedirect } from "next/navigation";
import { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { tryParseSlug } from "@/lib/utils/params";
import { isBlockedSlug } from "@/lib/utils/validate-slug";
import { slugify, cleanMunicipalitySlug } from "@/lib/utils/slug";
import { buildMetadata } from "@/lib/seo/metadata-builder";
import { PrecioLuzWidget } from "@/components/ui/PrecioLuzWidget";
import { LeadForm } from "@/components/ui/LeadForm";
import { SiloNavigation } from "@/components/ui/SiloNavigation";
import { getProvinceHubs } from "@/lib/data/solar";
import { ProvinceHubLinks } from "@/components/ui/ProvinceHubLinks";
import { FrankEnergyBanner } from "@/components/ui/FrankEnergyBanner";

export const revalidate = 3600;
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
    subvencion_autoconsumo: number | null;
    precio_medio_luz: number | null;
    precio_instalacion_min_eur: number | null;
    precio_instalacion_medio_eur: number | null;
    precio_instalacion_max_eur: number | null;
    eur_por_watio: number | null;
};

type PrecioRow = {
    fecha: string;
    precio_kwh_media: number;
    precio_kwh_min: number;
    precio_kwh_max: number;
};

/* ── Helpers ─────────────────────────────────────────────────────── */
function nd(v: number | null | undefined, suffix = "", dec = 0): string {
    if (v == null) return "—";
    return v.toLocaleString("es-ES", { maximumFractionDigits: dec }) + suffix;
}

function cleanLocationName(name: string) {
    if (!name) return "";
    if (name.includes("/")) {
        const parts = name.split("/");
        return (parts[1] || parts[0]).trim();
    }
    return name.trim();
}

function precioColor(precio: number) {
    if (precio < 0.10) return { bg: "bg-emerald-600", text: "text-white", badge: "bg-emerald-100 text-emerald-800 border-emerald-300", label: "Muy barata" };
    if (precio < 0.15) return { bg: "bg-emerald-500", text: "text-white", badge: "bg-emerald-100 text-emerald-800 border-emerald-300", label: "Barata" };
    if (precio < 0.20) return { bg: "bg-amber-500", text: "text-white", badge: "bg-amber-100 text-amber-800 border-amber-300", label: "Precio normal" };
    if (precio < 0.28) return { bg: "bg-orange-500", text: "text-white", badge: "bg-orange-100 text-orange-800 border-orange-300", label: "Cara" };
    return { bg: "bg-red-600", text: "text-white", badge: "bg-red-100 text-red-800 border-red-300", label: "Muy cara" };
}

/* ── Metadata ────────────────────────────────────────────────────── */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const slug = tryParseSlug(params.municipio);
    if (!slug || isBlockedSlug(slug)) notFound();
    if (!hasSupabaseEnv()) return { title: "Tarifa de la Luz Hoy — Precio por Hora en Tiempo Real", description: "Consulta la tarifa de la luz hoy hora a hora. Precio PVPC actualizado ahora con datos oficiales de Red Eléctrica de España." };

    const supabase = await createSupabaseServerClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: raw } = await supabase.from("municipios_energia").select("municipio, provincia, precio_medio_luz").eq("slug", slug).single();
    const d = raw as any;
    if (!d) {
        const fallbackName = slug ? slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : "tu localidad";
        return buildMetadata({ 
            title: `Precio luz hoy en ${fallbackName} hora a hora`, 
            description: `Tarifa de la luz hoy en ${fallbackName}: precio PVPC hora a hora actualizado ahora. Datos oficiales de Red Eléctrica de España.`,
            pathname: `/precio-luz/${slug}`
        });
    }

    const muniClean = cleanLocationName(d.municipio);
    const provClean = cleanLocationName(d.provincia);

    // Force clean slug in canonical pathname
    const cleanSlug = cleanMunicipalitySlug(d.slug, slugify(d.provincia));

    // Canonical Redirect
    if (params.municipio !== cleanSlug) {
        permanentRedirect(`/precio-luz/${cleanSlug}`);
    }

    return buildMetadata({
        title: `Precio Luz hoy en ${muniClean} · Tarifa PVPC`,
        description: `Tarifa de la luz hoy en ${muniClean}: precio PVPC hora a hora actualizado ahora. Datos oficiales de Red Eléctrica. Ahorro con autoconsumo solar en ${provClean}.`,
        pathname: `/precio-luz/${cleanSlug}`,
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
export default async function PrecioLuzMunicipioPage({ params }: Props) {
    const slug = tryParseSlug(params.municipio);
    if (!slug || isBlockedSlug(slug)) notFound();
    if (!hasSupabaseEnv()) return <div className="p-10 text-center text-slate-400">Supabase no configurado.</div>;

    const supabase = await createSupabaseServerClient();

    const [{ data: munRaw }, { data: historial }, hubs] = await Promise.all([
        supabase.from("municipios_energia")
            .select("slug,municipio,provincia,comunidad_autonoma,habitantes,horas_sol,irradiacion_solar,ahorro_estimado,bonificacion_ibi,subvencion_autoconsumo,precio_medio_luz,precio_instalacion_min_eur,precio_instalacion_medio_eur,precio_instalacion_max_eur,eur_por_watio")
            .eq("slug", slug).single(),
        supabase.from("precios_electricidad_es")
            .select("fecha,precio_kwh_media,precio_kwh_min,precio_kwh_max")
            .order("fecha", { ascending: false }).limit(7),
        (async () => {
             // Forcing a fresh fetch of province name if not yet available
             const { data: mData } = await supabase.from("municipios_energia").select("provincia").eq("slug", slug).maybeSingle();
             const mName = mData as { provincia: string } | null;
             return getProvinceHubs(mName?.provincia || "", 20);
        })()
    ]);

    if (!munRaw) notFound();

    const m = munRaw as unknown as MunicipioRow;

    // REDIRECT TO CANONICAL: Ensure the URL is always the clean one
    const cleanSlug = cleanMunicipalitySlug(m.slug, slugify(m.provincia));
    if (slug !== cleanSlug) {
        permanentRedirect(`/precio-luz/${cleanSlug}`);
    }
    const history = (historial ?? []) as PrecioRow[];
    const precioHoy = history[0]?.precio_kwh_media ?? m.precio_medio_luz ?? 0.15;
    const theme = precioColor(precioHoy);

    const horasSol = m.horas_sol ?? 1800;
    const ahorroHora = precioHoy * 4 * 0.20;
    const ahorroAnual = m.ahorro_estimado ?? Math.round(horasSol * ahorroHora);
    const precioInstalacion = Number(m.precio_instalacion_medio_eur ?? 6500);
    const payback = ahorroAnual > 0 ? Math.round(precioInstalacion / ahorroAnual) : null;

    const yearNow = new Date().getFullYear();
    const now = new Date();
    const nowStr = now.toLocaleString("es-ES", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
    const mesActual = now.toLocaleString("es-ES", { month: "long" });

    return (
        <main className="bg-slate-50 min-h-screen font-sans overflow-x-hidden">

            {/* ── Page Header ─────────────────────────────────────────── */}
            <div className="bg-slate-900 text-white">
                <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between flex-wrap gap-2">
                    <nav className="text-[10px] sm:text-xs text-slate-400 flex gap-1.5 items-center">
                        <a href="/" className="hover:text-white transition-colors">Inicio</a>
                        <span className="hidden sm:inline">›</span>
                        <a href="/precio-luz" className="hover:text-white transition-colors">Precio de la Luz</a>
                        <span>›</span>
                        <span className="text-slate-200 truncate max-w-[100px] sm:max-w-none">{m.municipio}</span>
                    </nav>
                    <div className="flex items-center gap-3 text-[10px] sm:text-xs text-slate-400">
                        <span className="hidden sm:inline">Actualizado: {nowStr}</span>
                        <span className="h-3 w-px bg-slate-600 hidden sm:inline-block" />
                        <span className="hidden sm:inline-block">Fuente: REE / PVPC 2.0TD</span>
                    </div>
                </div>

                <div className="mx-auto max-w-5xl px-4 pb-6 pt-2">
                    <div className="flex flex-wrap items-end gap-3">
                        <div className="flex-1 min-w-0">
                            <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-1">
                                Precio de la electricidad · Tarifa regulada PVPC · Factura de la luz
                            </p>
                            <h1 className="text-xl sm:text-3xl font-bold text-white leading-tight">
                                Precio de la luz en {m.municipio}
                                <span className="text-slate-400 font-normal text-base sm:text-xl hidden sm:inline"> · {m.provincia}, {m.comunidad_autonoma}</span>
                            </h1>
                            {m.habitantes && (
                                <p className="mt-1 text-[10px] sm:text-xs text-slate-400">
                                    Municipio de {m.habitantes.toLocaleString("es-ES")} habitantes
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── KPI Strip ───────────────────────────────────────────── */}
            <div className="bg-white border-b border-slate-200 shadow-sm">
                <div className="mx-auto max-w-5xl px-4 py-0 grid grid-cols-2 sm:grid-cols-4 divide-x divide-slate-100">
                    {[
                        { label: "Precio PVPC medio hoy", value: `${precioHoy.toFixed(3)} €/kWh`, status: theme.label, statusClass: theme.badge },
                        { label: "Horas de sol anuales", value: nd(m.horas_sol, " h"), status: "PVGIS · Comisión Europea", statusClass: "bg-slate-100 text-slate-500 border-slate-200" },
                        { label: "Ahorro en factura", value: nd(ahorroAnual, " €/año"), status: `Instalación 4 kWp`, statusClass: "bg-blue-100 text-blue-700 border-blue-200" },
                        { label: "Amortización energía solar", value: payback ? `${payback} años` : "—", status: "ROI inversión solar", statusClass: "bg-slate-100 text-slate-500 border-slate-200" },
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
                    <span className="text-xs text-slate-500 font-semibold mr-2">Datos verificados:</span>
                    {[
                        {
                            label: "Red Eléctrica de España (REE)",
                            href: "https://www.esios.ree.es/es/pvpc",
                            cls: "border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100",
                            title: "Portal ESIOS de Red Eléctrica — consulta el PVPC en tiempo real",
                        },
                        {
                            label: "PVPC — Real Decreto 216/2014",
                            href: "https://www.boe.es/eli/es/rd/2014/03/28/216",
                            cls: "border-slate-300 text-slate-600 bg-white hover:bg-slate-50",
                            title: "Texto completo del Real Decreto 216/2014 en el BOE",
                        },
                        {
                            label: "CNMC — supervisión energética",
                            href: "https://www.cnmc.es/ambitos-de-actuacion/energia/electricidad",
                            cls: "border-slate-300 text-slate-600 bg-white hover:bg-slate-50",
                            title: "Comisión Nacional de Mercados y la Competencia — sector eléctrico",
                        },
                        {
                            label: "PVGIS · Comisión Europea",
                            href: "https://re.jrc.ec.europa.eu/pvg_tools/es/",
                            cls: "border-slate-300 text-slate-600 bg-white hover:bg-slate-50",
                            title: "Herramienta de datos solares PVGIS de la Comisión Europea",
                        },
                        {
                            label: "OMIE — mercado mayorista",
                            href: "https://www.omie.es/es/market-results/daily/daily-market/daily-hourly-prices",
                            cls: "border-slate-300 text-slate-600 bg-white hover:bg-slate-50",
                            title: "Operador del Mercado Ibérico de Energía — precios horarios",
                        },
                    ].map(b => (
                        <a
                            key={b.label}
                            href={b.href}
                            target="_blank"
                            rel="nofollow noopener noreferrer"
                            title={b.title}
                            className={`rounded border px-2 py-0.5 text-xs font-medium transition-colors cursor-pointer ${b.cls}`}
                        >
                            ↗ {b.label}
                        </a>
                    ))}
                </div>
            </div>

            {/* ── Main content ────────────────────────────────────────── */}
            <div className="mx-auto max-w-5xl px-4 py-8">
                <div className="grid gap-8 lg:grid-cols-3">

                    {/* Left column (2/3) */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Price widget */}
                        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                            <div className={`px-5 py-3 ${theme.bg}`}>
                                <p className={`text-xs font-bold uppercase tracking-widest ${theme.text} opacity-80`}>
                                    Precio PVPC hora a hora · {m.municipio}
                                </p>
                            </div>
                            <div className="p-5">
                                <PrecioLuzWidget initialPrecio={precioHoy} />
                            </div>

                            {/* Mobile-only Frank Energy Banner */}
                            <div className="lg:hidden mt-6">
                                <FrankEnergyBanner municipio={m.municipio} />
                            </div>
                        </div>

                        {/* Historical table */}
                        {history.length > 0 && (
                            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                                <div className="px-5 py-4 border-b border-slate-100">
                                    <SectionHeader
                                        title={`Evolución del precio PVPC en ${cleanLocationName(m.municipio)}`}
                                        subtitle={`Últimos ${history.length} días · Tarifa 2.0TD · España peninsular`}
                                    />
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-slate-50 text-left border-b border-slate-200">
                                                <th className="px-4 sm:px-5 py-3 text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-slate-500">Fecha</th>
                                                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 text-right hidden md:table-cell">Mín (€/kWh)</th>
                                                <th className="px-4 sm:px-5 py-3 text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-slate-500 text-right">Media (€/kWh)</th>
                                                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 text-right hidden md:table-cell">Máx (€/kWh)</th>
                                                <th className="px-4 sm:px-5 py-3 text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-slate-500">Estado</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {history.map((row) => {
                                                const t = precioColor(row.precio_kwh_media);
                                                return (
                                                    <tr key={row.fecha} className="hover:bg-slate-50 transition-colors">
                                                        <td className="px-4 sm:px-5 py-3 font-medium text-slate-700 text-xs sm:text-sm">
                                                            {new Date(row.fecha).toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short" })}
                                                        </td>
                                                        <td className="px-5 py-3 text-right tabular-nums text-emerald-700 font-mono hidden md:table-cell">{row.precio_kwh_min.toFixed(3)}</td>
                                                        <td className="px-4 sm:px-5 py-3 text-right tabular-nums font-semibold font-mono text-xs sm:text-sm">{row.precio_kwh_media.toFixed(3)}</td>
                                                        <td className="px-5 py-3 text-right tabular-nums text-red-600 font-mono hidden md:table-cell">{row.precio_kwh_max.toFixed(3)}</td>
                                                        <td className="px-4 sm:px-5 py-3">
                                                            <span className={`rounded border px-1.5 py-0.5 text-[10px] font-semibold ${t.badge}`}>{t.label}</span>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 text-xs text-slate-400">
                                    Fuente: API Red Eléctrica de España (REE) · Indicador 1001 PVPC 2.0TD
                                </div>
                            </div>
                        )}

                        {/* Regulatory context */}
                        <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
                            <div className="px-5 py-4 border-b border-slate-100">
                                <SectionHeader
                                    title={`Marco regulatorio del PVPC — ${cleanLocationName(m.municipio)}`}
                                    subtitle="Información sobre la tarifa regulada de electricidad en España"
                                />
                            </div>
                            <div className="px-5 py-4 prose prose-sm max-w-none text-slate-600">
                                <p>
                                    El <span className='font-bold'>Precio Voluntario para el Pequeño Consumidor (PVPC)</span> es la tarifa eléctrica regulada
                                    por el Estado español para suministros con potencia contratada de hasta 10 kW. Está establecido por el{" "}
                                    <span className='font-bold'>Real Decreto 216/2014</span> y supervisado por la{" "}
                                    <span className='font-bold'>Comisión Nacional de Mercados y la Competencia (CNMC)</span>.
                                </p>
                                <p className="mt-3">
                                    El precio de la luz se calcula cada día a partir de las ofertas del mercado mayorista de electricidad (OMIE),
                                    expresado en €/MWh. Es <span className='font-bold'>idéntico para toda la España peninsular</span>, independientemente del municipio.
                                    Los precios se publican a las <span className='font-bold'>20:30 CET</span> del día anterior y cambian hora a hora.
                                </p>
                                <p className="mt-3">
                                    A diferencia de las tarifas fijas del mercado libre, el PVPC varía cada hora del día según el
                                    coste real de la energía en €/MWh. Tu factura de la luz depende del consumo en kWh y la potencia
                                    contratada en kW. En las horas valle (00–08 h) el precio es más barato, mientras que en horas
                                    punta la tarifa sube. Los clientes con bono social o tarifas reguladas verán el impacto directo
                                    en su factura mensual.
                                </p>
                                <p className="mt-3">
                                    Optar por autoconsumo fotovoltaico reduce la dependencia del precio de la electricidad y del gas
                                    natural. En {mesActual} de {yearNow}, la producción solar es especialmente favorable, lo que permite
                                    compensar una mayor parte del consumo eléctrico y reducir el importe de la factura de la luz.
                                </p>
                                <p className="mt-3">
                                    Para <span className='font-bold'>{m.municipio}</span>, los datos de irradiación solar y horas de sol proceden de la base de datos
                                    PVGIS de la Comisión Europea (datos satelitales 2005–2020), específicos para las coordenadas de la provincia de{" "}
                                    {m.provincia}.
                                </p>
                            </div>
                        </div>

                        <SiloNavigation
                            currentSilo="precio-luz"
                            municipioName={m.municipio}
                            municipioSlug={slug}
                            provinciaName={m.provincia}
                            comunidadName={m.comunidad_autonoma}
                        />

                        {/* Tariff structure & consumption guide */}
                        <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
                            <div className="px-5 py-4 border-b border-slate-100">
                                <SectionHeader
                                    title={`Precio de la luz por tramos horarios — ${mesActual} ${yearNow}`}
                                    subtitle={`Tarifa PVPC 2.0TD · Consumo y potencia contratada`}
                                />
                            </div>
                            <div className="px-5 py-4 prose prose-sm max-w-none text-slate-600">
                                <p>
                                    El precio de la luz en la tarifa PVPC 2.0TD se divide en <span className='font-bold'>tres periodos horarios</span> cada día.
                                    Conocer estos tramos permite ajustar el consumo eléctrico a las horas más baratas y reducir la factura de la luz:
                                </p>
                                <ul className="mt-3 space-y-2">
                                    <li>
                                        <span className='font-bold'>Hora valle (00:00–08:00 h):</span> precio más bajo en €/kWh. Ideal para programar electrodomésticos
                                        de alto consumo como lavadora, lavavajillas o carga de vehículo eléctrico.
                                    </li>
                                    <li>
                                        <span className='font-bold'>Hora llana (08:00–10:00 h, 14:00–18:00 h, 22:00–00:00 h):</span> tarifas intermedias.
                                        Buen momento para el consumo habitual del hogar.
                                    </li>
                                    <li>
                                        <span className='font-bold'>Hora punta (10:00–14:00 h, 18:00–22:00 h):</span> precios más altos del día,
                                        cuando la demanda de potencia en la red es máxima.
                                    </li>
                                </ul>
                                <p className="mt-3">
                                    La factura de la luz tiene dos componentes principales: el <span className='font-bold'>término de consumo</span> (kWh
                                    consumidos × precio por hora) y el <span className='font-bold'>término de potencia</span> (kW contratados × precio fijo al día).
                                    Reducir la potencia contratada de 5,75 kW a 4,6 kW puede suponer un ahorro fijo en la factura mensual.
                                </p>
                                <p className="mt-3">
                                    En {mesActual} de {yearNow}, los precios del mercado mayorista en €/MWh reflejan una tendencia más
                                    estable gracias a la menor dependencia del gas natural para generación eléctrica. El autoconsumo
                                    solar permite cubrir gran parte de las horas punta y llana, cuando el precio de la luz es más alto,
                                    maximizando el ahorro en tu factura cada día.
                                </p>
                            </div>
                        </div>

                    </div>

                    {/* Right column (1/3) */}
                    <div className="space-y-6">

                        {/* Desktop-only Frank Energy Banner */}
                        <div className="hidden lg:block">
                            <FrankEnergyBanner municipio={m.municipio} />
                        </div>

                        {/* Solar data for this municipality */}
                        <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
                            <div className="px-5 pt-4 pb-2 border-b border-slate-100">
                                <SectionHeader
                                    title={`Recursos solares · ${m.provincia}`}
                                    subtitle="Datos PVGIS · Comisión Europea"
                                />
                            </div>
                            <div className="px-5 pb-4">
                                <DataRow label="Irradiación solar anual" value={nd(m.irradiacion_solar, " kWh/m²")} note="PVGIS" />
                                <DataRow label="Horas de sol al año" value={nd(m.horas_sol, " h")} />
                                <DataRow label="Precio kWh electricidad (hoy)" value={`${precioHoy.toFixed(3)} €/kWh`} note="PVPC" />
                                <DataRow label="Coste instalación 4 kWp" value={`${nd(m.precio_instalacion_min_eur)} – ${nd(m.precio_instalacion_max_eur)} €`} />
                                {m.eur_por_watio && <DataRow label="Coste por Watio pico" value={nd(m.eur_por_watio, " €/Wp", 2)} />}
                            </div>
                        </div>

                        {/* Fiscal incentives */}
                        <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
                            <div className="px-5 pt-4 pb-2 border-b border-slate-100">
                                <SectionHeader
                                    title="Incentivos fiscales"
                                    subtitle={`${m.municipio} · ${m.comunidad_autonoma}`}
                                />
                            </div>
                            <div className="px-5 pb-4">
                                <DataRow label="Bonificación IBI" value={nd(m.bonificacion_ibi, "%")} note="al instalar autoconsumo" />
                                <DataRow label="Subvención autonómica" value={nd(m.subvencion_autoconsumo, "%")} />
                                <DataRow label="Ahorro en factura de la luz" value={nd(ahorroAnual, " €")} note="instalación 4 kWp" />
                                <DataRow label="Retorno de inversión" value={payback ? `${payback} años` : "—"} />
                            </div>
                        </div>

                        {/* Savings calculator compact */}
                        <div className="bg-slate-900 rounded-lg text-white p-5">
                            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
                                Simulación de ahorro en factura · Instalación residencial
                            </p>
                            <div className="space-y-3">
                                {[
                                    { label: "Generación estimada", value: `${nd(horasSol * 4 * 0.20)} kWh/año` },
                                    { label: "Precio evitado", value: `${precioHoy.toFixed(3)} €/kWh` },
                                    { label: "Ahorro bruto anual", value: `${nd(ahorroAnual)} €` },
                                    { label: "Inversión estimada", value: `${nd(m.precio_instalacion_medio_eur)} €` },
                                    { label: "Amortización", value: payback ? `${payback} años` : "—" },
                                ].map(r => (
                                    <div key={r.label} className="flex justify-between items-baseline border-b border-slate-700 pb-2 last:border-0">
                                        <span className="text-xs text-slate-400">{r.label}</span>
                                        <span className="text-sm font-semibold tabular-nums">{r.value}</span>
                                    </div>
                                ))}
                            </div>
                            <p className="mt-3 text-xs text-slate-500">
                                Estimación orientativa. Basada en PVGIS + precio PVPC actual.
                            </p>
                        </div>

                        {/* Lead form */}
                        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                            <div className="bg-amber-400 px-5 py-3">
                                <p className="text-xs font-bold uppercase tracking-widest text-slate-900">
                                    Presupuesto sin compromiso
                                </p>
                            </div>
                            <div className="p-5">
                                <p className="text-sm text-slate-600 mb-4">
                                    Instalador certificado en {m.provincia} — respuesta en menos de 24 h.
                                </p>
                                <LeadForm
                                    municipioSlug={slug}
                                    municipio={m.municipio}
                                    provincia={m.provincia}
                                    ahorroEstimado={ahorroAnual}
                                    irradiacionSolar={m.irradiacion_solar}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-12">
                    <ProvinceHubLinks 
                        hubs={hubs} 
                        provincia={m.provincia} 
                        currentSlug={m.slug}
                        label="Precio de la luz hoy en"
                    />
                </div>

                {/* ── Formal footer ────────────────────────────────────────── */}
                <div className="mt-10 rounded-lg border border-slate-200 bg-white p-6 text-xs text-slate-500 space-y-4">
                    <div className="grid sm:grid-cols-2 gap-6">
                        <div>
                            <p className="font-bold text-slate-700 mb-2 text-sm">Metodología y fuentes</p>
                            <ul className="space-y-1.5 list-none">
                                {[
                                    ["Precio PVPC", "API REE · Indicador 1001 PVPC 2.0TD · Publicación diaria 20:30 CET"],
                                    ["Irradiación solar", "PVGIS (Comisión Europea) · Datos sat. 2005–2020"],
                                    ["Bonificaciones IBI", "Ordenanzas fiscales municipales · BOPs"],
                                    ["Precio instalación", "Datos de mercado provinciales · Actualización trimestral"],
                                    ["Ahorro estimado", "PVGIS × 4 kWp × 20% rendimiento × PVPC actual"],
                                ].map(([label, src]) => (
                                    <li key={label} className="flex gap-x-2">
                                        <span className="shrink-0 font-semibold text-slate-600">{label}:</span>
                                        <span>{src}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <p className="font-bold text-slate-700 mb-2 text-sm">Aviso legal</p>
                            <p className="leading-relaxed">
                                La información publicada tiene carácter orientativo y no constituye asesoramiento fiscal,
                                energético ni jurídico. Los ahorros en factura son proyecciones basadas en condiciones medias
                                del precio de la energía y pueden variar según el consumo real, tarifa contratada (PVPC o mercado libre),
                                orientación de cubierta y cambios regulatorios. Consulte siempre con un instalador homologado.
                            </p>
                            <p className="mt-3 leading-relaxed">
                                Precio PVPC regulado por el <span className='font-bold'>Real Decreto 216/2014</span> y supervisado por la <span className='font-bold'>CNMC</span>.
                                Actualización automática cada hora (ISR).
                            </p>
                        </div>
                    </div>
                    <div className="border-t border-slate-100 pt-4 flex flex-wrap gap-x-4 gap-y-1 text-slate-400">
                        <span>© {yearNow} · Datos para {m.municipio}</span>
                        <span>·</span>
                        <a href="https://www.ree.es" target="_blank" rel="noopener noreferrer" className="hover:text-slate-600 underline">Red Eléctrica de España</a>
                        <span>·</span>
                        <a href="https://re.jrc.ec.europa.eu/pvg_tools/" target="_blank" rel="noopener noreferrer" className="hover:text-slate-600 underline">PVGIS — Comisión Europea</a>
                        <span>·</span>
                        <a href="https://www.cnmc.es" target="_blank" rel="noopener noreferrer" className="hover:text-slate-600 underline">CNMC</a>
                        <span>·</span>
                        <a href="https://www.omie.es" target="_blank" rel="noopener noreferrer" className="hover:text-slate-600 underline">OMIE</a>
                    </div>
                </div>
            </div>

            {/* ── Schema.org ──────────────────────────────────────────── */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "WebPage",
                        "name": `Precio de la Luz en ${m.municipio} ${yearNow}`,
                        "description": `Precio PVPC en tiempo real en ${m.municipio}, ${m.provincia}. Ahorro estimado con autoconsumo solar: ${ahorroAnual} €/año.`,
                        "url": `${process.env.NEXT_PUBLIC_SITE_URL}/precio-luz/${slug}`,
                        "dateModified": now.toISOString(),
                    }),
                }}
            />
        </main>
    );
}
