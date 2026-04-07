import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Página no encontrada",
  description: "La página que buscas no existe. Vuelve al inicio de SolaryEco para encontrar información sobre energía solar en tu municipio.",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <main>
      <h1>Pagina no encontrada</h1>
      <p>La URL solicitada no existe en el indice actual.</p>
      <Link href="/">Volver al inicio</Link>
    </main>
  );
}