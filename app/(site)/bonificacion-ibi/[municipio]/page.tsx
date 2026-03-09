import { notFound } from "next/navigation";
import type { Metadata } from "next";
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
  params: Promise<{ municipio: string }>;
};

export async function generateStaticParams() {
  return safeGenerateStaticParams(async () => {
    const budget = getStaticPrebuildBudget("PSEO_PREBUILD_IBI", 1200);
    const top = await getTopMunicipalitiesByPriority(budget);
    return top.map((m) => ({ municipio: m.slug }));
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { municipio } = await params;
  const parsed = tryParseSlug(municipio);
  if (!parsed) return {};
  const data = await getIbiPageData(parsed);
  if (!data) return {};
  return ibiMetadata(parsed, data.municipality.name);
}

export default async function IbiMunicipioPage({ params }: Props) {
  const { municipio } = await params;
  const parsed = tryParseSlug(municipio);
  if (!parsed) notFound();
  const data = await getIbiPageData(parsed);
  if (!data) notFound();
  return <SeoLandingTemplate {...data} municipioSlug={parsed} showSolarStats />;
}