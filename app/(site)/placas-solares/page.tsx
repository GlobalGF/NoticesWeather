import { Metadata } from "next";
import Link from "next/link";
import GeoDirectory from "@/components/ui/GeoDirectory";
import { LocationSearchBar } from "@/components/ui/LocationSearchBar";
import { getNationalStats } from "@/lib/data/solar";

export const metadata: Metadata = {
  title: "Placas Solares en España: Estudio de Rendimiento y Precios",
  description: "Descubre el potencial solar de tu localidad. Buscador de rendimiento energético, precios de instalación y subvenciones para placas solares en España.",
};

type Props = {
  searchParams: Promise<{ provincia?: string }>;
};

export default async function PlacasSolaresIndexPage({ searchParams }: Props) {
  const { provincia } = await searchParams;
  const stats = await getNationalStats();

  return (
    <main className="bg-slate-50 min-h-screen font-sans overflow-x-hidden">

      {/* ── Corporate Hero with Search ── */}
      <div className="bg-slate-900 border-t border-slate-800 pb-20 pt-16 overflow-hidden relative shadow-lg">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0))]"></div>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>

        <div className="mx-auto max-w-4xl px-4 relative z-30 text-center">
          <div className="inline-flex items-center gap-3 mb-6 bg-white/5 border border-white/10 px-4 py-2 rounded-full">
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <p className="text-cyan-400 font-bold tracking-widest uppercase text-[10px]">Portal Nacional de Autoconsumo</p>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight mb-6">
            Placas Solares en España <br className="hidden md:block" /> Rendimiento por Localidad
          </h1>

          <p className="text-base md:text-xl text-slate-300 max-w-2xl mx-auto font-light leading-relaxed mb-10">
            Encuentra tu municipio y accede al instante al estudio completo de irradiación, rentabilidad financiera, y bonificaciones fiscales (IBI/ICIO).
          </p>

          <LocationSearchBar baseRoute="/placas-solares" />
        </div>
      </div>

      {/* ── National Statistics KPIs ── */}
      <div className="mx-auto max-w-5xl px-4 -mt-10 relative z-20 mb-16">
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-6 md:p-8 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 divide-x divide-slate-100">
          <div className="flex flex-col items-center text-center px-2">
            <span className="w-12 h-12 flex items-center justify-center bg-amber-100 text-amber-600 rounded-2xl mb-4 shadow-inner border border-amber-200/50">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" /></svg>
            </span>
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Media Nacional</p>
            <p className="text-3xl font-black text-slate-800 tabular-nums">{stats.avgSunHours.toLocaleString('es-ES')}</p>
            <p className="text-xs font-bold text-amber-600">horas solares/año</p>
          </div>
          <div className="flex flex-col items-center text-center px-2 pl-4 md:pl-8">
            <span className="w-12 h-12 flex items-center justify-center bg-blue-100 text-blue-600 rounded-2xl mb-4 shadow-inner border border-blue-200/50">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
            </span>
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Radiación Media</p>
            <p className="text-3xl font-black text-slate-800 tabular-nums">{stats.avgRadiation.toLocaleString('es-ES')}</p>
            <p className="text-xs font-bold text-blue-600">kWh/m² anuales</p>
          </div>
          <div className="flex flex-col items-center text-center px-2 pl-4 md:pl-8 mt-6 md:mt-0 shadow-none border-t border-slate-100 md:border-t-0 pt-6 md:pt-0">
            <span className="w-12 h-12 flex items-center justify-center bg-emerald-100 text-emerald-600 rounded-2xl mb-4 shadow-inner border border-emerald-200/50">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
            </span>
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Ahorro Medio Anual</p>
            <p className="text-3xl font-black text-slate-800 tabular-nums">{stats.avgSavings}€</p>
            <p className="text-xs font-bold text-emerald-600">por instalación tipo</p>
          </div>
          <div className="flex flex-col items-center text-center px-2 pl-4 md:pl-8 mt-6 md:mt-0 shadow-none border-t border-slate-100 md:border-t-0 pt-6 md:pt-0">
            <span className="w-12 h-12 flex items-center justify-center bg-purple-100 text-purple-600 rounded-2xl mb-4 shadow-inner border border-purple-200/50">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
            </span>
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Bonificación IBI</p>
            <p className="text-3xl font-black text-slate-800 tabular-nums">{stats.avgIBI}%</p>
            <p className="text-xs font-bold text-purple-600">descuento medio municipal</p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 pb-24">
        <div className="mb-12 text-center max-w-3xl mx-auto">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-4">Directorio de placas solares por municipio</h2>
          <p className="text-slate-500">
            Si prefieres navegar manualmente, selecciona tu provincia a continuación para desplegar el mapa de municipios y acceder al portal energético local.
          </p>
        </div>

        {provincia ? (
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200">
            <div className="mb-6">
              <Link href="/placas-solares" className="text-sm text-blue-600 hover:text-blue-800 font-bold flex items-center gap-2 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                Volver a Provincias
              </Link>
            </div>
            <GeoDirectory
              level="municipios"
              parentSlug={provincia}
              baseRoute="/placas-solares"
            />
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200">
            <GeoDirectory
              level="provincias"
              baseRoute="/placas-solares"
              queryParam="provincia"
            />
          </div>
        )}
      </div>
    </main>
  );
}
