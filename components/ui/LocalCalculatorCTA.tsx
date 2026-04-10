"use client";

import Link from "next/link";
import { ArrowRight, Calculator, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

interface LocalCalculatorCTAProps {
  municipio: string;
  slug: string;
  variant?: "blue" | "emerald" | "slate";
}

export function LocalCalculatorCTA({ municipio, slug, variant = "blue" }: LocalCalculatorCTAProps) {
  const themes = {
    blue: {
      bg: "bg-slate-900",
      accent: "from-blue-600 to-indigo-600",
      glow: "bg-blue-500/10",
      button: "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20",
    },
    emerald: {
      bg: "bg-slate-900",
      accent: "from-emerald-600 to-teal-600",
      glow: "bg-emerald-500/10",
      button: "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20",
    },
    slate: {
      bg: "bg-slate-900",
      accent: "from-slate-700 to-slate-800",
      glow: "bg-slate-400/5",
      button: "bg-slate-700 hover:bg-slate-600 text-white shadow-slate-500/20",
    }
  };

  const theme = themes[variant];

  return (
    <div className="relative group my-12">
      {/* Supreme Glow Effect */}
      <div className={`absolute -inset-1 bg-gradient-to-r ${theme.accent} rounded-[2rem] blur-xl opacity-20 group-hover:opacity-40 transition duration-1000`}></div>
      
      <div className={`relative overflow-hidden rounded-[2rem] bg-slate-900 border border-white/5 p-8 md:p-12 shadow-2xl`}>
        {/* Animated grid overlay */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03] bg-center pointer-events-none" />
        <div className={`absolute top-0 right-0 w-64 h-64 ${theme.glow} blur-[100px] rounded-full pointer-events-none translate-x-1/2 -translate-y-1/2`} />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="max-w-xl text-center md:text-left">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white mb-6">
              <Calculator className="w-3.5 h-3.5 text-blue-400" />
              <span>Simulador de Ingeniería Local</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tighter leading-tight mb-6">
              ¿Cuánto ahorrarás en <span className="italic bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">{municipio}</span>?
            </h2>
            <p className="text-slate-400 text-base font-medium leading-relaxed mb-8 max-w-lg">
              Utiliza nuestro motor de cálculo profesional con datos de irradiancia PVGIS oficial para dimensionar tu sistema solar en 30 segundos.
            </p>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
               <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-emerald-400/80">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Sin compromiso</span>
               </div>
               <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-emerald-400/80">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Datos 2026</span>
               </div>
               <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-emerald-400/80">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Gratis</span>
               </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-4 shrink-0">
            <Link
              href={`/calculadoras/placas-solares/${slug}`}
              className={`group/btn inline-flex h-16 items-center justify-center rounded-2xl px-12 text-sm font-black uppercase tracking-widest shadow-lg transition-all hover:scale-105 active:scale-95 ${theme.button}`}
            >
              Comenzar Auditoría
              <ArrowRight className="ml-3 w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
            </Link>
            <p className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.2em] italic">Recomendado por 4.8k usuarios</p>
          </div>
        </div>
      </div>
    </div>
  );
}
