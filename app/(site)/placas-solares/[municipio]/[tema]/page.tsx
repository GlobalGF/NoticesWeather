
// --- Imports ordenados ---
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { tryParseSlug } from "@/lib/utils/params";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { cachePolicy } from "@/lib/cache/policy";
import { buildMetadata } from "@/lib/seo/metadata-builder";

export const revalidate = cachePolicy.page.solarCity;

const TEMA_META: Record<string, { titleTpl: (m: string) => string; descTpl: (m: string, p: string) => string }> = {
  ahorro: {
    titleTpl: (m) => `Ahorro con placas solares en ${m}`,
    descTpl: (m, p) => `¿Cuánto puedes ahorrar con energía solar en ${m} (${p})? Descubre el ahorro anual estimado, amortización y rentabilidad de una instalación fotovoltaica.`,
  },
  subvenciones: {
    titleTpl: (m) => `Subvenciones placas solares en ${m}`,
    descTpl: (m, p) => `Bonificaciones IBI, ICIO y subvenciones para autoconsumo solar en ${m} (${p}). Consulta las ayudas vigentes y cómo solicitarlas.`,
  },
  precio: {
    titleTpl: (m) => `Precio placas solares en ${m}`,
    descTpl: (m, p) => `¿Cuánto cuesta instalar placas solares en ${m} (${p})? Precios mínimos, medios y máximos, coste por vatio y presupuesto detallado.`,
  },
};

export async function generateMetadata({ params }: { params: { municipio: string; tema: string } }): Promise<Metadata> {
  const slug = tryParseSlug(params.municipio);
  const tema = params.tema;
  if (!slug || !tema || !TEMA_META[tema]) return {};

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("municipios_energia")
    .select("municipio, provincia")
    .eq("slug", slug)
    .maybeSingle();
  if (!data) return {};

  const row = data as unknown as { municipio: string; provincia: string };
  const meta = TEMA_META[tema];
  return buildMetadata({
    title: meta.titleTpl(row.municipio),
    description: meta.descTpl(row.municipio, row.provincia),
    pathname: `/placas-solares/${slug}/${tema}`,
  });
}

// --- Helpers ---
function fmt(v: number | null | undefined, dec = 0): string {
  if (v == null) return "—";
  return v.toLocaleString("es-ES", { maximumFractionDigits: dec });
}

// --- Bloques temáticos desacoplados ---
function AhorroBlock({ data }: { data: any }) {
  const ahorro = data.ahorro_estimado ?? 0;
  const horasSol = data.horas_sol ?? 2500;
  const irr = data.irradiacion_solar ?? 1600;
  const precioLuz = data.precio_medio_luz ?? 0.15;
  const precioInstalacion = Number(data.precio_instalacion_medio_eur ?? 6500);
  const paybackYears = ahorro > 0 ? Math.round(precioInstalacion / ahorro) : null;
  return (
    <section className="space-y-6">
      <div className="rounded-xl border-2 border-amber-300 bg-amber-50 p-6 shadow-md">
        <h2 className="text-xl font-bold mb-2 text-amber-800">Ahorro estimado con placas solares</h2>
        <p className="text-3xl font-black text-amber-900">{fmt(ahorro)} €<span className="text-base font-medium text-amber-700">/año</span></p>
      </div>
      <div className="prose prose-slate max-w-none">
        <h2>¿Cuánto puedes ahorrar con energía solar en {data.municipio}?</h2>
        <p>
          Una instalación fotovoltaica estándar de 5 kW en {data.municipio} ({data.provincia}) genera un ahorro estimado
          de <span className="font-bold">{fmt(ahorro)} € al año</span>, gracias a las {fmt(horasSol)} horas de sol anuales y una irradiación
          solar de {fmt(irr)} kWh/m². Este ahorro se calcula considerando el precio medio de la electricidad
          de {precioLuz.toFixed(2)} €/kWh y un ratio de autoconsumo del 65%.
        </p>
        <h3>Amortización de la inversión</h3>
        <p>
          {paybackYears
            ? `Con un coste medio de instalación de ${fmt(data.precio_instalacion_medio_eur)} €, la inversión se amortiza en aproximadamente ${paybackYears} años. A partir de ese momento, toda la energía generada supone beneficio neto para el hogar.`
            : `El periodo de amortización depende del tamaño de la instalación y las bonificaciones fiscales disponibles en ${data.municipio}. Solicita un presupuesto personalizado para calcular tu retorno exacto.`
          }
        </p>
        <h3>Factores que influyen en el ahorro</h3>
        <ul>
          <li><span className="font-bold">Horas de sol:</span> {fmt(horasSol)} h/año — {horasSol > 2700 ? "por encima de" : horasSol > 2400 ? "en la media de" : "ligeramente por debajo de"} la media nacional</li>
          <li><span className="font-bold">Irradiación solar:</span> {fmt(irr)} kWh/m²/año</li>
          <li><span className="font-bold">Precio de la luz:</span> {precioLuz.toFixed(2)} €/kWh</li>
          {data.bonificacion_ibi && <li><span className="font-bold">Bonificación IBI:</span> {data.bonificacion_ibi}% de descuento</li>}
        </ul>
      </div>
    </section>
  );
}

