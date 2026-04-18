import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SeoLandingTemplate } from "@/components/blocks/SeoLandingTemplate";
import {
  getPseoSlugBySlug,
  getTopPseoSlugIndexSlugs
} from "@/data/repositories/pseo-slug-index.repo";
import { cachePolicy } from "@/lib/cache/policy";
import { buildMetadata } from "@/lib/seo/metadata-builder";
import { getStaticPrebuildBudget } from "@/lib/pseo/static-budget";
import { tryParseSlug } from "@/lib/utils/params";
import { slugify } from "@/lib/utils/slug";
import { safeGenerateStaticParams } from "@/lib/pseo/safe-static-params";

export const revalidate = cachePolicy.page.genericSolarSlug;
export const dynamicParams = true;

type Props = {
  params: { slug: string };
};

export async function generateStaticParams() {
  return safeGenerateStaticParams(async () => {
    const budget = getStaticPrebuildBudget("PSEO_PREBUILD_SOLUCION_SOLAR", 200);
    const slugs = await getTopPseoSlugIndexSlugs(budget);
    return slugs.map((slug) => ({ slug }));
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = params;
  const parsed = tryParseSlug(slug);
  if (!parsed) return buildMetadata({
    title: "Página no encontrada",
    description: "404 - Esta página no existe",
    pathname: `/solucion-solar/${slug}`,
    noIndex: true
  });

  const data = await getPseoSlugBySlug(parsed);
  if (!data) return buildMetadata({
    title: "Página no encontrada",
    description: "404 - Esta página no existe",
    pathname: `/solucion-solar/${slug}`,
    noIndex: true
  });

  return buildMetadata({
    title: data.seoTitle ?? `Solucion solar en ${data.municipio}`,
    description:
      data.seoDescription ??
      `Analisis solar en ${data.municipio} (${data.provincia}) para tarifa ${data.tarifaElectrica} y consumo ${data.consumo}.`,
    pathname: `/solucion-solar/${data.slug}`
  });
}

export default async function GenericSolarSlugPage({ params }: Props) {
  const { slug } = params;
  const parsed = tryParseSlug(slug);
  if (!parsed) notFound();

  const data = await getPseoSlugBySlug(parsed);
  if (!data) notFound();

  return (
    <SeoLandingTemplate
      municipioSlug={slugify(data.municipio)}
      municipioName={data.municipio}
      header={{
        breadcrumb: `Ofertas / Configuración / ${data.municipio}`,
        label: "Propuesta Personalizada",
        titlePrefix: `Solución Solar para`,
        titleHighlight: `${data.municipio} (${data.provincia})`,
        description: `Configuración recomendada para una vivienda con tarifa ${data.tarifaElectrica} y consumo ${data.consumo}. Maximizamos tu ahorro con tecnología ${data.tecnologiaSolar}.`
      }}
      incentivesCard={{
        title: "DETALLES DE LA SOLUCIÓN",
        rows: [
          { label0: "Consumo Estimado", label1: "Uso mensual medio", value: data.consumo },
          { label0: "Tarifa Base", label1: "Precio de mercado", value: data.tarifaElectrica },
          { label0: "Tecnología", label1: "Tipo de captación", value: data.tecnologiaSolar }
        ],
        cta: "Solicitar Presupuesto Final"
      }}
      mainContent={{
        status: {
          title: `Tu ahorro potencial en ${data.municipio}`,
          desc: `Basándonos en tu perfil de consumo y la radiación solar de ${data.provincia}, hemos diseñado un sistema técnico capaz de reducir tu dependencia de la red eléctrica en más de un 60%.`,
          highlight: data.seoDescription || `Esta solución llave en mano incluye gestión de excedentes y monitorización remota desde el móvil.`
        }
      }}
      sidebarAudit={{
        badge: "VERIFICADO",
        title: "Componentes Premium",
        desc: "Seleccionamos instaladores locales en ${data.provincia} que trabajan con materiales de primera calidad y garantía de 25 años.",
        cta: "Hablar con Asesor"
      }}
      sections={[
        {
          id: 1,
          title: "¿Por qué esta configuración?",
          content: `La combinación de la tarifa ${data.tarifaElectrica} con paneles de tecnología ${data.tecnologiaSolar} permite que los excedentes no consumidos se compensen de forma óptima, reduciendo el término de energía de tu factura a prácticamente cero.`
        }
      ]}
      faqs={[
        {
          question: "¿Se puede ampliar en el futuro?",
          answer: "Sí, el inversor seleccionado permite añadir más paneles o baterías sin necesidad de cambiar todo el equipo principal."
        }
      ]}
      simulation={{
        title: "Calculadora Avanzada",
        desc: "Ajusta tus hábitos de consumo para ver cómo varía la amortización en tiempo real."
      }}
      links={[
        { href: `/placas-solares/${slugify(data.municipio)}`, label: `Placas solares en ${data.municipio}` },
        { href: `/baterias-solares/${slugify(data.municipio)}`, label: `Baterías solares en ${data.municipio}` }
      ]}
    />
  );
}
