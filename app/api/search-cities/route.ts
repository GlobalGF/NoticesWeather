import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { slugify, cleanMunicipalitySlug, normalizeCcaaSlug } from "@/lib/utils/slug";

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
        const ccaaSlug = normalizeCcaaSlug(row.comunidad_autonoma);
        const provSlug = slugify(row.provincia);
        const muniSlug = cleanMunicipalitySlug(row.slug, provSlug);

        return {
            id: row.slug,
            name: row.municipio,
            subtitle: `${row.provincia}, ${row.comunidad_autonoma}`,
            url: `/subvenciones-solares/${ccaaSlug}/${provSlug}/${muniSlug}`
        };
    });

    return NextResponse.json({ results });
}
