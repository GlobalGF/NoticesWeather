import { Metadata } from "next";
import GeoDirectory from "@/components/ui/GeoDirectory";

export const metadata: Metadata = {
  title: "Autoconsumo Compartido",
  description: "Únete a un proyecto de autoconsumo compartido en tu municipio y ahorra en tu factura de luz.",
};

type Props = {
  searchParams: { provincia?: string };
};

export default function AutoconsumoCompartidoRootPage({ searchParams }: Props) {
  const { provincia } = searchParams;

  return (
    <main className="bg-slate-50 min-h-screen font-sans">
      <div className="bg-slate-900 text-white">
        <div className="mx-auto max-w-5xl px-4 py-8">
          <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-1">
            COMUNIDADES ENERGÉTICAS
          </p>
          <h1 className="text-3xl font-bold leading-tight">
            {provincia ? "Directorio Municipal" : "Autoconsumo Compartido por Provincia"}
          </h1>
        </div>
      </div>
      <div className="mx-auto max-w-5xl px-4 py-8">
        {provincia ? (
          <>
            <div className="mb-4">
              <a href="/autoconsumo-compartido" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                &larr; Volver a Provincias
              </a>
            </div>
            <GeoDirectory level="municipios" parentSlug={provincia} baseRoute="/autoconsumo-compartido" />
          </>
        ) : (
          <GeoDirectory level="provincias" baseRoute="/autoconsumo-compartido" queryParam="provincia" />
        )}
      </div>
    </main>
  );
}