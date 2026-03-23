import { ReactNode } from "react";

type DataCardProps = {
    title: string;
    value: string | number;
    unit?: string;
    icon?: ReactNode;
    trend?: {
        direction: "up" | "down" | "neutral";
        label: string;
    };
    highlight?: boolean;
};

export function DataCard({ title, value, unit, icon, trend, highlight }: DataCardProps) {
    return (
        <div className={`flex flex-col rounded-xl border p-5 shadow-sm transition-all hover:shadow-md ${highlight ? "border-amber-400 bg-amber-50" : "border-slate-200 bg-white"}`}>
            <div className="flex items-center justify-between text-slate-500">
                <h3 className="text-sm font-semibold tracking-wide uppercase">{title}</h3>
                {icon && <span className="text-xl opacity-70">{icon}</span>}
            </div>

            <div className="mt-4 flex items-baseline gap-1">
                <span className={`text-4xl font-bold tracking-tight tabular-nums ${highlight ? "text-amber-600" : "text-slate-900"}`}>
                    {value}
                </span>
                {unit && <span className="text-lg font-medium text-slate-500">{unit}</span>}
            </div>

            {trend && (
                <div className="mt-4 flex items-center gap-1.5 text-sm font-medium">
                    {trend.direction === "up" && <span className="text-emerald-600">▲</span>}
                    {trend.direction === "down" && <span className="text-red-500">▼</span>}
                    {trend.direction === "neutral" && <span className="text-slate-400">—</span>}
                    <span className="text-slate-600">{trend.label}</span>
                </div>
            )}
        </div>
    );
}
