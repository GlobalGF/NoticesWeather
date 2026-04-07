import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function main() {
  const { data, error } = await supabase.from("municipios_energia").select("municipio, provincia, horas_sol").limit(10);
  if (error) console.error(error);
  else console.table(data);
} 
main();
