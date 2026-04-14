"use client";

import { useMemo, useState } from "react";
import { calculateSolarLeadValue, type HousingType } from "@/calculators/lead-value";

type LeadCaptureFormProps = {
  municipio: string;
  provincia?: string;
  precioLuzEurKwh?: number;
};

type FormState = {
  vivienda: string;
  consumoMensual: string;
  tejado: string;
  nombre: string;
  telefono: string;
  email: string;
  bateria: string;
};

const TOTAL_STEPS = 5;

const initialState: FormState = {
  vivienda: "",
  consumoMensual: "",
  tejado: "",
  nombre: "",
  telefono: "",
  email: "",
  bateria: ""
};

function isValidEmail(value: string) {
  return /.+@.+\..+/.test(value);
}

function isValidPhone(value: string) {
  const clean = value.replace(/\s+/g, "");
  return /^[+]?\d{9,15}$/.test(clean);
}

export function LeadCaptureForm({ municipio, provincia, precioLuzEurKwh }: LeadCaptureFormProps) {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(initialState);

  const location = provincia ?? municipio;
  const electricityPrice = Math.max(0.05, precioLuzEurKwh ?? 0.22);

  const monthlyConsumptionKwh = useMemo(() => {
    if (form.consumoMensual === "Menos de 60 EUR") return (50 / electricityPrice);
    if (form.consumoMensual === "60-120 EUR") return (90 / electricityPrice);
    if (form.consumoMensual === "120-200 EUR") return (160 / electricityPrice);
    if (form.consumoMensual === "Mas de 200 EUR") return (240 / electricityPrice);
    return 0;
  }, [form.consumoMensual, electricityPrice]);

  const leadValue = useMemo(() => {
    if (!form.vivienda || monthlyConsumptionKwh <= 0) return null;
      return calculateSolarLeadValue({
      monthlyConsumptionKwh,
      housingType: form.vivienda as HousingType,
      location,
      electricityPriceEurKwh: electricityPrice,
      hasInsterestInBatteries: form.bateria.includes("Sí") || form.bateria.includes("Tal vez")
    });
  }, [form.vivienda, monthlyConsumptionKwh, location, electricityPrice, form.bateria]);

  const progress = useMemo(() => Math.round((step / TOTAL_STEPS) * 100), [step]);

  const updateField = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError(null);
  };

  const trackStepEvent = (action: "next" | "submit") => {
    if (typeof window === "undefined") return;
    const payload = {
      event: "lead_form_event",
      action,
      step,
      municipio,
      leadScore: leadValue?.leadScore ?? null,
      leadTier: leadValue?.leadTier ?? null,
      leadValueEur: leadValue?.estimatedLeadValueEur ?? null
    };

    const dataLayer = (window as Window & { dataLayer?: unknown[] }).dataLayer;
    if (Array.isArray(dataLayer)) {
      dataLayer.push(payload);
    }
  };

  const validateStep = () => {
    if (step === 1 && !form.vivienda) {
      setError("Selecciona el tipo de vivienda para continuar.");
      return false;
    }

    if (step === 2 && !form.consumoMensual) {
      setError("Selecciona tu rango de consumo mensual.");
      return false;
    }

    if (step === 3 && !form.tejado) {
      setError("Indica el estado de tu tejado.");
      return false;
    }

    if (step === 4 && !form.bateria) {
      setError("Indica si te interesan las baterías.");
      return false;
    }

    if (step === 5) {
      if (!form.nombre.trim()) {
        setError("Escribe tu nombre.");
        return false;
      }
      if (!isValidPhone(form.telefono)) {
        setError("Introduce un telefono valido.");
        return false;
      }
      if (!isValidEmail(form.email)) {
        setError("Introduce un email valido.");
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    trackStepEvent("next");
    setStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
  };

  const handleBack = () => {
    setError(null);
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateStep()) return;

    trackStepEvent("submit");
    setSubmitting(true);
    setError(null);

    try {
      // Map vivienda to tipo_vivienda expected by API
      const tipoMap: Record<string, string> = {
        "Piso": "piso",
        "Casa unifamiliar": "unifamiliar",
        "Comunidad de vecinos": "empresa",
        "Local comercial": "empresa",
      };

      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: form.nombre.trim(),
          telefono: form.telefono.replace(/\s+/g, ""),
          email: form.email,
          tipo_vivienda: tipoMap[form.vivienda] ?? "unifamiliar",
          consumo_mensual: form.consumoMensual,
          tejado: form.tejado,
          bateria: form.bateria,
          municipio,
          provincia: provincia ?? "",
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "Error al enviar. Inténtalo de nuevo.");
        setSubmitting(false);
        return;
      }

      setSubmitted(true);
    } catch {
      setError("Error de conexión. Inténtalo de nuevo.");
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-white p-5">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">Solicitud recibida</p>
        <h3 className="mt-1 text-xl font-semibold text-slate-900">Tu estudio gratuito ya esta en marcha</h3>
        <p className="mt-2 text-slate-700">
          En menos de 24 horas, un asesor local de {municipio} te contactara con ahorro estimado, numero de placas
          recomendado y posibles ayudas activas.
        </p>
        {leadValue ? (
          <p className="mt-2 text-sm text-slate-700">
            Valor potencial estimado del lead: <span className='font-bold'>{leadValue.estimatedLeadValueEur.toLocaleString("es-ES")} EUR</span>
            {" "}
            ({leadValue.leadTier}).
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-emerald-200 bg-white p-5">
      <div className="mb-4">
        <div className="mb-2 flex items-center justify-between text-sm text-slate-600">
          <span>Paso {step} de 5</span>
          <span>{progress}% completado</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-emerald-100">
          <div className="h-full rounded-full bg-emerald-600 transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <h3 className="text-xl font-semibold text-slate-900">Recibe tu estudio de ahorro personalizado gratis</h3>
      <p className="mt-1 text-sm text-slate-600">Sin compromiso. Respuesta habitual en menos de 24 horas.</p>

      {step === 1 && (
        <fieldset className="mt-4 space-y-2">
          <legend className="mb-2 text-sm font-medium text-slate-800">1) Que tipo de vivienda tienes?</legend>
          {["Piso", "Casa unifamiliar", "Comunidad de vecinos", "Local comercial"].map((item) => (
            <label key={item} className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 p-3">
              <input
                type="radio"
                name="vivienda"
                value={item}
                checked={form.vivienda === item}
                onChange={(e) => updateField("vivienda", e.target.value)}
                className="h-4 w-4"
              />
              <span>{item}</span>
            </label>
          ))}
        </fieldset>
      )}

      {step === 2 && (
        <fieldset className="mt-4 space-y-2">
          <legend className="mb-2 text-sm font-medium text-slate-800">2) Cuanto pagas al mes de luz?</legend>
          {["Menos de 60 EUR", "60-120 EUR", "120-200 EUR", "Mas de 200 EUR"].map((item) => (
            <label key={item} className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 p-3">
              <input
                type="radio"
                name="consumoMensual"
                value={item}
                checked={form.consumoMensual === item}
                onChange={(e) => updateField("consumoMensual", e.target.value)}
                className="h-4 w-4"
              />
              <span>{item}</span>
            </label>
          ))}
        </fieldset>
      )}

      {step === 3 && (
        <fieldset className="mt-4 space-y-2">
          <legend className="mb-2 text-sm font-medium text-slate-800">3) Como es tu tejado?</legend>
          {["Orientado al sur", "Este u oeste", "Plano", "No lo se"].map((item) => (
            <label key={item} className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 p-3">
              <input
                type="radio"
                name="tejado"
                value={item}
                checked={form.tejado === item}
                onChange={(e) => updateField("tejado", e.target.value)}
                className="h-4 w-4"
              />
              <span>{item}</span>
            </label>
          ))}
        </fieldset>
      )}

      {step === 4 && (
        <fieldset className="mt-4 space-y-2">
          <legend className="mb-1 text-sm font-bold text-slate-900 leading-tight">4) ¿Te interesa añadir baterías de litio?</legend>
          <p className="text-xs text-slate-500 mb-3 leading-snug">Las baterías permiten usar tu energía solar por la noche y maximizar el ahorro.</p>
          {[
            { id: "si", label: "Sí, quiero ser 100% independiente" },
            { id: "talvez", label: "Tal vez, quiero ver la comparativa" },
            { id: "no", label: "No, solo quiero placas solares" }
          ].map((opt) => (
            <label key={opt.id} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-all ${form.bateria === opt.label ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500' : 'bg-white border-slate-200 hover:border-emerald-300'}`}>
              <input
                type="radio"
                name="bateria"
                value={opt.label}
                checked={form.bateria === opt.label}
                onChange={(e) => updateField("bateria", e.target.value)}
                className="h-4 w-4 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-sm font-medium text-slate-800">{opt.label}</span>
            </label>
          ))}
        </fieldset>
      )}

      {step === 5 && (
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm text-slate-800 md:col-span-2">
            Nombre
            <input
              type="text"
              value={form.nombre}
              onChange={(e) => updateField("nombre", e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2"
              placeholder="Tu nombre"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm text-slate-800">
            Telefono
            <input
              type="tel"
              value={form.telefono}
              onChange={(e) => updateField("telefono", e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2"
              placeholder="600 123 123"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm text-slate-800">
            Email
            <input
              type="email"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2"
              placeholder="tu@email.com"
            />
          </label>
        </div>
      )}

      {error && <p className="mt-3 text-sm font-medium text-red-700">{error}</p>}

      {leadValue ? (
        <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm">
          <p className="font-semibold text-emerald-900">
            Score potencial del lead: {leadValue.leadScore}/100 ({leadValue.leadTier})
          </p>
          <p className="mt-1 text-emerald-800">
            Gasto anual estimado: {leadValue.estimatedAnnualSpendEur.toLocaleString("es-ES")} EUR · Ahorro anual potencial: {" "}
            {leadValue.estimatedAnnualSavingsEur.toLocaleString("es-ES")} EUR
          </p>
        </div>
      ) : null}

      <div className="mt-5 flex flex-wrap items-center gap-3">
        {step > 1 && (
          <button
            type="button"
            onClick={handleBack}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
          >
            Volver
          </button>
        )}

        {step < TOTAL_STEPS ? (
          <button
            type="button"
            onClick={handleNext}
            className="rounded-lg bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800"
          >
            Continuar
          </button>
        ) : (
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Enviando..." : "Quiero mi estudio gratis"}
          </button>
        )}
      </div>

      <p className="mt-5 text-xs leading-relaxed text-slate-500">
        Solo llamadas en horario comercial.
      </p>
      <p className="mt-2 text-xs leading-relaxed text-slate-500">
        Al enviar aceptas que tus datos sean cedidos a instaladores solares certificados en tu zona.
        {" "}
        Consulta nuestra{" "}
        <a href="/legal/politica-privacidad" className="underline hover:text-slate-600">
          política de privacidad
        </a>.
      </p>
    </form>
  );
}
