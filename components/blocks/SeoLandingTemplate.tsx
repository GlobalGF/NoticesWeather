import Link from "next/link";
import { SolarStats } from "@/components/ui/SolarStats";
import { FrankEnergyBanner } from "@/components/ui/FrankEnergyBanner";

type Props = {
  title: string;
  intro: string;
  highlights: Array<{ label: string; value: string }>;
  links?: string[];
  schema?: unknown;
  municipioSlug?: string;
  municipioName?: string;
  showSolarStats?: boolean;
};

export function SeoLandingTemplate({
  title,
  intro,
  highlights,
  links = [],
  schema,
  municipioSlug,
  municipioName,
  showSolarStats = false
}: Props) {
  return (
    <article className="grid">
      <section className="card">
        <h2>{title}</h2>
        <p>{intro}</p>
      </section>

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

      {links.length > 0 ? (
        <section className="card">
          <h3>Enlaces relacionados</h3>
          <ul>
            {links.map((href) => (
              <li key={href}>
                <Link href={href}>{href}</Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {schema ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ) : null}
    </article>
  );
}