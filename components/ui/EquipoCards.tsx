/**
 * EquipoCards — Visual cards for solar equipment (panels, inverters, batteries).
 *
 * Data-Driven redesign using clean lines, tech-focused typography and blue/amber accents.
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
    "panel-solar": { label: "Panel Fotovoltaico", icon: "▤", color: "bg-blue-50 text-blue-700 border-blue-200" },
    "inversor": { label: "Inversor Eléctrico", icon: "⚡", color: "bg-slate-100 text-slate-700 border-slate-300" },
    "bateria": { label: "Batería Litio", icon: "🔋", color: "bg-amber-50 text-amber-700 border-amber-300" },
};

function fmt(n: number, decimals = 0): string {
    return n.toLocaleString("es-ES", { maximumFractionDigits: decimals });
}

function EfficiencyBar({ value }: { value: number }) {
    const pct = Math.min(100, Math.max(0, value));
    const color = pct >= 22 ? "bg-blue-600" : pct >= 18 ? "bg-amber-400" : "bg-slate-400";
    return (
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded bg-slate-100 border border-slate-200">
            <div className={`h-full transition-all ${color}`} style={{ width: `${pct}%` }} />
        </div>
    );
}

function EquipoCard({ equipo }: { equipo: EquipoRow }) {
    const config = TIPO_CONFIG[equipo.tipo] ?? {
        label: equipo.tipo,
        icon: "🔧",
        color: "bg-slate-50 text-slate-600 border-slate-200",
    };

    return (
        <article className="flex flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-blue-300 hover:shadow-md">
            {/* Badge */}
            <span
                className={`inline-flex w-fit items-center gap-1.5 rounded px-2 py-0.5 text-xs font-bold uppercase tracking-wider border ${config.color}`}
            >
                <span aria-hidden="true" className="opacity-75">{config.icon}</span> {config.label}
            </span>

            {/* Name */}
            <h3 className="mt-4 text-xl font-extrabold text-slate-900 leading-tight">
                {equipo.marca}
            </h3>
            <p className="mt-0.5 text-sm font-medium text-slate-500 truncate" title={equipo.modelo}>{equipo.modelo}</p>

            {/* Specs */}
            <div className="mt-5 space-y-2 text-sm border-t border-slate-100 pt-4">
                {equipo.potencia > 0 && (
                    <div className="flex justify-between items-center">
                        <span className="text-slate-500 font-medium">Potencia pico</span>
                        <span className="font-bold tabular-nums text-slate-900">{fmt(equipo.potencia)} W</span>
                    </div>
                )}
                <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Índice eficiencia</span>
                    <span className="font-bold tabular-nums text-slate-900">{fmt(equipo.eficiencia, 1)}%</span>
                </div>
            </div>

            {/* Efficiency bar */}
            <EfficiencyBar value={equipo.eficiencia} />

            {/* Price */}
            <div className="mt-5 flex flex-col justify-end h-full">
                <div className="flex items-end justify-between rounded-lg bg-slate-50 border border-slate-100 p-3">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Est. Mercado</span>
                        <span className="text-xl font-extrabold text-blue-600 tabular-nums leading-none mt-1">
                            {fmt(equipo.precio_estimado)} €
                        </span>
                    </div>
                </div>
            </div>
        </article>
    );
}

function SectionTitle({ title }: { title: string }) {
    return (
        <h3 className="mt-8 mb-4 border-b border-slate-200 pb-2 text-sm font-bold uppercase tracking-wider text-slate-400">
            {title}
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
            className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
            aria-label="Equipos solares recomendados"
        >
            <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
                <span aria-hidden="true" className="text-blue-600">⚙️</span> Componentes del sistema: {provincia}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
                Cat\u00e1logo de equipos m\u00e1s instalados en informes recientes de rentabilidad.
            </p>

            {paneles.length > 0 && (
                <>
                    <SectionTitle title="Módulos Fotovoltaicos" />
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {paneles.map((e) => <EquipoCard key={`${e.marca}-${e.modelo}`} equipo={e} />)}
                    </div>
                </>
            )}

            {inversores.length > 0 && (
                <>
                    <SectionTitle title="Inversores" />
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {inversores.map((e) => <EquipoCard key={`${e.marca}-${e.modelo}`} equipo={e} />)}
                    </div>
                </>
            )}

            {baterias.length > 0 && (
                <>
                    <SectionTitle title="Almacenamiento (Baterías)" />
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {baterias.map((e) => <EquipoCard key={`${e.marca}-${e.modelo}`} equipo={e} />)}
                    </div>
                </>
            )}
        </section>
    );
}
