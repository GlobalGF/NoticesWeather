import { Metadata } from "next";
import GeoDirectory from "@/components/ui/GeoDirectory";

export const metadata: Metadata = {
  title: "Bonificación del IBI por Placas Solares",
  description: "Consulta los descuentos y bonificaciones en el IBI (Impuesto sobre Bienes Inmuebles) por la instalación de placas solares en tu municipio.",
};

type Props = {
  searchParams: { provincia?: string };
};

export default function BonificacionIbiRootPage({ searchParams }: Props) {
  const { provincia } = searchParams;

  return (
    <main className="bg-slate-50 min-h-screen font-sans">
      <div className="bg-slate-900 text-white">
        <div className="mx-auto max-w-5xl px-4 py-8">
          <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-1">
            AYUDAS FISCALES LOCALES
          </p>
          <h1 className="text-3xl font-bold leading-tight">
            {provincia ? "Directorio Municipal de Bonificaciones IBI" : "Bonificación del IBI por Provincia"}
          </h1>
        </div>
      </div>
      <div className="mx-auto max-w-5xl px-4 py-8">
        {provincia ? (
          <>
            <div className="mb-4">
              <a href="/bonificacion-ibi" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                &larr; Volver a Provincias
              </a>
            </div>
            <GeoDirectory level="municipios" parentSlug={provincia} baseRoute="/bonificacion-ibi" />
          </>
        ) : (
          <GeoDirectory level="provincias" baseRoute="/bonificacion-ibi" queryParam="provincia" />
        )}
      </div>
    </main>
  );
}