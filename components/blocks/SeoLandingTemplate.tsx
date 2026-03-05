import Link from "next/link";

type Props = {
  title: string;
  intro: string;
  highlights: Array<{ label: string; value: string }>;
  links?: string[];
  schema?: unknown;
};

export function SeoLandingTemplate({ title, intro, highlights, links = [], schema }: Props) {
  return (
    <article className="grid">
      <section className="card">
        <h2>{title}</h2>
        <p>{intro}</p>
      </section>

      <section className="grid two">
        {highlights.map((item) => (
          <div key={item.label} className="card">
            <strong>{item.label}</strong>
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