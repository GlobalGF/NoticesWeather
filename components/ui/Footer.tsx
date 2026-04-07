import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-slate-900 border-t border-slate-800 py-12 text-sm text-slate-400">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 pb-8 border-b border-slate-800">
          
          <div className="md:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2 hover:opacity-90 transition-opacity mb-4">
              <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-400"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
                solaryeco
              </span>
            </Link>
            <p className="max-w-xs text-slate-500 mb-4">
              Impulsando la transición energética sostenible en todos los municipios de España mediante datos precisos y opciones de ahorro solar.
            </p>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-3">Portal Energético</h3>
            <ul className="space-y-2">
              <li><Link href="/placas-solares" className="hover:text-blue-400 transition-colors">Energía Solar por Municipio</Link></li>
              <li><Link href="/precio-luz" className="hover:text-blue-400 transition-colors">Precio de la Luz Hoy (PVPC)</Link></li>
              <li><Link href="/presupuesto-solar" className="hover:text-orange-400 font-bold transition-colors">Solicitar Presupuesto Gratis</Link></li>
              <li><Link href="/calculadoras" className="hover:text-blue-400 transition-colors">Simuladores y Calculadoras</Link></li>
              <li><Link href="/sobre-nosotros" className="hover:text-blue-400 transition-colors">Sobre Nosotros / Project Trust</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-3">Legal y Privacidad</h3>
            <ul className="space-y-2">
              <li><Link href="/legal/aviso-legal" className="hover:text-amber-400 transition-colors">Aviso Legal</Link></li>
              <li><Link href="/legal/politica-privacidad" className="hover:text-amber-400 transition-colors">Política de Privacidad</Link></li>
              <li><Link href="/legal/politica-cookies" className="hover:text-amber-400 transition-colors">Política de Cookies</Link></li>
              <li><a href="mailto:contact@globalgrowthframework.dev" className="hover:text-blue-400 transition-colors">Contacto RGPD</a></li>
            </ul>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
          <p>© {currentYear} SolaryEco. Todos los derechos reservados. Red integral de datos de autoconsumo.</p>
          <div className="flex items-center gap-4 text-slate-500">
            <span>Hecho con ♥ para un futuro verde</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
