import { createClient } from "@supabase/supabase-js";
import { getLaunchPhase } from "../lib/pseo/launch-phases";

type Row = {
	slug: string;
	municipio: string;
	provincia: string;
	comunidad_autonoma: string;
	habitantes: number;
	horas_sol: number | null;
	irradiacion_solar: number | null;
	precio_medio_luz: number | null;
	bonificacion_ibi: number | null;
	subvencion_autoconsumo: number | null;
};

type IndexedUrlRow = {
	url: string;
	route_type: string;
	params_json: Record<string, string>;
	priority: number;
	updated_at: string;
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
	const launchPhase = getLaunchPhase();
	const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
	const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

	if (!url || !serviceKey) {
		throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
	}

	const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

	const { data, error } = await supabase
		.from("municipios_energia")
		.select(
			"slug,municipio,provincia,comunidad_autonoma,habitantes,horas_sol,irradiacion_solar,precio_medio_luz,bonificacion_ibi,subvencion_autoconsumo"
		)
		.order("habitantes", { ascending: false })
		.limit(200000);

	if (error) {
		throw new Error(`Supabase error [${error.code}]: ${error.message}`);
	}

	const rows = (data ?? []) as Row[];
	if (!rows.length) {
		console.log("No municipios found. Skipping index generation.");
		return;
	}

	const targetMunicipios = Math.max(1, Math.floor(launchPhase.targetUrls / 4));
	const selected = rows.slice(0, targetMunicipios);

	const now = new Date().toISOString();
	const payload: IndexedUrlRow[] = selected.flatMap((row) => {
		const qualityScore = computeQualityScore(row);
		if (qualityScore < launchPhase.minQualityScore) {
			return [];
		}

		const baseParams = {
			qualityScore: String(qualityScore),
			launchPhase: launchPhase.key
		};

		const comunidad = slugify(row.comunidad_autonoma);
		const provincia = slugify(row.provincia);

		return [
			{
				url: `/placas-solares/${row.slug}`,
				route_type: "placas",
				params_json: { ...baseParams, municipio: row.slug },
				priority: Math.min(100, Math.max(1, Math.round(row.habitantes / 10000))),
				updated_at: now
			},
			{
				url: `/placas-solares/geo/${comunidad}/${provincia}/${row.slug}`,
				route_type: "placas_geo",
				params_json: {
					...baseParams,
					comunidad,
					provincia,
					municipio: row.slug
				},
				priority: Math.min(90, Math.max(1, Math.round(row.habitantes / 12000))),
				updated_at: now
			},
			{
				url: `/bonificacion-ibi/${row.slug}`,
				route_type: "ibi",
				params_json: { ...baseParams, municipio: row.slug },
				priority: Math.min(80, Math.max(1, Math.round(row.habitantes / 15000))),
				updated_at: now
			},
			{
				url: `/autoconsumo-compartido/${row.slug}`,
				route_type: "autoconsumo",
				params_json: { ...baseParams, municipio: row.slug },
				priority: Math.min(80, Math.max(1, Math.round(row.habitantes / 15000))),
				updated_at: now
			}
		];
	});

	const chunkSize = 1000;
	for (let i = 0; i < payload.length; i += chunkSize) {
		const chunk = payload.slice(i, i + chunkSize);
		const { error: upsertError } = await supabase
			.from("pseo_url_index")
			.upsert(chunk, { onConflict: "url", ignoreDuplicates: false });

		if (upsertError) {
			throw new Error(`Upsert failed [${upsertError.code}]: ${upsertError.message}`);
		}
	}

	console.log(`Phase: ${launchPhase.label}`);
	console.log(`Municipios considered: ${selected.length}`);
	console.log(`Indexed ${payload.length} URLs from ${rows.length} municipios.`);
}

function computeQualityScore(row: Row): number {
	let score = 30;

	if (row.slug && row.slug.length >= 3) score += 10;
	if (row.habitantes && row.habitantes >= 5000) score += 10;
	if (row.horas_sol && row.horas_sol > 0) score += 12;
	if (row.irradiacion_solar && row.irradiacion_solar > 0) score += 12;
	if (row.precio_medio_luz && row.precio_medio_luz > 0) score += 10;
	if (row.bonificacion_ibi !== null) score += 8;
	if (row.subvencion_autoconsumo !== null) score += 8;

	return Math.min(100, score);
}

main().catch((error) => {
	console.error("generate:pseo-index failed", error);
	process.exit(1);
});