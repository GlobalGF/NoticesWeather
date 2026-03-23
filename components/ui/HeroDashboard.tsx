import { DataCard } from "./DataCard";

type HeroDashboardProps = {
    municipio: string;
    provincia: string;
    irradiacionSolar: number;
    ahorroEstimado: number;
    bonificacionIbi: number | null;
    horasSol: number;
};

export function HeroDashboard({
    municipio,
    irradiacionSolar,
    ahorroEstimado,
    bonificacionIbi,
    horasSol,
}: HeroDashboardProps) {
    const formatNum = (n: number) => n.toLocaleString("es-ES");

    return (
        <section className="mb-10 w-full">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <DataCard
                    title="Irradiación"
                    value={formatNum(Math.round(irradiacionSolar))}
                    unit="kWh/m²/año"
                    icon="☀️"
                    trend={{ direction: "up", label: "Potencial Alto" }}
                />

                <DataCard
                    title="Horas de Sol"
                    value={formatNum(Math.round(horasSol))}
                    unit="h/año"
                    icon="⏳"
                    trend={{ direction: "neutral", label: "Media anual" }}
                />

                <DataCard
                    title="Ahorro Estimado"
                    value={formatNum(Math.round(ahorroEstimado))}
                    unit="€/año"
                    icon="💰"
                    highlight={true}
                    trend={{ direction: "up", label: "Frente a red eléctrica" }}
                />

                <DataCard
                    title="Bonificación IBI"
                    value={bonificacionIbi ? `${bonificacionIbi}%` : "No disp."}
                    unit=""
                    icon="🏛️"
                    trend={bonificacionIbi ? { direction: "up", label: "Activa" } : { direction: "neutral", label: "Consultar BOE" }}
                />
            </div>
        </section>
    );
}
