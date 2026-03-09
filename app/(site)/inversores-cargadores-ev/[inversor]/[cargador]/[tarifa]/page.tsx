import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SeoLandingTemplate } from "@/components/blocks/SeoLandingTemplate";
import { getTopCompatibilityCombos } from "@/data/repositories/inverter-ev.repo";
import { cachePolicy } from "@/lib/cache/policy";
import { getStaticPrebuildBudget } from "@/lib/pseo/static-budget";
import { tryParseSlug } from "@/lib/utils/params";
import { inverterEvMetadata } from "@/modules/inversores-cargadores-ev/seo";
import { getInverterEvPageData } from "@/modules/inversores-cargadores-ev/service";
import { safeGenerateStaticParams } from "@/lib/pseo/safe-static-params";

export const revalidate = cachePolicy.page.compatibility;
export const dynamicParams = true;

type Props = {
  params: Promise<{ inversor: string; cargador: string; tarifa: string }>;
};

export async function generateStaticParams() {
  return safeGenerateStaticParams(async () => {
    const budget = getStaticPrebuildBudget("PSEO_PREBUILD_COMPATIBILIDAD_EV", 300);
    return getTopCompatibilityCombos(budget);
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { inversor, cargador, tarifa } = await params;
  const parsedInversor = tryParseSlug(inversor);
  const parsedCargador = tryParseSlug(cargador);
  const parsedTarifa = tryParseSlug(tarifa);
  if (!parsedInversor || !parsedCargador || !parsedTarifa) return {};

  const data = await getInverterEvPageData(parsedInversor, parsedCargador, parsedTarifa);
  if (!data) return {};

  return inverterEvMetadata(parsedInversor, parsedCargador, parsedTarifa);
}

export default async function InverterEvPage({ params }: Props) {
  const { inversor, cargador, tarifa } = await params;
  const parsedInversor = tryParseSlug(inversor);
  const parsedCargador = tryParseSlug(cargador);
  const parsedTarifa = tryParseSlug(tarifa);
  if (!parsedInversor || !parsedCargador || !parsedTarifa) notFound();

  const data = await getInverterEvPageData(parsedInversor, parsedCargador, parsedTarifa);
  if (!data) notFound();

  return <SeoLandingTemplate {...data} />;
}
