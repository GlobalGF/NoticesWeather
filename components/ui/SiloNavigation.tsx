import Link from "next/link";
import { slugify, cleanMunicipalitySlug } from "@/lib/utils/slug";

type SiloNavigationProps = {
    currentSilo: "placas-solares" | "baterias-solares" | "precio-luz" | "subvenciones-solares";
    municipioName: string;
    municipioSlug: string;
    provinciaName?: string;
    comunidadName?: string;
};

export function SiloNavigation({ currentSilo, municipioName, municipioSlug, provinciaName, comunidadName }: SiloNavigationProps) {
    const comSlug = comunidadName ? slugify(comunidadName) : null;
    const provSlug = provinciaName ? slugify(provinciaName) : null;

    // CLEAN SLUG: Eliminate internal redirects
    const cleanSlug = provSlug ? cleanMunicipalitySlug(municipioSlug, provSlug) : municipioSlug;

    const links = [
        {
            silo: "placas-solares",
            title: "Instalación de Placas Solares",
            href: `/placas-solares/${cleanSlug}`,
            icon: "☀️"
        },
        {
            silo: "baterias-solares",
            title: "Baterías y Almacenamiento",
            href: `/baterias-solares/${cleanSlug}`,
            icon: "🔋"
        },
        {
            silo: "precio-luz",
            title: "Precio de la Luz y PVPC",
            href: `/precio-luz`,
            icon: "💶"
        },
    ];

    // Add subvenciones if we have full routing context
    if (comSlug && provSlug) {
        links.push({
            silo: "subvenciones-solares",
            title: "Subvenciones y Ayudas NEXTGEN",
            href: `/subvenciones-solares/${comSlug}/${provSlug}/${cleanSlug}`,
            icon: "🇪🇺"
        });
    }

    // Filter out the current active silo
    const crossLinks = links.filter(link => link.silo !== currentSilo);

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 overflow-hidden my-8">
            <div className="flex items-center gap-2 mb-4">
                <span className="flex h-6 w-6 items-center justify-center rounded bg-slate-100 text-slate-500 font-black text-xs">ℹ</span>
                <p className="text-lg font-bold text-slate-900 tracking-tight">Otras consultas sobre energía en {municipioName}</p>
            </div>
            <p className="text-sm text-slate-500 mb-5">
                Para maximizar tu ahorro energético en {municipioName}, te recomendamos consultar también la viabilidad y rentabilidad de:
            </p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {crossLinks.map((link) => (
                    <li key={link.silo}>
                        <Link 
                            href={link.href} 
                            className="group flex items-center gap-3 p-3 rounded-lg border border-slate-100 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 transition-colors"
                        >
                            <span className="text-lg">{link.icon}</span>
                            <span className="font-semibold text-slate-700 text-sm group-hover:text-indigo-700 transition-colors">
                                {link.title}
                            </span>
                            <span className="ml-auto text-slate-300 group-hover:text-indigo-400">›</span>
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}
