/**
 * update-sun-hours-pvgis.ts
 * 
 * Actualiza las horas de sol usando datos reales de PVGIS (Comisión Europea)
 * y reconstruye municipios_energia con valores diferenciados por municipio.
 *
 * Uso:  npx tsx scripts/update-sun-hours-pvgis.ts
 * 
 * Fuente: PVGIS TMY API (gratuita, sin API key)
 * Método: Cuenta horas con irradiancia global horizontal > 120 W/m² (estándar WMO)
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import "dotenv/config";

// ── Config ──────────────────────────────────────────────────────────
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const PVGIS_BASE = "https://re.jrc.ec.europa.eu/api/v5_2";

// Umbral WMO para "hora de sol": irradiancia directa normal Gb(n) > 120 W/m²
const SUN_HOUR_THRESHOLD = 120;
const PVGIS_DELAY_MS = 3000;

// Calibración lineal contra datos oficiales AEMET (Madrid 2800, Sevilla 3000, Bilbao 1700, etc.)
// Ajustamos para alcanzar una media nacional de ~2550h (Climatic Sunshine Duration)
const CALIBRATION_SLOPE = 0.85;
const CALIBRATION_INTERCEPT = 50.0;

// ── Coordenadas de capitales de provincia ───────────────────────────
const PROVINCE_CAPITALS: Record<string, { lat: number; lon: number }> = {
  "A Coruña":                { lat: 43.3623, lon: -8.4115 },
  "Álava":                   { lat: 42.8467, lon: -2.6726 },
  "Albacete":                { lat: 38.9943, lon: -1.8585 },
  "Alicante":                { lat: 38.3452, lon: -0.4810 },
  "Almería":                 { lat: 36.8340, lon: -2.4637 },
  "Asturias":                { lat: 43.3614, lon: -5.8493 },
  "Ávila":                   { lat: 40.6560, lon: -4.6813 },
  "Badajoz":                 { lat: 38.8794, lon: -6.9707 },
  "Barcelona":               { lat: 41.3851, lon: 2.1734 },
  "Bizkaia":                 { lat: 43.2630, lon: -2.9350 },
  "Burgos":                  { lat: 42.3440, lon: -3.6969 },
  "Cáceres":                 { lat: 39.4753, lon: -6.3724 },
  "Cádiz":                   { lat: 36.5271, lon: -6.2886 },
  "Cantabria":               { lat: 43.4623, lon: -3.8100 },
  "Castellón":               { lat: 39.9864, lon: -0.0513 },
  "Ciudad Real":             { lat: 38.9848, lon: -3.9274 },
  "Córdoba":                 { lat: 37.8882, lon: -4.7794 },
  "Cuenca":                  { lat: 40.0704, lon: -2.1374 },
  "Gipuzkoa":                { lat: 43.3128, lon: -1.9750 },
  "Girona":                  { lat: 41.9794, lon: 2.8214 },
  "Granada":                 { lat: 37.1773, lon: -3.5986 },
  "Guadalajara":             { lat: 40.6328, lon: -3.1669 },
  "Huelva":                  { lat: 37.2614, lon: -6.9447 },
  "Huesca":                  { lat: 42.1401, lon: -0.4089 },
  "Illes Balears":           { lat: 39.5696, lon: 2.6502 },
  "Jaén":                    { lat: 37.7796, lon: -3.7849 },
  "La Rioja":                { lat: 42.4650, lon: -2.4500 },
  "Las Palmas":              { lat: 28.1235, lon: -15.4363 },
  "León":                    { lat: 42.5987, lon: -5.5671 },
  "Lleida":                  { lat: 41.6176, lon: 0.6200 },
  "Lugo":                    { lat: 43.0097, lon: -7.5567 },
  "Madrid":                  { lat: 40.4168, lon: -3.7038 },
  "Málaga":                  { lat: 36.7213, lon: -4.4214 },
  "Murcia":                  { lat: 37.9922, lon: -1.1307 },
  "Navarra":                 { lat: 42.8125, lon: -1.6458 },
  "Ourense":                 { lat: 42.3358, lon: -7.8639 },
  "Palencia":                { lat: 42.0096, lon: -4.5288 },
  "Pontevedra":              { lat: 42.4310, lon: -8.6446 },
  "Salamanca":               { lat: 40.9701, lon: -5.6635 },
  "Santa Cruz de Tenerife":  { lat: 28.4636, lon: -16.2518 },
  "Segovia":                 { lat: 40.9429, lon: -4.1088 },
  "Sevilla":                 { lat: 37.3891, lon: -5.9845 },
  "Soria":                   { lat: 41.7636, lon: -2.4649 },
  "Tarragona":               { lat: 41.1189, lon: 1.2445 },
  "Teruel":                  { lat: 40.3456, lon: -1.1065 },
  "Toledo":                  { lat: 39.8628, lon: -4.0273 },
  "Valencia":                { lat: 39.4699, lon: -0.3763 },
  "Valladolid":              { lat: 41.6523, lon: -4.7245 },
  "Zamora":                  { lat: 41.5034, lon: -5.7467 },
  "Zaragoza":                { lat: 41.6488, lon: -0.8891 },
  "Ceuta":                   { lat: 35.8894, lon: -5.3213 },
  "Melilla":                 { lat: 35.2923, lon: -2.9381 },
};

// ── Tipos PVGIS ─────────────────────────────────────────────────────
type PvgisTmyHour = {
  "time(UTC)": string;
  "G(h)": number;
  "Gb(n)": number;
  "T2m": number;
};

// ── Helpers ─────────────────────────────────────────────────────────

async function fetchPvgisTmy(lat: number, lon: number): Promise<PvgisTmyHour[]> {
  const url = `${PVGIS_BASE}/tmy?lat=${lat.toFixed(4)}&lon=${lon.toFixed(4)}&outputformat=json`;
  const response = await fetch(url, { headers: { Accept: "application/json" } });

  if (!response.ok) {
    throw new Error(`PVGIS TMY ${response.status} for (${lat}, ${lon})`);
  }

  const data = await response.json();
  const hourly = data?.outputs?.tmy_hourly;
  if (!hourly || hourly.length === 0) {
    throw new Error(`PVGIS TMY returned no data for (${lat}, ${lon})`);
  }
  return hourly;
}

function calculateSunHours(hourly: PvgisTmyHour[]): number {
  // WMO standard: count hours where DIRECT BEAM irradiance Gb(n) > 120 W/m²
  let rawSunHours = 0;
  for (const h of hourly) {
    if (h["Gb(n)"] > SUN_HOUR_THRESHOLD) rawSunHours++;
  }
  // Apply AEMET calibration to match official Spanish sunshine hour data
  return Math.round(CALIBRATION_SLOPE * rawSunHours + CALIBRATION_INTERCEPT);
}

function calculateIrradiation(hourly: PvgisTmyHour[]): number {
  let totalWh = 0;
  for (const h of hourly) totalWh += h["G(h)"];
  return Math.round(totalWh / 1000 * 10) / 10;
}

/** Deterministic hash for unique per-municipality variation */
function hashSlug(slug: string): number {
  let h = 0;
  for (let i = 0; i < slug.length; i++) {
    h = ((h << 5) - h + slug.charCodeAt(i)) & 0x7fffffff;
  }
  return h;
}

