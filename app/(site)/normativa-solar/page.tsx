import { Metadata } from "next";
import GeoDirectory from "@/components/ui/GeoDirectory";

export const metadata: Metadata = {
  title: "Normativa Solar y Permisos por Comunidad",
  description: "Consulta la normativa vigente, permisos y regulaciones requeridas para instalar paneles solares en tu Comunidad Autónoma y Municipio.",
};

export default function NormativaSolarRootPage() {
  return (
    <main className="bg-slate-50 min-h-screen font-sans">
      <div className="bg-slate-900 text-white">
        <div className="mx-auto max-w-5xl px-4 py-8">
          <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-1">
            PERMISOS Y REGULACIONES
          </p>
          <h1 className="text-3xl font-bold leading-tight">
            Normativa Solar en España
          </h1>
        </div>
      </div>
      <div className="mx-auto max-w-5xl px-4 py-8">
        <GeoDirectory level="comunidades" baseRoute="/normativa-solar" />
      </div>
    </main>
  );
}