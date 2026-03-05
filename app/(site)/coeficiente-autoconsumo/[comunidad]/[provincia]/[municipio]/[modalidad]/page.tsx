import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SeoLandingTemplate } from "@/components/blocks/SeoLandingTemplate";
import { SharedCoefficientOptimizer } from "@/components/ui/SharedCoefficientOptimizer";
import { getTopMunicipiosEnergiaGeoPaths } from "@/data/repositories/municipios-energia.repo";
import { getTopCoefficientModes } from "@/data/repositories/shared-coefficients.repo";
import { cachePolicy } from "@/lib/cache/policy";
import { getStaticPrebuildBudget } from "@/lib/pseo/static-budget";
import { tryParseSlug } from "@/lib/utils/params";
import { sharedCoefficientMetadata } from "@/modules/coeficiente-autoconsumo/seo";
import { getSharedCoefficientPageData } from "@/modules/coeficiente-autoconsumo/service";

export const revalidate = cachePolicy.page.sharedCoefficient;
export const dynamicParams = true;

type Props = {
  params: Promise<{
    comunidad: string;
    provincia: string;
    municipio: string;
    modalidad: string;
  }>;
};

export async function generateStaticParams() {
  const municipioBudget = getStaticPrebuildBudget("PSEO_PREBUILD_COEFICIENTE_GEO", 500);
  const modeBudget = getStaticPrebuildBudget("PSEO_PREBUILD_COEFICIENTE_MODALIDADES", 2);

  const [geoPaths, modes] = await Promise.all([
    getTopMunicipiosEnergiaGeoPaths(municipioBudget),
    getTopCoefficientModes(modeBudget)
  ]);

  return geoPaths.flatMap((geo) => modes.map((modalidad) => ({ ...geo, modalidad })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { comunidad, provincia, municipio, modalidad } = await params;
  const parsedComunidad = tryParseSlug(comunidad);
  const parsedProvincia = tryParseSlug(provincia);
  const parsedMunicipio = tryParseSlug(municipio);
  const parsedModalidad = tryParseSlug(modalidad);
  if (!parsedComunidad || !parsedProvincia || !parsedMunicipio || !parsedModalidad) return {};

  const data = await getSharedCoefficientPageData(parsedComunidad, parsedProvincia, parsedMunicipio, parsedModalidad);
  if (!data) return {};

  return sharedCoefficientMetadata(
    parsedComunidad,
    parsedProvincia,
    parsedMunicipio,
    parsedModalidad,
    data.municipality.municipio
  );
}

export default async function SharedCoefficientPage({ params }: Props) {
  const { comunidad, provincia, municipio, modalidad } = await params;
  const parsedComunidad = tryParseSlug(comunidad);
  const parsedProvincia = tryParseSlug(provincia);
  const parsedMunicipio = tryParseSlug(municipio);
  const parsedModalidad = tryParseSlug(modalidad);
  if (!parsedComunidad || !parsedProvincia || !parsedMunicipio || !parsedModalidad) notFound();

  const data = await getSharedCoefficientPageData(parsedComunidad, parsedProvincia, parsedMunicipio, parsedModalidad);
  if (!data) notFound();

  return (
    <>
      <SeoLandingTemplate {...data} />
      <section className="card mt-6">
        <h2 className="text-xl font-semibold">Calculadora de coeficiente de reparto</h2>
        <h3 className="mt-1 text-lg font-semibold text-slate-800">Optimiza el reparto para comunidad energetica</h3>
        <div className="mt-4">
          <SharedCoefficientOptimizer municipio={data.municipality.municipio} />
        </div>
      </section>
    </>
  );
}
