/**
 * ProvinceHubLinks — A strategic SEO component for internal cross-linking.
 * Lists the main urban hubs in the current province to drive authority.
 *
 * Design: Premium "tag-cloud" style, semi-transparent background.
 */

import Link from "next/link";
import { slugify, cleanMunicipalitySlug } from "@/lib/utils/slug";

type HubItem = {
    slug: string;
    municipio: string;
    provincia: string;
    habitantes: number;
};

type ProvinceHubLinksProps = {
    hubs: HubItem[];
    provincia: string;
    currentSlug: string;
    label?: string; // e.g. "Instalación de placas solares en..."
};

export function ProvinceHubLinks({ hubs, provincia, currentSlug, label = "Placas solares en" }: ProvinceHubLinksProps) {
    if (!hubs || hubs.length === 0) return null;

    // Filter out current municipality
    const filteredHubs = hubs.filter(h => h.slug !== currentSlug);

    return (
        <section className="mt-12 pt-8 border-t border-slate-200">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-6">
                Principales centros de autoconsumo en {provincia}
            </h3>
            <div className="flex flex-wrap gap-x-3 gap-y-2">
                {filteredHubs.map((h) => {
                    const provSlug = slugify(h.provincia);
                    const cleanMuniSlug = cleanMunicipalitySlug(h.slug, provSlug);

                    return (
                        <Link
                            key={h.slug}
                            href={`/placas-solares/${cleanMuniSlug}`}
                            className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-blue-600 transition-colors"
                        >
                            <span className="text-slate-300">•</span>
                            <span className="underline decoration-slate-200 underline-offset-4 hover:decoration-blue-400 font-medium">
                                {label} {h.municipio}
                            </span>
                        </Link>
                    );
                })}
            </div>
            <p className="mt-4 text-[10px] text-slate-400 uppercase tracking-tighter">
                Red de autoconsumo local · {provincia} · Actualizado {new Date().getFullYear()}
            </p>
        </section>
    );
}
