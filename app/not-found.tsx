import Link from "next/link";

export default function NotFound() {
  return (
    <main>
      <h1>Pagina no encontrada</h1>
      <p>La URL solicitada no existe en el indice actual.</p>
      <Link href="/">Volver al inicio</Link>
    </main>
  );
}