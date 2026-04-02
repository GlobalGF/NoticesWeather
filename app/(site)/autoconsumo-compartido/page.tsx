import { Metadata } from "next";
import GeoDirectory from "@/components/ui/GeoDirectory";
import { getProvinceStats, getAllProvinces } from "@/lib/data/getProvinceStats";
import { getProvinceMetadata } from "@/lib/data/provinces-metadata";
import ProvincePageClient from "@/components/ui/ProvincePageClient";

type Props = {
  searchParams: Promise<{ provincia?: string }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { provincia } = await searchParams;
  const baseMetadata: Metadata = {
    title: "Autoconsumo Compartido",
    description: "Únete a un proyecto de autoconsumo compartido en tu municipio y ahorra en tu factura de luz.",
  };

  if (provincia) {
    const stats = await getProvinceStats(provincia);
    const name = stats?.provinceName ?? provincia;
    return {
      title: `Autoconsumo Compartido en la Provincia de ${name}`,
      description: `Comunidades energéticas y proyectos de autoconsumo compartido en los municipios de ${name}. Únete y ahorra en tu factura.`,
    };
  }
  return baseMetadata;
}

export default async function AutoconsumoCompartidoRootPage({ searchParams }: Props) {
  const { provincia } = await searchParams;

  // ── Province-specific Landing ──────────────────────────────────
  if (provincia) {
    const [provStats, allProvs] = await Promise.all([
      getProvinceStats(provincia),
      getAllProvinces(),
    ]);

    if (!provStats) {
      return <GenericAutoconsumoCompartidoPage />;
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

          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-sky-500/15 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />

          <div className="mx-auto max-w-4xl px-4 relative z-30 text-center">
            <div className="inline-flex items-center gap-3 mb-5 bg-white/10 backdrop-blur-lg border border-white/20 px-5 py-2.5 rounded-full">
              <span className="h-2 w-2 rounded-full bg-sky-400 animate-pulse"></span>
              <p className="text-sky-300 font-bold tracking-widest uppercase text-[10px]">
                Comunidades Energéticas en {provStats.provinceName}
              </p>
            </div>

            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight mb-5">
              Autoconsumo Compartido en <br className="hidden md:block" />
              <span className="bg-gradient-to-r from-sky-300 to-blue-400 bg-clip-text text-transparent">{provStats.provinceName}</span>
            </h1>

            <p className="text-sm md:text-lg text-slate-300 max-w-2xl mx-auto font-light leading-relaxed mb-4">
              Encuentra iniciativas de energía solar compartida en los {provStats.totalMunicipios} municipios de {provStats.provinceName}. Únete sin necesidad de tener tejado propio.
            </p>
          </div>
        </div>

        {/* ── Province Client Section ── */}
        <ProvincePageClient
          hubName="Autoconsumo Compartido"
          baseRoute="/autoconsumo-compartido"
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
  return <GenericAutoconsumoCompartidoPage />;
}

// ── Extracted generic page (no province selected) ────────────────
function GenericAutoconsumoCompartidoPage() {
  return (
    <main className="bg-slate-50 min-h-screen font-sans">
      <div className="bg-slate-900 text-white">
        <div className="mx-auto max-w-5xl px-4 py-8 md:py-16 text-center">
          <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-2">
            COMUNIDADES ENERGÉTICAS
          </p>
          <h1 className="text-3xl md:text-4xl font-black leading-tight mb-4">
            Autoconsumo Compartido por Provincia
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Explora nuestra base de datos para localizar tu provincia y descubrir proyectos vecinales e iniciativas públicas de energía compartida.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-12">
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200">
          <GeoDirectory level="provincias" baseRoute="/autoconsumo-compartido" queryParam="provincia" />
        </div>
      </div>
    </main>
  );
}