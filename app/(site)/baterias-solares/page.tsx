import { Metadata } from "next";
import GeoDirectory from "@/components/ui/GeoDirectory";

export const metadata: Metadata = {
  title: "Baterías Solares: Precios, Rentabilidad y Ayudas por Municipio",
  description: "Encuentra instaladores, calcula el ahorro mensual y descubre las ayudas disponibles para instalar baterías solares en tu localidad.",
};

type Props = {
  searchParams: { provincia?: string };
};

export default function BateriasSolaresRootPage({ searchParams }: Props) {
  const { provincia } = searchParams;

  return (
    <main className="bg-slate-50 min-h-screen font-sans">
      <div className="bg-slate-900 text-white">
        <div className="mx-auto max-w-5xl px-4 py-8">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-1">
                DIRECTORIO NACIONAL
              </p>
              <h1 className="text-3xl font-bold text-white leading-tight">
                {provincia
                  ? `Directorio de Baterías Solares`
                  : "Baterías Solares por Provincia"}
              </h1>
              <p className="mt-2 text-sm text-slate-300 max-w-2xl leading-relaxed font-light">
                {provincia
                  ? "Selecciona tu municipio para ver el estudio detallado de rentabilidad y precios de baterías solares de litio."
                  : "Selecciona tu provincia para encontrar la mejor rentabilidad y modelos de baterías solares LFP en tu localidad."}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8">
        {provincia ? (
          <>
            <div className="mb-4">
              <a href="/baterias-solares" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                &larr; Volver a Provincias
              </a>
            </div>
            <GeoDirectory
              level="municipios"
              parentSlug={provincia}
              baseRoute="/baterias-solares"
            />
          </>
        ) : (
          <GeoDirectory
            level="provincias"
            baseRoute="/baterias-solares"
            queryParam="provincia"
          />
        )}
      </div>
    </main>
  );
}