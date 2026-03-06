import { notFound } from "next/navigation";
import { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SolarStats } from "@/components/ui/SolarStats";
import { getStaticPrebuildBudget } from "@/lib/pseo/static-budget";

export const revalidate = 86400;
export const dynamicParams = true;
export const dynamic = "force-static";
export const runtime = "nodejs";

type Props = {
  params: { municipio: string };
};

type MunicipioEnergiaRow = {
  slug: string;
  municipio: string;
  provincia: string;
  comunidad_autonoma: string;
  habitantes: number | null;
  horas_sol: number | null;
  irradiacion_solar: number | null;
  ahorro_estimado: number | null;
  bonificacion_ibi: number | null;
  bonificacion_icio: number | null;
  subvencion_autoconsumo: number | null;
  precio_medio_luz: number | null;
  precio_instalacion_min_eur: number | null;
  precio_instalacion_medio_eur: number | null;
  precio_instalacion_max_eur: number | null;
  eur_por_watio: number | null;
};

type EquipoSolarRow = {
  marca: string;
  modelo: string;
  tipo: string;
  potencia: number;
  eficiencia: number;
  precio_estimado: number;
};

type SlugRow = {
  slug: string | null;
};

/* ---------- helpers ---------- */

function pickVariant(slug: string): number {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = (hash * 31 + slug.charCodeAt(i)) >>> 0;
  }
  return hash % 3;
}

function fmt(value: number | null | undefined, suffix = ""): string {
  if (value == null) return "N/D";
  return `${value.toLocaleString("es-ES")}${suffix}`;
}

function fmtEur(value: number | null | undefined): string {
  if (value == null) return "N/D";
  return `${value.toLocaleString("es-ES", { maximumFractionDigits: 0 })} \u20AC`;
}

/* ---------- data fetching ---------- */

const MUNICIPIO_COLUMNS = [
  "slug", "municipio", "provincia", "comunidad_autonoma", "habitantes",
  "horas_sol", "irradiacion_solar", "ahorro_estimado",
  "bonificacion_ibi", "bonificacion_icio", "subvencion_autoconsumo",
  "precio_medio_luz",
  "precio_instalacion_min_eur", "precio_instalacion_medio_eur",
  "precio_instalacion_max_eur", "eur_por_watio"
].join(", ");

async function getMunicipioBySlug(slug: string): Promise<MunicipioEnergiaRow | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("municipios_energia")
    .select(MUNICIPIO_COLUMNS)
    .eq("slug", slug)
    .maybeSingle<MunicipioEnergiaRow>();

  if (error) throw new Error(`Error loading municipios_energia: ${error.message}`);
  return data ?? null;
}

async function getEquiposRecomendados(): Promise<EquipoSolarRow[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("equipos_solares_comunes_es")
    .select("marca, modelo, tipo, potencia, eficiencia, precio_estimado")
    .in("tipo", ["panel-solar", "inversor", "bateria"])
    .order("eficiencia", { ascending: false })
    .limit(9);

  if (error || !data) return [];
  return data as EquipoSolarRow[];
}

async function getAllSlugs(): Promise<string[]> {
  const supabase = await createSupabaseServerClient();
  const pageSize = 1000;
  let from = 0;
  const slugs: string[] = [];

  while (true) {
    const to = from + pageSize - 1;
    const { data, error } = await supabase
      .from("municipios_energia")
      .select("slug")
      .order("slug", { ascending: true })
      .range(from, to);

    if (error) throw new Error(`Error loading municipios slugs: ${error.message}`);
    const rows = (data ?? []) as SlugRow[];
    if (rows.length === 0) break;

    for (const row of rows) {
      if (row.slug) slugs.push(String(row.slug));
    }

    if (rows.length < pageSize) break;
    from += pageSize;
  }

  return slugs;
}

