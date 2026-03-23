import { Metadata } from "next";
import GeoDirectory from "@/components/ui/GeoDirectory";

type Props = { params: { comunidad: string; provincia: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { provincia } = params;
    return {
        title: `Subvenciones Solares en ${provincia.replace(/-/g, " ")}`,
        description: `Consulta las ayudas públicas y subvenciones para instalaciones fotovoltaicas en los municipios de ${provincia.replace(/-/g, " ")}.`,
    };
}

export default function SubvencionesSolaresProvinciaPage({ params }: Props) {
    const { comunidad, provincia } = params;

    return (
        <main className="bg-slate-50 min-h-screen font-sans">
            <div className="bg-slate-900 text-white">
                <div className="mx-auto max-w-5xl px-4 py-8">
                    <nav className="text-xs text-slate-400 flex gap-1.5 items-center inline-flex mb-4">
                        <a href="/" className="hover:text-white transition-colors">Inicio</a>
                        <span>›</span>
                        <a href="/subvenciones-solares" className="hover:text-white transition-colors">Subvenciones</a>
                        <span>›</span>
                        <a href={`/subvenciones-solares/${comunidad}`} className="hover:text-white transition-colors capitalize">{comunidad.replace(/-/g, " ")}</a>
                        <span>›</span>
                        <span className="text-slate-200 capitalize">{provincia.replace(/-/g, " ")}</span>
                    </nav>
                    <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-1">
                        PROVINCIA
                    </p>
                    <h1 className="text-3xl font-bold leading-tight capitalize">
                        Subvenciones en {provincia.replace(/-/g, " ")}
                    </h1>
                </div>
            </div>
            <div className="mx-auto max-w-5xl px-4 py-8">
                <GeoDirectory
                    level="municipios"
                    parentSlug={provincia}
                    baseRoute={`/subvenciones-solares/${comunidad}/${provincia}`}
                />
            </div>
        </main>
    );
}
