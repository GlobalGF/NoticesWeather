import Link from "next/link";
import { getTopMunicipiosEnergiaSlugs } from "@/data/repositories/municipios-energia.repo";

export const metadata = {
  title: "Placas solares en España - Municipios y recursos",
  description: "Explora información sobre placas solares por municipio, recursos, guías y datos de producción solar en España."
};

export default async function PlacasSolaresIndexPage() {
  const rows = await getTopMunicipiosEnergiaSlugs(20);
  const slugs = rows.map((row) => row.slug).filter(Boolean);

  return (
    <section className="prose mx-auto max-w-3xl">
      <h1>Placas solares en España</h1>
      <p>
        Descubre información detallada sobre la instalación y el rendimiento de placas solares en los principales municipios de España. Selecciona un municipio para ver datos específicos, ayudas y recomendaciones.
      </p>
      <h2>Municipios destacados</h2>
      <ul className="list-disc pl-6 mb-8">
        {slugs.map((slug) => (
          <li key={slug}>
            <Link href={`/placas-solares/${slug}`} className="text-blue-700 hover:underline">
              Placas solares en {slug.replace(/-/g, ", ")}
            </Link>
          </li>
        ))}
      </ul>
      <h2>Otras páginas relacionadas</h2>
      <ul className="list-disc pl-6">
        <li>
          <Link href="/placas-solares/geo" className="text-blue-700 hover:underline">
            Buscar por comunidad/provincia/municipio
          </Link>
        </li>
        {/* Puedes añadir más enlaces a otras rutas relacionadas aquí */}
      </ul>
    </section>
  );
}
