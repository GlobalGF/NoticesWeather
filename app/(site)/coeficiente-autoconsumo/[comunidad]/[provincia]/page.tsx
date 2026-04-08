import { Metadata } from "next";
import GeoDirectory from "@/components/ui/GeoDirectory";
import { buildMetadata } from "@/lib/seo/metadata-builder";

type Props = { params: { comunidad: string; provincia: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { comunidad, provincia } = params;
    const name = provincia.replace(/-/g, " ");
    return buildMetadata({
        title: `Coeficiente Autoconsumo en ${name}`,
        description: `Encuentra las localidades para calcular el coeficiente de reparto óptimo para autoconsumo en la provincia de ${name}.`,
        pathname: `/coeficiente-autoconsumo/${comunidad}/${provincia}`,
    });
}

export default function CoeficienteAutoconsumoProvinciaPage({ params }: Props) {
    const { comunidad, provincia } = params;

    return (
        <main className="bg-slate-50 min-h-screen font-sans">
            <div className="bg-slate-900 text-white">
                <div className="mx-auto max-w-5xl px-4 py-8">
                    <nav className="text-xs text-slate-400 flex gap-1.5 items-center inline-flex mb-4">
                        <a href="/" className="hover:text-white transition-colors">Inicio</a>
                        <span>›</span>
                        <a href="/coeficiente-autoconsumo" className="hover:text-white transition-colors">Coeficientes</a>
                        <span>›</span>
                        <a href={`/coeficiente-autoconsumo/${comunidad}`} className="hover:text-white transition-colors capitalize">{comunidad.replace(/-/g, " ")}</a>
                        <span>›</span>
                        <span className="text-slate-200 capitalize">{provincia.replace(/-/g, " ")}</span>
                    </nav>
                    <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-1">
                        PROVINCIA
                    </p>
                    <h1 className="text-3xl font-bold leading-tight capitalize">
                        Coeficientes en {provincia.replace(/-/g, " ")}
                    </h1>
                </div>
            </div>
            <div className="mx-auto max-w-5xl px-4 py-8">
                <GeoDirectory
                    level="municipios"
                    parentSlug={provincia}
                    baseRoute={`/coeficiente-autoconsumo/${comunidad}/${provincia}`}
                />
            </div>
        </main>
    );
}
