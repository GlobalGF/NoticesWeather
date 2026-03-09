/**
 * HeroKpis — Above-the-fold KPI strip for municipality pages.
 *
 * Shows 3 critical data points immediately visible without scrolling:
 * solar irradiation · estimated annual savings · IBI bonification.
 *
 * Server component — data passed as props (already fetched by the page).
 */

type HeroKpisProps = {
    municipio: string;
    provincia: string;
    irradiacionSolar: number;           // kWh/m²/año
    ahorroEstimado: number;             // EUR/año
    bonificacionIbi: number | null;     // %
    horasSol: number;                   // horas/año
    className?: string;
};

function KpiCard({
    icon,
    label,
    value,
    unit,
    highlight,
}: {
    icon: string;
    label: string;
    value: string;
    unit: string;
    highlight?: boolean;
}) {
    return (
        <div
            className={[
                "flex flex-col items-center rounded-2xl px-5 py-5 text-center shadow-sm transition-transform hover:-translate-y-0.5",
                highlight
                    ? "border border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50"
                    : "border border-emerald-100 bg-white",
            ].join(" ")}
        >
            <span className="text-3xl" aria-hidden="true">{icon}</span>
            <p className="mt-2 text-xs font-medium uppercase tracking-wider text-slate-500">{label}</p>
            <p className={[
                "mt-1 text-2xl font-extrabold tabular-nums",
                highlight ? "text-amber-600" : "text-emerald-700",
            ].join(" ")}>
                {value}
            </p>
            <p className="mt-0.5 text-xs text-slate-400">{unit}</p>
        </div>
    );
}

export function HeroKpis({
    municipio,
    provincia,
    irradiacionSolar,
    ahorroEstimado,
    bonificacionIbi,
    horasSol,
    className = "",
}: HeroKpisProps) {
    const fmt = (n: number, decimals = 0) =>
        n.toLocaleString("es-ES", { maximumFractionDigits: decimals });

    return (
        <section
            aria-label={`Datos clave de energía solar en ${municipio}`}
            className={`mb-6 ${className}`}
        >
            {/* Location breadcrumb */}
            <p className="mb-3 text-sm text-slate-500">
                📍 <span className="font-medium text-slate-700">{municipio}</span>
                {" · "}
                <span>{provincia}</span>
            </p>

            {/* KPI grid */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <KpiCard
                    icon="☀️"
                    label="Irradiación solar"
                    value={fmt(irradiacionSolar)}
                    unit="kWh/m² al año"
                    highlight
                />
                <KpiCard
                    icon="⚡"
                    label="Horas de sol"
                    value={fmt(horasSol)}
                    unit="horas anuales"
                />
                <KpiCard
                    icon="💰"
                    label="Ahorro estimado"
                    value={`${fmt(ahorroEstimado)} €`}
                    unit="por año (hogar medio)"
                />
                <KpiCard
                    icon="🏠"
                    label="Bonificación IBI"
                    value={bonificacionIbi != null ? `${fmt(bonificacionIbi)}%` : "Consultar"}
                    unit={bonificacionIbi != null ? "descuento en IBI" : "ordenanza municipal"}
                />
            </div>
        </section>
    );
}
