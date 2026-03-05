import { estimateAnnualPvProduction } from "@/calculators/pv-production";
import { estimateAnnualSavings } from "@/calculators/savings";
import { getMunicipalityBySlug } from "@/data/repositories/municipalities.repo";
import { getSolarMetricByMunicipalitySlug } from "@/data/repositories/solar.repo";
import { buildAutomatedInternalLinks } from "@/lib/seo/internal-linking";
import { buildServiceSchema } from "@/lib/seo/schema-org";
import { mapPlacasCopy } from "@/modules/placas-solares/mapper";

export async function getPlacasPageData(municipio: string) {
  const municipality = await getMunicipalityBySlug(municipio);
  if (!municipality) return null;

  const irradiance = await getSolarMetricByMunicipalitySlug(municipio);
  const production = estimateAnnualPvProduction(irradiance, 4.5);
  const savings = estimateAnnualSavings(production, 0.65, 0.22);
  const copy = mapPlacasCopy(municipality, production);
  const links = await buildAutomatedInternalLinks({
    municipioSlug: municipality.slug,
    provincia: municipality.province,
    comunidadAutonoma: municipality.autonomousCommunity
  });

  return {
    ...copy,
    highlights: [
      ...copy.highlights,
      { label: "Ahorro anual estimado", value: `${Math.round(savings)} EUR` }
    ],
    links,
    schema: buildServiceSchema(copy.title, municipality.name, copy.intro),
    municipality
  };
}