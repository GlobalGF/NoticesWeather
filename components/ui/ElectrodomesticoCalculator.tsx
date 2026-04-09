"use client";

import { useState, useMemo } from "react";

/* ── Each appliance asks a REAL question to estimate kWh ── */
interface ApplianceDef {
  id: string;
  name: string;
  letter: string;
  color: string;
  /** What we ask the user */
  question: string;
  /** Unit label shown next to the stepper */
  inputLabel: string;
  /** Explanation shown under the question */
  hint: string;
  /** Default value */
  defaultVal: number;
  /** Max value */
  max: number;
  /** kWh consumed per 1 unit of the input */
  kWhPerUnit: number;
  /** Multiply by this to get monthly kWh (e.g. weekly→monthly = 4.33, daily→monthly = 30) */
  toMonthly: number;
}

const APPLIANCES: ApplianceDef[] = [
  {
    id: "lavadora", name: "Lavadora", letter: "L", color: "bg-blue-100 text-blue-600",
    question: "¿Cuántas lavadoras pones a la semana?",
    inputLabel: "lavados/semana",
    hint: "Cada lavado consume ~1,2 kWh (ciclo 40°C)",
    defaultVal: 4, max: 20, kWhPerUnit: 1.2, toMonthly: 4.33,
  },
  {
    id: "lavavajillas", name: "Lavavajillas", letter: "V", color: "bg-cyan-100 text-cyan-600",
    question: "¿Cuántas veces usas el lavavajillas a la semana?",
    inputLabel: "ciclos/semana",
    hint: "Un ciclo eco consume ~1,0 kWh · normal ~1,5 kWh",
    defaultVal: 5, max: 14, kWhPerUnit: 1.3, toMonthly: 4.33,
  },
  {
    id: "horno", name: "Horno eléctrico", letter: "H", color: "bg-orange-100 text-orange-600",
    question: "¿Cuántas horas usas el horno a la semana?",
    inputLabel: "horas/semana",
    hint: "Un horno estándar consume ~2 kWh por hora a 200°C",
    defaultVal: 2, max: 20, kWhPerUnit: 2.0, toMonthly: 4.33,
  },
  {
    id: "secadora", name: "Secadora", letter: "S", color: "bg-violet-100 text-violet-600",
    question: "¿Cuántas secadoras pones a la semana?",
    inputLabel: "ciclos/semana",
    hint: "Cada ciclo completo consume ~3,5 kWh",
    defaultVal: 0, max: 14, kWhPerUnit: 3.5, toMonthly: 4.33,
  },
  {
    id: "coche", name: "Coche eléctrico", letter: "E", color: "bg-emerald-100 text-emerald-600",
    question: "¿Cuántos km conduces a la semana?",
    inputLabel: "km/semana",
    hint: "Media de consumo: ~0,18 kWh por km",
    defaultVal: 0, max: 999, kWhPerUnit: 0.18, toMonthly: 4.33,
  },
  {
    id: "termo", name: "Termo de agua", letter: "T", color: "bg-sky-100 text-sky-600",
    question: "¿Cuántas personas viven en casa?",
    inputLabel: "personas",
    hint: "Cada persona usa ~1,5 kWh/día en agua caliente",
    defaultVal: 3, max: 10, kWhPerUnit: 1.5, toMonthly: 30,
  },
  {
    id: "aire", name: "Aire acondicionado", letter: "A", color: "bg-indigo-100 text-indigo-600",
    question: "¿Cuántas horas al día usas el aire acondicionado?",
    inputLabel: "horas/día",
    hint: "Un split inverter medio consume ~1 kWh/hora",
    defaultVal: 0, max: 24, kWhPerUnit: 1.0, toMonthly: 30,
  },
  {
    id: "vitro", name: "Vitrocerámica / Placa", letter: "P", color: "bg-amber-100 text-amber-600",
    question: "¿Cuántas horas cocinas a la semana?",
    inputLabel: "horas/semana",
    hint: "Vitrocerámica ~1,5 kWh/h · inducción ~1,2 kWh/h",
    defaultVal: 5, max: 30, kWhPerUnit: 1.4, toMonthly: 4.33,
  },
];

interface Props {
  precioPunta: number;
  precioValle: number;
  precioLlano: number;
}

