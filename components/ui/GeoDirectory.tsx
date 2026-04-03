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

/* ── Static Fallbacks for PSEO ───────────────────────────────────── */

const COMUNIDADES_ESTATICAS = [
    "Andalucía", "Aragón", "Principado de Asturias", "Islas Baleares", "Canarias",
    "Cantabria", "Castilla y León", "Castilla-La Mancha", "Cataluña",
    "Comunitat Valenciana", "Extremadura", "Galicia", "Comunidad de Madrid",
    "Región de Murcia", "Comunidad Foral de Navarra", "País Vasco", "La Rioja",
    "Ceuta", "Melilla"
].sort();

const PROVINCIAS_POR_COMUNIDAD: Record<string, string[]> = {
    "andalucia": ["Almería", "Cádiz", "Córdoba", "Granada", "Huelva", "Jaén", "Málaga", "Sevilla"],
    "aragon": ["Huesca", "Teruel", "Zaragoza"],
    "principado-de-asturias": ["Asturias"],
    "islas-baleares": ["Islas Baleares"],
    "canarias": ["Las Palmas", "Santa Cruz de Tenerife"],
    "cantabria": ["Cantabria"],
    "castilla-y-leon": ["Ávila", "Burgos", "León", "Palencia", "Salamanca", "Segovia", "Soria", "Valladolid", "Zamora"],
    "castilla-la-mancha": ["Albacete", "Ciudad Real", "Cuenca", "Guadalajara", "Toledo"],
    "cataluna": ["Barcelona", "Girona", "Lleida", "Tarragona"],
    "comunitat-valenciana": ["Alicante", "Castellón", "Valencia"],
    "extremadura": ["Badajoz", "Cáceres"],
    "galicia": ["A Coruña", "Lugo", "Ourense", "Pontevedra"],
    "comunidad-madrid": ["Madrid"],
    "region-de-murcia": ["Murcia"],
    "comunidad-foral-navarra": ["Navarra"],
    "pais-vasco": ["Álava", "Bizkaia", "Gipuzkoa"],
    "la-rioja": ["La Rioja"],
    "ceuta": ["Ceuta"],
    "melilla": ["Melilla"]
};

