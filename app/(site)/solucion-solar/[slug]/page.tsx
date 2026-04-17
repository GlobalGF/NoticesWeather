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
      municipioName={data.municipio}
      title={data.seoTitle ?? `Solucion solar para ${data.municipio}`}
      intro={
        data.seoDescription ??
        `Configuracion recomendada para ${data.municipio}, tarifa ${data.tarifaElectrica} y consumo ${data.consumo}.`
      }
      highlights={[
        { label: "Municipio", value: data.municipio },
        { label: "Provincia", value: data.provincia },
        { label: "Tarifa electrica", value: data.tarifaElectrica },
        { label: "Consumo", value: data.consumo },
        { label: "Tecnologia", value: data.tecnologiaSolar }
      ]}
      links={[
        `/placas-solares/${slugify(data.municipio)}`,
        `/baterias-solares/${slugify(data.municipio)}`
      ]}
    />
  );
}
