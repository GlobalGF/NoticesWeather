import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local", { supabaseUrl, hasKey: !!supabaseKey });
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase
    .from("municipios_energia")
    .select("municipio, provincia, comunidad_autonoma, slug")
    .ilike("provincia", "%almeria%")
    .limit(5);

  if (error) {
    console.error("Error:", error);
  } else {
    console.log("Almeria matches:", data);
  }

  const { data: provData, error: err2 } = await supabase
    .from("municipios_energia")
    .select("municipio, provincia, comunidad_autonoma, slug")
    .eq("provincia", "Almería")
    .limit(5);
   
   console.log("Almería EXACT match:", provData);
}

check();
