import Link from "next/link";
import { getTopMunicipiosEnergiaSlugs } from "@/data/repositories/municipios-energia.repo";

const sections = [
  {
    href: "/placas-solares",
    title: "Placas Solares",
    desc: "Guía completa sobre instalación, tipos y ventajas de placas solares en España."
  },
  {
    href: "/baterias-solares",
    title: "Baterías Solares",
    desc: "Información sobre almacenamiento de energía solar, tipos de baterías y dimensionado."
  },
  {
    href: "/autoconsumo-compartido",
    title: "Autoconsumo Compartido",
    desc: "Cómo funciona el autoconsumo colectivo y optimización para comunidades."
  },
  {
    href: "/bonificacion-ibi",
    title: "Bonificación IBI",
    desc: "Consulta las bonificaciones fiscales por instalar energía solar en tu municipio."
  },
  {
    href: "/subvenciones-solares",
    title: "Subvenciones Solares",
    desc: "Accede a las ayudas y subvenciones disponibles para instalaciones solares."
  },
  {
    href: "/normativa-solar",
    title: "Normativa Solar",
    desc: "Resumen de la legislación y normativa vigente sobre energía solar en España."
  },
  {
    href: "/radiacion-solar",
    title: "Radiación Solar",
    desc: "Datos y mapas de radiación solar por municipio y comunidad autónoma."
  },
  {
    href: "/solucion-solar",
    title: "Solución Solar",
    desc: "Calculadoras y herramientas para dimensionar tu instalación solar óptima."
  }
];

export default async function HomePage() {
  const rows = await getTopMunicipiosEnergiaSlugs(6);
  const slugs = rows.map((row) => row.slug).filter(Boolean);
  const examples = slugs.length
    ? [
        { href: `/placas-solares/${slugs[0]}`, label: `Placas solares en ${slugs[0]}` },
        { href: `/bonificacion-ibi/${slugs[1] || slugs[0]}`, label: `Bonificación IBI en ${slugs[1] || slugs[0]}` },
        { href: `/autoconsumo-compartido/${slugs[2] || slugs[0]}`, label: `Autoconsumo compartido en ${slugs[2] || slugs[0]}` }
      ]
    : [];

  return (
    <section className="prose mx-auto max-w-3xl px-4 py-8 md:py-12">
      <h1 className="mb-2">Wiki Solar España</h1>
      <p className="text-lg mb-4">Bienvenido a la enciclopedia de energía solar en España. Explora las principales secciones y accede a recursos, guías y herramientas.</p>

      <nav className="mb-8 border rounded bg-slate-50 p-4">
        <h2 className="text-base font-semibold mb-2">Tabla de contenidos</h2>
        <ul className="list-disc pl-6">
          {sections.map((s) => (
            <li key={s.href}>
              <Link href={s.href} className="font-medium text-blue-700 hover:underline">
                {s.title}
              </Link>
              <span className="ml-2 text-slate-600 text-sm">{s.desc}</span>
            </li>
          ))}
        </ul>
      </nav>

      <h2 className="text-lg font-semibold mb-2">Ejemplos destacados</h2>
      <ul className="list-disc pl-6 mb-8">
        {examples.map((ex) => (
          <li key={ex.href}>
            <Link href={ex.href} className="text-blue-700 hover:underline">{ex.label}</Link>
          </li>
        ))}
      </ul>

      <footer className="mt-10 text-slate-500 text-xs">Proyecto Next.js + Supabase · Actualizado {new Date().getFullYear()}</footer>
    </section>
  );
}