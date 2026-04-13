import Link from "next/link";
import { slugify, cleanMunicipalitySlug } from "@/lib/utils/slug";

type SiloNavigationProps = {
    currentSilo: "placas-solares" | "baterias-solares" | "precio-luz" | "subvenciones-solares";
    municipioName: string;
    municipioSlug: string;
    provinciaName?: string;
    comunidadName?: string;
};

import { generateDynamicText } from "@/lib/pseo/spintax";

export function SiloNavigation({ currentSilo, municipioName, municipioSlug, provinciaName, comunidadName }: SiloNavigationProps) {
    const comSlug = comunidadName ? slugify(comunidadName) : null;
    const provSlug = provinciaName ? slugify(provinciaName) : null;
    const vars = { MUNICIPIO: municipioName };

    // CLEAN SLUG: Eliminate internal redirects
    const cleanSlug = provSlug ? cleanMunicipalitySlug(municipioSlug, provSlug) : municipioSlug;

    const links = [
        {
            silo: "placas-solares",
            title: generateDynamicText("{Instalación de Placas Solares|Energía Solar Fotovoltaica|Montaje de Paneles Solares}", `${municipioSlug}-nav-1`, vars),
            href: `/placas-solares/${cleanSlug}`,
            icon: "☀️"
        },
        {
            silo: "baterias-solares",
            title: generateDynamicText("{Baterías y Almacenamiento|Acumuladores Solares|Sistemas de Baterías}", `${municipioSlug}-nav-2`, vars),
            href: `/baterias-solares/${cleanSlug}`,
            icon: "🔋"
        },
        {
            silo: "precio-luz",
            title: generateDynamicText("{Precio de la Luz y PVPC|Tarifa Eléctrica Hoy|Evolución Precio Luz}", `${municipioSlug}-nav-3`, vars),
            href: `/precio-luz`,
            icon: "💶"
        },
    ];

    // Add subvenciones if we have full routing context
    if (comSlug && provSlug) {
        links.push({
            silo: "subvenciones-solares",
            title: generateDynamicText("{Subvenciones y Ayudas NEXTGEN|Ayudas Públicas Autoconsumo|Incentivos Fiscales Solares}", `${municipioSlug}-nav-4`, vars),
            href: `/subvenciones-solares/${comSlug}/${provSlug}/${cleanSlug}`,
            icon: "🇪🇺"
        });
    }

    // Filter out the current active silo
    const crossLinks = links.filter(link => link.silo !== currentSilo);

    const header = generateDynamicText("{Otras consultas sobre energía en [MUNICIPIO]|Guía completa de ahorro en [MUNICIPIO]|Recursos solares en [MUNICIPIO]}", `${municipioSlug}-nav-h`, vars);
    const intro = generateDynamicText("{Para maximizar tu ahorro energético en [MUNICIPIO], te recomendamos consultar también la viabilidad y rentabilidad de:|Para un análisis energético integral en [MUNICIPIO], revisa estos informes adicionales sobre:|Optimiza al máximo tu vivienda en [MUNICIPIO] explorando estos silos de información:}", `${municipioSlug}-nav-i`, vars);

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 overflow-hidden my-8">
            <div className="flex items-center gap-2 mb-4">
                <span className="flex h-6 w-6 items-center justify-center rounded bg-slate-100 text-slate-500 font-black text-xs">ℹ</span>
                <p className="text-lg font-bold text-slate-900 tracking-tight">{header}</p>
            </div>
            <p className="text-sm text-slate-500 mb-5">
                {intro}
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
