import { getMunicipioEnergiaBySlug } from "@/data/repositories/municipios-energia.repo";
import { getUrbanRegulationByMunicipalityAndRule } from "@/data/repositories/urban-regulations.repo";
import { buildAutomatedInternalLinks } from "@/lib/seo/internal-linking";
import { buildServiceSchema } from "@/lib/seo/schema-org";
import { slugify } from "@/lib/utils/slug";
import { mapUrbanRegulationCopy } from "@/modules/normativa-solar/mapper";

export async function getUrbanRegulationPageData(
  comunidad: string,
  provincia: string,
  municipio: string,
  norma: string
) {
  const [municipality, regulation] = await Promise.all([
    getMunicipioEnergiaBySlug(municipio),
    getUrbanRegulationByMunicipalityAndRule(municipio, norma)
  ]);

  if (!municipality || !regulation) return null;

  if (slugify(municipality.comunidadAutonoma) !== comunidad || slugify(municipality.provincia) !== provincia) {
    return null;
  }

  const copy = mapUrbanRegulationCopy(municipality, regulation);
  const links = await buildAutomatedInternalLinks({
    municipioSlug: municipio,
    municipioName: municipality.municipio,
    provincia: municipality.provincia,
    comunidadAutonoma: municipality.comunidadAutonoma
  });

  return {
    ...copy,
    links,
    schema: buildServiceSchema(copy.title, municipality.municipio, copy.intro),
    municipality,
    regulation
  };
}
