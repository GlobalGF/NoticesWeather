"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { slugify } from "@/lib/utils/slug";
import { 
  Sun, 
  Battery as BatteryIcon, 
  Wallet, 
  Zap, 
  Gift, 
  ArrowRight, 
  CheckCircle2 
} from "lucide-react";
import { motion } from "framer-motion";

interface CalculatorMunicipalitySwitcherProps {
  municipio: string;
  provincia: string;
  comunidadAutonoma: string;
  slug: string;
}

const CALCULATORS = [
  {
    id: "placas-solares",
    title: "Placas Solares",
    href: (slug: string) => `/calculadoras/placas-solares/${slug}`,
    icon: Sun,
    color: "amber"
  },
  {
    id: "baterias",
    title: "Baterías",
    href: (slug: string) => `/calculadoras/baterias/${slug}`,
    icon: BatteryIcon,
    color: "fuchsia"
  },
  {
    id: "financiacion",
    title: "Financiación",
    href: (slug: string) => `/calculadoras/financiacion/${slug}`,
    icon: Wallet,
    color: "emerald"
  },
  {
    id: "excedentes",
    title: "Excedentes",
    href: (slug: string) => `/calculadoras/excedentes/${slug}`,
    icon: Zap,
    color: "teal"
  }
];

export function CalculatorMunicipalitySwitcher({
  municipio,
  provincia,
  comunidadAutonoma,
  slug
}: CalculatorMunicipalitySwitcherProps) {
  const pathname = usePathname();

  const ccaaSlug = slugify(comunidadAutonoma);
  const provSlug = slugify(provincia);
  const subsidyPath = `/subvenciones-solares/${ccaaSlug}/${provSlug}/${slug}`;

  return (
    <section className="relative group mb-12">
      <div className="relative bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-xl shadow-slate-200/50">
        <div className="px-8 py-6 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6 bg-slate-50/50">
          <div className="flex items-center gap-4">
             <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
             </div>
             <div>
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Simuladores Activos en {municipio}</h2>
                <p className="text-[10px] font-bold text-slate-400 tracking-wider">DATOS TÉCNICOS LOCALES · PROVINCIA DE {provincia.toUpperCase()}</p>
             </div>
          </div>
          
          <Link 
            href={subsidyPath}
            className="group/btn relative px-5 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs font-black text-slate-900 uppercase tracking-widest hover:border-emerald-500 hover:text-emerald-600 transition-all flex items-center gap-3 shadow-sm shadow-slate-200"
          >
            <Gift className="w-4 h-4 text-emerald-500" />
            <span>Ayudas {municipio}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="p-6 md:p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CALCULATORS.map((calc) => {
            const href = calc.href(slug);
            const isActive = pathname === href;
            const Icon = calc.icon;

            const colorVariants = {
               amber: { bg: "bg-amber-500", text: "text-amber-600", light: "bg-amber-100", border: "border-amber-200" },
               fuchsia: { bg: "bg-fuchsia-500", text: "text-fuchsia-600", light: "bg-fuchsia-100", border: "border-fuchsia-200" },
               emerald: { bg: "bg-emerald-500", text: "text-emerald-600", light: "bg-emerald-100", border: "border-emerald-200" },
               teal: { bg: "bg-teal-500", text: "text-teal-600", light: "bg-teal-100", border: "border-teal-200" }
            };

            const cv = colorVariants[calc.color as keyof typeof colorVariants];

            return (
              <Link
                key={calc.id}
                href={href}
                className={`
                  relative p-5 rounded-3xl border transition-all overflow-hidden flex flex-col items-center justify-center text-center group/card
                  ${isActive 
                    ? `bg-white border-slate-200 shadow-lg ring-4 ring-slate-100/50` 
                    : "bg-transparent border-slate-100 hover:bg-slate-50 hover:border-slate-200"}
                `}
              >
                <div className={`
                  w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-all duration-500
                  ${isActive 
                     ? `${cv.bg} text-white shadow-lg shadow-${calc.color}-500/20 scale-105` 
                     : `${cv.light} ${cv.text} group-hover/card:scale-110`}
                `}>
                  <Icon className="w-7 h-7" />
                </div>
                
                <p className={`text-[11px] font-black uppercase tracking-widest ${isActive ? "text-slate-900" : "text-slate-400 group-hover/card:text-slate-600"}`}>
                  {calc.title}
                </p>

                {isActive && (
                   <motion.div 
                      layoutId="active-indicator-light"
                      className={`absolute bottom-0 left-0 right-0 h-1 ${cv.bg}`} 
                   />
                )}
              </Link>
            );
          })}
        </div>
        
        {/* Return to city hub */}
        {pathname !== `/calculadoras/${slug}` && (
          <div className="bg-slate-50 px-8 py-4 border-t border-slate-100 text-center">
            <Link href={`/calculadoras/${slug}`} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors flex items-center justify-center gap-2">
              <ArrowRight className="w-3 h-3 rotate-180" />
              Ver resumen de {municipio}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
