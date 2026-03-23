"use client";

import { WeatherProvider } from "@/components/providers/WeatherProvider";
import { SolarWeatherWidget } from "@/components/ui/SolarWeatherWidget";
import { LiveSolarCalculator } from "@/components/ui/LiveSolarCalculator";
import { CroUrgencyBanner } from "@/components/ui/CroUrgencyBanner";
import { DynamicSeoBlock } from "@/components/ui/DynamicSeoBlock";

/**
 * WeatherSection — Client boundary that wraps all weather-powered widgets.
 *
 * The parent page is a Server Component (force-static), so all client-side
 * weather interactions live inside this boundary. The WeatherProvider ensures
 * only ONE API call per page load, shared across all child widgets.
 */

type WeatherSectionProps = {
  municipio: string;
  municipioSlug: string;
  provincia: string;
  precioMedioLuz: number;
  irradiacionAnual: number | null;
};

export function WeatherSection({
  municipio,
  municipioSlug,
  provincia,
  precioMedioLuz,
  irradiacionAnual,
}: WeatherSectionProps) {
  return (
    <WeatherProvider municipio={municipio} municipioSlug={municipioSlug}>
      {/* 1. CRO Urgency Banner — high visibility, above the fold */}
      <CroUrgencyBanner
        municipio={municipio}
        precioMedioLuz={precioMedioLuz}
      />

      {/* 2. Real-time weather conditions widget */}
      <SolarWeatherWidget municipio={municipio} />

      {/* 3. Dynamic SEO content — unique text per city × time × weather */}
      <DynamicSeoBlock
        municipio={municipio}
        provincia={provincia}
        irradiacionAnual={irradiacionAnual}
        precioMedioLuz={precioMedioLuz}
      />

      {/* 4. Live solar calculator — real-time production + savings */}
      <LiveSolarCalculator
        municipio={municipio}
        precioMedioLuz={precioMedioLuz}
      />
    </WeatherProvider>
  );
}
