import { Metadata } from "next";
import Link from "next/link";
import GeoDirectory from "@/components/ui/GeoDirectory";
import { LocationSearchBar } from "@/components/ui/LocationSearchBar";
import { getNationalStats } from "@/lib/data/solar";
import { getProvinceStats, getAllProvinces } from "@/lib/data/getProvinceStats";
import { getProvinceMetadata } from "@/lib/data/provinces-metadata";
import { buildMetadata } from "@/lib/seo/metadata-builder";
import ProvincePageClient from "@/components/ui/ProvincePageClient";
import { cachePolicy } from "@/lib/cache/policy";

export const revalidate = cachePolicy.page.solarCity;

type Props = {
  searchParams: { provincia?: string };
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { provincia } = searchParams;
  if (provincia) {
    const stats = await getProvinceStats(provincia);
    const name = stats?.provinceName ?? provincia;
    return buildMetadata({
      title: `Instalación Placas Solares ${name} · Ahorro`,
      description: `Paneles y placas solares en ${name}: irradiación, precio de instalación fotovoltaica, ahorro en factura y bonificaciones IBI/ICIO. ${stats?.totalMunicipios ?? ''} municipios disponibles.`,
      pathname: `/placas-solares?provincia=${encodeURIComponent(provincia)}`,
    });
  }
  return buildMetadata({
    title: "Instalación de Placas Solares en España · Guía",
    description: "Compara precios de instalación de placas solares fotovoltaicas en tu municipio. Paneles solares, rentabilidad energética, subvenciones y bonificaciones IBI en España.",
    pathname: "/placas-solares",
  });
}

export default async function PlacasSolaresIndexPage({ searchParams }: Props) {
  const { provincia } = searchParams;

  // ── Province-specific Landing ──────────────────────────────────
  if (provincia) {
    const [provStats, allProvs] = await Promise.all([
      getProvinceStats(provincia),
      getAllProvinces(),
    ]);

    if (!provStats) {
      // Fallback: Province not found, show generic page
      return <GenericPlacasSolaresPage />;
    }

    const meta = getProvinceMetadata(provincia);

    return (
      <main className="bg-slate-50 min-h-screen font-sans overflow-x-hidden">

        {/* ── Province Hero with Background ── */}
        <div className="relative pb-24 pt-16 overflow-hidden shadow-lg">
          {/* Background Image */}
          <div className="absolute inset-0">
            <img
              src={meta.backgroundUrl}
              alt={provStats.provinceName}
              width={1920}
              height={1080}
              className="w-full h-full object-cover"
              loading="eager"
              decoding="async"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/70 to-slate-900/90" />
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0))]" />
          </div>

          {/* Decorative blurs */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/15 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-amber-500/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/3 pointer-events-none" />

          <div className="mx-auto max-w-4xl px-4 relative z-30 text-center">
            {/* Province badge */}
            <div className="inline-flex items-center gap-3 mb-5 bg-white/10 backdrop-blur-lg border border-white/20 px-5 py-2.5 rounded-full">
              <svg className="text-amber-400" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
              <p className="text-amber-300 font-bold tracking-widest uppercase text-[10px]">
                Provincia de {provStats.provinceName}
              </p>
            </div>

            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight mb-5">
              Placas Solares en <br className="hidden md:block" />
              <span className="bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent">{provStats.provinceName}</span>
            </h1>

            <p className="text-sm md:text-lg text-slate-300 max-w-2xl mx-auto font-light leading-relaxed mb-4">
              Explora los <span className="text-white font-semibold" font-bold>{provStats.totalMunicipios} municipios</span> de {provStats.provinceName}. 
              Encuentra tu ciudad y accede al estudio completo de irradiación, rentabilidad y bonificaciones fiscales.
            </p>

            {/* Province highlights */}
            <div className="flex items-center justify-center gap-3 flex-wrap">
              {meta.highlights.map((h, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full text-xs text-white/80 font-medium">
                  <svg className="text-emerald-400" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  {h}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── Province Client Section (search + KPIs + grid) ── */}
        <ProvincePageClient
          hubName="Placas Solares"
          baseRoute="/placas-solares"
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
          initialList={
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5">
              {provStats.municipios.map((m: any) => (
                <Link
                  key={m.slug}
                  href={`/placas-solares/${m.slug}`}
                  className="group block bg-white rounded-xl border border-slate-200 px-4 py-3 hover:border-blue-400 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-blue-100 text-slate-400 group-hover:text-blue-600 flex items-center justify-center shrink-0 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                    </div>
                    <span className="text-sm font-medium text-slate-700 group-hover:text-blue-700 transition-colors truncate">{m.municipio}</span>
                  </div>
                </Link>
              ))}
            </div>
          }
        />
      </main>
    );
  }

  // ── Generic / No Province Selected ─────────────────────────────
  return <GenericPlacasSolaresPage />;
}

// ── Extracted generic page (no province selected) ────────────────
async function GenericPlacasSolaresPage() {
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

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight mb-6">
            Placas Solares en España <br className="hidden md:block" /> Rendimiento por Localidad
          </h2>

          <p className="text-base md:text-xl text-slate-300 max-w-2xl mx-auto font-light leading-relaxed mb-10">
            Encuentra tu municipio y accede al estudio completo de irradiación, precio de instalación fotovoltaica, rentabilidad de paneles solares y bonificaciones fiscales (IBI/ICIO).
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
            <p className="text-xs font-bold text-emerald-600">por instalación fotovoltaica</p>
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
          <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-4">Directorio de paneles y placas solares por municipio</h2>
          <p className="text-slate-500">
            Selecciona tu provincia para consultar el mapa de municipios con datos de energía solar fotovoltaica, precio de instalación de paneles y potencial de ahorro.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200">
          <GeoDirectory
            level="provincias"
            baseRoute="/placas-solares"
            queryParam="provincia"
          />
        </div>
      </div>
    </main>
  );
}
