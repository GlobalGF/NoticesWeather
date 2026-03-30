/**
 * NearbyMunicipalityCards — Cards of nearby municipalities with solar data.
 *
 * Data-driven dashboard version.
 * Server component — receives data already fetched by the page.
 */

import Link from "next/link";

export type NearbyMunicipio = {
    slug: string;
    municipio: string;
    provincia: string;
    ahorroEstimado?: number | null;
    irradiacionSolar?: number | null;
    bonificacionIbi?: number | null;
};

type NearbyMunicipalityCardsProps = {
    items: NearbyMunicipio[];
    currentMunicipio: string;
};

function fmt(n: number, decimals = 0): string {
    return n.toLocaleString("es-ES", { maximumFractionDigits: decimals });
}

function DataBadge({ label, value }: { label: string; value: string }) {
    return (
        <span className="inline-flex items-center gap-1 rounded-sm bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700 border border-slate-200">
            <span className="text-slate-500">{label}:</span> <strong className="text-slate-900">{value}</strong>
        </span>
    );
}

export function NearbyMunicipalityCards({ items, currentMunicipio }: NearbyMunicipalityCardsProps) {
    if (!items || items.length === 0) return null;

    return (
        <section
            className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            aria-label="Municipios cercanos"
        >
            <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
                <span aria-hidden="true" className="text-blue-600">📍</span> Análisis geográfico: Entorno de {currentMunicipio}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
                Comparativa rápida de potencial solar con los municipios de mayor población en la zona.
            </p>

            <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" role="list">
                {items.map((m) => (
                    <li key={m.slug}>
                        <article className="group flex h-full flex-col rounded-xl border border-slate-200 bg-slate-50 p-4 transition-all hover:border-blue-300 hover:shadow-md">
                            {/* Header */}
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="font-bold text-slate-900 group-hover:text-blue-700">
                                        {m.municipio}
                                    </h3>
                                    <p className="text-xs uppercase tracking-widest text-slate-500">{m.provincia}</p>
                                </div>
                                {m.ahorroEstimado != null && (
                                    <span className="ml-2 shrink-0 rounded bg-amber-100 px-2 py-1 text-xs font-bold text-amber-800 border border-amber-200">
                                        {fmt(m.ahorroEstimado)} €/año
                                    </span>
                                )}
                            </div>

                            {/* Data badges */}
                            <div className="mt-4 flex flex-wrap gap-2">
                                {m.irradiacionSolar != null && (
                                    <DataBadge label="Irradiación" value={`${fmt(m.irradiacionSolar)} kWh/m²`} />
                                )}
                                {m.bonificacionIbi != null && (
                                    <DataBadge label="Bonif. IBI" value={`${fmt(m.bonificacionIbi)}%`} />
                                )}
                            </div>

                            {/* Links */}
                            <div className="mt-auto flex gap-2 pt-5">
                                <Link
                                    href={`/placas-solares/${m.slug}`}
                                    className="flex-1 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-center text-xs font-semibold text-slate-700 transition hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 shadow-sm"
                                >
                                    Ver rentabilidad
                                </Link>
                                <Link
                                    href={`/bonificacion-ibi/${m.slug}`}
                                    className="flex-1 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-center text-xs font-semibold text-slate-700 transition hover:bg-slate-100 shadow-sm"
                                >
                                    Ficha IBI
                                </Link>
                            </div>
                        </article>
                    </li>
                ))}
            </ul>
        </section>
    );
}
