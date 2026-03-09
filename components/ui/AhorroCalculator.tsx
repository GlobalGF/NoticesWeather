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
    { label: "Pequeño (150 kWh/mes)", value: 150 },
    { label: "Medio (300 kWh/mes)", value: 300 },
    { label: "Grande (500 kWh/mes)", value: 500 },
    { label: "Muy grande (750 kWh/mes)", value: 750 },
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
            className="mt-6 rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-6 shadow-sm"
            aria-label="Calculadora de ahorro solar"
        >
            <h2 className="flex items-center gap-2 text-xl font-bold text-emerald-900">
                <span aria-hidden="true">🧮</span> Calcula tu ahorro en {municipio}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
                Basado en el precio real de la electricidad: <strong>{precioMedioLuz.toFixed(4)} €/kWh</strong>
            </p>

            <div className="mt-5 grid gap-6 sm:grid-cols-2">
                {/* Consumo */}
                <div>
                    <label htmlFor="consumo-slider" className="block text-sm font-semibold text-slate-700">
                        Consumo mensual: <span className="text-emerald-700">{fmt(consumo)} kWh</span>
                    </label>
                    <input
                        id="consumo-slider"
                        type="range"
                        min={50}
                        max={1000}
                        step={25}
                        value={consumo}
                        onChange={(e) => setConsumo(Number(e.target.value))}
                        className="mt-2 w-full accent-emerald-600"
                        aria-valuemin={50}
                        aria-valuemax={1000}
                        aria-valuenow={consumo}
                    />
                    {/* Quick presets */}
                    <div className="mt-2 flex flex-wrap gap-2">
                        {CONSUMO_PRESETS.map((p) => (
                            <button
                                key={p.value}
                                type="button"
                                onClick={() => setConsumo(p.value)}
                                className={[
                                    "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                                    consumo === p.value
                                        ? "bg-emerald-600 text-white"
                                        : "bg-slate-100 text-slate-600 hover:bg-emerald-100",
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
                        % autoconsumo directo: <span className="text-emerald-700">{autoconsumo}%</span>
                    </label>
                    <input
                        id="autoconsumo-slider"
                        type="range"
                        min={20}
                        max={90}
                        step={5}
                        value={autoconsumo}
                        onChange={(e) => setAutoconsumo(Number(e.target.value))}
                        className="mt-2 w-full accent-emerald-600"
                        aria-valuemin={20}
                        aria-valuemax={90}
                        aria-valuenow={autoconsumo}
                    />
                    <p className="mt-1 text-xs text-slate-400">
                        Sin batería ≈ 60–70% · Con batería ≈ 75–90%
                    </p>
                </div>
            </div>

            {/* Results */}
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-xl bg-emerald-600 p-4 text-center text-white">
                    <p className="text-xs font-medium uppercase tracking-wide opacity-80">Ahorro anual</p>
                    <p className="mt-1 text-2xl font-extrabold tabular-nums">{fmt(ahorroAnual)} €</p>
                </div>
                <div className="rounded-xl bg-white border border-emerald-200 p-4 text-center">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Ahorro mensual</p>
                    <p className="mt-1 text-2xl font-bold tabular-nums text-emerald-700">{fmt(ahorroMensual, 1)} €</p>
                </div>
                <div className="rounded-xl bg-white border border-emerald-200 p-4 text-center">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">kWh producidos</p>
                    <p className="mt-1 text-2xl font-bold tabular-nums text-slate-800">{fmt(kwhProducidos * 12)}</p>
                    <p className="text-xs text-slate-400">al año</p>
                </div>
                <div className="rounded-xl bg-white border border-emerald-200 p-4 text-center">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Retorno inversión</p>
                    <p className="mt-1 text-2xl font-bold tabular-nums text-slate-800">
                        {roi > 0 ? `~${fmt(roi, 1)} años` : "N/D"}
                    </p>
                </div>
            </div>

            <p className="mt-3 text-xs text-slate-400">
                * Estimación orientativa. El ahorro real depende de la orientación, sombras y equipo instalado.
            </p>
        </section>
    );
}
