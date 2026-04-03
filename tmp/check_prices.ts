import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function check() {
  const { data, error } = await supabase
    .from("precios_electricidad_es")
    .select("fecha, precio_kwh_media")
    .order("fecha", { ascending: false })
    .limit(10);

  if (error) console.error(error);
  else console.table(data);
}

check();
