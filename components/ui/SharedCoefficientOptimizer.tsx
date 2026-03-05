"use client";

import { useMemo, useState } from "react";
import { optimizeSharedSelfConsumption } from "@/calculators/shared-self-consumption-optimizer";

type Props = {
  municipio: string;
};

export function SharedCoefficientOptimizer({ municipio }: Props) {
  const [householdCount, setHouseholdCount] = useState(12);
  const [averageMonthlyConsumptionKwh, setAverageMonthlyConsumptionKwh] = useState(260);
  const [installationPowerKw, setInstallationPowerKw] = useState(24);
  const [installationDistanceKm, setInstallationDistanceKm] = useState(0.7);

  const result = useMemo(
    () =>
      optimizeSharedSelfConsumption({
        householdCount,
        averageMonthlyConsumptionKwh,
        installationPowerKw,
        installationDistanceKm
      }),
    [householdCount, averageMonthlyConsumptionKwh, installationPowerKw, installationDistanceKm]
  );

  return (
    <div className="space-y-4">
      <p className="text-slate-700">
        Simulador de coeficiente de reparto para comunidad energetica en {municipio}. Ajusta viviendas, consumo,
        potencia y distancia para estimar el reparto recomendado.
      </p>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="grid gap-1 text-sm">
          <span className="font-medium text-slate-700">Numero de viviendas</span>
          <input
            type="number"
            min={2}
            step={1}
            value={householdCount}
            onChange={(e) => setHouseholdCount(Number(e.target.value || 0))}
            className="rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>

        <label className="grid gap-1 text-sm">
          <span className="font-medium text-slate-700">Consumo medio (kWh/mes por vivienda)</span>
          <input
            type="number"
            min={50}
            step={10}
            value={averageMonthlyConsumptionKwh}
            onChange={(e) => setAverageMonthlyConsumptionKwh(Number(e.target.value || 0))}
            className="rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>

        <label className="grid gap-1 text-sm">
          <span className="font-medium text-slate-700">Potencia de instalacion (kW)</span>
          <input
            type="number"
            min={1}
            step={0.5}
            value={installationPowerKw}
            onChange={(e) => setInstallationPowerKw(Number(e.target.value || 0))}
            className="rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>

        <label className="grid gap-1 text-sm">
          <span className="font-medium text-slate-700">Distancia instalacion (km)</span>
          <input
            type="number"
            min={0}
            step={0.1}
            value={installationDistanceKm}
            onChange={(e) => setInstallationDistanceKm(Number(e.target.value || 0))}
            className="rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <article className="card">
          <h3 className="text-sm font-medium text-slate-500">Modalidad recomendada</h3>
          <p className="mt-2 text-xl font-semibold">{result.recommendedMode}</p>
        </article>
        <article className="card">
          <h3 className="text-sm font-medium text-slate-500">Coeficiente por vivienda</h3>
          <p className="mt-2 text-xl font-semibold">{result.recommendedCoefficientPerHousehold.toLocaleString("es-ES")}</p>
        </article>
        <article className="card">
          <h3 className="text-sm font-medium text-slate-500">Cobertura autoconsumo</h3>
          <p className="mt-2 text-xl font-semibold">{result.selfSupplyCoveragePct}%</p>
        </article>
        <article className="card">
          <h3 className="text-sm font-medium text-slate-500">Perdidas por distancia</h3>
          <p className="mt-2 text-xl font-semibold">{result.gridLossPct}%</p>
        </article>
      </div>

      <ul className="space-y-1 text-sm text-slate-700">
        <li>Demanda comunitaria estimada: {result.monthlyCommunityDemandKwh.toLocaleString("es-ES")} kWh/mes</li>
        <li>Produccion neta estimada: {result.monthlyNetProductionKwh.toLocaleString("es-ES")} kWh/mes</li>
        <li>
          Balance mensual: {result.monthlySurplusKwh >= 0 ? "+" : ""}
          {result.monthlySurplusKwh.toLocaleString("es-ES")} kWh/mes
        </li>
      </ul>
    </div>
  );
}
