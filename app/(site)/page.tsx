import Link from "next/link";

const examples = [
  "/placas-solares/madrid",
  "/bonificacion-ibi/valencia",
  "/autoconsumo-compartido/sevilla",
  "/baterias-solares/2-0td/4000-5500",
  "/subvenciones-solares/comunidad-de-madrid/madrid/madrid/nextgen-autoconsumo",
  "/normativa-solar/comunidad-de-madrid/madrid/madrid/licencia-obras",
  "/inversores-cargadores-ev/huawei-sun2000/wallbox-pulsar-plus/2-0td",
  "/radiacion-solar/comunidad-de-madrid/madrid/madrid",
  "/coeficiente-autoconsumo/comunidad-de-madrid/madrid/madrid/reparto-estatico"
];

export default function HomePage() {
  return (
    <section className="card">
      <h2>Rutas Programmatic SEO</h2>
      <p>Este proyecto usa ISR, cache por tags y paginas on-demand.</p>
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