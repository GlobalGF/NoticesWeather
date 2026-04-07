/**
 * Diagnóstico: ¿por qué municipios_energia no se pobló?
 */
import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function diagnose() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("❌ Missing env vars");
    return;
  }

  console.log("🔍 Supabase URL:", SUPABASE_URL);
  console.log("🔑 Key prefix:", SUPABASE_KEY.substring(0, 20) + "...");

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  // 1. Check municipios_dataset_es count
  console.log("\n━━━ 1. municipios_dataset_es ━━━");
  const { count: dsCount, error: dsErr } = await supabase
    .from("municipios_dataset_es")
    .select("id", { count: "exact", head: true });
  console.log("   Count:", dsCount, "| Error:", dsErr?.message || "none");

  // 2. Check a few rows from municipios_dataset_es
  const { data: dsSample, error: dsSampleErr } = await supabase
    .from("municipios_dataset_es")
    .select("municipio, provincia, slug, latitud, longitud")
    .limit(3);
  console.log("   Sample:", JSON.stringify(dsSample, null, 2));
  if (dsSampleErr) console.log("   Sample error:", dsSampleErr.message);

  // 3. Check municipios_energia count
  console.log("\n━━━ 2. municipios_energia ━━━");
  const { count: meCount, error: meErr } = await supabase
    .from("municipios_energia")
    .select("id", { count: "exact", head: true });
  console.log("   Count:", meCount, "| Error:", meErr?.message || "none");

  // 4. Show existing rows
  const { data: meAll, error: meAllErr } = await supabase
    .from("municipios_energia")
    .select("slug, municipio, horas_sol")
    .limit(5);
  console.log("   Existing rows:", JSON.stringify(meAll, null, 2));

  // 5. Try a test insert
  console.log("\n━━━ 3. Test insert ━━━");
  const testRow = {
    municipio: "TEST_DIAGNOSTICO",
    provincia: "Madrid",
    comunidad_autonoma: "Comunidad de Madrid",
    habitantes: 1,
    horas_sol: 2800,
    ahorro_estimado: 600,
    bonificacion_ibi: 0,
    bonificacion_icio: 0,
    subvencion_autoconsumo: 0,
    irradiacion_solar: 1750,
    precio_medio_luz: 0.22,
    slug: "test-diagnostico-delete-me",
  };

  const { data: insertData, error: insertErr, status, statusText } = await supabase
    .from("municipios_energia")
    .insert(testRow)
    .select();

  console.log("   Status:", status, statusText);
  console.log("   Data:", JSON.stringify(insertData));
  console.log("   Error:", insertErr ? JSON.stringify(insertErr) : "none");

  // 6. If insert worked, check count again and delete test
  if (!insertErr) {
    const { count: newCount } = await supabase
      .from("municipios_energia")
      .select("id", { count: "exact", head: true });
    console.log("   New count after insert:", newCount);

    // Clean up test row
    await supabase.from("municipios_energia").delete().eq("slug", "test-diagnostico-delete-me");
    console.log("   Test row cleaned up.");
  }

  // 7. Try upsert (same method used by the main script)
  console.log("\n━━━ 4. Test upsert (same as main script) ━━━");
  const upsertRows = [
    {
      municipio: "UPSERT_TEST_1",
      provincia: "Madrid",
      comunidad_autonoma: "Comunidad de Madrid",
      habitantes: 1,
      horas_sol: 2800,
      slug: "upsert-test-1-delete",
    },
    {
      municipio: "UPSERT_TEST_2",
      provincia: "Barcelona",
      comunidad_autonoma: "Cataluna",
      habitantes: 1,
      horas_sol: 2700,
      slug: "upsert-test-2-delete",
    },
  ];

  const { data: upsertData, error: upsertErr, status: uStatus } = await supabase
    .from("municipios_energia")
    .upsert(upsertRows, { onConflict: "slug" })
    .select();

  console.log("   Status:", uStatus);
  console.log("   Data:", JSON.stringify(upsertData));
  console.log("   Error:", upsertErr ? JSON.stringify(upsertErr) : "none");

  // Check count
  const { count: afterUpsert } = await supabase
    .from("municipios_energia")
    .select("id", { count: "exact", head: true });
  console.log("   Count after upsert:", afterUpsert);

  // Clean up
  await supabase.from("municipios_energia").delete().eq("slug", "upsert-test-1-delete");
  await supabase.from("municipios_energia").delete().eq("slug", "upsert-test-2-delete");

  // 8. Check table columns (introspect)
  console.log("\n━━━ 5. radiacion_solar_provincial_es ━━━");
  const { data: radSample } = await supabase
    .from("radiacion_solar_provincial_es")
    .select("*")
    .in("provincia", ["Madrid", "Barcelona", "Sevilla"])
    .limit(3);
  console.log("   Sample:", JSON.stringify(radSample, null, 2));
}

diagnose().catch(console.error);
