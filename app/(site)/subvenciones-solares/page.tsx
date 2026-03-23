import { Metadata } from "next";
import GeoDirectory from "@/components/ui/GeoDirectory";

export const metadata: Metadata = {
  title: "Subvenciones para Placas Solares",
  description: "Consulta los programas de subvenciones y ayudas para la instalación de placas solares en tu Comunidad Autónoma y Provincia.",
};

export default function SubvencionesSolaresRootPage() {
  return (
    <main className="bg-slate-50 min-h-screen font-sans">
      <div className="bg-slate-900 text-white">
        <div className="mx-auto max-w-5xl px-4 py-8">
          <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-1">
            AYUDAS Y FONDOS EUROPEOS
          </p>
          <h1 className="text-3xl font-bold leading-tight">
            Subvenciones Solares por Comunidad
          </h1>
        </div>
      </div>
      <div className="mx-auto max-w-5xl px-4 py-8">
        <GeoDirectory level="comunidades" baseRoute="/subvenciones-solares" />
      </div>
    </main>
  );
}