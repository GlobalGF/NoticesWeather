import Link from "next/link";
import { getTopMunicipiosEnergiaSlugs } from "@/data/repositories/municipios-energia.repo";

function buildValidExamples(slugs: string[]): string[] {
  const examples: string[] = [];
  for (const slug of slugs) {
    examples.push(`/placas-solares/${slug}`);
    examples.push(`/bonificacion-ibi/${slug}`);
    examples.push(`/autoconsumo-compartido/${slug}`);
    if (examples.length >= 12) break;
  }
  return examples;
}

export default async function HomePage() {
  const rows = await getTopMunicipiosEnergiaSlugs(8);
  const slugs = rows.map((row) => row.slug).filter(Boolean);
  const examples = buildValidExamples(slugs);

  return (
    <section className="card">
      <h2>Rutas Programmatic SEO</h2>
      <p>Este proyecto usa ISR, cache por tags y paginas on-demand con rutas validas de la base de datos.</p>
      <div className="grid two">
        {examples.map((href) => (
          <Link key={href} href={href} className="card">
            {href}
          </Link>
        ))}
      </div>
    </section>
  );
}