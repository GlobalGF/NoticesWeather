import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { slugify } from "@/lib/utils/slug";

export const maxDuration = 300; // 5 minutes max duration for this endpoint

export async function POST(req: NextRequest) {
  // Protect the route using CRON_SECRET from env
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const supabase = createSupabaseAdminClient();

    // The routes we want to drip-feed initially
    const targetRoutes = ["placas-solares", "subvenciones-solares", "bonificacion-ibi"];

    console.log("Fetching all municipalities from Supabase...");
    
    // Fetch all municipalities
    const { data: municipalities, error: fetchError } = await supabase
      .from("municipios_energia")
      .select("slug, municipio, provincia, comunidad_autonoma, habitantes, irradiacion_solar");

    if (fetchError) {
      throw fetchError;
    }

    if (!municipalities || municipalities.length === 0) {
      return NextResponse.json({ message: "No municipalities found" }, { status: 400 });
    }

    console.log(`Found ${municipalities.length} municipalities. Prepping queue items...`);

    const muniData = municipalities as any[];
    const insertQueue: Record<string, any>[] = [];

    for (const uni of muniData) {
      const comunidadSlug = slugify(uni.comunidad_autonoma || uni.provincia);
      
      // Calculate a priority score based on population + irradiation
      // This ensures large cities with good sun get indexed first
      const populationScore = Math.min((uni.habitantes || 0) / 100, 10000);
      const sunScore = (uni.irradiacion_solar || 0) / 10;
      const priorityScore = Math.floor(populationScore + sunScore);

      for (const ruta of targetRoutes) {
        insertQueue.push({
          slug: uni.slug,
          municipio: uni.municipio,
          provincia: uni.provincia,
          comunidad: comunidadSlug,
          ruta_tipo: ruta,
          priority_score: priorityScore,
          status: "pending",
        });
      }
    }

    console.log(`Prepared ${insertQueue.length} rows to insert.`);

    // Insert in chunks of 500 to avoid hitting Payload limits on Supabase HTTP API
    const CHUNK_SIZE = 500;
    let insertedCount = 0;

    for (let i = 0; i < insertQueue.length; i += CHUNK_SIZE) {
      const chunk = insertQueue.slice(i, i + CHUNK_SIZE);
      
      // Insert into the queue
      const { error: insertError } = await supabase
        .from("publish_queue")
        .insert(chunk as any)
        .select('id');

      if (insertError) {
        console.error(`Chunk error at index ${i}:`, insertError);
        // Continue trying with other chunks even if one fails
      } else {
        insertedCount += chunk.length;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully processed ${insertedCount} routes out of ${insertQueue.length}. They are now pending inside publish_queue.`
    });

  } catch (error: any) {
    console.error("Error populating queue:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
