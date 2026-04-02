/**
 * FaqAccordion — Server component that renders FAQ items as visible
 * <details>/<summary> elements for SEO and user interaction.
 * 
 * These are visible to Googlebot (SSR) and match the JSON-LD FAQPage schema.
 */

type FaqItem = {
  question: string;
  answer: string;
};

type FaqAccordionProps = {
  faqs: FaqItem[];
  municipio: string;
};

export function FaqAccordion({ faqs, municipio }: FaqAccordionProps) {
  if (!faqs || faqs.length === 0) return null;

  return (
    <section
      className="mt-8 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden"
      aria-label={`Preguntas frecuentes sobre placas solares en ${municipio}`}
    >
      <div className="bg-slate-900 px-6 py-5 flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-400/20 text-amber-400 text-sm">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>
        </span>
        <h2 className="text-xl font-bold text-white">
          Preguntas frecuentes sobre placas solares en {municipio}
        </h2>
      </div>

      <div className="divide-y divide-slate-100">
        {faqs.map((faq, idx) => (
          <details
            key={idx}
            className="group"
            {...(idx === 0 ? { open: true } : {})}
          >
            <summary className="flex cursor-pointer items-center justify-between gap-4 px-6 py-5 text-left font-semibold text-slate-900 hover:bg-slate-50 transition-colors select-none">
              <span className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-xs font-bold">
                  {idx + 1}
                </span>
                <span className="text-sm sm:text-base leading-snug">{faq.question}</span>
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="shrink-0 text-slate-400 transition-transform duration-200 group-open:rotate-180"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </summary>
            <div className="px-6 pb-5 pl-[60px]">
              <p className="text-sm leading-relaxed text-slate-600">{faq.answer}</p>
            </div>
          </details>
        ))}
      </div>

      <div className="px-6 py-3 bg-slate-50 border-t border-slate-100">
        <p className="text-[10px] text-slate-400">
          Información actualizada para {municipio} · {new Date().getFullYear()} · Datos contrastados con fuentes oficiales (PVGIS, IDAE, ordenanzas municipales)
        </p>
      </div>
    </section>
  );
}
