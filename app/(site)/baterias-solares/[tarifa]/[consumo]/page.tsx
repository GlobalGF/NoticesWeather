import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SeoLandingTemplate } from "@/components/blocks/SeoLandingTemplate";
import { getTopConsumptionBands, getTopTariffs } from "@/data/repositories/tariffs.repo";
import { cachePolicy } from "@/lib/cache/policy";
import { getStaticPrebuildBudget } from "@/lib/pseo/static-budget";
import { tryParseSlug } from "@/lib/utils/params";
import { batteryMetadata } from "@/modules/baterias-solares/seo";
import { getBatteriesPageData } from "@/modules/baterias-solares/service";

export const revalidate = cachePolicy.page.batteries;
export const dynamicParams = true;

type Props = {
  params: Promise<{ tarifa: string; consumo: string }>;
};

export async function generateStaticParams() {
  const tariffsBudget = getStaticPrebuildBudget("PSEO_PREBUILD_TARIFFS", 10);
  const bandsBudget = getStaticPrebuildBudget("PSEO_PREBUILD_CONSUMPTION_BANDS", 10);
  const [tariffs, bands] = await Promise.all([getTopTariffs(tariffsBudget), getTopConsumptionBands(bandsBudget)]);
  return tariffs.flatMap((tariff) => bands.map((band) => ({ tarifa: tariff.slug, consumo: band.slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tarifa, consumo } = await params;
  const parsedTarifa = tryParseSlug(tarifa);
  const parsedConsumo = tryParseSlug(consumo);
  if (!parsedTarifa || !parsedConsumo) return {};
  return batteryMetadata(parsedTarifa, parsedConsumo);
}

export default async function BatteriesPage({ params }: Props) {
  const { tarifa, consumo } = await params;
  const parsedTarifa = tryParseSlug(tarifa);
  const parsedConsumo = tryParseSlug(consumo);
  if (!parsedTarifa || !parsedConsumo) notFound();

  const data = await getBatteriesPageData(parsedTarifa, parsedConsumo);
  if (!data) notFound();
  return <SeoLandingTemplate {...data} />;
}