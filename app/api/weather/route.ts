import { NextRequest, NextResponse } from "next/server";
import { fetchWeatherApi } from "@/lib/weather/fetchWeatherApi";

export const runtime = "edge";

const CACHE_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
} as const;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get("city");
  const province = searchParams.get("province") || "";

  if (!city) {
    return NextResponse.json(
      { error: "City parameter is required" },
      { status: 400 }
    );
  }

  try {
    // Re-use our robust server fetcher
    const raw = await fetchWeatherApi(city, province, "Spain");

    // Fetch supplementary solar radiation from Open-Meteo (GHI & DNI are free here)
    let extraSolar = { ghi: null, dni: null };
    try {
      const lat = raw.location.lat;
      const lon = raw.location.lon;
      const omUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=shortwave_radiation,direct_normal_irradiance&timezone=auto`;
      const omRes = await fetch(omUrl, { next: { revalidate: 900 } }); // 15 min cache
      if (omRes.ok) {
        const omData = await omRes.json();
        extraSolar.ghi = omData.current?.shortwave_radiation ?? null;
        extraSolar.dni = omData.current?.direct_normal_irradiance ?? null;
      }
    } catch (e) {
      console.warn("[WeatherAPI] Open-Meteo solar fetch failed:", e);
    }

    // Return only the fields we need — keep the payload lean (~250 bytes)
    const payload = {
      temp_c: raw.current.temp_c,
      condition: raw.current.condition.text,
      icon: raw.current.condition.icon.startsWith("//")
        ? `https:${raw.current.condition.icon}`
        : raw.current.condition.icon,
      uv: raw.current.uv,
      is_day: raw.current.is_day,
      short_rad: extraSolar.ghi, // Using Open-Meteo for GHI
      ghi: extraSolar.ghi,
      dni: extraSolar.dni,        // Using Open-Meteo for DNI
      city: raw.location.name,
      region: raw.location.region,
      localtime: raw.location.localtime,
    };

    return NextResponse.json(payload, { status: 200, headers: CACHE_HEADERS });
  } catch (err) {
    return NextResponse.json(
      { error: "Weather service temporarily unavailable" },
      { status: 503, headers: CACHE_HEADERS }
    );
  }
}
