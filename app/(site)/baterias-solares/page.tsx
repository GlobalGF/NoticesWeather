import { Metadata } from "next";
import Link from "next/link";
import GeoDirectory from "@/components/ui/GeoDirectory";
import { LocationSearchBar } from "@/components/ui/LocationSearchBar";
import { getNationalStats } from "@/lib/data/solar";
import { getProvinceStats, getAllProvinces } from "@/lib/data/getProvinceStats";
import { getProvinceMetadata } from "@/lib/data/provinces-metadata";
import ProvincePageClient from "@/components/ui/ProvincePageClient";

type Props = {
  searchParams: { provincia?: string };
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { provincia } = searchParams;
  const baseMetadata: Metadata = {
    title: "Baterías Solares: Precios, Rentabilidad y Ayudas por Municipio",
    description: "Encuentra instaladores, calcula el ahorro nocturno y descubre las ayudas disponibles para instalar baterías solares en tu localidad.",
  };

  if (provincia) {
    const stats = await getProvinceStats(provincia);
    const name = stats?.provinceName ?? provincia;
    return {
      title: `Baterías Solares en ${name} | Rentabilidad y Subvenciones`,
      description: `Amortización y ahorro nocturno con baterías solares para los ${stats?.totalMunicipios ?? ''} municipios de la provincia de ${name}.`,
    };
  }
  return baseMetadata;
}

export default async function BateriasSolaresRootPage({ searchParams }: Props) {
  const { provincia } = searchParams;

  // ── Province-specific Landing ──────────────────────────────────
  if (provincia) {
    const [provStats, allProvs] = await Promise.all([
      getProvinceStats(provincia),
      getAllProvinces(),
    ]);

    if (!provStats) {
      return <GenericBateriasSolaresPage />;
    }

    const meta = getProvinceMetadata(provincia);

    return (
      <main className="bg-slate-50 min-h-screen font-sans overflow-x-hidden">

        {/* ── Province Hero with Background ── */}
        <div className="relative pb-24 pt-16 overflow-hidden shadow-lg">
          <div className="absolute inset-0">
            <img
              src={meta.backgroundUrl}
              alt={provStats.provinceName}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/70 to-slate-900/90" />
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0))]" />
          </div>

          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-fuchsia-500/15 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />

          <div className="mx-auto max-w-4xl px-4 relative z-30 text-center">
            <div className="inline-flex items-center gap-3 mb-5 bg-white/10 backdrop-blur-lg border border-white/20 px-5 py-2.5 rounded-full">
              <span className="h-2 w-2 rounded-full bg-fuchsia-400 animate-pulse"></span>
              <p className="text-fuchsia-300 font-bold tracking-widest uppercase text-[10px]">
                Almacenamiento Inteligente en {provStats.provinceName}
              </p>
            </div>

            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight mb-5">
              Baterías Solares en <br className="hidden md:block" />
              <span className="bg-gradient-to-r from-fuchsia-300 to-indigo-400 bg-clip-text text-transparent">{provStats.provinceName}</span>
            </h1>

            <p className="text-sm md:text-lg text-slate-300 max-w-2xl mx-auto font-light leading-relaxed mb-4">
              Descubre si te resulta rentable añadir almacenamiento de litio en tu hogar. Calcula la amortización exacta y encuentra profesionales acreditados en {provStats.provinceName}.
            </p>
          </div>
        </div>

        {/* ── Province Client Section ── */}
        <ProvincePageClient
          hubName="Baterías Solares"
          baseRoute="/baterias-solares"
          provinceName={provStats.provinceName}
          provinceSlug={provStats.provinceSlug}
          municipios={provStats.municipios}
          allProvinces={allProvs}
          stats={{
            totalMunicipios: provStats.totalMunicipios,
            avgSunHours: provStats.avgSunHours,
            avgRadiation: provStats.avgRadiation,
            avgSavings: provStats.avgSavings,
            avgIBI: provStats.avgIBI,
          }}
        />
      </main>
    );
  }

  // ── Generic / No Province Selected ─────────────────────────────
  return <GenericBateriasSolaresPage />;
}

// ── Extracted generic page (no province selected) ────────────────
async function GenericBateriasSolaresPage() {
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
            <div className="flex flex-col items-center text-center px-1 sm:px-2">
                <span className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-indigo-100 text-indigo-600 rounded-2xl mb-3 sm:mb-4 shadow-inner border border-indigo-200/50 scale-90 sm:scale-100">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="10" x="2" y="7" rx="2" ry="2"/><line x1="22" x2="22" y1="11" y2="13"/></svg>
                </span>
                <p className="text-[9px] sm:text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Ciclos Vida</p>
                <p className="text-2xl sm:text-3xl font-black text-slate-800 tabular-nums">&gt;6000</p>
                <p className="text-[10px] font-bold text-indigo-600 hidden sm:block">baterías de litio LFP</p>
            </div>
            <div className="flex flex-col items-center text-center px-1 sm:px-2 pl-2 sm:pl-8">
                <span className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-blue-100 text-blue-600 rounded-2xl mb-3 sm:mb-4 shadow-inner border border-blue-200/50 scale-90 sm:scale-100">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
                </span>
                <p className="text-[9px] sm:text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Ahorro Noct.</p>
                <p className="text-2xl sm:text-3xl font-black text-slate-800 tabular-nums">~60%</p>
                <p className="text-[10px] font-bold text-blue-600 hidden sm:block">consumos fuera de horas solares</p>
            </div>
            <div className="flex flex-col items-center text-center px-1 sm:px-2 pl-2 sm:pl-8 mt-4 sm:mt-0 shadow-none border-t border-slate-100 md:border-t-0 pt-4 sm:pt-0">
                <span className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-emerald-100 text-emerald-600 rounded-2xl mb-3 sm:mb-4 shadow-inner border border-emerald-200/50 scale-90 sm:scale-100">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                </span>
                <p className="text-[9px] sm:text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Amortización</p>
                <p className="text-2xl sm:text-3xl font-black text-slate-800 tabular-nums">5-8</p>
                <p className="text-[10px] font-bold text-emerald-600 hidden sm:block">años de retorno</p>
            </div>
            <div className="flex flex-col items-center text-center px-1 sm:px-2 pl-2 sm:pl-8 mt-4 sm:mt-0 shadow-none border-t border-slate-100 md:border-t-0 pt-4 sm:pt-0">
                <span className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-fuchsia-100 text-fuchsia-600 rounded-2xl mb-3 sm:mb-4 shadow-inner border border-fuchsia-200/50 scale-90 sm:scale-100">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                </span>
                <p className="text-[9px] sm:text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Independ.</p>
                <p className="text-2xl sm:text-3xl font-black text-slate-800 tabular-nums">80%</p>
                <p className="text-[10px] font-bold text-fuchsia-600 hidden sm:block">reducción dependencia</p>
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

        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200">
            <GeoDirectory
              level="provincias"
              baseRoute="/baterias-solares"
              queryParam="provincia"
            />
        </div>
      </div>
    </main>
  );
}