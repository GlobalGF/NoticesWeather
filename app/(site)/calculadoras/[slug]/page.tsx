import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getMunicipioBySlug } from "@/lib/data/solar";
import { CalculadorasClient } from "../CalculadorasClient";

export const dynamicParams = true;

type Props = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = params;
  const data = await getMunicipioBySlug(slug);

  if (!data) return { title: "Calculadoras Solares" };

  return {
    title: `Simuladores Energéticos en ${data.municipio}`,
    description: `Suite de calculadoras solares avanzadas para optimizar el autoconsumo y estimar la rentabilidad fotovoltaica en ${data.municipio} (${data.provincia}).`,
  };
}

export default async function CalculadoraMunicipioPage({ params }: Props) {
  const { slug } = params;
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
