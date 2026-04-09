
import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || process.env.AI_API_KEY;

/**
 * Script de Generación de Contenido SEO con OpenAI
 * 
 * Este script reemplaza el flujo de n8n "pSEO Solar Content Generator".
 * Lee la cola de municipios pendientes de Supabase, genera texto con IA y guarda el snapshot.
 */

async function main() {
    if (!SUPABASE_URL || !SUPABASE_KEY) {
        console.error("❌ Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY");
        process.exit(1);
    }

    if (!OPENAI_API_KEY) {
        console.error("❌ Falta OPENAI_API_KEY o AI_API_KEY en el entorno.");
        process.exit(1);
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    console.log("🚀 Iniciando generación SEO...");

    // 1. Obtener cola de municipios
    const { data: queue, error: queueError } = await supabase.rpc('get_seo_generation_queue', { p_limit: 10 });

    if (queueError) {
        console.error("❌ Error al obtener la cola:", queueError.message);
        process.exit(1);
    }

    if (!queue || queue.length === 0) {
        console.log("✅ No hay municipios pendientes en la cola.");
        return;
    }

    console.log(`📦 Procesando ${queue.length} municipios...`);

    for (const item of queue) {
        console.log(`\n🔹 [${item.municipio}] Generando contenido para ${item.slug}...`);

        try {
            // 2. Preparar el prompt
            const systemPrompt = `Eres un redactor local experto en energia fotovoltaica en Espana. Respondes UNICAMENTE con un objeto JSON valido, sin markdown, sin bloques de codigo, sin comentarios. El JSON debe contener exactamente estas claves: intro_unica, analisis_fiscal_personalizado, h2_variante (array de 3 strings), conclusion_local, narrativa_angulo, calidad_score (numero 0-10), palabras_total (entero).`;

            const userPrompt = `Genera contenido SEO unico para el municipio ${item.municipio} (${item.provincia}, ${item.comunidad_autonoma}).

DATOS REALES:
- Tipo de zona: ${item.tipo_zona}
- Radiacion solar: ${item.irradiacion_solar ?? 'N/D'} kWh/m2 al ano
- Horas de sol: ${item.horas_sol ?? 'N/D'} horas/ano
- Precio medio luz: ${item.precio_medio_luz ?? 'N/D'} EUR/kWh
- Ahorro estimado: ${item.ahorro_estimado ?? 'N/D'} EUR/ano
- Bonificacion IBI: ${item.bonificacion_ibi ?? 0}%
- Subvencion autonomica: ${item.subvencion_autoconsumo ?? 0}%
- Precio instalacion: ${item.precio_instalacion_min_eur ?? 'N/D'}-${item.precio_instalacion_max_eur ?? 'N/D'} EUR (media ${item.precio_instalacion_medio_eur ?? 'N/D'} EUR)
- EUR por Watio pico: ${item.eur_por_watio ?? 'N/D'}
- Habitantes: ${item.habitantes ?? 0}

REGLAS:
1. intro_unica: parrafo de 80-120 palabras con caracteristicas geograficas reales de la zona (${item.tipo_zona}) y como benefician a la energia solar. Menciona el municipio por nombre.
2. analisis_fiscal_personalizado: parrafo de 60-90 palabras explicando IBI (${item.bonificacion_ibi}%), subvencion (${item.subvencion_autoconsumo}%) y precio de instalacion con retorno de inversion estimado.
3. h2_variante: array con EXACTAMENTE 3 titulos H2 diferentes. Incluir el nombre del municipio en cada uno. Variar entre: ahorro, instalacion, autoconsumo, placas solares, energia solar.
4. conclusion_local: parrafo de 40-60 palabras con CTA adaptado. Si habitantes < 5000, enfoque autonomia rural. Si habitantes > 100000, enfoque reduccion costes urbanos.
5. narrativa_angulo: uno de: ahorro, sostenibilidad, independencia_energetica, revalorizacion. Usa: ${item.angulo_sugerido}.
6. NO uses frases como 'En la actualidad', 'Hoy en dia', 'Como es bien sabido'. Varia sinonimos: placas solares/modulos fotovoltaicos/paneles/sistemas solares. ahorro/reduccion de factura/rentabilidad. instalacion/montaje/puesta en marcha.
7. calidad_score: valora del 0 al 10 la unicidad y utilidad local real del contenido.
8. palabras_total: suma de palabras de intro + analisis + conclusion.

Devuelve SOLO el JSON, nada mas.`;

            // 3. Llamar a OpenAI (usando fetch para evitar dependencia externa)
            const aiResp = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${OPENAI_API_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: "gpt-4o-mini",
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: userPrompt }
                    ],
                    temperature: 0.75,
                    max_tokens: 1000,
                    response_format: { type: "json_object" }
                })
            });

            if (!aiResp.ok) {
                throw new Error(`OpenAI API error: ${aiResp.status} ${aiResp.statusText}`);
            }

            const aiJson: any = await aiResp.json();
            const content = aiJson.choices?.[0]?.message?.content;

            if (!content) {
                throw new Error("No content in AI response");
            }

            // 4. Parsear y Validar
            const parsed = JSON.parse(content);
            const totalWords = (parsed.intro_unica || "").split(" ").length + 
                               (parsed.analisis_fiscal_personalizado || "").split(" ").length + 
                               (parsed.conclusion_local || "").split(" ").length;

            if (totalWords < 200) {
                console.warn(`⚠️  Contenido demasiado corto (${totalWords} palabras) para ${item.slug}.`);
                // Continuamos pero guardamos aviso? n8n fallaba aquí.
            }

            // 5. Upsert a Supabase
            const { error: upsertError } = await supabase
                .from('seo_municipio_snapshot')
                .upsert({
                    slug: item.slug,
                    municipio: item.municipio,
                    provincia: item.provincia,
                    comunidad_autonoma: item.comunidad_autonoma,
                    intro_unica: parsed.intro_unica,
                    analisis_fiscal_personalizado: parsed.analisis_fiscal_personalizado,
                    h2_variante: parsed.h2_variante,
                    conclusion_local: parsed.conclusion_local,
                    narrativa_angulo: parsed.narrativa_angulo,
                    calidad_score: parsed.calidad_score,
                    palabras_total: totalWords,
                    modelo_ia: 'gpt-4o-mini',
                    version_prompt: 1,
                    irradiacion_solar: item.irradiacion_solar,
                    horas_sol: item.horas_sol,
                    ahorro_estimado: item.ahorro_estimado,
                    bonificacion_ibi: item.bonificacion_ibi,
                    subvencion_autoconsumo: item.subvencion_autoconsumo,
                    precio_instalacion_medio_eur: item.precio_instalacion_medio_eur,
                    precio_medio_luz: item.precio_medio_luz,
                    habitantes: item.habitantes,
                    needs_regen: false,
                    last_generated_at: new Date().toISOString()
                }, { onConflict: 'slug' });

            if (upsertError) {
                throw upsertError;
            }

            console.log(`✅ Contenido generado y guardado para ${item.slug} (${totalWords} palabras).`);

        } catch (err: any) {
            console.error(`❌ Error procesando ${item.municipio}:`, err.message);
            // Loguear error en la tabla
            await supabase.from('seo_generation_errors').insert({
                slug: item.slug,
                reason: err.message,
                created_at: new Date().toISOString()
            });
        }

        // Rate limit preventivo (como en n8n)
        await new Promise(r => setTimeout(r, 1200));
    }

    console.log("\n✨ Proceso de generación SEO finalizado.");
}

main();