function SubvencionesBlock({ data }: { data: any }) {
  const year = new Date().getFullYear();
  return (
    <section className="space-y-6">
      <div className="rounded-xl border-2 border-emerald-300 bg-emerald-50 p-6 shadow-md">
        <h2 className="text-xl font-bold mb-2 text-emerald-800">Subvenciones y ayudas {year}</h2>
        <ul className="list-disc pl-5 text-emerald-900 space-y-1">
          {data.bonificacion_ibi && <li>Bonificación IBI: <span className="font-bold">{data.bonificacion_ibi}%</span></li>}
          {data.bonificacion_icio && <li>Bonificación ICIO: <span className="font-bold">{data.bonificacion_icio}%</span></li>}
          {data.subvencion_autoconsumo && <li>Subvención autoconsumo: <span className="font-bold">{fmt(data.subvencion_autoconsumo)} €</span></li>}
          {!data.bonificacion_ibi && !data.bonificacion_icio && !data.subvencion_autoconsumo && (
            <li>Consulta las ayudas vigentes en tu comunidad autónoma</li>
          )}
        </ul>
      </div>
      <div className="prose prose-slate max-w-none">
        <h2>Ayudas para placas solares en {data.municipio} ({year})</h2>
        <p>
          Los vecinos de {data.municipio} ({data.provincia}) pueden beneficiarse de varias líneas de ayuda
          para la instalación de paneles solares fotovoltaicos. Estas bonificaciones reducen significativamente
          el coste de la inversión inicial y aceleran el periodo de amortización.
        </p>
        {data.bonificacion_ibi && (
          <>
            <h3>Bonificación del IBI</h3>
            <p>
              El Ayuntamiento de {data.municipio} aplica una bonificación del <span className="font-bold">{data.bonificacion_ibi}%</span> en
              el Impuesto sobre Bienes Inmuebles (IBI) para viviendas con instalaciones de autoconsumo fotovoltaico.
              Esta bonificación suele aplicarse durante los primeros 3 a 5 años tras la instalación, lo que supone
              un ahorro adicional importante en la tributación municipal.
            </p>
          </>
        )}
        {data.bonificacion_icio && (
          <>
            <h3>Bonificación del ICIO</h3>
            <p>
              Además, se aplica una bonificación del <span className="font-bold">{data.bonificacion_icio}%</span> en el Impuesto sobre
              Construcciones, Instalaciones y Obras (ICIO). Esta deducción se aplica directamente sobre la licencia
              de obra necesaria para la instalación solar.
            </p>
          </>
        )}
        <h3>Deducción del IRPF</h3>
        <p>
          A nivel estatal, las instalaciones de autoconsumo permiten deducir hasta un 40% de la inversión
          en la declaración del IRPF (máximo 7.500 €), siempre que la instalación reduzca la demanda de
          calefacción y refrigeración en al menos un 30%.
        </p>
      </div>
    </section>
  );
}

function PrecioBlock({ data }: { data: any }) {
  const precioMedio = data.precio_instalacion_medio_eur;
  const eurW = data.eur_por_watio;
  const precioInstalacionEst = Number(precioMedio ?? 6500);
  const payback = data.ahorro_estimado > 0
    ? Math.round(precioInstalacionEst / data.ahorro_estimado)
    : null;
  return (
    <section className="space-y-6">
      <div className="rounded-xl border-2 border-blue-300 bg-blue-50 p-6 shadow-md">
        <h2 className="text-xl font-bold mb-4 text-blue-800">Precio de instalación solar</h2>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <li className="bg-white p-3 rounded-lg border border-blue-100 text-center">
            <span className="block text-xs text-blue-500">Mínimo</span>
            <span className="block text-lg font-semibold">{fmt(data.precio_instalacion_min_eur)} €</span>
          </li>
          <li className="bg-blue-100 p-3 rounded-xl border-2 border-blue-400 text-center">
            <span className="block text-xs font-semibold text-blue-800 uppercase tracking-widest">Medio</span>
            <span className="block text-2xl font-bold text-blue-900">{fmt(precioMedio)} €</span>
          </li>
          <li className="bg-white p-3 rounded-lg border border-blue-100 text-center">
            <span className="block text-xs text-blue-500">Máximo</span>
            <span className="block text-lg font-semibold">{fmt(data.precio_instalacion_max_eur)} €</span>
          </li>
          <li className="bg-white p-3 rounded-lg border border-blue-100 text-center">
            <span className="block text-xs text-blue-500">€/W</span>
            <span className="block text-lg font-semibold">{fmt(eurW, 2)} €</span>
          </li>
        </ul>
      </div>
      <div className="prose prose-slate max-w-none">
        <h2>¿Cuánto cuestan las placas solares en {data.municipio}?</h2>
        <p>
          El precio medio de una instalación fotovoltaica en {data.municipio} ({data.provincia}) se sitúa en
          torno a los <span className="font-bold">{fmt(precioMedio)} €</span> para una instalación residencial estándar de 5 kW,
          lo que equivale a <span className="font-bold">{fmt(eurW, 2)} €/W</span>. Este precio incluye los paneles solares,
          el inversor, la estructura de montaje, el cableado y la mano de obra de instalación.
        </p>
        <h3>Rango de precios</h3>
        <p>
          Según los datos recopilados para la zona de {data.provincia}, los precios oscilan
          entre {fmt(data.precio_instalacion_min_eur)} € (instalaciones básicas de 3-4 kW)
          y {fmt(data.precio_instalacion_max_eur)} € (sistemas premium de 8-10 kW con baterías y optimizadores).
          El precio final depende del número de paneles, la complejidad del tejado, y si incluye almacenamiento
          con baterías de litio.
        </p>
        {payback && (
          <>
            <h3>Retorno de la inversión</h3>
            <p>
              Con un ahorro estimado de {fmt(data.ahorro_estimado)} € anuales, la inversión de {fmt(precioMedio)} €
              se amortiza en aproximadamente <span className="font-bold">{payback} años</span>. Considerando que los paneles solares
              tienen una vida útil de 25-30 años, esto representa más de {25 - payback} años de energía
              prácticamente gratuita.
            </p>
          </>
        )}
      </div>
    </section>
  );
}

