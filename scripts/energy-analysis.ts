import { createClient } from "@supabase/supabase-js";
import { estimateAnnualPvProduction } from "../calculators/pv-production";
import { estimateAnnualSavings } from "../calculators/savings";
import { estimatePaybackYears } from "../calculators/payback";

type SupabaseRowCanonical = {
  slug: string;
  municipio: string;
  radiacion_solar: number;
  precio_kwh: number;
  consumo_promedio: number;
};

type SupabaseRowAlternative = {
  slug: string;
  municipio: string;
  irradiacion_solar: number;
  precio_medio_luz: number;
};

type CliOptions = {
  slug?: string;
  consumoPromedio?: number;
  potenciaKwp: number;
  performanceRatio: number;
  autoconsumoRatio: number;
  inversionEur: number;
};

function parseNumber(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseArgs(): CliOptions {
  const args = process.argv.slice(2);

  if (args.includes("--help")) {
    console.log(
      JSON.stringify(
        {
          usage:
            "npm run energy:analysis -- [--slug=slug] [--consumo-promedio=4200] [--potencia-kwp=4.5] [--performance-ratio=0.78] [--autoconsumo-ratio=0.7] [--inversion-eur=6500]",
          notes: [
            "Lee datos de Supabase y devuelve un JSON con produccion_anual, ahorro_anual y tiempo_amortizacion.",
            "Si no existe consumo_promedio en Supabase, debes pasar --consumo-promedio o ENERGY_DEFAULT_CONSUMO_PROMEDIO_KWH."
          ]
        },
        null,
        2
      )
    );
    process.exit(0);
  }

  const getValue = (flag: string): string | undefined => {
    const pair = args.find((arg) => arg.startsWith(`${flag}=`));
    return pair ? pair.slice(flag.length + 1) : undefined;
  };

  return {
    slug: getValue("--slug"),
    consumoPromedio: getValue("--consumo-promedio")
      ? Number(getValue("--consumo-promedio"))
      : undefined,
    potenciaKwp: parseNumber(getValue("--potencia-kwp"), 4.5),
    performanceRatio: parseNumber(getValue("--performance-ratio"), 0.78),
    autoconsumoRatio: parseNumber(getValue("--autoconsumo-ratio"), 0.7),
    inversionEur: parseNumber(getValue("--inversion-eur"), 6500)
  };
}

function buildClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL/SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  return createClient(url, serviceKey, { auth: { persistSession: false } });
}

async function fetchCanonicalRow(options: CliOptions): Promise<SupabaseRowCanonical | null> {
  const supabase = buildClient();

  const query = supabase
    .from("municipios_energia")
    .select("slug,municipio,radiacion_solar,precio_kwh,consumo_promedio")
    .limit(1);

  const filteredQuery = options.slug ? query.eq("slug", options.slug) : query.order("habitantes", { ascending: false });
  const { data, error } = await filteredQuery;

  if (error) {
    return null;
  }

  const row = (data?.[0] ?? null) as SupabaseRowCanonical | null;
  return row;
}

async function fetchAlternativeRow(options: CliOptions): Promise<SupabaseRowAlternative> {
  const supabase = buildClient();

  const query = supabase
    .from("municipios_energia")
    .select("slug,municipio,irradiacion_solar,precio_medio_luz")
    .limit(1);

  const filteredQuery = options.slug ? query.eq("slug", options.slug) : query.order("habitantes", { ascending: false });
  const { data, error } = await filteredQuery;

  if (error) {
    throw new Error(`Supabase query error [fallback]: ${error.message}`);
  }

  const row = (data?.[0] ?? null) as SupabaseRowAlternative | null;
  if (!row) {
    throw new Error("No rows found in municipios_energia");
  }

  return row;
}

