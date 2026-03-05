export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto max-w-6xl px-4 py-6 md:px-6">
      <header className="mb-5">
        <h1 className="text-2xl font-semibold tracking-tight">Solar PSEO Spain</h1>
        <p className="mt-1 text-slate-600">Arquitectura Next.js + Supabase para paginas SEO dinamicas.</p>
      </header>
        {children}
    </main>
  );
}
