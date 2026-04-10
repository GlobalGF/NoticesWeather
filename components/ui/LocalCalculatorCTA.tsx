"use client";

import Link from "next/link";

interface LocalCalculatorCTAProps {
  municipio: string;
  slug: string;
  variant?: "blue" | "emerald" | "slate";
}

export function LocalCalculatorCTA({ municipio, slug, variant = "blue" }: LocalCalculatorCTAProps) {
  const themes = {
    blue: {
      bg: "bg-gradient-to-br from-blue-600 to-indigo-700",
      button: "bg-white text-blue-700 hover:bg-blue-50",
      accent: "bg-blue-400/20",
      text: "text-blue-100"
    },
    emerald: {
      bg: "bg-gradient-to-br from-emerald-600 to-teal-700",
      button: "bg-white text-emerald-700 hover:bg-emerald-50",
      accent: "bg-emerald-400/20",
      text: "text-emerald-100"
    },
    slate: {
      bg: "bg-gradient-to-br from-slate-800 to-slate-900",
      button: "bg-amber-500 text-slate-950 hover:bg-amber-400",
      accent: "bg-slate-700/50",
      text: "text-slate-400"
    }
  };

  const theme = themes[variant];

  return (
    <div className={`relative overflow-hidden rounded-3xl p-8 shadow-xl ${theme.bg}`}>
      {/* Decorative circles */}
      <div className={`absolute -right-10 -top-10 h-40 w-40 rounded-full blur-3xl ${theme.accent}`} />
      <div className={`absolute -left-10 -bottom-10 h-40 w-40 rounded-full blur-3xl ${theme.accent}`} />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
        <div className="max-w-md">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-yellow-400" />
            Simulador Local {municipio}
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight leading-tight mb-3">
            ¿Cuánto puedes ahorrar instalando placas en {municipio}?
          </h2>
          <p className={`text-sm md:text-base font-light ${theme.text}`}>
            Usa nuestra calculadora gratuita con datos de irradiación real de {municipio} para dimensionar tu sistema y ver tu rentabilidad en 2 minutos.
          </p>
        </div>

        <div className="flex flex-col gap-3 shrink-0">
          <Link
            href={`/calculadoras/placas-solares/${slug}`}
            className={`inline-flex h-14 items-center justify-center rounded-xl px-10 text-base font-black shadow-lg shadow-black/10 transition-all hover:scale-105 ${theme.button}`}
          >
            Calcular Ahorro Gratis →
          </Link>
          <div className="flex items-center justify-center md:justify-start gap-4 text-white/50">
             <div className="flex -space-x-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-6 w-6 rounded-full border-2 border-white/20 bg-slate-200" />
                ))}
             </div>
             <p className="text-[10px] font-bold uppercase tracking-tight">Únete a +2,400 usuarios en {municipio}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
