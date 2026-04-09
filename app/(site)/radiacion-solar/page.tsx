import { Metadata } from "next";
import GeoDirectory from "@/components/ui/GeoDirectory";
import { buildMetadata } from "@/lib/seo/metadata-builder";

export const metadata: Metadata = buildMetadata({
  title: "Radiación solar en España",
  description: "Consulta el nivel de radiación solar y horas de sol equivalentes por Comunidad Autónoma en España.",
  pathname: "/radiacion-solar",
  noIndex: true,
});

export default function RadiacionSolarRootPage() {
  return (
    <main className="bg-slate-50 min-h-screen font-sans">
      <div className="bg-slate-900 text-white">
        <div className="mx-auto max-w-5xl px-4 py-8">
          <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-1">
            MAPA SOLAR DE ESPAÑA
          </p>
          <h1 className="text-3xl font-bold leading-tight">
            Directorio de Comunidades Autónomas
          </h1>
        </div>
      </div>
      <div className="mx-auto max-w-5xl px-4 py-8">
        <GeoDirectory level="comunidades" baseRoute="/radiacion-solar" />
      </div>
    </main>
  );
}