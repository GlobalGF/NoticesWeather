import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils/slug";
import { getProvinceMetadata } from "@/lib/data/provinces-metadata";

export type GeoLevel = "comunidades" | "provincias" | "municipios";

interface GeoDirectoryProps {
    level: GeoLevel;
    parentSlug?: string; // Slug of the parent (e.g. comunidad slug when level="provincias")
    baseRoute: string; // The base URL to append the next segment to (e.g. "/radiacion-solar")
    queryParam?: string; // If provided, append as ?[queryParam]=slug instead of /slug
}

interface Item {
    name: string;
    slug: string;
    radiation?: number;
    sunHours?: number;
}

export default async function GeoDirectory({ level, parentSlug, baseRoute, queryParam }: GeoDirectoryProps) {
    const supabase = await createSupabaseServerClient();
    let items: Item[] = [];

    if (level === "comunidades") {
        const { data } = await supabase.from("municipios_energia").select("comunidad_autonoma").not("comunidad_autonoma", "is", null);
        if (data) {
            const typedData = data as any[];
            const unique = Array.from(new Set(typedData.map((d) => d.comunidad_autonoma as string))).sort();
            items = unique.map((name) => ({ name, slug: slugify(name) }));
        }
    } else if (level === "provincias") {
        const { data } = await supabase.from("municipios_energia")
            .select("provincia, comunidad_autonoma, irradiacion_solar, horas_sol")
            .not("provincia", "is", null);

        if (data) {
            let filtered = data as any[];
            if (parentSlug) {
                filtered = filtered.filter((d) => slugify(d.comunidad_autonoma as string) === parentSlug);
            }

            // Group by province to calculate averages
            const provinceMap: Record<string, { totalRad: number; totalHours: number; count: number }> = {};
            filtered.forEach((d) => {
                if (!provinceMap[d.provincia]) {
                    provinceMap[d.provincia] = { totalRad: 0, totalHours: 0, count: 0 };
                }
                if (d.irradiacion_solar) {
                    provinceMap[d.provincia].totalRad += d.irradiacion_solar;
                    provinceMap[d.provincia].totalHours += d.horas_sol || 0;
                    provinceMap[d.provincia].count += 1;
                }
            });

            items = Object.entries(provinceMap).map(([name, stats]) => ({
                name,
                slug: slugify(name),
                radiation: stats.count > 0 ? Math.round(stats.totalRad / stats.count) : undefined,
                sunHours: stats.count > 0 ? Math.round(stats.totalHours / stats.count) : undefined
            })).sort((a, b) => a.name.localeCompare(b.name, 'es'));
        }
    } else if (level === "municipios") {
        let query = supabase.from("municipios_energia").select("municipio, slug, provincia").not("municipio", "is", null);

        const { data } = await query;
        if (data) {
            let filtered = data as any[];
            if (parentSlug) {
                filtered = filtered.filter((d) => slugify(d.provincia as string) === parentSlug);
            }
            items = filtered.map((d) => ({
                name: d.municipio as string,
                slug: d.slug as string
            })).sort((a, b) => a.name.localeCompare(b.name, 'es'));
        }
    }

    if (!items.length) {
        return <div className="text-slate-500 py-4">No se encontraron resultados.</div>;
    }

    return (
        <>
        {level === 'provincias' ? (
            <div className="mt-6 relative" role="region" aria-label="Directorio de provincias" tabIndex={0}>
                {/* Scroll container */}
                <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
                    {items.map((item) => {
                        const href = queryParam
                            ? `${baseRoute}?${queryParam}=${item.slug}`
                            : `${baseRoute}/${item.slug}`;
                        const meta = getProvinceMetadata(item.slug);
                        return (
                            <Link
                                key={item.slug}
                                href={href}
                                className="group relative overflow-hidden rounded-xl flex-none w-[320px] sm:w-[360px] aspect-[3/2] snap-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                                aria-label={`${item.name} — ${meta.description}`}
                            >
                                <img
                                    src={meta.backgroundUrl}
                                    alt={item.name}
                                    loading="lazy"
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                                <div className="absolute inset-0 p-4 flex flex-col justify-end">
                                    <span className="text-white/60 text-[9px] font-bold uppercase tracking-widest mb-0.5">Provincia</span>
                                    <h3 className="text-lg font-bold text-white mb-1 group-hover:underline decoration-blue-400 decoration-2 underline-offset-4 leading-tight">
                                        {item.name}
                                    </h3>
                                    <div className="flex gap-2 mt-1">
                                        {item.radiation && (
                                            <div className="bg-white/10 backdrop-blur-md rounded-md px-2 py-1 border border-white/20">
                                                <p className="text-white font-bold text-xs leading-tight">{item.radiation} <span className="text-[9px] font-normal text-white/70">kWh/m²</span></p>
                                            </div>
                                        )}
                                        {item.sunHours && (
                                            <div className="bg-white/10 backdrop-blur-md rounded-md px-2 py-1 border border-white/20">
                                                <p className="text-white font-bold text-xs leading-tight">{item.sunHours} <span className="text-[9px] font-normal text-white/70">h/año</span></p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
                {/* Fade edges to hint at scrollability */}
                <div className="absolute top-0 right-0 bottom-4 w-12 bg-gradient-to-l from-white to-transparent pointer-events-none rounded-r-xl" aria-hidden="true" />
                <p className="text-center text-[10px] text-slate-400 font-medium mt-1 tracking-wide" aria-hidden="true">Desliza para explorar más provincias →</p>
            </div>
        ) : (
            <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 mt-6`}>
                {items.map((item) => {
                    const href = queryParam
                        ? `${baseRoute}?${queryParam}=${item.slug}`
                        : `${baseRoute}/${item.slug}`;
                    return (
                        <Link
                            key={item.slug}
                            href={href}
                            className="group block bg-white rounded-lg border border-slate-200 px-3 py-2.5 hover:border-blue-400 hover:shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                        >
                            <h3 className="text-sm font-medium text-slate-700 group-hover:text-blue-600 transition-colors truncate">
                                {item.name}
                            </h3>
                        </Link>
                    );
                })}
            </div>
        )}
        </>
    );
}
