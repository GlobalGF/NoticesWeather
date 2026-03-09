/**
 * NearbyMunicipalityCards — Cards of nearby municipalities with solar data.
 *
 * Server component — receives data already fetched by the page.
 * Shows name, savings %, irradiation, and links to all 3 page types.
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
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200">
            {label}: <strong>{value}</strong>
        </span>
    );
}

export function NearbyMunicipalityCards({ items, currentMunicipio }: NearbyMunicipalityCardsProps) {
    if (!items || items.length === 0) return null;

    return (
        <section
            className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            aria-label="Municipios cercanos"
        >
            <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
                <span aria-hidden="true">📍</span> Municipios cercanos a {currentMunicipio}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
                Compara el potencial solar con los municipios vecinos
            </p>

            <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3" role="list">
                {items.map((m) => (
                    <li key={m.slug}>
                        <article className="group flex h-full flex-col rounded-xl border border-slate-200 bg-slate-50 p-4 transition-all hover:border-emerald-300 hover:bg-emerald-50 hover:shadow-sm">
                            {/* Header */}
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="font-semibold text-slate-900 group-hover:text-emerald-800">
                                        {m.municipio}
                                    </h3>
                                    <p className="text-xs text-slate-500">{m.provincia}</p>
                                </div>
                                {m.ahorroEstimado != null && (
                                    <span className="ml-2 shrink-0 rounded-full bg-emerald-600 px-2 py-0.5 text-xs font-bold text-white">
                                        {fmt(m.ahorroEstimado)} €/año
                                    </span>
                                )}
                            </div>

                            {/* Data badges */}
                            <div className="mt-3 flex flex-wrap gap-1.5">
                                {m.irradiacionSolar != null && (
                                    <DataBadge label="☀️" value={`${fmt(m.irradiacionSolar)} kWh/m²`} />
                                )}
                                {m.bonificacionIbi != null && (
                                    <DataBadge label="🏠 IBI" value={`${fmt(m.bonificacionIbi)}%`} />
                                )}
                            </div>

                            {/* Links */}
                            <div className="mt-auto flex gap-2 pt-4">
                                <Link
                                    href={`/placas-solares/${m.slug}`}
                                    className="flex-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-center text-xs font-semibold text-white transition hover:bg-emerald-700"
                                >
                                    Placas solares
                                </Link>
                                <Link
                                    href={`/bonificacion-ibi/${m.slug}`}
                                    className="flex-1 rounded-lg border border-emerald-300 px-3 py-1.5 text-center text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50"
                                >
                                    IBI
                                </Link>
                            </div>
                        </article>
                    </li>
                ))}
            </ul>
        </section>
    );
}
