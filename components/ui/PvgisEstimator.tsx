"use client";

import { useState } from "react";

type Props = {
  municipio: string;
};

type PvgisResult = {
  annualProductionKwh: number;
  annualProductionWithoutShadeKwh: number;
  orientationLossPct: number;
  shadeLossPct: number;
  systemLossPct: number;
  pvgisAnnualOptimalKwh: number;
  pvgisAnnualSelectedKwh: number;
};

export function PvgisEstimator({ municipio }: Props) {
  const [lat, setLat] = useState(40.4168);
  const [lon, setLon] = useState(-3.7038);
  const [powerKw, setPowerKw] = useState(5);
  const [tiltDeg, setTiltDeg] = useState(30);
  const [azimuthDeg, setAzimuthDeg] = useState(0);
  const [shadeLossPct, setShadeLossPct] = useState(8);
  const [systemLossPct, setSystemLossPct] = useState(14);

  const [result, setResult] = useState<PvgisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleEstimate() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/pvgis/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat, lon, powerKw, tiltDeg, azimuthDeg, shadeLossPct, systemLossPct })
      });

      const payload = (await response.json()) as { ok: boolean; result?: PvgisResult; error?: string };

      if (!response.ok || !payload.ok || !payload.result) {
        throw new Error(payload.error ?? "No se pudo calcular con PVGIS");
      }

      setResult(payload.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido al calcular");
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-slate-700">
        Simulador PVGIS para {municipio}. Calcula produccion anual, perdida por orientacion y perdida por sombras.
      </p>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        <label className="grid gap-1 text-sm">
          <span className="font-medium text-slate-700">Latitud</span>
          <input
            type="number"
            step={0.0001}
            value={lat}
            onChange={(e) => setLat(Number(e.target.value || 0))}
            className="rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>

        <label className="grid gap-1 text-sm">
          <span className="font-medium text-slate-700">Longitud</span>
          <input
            type="number"
            step={0.0001}
            value={lon}
            onChange={(e) => setLon(Number(e.target.value || 0))}
            className="rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>

        <label className="grid gap-1 text-sm">
          <span className="font-medium text-slate-700">Potencia (kW)</span>
          <input
            type="number"
            min={0.5}
            step={0.1}
            value={powerKw}
            onChange={(e) => setPowerKw(Number(e.target.value || 0))}
            className="rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>

        <label className="grid gap-1 text-sm">
          <span className="font-medium text-slate-700">Inclinacion (grados)</span>
          <input
            type="number"
            min={0}
            max={90}
            step={1}
            value={tiltDeg}
            onChange={(e) => setTiltDeg(Number(e.target.value || 0))}
            className="rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>

        <label className="grid gap-1 text-sm">
          <span className="font-medium text-slate-700">Azimut (grados, sur=0)</span>
          <input
            type="number"
            min={-180}
            max={180}
            step={1}
            value={azimuthDeg}
            onChange={(e) => setAzimuthDeg(Number(e.target.value || 0))}
            className="rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>

        <label className="grid gap-1 text-sm">
          <span className="font-medium text-slate-700">Perdida por sombras (%)</span>
          <input
            type="number"
            min={0}
            max={80}
            step={0.5}
            value={shadeLossPct}
            onChange={(e) => setShadeLossPct(Number(e.target.value || 0))}
            className="rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>
      </div>

      <label className="grid gap-1 text-sm md:max-w-xs">
        <span className="font-medium text-slate-700">Perdidas del sistema (%)</span>
        <input
          type="number"
          min={0}
          max={40}
          step={0.5}
          value={systemLossPct}
          onChange={(e) => setSystemLossPct(Number(e.target.value || 0))}
          className="rounded-lg border border-slate-300 px-3 py-2"
        />
      </label>

      <button
        type="button"
        onClick={handleEstimate}
        disabled={loading}
        className="rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-70"
      >
        {loading ? "Calculando..." : "Calcular con PVGIS"}
      </button>

      {error ? <p className="text-sm font-medium text-red-700">{error}</p> : null}

      {result ? (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          <article className="card">
            <h3 className="text-sm font-medium text-slate-500">Produccion anual estimada</h3>
            <p className="mt-2 text-xl font-semibold">{result.annualProductionKwh.toLocaleString("es-ES")} kWh</p>
          </article>
          <article className="card">
            <h3 className="text-sm font-medium text-slate-500">Perdida por orientacion</h3>
            <p className="mt-2 text-xl font-semibold">{result.orientationLossPct}%</p>
          </article>
          <article className="card">
            <h3 className="text-sm font-medium text-slate-500">Perdida por sombras</h3>
            <p className="mt-2 text-xl font-semibold">{result.shadeLossPct}%</p>
          </article>
          <article className="card">
            <h3 className="text-sm font-medium text-slate-500">PVGIS anual orientacion optima</h3>
            <p className="mt-2 text-xl font-semibold">{result.pvgisAnnualOptimalKwh.toLocaleString("es-ES")} kWh</p>
          </article>
          <article className="card">
            <h3 className="text-sm font-medium text-slate-500">PVGIS anual orientacion seleccionada</h3>
            <p className="mt-2 text-xl font-semibold">{result.pvgisAnnualSelectedKwh.toLocaleString("es-ES")} kWh</p>
          </article>
          <article className="card">
            <h3 className="text-sm font-medium text-slate-500">Produccion sin sombras</h3>
            <p className="mt-2 text-xl font-semibold">
              {result.annualProductionWithoutShadeKwh.toLocaleString("es-ES")} kWh
            </p>
          </article>
        </div>
      ) : null}
    </div>
  );
}
