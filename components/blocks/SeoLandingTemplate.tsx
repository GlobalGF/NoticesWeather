import Link from "next/link";
import { SolarStats } from "@/components/ui/SolarStats";
import { FrankEnergyBanner } from "@/components/ui/FrankEnergyBanner";
import { InternalLink } from "@/lib/seo/internal-linking";
import { ProgrammaticUrgencyStatus } from "@/components/ui/ProgrammaticUrgencyStatus";

type Props = {
  title: string;
  intro: string;
  highlights: Array<{ label: string; value: string }>;
  links?: InternalLink[];
  schema?: unknown;
  municipioSlug?: string;
  municipioName?: string;
  showSolarStats?: boolean;
  showUrgencyStatus?: boolean;
};

export function SeoLandingTemplate({
  title,
  intro,
  highlights,
  links = [],
  schema,
  municipioSlug,
  municipioName,
  showSolarStats = false,
  showUrgencyStatus = true // Default to true for better CTR
}: Props) {
  const localLinks = links.filter(l => !l.isNearby);
  const nearbyLinks = links.filter(l => l.isNearby);

  return (
    <article className="grid">
      <section className="card">
        <h2>{title}</h2>
        <p>{intro}</p>
      </section>

      {municipioName && showUrgencyStatus && (
        <div className="mt-4">
          <ProgrammaticUrgencyStatus municipio={municipioName} />
        </div>
      )}

      {municipioSlug && showSolarStats ? <SolarStats slug={municipioSlug} className="mt-4" title="Metricas solares" /> : null}

      {municipioName && (
        <div className="mt-6">
          <FrankEnergyBanner municipio={municipioName} />
        </div>
      )}

      <section className="grid two">
        {highlights.map((item) => (
          <div key={item.label} className="card">
            <span className='font-bold'>{item.label}</span>
            <p>{item.value}</p>
          </div>
        ))}
      </section>

      {/* Local Silo Links */}
      {localLinks.length > 0 ? (
        <section className="card mt-8">
          <h3 className="text-xl font-bold mb-4">Recursos en {municipioName || "tu localidad"}</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {localLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href}
                className="flex items-center p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-indigo-200 hover:shadow-md transition-all group"
              >
                <span className="text-sm font-medium text-slate-700 group-hover:text-indigo-600">
                  {link.label}
                </span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {/* Nearby Links - Auth transfer */}
      {nearbyLinks.length > 0 ? (
        <section className="card mt-8">
          <h3 className="text-xl font-bold mb-4">Municipios cercanos con las mismas ayudas</h3>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {nearbyLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href}
                className="flex items-center justify-center p-3 rounded-lg border border-slate-200 bg-white hover:border-emerald-200 hover:bg-emerald-50/30 transition-all group text-center"
              >
                <span className="text-xs font-semibold text-slate-600 group-hover:text-emerald-700">
                   {link.label}
                </span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {schema ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ) : null}
    </article>
  );
}