export function ElectrodomesticoCalculator({ precioPunta, precioValle }: Props) {
  const [vals, setVals] = useState<Record<string, number>>(() =>
    Object.fromEntries(APPLIANCES.map((a) => [a.id, a.defaultVal]))
  );

  const fmt = (n: number) => n.toFixed(2);
  const fmtKwh = (n: number) => n.toFixed(1);

  const priceCaro = Math.max(precioPunta, precioValle);
  const priceBarato = Math.min(precioPunta, precioValle);
  const diffPerKwh = priceCaro - priceBarato;

  const inc = (id: string, max: number) =>
    setVals((p) => ({ ...p, [id]: Math.min((p[id] ?? 0) + 1, max) }));
  const dec = (id: string) =>
    setVals((p) => ({ ...p, [id]: Math.max((p[id] ?? 0) - 1, 0) }));
  const setVal = (id: string, v: string, max: number) => {
    const n = parseInt(v, 10);
    setVals((p) => ({ ...p, [id]: Number.isNaN(n) || n < 0 ? 0 : Math.min(n, max) }));
  };

  const results = useMemo(() => {
    const items = APPLIANCES.map((a) => {
      const input = vals[a.id] ?? 0;
      const kWhMonth = input * a.kWhPerUnit * a.toMonthly;
      const costCaro = kWhMonth * priceCaro;
      const costBarato = kWhMonth * priceBarato;
      return { ...a, input, kWhMonth, costCaro, costBarato, saving: costCaro - costBarato };
    });
    const totCaro = items.reduce((s, i) => s + i.costCaro, 0);
    const totBarato = items.reduce((s, i) => s + i.costBarato, 0);
    const totSaving = totCaro - totBarato;
    const totKwh = items.reduce((s, i) => s + i.kWhMonth, 0);
    return { items, totCaro, totBarato, totSaving, totKwh };
  }, [vals, priceCaro, priceBarato]);

  return (
    <div>
      {/* ── Appliance cards ── */}
      <div className="grid sm:grid-cols-2 gap-4">
        {results.items.map((item) => (
          <div
            key={item.id}
            className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 transition-colors hover:border-indigo-200"
          >
            {/* Header */}
            <div className="flex items-center gap-3 mb-3">
              <span className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center font-black text-base ${item.color}`}>
                {item.letter}
              </span>
              <p className="font-bold text-slate-800 text-sm sm:text-base">{item.name}</p>
            </div>

            {/* Question */}
            <p className="text-sm text-slate-700 font-medium mb-2">{item.question}</p>

            {/* Stepper + input */}
            <div className="flex items-center gap-2 mb-2">
              <button
                type="button"
                onClick={() => dec(item.id)}
                disabled={item.input <= 0}
                aria-label={`Reducir ${item.name}`}
                className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 text-slate-500 font-bold text-lg hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                −
              </button>
              <input
                type="number"
                min={0}
                max={item.max}
                value={item.input}
                onChange={(e) => setVal(item.id, e.target.value, item.max)}
                className="w-16 h-9 rounded-lg border border-slate-300 text-center text-sm font-black text-slate-800 tabular-nums focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 outline-none"
              />
              <button
                type="button"
                onClick={() => inc(item.id, item.max)}
                disabled={item.input >= item.max}
                aria-label={`Aumentar ${item.name}`}
                className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 text-slate-500 font-bold text-lg hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                +
              </button>
              <span className="text-xs text-slate-400 ml-1">{item.inputLabel}</span>
            </div>

            {/* Hint + result */}
            <p className="text-[11px] text-slate-400 mb-1">{item.hint}</p>
            {item.input > 0 && (
              <p className="text-xs font-semibold text-indigo-600 tabular-nums">
                Consumo estimado: {fmtKwh(item.kWhMonth)} kWh/mes
                {item.saving > 0.01 && <span className="text-emerald-600 ml-2">(ahorras {fmt(item.saving)} €/mes en franja barata)</span>}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* ── Results panel ── */}
      {results.totKwh > 0 && (() => {
        const saving = results.totSaving;
        const savingYear = saving * 12;
        const hasSaving = diffPerKwh > 0.002;

        return (
          <div className="mt-8 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 text-white p-6 md:p-8">
            {/* Monthly consumption */}
            <div className="flex items-center justify-between mb-6 pb-5 border-b border-slate-700">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Tu consumo mensual estimado</p>
                <p className="text-sm text-slate-300">Basado en tus respuestas</p>
              </div>
              <p className="text-3xl md:text-4xl font-black tabular-nums whitespace-nowrap">
                {fmtKwh(results.totKwh)} <span className="text-base font-bold text-slate-400">kWh</span>
              </p>
            </div>

            {/* Cost comparison */}
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">¿Cuánto pagas según la franja?</p>
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-red-400 w-24 shrink-0">Franja más cara</span>
                <div className="flex-1 h-8 rounded-lg bg-slate-700/50 overflow-hidden">
                  <div className="h-full rounded-lg bg-red-500/60 transition-all duration-500" style={{ width: "100%" }} />
                </div>
                <span className="text-sm font-black tabular-nums w-20 text-right text-red-400">{fmt(results.totCaro)} €</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-emerald-400 w-24 shrink-0">Franja barata</span>
                <div className="flex-1 h-8 rounded-lg bg-slate-700/50 overflow-hidden">
                  <div
                    className="h-full rounded-lg bg-emerald-500/60 transition-all duration-500"
                    style={{ width: `${results.totCaro > 0 ? (results.totBarato / results.totCaro) * 100 : 100}%` }}
                  />
                </div>
                <span className="text-sm font-black tabular-nums w-20 text-right text-emerald-400">{fmt(results.totBarato)} €</span>
              </div>
            </div>

            {hasSaving ? (
              <div className="rounded-xl bg-emerald-600/20 border border-emerald-500/30 px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <p className="font-bold text-sm">Si programas todo a la franja más barata</p>
                  <p className="text-xs text-emerald-300/80">Noches (00–08h) y fines de semana completos</p>
                </div>
                <div className="text-right">
                  <p className="text-4xl md:text-5xl font-black tabular-nums text-emerald-400 whitespace-nowrap">
                    {fmt(savingYear)} €<span className="text-base font-bold text-emerald-300">/año</span>
                  </p>
                  <p className="text-xs text-emerald-300/70 mt-0.5">de ahorro ({fmt(saving)} €/mes)</p>
                </div>
              </div>
            ) : (
              <div className="rounded-xl bg-amber-600/20 border border-amber-500/30 px-5 py-4 text-center">
                <p className="font-bold text-sm text-amber-300">Hoy los precios entre franjas son prácticamente iguales</p>
                <p className="text-xs text-amber-200/70 mt-1">Normalmente la diferencia es mayor. Consulta mañana para ver el ahorro real.</p>
              </div>
            )}

            <p className="text-[11px] text-slate-500 mt-4 text-center">
              Precios PVPC de hoy: más caro {priceCaro.toFixed(3)} €/kWh · más barato {priceBarato.toFixed(3)} €/kWh
            </p>
          </div>
        );
      })()}
    </div>
  );
}
