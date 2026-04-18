import { buildMetadata } from "@/lib/seo/metadata-builder";

const YEAR = new Date().getFullYear();

export function subsidyMetadata(
  comunidad: string,
  provincia: string,
  municipio: string,
  municipalityName: string,
  programName: string
) {
  return buildMetadata({
    title: `Subvenciones Placas Solares en ${municipalityName} ${YEAR}: Ahorra hasta un 70%`,
    description: `Solicita las ayudas del programa ${programName} para placas solares en ${municipalityName}. Consulta requisitos, importes y ahorra hasta un 70% en tu instalación de autoconsumo.`,
    pathname: `/subvenciones-solares/${comunidad}/${provincia}/${municipio}`
  });
}

