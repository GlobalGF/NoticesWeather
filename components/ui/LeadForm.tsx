"use client";

import { useState, useId, useEffect } from "react";
import { 
  Building2, 
  Home, 
  Warehouse, 
  Sun, 
  ChevronLeft, 
  Mail, 
  Phone, 
  User, 
  MapPin, 
  Map,
  ShieldCheck,
  Zap
} from "lucide-react";

/* ── Types ─────────────────────────────────────────────── */
type TipoVivienda = "unifamiliar" | "piso" | "empresa";

interface LeadFormProps {
    municipio: string;
    municipioSlug: string;
    provincia: string;
    ahorroEstimado?: number | null; 
    irradiacionSolar?: number | null;
}

type FormState = {
    tipo_vivienda: TipoVivienda;
    consumo_kwh: string;
    nombre: string;
    email: string;
    telefono: string;
    codigo_postal: string;
    direccion: string;
};

/* ── Helpers ────────────────────────────────────────────── */
function fmt(n: number) {
    return n.toLocaleString("es-ES", { maximumFractionDigits: 0 });
}

const TIPO_OPTIONS: { value: TipoVivienda; label: string; icon: any; desc: string }[] = [
    { value: "unifamiliar", label: "Casa / Chalet", icon: Home, desc: "Cubierta propia" },
    { value: "piso", label: "Piso", icon: Building2, desc: "Cubierta común" },
    { value: "empresa", label: "Empresa", icon: Warehouse, desc: "Nave o local" },
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
        email: "",
        telefono: "",
        codigo_postal: "",
        direccion: "",
    });

    // Listen for direct request hash
    useEffect(() => {
        const handleHash = () => {
            if (window.location.hash === "#solicitar") {
                setStep(2);
                const el = document.getElementById("lead-form");
                if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
            }
        };
        handleHash();
        window.addEventListener("hashchange", handleHash);
        return () => window.removeEventListener("hashchange", handleHash);
    }, []);

    function set<K extends keyof FormState>(key: K, val: FormState[K]) {
        setForm((f) => ({ ...f, [key]: val }));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        // Validations
        const tel = form.telefono.replace(/\s/g, "").replace(/-/g, "");
        if (!/^[6789]\d{8}$/.test(tel)) {
            setError("Introduce un teléfono español válido (9 dígitos).");
            return;
        }
        if (!form.email.includes("@") || form.email.length < 5) {
            setError("Introduce un email válido.");
            return;
        }
        if (form.nombre.trim().length < 2) {
            setError("Por favor, introduce tu nombre.");
            return;
        }
        if (form.codigo_postal.length !== 5) {
            setError("Código postal inválido.");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/leads", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nombre: form.nombre.trim(),
                    email: form.email.trim(),
                    telefono: tel,
                    codigo_postal: form.codigo_postal,
                    direccion: form.direccion.trim(),
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

    const savingsHook =
        ahorroEstimado && ahorroEstimado > 100
            ? `Ahorra hasta ${fmt(ahorroEstimado)} €/año`
            : "Solicita tu presupuesto sin compromiso";

    /* ── Step 1: Pre-qualify ─────────────────────────────── */
    if (step === 1) {
        return (
            <section
                className="mt-10 rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-2xl shadow-slate-200/50 font-manrope relative overflow-hidden"
                aria-label="Calcula tu instalación solar"
                id="lead-form"
            >
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-3xl -mr-16 -mt-16" />
                
                <div className="flex items-start gap-4 mb-8">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 shadow-sm border border-amber-200/50">
                        <Sun className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-slate-900 leading-tight">
                            {savingsHook}
                        </h2>
                        <p className="mt-1 text-xs font-bold text-slate-400 uppercase tracking-widest">
                            Análisis gratuito en {municipio}
                        </p>
                    </div>
                </div>

                {irradiacionSolar && irradiacionSolar > 0 && (
                    <div className="mb-8 flex items-center gap-2 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                        <Zap className="w-4 h-4 text-blue-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                            Recurso Solar: <span className="text-blue-600 font-bold">{Math.round(irradiacionSolar)} kWh/m²</span>
                        </span>
                    </div>
                )}

                <div className="space-y-6">
                    <fieldset>
                        <legend className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">
                            Tipo de inmueble
                        </legend>
                        <div className="grid grid-cols-3 gap-3">
                            {TIPO_OPTIONS.map((opt) => {
                                const Icon = opt.icon;
                                return (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => set("tipo_vivienda", opt.value)}
                                        className={[
                                            "flex flex-col items-center gap-2 rounded-2xl border-2 p-4 text-center transition-all duration-300",
                                            form.tipo_vivienda === opt.value
                                                ? "border-amber-400 bg-amber-50 text-slate-900 shadow-inner"
                                                : "border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200 hover:bg-white",
                                        ].join(" ")}
                                    >
                                        <Icon className={["w-6 h-6 transition-transform", form.tipo_vivienda === opt.value ? "text-amber-500 scale-110" : "text-slate-300"].join(" ")} />
                                        <span className="text-[9px] font-black uppercase tracking-wider leading-tight">{opt.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </fieldset>

                    <div>
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 block">
                            Consumo aproximado
                        </label>
                        <select
                            id={`${uid}-consumo`}
                            value={form.consumo_kwh}
                            onChange={(e) => set("consumo_kwh", e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-bold text-slate-800 shadow-sm focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all appearance-none"
                            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.2rem' }}
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
                        className="group w-full rounded-2xl bg-slate-900 p-5 text-sm font-black text-white shadow-xl hover:bg-black transition-all hover:-translate-y-0.5"
                    >
                        <span className="flex items-center justify-center gap-2">
                            Ver Presupuesto Gratis <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </span>
                    </button>
                </div>

                <p className="mt-6 text-center text-[9px] font-black uppercase tracking-widest text-slate-400 flex items-center justify-center gap-2">
                    <ShieldCheck className="w-3 h-3 text-emerald-500" />
                    Sin compromiso · RGPD Garantizada
                </p>
            </section>
        );
    }

    /* ── Step 2: Full Contact ────────────────────────────── */
    if (step === 2) {
        return (
            <section
                className="mt-10 rounded-[2.5rem] border border-blue-200 bg-white p-8 shadow-2xl shadow-blue-200/50 font-manrope relative overflow-hidden"
                aria-label="Introduce tus datos de contacto"
                id="lead-form"
            >
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl -mr-16 -mt-16" />
                
                <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="mb-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors"
                >
                    <ChevronLeft className="w-3.5 h-3.5" /> Volver al Inicio
                </button>

                <div className="flex items-start gap-4 mb-8">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 shadow-sm border border-blue-200/50">
                        <MapPin className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-slate-900 leading-tight">
                            ¿Dónde enviamos el estudio?
                        </h2>
                        <p className="mt-1 text-xs font-bold text-slate-400 uppercase tracking-widest">
                            Un experto en {provincia} te contactará
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                    <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Nombre completo"
                            value={form.nombre}
                            onChange={(e) => set("nombre", e.target.value)}
                            className="w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 py-4 text-sm font-bold text-slate-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-sm"
                            required
                        />
                    </div>

                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="email"
                            placeholder="Email de contacto"
                            value={form.email}
                            onChange={(e) => set("email", e.target.value)}
                            className="w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 py-4 text-sm font-bold text-slate-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-sm"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="tel"
                                placeholder="Teléfono"
                                value={form.telefono}
                                onChange={(e) => set("telefono", e.target.value)}
                                className="w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 py-4 text-sm font-bold text-slate-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-sm"
                                required
                            />
                        </div>
                        <div className="relative">
                            <Map className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="C.P."
                                maxLength={5}
                                value={form.codigo_postal}
                                onChange={(e) => set("codigo_postal", e.target.value.replace(/\D/g, ""))}
                                className="w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 py-4 text-sm font-bold text-slate-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-sm"
                                required
                            />
                        </div>
                    </div>

                    <div className="relative">
                        <MapPin className="absolute left-4 top-4 w-4 h-4 text-slate-400" />
                        <textarea
                            placeholder="Dirección o detalles adicionales (opcional)"
                            rows={2}
                            value={form.direccion}
                            onChange={(e) => set("direccion", e.target.value)}
                            className="w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 py-4 text-sm font-bold text-slate-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-sm resize-none"
                        />
                    </div>

                    {error && (
                        <p role="alert" className="text-[10px] font-black uppercase tracking-widest text-rose-500 bg-rose-50 p-3 rounded-xl border border-rose-100 italic">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-2xl bg-blue-600 p-5 text-sm font-black text-white shadow-xl hover:bg-blue-700 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Sincronizando..." : "Solicitar Presupuesto VIP →"}
                    </button>

                    <p className="text-[9px] text-slate-400 leading-relaxed text-center font-medium">
                        Al enviar confirmas que has leído y aceptas nuestra{" "}
                        <a href="/legal/politica-privacidad" className="text-slate-900 underline font-bold">
                            política de privacidad
                        </a>
                        .
                    </p>
                </form>
            </section>
        );
    }

    /* ── Step 3: Success ─────────────────────────────────── */
    return (
        <section
            className="mt-10 rounded-[2.5rem] border border-emerald-200 bg-white p-12 shadow-2xl shadow-emerald-200/50 text-center font-manrope relative"
            id="lead-form"
        >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-4 rounded-full border border-emerald-100 shadow-xl">
                <div className="h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 flex">
                   <CheckCircle2 className="w-8 h-8" />
                </div>
            </div>

            <h2 className="text-2xl font-black text-slate-900 mt-4 leading-tight">¡Solicitud VIP<br/>Recibida!</h2>
            <p className="mt-4 text-sm font-medium text-slate-500 leading-relaxed max-w-xs mx-auto">
                Un técnico certificado en <span className='font-bold'>{provincia}</span> revisará tu caso y te contactará en menos de 24 horas.
            </p>
            
            {ahorroEstimado && ahorroEstimado > 100 && (
                <div className="mt-8 p-6 rounded-[2rem] bg-emerald-50 border border-emerald-100">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 mb-2">
                        Ahorro proyectado
                    </p>
                    <p className="text-4xl font-black text-emerald-900 tracking-tighter">
                        {fmt(ahorroEstimado)}€<span className="text-xl text-emerald-700/60">/año</span>
                    </p>
                </div>
            )}
            
            <button 
                onClick={() => setStep(1)}
                className="mt-8 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors"
            >
                Volver al simulador
            </button>
        </section>
    );
}

const ArrowRight = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
);

const CheckCircle2 = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
);
