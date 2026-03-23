
// --- Imports ordenados ---
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { tryParseSlug } from "@/lib/utils/params";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// --- Bloques temáticos desacoplados ---
function AhorroBlock({ data }: { data: any }) {
  return (
    <section className="rounded-xl border-2 border-amber-300 bg-amber-50 p-6 shadow-md">
      <h2 className="text-xl font-bold mb-2 text-amber-800">Ahorro estimado</h2>
      <p className="text-lg text-amber-900 font-medium">
        Con placas solares en <span className="font-semibold">{data.municipio}</span>, el ahorro anual estimado es de
        <span className="font-bold"> {data.ahorro_estimado?.toLocaleString("es-ES")} €</span>.
      </p>
      {/* Puedes añadir aquí gráficos o detalles adicionales */}
    </section>
  );
}

function SubvencionesBlock({ data }: { data: any }) {
  return (
    <section className="rounded-xl border-2 border-emerald-300 bg-emerald-50 p-6 shadow-md">
      <h2 className="text-xl font-bold mb-2 text-emerald-800">Subvenciones y ayudas</h2>
      <ul className="list-disc pl-5 text-emerald-900">
        {data.bonificacion_ibi && <li>Bonificación IBI: {data.bonificacion_ibi}%</li>}
        {data.bonificacion_icio && <li>Bonificación ICIO: {data.bonificacion_icio}%</li>}
        {data.subvencion_autoconsumo && <li>Subvención autoconsumo: {data.subvencion_autoconsumo} €</li>}
      </ul>
      {/* Puedes añadir links o detalles de tu API */}
    </section>
  );
}

function PrecioBlock({ data }: { data: any }) {
  return (
    <section className="rounded-xl border-2 border-blue-300 bg-blue-50 p-6 shadow-md">
      <h2 className="text-xl font-bold mb-2 text-blue-800">Precio de instalación</h2>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <li className="bg-white p-3 rounded-lg border border-blue-100 text-center">
          <span className="block text-xs text-blue-500">Mínimo</span>
          <span className="block text-lg font-semibold">{data.precio_instalacion_min_eur?.toLocaleString("es-ES")} €</span>
        </li>
        <li className="bg-blue-100 p-3 rounded-xl border-2 border-blue-400 text-center">
          <span className="block text-xs font-semibold text-blue-800 uppercase tracking-widest">Medio</span>
          <span className="block text-2xl font-bold text-blue-900">{data.precio_instalacion_medio_eur?.toLocaleString("es-ES")} €</span>
        </li>
        <li className="bg-white p-3 rounded-lg border border-blue-100 text-center">
          <span className="block text-xs text-blue-500">Máximo</span>
          <span className="block text-lg font-semibold">{data.precio_instalacion_max_eur?.toLocaleString("es-ES")} €</span>
        </li>
        <li className="bg-white p-3 rounded-lg border border-blue-100 text-center">
          <span className="block text-xs text-blue-500">€/W</span>
          <span className="block text-lg font-semibold">{data.eur_por_watio?.toLocaleString("es-ES")} €</span>
        </li>
      </ul>
      {/* Puedes mostrar breakdown o detalles de tu API */}
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

// --- Página principal ordenada ---
export default async function MunicipioTemaPage({ params }: { params: { municipio: string; tema: string } }) {
  const slug = tryParseSlug(params.municipio);
  const tema = params.tema;
  if (!slug || !tema) notFound();

  const data = await getMunicipioBySlug(slug);
  if (!data) notFound();

  const Block = TEMA_COMPONENTS[tema];
  if (!Block) notFound();

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-6 text-3xl font-extrabold text-slate-900 capitalize">
        {tema} en {data.municipio}
      </h1>
      <Suspense fallback={<div>Cargando datos...</div>}>
        <Block data={data} />
      </Suspense>
    </main>
  );
}
