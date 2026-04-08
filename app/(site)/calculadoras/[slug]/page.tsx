import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getMunicipioBySlug } from "@/lib/data/solar";
import { isBlockedSlug } from "@/lib/utils/validate-slug";
import { CalculadorasClient } from "../CalculadorasClient";

export const dynamicParams = true;
export const revalidate = 86400;

type Props = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = params;
  if (isBlockedSlug(slug)) notFound();
  const data = await getMunicipioBySlug(slug);

  if (!data) return { title: "Calculadoras Solares" };

  return {
    title: `Calculadoras Solares en ${data.municipio} (${data.provincia}) — Simulador Fotovoltaico`,
    description: `Calcula el número de paneles, dimensiona baterías y estima el ahorro anual de tu instalación solar en ${data.municipio}, ${data.provincia}. Datos reales de irradiación y precios locales.`,
  };
}

export default async function CalculadoraMunicipioPage({ params }: Props) {
  const { slug } = params;
  if (isBlockedSlug(slug)) notFound();
  const data = await getMunicipioBySlug(slug);

  if (!data) notFound();

  return (
    <CalculadorasClient
      municipioNombre={data.municipio}
      horasSolAnuales={data.horas_sol ?? 2500}
      costeMedio={data.precio_instalacion_medio_eur ?? 5000}
      ahorroAnual={data.ahorro_estimado ?? 800}
    />
  );
}
