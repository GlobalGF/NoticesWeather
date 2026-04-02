import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils/slug";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q");

    if (!q || q.length < 2) {
        return NextResponse.json({ results: [] });
    }

    const supabase = await createSupabaseServerClient();
    
    // Search in municipios_energia
    const { data, error } = await supabase
        .from("municipios_energia")
        .select("slug, municipio, provincia, comunidad_autonoma")
        .ilike("municipio", `%${q}%`)
        .order("habitantes", { ascending: false, nullsFirst: false })
        .limit(10);

    if (error) {
        console.error("Error searching cities:", error);
        return NextResponse.json({ results: [] }, { status: 500 });
    }

    const results = ((data as any[]) ?? []).map((row) => {
        // Build the URL specifically for subsidies
        const ccaaSlug = slugify(row.comunidad_autonoma);
        const provSlug = slugify(row.provincia);
        const muniSlug = row.slug;
        
        // Handle Ceuta and Melilla exceptions
        const routeCcaa = (ccaaSlug === "ceuta" || ccaaSlug === "melilla") ? `${ccaaSlug}-${ccaaSlug}` : ccaaSlug;
        const routeProv = (provSlug === "ceuta" || provSlug === "melilla") ? `${provSlug}-${provSlug}` : provSlug;
        // The slug in table is already uniquely created (like ceuta-ceuta)

        return {
            id: muniSlug,
            name: row.municipio,
            subtitle: `${row.provincia}, ${row.comunidad_autonoma}`,
            url: `/subvenciones-solares/${routeCcaa}/${routeProv}/${muniSlug}`
        };
    });

    return NextResponse.json({ results });
}
