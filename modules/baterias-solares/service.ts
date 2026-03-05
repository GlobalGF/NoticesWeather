import { recommendBatteryKwh } from "@/calculators/battery-sizing";
import { getConsumptionBandBySlug, getTariffBySlug } from "@/data/repositories/tariffs.repo";
import { buildServiceSchema } from "@/lib/seo/schema-org";
import { mapBatteryCopy } from "@/modules/baterias-solares/mapper";

export async function getBatteriesPageData(tarifa: string, consumo: string) {
  const [tariff, band] = await Promise.all([getTariffBySlug(tarifa), getConsumptionBandBySlug(consumo)]);
  if (!tariff || !band) return null;

  const recommended = recommendBatteryKwh(band.minKwh, band.maxKwh);
  const copy = mapBatteryCopy(tariff.name, band.slug, recommended);

  return {
    ...copy,
    links: ["/placas-solares/madrid", "/placas-solares/barcelona"],
    schema: buildServiceSchema(copy.title, "Espana", copy.intro)
  };
}