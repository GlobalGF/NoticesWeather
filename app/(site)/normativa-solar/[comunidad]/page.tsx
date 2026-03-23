import { Metadata } from "next";
import GeoDirectory from "@/components/ui/GeoDirectory";

type Props = { params: { comunidad: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { comunidad } = params;
    return {
        title: `Normativa Solar en ${comunidad.replace(/-/g, " ")}`,
        description: `Consulta los permisos y normativas para instalaciones solares en ${comunidad.replace(/-/g, " ")}.`,
    };
}

export default function NormativaSolarComunidadPage({ params }: Props) {
    const { comunidad } = params;

    return (
        <main className="bg-slate-50 min-h-screen font-sans">
            <div className="bg-slate-900 text-white">
                <div className="mx-auto max-w-5xl px-4 py-8">
                    <nav className="text-xs text-slate-400 flex gap-1.5 items-center inline-flex mb-4">
                        <a href="/" className="hover:text-white transition-colors">Inicio</a>
                        <span>›</span>
                        <a href="/normativa-solar" className="hover:text-white transition-colors">Normativas</a>
                        <span>›</span>
                        <span className="text-slate-200 capitalize">{comunidad.replace(/-/g, " ")}</span>
                    </nav>
                    <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-1">
                        COMUNIDAD AUTÓNOMA
                    </p>
                    <h1 className="text-3xl font-bold leading-tight capitalize">
                        Normativa Solar en {comunidad.replace(/-/g, " ")}
                    </h1>
                </div>
            </div>
            <div className="mx-auto max-w-5xl px-4 py-8">
                <GeoDirectory
                    level="provincias"
                    parentSlug={comunidad}
                    baseRoute={`/normativa-solar/${comunidad}`}
                />
            </div>
        </main>
    );
}
