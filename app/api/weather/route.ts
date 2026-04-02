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

    // Return only the fields we need — keep the payload lean (~250 bytes)
    const payload = {
      temp_c: raw.current.temp_c,
      condition: raw.current.condition.text,
      icon: raw.current.condition.icon.startsWith("//")
        ? `https:${raw.current.condition.icon}`
        : raw.current.condition.icon,
      uv: raw.current.uv,
      is_day: raw.current.is_day,
      short_rad: raw.current.short_rad ?? null,
      ghi: raw.current.ghi ?? null,
      dni: raw.current.dni ?? null,
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
