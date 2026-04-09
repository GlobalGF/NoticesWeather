
import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const IBI_SOURCE_URL = process.env.IBI_ICIO_JSON_URL || "https://raw.githubusercontent.com/GlobalGF/NoticesWeather/refs/heads/main/docs/bonificaciones.json";

/**
 * Script de Sincronización de Bonificaciones IBI/ICIO
 * 
 * Este script reemplaza la rama de bonificaciones de n8nweb.json.
 * Descarga el JSON de bonificaciones y hace upsert en Supabase.
 */

async function main() {
    if (!SUPABASE_URL || !SUPABASE_KEY) {
        console.error("❌ Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY");
        process.exit(1);
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    console.log(`🚀 Descargando bonificaciones desde: ${IBI_SOURCE_URL}`);

    try {
        const resp = await fetch(IBI_SOURCE_URL);
        if (!resp.ok) {
            throw new Error(`HTTP error ${resp.status}: ${resp.statusText}`);
        }

        const data: any = await resp.json();
        const items = data.bonificaciones || [];

        if (!items.length) {
            console.log("⚠️ No se encontraron bonificaciones en el JSON.");
            return;
        }

        console.log(`📦 Sincronizando ${items.length} registros...`);

        // Procesar en bloques para evitar saturar la conexión
        const BATCH_SIZE = 100;
        let count = 0;

        for (let i = 0; i < items.length; i += BATCH_SIZE) {
            const batch = items.slice(i, i + BATCH_SIZE).map((item: any) => ({
                municipio: item.municipio,
                provincia: item.provincia,
                porcentaje_bonificacion: item.porcentaje_bonificacion,
                duracion_anos: item.anios_bonificacion,
                condiciones: item.condiciones || null
            }));

            // Upsert por municipio+provincia (asumiendo que hay una clave única o constraint)
            // Nota: En la tabla actual, a veces es solo una tabla informativa o se usa para municipios_energia.
            // Si hay una tabla bonificaciones_ibi_municipios_es, hacemos upsert allí.
            const { error: upsertError } = await supabase
                .from('bonificaciones_ibi_municipios_es')
                .upsert(batch, { onConflict: 'municipio,provincia' });

            if (upsertError) {
                console.error(`❌ Error en bloque ${i}:`, upsertError.message);
            } else {
                count += batch.length;
            }
        }

        console.log(`✅ Sincronización completada: ${count} registros actualizados.`);

    } catch (err: any) {
        console.error("❌ Error durante la sincronización:", err.message);
    }
}

main();