// --- Mapeo de temas a bloques ---
const TEMA_COMPONENTS: Record<string, (props: { data: any }) => JSX.Element> = {
  ahorro: AhorroBlock,
  subvenciones: SubvencionesBlock,
  precio: PrecioBlock,
};

// --- Fetch de datos desacoplado ---
async function getMunicipioBySlug(slug: string) {
  const supabase = await createSupabaseServerClient();
  const MUNICIPIO_COLUMNS = [
    "slug", "municipio", "provincia", "comunidad_autonoma", "habitantes",
    "horas_sol", "irradiacion_solar", "ahorro_estimado",
    "bonificacion_ibi", "bonificacion_icio", "subvencion_autoconsumo",
    "precio_medio_luz",
    "precio_instalacion_min_eur", "precio_instalacion_medio_eur",
    "precio_instalacion_max_eur", "eur_por_watio"
  ].join(", ");
  const { data, error } = await supabase
    .from("municipios_energia")
    .select(MUNICIPIO_COLUMNS)
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error(`Error loading municipios_energia: ${error.message}`);
  return data ?? null;
}

const TEMA_LABELS: Record<string, string> = {
  ahorro: "Ahorro con placas solares",
  subvenciones: "Subvenciones y ayudas",
  precio: "Precio de instalación",
};

// --- Página principal ordenada ---
export default async function MunicipioTemaPage({ params }: { params: { municipio: string; tema: string } }) {
  const slug = tryParseSlug(params.municipio);
  const tema = params.tema;
  if (!slug || !tema) notFound();

  const data = await getMunicipioBySlug(slug) as any;
  if (!data) notFound();

  const Block = TEMA_COMPONENTS[tema];
  if (!Block) notFound();

  const temaLabel = TEMA_LABELS[tema] ?? tema;
  const otherTemas = Object.entries(TEMA_LABELS).filter(([k]) => k !== tema);

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-slate-500">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li><a href="/" className="hover:text-blue-600 transition-colors">Inicio</a></li>
          <li>›</li>
          <li><a href="/placas-solares" className="hover:text-blue-600 transition-colors">Placas Solares</a></li>
          <li>›</li>
          <li><a href={`/placas-solares/${slug}`} className="hover:text-blue-600 transition-colors">{data.municipio}</a></li>
          <li>›</li>
          <li className="text-slate-800 font-medium">{temaLabel}</li>
        </ol>
      </nav>

      <h1 className="mb-8 text-3xl font-extrabold text-slate-900">
        {temaLabel} en {data.municipio} ({data.provincia})
      </h1>

      <Suspense fallback={<div>Cargando datos...</div>}>
        <Block data={data} />
      </Suspense>

      {/* Internal links to other tema pages */}
      <nav className="mt-10 border-t border-slate-200 pt-6">
        <h2 className="text-lg font-bold text-slate-800 mb-3">Más información sobre {data.municipio}</h2>
        <ul className="space-y-2">
          <li>
            <a href={`/placas-solares/${slug}`} className="text-blue-600 hover:underline font-medium">
              ← Estudio completo de placas solares en {data.municipio}
            </a>
          </li>
          {otherTemas.map(([key, label]) => (
            <li key={key}>
              <a href={`/placas-solares/${slug}/${key}`} className="text-blue-600 hover:underline">
                {label} en {data.municipio}
              </a>
            </li>
          ))}
          <li>
            <a href="/precio-luz" className="text-blue-600 hover:underline">
              Precio de la luz hoy
            </a>
          </li>
          <li>
            <a href={`/baterias-solares/${slug}`} className="text-blue-600 hover:underline">
              Baterías solares en {data.municipio}
            </a>
          </li>
        </ul>
      </nav>
    </main>
  );
}