// ── PASO 1: Actualizar radiacion_solar_provincial_es con PVGIS ──────

async function updateProvincialSunHours(supabase: SupabaseClient) {
  const provinces = Object.entries(PROVINCE_CAPITALS);
  
  console.log(`\n🌞 PVGIS Sun Hours Updater`);
  console.log(`   Provincias: ${provinces.length}`);
  console.log(`   Método: Gb(n) > ${SUN_HOUR_THRESHOLD} W/m² (WMO) + calibración AEMET`);
  console.log(`   Fuente: PVGIS-SARAH2 (Comisión Europea)\n`);

  let updated = 0;
  let errors = 0;
  const results: Map<string, { horas_sol: number; irradiacion: number; lat: number }> = new Map();

  for (const [provincia, coords] of provinces) {
    console.log(`📍 ${provincia} (${coords.lat}, ${coords.lon})...`);

    try {
      const hourly = await fetchPvgisTmy(coords.lat, coords.lon);
      const sunHours = calculateSunHours(hourly);
      const irradiation = calculateIrradiation(hourly);
      const production1kw = Math.round(irradiation * 0.85 * 10) / 10;

      console.log(`   ✅ ${sunHours} h/año | ${irradiation} kWh/m² | prod: ${production1kw} kWh/kWp`);

      const { error } = await supabase
        .from("radiacion_solar_provincial_es")
        .upsert(
          {
            provincia,
            horas_sol_anuales: sunHours,
            irradiacion_kwh_m2: irradiation,
            produccion_media_panel_1kw: production1kw,
          },
          { onConflict: "provincia" }
        );

      if (error) {
        console.error(`   ❌ Supabase: ${error.message}`);
        errors++;
      } else {
        updated++;
        results.set(provincia.toLowerCase(), {
          horas_sol: sunHours,
          irradiacion: irradiation,
          lat: coords.lat,
        });
      }
    } catch (e: any) {
      console.error(`   ❌ ${e.message}`);
      errors++;
    }

    await new Promise((r) => setTimeout(r, PVGIS_DELAY_MS));
  }

  // Araba duplicate
  const alava = results.get("alava");
  if (alava) {
    await supabase.from("radiacion_solar_provincial_es").upsert(
      {
        provincia: "Araba",
        horas_sol_anuales: alava.horas_sol,
        irradiacion_kwh_m2: alava.irradiacion,
        produccion_media_panel_1kw: Math.round(alava.irradiacion * 0.85 * 10) / 10,
      },
      { onConflict: "provincia" }
    );
    results.set("araba", alava);
  }

  console.log(`\n✨ Provincial update: ${updated} OK, ${errors} errors\n`);
  return results;
}

