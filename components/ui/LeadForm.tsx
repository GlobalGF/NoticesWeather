/**
 * LeadForm — 2-step lead capture form for solar municipality pages.
 *
 * Step 1: Vivienda type + estimated consumption (pre-qualify)
 * Step 2: Contact info (nombre + teléfono)
 * Step 3: Success screen with personalised savings hook
 *
 * Client component. Submits to /api/leads via fetch.
 * Design: matches the existing Tailwind slate/blue/amber palette.
 */

"use client";

import { useState, useId } from "react";

/* ── Types ─────────────────────────────────────────────── */
type TipoVivienda = "unifamiliar" | "piso" | "empresa";

interface LeadFormProps {
    municipio: string;
    municipioSlug: string;
    provincia: string;
    ahorroEstimado?: number | null; // €/año from Supabase
    irradiacionSolar?: number | null;
}

type FormState = {
    tipo_vivienda: TipoVivienda;
    consumo_kwh: string;
    nombre: string;
    telefono: string;
};

/* ── Helpers ────────────────────────────────────────────── */
function fmt(n: number) {
    return n.toLocaleString("es-ES", { maximumFractionDigits: 0 });
}

const TIPO_OPTIONS: { value: TipoVivienda; label: string; icon: string; desc: string }[] = [
    { value: "unifamiliar", label: "Casa / Chalet", icon: "🏠", desc: "Cubierta propia disponible" },
    { value: "piso", label: "Piso", icon: "🏢", desc: "Comunidad o cubierta común" },
    { value: "empresa", label: "Empresa", icon: "🏭", desc: "Nave o local comercial" },
];

const CONSUMO_OPTIONS = [
    { label: "Bajo (2.000 kWh/año)", value: "2000" },
    { label: "Medio (4.000 kWh/año)", value: "4000" },
    { label: "Alto (7.000 kWh/año)", value: "7000" },
    { label: "Muy alto (+10.000 kWh/año)", value: "10000" },
];

