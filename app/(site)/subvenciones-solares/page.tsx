import { Metadata } from "next";
import GeoDirectory from "@/components/ui/GeoDirectory";

export const metadata: Metadata = {
  title: "Subvenciones para Placas Solares",
  description: "Consulta los programas de subvenciones y ayudas para la instalación de placas solares en tu Comunidad Autónoma y Provincia.",
};

export default function SubvencionesSolaresRootPage() {
  return (
    <main className="bg-slate-50 min-h-screen font-sans">
      
      {/* ── Corporate Hero ── */}
      <div className="bg-slate-900 border-t border-slate-800 pb-20 pt-16 overflow-hidden relative shadow-lg">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0))]"></div>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="mx-auto max-w-4xl px-4 relative z-30 text-center">
          <div className="inline-flex items-center gap-3 mb-6 bg-white/5 border border-white/10 px-4 py-2 rounded-full">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <p className="text-emerald-400 font-bold tracking-widest uppercase text-[10px]">Fondos Europeos Next Generation EU</p>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight mb-6">
            Subvenciones Solares <br className="hidden md:block" /> por Comunidad Autónoma
          </h1>
          
          <p className="text-base md:text-xl text-slate-300 max-w-2xl mx-auto font-light leading-relaxed mb-10">
            Descubre las ayudas fiscales (IBI, ICIO) y fondos europeos disponibles actualmente en tu región para reducir a la mitad el coste de tu transición verde.
          </p>
        </div>
      </div>

      {/* ── National Statistics KPIs ── */}
      <div className="mx-auto max-w-5xl px-4 -mt-10 relative z-20 mb-16">
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-6 md:p-8 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 divide-x divide-slate-100">
            <div className="flex flex-col items-center text-center px-2">
                <span className="w-12 h-12 flex items-center justify-center bg-blue-100 text-blue-600 rounded-2xl mb-4 shadow-inner border border-blue-200/50">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                </span>
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Deducción IRPF</p>
                <p className="text-3xl font-black text-slate-800 tabular-nums">Hasta 60%</p>
                <p className="text-xs font-bold text-blue-600">en rehabilitación</p>
            </div>
            <div className="flex flex-col items-center text-center px-2 pl-4 md:pl-8">
                <span className="w-12 h-12 flex items-center justify-center bg-emerald-100 text-emerald-600 rounded-2xl mb-4 shadow-inner border border-emerald-200/50">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                </span>
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Bonificación IBI</p>
                <p className="text-3xl font-black text-slate-800 tabular-nums">Hasta 50%</p>
                <p className="text-xs font-bold text-emerald-600">durante 5 años</p>
            </div>
            <div className="flex flex-col items-center text-center px-2 pl-4 md:pl-8 mt-6 md:mt-0 shadow-none border-t border-slate-100 md:border-t-0 pt-6 md:pt-0">
                <span className="w-12 h-12 flex items-center justify-center bg-amber-100 text-amber-600 rounded-2xl mb-4 shadow-inner border border-amber-200/50">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="14" width="16" height="8" rx="2" ry="2"/><rect x="4" y="2" width="16" height="8" rx="2" ry="2"/><line x1="12" y1="10" x2="12" y2="14"/></svg>
                </span>
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Descuento ICIO</p>
                <p className="text-3xl font-black text-slate-800 tabular-nums">Hasta 95%</p>
                <p className="text-xs font-bold text-amber-600">tasa de obras</p>
            </div>
            <div className="flex flex-col items-center text-center px-2 pl-4 md:pl-8 mt-6 md:mt-0 shadow-none border-t border-slate-100 md:border-t-0 pt-6 md:pt-0">
                <span className="w-12 h-12 flex items-center justify-center bg-purple-100 text-purple-600 rounded-2xl mb-4 shadow-inner border border-purple-200/50">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
                </span>
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Fondos Europeos</p>
                <p className="text-3xl font-black text-slate-800 tabular-nums">Agotado</p>
                <p className="text-xs font-bold text-purple-600">Pendiente de nuevos plazos</p>
            </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 pb-24">
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200">
          <GeoDirectory level="comunidades" baseRoute="/subvenciones-solares" />
        </div>
      </div>
    </main>
  );
}