export async function generateStaticParams() {
  const slugs = await getAllSlugs();
  const budget = getStaticPrebuildBudget("PSEO_PREBUILD_MUNICIPIOS", 1200);
  return slugs.slice(0, budget).map((slug) => ({ municipio: slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = decodeURIComponent(params.municipio);
  const data = await getMunicipioBySlug(slug);
  if (!data) return {};

  const title = `Placas solares en ${data.municipio} \u2013 Ahorro, ayudas y rentabilidad`;
  const description = `Todo sobre instalar placas solares en ${data.municipio} (${data.provincia}): ${fmt(data.horas_sol)} horas de sol, ahorro estimado de ${fmtEur(data.ahorro_estimado)} al a\u00f1o y bonificaciones disponibles.`;

  return {
    title,
    description,
    openGraph: { title, description },
  };
}

/* ---------- page ---------- */

export default async function PlacasSolaresMunicipioPage({ params }: Props) {
  const slug = decodeURIComponent(params.municipio);
  const [data, equipos] = await Promise.all([
    getMunicipioBySlug(slug),
    getEquiposRecomendados()
  ]);

  if (!data) notFound();

  const v = pickVariant(data.slug);

  const paneles = equipos.filter((e) => e.tipo === "panel-solar");
  const inversores = equipos.filter((e) => e.tipo === "inversor");
  const baterias = equipos.filter((e) => e.tipo === "bateria");

  /* --- 1. Introduccion localizada --- */
  const introVariants = [
    `Instalar placas solares en ${data.municipio} es cada vez m\u00e1s rentable. Con ${fmt(data.horas_sol)} horas de sol anuales y un precio medio de electricidad de ${fmt(data.precio_medio_luz, " \u20AC/kWh")}, el autoconsumo fotovoltaico permite reducir la factura de forma sostenida a lo largo del a\u00f1o.`,
    `${data.municipio}, en ${data.provincia}, re\u00fane condiciones favorables para el autoconsumo solar: una irradiaci\u00f3n de ${fmt(data.irradiacion_solar, " kWh/m\u00b2")} al a\u00f1o y un coste el\u00e9ctrico que hace visible el ahorro desde el primer mes. Si est\u00e1s valorando una instalaci\u00f3n, estos son los datos clave.`,
    `Si vives en ${data.municipio}, tienes una base s\u00f3lida para amortizar paneles solares: ${fmt(data.horas_sol)} horas de sol, ${fmt(data.irradiacion_solar, " kWh/m\u00b2")} de radiaci\u00f3n y un precio medio de luz de ${fmt(data.precio_medio_luz, " \u20AC/kWh")}. Aqu\u00ed analizamos las cifras reales.`
  ];

  /* --- 2. Potencial solar --- */
  const potencialVariants = [
    `La provincia de ${data.provincia} registra una irradiaci\u00f3n media de ${fmt(data.irradiacion_solar, " kWh/m\u00b2")} anuales, con aproximadamente ${fmt(data.horas_sol)} horas de sol efectivas. Esto se traduce en un rendimiento elevado por cada kW instalado, lo que reduce el plazo de amortizaci\u00f3n frente a zonas con menor recurso solar.`,
    `Con ${fmt(data.horas_sol, " horas de sol")} al a\u00f1o y una radiaci\u00f3n de ${fmt(data.irradiacion_solar, " kWh/m\u00b2")}, ${data.municipio} ofrece condiciones por encima de la media europea para sistemas fotovoltaicos residenciales. Cada panel de 400\u2013440 W puede producir entre 600 y 900 kWh anuales seg\u00fan orientaci\u00f3n y sombras.`,
    `El potencial solar de ${data.municipio} es competitivo: ${fmt(data.irradiacion_solar, " kWh/m\u00b2")} de irradiaci\u00f3n y ${fmt(data.horas_sol)} horas de insolaci\u00f3n anual. Una instalaci\u00f3n de 5 kW en esta zona puede generar aproximadamente entre 6.000 y 8.500 kWh al a\u00f1o, dependiendo de inclinaci\u00f3n y sombreado.`
  ];

  /* --- 3. Ahorro anual --- */
  const ahorroVariants = [
    `Para un hogar medio en ${data.municipio} con un consumo t\u00edpico de 350 kWh/mes, el ahorro anual estimado se sit\u00faa en torno a ${fmtEur(data.ahorro_estimado)}. Este c\u00e1lculo tiene en cuenta el precio medio de ${fmt(data.precio_medio_luz, " \u20AC/kWh")} y un autoconsumo directo del 60\u201370%.`,
    `Con una instalaci\u00f3n bien dimensionada, el ahorro anual puede alcanzar los ${fmtEur(data.ahorro_estimado)}. La clave est\u00e1 en maximizar el consumo diurno para aprovechar la producci\u00f3n solar directa y reducir la energ\u00eda vertida a red.`,
    `En ${data.municipio}, la referencia de ahorro para una vivienda unifamiliar ronda los ${fmtEur(data.ahorro_estimado)} anuales. Si adem\u00e1s se incorpora bater\u00eda de almacenamiento, el porcentaje de autoconsumo puede superar el 80%.`
  ];

  /* --- 4. Subvenciones y ayudas --- */
  const ayudas: string[] = [];
  if (data.bonificacion_ibi != null && data.bonificacion_ibi > 0)
    ayudas.push(`Bonificaci\u00f3n del ${data.bonificacion_ibi}% en el IBI durante varios a\u00f1os`);
  if (data.bonificacion_icio != null && data.bonificacion_icio > 0)
    ayudas.push(`Bonificaci\u00f3n del ${data.bonificacion_icio}% en el ICIO (licencia de obra)`);
  if (data.subvencion_autoconsumo != null && data.subvencion_autoconsumo > 0)
    ayudas.push(`Subvenci\u00f3n auton\u00f3mica de hasta el ${fmt(data.subvencion_autoconsumo)}% del coste elegible`);

  const ayudasIntroVariants = [
    `En ${data.municipio} (${data.comunidad_autonoma}) puedes acceder a varias l\u00edneas de ayuda que reducen significativamente el coste de la instalaci\u00f3n:`,
    `El ayuntamiento de ${data.municipio} y la comunidad de ${data.comunidad_autonoma} ofrecen incentivos fiscales y econ\u00f3micos para instalaciones de autoconsumo:`,
    `Las ayudas disponibles en ${data.municipio} combinan desgravaciones fiscales municipales con subvenciones auton\u00f3micas:`
  ];

  /* --- 5. Precio instalacion --- */
  const precioIntroVariants = [
    `En ${data.provincia}, el coste de una instalaci\u00f3n solar residencial de 4\u20135 kW se mueve entre ${fmtEur(data.precio_instalacion_min_eur)} y ${fmtEur(data.precio_instalacion_max_eur)}, con un precio medio de referencia de ${fmtEur(data.precio_instalacion_medio_eur)}. El ratio por vatio se sit\u00faa en ${fmt(data.eur_por_watio, " \u20AC/W")}.`,
    `El precio medio de instalar placas solares en ${data.municipio} ronda los ${fmtEur(data.precio_instalacion_medio_eur)} para una vivienda unifamiliar est\u00e1ndar (4\u20135 kW). Este valor puede variar entre ${fmtEur(data.precio_instalacion_min_eur)} y ${fmtEur(data.precio_instalacion_max_eur)} seg\u00fan la complejidad del tejado y el tipo de equipo.`,
    `Una instalaci\u00f3n t\u00edpica en la zona de ${data.provincia} cuesta aproximadamente ${fmtEur(data.precio_instalacion_medio_eur)}, con un rango entre ${fmtEur(data.precio_instalacion_min_eur)} y ${fmtEur(data.precio_instalacion_max_eur)}. A ${fmt(data.eur_por_watio, " \u20AC/W")}, el retorno de inversi\u00f3n suele alcanzarse entre 5 y 8 a\u00f1os.`
  ];

  /* --- ROI estimado --- */
  const precioMedio = data.precio_instalacion_medio_eur ?? 6500;
  const ahorroAnual = data.ahorro_estimado ?? 500;
  const roiYears = ahorroAnual > 0 ? precioMedio / ahorroAnual : 0;

  /* --- FAQ structured data --- */
  const faqItems = [
    {
      q: `\u00bfCompensa instalar placas solares en ${data.municipio}?`,
      a: `S\u00ed. Con ${fmt(data.horas_sol)} horas de sol al a\u00f1o, una irradiaci\u00f3n de ${fmt(data.irradiacion_solar, " kWh/m\u00b2")} y un precio de luz de ${fmt(data.precio_medio_luz, " \u20AC/kWh")}, el contexto es favorable para el autoconsumo.`
    },
    {
      q: `\u00bfCu\u00e1nto cuesta una instalaci\u00f3n solar en ${data.municipio}?`,
      a: `El precio medio ronda los ${fmtEur(data.precio_instalacion_medio_eur)} para 4\u20135 kW, con un rango entre ${fmtEur(data.precio_instalacion_min_eur)} y ${fmtEur(data.precio_instalacion_max_eur)} seg\u00fan equipo y complejidad.`
    },
    {
      q: `\u00bfCu\u00e1nto se puede ahorrar al a\u00f1o?`,
      a: `El ahorro estimado para un hogar medio ronda los ${fmtEur(data.ahorro_estimado)} anuales, aunque var\u00eda seg\u00fan consumo y dimensionado.`
    },
    {
      q: `\u00bfQu\u00e9 ayudas hay disponibles en ${data.municipio}?`,
      a: ayudas.length > 0
        ? ayudas.join(". ") + "."
        : `Consulta la ordenanza municipal vigente y las convocatorias de ${data.comunidad_autonoma} para verificar ayudas activas.`
    },
    {
      q: `\u00bfEn cu\u00e1nto tiempo se recupera la inversi\u00f3n?`,
      a: roiYears > 0
        ? `Con las condiciones actuales, el retorno estimado es de aproximadamente ${roiYears.toFixed(1)} a\u00f1os.`
        : `Depende del dimensionado y las ayudas aplicables; solicita un estudio personalizado para un c\u00e1lculo preciso.`
    }
  ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a }
    }))
  };

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Placas solares en {data.municipio}: ahorro, precio y ayudas {new Date().getFullYear()}
        </h1>
        <p className="mt-2 text-slate-600">{data.provincia}, {data.comunidad_autonoma}</p>
      </header>

      <SolarStats slug={data.slug} className="mb-6" title="Resumen energ\u00e9tico del municipio" />

      {/* 1. Introduccion localizada */}
      <section className="rounded-xl border border-slate-200 p-5">
        <h2 className="text-2xl font-semibold">\u00bfPor qu\u00e9 instalar placas solares en {data.municipio}?</h2>
        <p className="mt-3 leading-relaxed text-slate-700">{introVariants[v]}</p>
        <ul className="mt-3 list-inside list-disc space-y-1 text-slate-700">
          <li>Radiaci\u00f3n solar: <strong>{fmt(data.irradiacion_solar, " kWh/m\u00b2")}</strong></li>
          <li>Horas de sol anuales: <strong>{fmt(data.horas_sol)}</strong></li>
          <li>Precio medio electricidad: <strong>{fmt(data.precio_medio_luz, " \u20AC/kWh")}</strong></li>
        </ul>
      </section>

      {/* 2. Potencial solar */}
      <section className="mt-5 rounded-xl border border-slate-200 p-5">
        <h2 className="text-2xl font-semibold">Potencial solar en {data.municipio}</h2>
        <p className="mt-3 leading-relaxed text-slate-700">{potencialVariants[v]}</p>
      </section>

      {/* 3. Estimacion de ahorro */}
      <section className="mt-5 rounded-xl border border-slate-200 p-5">
        <h2 className="text-2xl font-semibold">Ahorro estimado con placas solares en {data.municipio}</h2>
        <p className="mt-3 leading-relaxed text-slate-700">{ahorroVariants[v]}</p>
        {roiYears > 0 && (
          <p className="mt-2 text-sm text-slate-500">
            Retorno de inversi\u00f3n estimado: <strong>{roiYears.toFixed(1)} a\u00f1os</strong> (basado en precio medio de instalaci\u00f3n de {fmtEur(data.precio_instalacion_medio_eur)} y ahorro anual de {fmtEur(data.ahorro_estimado)}).
          </p>
        )}
      </section>

      {/* 4. Subvenciones y ayudas */}
      <section className="mt-5 rounded-xl border border-slate-200 p-5">
        <h2 className="text-2xl font-semibold">Subvenciones y ayudas en {data.municipio}</h2>
        <p className="mt-3 leading-relaxed text-slate-700">{ayudasIntroVariants[v]}</p>
        {ayudas.length > 0 ? (
          <ul className="mt-3 list-inside list-disc space-y-1 text-slate-700">
            {ayudas.map((a) => <li key={a}>{a}</li>)}
          </ul>
        ) : (
          <p className="mt-2 text-slate-500">
            No se han identificado incentivos espec\u00edficos en este registro para {data.municipio}. Recomendamos confirmar la ordenanza municipal vigente y las convocatorias de {data.comunidad_autonoma}.
          </p>
        )}
      </section>

      {/* 5. Precio de instalacion */}
      {data.precio_instalacion_medio_eur != null && (
        <section className="mt-5 rounded-xl border border-slate-200 p-5">
          <h2 className="text-2xl font-semibold">Precio de instalar placas solares en {data.municipio}</h2>
          <p className="mt-3 leading-relaxed text-slate-700">{precioIntroVariants[v]}</p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-lg bg-slate-50 p-3 text-center">
              <p className="text-xs text-slate-500">M\u00ednimo</p>
              <p className="text-lg font-semibold">{fmtEur(data.precio_instalacion_min_eur)}</p>
            </div>
            <div className="rounded-lg bg-blue-50 p-3 text-center">
              <p className="text-xs text-blue-600">Medio</p>
              <p className="text-lg font-bold text-blue-700">{fmtEur(data.precio_instalacion_medio_eur)}</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-3 text-center">
              <p className="text-xs text-slate-500">M\u00e1ximo</p>
              <p className="text-lg font-semibold">{fmtEur(data.precio_instalacion_max_eur)}</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-3 text-center">
              <p className="text-xs text-slate-500">\u20AC/W</p>
              <p className="text-lg font-semibold">{fmt(data.eur_por_watio, " \u20AC")}</p>
            </div>
          </div>
        </section>
      )}

      {/* 6. Equipos solares recomendados */}
      {paneles.length > 0 && (
        <section className="mt-5 rounded-xl border border-slate-200 p-5">
          <h2 className="text-2xl font-semibold">Equipos solares recomendados para {data.municipio}</h2>
          <p className="mt-3 leading-relaxed text-slate-700">
            Estos son los paneles, inversores y bater\u00edas m\u00e1s habituales en instalaciones residenciales en la zona de {data.provincia}. La selecci\u00f3n depende del espacio disponible, la orientaci\u00f3n del tejado y el presupuesto.
          </p>

          {/* Paneles */}
          <h3 className="mt-4 text-lg font-semibold">Paneles solares</h3>
          <div className="mt-2 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-3 py-2">Marca / Modelo</th>
                  <th className="px-3 py-2">Potencia</th>
                  <th className="px-3 py-2">Eficiencia</th>
                  <th className="px-3 py-2">Precio est.</th>
                </tr>
              </thead>
              <tbody>
                {paneles.map((p) => (
                  <tr key={`${p.marca}-${p.modelo}`} className="border-b border-slate-100">
                    <td className="px-3 py-2 font-medium">{p.marca} {p.modelo}</td>
                    <td className="px-3 py-2">{p.potencia} W</td>
                    <td className="px-3 py-2">{p.eficiencia}%</td>
                    <td className="px-3 py-2">{fmtEur(p.precio_estimado)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Inversores */}
          {inversores.length > 0 && (
            <>
              <h3 className="mt-5 text-lg font-semibold">Inversores</h3>
              <div className="mt-2 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-3 py-2">Marca / Modelo</th>
                      <th className="px-3 py-2">Potencia</th>
                      <th className="px-3 py-2">Eficiencia</th>
                      <th className="px-3 py-2">Precio est.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inversores.map((p) => (
                      <tr key={`${p.marca}-${p.modelo}`} className="border-b border-slate-100">
                        <td className="px-3 py-2 font-medium">{p.marca} {p.modelo}</td>
                        <td className="px-3 py-2">{p.potencia} W</td>
                        <td className="px-3 py-2">{p.eficiencia}%</td>
                        <td className="px-3 py-2">{fmtEur(p.precio_estimado)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Baterias */}
          {baterias.length > 0 && (
            <>
              <h3 className="mt-5 text-lg font-semibold">Bater\u00edas de almacenamiento</h3>
              <div className="mt-2 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-3 py-2">Marca / Modelo</th>
                      <th className="px-3 py-2">Eficiencia</th>
                      <th className="px-3 py-2">Precio est.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {baterias.map((p) => (
                      <tr key={`${p.marca}-${p.modelo}`} className="border-b border-slate-100">
                        <td className="px-3 py-2 font-medium">{p.marca} {p.modelo}</td>
                        <td className="px-3 py-2">{p.eficiencia}%</td>
                        <td className="px-3 py-2">{fmtEur(p.precio_estimado)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>
      )}

      {/* 7. FAQ */}
      <section className="mt-5 rounded-xl border border-slate-200 p-5">
        <h2 className="text-2xl font-semibold">Preguntas frecuentes sobre placas solares en {data.municipio}</h2>
        <dl className="mt-4 space-y-4">
          {faqItems.map((f) => (
            <div key={f.q}>
              <dt className="font-semibold text-slate-800">{f.q}</dt>
              <dd className="mt-1 leading-relaxed text-slate-600">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* 8. CTA */}
      <section className="mt-5 rounded-xl border border-emerald-300 bg-emerald-50 p-6 text-center">
        <h2 className="text-2xl font-bold text-emerald-900">
          Solicita tu estudio solar gratuito en {data.municipio}
        </h2>
        <p className="mx-auto mt-3 max-w-xl leading-relaxed text-emerald-800">
          Te entregamos una simulaci\u00f3n personalizada con producci\u00f3n esperada, ahorro realista, ayudas aplicables
          y plazo de amortizaci\u00f3n para tu vivienda en {data.municipio}, {data.provincia}.
        </p>
        <button
          type="button"
          className="mt-5 inline-block rounded-lg bg-emerald-600 px-8 py-3 font-semibold text-white shadow-sm transition hover:bg-emerald-700"
        >
          Quiero mi estudio gratuito
        </button>
      </section>
    </main>
  );
}