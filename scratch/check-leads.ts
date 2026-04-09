import { createSupabaseAdminClient } from "./lib/supabase/admin";

async function checkLeads() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) {
    console.error("Error fetching leads:", error);
    return;
  }

  console.log("Last 5 leads:");
  console.table(data);
}

checkLeads();
