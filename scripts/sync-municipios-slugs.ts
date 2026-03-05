import { createClient } from "@supabase/supabase-js";

type Row = {
  municipio: string;
  provincia: string;
  comunidad_autonoma: string;
  slug: string;
};

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

  const { data, error } = await supabase
    .from("municipios_energia")
    .select("municipio,provincia,comunidad_autonoma,slug")
    .limit(200000);
  if (error) throw new Error(`Supabase error [${error.code}]: ${error.message}`);

  const rows = (data ?? []) as Row[];
  const slugCounter = new Map<string, number>();
  const updates: Array<{ row: Row; slug: string }> = [];

  for (const row of rows) {
    const baseSlug = slugify(row.municipio);
    const count = (slugCounter.get(baseSlug) ?? 0) + 1;
    slugCounter.set(baseSlug, count);

    const uniqueSlug = count > 1 ? `${baseSlug}-${count}` : baseSlug;
    if (uniqueSlug !== row.slug) {
      updates.push({ row, slug: uniqueSlug });
    }
  }

  if (!updates.length) {
    console.log("No slug updates required.");
    return;
  }

  for (const update of updates) {
    const { error: updateError } = await supabase
      .from("municipios_energia")
      .update({ slug: update.slug })
      .eq("municipio", update.row.municipio)
      .eq("provincia", update.row.provincia)
      .eq("comunidad_autonoma", update.row.comunidad_autonoma)
      .eq("slug", update.row.slug);

    if (updateError) {
      throw new Error(
        `Slug update failed [${updateError.code}] for ${update.row.municipio}: ${updateError.message}`
      );
    }
  }

  console.log(`Updated ${updates.length} slugs in municipios_energia.`);
}

main().catch((error) => {
  console.error("sync-municipios-slugs failed", error);
  process.exit(1);
});
