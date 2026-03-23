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
        <div className={`grid grid-cols-1 gap-6 mt-6 ${level === 'provincias' ? 'sm:grid-cols-2 lg:grid-cols-3' : 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
            {items.map((item) => {
                const href = queryParam
                    ? `${baseRoute}?${queryParam}=${item.slug}`
                    : `${baseRoute}/${item.slug}`;

                if (level === 'provincias') {
                    const meta = getProvinceMetadata(item.slug);
                    return (
                        <Link key={item.slug} href={href} className="group relative overflow-hidden rounded-2xl aspect-[4/3] sm:aspect-video lg:aspect-[4/3]">
                            {/* Background Image */}
                            <img
                                src={meta.backgroundUrl}
                                alt={item.name}
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            {/* Overlay Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                            {/* Content */}
                            <div className="absolute inset-0 p-6 flex flex-col justify-end">
                                <span className="text-white/70 text-[10px] font-bold uppercase tracking-widest mb-1">PROVINCIA</span>
                                <h3 className="text-2xl font-bold text-white mb-2 decoration-blue-400 group-hover:underline decoration-2 underline-offset-4">
                                    {item.name}
                                </h3>
                                <p className="text-slate-300 text-xs line-clamp-2 mb-4 font-light leading-relaxed">
                                    {meta.description}
                                </p>

                                {/* Stats */}
                                <div className="flex gap-3 mt-auto">
                                    {item.radiation && (
                                        <div className="bg-white/10 backdrop-blur-md rounded-lg px-3 py-1.5 border border-white/20">
                                            <p className="text-[10px] text-white/60 font-medium uppercase">Radiación</p>
                                            <p className="text-white font-bold text-sm leading-tight">{item.radiation} <span className="text-[10px] font-normal">kWh/m²</span></p>
                                        </div>
                                    )}
                                    {item.sunHours && (
                                        <div className="bg-white/10 backdrop-blur-md rounded-lg px-3 py-1.5 border border-white/20">
                                            <p className="text-[10px] text-white/60 font-medium uppercase">Sol</p>
                                            <p className="text-white font-bold text-sm leading-tight">{item.sunHours} <span className="text-[10px] font-normal">h/año</span></p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Link>
                    );
                }

                return (
                    <Link key={item.slug} href={href} className="block group">
                        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-blue-400 transition-all duration-200 h-full flex items-center justify-between">
                            <h3 className="text-[15px] font-semibold text-slate-700 group-hover:text-blue-600 transition-colors">
                                {item.name}
                            </h3>
                            <svg className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </Link>
                );
            })}
        </div>
    );
}