/* ── Component ──────────────────────────────────────────── */
export function LeadForm({
    municipio,
    municipioSlug,
    provincia,
    ahorroEstimado,
    irradiacionSolar,
}: LeadFormProps) {
    const uid = useId();
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [form, setForm] = useState<FormState>({
        tipo_vivienda: "unifamiliar",
        consumo_kwh: "4000",
        nombre: "",
        telefono: "",
    });

    function set<K extends keyof FormState>(key: K, val: FormState[K]) {
        setForm((f) => ({ ...f, [key]: val }));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        const tel = form.telefono.replace(/\s/g, "").replace(/-/g, "");
        if (!/^[6789]\d{8}$/.test(tel)) {
            setError("Introduce un teléfono español válido de 9 dígitos.");
            return;
        }
        if (form.nombre.trim().length < 2) {
            setError("Por favor, introduce tu nombre.");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/leads", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nombre: form.nombre.trim(),
                    telefono: tel,
                    tipo_vivienda: form.tipo_vivienda,
                    consumo_kwh: parseInt(form.consumo_kwh, 10),
                    municipio: municipio,
                    municipio_slug: municipioSlug,
                    provincia,
                }),
            });

            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body?.error ?? "Error al enviar. Inténtalo de nuevo.");
            }
            setStep(3);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Error inesperado.");
        } finally {
            setLoading(false);
        }
    }

    /* Estimated savings to show as a hook */
    const savingsHook =
        ahorroEstimado && ahorroEstimado > 100
            ? `Ahorra hasta ${fmt(ahorroEstimado)} €/año`
            : "Solicita tu presupuesto sin compromiso";

    /* ── Step 1: Pre-qualify ─────────────────────────────── */
    if (step === 1) {
        return (
            <section
                className="mt-10 rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-6 shadow-md"
                aria-label="Calcula tu instalación solar"
                id="lead-form"
            >
                {/* Header */}
                <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-400 text-xl shadow">
                        ☀️
                    </span>
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">
                            {savingsHook} en {municipio}
                        </h2>
                        <p className="mt-0.5 text-sm text-slate-500">
                            Calcula en 30 segundos cuánto puedes ahorrar con tu instalación solar.
                        </p>
                    </div>
                </div>

                {/* Irradiation badge */}
                {irradiacionSolar && irradiacionSolar > 0 && (
                    <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 border border-blue-100">
                        <span aria-hidden="true">📡</span>
                        Radiación en {municipio}:{" "}
                        <strong>{Math.round(irradiacionSolar)} kWh/m²/año</strong>
                    </div>
                )}

                {/* Step 1 form body */}
                <div className="mt-6 space-y-5">
                    {/* Tipo de vivienda */}
                    <fieldset>
                        <legend className="text-sm font-semibold text-slate-700 mb-2">
                            ¿Qué tipo de inmueble es?
                        </legend>
                        <div className="grid grid-cols-3 gap-2">
                            {TIPO_OPTIONS.map((opt) => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => set("tipo_vivienda", opt.value)}
                                    className={[
                                        "flex flex-col items-center gap-1 rounded-xl border-2 px-2 py-3 text-center text-xs font-semibold transition-all",
                                        form.tipo_vivienda === opt.value
                                            ? "border-amber-400 bg-amber-50 text-slate-900 shadow-sm"
                                            : "border-slate-200 bg-white text-slate-500 hover:border-slate-300",
                                    ].join(" ")}
                                    aria-pressed={form.tipo_vivienda === opt.value}
                                >
                                    <span className="text-2xl">{opt.icon}</span>
                                    <span>{opt.label}</span>
                                    <span className="font-normal text-slate-400">{opt.desc}</span>
                                </button>
                            ))}
                        </div>
                    </fieldset>

                    {/* Consumo anual */}
                    <div>
                        <label
                            htmlFor={`${uid}-consumo`}
                            className="block text-sm font-semibold text-slate-700 mb-2"
                        >
                            ¿Cuánto consumes al año?
                        </label>
                        <select
                            id={`${uid}-consumo`}
                            value={form.consumo_kwh}
                            onChange={(e) => set("consumo_kwh", e.target.value)}
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                        >
                            {CONSUMO_OPTIONS.map((o) => (
                                <option key={o.value} value={o.value}>
                                    {o.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="w-full rounded-xl bg-amber-400 px-6 py-3 text-sm font-bold text-slate-900 shadow hover:bg-amber-500 active:scale-[0.98] transition-all"
                    >
                        Ver mi presupuesto personalizado →
                    </button>
                </div>

                <p className="mt-3 text-center text-xs text-slate-400">
                    Sin compromiso · Tus datos son confidenciales
                </p>
            </section>
        );
    }

    /* ── Step 2: Contact ─────────────────────────────────── */
    if (step === 2) {
        return (
            <section
                className="mt-10 rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-6 shadow-md"
                aria-label="Introduce tus datos de contacto"
                id="lead-form"
            >
                <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="mb-4 flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors"
                >
                    ← Cambiar tipo de vivienda
                </button>

                <div className="flex items-start gap-3 mb-5">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-500 text-xl text-white shadow">
                        📋
                    </span>
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">
                            ¿Dónde te enviamos el presupuesto?
                        </h2>
                        <p className="mt-0.5 text-sm text-slate-500">
                            Un instalador certificado en {provincia} te llamará sin compromiso.
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                    {/* Nombre */}
                    <div>
                        <label
                            htmlFor={`${uid}-nombre`}
                            className="block text-sm font-semibold text-slate-700 mb-1"
                        >
                            Tu nombre
                        </label>
                        <input
                            id={`${uid}-nombre`}
                            type="text"
                            autoComplete="given-name"
                            placeholder="Ej: María García"
                            value={form.nombre}
                            onChange={(e) => set("nombre", e.target.value)}
                            required
                            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                        />
                    </div>

                    {/* Teléfono */}
                    <div>
                        <label
                            htmlFor={`${uid}-telefono`}
                            className="block text-sm font-semibold text-slate-700 mb-1"
                        >
                            Teléfono de contacto
                        </label>
                        <input
                            id={`${uid}-telefono`}
                            type="tel"
                            autoComplete="tel"
                            placeholder="6XX XXX XXX"
                            value={form.telefono}
                            onChange={(e) => set("telefono", e.target.value)}
                            required
                            maxLength={12}
                            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                        />
                        <p className="mt-1 text-xs text-slate-400">Solo llamadas en horario comercial.</p>
                    </div>

                    {/* Error */}
                    {error && (
                        <p
                            role="alert"
                            className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700"
                        >
                            {error}
                        </p>
                    )}

                    {/* GDPR consent inline */}
                    <p className="text-xs text-slate-400 leading-relaxed">
                        Al enviar aceptas que tus datos sean cedidos a instaladores solares certificados en tu zona.
                        Consulta nuestra{" "}
                        <a href="/legal/politica-privacidad" className="underline hover:text-slate-600">
                            política de privacidad
                        </a>
                        .
                    </p>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {loading ? "Enviando…" : "Solicitar presupuesto gratuito"}
                    </button>
                </form>
            </section>
        );
    }

    /* ── Step 3: Success ─────────────────────────────────── */
    return (
        <section
            className="mt-10 rounded-2xl border border-green-200 bg-gradient-to-br from-green-50 to-white p-8 shadow-md text-center"
            aria-label="Solicitud enviada"
            id="lead-form"
        >
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl">
                ✅
            </div>
            <h2 className="text-xl font-bold text-slate-900">¡Solicitud recibida!</h2>
            <p className="mt-2 text-sm text-slate-600 max-w-sm mx-auto">
                Un técnico instalador en <strong>{provincia}</strong> se pondrá en contacto contigo en menos de 24 horas en horario comercial.
            </p>
            {ahorroEstimado && ahorroEstimado > 100 && (
                <div className="mt-5 inline-block rounded-xl bg-amber-400 px-5 py-3">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-800 opacity-80">
                        Ahorro estimado medio en {municipio}
                    </p>
                    <p className="mt-0.5 text-3xl font-extrabold text-slate-900">
                        {fmt(ahorroEstimado)} €/año
                    </p>
                </div>
            )}
            <p className="mt-5 text-xs text-slate-400">
                También puedes llamar directamente a cualquier instalador certificado de tu provincia.
            </p>
        </section>
    );
}
