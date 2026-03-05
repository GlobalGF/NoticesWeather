import { createClient } from "@supabase/supabase-js";
import { buildUniqueSeoSlug } from "../lib/seo/slug-generator";

type MunicipioRow = {
  municipio: string;
  provincia: string;
  slug: string;
};

type TariffRow = {
  slug: string;
  name: string;
};

type ConsumptionRow = {
  slug: string;
  min_kwh: number;
  max_kwh: number;
};

type SlugIndexRow = {
  slug: string;
  municipio: string;
  provincia: string;
  tarifa_electrica: string;
  consumo: string;
  tecnologia_solar: string;
  seo_title: string;
  seo_description: string;
};

const TECHNOLOGIES = [
  "placas-solares",
  "autoconsumo-compartido",
  "fotovoltaica-hibrida"
];

function toConsumptionLabel(row: ConsumptionRow): string {
  return `${Math.round(row.min_kwh)}-${Math.round(row.max_kwh)}kwh`;
}

function buildSeoTitle(record: SlugIndexRow): string {
  return `${record.tecnologia_solar} en ${record.municipio} (${record.provincia}) con tarifa ${record.tarifa_electrica} y consumo ${record.consumo}`;
}

function buildSeoDescription(record: SlugIndexRow): string {
  return `Analisis de ${record.tecnologia_solar} en ${record.municipio}: tarifa ${record.tarifa_electrica}, consumo ${record.consumo} y recomendaciones personalizadas.`;
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } });

  const [municipiosQuery, tariffsQuery, consumptionsQuery] = await Promise.all([
    supabase.from("municipios_energia").select("municipio,provincia,slug").limit(100000),
    supabase.from("tariffs").select("slug,name").limit(100),
    supabase.from("consumption_bands").select("slug,min_kwh,max_kwh").limit(100)
  ]);

  if (municipiosQuery.error) throw new Error(municipiosQuery.error.message);
  if (tariffsQuery.error) throw new Error(tariffsQuery.error.message);
  if (consumptionsQuery.error) throw new Error(consumptionsQuery.error.message);

  const municipios = (municipiosQuery.data ?? []) as MunicipioRow[];
  const tariffs = (tariffsQuery.data ?? []) as TariffRow[];
  const consumptions = (consumptionsQuery.data ?? []) as ConsumptionRow[];

  if (!municipios.length || !tariffs.length || !consumptions.length) {
    throw new Error("Insufficient source data to generate SEO slugs");
  }

  const seen = new Set<string>();
  const rows: SlugIndexRow[] = [];

  for (const municipio of municipios) {
    for (const tariff of tariffs) {
      for (const consumption of consumptions) {
        for (const tecnologia of TECHNOLOGIES) {
          const consumoLabel = toConsumptionLabel(consumption);
          const slug = buildUniqueSeoSlug(
            {
              municipio: municipio.municipio,
              provincia: municipio.provincia,
              tarifaElectrica: tariff.slug,
              consumo: consumoLabel,
              tecnologiaSolar: tecnologia
            },
            seen
          );

          const row: SlugIndexRow = {
            slug,
            municipio: municipio.municipio,
            provincia: municipio.provincia,
            tarifa_electrica: tariff.slug,
            consumo: consumoLabel,
            tecnologia_solar: tecnologia,
            seo_title: "",
            seo_description: ""
          };

          row.seo_title = buildSeoTitle(row);
          row.seo_description = buildSeoDescription(row);
          rows.push(row);
        }
      }
    }
  }

  const chunkSize = 1000;
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    const { error } = await supabase
      .from("pseo_slug_index")
      .upsert(chunk, { onConflict: "slug", ignoreDuplicates: false });

    if (error) {
      throw new Error(`Upsert failed: ${error.message}`);
    }
  }

  console.log(`Generated ${rows.length} SEO slugs.`);
}

main().catch((error) => {
  console.error("generate-seo-slugs failed", error);
  process.exit(1);
});