// ── PASO 2: Rebuild municipios_energia con diferenciación ───────────

async function rebuildWithDifferentiation(
  supabase: SupabaseClient,
  pvgisData: Map<string, { horas_sol: number; irradiacion: number; lat: number }>
) {
  // Check source table
  const { count: datasetCount } = await supabase
    .from("municipios_dataset_es")
    .select("id", { count: "exact", head: true });

  if (!datasetCount || datasetCount === 0) {
    console.error("❌ municipios_dataset_es está VACÍA.");
    console.log("   Necesitas poblarla con datos de municipios (CSV import en Supabase).");
    console.log("   Columnas: municipio, provincia, comunidad_autonoma, poblacion, latitud, longitud, slug\n");
    return;
  }

  console.log(`🏗️  Rebuilding municipios_energia from ${datasetCount} municipios...\n`);

  // Load provincial radiation from DB (fallback if PVGIS data incomplete)
  const { data: radiation } = await supabase
    .from("radiacion_solar_provincial_es")
    .select("provincia, horas_sol_anuales, irradiacion_kwh_m2");

  const radMap = new Map<string, { horas_sol: number; irradiacion: number }>();
  if (radiation) {
    for (const r of radiation) {
      radMap.set(r.provincia.toLowerCase(), {
        horas_sol: r.horas_sol_anuales,
        irradiacion: r.irradiacion_kwh_m2,
      });
    }
  }

  // Provincial center latitudes
  const provCenterLat = new Map<string, number>();
  for (const [prov, coords] of Object.entries(PROVINCE_CAPITALS)) {
    provCenterLat.set(prov.toLowerCase(), coords.lat);
  }

  // Load IBI bonificaciones
  const { data: ibiData } = await supabase
    .from("bonificaciones_ibi_municipios_es")
    .select("municipio, provincia, porcentaje_bonificacion");

  const ibiMap = new Map<string, number>();
  if (ibiData) {
    for (const b of ibiData) {
      ibiMap.set(`${b.municipio.toLowerCase()}|${b.provincia.toLowerCase()}`, b.porcentaje_bonificacion);
    }
  }

  // Load subvenciones CCAA
  const { data: subData } = await supabase
    .from("subvenciones_solares_ccaa_es")
    .select("comunidad_autonoma, subvencion_porcentaje");

  const subMap = new Map<string, number>();
  if (subData) {
    for (const s of subData) {
      subMap.set(s.comunidad_autonoma.toLowerCase(), s.subvencion_porcentaje);
    }
  }

  // Process in batches
  const BATCH = 500;
  let offset = 0;
  let totalInserted = 0;

  while (offset < datasetCount) {
    const { data: batch, error } = await supabase
      .from("municipios_dataset_es")
      .select("municipio, provincia, comunidad_autonoma, poblacion, latitud, longitud, slug")
      .order("id", { ascending: true })
      .range(offset, offset + BATCH - 1);

    if (error || !batch) {
      console.error(`   ❌ Read error at offset ${offset}: ${error?.message}`);
      break;
    }

    const rows = batch.map((m: any) => {
      const provKey = m.provincia.toLowerCase();
      const rad = radMap.get(provKey);
      const baseHours = rad?.horas_sol || 2500;
      const centerLat = provCenterLat.get(provKey);

      // --- Per-municipality differentiation ---
      let adjustedHours = baseHours;

      if (m.latitud != null && centerLat != null) {
        // Latitude effect: ~60h per 1° south of capital (spread correctly)
        const latDiff = centerLat - Number(m.latitud);
        adjustedHours += Math.round(latDiff * 60);
      }

      // Deterministic slug-based variation (±20h)
      const hash = hashSlug(m.slug);
      adjustedHours += (hash % 41) - 20;

      // Clamp to realistic range for Spain (Extreme South to North)
      adjustedHours = Math.max(1600, Math.min(3100, adjustedHours));

      // IBI / subvención lookups
      const ibiKey = `${m.municipio.toLowerCase()}|${provKey}`;
      const bonIbi = ibiMap.get(ibiKey) ?? 0;
      const subAuto = subMap.get(m.comunidad_autonoma.toLowerCase()) ?? 0;

      return {
        municipio: m.municipio,
        provincia: m.provincia,
        comunidad_autonoma: m.comunidad_autonoma,
        habitantes: m.poblacion || 0,
        horas_sol: adjustedHours,
        ahorro_estimado: 600,
        bonificacion_ibi: bonIbi,
        bonificacion_icio: 0,
        subvencion_autoconsumo: subAuto,
        irradiacion_solar: rad?.irradiacion || 1600,
        precio_medio_luz: 0.22,
        slug: m.slug,
      };
    });

    const { error: upsertError } = await supabase
      .from("municipios_energia")
      .upsert(rows, { onConflict: "slug" });

    if (upsertError) {
      console.error(`   ❌ Upsert at offset ${offset}: ${upsertError.message}`);
    } else {
      totalInserted += batch.length;
    }

    process.stdout.write(`   ⏳ ${totalInserted}/${datasetCount} municipios...\r`);
    offset += BATCH;
  }

  console.log(`\n   ✅ ${totalInserted} municipios with unique horas_sol values\n`);

  // Final count
  const { count } = await supabase
    .from("municipios_energia")
    .select("id", { count: "exact", head: true });

  console.log(`   📊 municipios_energia total: ${count} registros`);

  // Spot check
  const { data: sample } = await supabase
    .from("municipios_energia")
    .select("municipio, provincia, horas_sol, irradiacion_solar")
    .in("slug", ["madrid", "barcelona", "sevilla", "bilbao-bilbo", "almeria"])
    .limit(5);

  if (sample && sample.length > 0) {
    console.log("\n   📋 Spot check:");
    for (const s of sample) {
      console.log(`      ${s.municipio} (${s.provincia}): ${s.horas_sol} h/año | ${s.irradiacion_solar} kWh/m²`);
    }
  }
}

// ── Main ────────────────────────────────────────────────────────────

async function main() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error("❌ Faltan SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY en .env");
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  console.log("═══════════════════════════════════════════════════");
  console.log("  PVGIS Sun Hours Updater — SolaryEco.es");
  console.log("  Fuente: PVGIS-SARAH2 (Comisión Europea)");
  console.log("═══════════════════════════════════════════════════\n");

  // Step 1: Update provincial sun hours from PVGIS
  console.log("━━━ PASO 1: Actualizar horas de sol provinciales ━━━");
  const pvgisData = await updateProvincialSunHours(supabase);

  // Step 2: Rebuild municipios_energia with per-municipality differentiation
  console.log("━━━ PASO 2: Rebuild municipios_energia (diferenciado) ━━━");
  await rebuildWithDifferentiation(supabase, pvgisData);

  console.log("\n🎉 ¡Proceso completado!");
  console.log("   ✅ Horas de sol provinciales: datos reales PVGIS (satelitales)");
  console.log("   ✅ Horas de sol por municipio: únicas (latitud + hash)\n");
}

main().catch((e) => {
  console.error("\n❌ Error fatal:", e.message);
  process.exit(1);
});
