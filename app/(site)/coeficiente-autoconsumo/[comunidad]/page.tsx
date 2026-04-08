import { Metadata } from "next";
import GeoDirectory from "@/components/ui/GeoDirectory";
import { buildMetadata } from "@/lib/seo/metadata-builder";

type Props = { params: { comunidad: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { comunidad } = params;
    const name = comunidad.replace(/-/g, " ");
    return buildMetadata({
        title: `Coeficiente Autoconsumo en ${name}`,
        description: `Encuentra las provincias y coeficientes de reparto óptimos para instalaciones de autoconsumo en ${name}.`,
        pathname: `/coeficiente-autoconsumo/${comunidad}`,
    });
}

export default function CoeficienteAutoconsumoComunidadPage({ params }: Props) {
    const { comunidad } = params;

    return (
        <main className="bg-slate-50 min-h-screen font-sans">
            <div className="bg-slate-900 text-white">
                <div className="mx-auto max-w-5xl px-4 py-8">
                    <nav className="text-xs text-slate-400 flex gap-1.5 items-center inline-flex mb-4">
                        <a href="/" className="hover:text-white transition-colors">Inicio</a>
                        <span>›</span>
                        <a href="/coeficiente-autoconsumo" className="hover:text-white transition-colors">Coeficientes</a>
                        <span>›</span>
                        <span className="text-slate-200 capitalize">{comunidad.replace(/-/g, " ")}</span>
                    </nav>
                    <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-1">
                        COMUNIDAD AUTÓNOMA
                    </p>
                    <h1 className="text-3xl font-bold leading-tight capitalize">
                        Coeficientes Autoconsumo en {comunidad.replace(/-/g, " ")}
                    </h1>
                </div>
            </div>
            <div className="mx-auto max-w-5xl px-4 py-8">
                <GeoDirectory
                    level="provincias"
                    parentSlug={comunidad}
                    baseRoute={`/coeficiente-autoconsumo/${comunidad}`}
                />
            </div>
        </main>
    );
}
