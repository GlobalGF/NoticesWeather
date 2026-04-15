import Link from "next/link";

/**
 * Cross-Silo Provincial Interlinks.
 * 
 * Renders contextual links between the different provincial silos
 * (Placas Solares, Bonificación IBI, Baterías, Subvenciones)
 * to create a "Provincial Topic Cluster" for SEO authority.
 *
 * Usage: Place at the bottom of any provincial landing page.
 */

type SiloLink = {
  href: string;
  label: string;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: React.ReactNode;
};

type Props = {
  provinceName: string;
  provinceSlug: string;
  /** Current silo key — will be excluded from the links rendered */
  currentSilo: "placas" | "ibi" | "baterias" | "subvenciones";
  /** For subvenciones, we need the comunidad slug */
  comunidadSlug?: string;
};

const SUN_ICON = (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
);

const BUILDING_ICON = (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>
);

const BATTERY_ICON = (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="10" x="2" y="7" rx="2" ry="2"/><line x1="22" x2="22" y1="11" y2="13"/></svg>
);

const GIFT_ICON = (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 12 20 22 4 22 4 12"/><rect width="20" height="5" x="2" y="7"/><line x1="12" x2="12" y1="22" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>
);

function buildSiloLinks(
  provinceName: string,
  provinceSlug: string,
  comunidadSlug?: string,
): Record<string, SiloLink> {
  return {
    placas: {
      href: `/placas-solares?provincia=${provinceSlug}`,
      label: `Placas Solares en ${provinceName}`,
      description: "Irradiación, precio de instalación y rendimiento energético",
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200 hover:border-amber-400",
      icon: SUN_ICON,
    },
    ibi: {
      href: `/bonificacion-ibi?provincia=${provinceSlug}`,
      label: `Bonificación IBI en ${provinceName}`,
      description: "Descuentos en el impuesto de bienes inmuebles por autoconsumo",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200 hover:border-purple-400",
      icon: BUILDING_ICON,
    },
    baterias: {
      href: `/baterias-solares?provincia=${provinceSlug}`,
      label: `Baterías Solares en ${provinceName}`,
      description: "Almacenamiento LFP, independencia energética y ahorro nocturno",
      color: "text-fuchsia-600",
      bgColor: "bg-fuchsia-50",
      borderColor: "border-fuchsia-200 hover:border-fuchsia-400",
      icon: BATTERY_ICON,
    },
    subvenciones: {
      href: comunidadSlug
        ? `/subvenciones-solares/${comunidadSlug}/${provinceSlug}`
        : `/subvenciones-solares`,
      label: `Subvenciones Solares en ${provinceName}`,
      description: "Ayudas autonómicas, bonificaciones locales y deducciones IRPF",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200 hover:border-emerald-400",
      icon: GIFT_ICON,
    },
  };
}

export function ProvinceCrossLinks({
  provinceName,
  provinceSlug,
  currentSilo,
  comunidadSlug,
}: Props) {
  const allLinks = buildSiloLinks(provinceName, provinceSlug, comunidadSlug);

  // Exclude the current silo
  const links = Object.entries(allLinks)
    .filter(([key]) => key !== currentSilo)
    .map(([, link]) => link);

  return (
    <section className="mx-auto max-w-5xl px-4 py-10 md:py-14">
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-8 md:p-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              Información relacionada en {provinceName}
            </h2>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Explora otros aspectos de la energía solar en tu provincia</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`group block rounded-2xl border ${link.borderColor} ${link.bgColor} p-5 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`${link.color} opacity-80`}>{link.icon}</div>
                <h3 className={`text-sm font-bold ${link.color} group-hover:underline`}>
                  {link.label}
                </h3>
              </div>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                {link.description}
              </p>
              <div className="mt-3 flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-600 transition-colors">
                <span>Ver detalles</span>
                <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
