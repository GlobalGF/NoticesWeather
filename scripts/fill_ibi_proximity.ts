import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function run() {
    console.log("Fetching all municipalities via pagination...");
    const allRows: any[] = [];
    let fetchIndex = 0;
    while (true) {
        const { data, error } = await supabase
            .from("municipios_energia")
            .select("id, municipio, provincia, comunidad_autonoma, bonificacion_ibi")
            .range(fetchIndex, fetchIndex + 999);

        if (error) throw error;
        if (!data || data.length === 0) break;

        allRows.push(...data);
        fetchIndex += 1000;
        console.log(`Fetched ${allRows.length} rows so far...`);
        if (data.length < 1000) break;
    }

    const validRows = allRows.filter((r) => r.bonificacion_ibi > 0);
    const missingRows = allRows.filter((r) => !r.bonificacion_ibi || r.bonificacion_ibi === 0);

    console.log(`Total rows: ${allRows!.length}`);
    console.log(`Valid IBI rows: ${validRows.length}`);
    console.log(`Missing IBI rows: ${missingRows.length}`);

    // Calculate averages
    const provSum: Record<string, { sum: number; count: number }> = {};
    const ccaaSum: Record<string, { sum: number; count: number }> = {};
    let natSum = 0;
    let natCount = 0;

    for (const r of validRows) {
        const v = r.bonificacion_ibi;

        if (!provSum[r.provincia]) provSum[r.provincia] = { sum: 0, count: 0 };
        provSum[r.provincia].sum += v;
        provSum[r.provincia].count += 1;

        if (!ccaaSum[r.comunidad_autonoma]) ccaaSum[r.comunidad_autonoma] = { sum: 0, count: 0 };
        ccaaSum[r.comunidad_autonoma].sum += v;
        ccaaSum[r.comunidad_autonoma].count += 1;

        natSum += v;
        natCount += 1;
    }

    const provAvg: Record<string, number> = {};
    for (const [k, v] of Object.entries(provSum)) provAvg[k] = Math.round(v.sum / v.count);

    const ccaaAvg: Record<string, number> = {};
    for (const [k, v] of Object.entries(ccaaSum)) ccaaAvg[k] = Math.round(v.sum / v.count);

    const natAvg = natCount > 0 ? Math.round(natSum / natCount) : 50;

    console.log("National average:", natAvg);
    console.log("Province averages available:", Object.keys(provAvg).length);

    // Prepare updates
    const toUpdate = missingRows.map((r) => {
        let newVal = provAvg[r.provincia];
        if (newVal === undefined) newVal = ccaaAvg[r.comunidad_autonoma];
        if (newVal === undefined) newVal = natAvg;

        return { id: r.id, bonificacion_ibi: newVal };
    });

    console.log(`Prepared ${toUpdate.length} updates. Executing in batches of 50...`);

    const batchSize = 50;
    for (let i = 0; i < toUpdate.length; i += batchSize) {
        const batch = toUpdate.slice(i, i + batchSize);
        const promises = batch.map(async (t) => {
            const { error } = await supabase
                .from("municipios_energia")
                .update({ bonificacion_ibi: t.bonificacion_ibi })
                .eq("id", t.id);
            if (error) console.error(`Failed ID ${t.id}:`, error.message);
        });

        await Promise.all(promises);
        if (i % 1000 === 0) console.log(`Completed ${i} / ${toUpdate.length}`);
    }

    console.log("Done!");
}

run().catch(console.error);