export default async function GeoDirectory({ level, parentSlug, baseRoute, queryParam }: GeoDirectoryProps) {
    const supabase = await createSupabaseServerClient();
    let items: Item[] = [];

    if (level === "comunidades") {
        const { data } = await supabase.from("municipios_energia").select("comunidad_autonoma").not("comunidad_autonoma", "is", null);
        
        let uniqueNames = new Set<string>();
        if (data) {
            (data as any[]).forEach(d => {
                if (d.comunidad_autonoma) {
                    uniqueNames.add(d.comunidad_autonoma);
                }
            });
        }
        
        // Always ensure the 17+2 regions are present for SEO
        COMUNIDADES_ESTATICAS.forEach(name => uniqueNames.add(name));
        
        items = Array.from(uniqueNames).sort().map((name) => {
            const slug = slugify(name);
            return { 
                name, 
                slug: slug 
            };
        });

    } else if (level === "provincias") {
        // Fetch all ~8.1k municipalities in parallel chunks (1k per page) to bypass PostgREST limits
        const pageSize = 1000;
        const totalPages = 9; // 8132 / 1000 = ~9 pages
        const pageIndices = Array.from({ length: totalPages }, (_, i) => i);

        const pageResults = await Promise.all(pageIndices.map(page => 
            supabase.from("municipios_energia")
                .select("provincia, comunidad_autonoma, irradiacion_solar, horas_sol")
                .not("provincia", "is", null)
                .order("provincia") // Stable sort for consistent pagination
                .range(page * pageSize, (page + 1) * pageSize - 1)
        ));

        interface MunicipioRow {
            provincia: string;
            comunidad_autonoma: string;
            irradiacion_solar: number | null;
            horas_sol: number | null;
        }

        let filtered = pageResults.flatMap(r => (r.data || []) as MunicipioRow[]);
        
        if (parentSlug) {
            // Support both 'ceuta' and 'ceuta-ceuta' as parent slugs
            // Use the full slug unless it's a known ceuta/melilla variation
            const normalizedParent = (parentSlug === "ceuta-ceuta" || parentSlug === "melilla-melilla") 
                ? parentSlug.split("-")[0] 
                : parentSlug;
                
            filtered = filtered.filter((d) => {
                const comSlug = slugify(d.comunidad_autonoma as string);
                // Handle common variations: "comunidad-de-madrid" matches "madrid" if coming from home, etc.
                return comSlug === normalizedParent || comSlug.includes(normalizedParent) || normalizedParent.includes(comSlug);
            });
        }

        // Group by province SUUG to calculate averages and DE-DUPLICATE
        // e.g. "Valencia" and "Valencia/València" both map to "valencia"
        const provinceMap: Record<string, { name: string; totalRad: number; totalHours: number; count: number }> = {};
        
        filtered.forEach((d) => {
            let rawName = d.provincia as string;
            // Smart handling for bilingual names like "Araba/Álava" or "Alicante/Alacant"
            let cleanName = rawName;
            if (rawName.includes("/")) {
                const parts = rawName.split("/").map(p => p.trim());
                // Favor Spanish part if it exists (usually the one matching the user's metadata keys)
                const favorSpanish = parts.find(p => p === "Álava" || p === "Islas Baleares" || p === "Valencia" || p === "Alicante" || p === "Castellón");
                cleanName = favorSpanish || parts[0];
            }
            
            // Standardize articles: "Coruña, A" -> "A Coruña"
            if (cleanName.includes(", ")) {
                const [main, article] = cleanName.split(", ");
                cleanName = `${article} ${main}`;
            }

            // Special case for Illes Balears -> Islas Baleares
            const normalizedLower = cleanName.trim().toLowerCase();
            if (normalizedLower === "illes balears" || normalizedLower.includes("balears") || normalizedLower === "baleares") {
                cleanName = "Islas Baleares";
            }
            
            const slug = slugify(cleanName);
            
            if (!provinceMap[slug]) {
                provinceMap[slug] = { name: cleanName, totalRad: 0, totalHours: 0, count: 0 };
            }
            if (d.irradiacion_solar) {
                provinceMap[slug].totalRad += d.irradiacion_solar;
                provinceMap[slug].totalHours += d.horas_sol || 0;
                provinceMap[slug].count += 1;
            }
        });

        // Merge with static provinces to ensure we NEVER miss any
        if (parentSlug) {
            const normalizedParent = parentSlug.includes("-") ? parentSlug.split("-")[0] : parentSlug;
            if (PROVINCIAS_POR_COMUNIDAD[normalizedParent]) {
                PROVINCIAS_POR_COMUNIDAD[normalizedParent].forEach(provName => {
                    const slug = slugify(provName);
                    if (!provinceMap[slug]) {
                        provinceMap[slug] = { name: provName, totalRad: 0, totalHours: 0, count: 0 };
                    }
                });
            }
        } else {
            Object.values(PROVINCIAS_POR_COMUNIDAD).flat().forEach(provName => {
                const slug = slugify(provName);
                if (!provinceMap[slug]) {
                    provinceMap[slug] = { name: provName, totalRad: 0, totalHours: 0, count: 0 };
                }
            });
        }

        items = Object.entries(provinceMap).map(([slug, stats]) => {
            return {
                name: stats.name,
                slug: slug,
                radiation: stats.count > 0 ? Math.round(stats.totalRad / stats.count) : undefined,
                sunHours: stats.count > 0 ? Math.round(stats.totalHours / stats.count) : undefined
            };
        }).sort((a, b) => a.name.localeCompare(b.name, 'es'));

    } else if (level === "municipios") {
        let query = supabase.from("municipios_energia").select("municipio, slug, provincia").not("municipio", "is", null);

        const { data } = await query;
        let filtered = (data ?? []) as any[];
        
        if (parentSlug) {
            filtered = filtered.filter((d) => slugify(d.provincia as string) === parentSlug);
        }

        // --- Special Case: Ceuta/Melilla ---
        // If it's Ceuta or Melilla but DB is empty, inject the single city
        if (filtered.length === 0 && (parentSlug === "ceuta" || parentSlug === "melilla")) {
            const name = parentSlug === "ceuta" ? "Ceuta" : "Melilla";
            items = [{ name, slug: parentSlug }];
        } else {
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
            <div className="mt-6 relative w-full min-w-0" role="region" aria-label="Directorio de provincias" tabIndex={0}>
                {/* Scroll container */}
                <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth scrollbar-hide min-w-0 w-full" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
                    {items.map((item) => {
                        const href = queryParam
                            ? `${baseRoute}?${queryParam}=${item.slug}`
                            : `${baseRoute}/${item.slug}`;
                        const meta = getProvinceMetadata(item.slug);
                        return (
                            <Link
                                key={item.slug}
                                href={href}
                                className="group relative overflow-hidden rounded-xl flex-none w-[75vw] max-w-[280px] sm:max-w-none sm:w-[320px] lg:w-[360px] aspect-[3/2] snap-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                                aria-label={`${item.name} — ${meta.description}`}
                            >
                                <div 
                                    className="absolute inset-0 bg-slate-800" 
                                    style={{ 
                                        backgroundImage: `url(${meta.backgroundUrl})`,
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center'
                                    }}
                                />
                                <img
                                    src={meta.backgroundUrl}
                                    alt={item.name}
                                    loading="lazy"
                                    referrerPolicy="no-referrer"
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent opacity-90 transition-opacity" />
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
