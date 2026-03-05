import { getMunicipioEnergiaBySlug } from "@/data/repositories/municipios-energia.repo";
import { getSubsidyByMunicipalityAndProgram } from "@/data/repositories/subsidies.repo";
import { buildAutomatedInternalLinks } from "@/lib/seo/internal-linking";
import { buildServiceSchema } from "@/lib/seo/schema-org";
import { slugify } from "@/lib/utils/slug";
import { mapSubsidyCopy } from "@/modules/subvenciones-solares/mapper";

export async function getSubsidyPageData(
  comunidad: string,
  provincia: string,
  municipio: string,
  programa: string
) {
  const [municipality, subsidy] = await Promise.all([
    getMunicipioEnergiaBySlug(municipio),
    getSubsidyByMunicipalityAndProgram(municipio, programa)
  ]);

  if (!municipality || !subsidy) return null;

  if (slugify(municipality.comunidadAutonoma) !== comunidad || slugify(municipality.provincia) !== provincia) {
    return null;
  }

  const copy = mapSubsidyCopy(municipality, subsidy);
  const links = await buildAutomatedInternalLinks({
    municipioSlug: municipio,
    provincia: municipality.provincia,
    comunidadAutonoma: municipality.comunidadAutonoma
  });

  return {
    ...copy,
    links,
    schema: buildServiceSchema(copy.title, municipality.municipio, copy.intro),
    municipality,
    subsidy
  };
}
