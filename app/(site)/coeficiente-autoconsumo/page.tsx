import { Metadata } from "next";
import GeoDirectory from "@/components/ui/GeoDirectory";

export const metadata: Metadata = {
  title: "Coeficientes de Reparto para Autoconsumo Colectivo",
  description: "Encuentra los coeficientes de reparto óptimos para instalaciones de autoconsumo colectivo y compartido en tu Comunidad Autónoma y Municipio.",
};

export default function CoeficienteAutoconsumoRootPage() {
  return (
    <main className="bg-slate-50 min-h-screen font-sans">
      <div className="bg-slate-900 text-white">
        <div className="mx-auto max-w-5xl px-4 py-8">
          <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-1">
            REPARTO DE ENERGÍA
          </p>
          <h1 className="text-3xl font-bold leading-tight">
            Coeficientes de Autoconsumo
          </h1>
        </div>
      </div>
      <div className="mx-auto max-w-5xl px-4 py-8">
        <GeoDirectory level="comunidades" baseRoute="/coeficiente-autoconsumo" />
      </div>
    </main>
  );
}