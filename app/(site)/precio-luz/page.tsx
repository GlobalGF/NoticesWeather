import { Metadata } from "next";
import GeoDirectory from "@/components/ui/GeoDirectory";

export const metadata: Metadata = {
  title: "Precio de la Luz por Municipio",
  description: "Consulta el precio de la luz y compensación de excedentes en tu localidad.",
};

type Props = {
  searchParams: { provincia?: string };
};

export default function PrecioLuzRootPage({ searchParams }: Props) {
  const { provincia } = searchParams;

  return (
    <main className="bg-slate-50 min-h-screen font-sans">
      <div className="bg-slate-900 text-white">
        <div className="mx-auto max-w-5xl px-4 py-8">
          <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-1">
            TARIFAS PVPC Y MERCADO LIBRE
          </p>
          <h1 className="text-3xl font-bold leading-tight">
            {provincia ? "Directorio Municipal de la Luz" : "Precio de la Luz por Provincia"}
          </h1>
        </div>
      </div>
      <div className="mx-auto max-w-5xl px-4 py-8">
        {provincia ? (
          <>
            <div className="mb-4">
              <a href="/precio-luz" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                &larr; Volver a Provincias
              </a>
            </div>
            <GeoDirectory level="municipios" parentSlug={provincia} baseRoute="/precio-luz" />
          </>
        ) : (
          <GeoDirectory level="provincias" baseRoute="/precio-luz" queryParam="provincia" />
        )}
      </div>
    </main>
  );
}