function resolveConsumoPromedio(rowValue: number | undefined, cliValue: number | undefined): number {
  const envDefault = Number(process.env.ENERGY_DEFAULT_CONSUMO_PROMEDIO_KWH ?? "");

  const candidate =
    (rowValue !== undefined && Number.isFinite(rowValue) ? rowValue : undefined) ??
    (cliValue !== undefined && Number.isFinite(cliValue) ? cliValue : undefined) ??
    (Number.isFinite(envDefault) ? envDefault : undefined);

  if (candidate === undefined) {
    throw new Error(
      "consumo_promedio is missing. Provide --consumo-promedio=<kwh> or ENERGY_DEFAULT_CONSUMO_PROMEDIO_KWH"
    );
  }

  if (candidate <= 0) {
    throw new Error("consumo_promedio must be > 0");
  }

  return candidate;
}

async function main() {
  const options = parseArgs();

  const canonical = await fetchCanonicalRow(options);

  const radiacionSolar = canonical?.radiacion_solar;
  const precioKwh = canonical?.precio_kwh;

  let consumoPromedio = canonical?.consumo_promedio;
  let slug = canonical?.slug;
  let municipio = canonical?.municipio;

  if (radiacionSolar === undefined || precioKwh === undefined) {
    const fallbackRow = await fetchAlternativeRow(options);
    slug = fallbackRow.slug;
    municipio = fallbackRow.municipio;

    consumoPromedio = resolveConsumoPromedio(undefined, options.consumoPromedio);

    const produccionAnual = estimateAnnualPvProduction(
      fallbackRow.irradiacion_solar,
      options.potenciaKwp,
      options.performanceRatio
    );

    const energiaAutoconsumida = Math.min(produccionAnual * options.autoconsumoRatio, consumoPromedio);
    const ahorroAnual = estimateAnnualSavings(energiaAutoconsumida, 1, fallbackRow.precio_medio_luz);
    const tiempoAmortizacion = estimatePaybackYears(options.inversionEur, ahorroAnual);

    const result = {
      fuente: "municipios_energia (fallback columns)",
      municipio,
      slug,
      entrada: {
        radiacion_solar: fallbackRow.irradiacion_solar,
        precio_kwh: fallbackRow.precio_medio_luz,
        consumo_promedio: consumoPromedio,
        potencia_kwp: options.potenciaKwp,
        performance_ratio: options.performanceRatio,
        autoconsumo_ratio: options.autoconsumoRatio,
        inversion_eur: options.inversionEur
      },
      resultado: {
        produccion_anual: Number(produccionAnual.toFixed(2)),
        ahorro_anual: Number(ahorroAnual.toFixed(2)),
        tiempo_amortizacion: Number.isFinite(tiempoAmortizacion)
          ? Number(tiempoAmortizacion.toFixed(2))
          : null
      }
    };

    console.log(JSON.stringify(result, null, 2));
    return;
  }

  consumoPromedio = resolveConsumoPromedio(consumoPromedio, options.consumoPromedio);

  const produccionAnual = estimateAnnualPvProduction(
    radiacionSolar,
    options.potenciaKwp,
    options.performanceRatio
  );

  const energiaAutoconsumida = Math.min(produccionAnual * options.autoconsumoRatio, consumoPromedio);
  const ahorroAnual = estimateAnnualSavings(energiaAutoconsumida, 1, precioKwh);
  const tiempoAmortizacion = estimatePaybackYears(options.inversionEur, ahorroAnual);

  const result = {
    fuente: "municipios_energia",
    municipio,
    slug,
    entrada: {
      radiacion_solar: radiacionSolar,
      precio_kwh: precioKwh,
      consumo_promedio: consumoPromedio,
      potencia_kwp: options.potenciaKwp,
      performance_ratio: options.performanceRatio,
      autoconsumo_ratio: options.autoconsumoRatio,
      inversion_eur: options.inversionEur
    },
    resultado: {
      produccion_anual: Number(produccionAnual.toFixed(2)),
      ahorro_anual: Number(ahorroAnual.toFixed(2)),
      tiempo_amortizacion: Number.isFinite(tiempoAmortizacion)
        ? Number(tiempoAmortizacion.toFixed(2))
        : null
    }
  };

  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(
    JSON.stringify(
      {
        error: String(error instanceof Error ? error.message : error),
        hint: "Review Supabase env vars and optional --consumo-promedio"
      },
      null,
      2
    )
  );
  process.exit(1);
});
