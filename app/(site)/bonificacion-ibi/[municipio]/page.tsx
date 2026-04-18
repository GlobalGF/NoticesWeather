import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo/metadata-builder";
import { SeoLandingTemplate } from "@/components/blocks/SeoLandingTemplate";
import { getTopMunicipalitiesByPriority } from "@/data/repositories/municipalities.repo";
import { cachePolicy } from "@/lib/cache/policy";
import { getStaticPrebuildBudget } from "@/lib/pseo/static-budget";
import { tryParseSlug } from "@/lib/utils/params";
import { ibiMetadata } from "@/modules/bonificacion-ibi/seo";
import { getIbiPageData } from "@/modules/bonificacion-ibi/service";
import { safeGenerateStaticParams } from "@/lib/pseo/safe-static-params";

export const revalidate = cachePolicy.page.ibi;
export const dynamicParams = true;

type Props = {
  params: { municipio: string };
};

export async function generateStaticParams() {
  return safeGenerateStaticParams(async () => {
    const budget = getStaticPrebuildBudget("PSEO_PREBUILD_IBI", 300);
    const top = await getTopMunicipalitiesByPriority(budget);
    return top.map((m) => ({ municipio: m.slug }));
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { municipio } = params;
  const parsed = tryParseSlug(municipio);
  if (!parsed) return buildMetadata({
    title: "Página no encontrada",
    description: "404 - Esta página no existe",
    pathname: `/bonificacion-ibi/${municipio}`,
    noIndex: true
  });
  const data = await getIbiPageData(parsed);
  if (!data) return buildMetadata({
    title: "Página no encontrada",
    description: "404 - Esta página no existe",
    pathname: `/bonificacion-ibi/${municipio}`,
    noIndex: true
  });
  return ibiMetadata(parsed, data.municipality.municipio);
}

export default async function IbiMunicipioPage({ params }: Props) {
  const { municipio } = params;
  const parsed = tryParseSlug(municipio);
  if (!parsed) notFound();
  const data = await getIbiPageData(parsed);
  if (!data) notFound();
  return <SeoLandingTemplate {...data} municipioName={data.municipality.municipio} municipioSlug={parsed} />;
}