import { createClient } from "@supabase/supabase-js";

type MunicipioEnergiaRow = {
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
	const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

	if (!url || !key) {
		throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY/NEXT_PUBLIC_SUPABASE_ANON_KEY");
	}

	const supabase = createClient(url, key, { auth: { persistSession: false } });

	const { data, error } = await supabase
		.from("municipios_energia")
		.select("municipio,provincia,comunidad_autonoma,slug")
		.limit(200000);

	if (error) {
		throw new Error(`Supabase error [${error.code}]: ${error.message}`);
	}

	const rows = (data ?? []) as MunicipioEnergiaRow[];
	if (!rows.length) {
		console.log("No rows found in municipios_energia.");
		return;
	}

	const invalidRows: Array<{ expected: string; current: string; municipio: string }> = [];
	const duplicates = new Map<string, number>();

	for (const row of rows) {
		const expected = slugify(row.municipio);
		if (row.slug !== expected) {
			invalidRows.push({ expected, current: row.slug, municipio: row.municipio });
		}

		duplicates.set(row.slug, (duplicates.get(row.slug) ?? 0) + 1);
	}

	const duplicateSlugs = Array.from(duplicates.entries())
		.filter(([, count]) => count > 1)
		.map(([slug, count]) => ({ slug, count }));

	console.log(`Rows analyzed: ${rows.length}`);
	console.log(`Invalid slugs: ${invalidRows.length}`);
	console.log(`Duplicate slugs: ${duplicateSlugs.length}`);

	if (invalidRows.length) {
		console.log("Sample invalid slugs:");
		for (const row of invalidRows.slice(0, 20)) {
			console.log(`- ${row.municipio}: current='${row.current}' expected='${row.expected}'`);
		}
	}

	if (duplicateSlugs.length) {
		console.log("Sample duplicate slugs:");
		for (const item of duplicateSlugs.slice(0, 20)) {
			console.log(`- ${item.slug}: ${item.count} rows`);
		}
		process.exitCode = 1;
	}
}

main().catch((error) => {
	console.error("validate-slugs failed", error);
	process.exit(1);
});