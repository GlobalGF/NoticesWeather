/**
 * ProvinceRanking — Comparative table of municipalities in the same province.
 *
 * Shows top municipalities sorted by solar savings, so users can compare
 * cities within the same province and navigate to them.
 *
 * Server component.
 */

import Link from "next/link";

export type RankingMunicipio = {
    slug: string;
    municipio: string;
    habitantes: number;
    irradiacionSolar: number | null;
    ahorroEstimado: number | null;
    bonificacionIbi: number | null;
};

type ProvinceRankingProps = {
    items: RankingMunicipio[];
    provincia: string;
    currentSlug: string;
};

function fmt(n: number, decimals = 0): string {
    return n.toLocaleString("es-ES", { maximumFractionDigits: decimals });
}

function IbiBadge({ value }: { value: number | null }) {
    if (!value) return <span className="text-slate-300">—</span>;
    return (
        <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
            {fmt(value)}%
        </span>
    );
}

export function ProvinceRanking({ items, provincia, currentSlug }: ProvinceRankingProps) {
    if (!items || items.length === 0) return null;

    // Sort by ahorro_estimado DESC
    const sorted = [...items].sort((a, b) => (b.ahorroEstimado ?? 0) - (a.ahorroEstimado ?? 0));

    return (
        <section
            className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            aria-label={`Comparativa de municipios en ${provincia}`}
        >
            <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
                <span aria-hidden="true">📊</span> Comparativa provincial — {provincia}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
                Municipios de {provincia} ordenados por ahorro estimado
            </p>

            <div className="mt-4 overflow-x-auto">
                <table className="w-full text-sm" role="table" aria-label={`Ranking solar en ${provincia}`}>
                    <thead>
                        <tr className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wider text-slate-400">
                            <th className="pb-2 pl-2 text-left" scope="col">#</th>
                            <th className="pb-2 text-left" scope="col">Municipio</th>
                            <th className="pb-2 text-right" scope="col">Habitantes</th>
                            <th className="pb-2 text-right" scope="col">☀️ kWh/m²</th>
                            <th className="pb-2 text-right" scope="col">💰 Ahorro/año</th>
                            <th className="pb-2 text-right" scope="col">🏠 IBI</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {sorted.map((m, index) => {
                            const isCurrent = m.slug === currentSlug;
                            return (
                                <tr
                                    key={m.slug}
                                    className={[
                                        "transition-colors",
                                        isCurrent
                                            ? "bg-emerald-50 font-semibold"
                                            : "hover:bg-slate-50",
                                    ].join(" ")}
                                    aria-current={isCurrent ? "page" : undefined}
                                >
                                    <td className="py-2.5 pl-2 tabular-nums">
                                        <span className={[
                                            "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold",
                                            index === 0 ? "bg-amber-400 text-white" :
                                                index === 1 ? "bg-slate-300 text-slate-700" :
                                                    index === 2 ? "bg-orange-300 text-white" :
                                                        "bg-slate-100 text-slate-500",
                                        ].join(" ")}>
                                            {index + 1}
                                        </span>
                                    </td>
                                    <td className="py-2.5 pr-4">
                                        {isCurrent ? (
                                            <span className="font-bold text-emerald-800">{m.municipio} ★</span>
                                        ) : (
                                            <Link
                                                href={`/placas-solares/${m.slug}`}
                                                className="font-medium text-slate-800 hover:text-emerald-700 hover:underline"
                                            >
                                                {m.municipio}
                                            </Link>
                                        )}
                                    </td>
                                    <td className="py-2.5 pr-4 text-right tabular-nums text-slate-500">
                                        {fmt(m.habitantes)}
                                    </td>
                                    <td className="py-2.5 pr-4 text-right tabular-nums font-medium text-amber-600">
                                        {m.irradiacionSolar != null ? fmt(m.irradiacionSolar) : "—"}
                                    </td>
                                    <td className="py-2.5 pr-4 text-right tabular-nums font-bold text-emerald-700">
                                        {m.ahorroEstimado != null ? `${fmt(m.ahorroEstimado)} €` : "—"}
                                    </td>
                                    <td className="py-2.5 pr-2 text-right">
                                        <IbiBadge value={m.bonificacionIbi} />
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
