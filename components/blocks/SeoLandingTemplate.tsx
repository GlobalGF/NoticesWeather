"use client";

import Link from "next/link";
import { ProgrammaticUrgencyStatus } from "@/components/ui/ProgrammaticUrgencyStatus";
import { InternalLink } from "@/lib/seo/internal-linking";
import type { SolarSubsidyStatus } from "@/data/types";
import { ArrowRight, ChevronRight, Zap, ExternalLink, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

type Props = {
  header: {
    breadcrumb: string;
    label: string;
    titlePrefix: string;
    titleHighlight: string;
    description: string;
  };
  incentivesCard: {
    title: string;
    rows: Array<{ label0: string; label1: string; value: string }>;
    cta: string;
  };
  mainContent: {
    status: {
      title: string;
      desc: string;
      highlight: string;
    };
  };
  sidebarAudit: {
    badge: string;
    title: string;
    desc: string;
    cta: string;
  };
  sections: Array<{ id: number; title: string; content: string }>;
  faqs: Array<{ question: string; answer: string }>;
  simulation: {
    title: string;
    desc: string;
  };
  metrics?: {
    production: string;
    co2: string;
    payback: string;
    savings: string;
  };
  links?: InternalLink[];
  schema?: unknown;
  municipioSlug?: string;
  municipioName?: string;
  subsidyStatus?: SolarSubsidyStatus;
  subsidyDeadline?: string | null;
  bdnsId?: string | null;
  sourceUrl?: string | null;
};

export function SeoLandingTemplate({
  header,
  incentivesCard,
  mainContent,
  sidebarAudit,
  sections,
  faqs,
  simulation,
  metrics,
  links = [],
  schema,
  municipioSlug,
  municipioName,
  subsidyStatus,
  subsidyDeadline,
  bdnsId,
  sourceUrl
}: Props) {
  const localLinks = Array.isArray(links) ? links.filter(l => !l.isNearby) : [];
  const nearbyLinks = Array.isArray(links) ? links.filter(l => l.isNearby) : [];

  const budgetUrl = `/presupuesto-solar${municipioSlug ? `?m=${municipioSlug}` : ""}`;
  return (
    <div className="bg-slate-50 min-h-screen font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* 1. Hero Section - EXACT SCREENSHOT STYLE */}
      <section className="bg-[#0f172a] text-white relative overflow-hidden">
        {/* Dynamic background effects for "Premium" feel */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] -mr-48 -mt-48 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-[100px] -ml-24 -mb-24 pointer-events-none" />

        <div className="max-w-6xl mx-auto px-6 py-12 lg:py-24 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-8">
              <nav className="text-[10px] font-bold tracking-widest text-[#2dd4bf] uppercase mb-6 flex items-center gap-2">
                {header.breadcrumb}
              </nav>

              <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full mb-8">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{header.label}</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold leading-[1.1] mb-8">
                {header.titlePrefix} <br className="hidden md:block" />
                <span className="text-[#2dd4bf]">{header.titleHighlight}</span>
              </h1>

              <p className="text-lg md:text-xl text-slate-400 leading-relaxed max-w-2xl">
                {header.description}
              </p>
            </div>

            {/* Right Card - Incentives */}
            <div className="lg:col-span-4">
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-3xl p-8 shadow-2xl shadow-black/50 text-slate-900"
              >
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8 flex items-center justify-between">
                  {incentivesCard.title}
                  <Zap className="w-3 h-3 text-emerald-500 fill-emerald-500" />
                </h3>

                <div className="space-y-8 mb-10">
                  {incentivesCard.rows.map((row, idx) => (
                    <div key={idx} className="flex justify-between items-end border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                      <div>
                        <p className="text-[10px] font-bold text-slate-800 uppercase tracking-wide mb-1">{row.label0}</p>
                        <p className="text-xs text-slate-400 font-medium">{row.label1}</p>
                      </div>
                      <p className="text-4xl font-black text-slate-900 tracking-tighter">{row.value}</p>
                    </div>
                  ))}
                </div>

                <Link 
                  href={budgetUrl}
                  className="w-full bg-[#0f172a] text-white flex items-center justify-center gap-3 py-4 rounded-2xl font-black text-sm hover:bg-slate-800 transition-all active:scale-[0.98]"
                >
                  {incentivesCard.cta}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Main Body Section */}
      <section className="max-w-6xl mx-auto px-6 py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column (2/3) */}
          <div className="lg:col-span-8 space-y-12">
            
            <motion.div 
              whileInView={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 20 }}
              viewport={{ once: true }}
              className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-slate-200 shadow-sm"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500">
                  <Zap className="w-6 h-6 fill-current" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">{mainContent.status.title}</h2>
              </div>

              <div className="prose prose-slate max-w-none text-slate-600 space-y-6">
                <p className="text-lg leading-relaxed">{mainContent.status.desc}</p>
                
                <div className="bg-slate-50 rounded-2xl p-8 border-l-4 border-emerald-400 italic font-medium text-slate-700 leading-relaxed shadow-inner">
                  {mainContent.status.highlight}
                </div>
              </div>
            </motion.div>

            {/* Narrative Sections */}
            <div className="space-y-16 py-8">
              {sections.map(s => (
                <section key={s.id} className="max-w-2xl px-4">
                  <h2 className="text-2xl font-black text-slate-900 mb-6 tracking-tight">{s.title}</h2>
                  <p className="text-lg text-slate-500 leading-relaxed">{s.content}</p>
                </section>
              ))}
            </div>
          </div>

          {/* Right Column (1/3) */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Audit Sidebar Card */}
            <div className="bg-[#0f172a] rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
               <div className="relative z-10">
                  <span className="inline-block bg-emerald-500 text-[10px] font-black tracking-widest px-3 py-1 rounded-full mb-6 uppercase">
                    {sidebarAudit.badge}
                  </span>
                  <h2 className="text-3xl font-black mb-4 leading-tight">{sidebarAudit.title}</h2>
                  <p className="text-slate-400 mb-8 leading-relaxed">{sidebarAudit.desc}</p>
                  
                  <Link 
                    href={budgetUrl}
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-900 py-4 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-3"
                  >
                    {sidebarAudit.cta}
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <div className="mt-8 pt-8 border-t border-slate-800">
                     <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">GESTIÓN TÉCNICO-ADMINISTRATIVA</p>
                     <p className="text-xs text-slate-400 hover:text-white cursor-pointer transition-colors flex items-center gap-2 group/link">
                       <ChevronRight className="w-3 h-3 text-emerald-500 group-hover/link:translate-x-1 transition-transform" />
                       Volver a {header.breadcrumb.split('/').pop()?.trim()}
                     </p>
                  </div>
               </div>
               {/* Aesthetic abstract background pattern */}
               <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none group-hover:scale-110 transition-transform">
                  <div className="w-32 h-32 bg-emerald-500 rounded-full blur-3xl"></div>
               </div>
            </div >

            {/* Simulation Block */}
            <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm text-center">
               <h3 className="text-lg font-black text-slate-900 mb-2">{simulation.title}</h3>
               <p className="text-sm text-slate-500 mb-6 leading-relaxed">{simulation.desc}</p>
               <Link href={budgetUrl} className="text-emerald-500 font-extrabold text-sm flex items-center justify-center gap-1 mx-auto group">
                 Comenzar Auditoría
                 <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
               </Link>
            </div>

            {/* BDNS Official Reference */}
            {(bdnsId || sourceUrl) && (
              <div className="bg-emerald-50/50 rounded-3xl border border-emerald-100 p-6 flex items-start gap-4">
                 <ShieldCheck className="w-6 h-6 text-emerald-500 shrink-0" />
                 <div className="space-y-2">
                    <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Información Oficial BDNS</p>
                    {bdnsId && <p className="text-xs text-slate-600 font-medium">Ref: <span className="font-bold">{bdnsId}</span></p>}
                    {sourceUrl && (
                      <a 
                        href={sourceUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-xs text-emerald-600 font-bold flex items-center gap-1 hover:underline"
                      >
                         Ver fuente oficial
                         <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                 </div>
              </div>
            )}

            {/* FAQ Block */}
            <div className="sticky top-24 space-y-4">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-4">PREGUNTAS FRECUENTES</h3>
              {faqs.map((f, i) => (
                <details key={i} className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                  <summary className="flex items-center justify-between p-5 cursor-pointer list-none font-bold text-xs text-slate-800">
                    {f.question}
                    <ChevronRight className="w-4 h-4 text-slate-300 group-open:rotate-90 transition-transform" />
                  </summary>
                  <div className="p-5 pt-0 text-xs text-slate-500 leading-relaxed border-t border-slate-50">
                    {f.answer}
                  </div>
                </details>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* 3. Nearby Resources / Silo Cluster */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
         <div className="bg-slate-900 rounded-[3rem] p-8 md:p-16 text-white overflow-hidden relative">
            <h3 className="text-2xl font-black mb-8">Recursos disponibles en {municipioName}</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
               {localLinks.map((l, i) => (
                 <Link key={i} href={l.href} className="bg-slate-800/50 hover:bg-slate-800 hover:border-emerald-500/50 transition-all border border-slate-700/50 p-6 rounded-2xl group flex flex-col justify-between aspect-square lg:aspect-auto min-h-[160px]">
                    <span className="text-emerald-400 font-extrabold text-xs uppercase tracking-widest mb-4">Módulo {i+1}</span>
                    <span className="text-lg font-bold group-hover:text-emerald-400 transition-colors leading-tight">{l.label}</span>
                 </Link>
               ))}
            </div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
         </div>
      </section>

      {/* 4. Nearby Towns / SEO Interlinking */}
      {nearbyLinks.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 pb-24">
           <div className="border-t border-slate-200 pt-16">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-10 text-center">Subvenciones fotovoltaicas en poblaciones cercanas</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                 {nearbyLinks.map((l, i) => (
                   <Link key={i} href={l.href} className="bg-white hover:bg-emerald-50 transition-all border border-slate-200 p-4 rounded-xl flex items-center justify-between group">
                      <span className="text-xs font-bold text-slate-700 group-hover:text-emerald-700 transition-colors truncate">{l.label.replace("Ayudas y subvenciones en ", "")}</span>
                      <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                   </Link>
                 ))}
              </div>
           </div>
        </section>
      )}

      {!!schema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      )}
    </div>
  );
}