import { getMunicipioEnergiaBySlug } from "@/data/repositories/municipios-energia.repo";
import { getSharedCoefficientByMunicipalityAndMode } from "@/data/repositories/shared-coefficients.repo";
import { buildAutomatedInternalLinks } from "@/lib/seo/internal-linking";
import { buildServiceSchema } from "@/lib/seo/schema-org";
import { slugify } from "@/lib/utils/slug";
import { mapSharedCoefficientCopy } from "@/modules/coeficiente-autoconsumo/mapper";

export async function getSharedCoefficientPageData(
  comunidad: string,
  provincia: string,
  municipio: string,
  modalidad: string
) {
  const [municipality, coefficient] = await Promise.all([
    getMunicipioEnergiaBySlug(municipio),
    getSharedCoefficientByMunicipalityAndMode(municipio, modalidad)
  ]);

  if (!municipality || !coefficient) return null;

  if (slugify(municipality.comunidadAutonoma) !== comunidad || slugify(municipality.provincia) !== provincia) {
    return null;
  }

  const copy = mapSharedCoefficientCopy(municipality, coefficient);
  const links = await buildAutomatedInternalLinks({
    municipioSlug: municipio,
    municipioName: municipality.municipio,
    provincia: municipality.provincia,
    comunidadAutonoma: municipality.comunidadAutonoma
  });

  return {
    ...copy,
    links,
    schema: buildServiceSchema(`${copy.header.titlePrefix} ${copy.header.titleHighlight}`, municipality.municipio, copy.header.description),
    municipality,
    coefficient
  };
}
