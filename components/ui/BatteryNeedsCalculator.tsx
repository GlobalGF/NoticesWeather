"use client";

import { useMemo, useState } from "react";
import {
  calculateBatteryRecommendation,
  type TariffType
} from "@/calculators/battery-calculator";

type Props = {
  municipio: string;
  annualSunHours: number;
};

export function BatteryNeedsCalculator({ municipio, annualSunHours }: Props) {
  const [monthlyConsumption, setMonthlyConsumption] = useState(350);
  const [installationPower, setInstallationPower] = useState(4.5);
  const [tariff, setTariff] = useState<TariffType>("2.0TD");
  const [sunHoursPerDay, setSunHoursPerDay] = useState(Number((annualSunHours / 365).toFixed(2)));

  const result = useMemo(
    () =>
      calculateBatteryRecommendation({
        monthlyConsumptionKwh: monthlyConsumption,
        installationPowerKw: installationPower,
        tariff,
        sunHoursPerDay
      }),
    [monthlyConsumption, installationPower, tariff, sunHoursPerDay]
  );

  return (
    <div className="space-y-4">
      <p className="text-slate-700">
        Calcula en segundos cuantas baterias solares podrias necesitar en {municipio} en funcion de tu consumo,
        potencia fotovoltaica y tarifa.
      </p>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="grid gap-1 text-sm">
          <span className="font-medium text-slate-700">Consumo mensual (kWh)</span>
          <input
            type="number"
            min={50}
            step={10}
            value={monthlyConsumption}
            onChange={(e) => setMonthlyConsumption(Number(e.target.value || 0))}
            className="rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>

        <label className="grid gap-1 text-sm">
          <span className="font-medium text-slate-700">Potencia instalacion (kW)</span>
          <input
            type="number"
            min={1}
            step={0.1}
            value={installationPower}
            onChange={(e) => setInstallationPower(Number(e.target.value || 0))}
            className="rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>

        <label className="grid gap-1 text-sm">
          <span className="font-medium text-slate-700">Horas de sol (h/dia)</span>
          <input
            type="number"
            min={1}
            max={12}
            step={0.1}
            value={sunHoursPerDay}
            onChange={(e) => setSunHoursPerDay(Number(e.target.value || 0))}
            className="rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>

        <label className="grid gap-1 text-sm md:col-span-2">
          <span className="font-medium text-slate-700">Tarifa electrica</span>
          <select
            value={tariff}
            onChange={(e) => setTariff(e.target.value as TariffType)}
            className="rounded-lg border border-slate-300 px-3 py-2"
          >
            <option value="2.0TD">2.0TD</option>
            <option value="indexada">Indexada</option>
            <option value="fija">Fija</option>
          </select>
        </label>
      </div>

      <p className="text-xs text-slate-500">
        Referencia local: {annualSunHours.toLocaleString("es-ES")} h/ano. Puedes ajustar las horas de sol para simular escenarios.
      </p>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <article className="card">
          <h3 className="text-sm font-medium text-slate-500">Baterias recomendadas</h3>
          <p className="mt-2 text-2xl font-semibold">{result.recommendedBatteries}</p>
        </article>
        <article className="card">
          <h3 className="text-sm font-medium text-slate-500">Capacidad necesaria</h3>
          <p className="mt-2 text-2xl font-semibold">{result.requiredCapacityKwh.toLocaleString("es-ES")} kWh</p>
        </article>
        <article className="card">
          <h3 className="text-sm font-medium text-slate-500">Ahorro anual estimado</h3>
          <p className="mt-2 text-2xl font-semibold">{result.estimatedAnnualSavingsEur.toLocaleString("es-ES")} EUR</p>
        </article>
        <article className="card">
          <h3 className="text-sm font-medium text-slate-500">Independencia energetica</h3>
          <p className="mt-2 text-2xl font-semibold">{result.energyIndependencePct}%</p>
        </article>
      </div>

      <p className="text-sm text-slate-600">
        Con este escenario, una vivienda media en {municipio} podria cubrir aproximadamente el {result.energyIndependencePct}%
        de su energia anual combinando produccion solar y almacenamiento.
      </p>
    </div>
  );
}
