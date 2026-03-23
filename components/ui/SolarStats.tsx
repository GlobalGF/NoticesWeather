"use client";

import { useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type SolarStatsData = {
  radiacion_solar: number;
  horas_sol: number;
  ahorro_estimado: number;
};

type MunicipioSolarRow = {
  irradiacion_solar: number | null;
  horas_sol: number | null;
  ahorro_estimado: number | null;
};

type SolarStatsProps = {
  slug: string;
  className?: string;
  title?: string;
};

function formatNumber(value: number, maximumFractionDigits = 0): string {
  return value.toLocaleString("es-ES", { maximumFractionDigits });
}

function resolveWrapperClass(className?: string): string {
  const base = "rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6";
  return className ? `${base} ${className}` : base;
}

export function SolarStats({ slug, className, title = "Datos solares en tiempo real" }: SolarStatsProps) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [data, setData] = useState<SolarStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      setLoading(true);
      setError(null);

      const { data: row, error: queryError } = await supabase
        .from("municipios_energia")
        .select("irradiacion_solar, horas_sol, ahorro_estimado")
        .eq("slug", slug)
        .maybeSingle();

      if (!isMounted) return;

      if (queryError) {
        setError("No se pudieron cargar las metricas solares.");
        setData(null);
        setLoading(false);
        return;
      }

      if (!row) {
        setError("No hay datos disponibles para este municipio.");
        setData(null);
        setLoading(false);
        return;
      }

      const typedRow = row as MunicipioSolarRow;

      setData({
        radiacion_solar: Number(typedRow.irradiacion_solar ?? 0),
        horas_sol: Number(typedRow.horas_sol ?? 0),
        ahorro_estimado: Number(typedRow.ahorro_estimado ?? 0)
      });
      setLoading(false);
    }

    void load();

    return () => {
      isMounted = false;
    };
  }, [slug, supabase]);

  return (
    <section className={resolveWrapperClass(className)} aria-live="polite" aria-busy={loading}>
      <header className="mb-4">
        <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
          <span aria-hidden="true" className="text-blue-600 mr-1">📡</span> {title}
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          M\u00e9tricas servidas directamente desde la base de datos (Supabase).
        </p>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="h-28 animate-pulse rounded border border-slate-100 bg-slate-50" />
          <div className="h-28 animate-pulse rounded border border-slate-100 bg-slate-50" />
          <div className="h-28 animate-pulse rounded border border-slate-100 bg-slate-50" />
        </div>
      ) : null}

      {!loading && error ? (
        <div className="rounded border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800">{error}</div>
      ) : null}

      {!loading && !error && data ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <article className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <p className="text-[11px] font-bold uppercase tracking-widest text-amber-600">Irradiaci\u00f3n solar</p>
            <p className="mt-3 text-3xl font-extrabold text-amber-900 tabular-nums leading-none">{formatNumber(data.radiacion_solar, 1)}</p>
            <p className="mt-1 text-xs text-amber-700 font-medium">kWh/m² al año</p>
          </article>

          <article className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Horas de sol</p>
            <p className="mt-3 text-3xl font-bold text-slate-900 tabular-nums leading-none">{formatNumber(data.horas_sol)}</p>
            <p className="mt-1 text-xs text-slate-500 font-medium">horas al año</p>
          </article>

          <article className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <p className="text-[11px] font-bold uppercase tracking-widest text-blue-700">Ahorro estimado</p>
            <p className="mt-3 text-3xl font-extrabold text-blue-900 tabular-nums leading-none">{formatNumber(data.ahorro_estimado, 0)} €</p>
            <p className="mt-1 text-xs text-blue-600 font-medium">estimación anual</p>
          </article>
        </div>
      ) : null}
    </section>
  );
}
