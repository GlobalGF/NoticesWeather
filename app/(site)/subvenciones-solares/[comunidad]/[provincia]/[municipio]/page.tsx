import { Metadata } from "next";
import Link from "next/link";
import { getTopSubsidyProgramSlugs } from "@/data/repositories/subsidies.repo";

type Props = { params: { comunidad: string; provincia: string; municipio: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { municipio } = params;
    return {
        title: `Programas de Subvenciones en ${municipio.replace(/-/g, " ")}`,
        description: `Consulta los programas disponibles de ayudas para placas solares en ${municipio.replace(/-/g, " ")}.`,
    };
}

export default async function SubvencionesSolaresMunicipioPage({ params }: Props) {
    const { comunidad, provincia, municipio } = params;
    const programs = await getTopSubsidyProgramSlugs(10);

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
                        <a href={`/subvenciones-solares/${comunidad}/${provincia}`} className="hover:text-white transition-colors capitalize">{provincia.replace(/-/g, " ")}</a>
                        <span>›</span>
                        <span className="text-slate-200 capitalize">{municipio.replace(/-/g, " ")}</span>
                    </nav>
                    <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-1">
                        MUNICIPIO
                    </p>
                    <h1 className="text-3xl font-bold leading-tight capitalize">
                        Subvenciones en {municipio.replace(/-/g, " ")}
                    </h1>
                </div>
            </div>
            <div className="mx-auto max-w-5xl px-4 py-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                    {programs.map((prog) => (
                        <Link key={prog} href={`/subvenciones-solares/${comunidad}/${provincia}/${municipio}/${prog}`} className="block group">
                            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-blue-400 transition-all duration-200 h-full flex items-center justify-between">
                                <h3 className="text-[15px] font-semibold text-slate-700 group-hover:text-blue-600 transition-colors capitalize">
                                    {prog.replace(/-/g, " ")}
                                </h3>
                                <svg className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </main>
    );
}
