import { buildMetadata } from "@/lib/seo/metadata-builder";

const YEAR = new Date().getFullYear();

export function radiationMetadata(
  comunidad: string,
  provincia: string,
  municipio: string,
  municipalityName: string
) {
  return buildMetadata({
    title: `Radiación Solar e Irradiación en ${municipalityName} (${YEAR})`,
    description: `Datos de irradiación solar anual en ${municipalityName}: kWh/m², horas de sol, inclinación óptima y producción estimada por kWp instalado.`,
    pathname: `/radiacion-solar/${comunidad}/${provincia}/${municipio}`
  });
}
