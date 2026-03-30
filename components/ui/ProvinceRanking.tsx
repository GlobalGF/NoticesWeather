/**
 * ProvinceRanking — Comparative table of municipalities in the same province.
 *
 * Data-Driven redesign: financial leaderboard style.
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
        <span className="inline-flex items-center rounded-sm bg-blue-50 border border-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700">
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
            className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            aria-label={`Comparativa de municipios en ${provincia}`}
        >
            <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
                <span aria-hidden="true" className="text-blue-600">📊</span> Leaderboard Provincial: {provincia}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
                Top municipios por mayor volumen de ahorro estimado anual.
            </p>

            <div className="mt-5 overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full text-sm text-left" role="table" aria-label={`Ranking solar en ${provincia}`}>
                    <thead className="bg-slate-50">
                        <tr className="border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                            <th className="py-3 pl-4" scope="col">#</th>
                            <th className="py-3 px-3" scope="col">Municipio</th>
                            <th className="py-3 px-3 text-right" scope="col">Población</th>
                            <th className="py-3 px-3 text-right" scope="col">Irradiación</th>
                            <th className="py-3 px-3 text-right" scope="col">Ahorro Est.</th>
                            <th className="py-3 px-4 text-right" scope="col">IBI</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {sorted.map((m, index) => {
                            const isCurrent = m.slug === currentSlug;
                            return (
                                <tr
                                    key={m.slug}
                                    className={[
                                        "transition-colors",
                                        isCurrent
                                            ? "bg-blue-50/50"
                                            : "hover:bg-slate-50",
                                    ].join(" ")}
                                    aria-current={isCurrent ? "page" : undefined}
                                >
                                    <td className="py-3 pl-4 tabular-nums">
                                        <span className={[
                                            "inline-flex h-6 w-6 items-center justify-center rounded-sm text-xs font-bold shadow-sm",
                                            index === 0 ? "bg-amber-400 text-amber-900" :
                                                index === 1 ? "bg-slate-300 text-slate-800" :
                                                    index === 2 ? "bg-orange-300 text-orange-900" :
                                                        "bg-white border border-slate-200 text-slate-500",
                                        ].join(" ")}>
                                            {index + 1}
                                        </span>
                                    </td>
                                    <td className="py-3 px-3">
                                        {isCurrent ? (
                                            <span className="font-bold text-blue-700">{m.municipio} <span className="text-amber-500">★</span></span>
                                        ) : (
                                            <Link
                                                href={`/placas-solares/${m.slug}`}
                                                className="font-semibold text-slate-700 hover:text-blue-600 hover:underline"
                                            >
                                                {m.municipio}
                                            </Link>
                                        )}
                                    </td>
                                    <td className="py-3 px-3 text-right tabular-nums text-slate-500">
                                        {fmt(m.habitantes)}
                                    </td>
                                    <td className="py-3 px-3 text-right tabular-nums font-medium text-slate-600">
                                        {m.irradiacionSolar != null ? fmt(m.irradiacionSolar) : "—"}
                                    </td>
                                    <td className="py-3 px-3 text-right tabular-nums font-bold text-slate-900">
                                        {m.ahorroEstimado != null ? `${fmt(m.ahorroEstimado)} €` : "—"}
                                    </td>
                                    <td className="py-3 px-4 text-right">
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
