/**
 * EquipoCards — Visual cards for solar equipment (panels, inverters, batteries).
 *
 * Replaces the plain HTML tables with premium-feeling cards with brand color,
 * efficiency bar, type badge, and estimated price.
 *
 * Server component — receives data from the page.
 */

type EquipoRow = {
    marca: string;
    modelo: string;
    tipo: string;
    potencia: number;
    eficiencia: number;
    precio_estimado: number;
};

type EquipoCardsProps = {
    equipos: EquipoRow[];
    provincia: string;
};

const TIPO_CONFIG: Record<string, { label: string; icon: string; color: string }> = {
    "panel-solar": { label: "Panel solar", icon: "🔲", color: "bg-sky-100 text-sky-700 ring-sky-200" },
    "inversor": { label: "Inversor", icon: "⚡", color: "bg-violet-100 text-violet-700 ring-violet-200" },
    "bateria": { label: "Batería", icon: "🔋", color: "bg-amber-100 text-amber-700 ring-amber-200" },
};

function fmt(n: number, decimals = 0): string {
    return n.toLocaleString("es-ES", { maximumFractionDigits: decimals });
}

function EfficiencyBar({ value }: { value: number }) {
    const pct = Math.min(100, Math.max(0, value));
    const color = pct >= 22 ? "bg-emerald-500" : pct >= 18 ? "bg-amber-400" : "bg-slate-300";
    return (
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
        </div>
    );
}

function EquipoCard({ equipo }: { equipo: EquipoRow }) {
    const config = TIPO_CONFIG[equipo.tipo] ?? {
        label: equipo.tipo,
        icon: "🔧",
        color: "bg-slate-100 text-slate-600 ring-slate-200",
    };

    return (
        <article className="flex flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-emerald-300 hover:shadow-md">
            {/* Badge */}
            <span
                className={`inline-flex w-fit items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${config.color}`}
            >
                <span aria-hidden="true">{config.icon}</span> {config.label}
            </span>

            {/* Name */}
            <h3 className="mt-3 font-bold text-slate-900 leading-tight">
                {equipo.marca}
            </h3>
            <p className="text-sm text-slate-500">{equipo.modelo}</p>

            {/* Specs */}
            <div className="mt-3 space-y-1 text-sm">
                {equipo.potencia > 0 && (
                    <div className="flex justify-between">
                        <span className="text-slate-500">Potencia</span>
                        <span className="font-semibold tabular-nums">{fmt(equipo.potencia)} W</span>
                    </div>
                )}
                <div className="flex justify-between">
                    <span className="text-slate-500">Eficiencia</span>
                    <span className="font-semibold tabular-nums">{fmt(equipo.eficiencia, 1)}%</span>
                </div>
            </div>

            {/* Efficiency bar */}
            <EfficiencyBar value={equipo.eficiencia} />

            {/* Price */}
            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                <span className="text-xs text-slate-400">Precio est.</span>
                <span className="text-lg font-extrabold text-emerald-700 tabular-nums">
                    {fmt(equipo.precio_estimado)} €
                </span>
            </div>
        </article>
    );
}

function SectionTitle({ icon, title }: { icon: string; title: string }) {
    return (
        <h3 className="mt-6 flex items-center gap-2 text-base font-semibold text-slate-800">
            <span aria-hidden="true">{icon}</span> {title}
        </h3>
    );
}

export function EquipoCards({ equipos, provincia }: EquipoCardsProps) {
    if (!equipos || equipos.length === 0) return null;

    const paneles = equipos.filter((e) => e.tipo === "panel-solar");
    const inversores = equipos.filter((e) => e.tipo === "inversor");
    const baterias = equipos.filter((e) => e.tipo === "bateria");

    return (
        <section
            className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            aria-label="Equipos solares recomendados"
        >
            <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
                <span aria-hidden="true">🛒</span> Equipos recomendados para {provincia}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
                Selección de paneles, inversores y baterías más habituales en la zona
            </p>

            {paneles.length > 0 && (
                <>
                    <SectionTitle icon="🔲" title="Paneles solares" />
                    <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {paneles.map((e) => <EquipoCard key={`${e.marca}-${e.modelo}`} equipo={e} />)}
                    </div>
                </>
            )}

            {inversores.length > 0 && (
                <>
                    <SectionTitle icon="⚡" title="Inversores" />
                    <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {inversores.map((e) => <EquipoCard key={`${e.marca}-${e.modelo}`} equipo={e} />)}
                    </div>
                </>
            )}

            {baterias.length > 0 && (
                <>
                    <SectionTitle icon="🔋" title="Baterías de almacenamiento" />
                    <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {baterias.map((e) => <EquipoCard key={`${e.marca}-${e.modelo}`} equipo={e} />)}
                    </div>
                </>
            )}
        </section>
    );
}
