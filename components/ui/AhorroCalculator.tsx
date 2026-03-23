/**
 * AhorroCalculator — Interactive savings calculator.
 *
 * Input: monthly kWh consumption + % self-consumption
 * Output: estimated annual savings in EUR based on real electricity price from Supabase.
 *
 * Client component (user interaction).
 */

"use client";

import { useState } from "react";

type AhorroCalculatorProps = {
    precioMedioLuz: number;     // EUR/kWh from Supabase
    municipio: string;
};

const CONSUMO_PRESETS = [
    { label: "Pequeño (150 kWh)", value: 150 },
    { label: "Medio (300 kWh)", value: 300 },
    { label: "Grande (500 kWh)", value: 500 },
    { label: "Muy grande (750 kWh)", value: 750 },
];

function calcularAhorro(
    consumoMensualKwh: number,
    autoconsumo: number,
    precioKwh: number
): { ahorroAnual: number; ahorroMensual: number; kwhProducidos: number; roi: number } {
    const kwhProducidos = (consumoMensualKwh * autoconsumo) / 100;
    const ahorroMensual = kwhProducidos * precioKwh;
    const ahorroAnual = ahorroMensual * 12;
    // Rough ROI: average 3kWp system at €6.200
    const costeInstalacion = Math.max(4500, consumoMensualKwh * 8);
    const roi = ahorroAnual > 0 ? costeInstalacion / ahorroAnual : 0;
    return { ahorroAnual, ahorroMensual, kwhProducidos, roi };
}

function fmt(n: number, decimals = 0): string {
    return n.toLocaleString("es-ES", { maximumFractionDigits: decimals });
}

export function AhorroCalculator({ precioMedioLuz, municipio }: AhorroCalculatorProps) {
    const [consumo, setConsumo] = useState(300);
    const [autoconsumo, setAutoconsumo] = useState(65);

    const { ahorroAnual, ahorroMensual, kwhProducidos, roi } = calcularAhorro(
        consumo,
        autoconsumo,
        precioMedioLuz
    );

    return (
        <section
            className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
            aria-label="Calculadora de ahorro solar"
        >
            <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
                <span aria-hidden="true" className="text-blue-600">⚡</span> Calculadora dinámica de ahorro
            </h2>
            <p className="mt-1 text-sm text-slate-500">
                Basado en el precio real de la electricidad en la zona: <strong>{precioMedioLuz.toFixed(4)} €/kWh</strong>
            </p>

            <div className="mt-6 grid gap-8 sm:grid-cols-2">
                {/* Consumo */}
                <div>
                    <label htmlFor="consumo-slider" className="block text-sm font-semibold text-slate-700">
                        Consumo mensual estimado
                    </label>
                    <div className="mt-1 text-2xl font-bold text-blue-600 tabular-nums">{fmt(consumo)} kWh</div>
                    <input
                        id="consumo-slider"
                        type="range"
                        min={50}
                        max={1000}
                        step={25}
                        value={consumo}
                        onChange={(e) => setConsumo(Number(e.target.value))}
                        className="mt-4 w-full accent-blue-600"
                        aria-valuemin={50}
                        aria-valuemax={1000}
                        aria-valuenow={consumo}
                    />
                    {/* Quick presets */}
                    <div className="mt-4 flex flex-wrap gap-2">
                        {CONSUMO_PRESETS.map((p) => (
                            <button
                                key={p.value}
                                type="button"
                                onClick={() => setConsumo(p.value)}
                                className={[
                                    "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                                    consumo === p.value
                                        ? "bg-slate-900 text-white"
                                        : "bg-slate-100 text-slate-600 hover:bg-slate-200",
                                ].join(" ")}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Autoconsumo */}
                <div>
                    <label htmlFor="autoconsumo-slider" className="block text-sm font-semibold text-slate-700">
                        Porcentaje de autoconsumo directo
                    </label>
                    <div className="mt-1 text-2xl font-bold text-blue-600 tabular-nums">{autoconsumo}%</div>
                    <input
                        id="autoconsumo-slider"
                        type="range"
                        min={20}
                        max={90}
                        step={5}
                        value={autoconsumo}
                        onChange={(e) => setAutoconsumo(Number(e.target.value))}
                        className="mt-4 w-full accent-blue-600"
                        aria-valuemin={20}
                        aria-valuemax={90}
                        aria-valuenow={autoconsumo}
                    />
                    <div className="mt-4 rounded bg-slate-50 p-3 text-xs text-slate-500 border border-slate-100">
                        <strong>Referencia:</strong><br />
                        Sin batería: 50% – 70% dependiendo de tus horas en casa durante el día.<br />
                        Con batería f\u00edsica o virtual: 75% – 90%.
                    </div>
                </div>
            </div>

            {/* Results Data Dashboard */}
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="rounded-xl bg-amber-500 p-5 text-center text-slate-900 shadow-sm border border-amber-600">
                    <p className="text-xs font-bold uppercase tracking-wide opacity-80">Ahorro anual</p>
                    <p className="mt-1 text-3xl font-extrabold tabular-nums">{fmt(ahorroAnual)} €</p>
                </div>
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-5 text-center">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Ahorro mensual</p>
                    <p className="mt-1 text-2xl font-bold tabular-nums text-slate-900">{fmt(ahorroMensual, 1)} €</p>
                </div>
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-5 text-center">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Producci\u00f3n solar</p>
                    <p className="mt-1 text-2xl font-bold tabular-nums text-slate-900">{fmt(kwhProducidos * 12)}</p>
                    <p className="text-xs text-slate-500 font-medium">kWh / a\u00f1o</p>
                </div>
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-5 text-center">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Retorno inversi\u00f3n</p>
                    <p className="mt-1 text-2xl font-bold tabular-nums text-blue-600">
                        {roi > 0 ? `~${fmt(roi, 1)} a\u00f1os` : "N/D"}
                    </p>
                </div>
            </div>
            <p className="mt-4 text-xs text-slate-400 text-center">
                * Modelo de estimaci\u00f3n orientativo. Variables como el patr\u00f3n de consumo real, inclinaci\u00f3n y sombras no est\u00e1n incluidas en este c\u00e1lculo r\u00e1pido.
            </p>
        </section>
    );
}
