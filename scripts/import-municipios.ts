import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") }); // Also check .env

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY/ANON_KEY in env files");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function run() {
  const csvPath = path.join(process.cwd(), "docs", "municipios.csv");
  const content = fs.readFileSync(csvPath, "utf-8");
  
  // Handle the + correctly if it's there, or just clean quotes
  const lines = content.split("\n").filter(l => l.trim().length > 0);
  const header = lines[0];
  const rows = lines.slice(1);

  console.log(`Found ${rows.length} rows to import.`);

  const batchSize = 100;
  let successCount = 0;
  let errorCount = 0;

  const slugCounter = new Map<string, number>();

  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    
    const records = batch.map(line => {
      // Simple CSV parser for this specific format
      // Format: "Comunidad","Provincia","Municipio",Población,Latitud,Longitud
      // Note: The + in view might be a artifact. We take the line and remove leading + if present.
      let cleanLine = line.trim();
      if (cleanLine.startsWith("+")) cleanLine = cleanLine.substring(1);

      const parts = cleanLine.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
      if (parts.length < 6) return null;

      const comunidad = parts[0].replace(/"/g, "");
      const provincia = parts[1].replace(/"/g, "");
      const municipio = parts[2].replace(/"/g, "");
      const poblacion = parseInt(parts[3]) || 0;
      const latitud = parseFloat(parts[4]) || 0;
      const longitud = parseFloat(parts[5]) || 0;

      const baseSlug = slugify(municipio);
      const count = (slugCounter.get(baseSlug) ?? 0) + 1;
      slugCounter.set(baseSlug, count);
      const slug = count > 1 ? `${baseSlug}-${count}` : baseSlug;

      return {
        comunidad_autonoma: comunidad,
        provincia,
        municipio,
        poblacion,
        latitud,
        longitud,
        slug
      };
    }).filter(Boolean);

    const { error } = await supabase
      .from("municipios_dataset_es")
      .upsert(records, { onConflict: "slug" });

    if (error) {
      console.error(`Error in batch ${i}:`, error.message);
      errorCount += batch.length;
    } else {
      successCount += batch.length;
    }
    
    process.stdout.write(`Progress: ${successCount}/${rows.length}...\r`);
  }

  console.log(`\nImport finished: ${successCount} successful, ${errorCount} errors.`);
}

run();
