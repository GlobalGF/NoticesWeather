import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo/metadata-builder";
import { SeoLandingTemplate } from "@/components/blocks/SeoLandingTemplate";
import { getTopMunicipalitiesByPriority } from "@/data/repositories/municipalities.repo";
import { cachePolicy } from "@/lib/cache/policy";
import { getStaticPrebuildBudget } from "@/lib/pseo/static-budget";
import { tryParseSlug } from "@/lib/utils/params";
import { sharedMetadata } from "@/modules/autoconsumo-compartido/seo";
import { getSharedSelfConsumptionPageData } from "@/modules/autoconsumo-compartido/service";
import { safeGenerateStaticParams } from "@/lib/pseo/safe-static-params";

export const revalidate = cachePolicy.page.sharedSelfConsumption;
export const dynamicParams = true;

type Props = {
  params: { municipio: string };
};

export async function generateStaticParams() {
  return safeGenerateStaticParams(async () => {
    const budget = getStaticPrebuildBudget("PSEO_PREBUILD_AUTOCONSUMO", 200);
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
    pathname: `/autoconsumo-compartido/${municipio}`,
    noIndex: true
  });
  const data = await getSharedSelfConsumptionPageData(parsed);
  if (!data) return buildMetadata({
    title: "Página no encontrada",
    description: "404 - Esta página no existe",
    pathname: `/autoconsumo-compartido/${municipio}`,
    noIndex: true
  });
  return sharedMetadata(parsed, data.municipality.name);
}

export default async function SharedSelfConsumptionMunicipioPage({ params }: Props) {
  const { municipio } = params;
  const parsed = tryParseSlug(municipio);
  if (!parsed) notFound();
  const data = await getSharedSelfConsumptionPageData(parsed);
  if (!data) notFound();
  return <SeoLandingTemplate {...data} municipioName={data.municipality.name} municipioSlug={parsed} />;
}