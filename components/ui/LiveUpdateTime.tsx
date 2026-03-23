"use client";

import { useWeather } from "@/components/providers/WeatherProvider";

export function LiveUpdateTime() {
  const { data } = useWeather();
  
  if (!data) return <span>Actualizando tiempo real...</span>;
  
  return <span>Actualizado: {data.localtime} (hora local)</span>;
}
