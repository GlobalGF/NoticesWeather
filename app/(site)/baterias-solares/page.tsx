import { Metadata } from "next";
import Link from "next/link";
import GeoDirectory from "@/components/ui/GeoDirectory";
import { LocationSearchBar } from "@/components/ui/LocationSearchBar";
import { getNationalStats } from "@/lib/data/solar";

export const metadata: Metadata = {
  title: "Baterías Solares: Precios, Rentabilidad y Ayudas por Municipio",
  description: "Encuentra instaladores, calcula el ahorro nocturno y descubre las ayudas disponibles para instalar baterías solares en tu localidad.",
};

type Props = {
  searchParams: Promise<{ provincia?: string }>;
};

export default async function BateriasSolaresRootPage({ searchParams }: Props) {
  const { provincia } = await searchParams;
  const stats = await getNationalStats();

  return (
    <main className="bg-slate-50 min-h-screen font-sans">
      
      {/* ── Corporate Hero with Search ── */}
      <div className="bg-slate-900 border-t border-slate-800 pb-20 pt-16 overflow-hidden relative shadow-lg">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0))]"></div>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-fuchsia-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="mx-auto max-w-4xl px-4 relative z-30 text-center">
          <div className="inline-flex items-center gap-3 mb-6 bg-white/5 border border-white/10 px-4 py-2 rounded-full">
            <span className="h-2 w-2 rounded-full bg-fuchsia-400 animate-pulse"></span>
            <p className="text-fuchsia-400 font-bold tracking-widest uppercase text-[10px]">Almacenamiento Inteligente</p>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight mb-6">
            Baterías Solares <br className="hidden md:block" /> por Localidad
          </h1>
          
          <p className="text-base md:text-xl text-slate-300 max-w-2xl mx-auto font-light leading-relaxed mb-10">
            Descubre si te resulta rentable añadir almacenamiento físico a tus placas. Calcula la amortización exacta y las ayudas activas en tu ciudad.
          </p>

          <LocationSearchBar baseRoute="/baterias-solares" placeholder="Escribe tu ciudad o provincia..." />
        </div>
      </div>

      {/* ── National Statistics KPIs ── */}
      <div className="mx-auto max-w-5xl px-4 -mt-10 relative z-20 mb-16">
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-6 md:p-8 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 divide-x divide-slate-100">
            <div className="flex flex-col items-center text-center px-2">
                <span className="w-12 h-12 flex items-center justify-center bg-indigo-100 text-indigo-600 rounded-2xl mb-4 shadow-inner border border-indigo-200/50">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="10" x="2" y="7" rx="2" ry="2"/><line x1="22" x2="22" y1="11" y2="13"/></svg>
                </span>
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Ciclos de Vida</p>
                <p className="text-3xl font-black text-slate-800 tabular-nums">&gt;6000</p>
                <p className="text-xs font-bold text-indigo-600">baterías de litio LFP</p>
            </div>
            <div className="flex flex-col items-center text-center px-2 pl-4 md:pl-8">
                <span className="w-12 h-12 flex items-center justify-center bg-blue-100 text-blue-600 rounded-2xl mb-4 shadow-inner border border-blue-200/50">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
                </span>
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Ahorro Nocturno</p>
                <p className="text-3xl font-black text-slate-800 tabular-nums">~60%</p>
                <p className="text-xs font-bold text-blue-600">consumos fuera de horas solares</p>
            </div>
            <div className="flex flex-col items-center text-center px-2 pl-4 md:pl-8 mt-6 md:mt-0 shadow-none border-t border-slate-100 md:border-t-0 pt-6 md:pt-0">
                <span className="w-12 h-12 flex items-center justify-center bg-emerald-100 text-emerald-600 rounded-2xl mb-4 shadow-inner border border-emerald-200/50">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                </span>
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Amortización</p>
                <p className="text-3xl font-black text-slate-800 tabular-nums">5-8</p>
                <p className="text-xs font-bold text-emerald-600">años de retorno</p>
            </div>
            <div className="flex flex-col items-center text-center px-2 pl-4 md:pl-8 mt-6 md:mt-0 shadow-none border-t border-slate-100 md:border-t-0 pt-6 md:pt-0">
                <span className="w-12 h-12 flex items-center justify-center bg-fuchsia-100 text-fuchsia-600 rounded-2xl mb-4 shadow-inner border border-fuchsia-200/50">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                </span>
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Independencia</p>
                <p className="text-3xl font-black text-slate-800 tabular-nums">80%</p>
                <p className="text-xs font-bold text-fuchsia-600">reducción dependencia eléctrica</p>
            </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 pb-24">
        <div className="mb-12 text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-4">Directorio Nacional de Baterías</h2>
            <p className="text-slate-500">
                Si prefieres navegar manualmente, selecciona tu provincia a continuación para visualizar la guía de almacenamiento energético para tu municipio.
            </p>
        </div>

        {provincia ? (
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200">
            <div className="mb-6">
              <Link href="/baterias-solares" className="text-sm text-fuchsia-600 hover:text-fuchsia-800 font-bold flex items-center gap-2 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                Volver a Provincias
              </Link>
            </div>
            <GeoDirectory
              level="municipios"
              parentSlug={provincia}
              baseRoute="/baterias-solares"
            />
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200">
            <GeoDirectory
              level="provincias"
              baseRoute="/baterias-solares"
              queryParam="provincia"
            />
          </div>
        )}
      </div>
    </main>
  );
}