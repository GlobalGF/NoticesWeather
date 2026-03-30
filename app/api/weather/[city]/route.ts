import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/weather/[city]
 *
 * Server-side proxy to WeatherAPI. Keeps the API key secret and returns
 * a lean JSON payload with only the fields the SolarWeatherWidget needs.
 *
 * Edge-cached for 5 minutes + stale-while-revalidate 10 min so that
 * 10k–100k pSEO pages hitting the same city share a single upstream call.
 */

export const runtime = "edge";

type Params = {
  params: { city: string };
};

type WeatherApiResponse = {
  current: {
    temp_c: number;
    condition: {
      text: string;
      icon: string;
    };
    uv: number;
    is_day: number;
    /** Shortwave solar radiation — W/m² (Business plan+) */
    short_rad?: number;
    /** Global Tilted Irradiance — W/m² (Business plan+) */
    diff_rad?: number;
    ghi?: number;
    dni?: number;
  };
  location: {
    name: string;
    region: string;
    country: string;
    localtime: string;
  };
};

const CACHE_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
} as const;

export async function GET(_request: NextRequest, { params }: Params) {
  let city = decodeURIComponent(params.city ?? "");
  if (!city) {
    return NextResponse.json(
      { error: "City parameter is required" },
      { status: 400 }
    );
  }

  // WeatherAPI specific overrides
  const cityOverrides: Record<string, string> = {
    "Añana": "Anana-alava",
    "anana": "Anana-alava",
    "anana-arabaalava": "Anana-alava",
  };

  const query = cityOverrides[city] || city;
  const finalQuery = `${query}-spain`;

  const apiKey = process.env.WEATHERAPI_KEY;
  if (!apiKey) {
    console.error("[weather-api] WEATHERAPI_KEY not configured");
    return NextResponse.json(
      { error: "Weather service not configured" },
      { status: 503 }
    );
  }

  const url = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${encodeURIComponent(finalQuery)}&lang=es&aqi=no`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(url, { 
      signal: controller.signal,
      cache: "no-store" 
    });
    clearTimeout(timeout);

    if (!res.ok) {
      console.error(`[weather-api] WeatherAPI responded ${res.status} for city="${city}"`);
      return NextResponse.json(
        { error: "Weather data not available" },
        { status: 503, headers: CACHE_HEADERS }
      );
    }

    const raw: WeatherApiResponse = await res.json();

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
    const isAbort = err instanceof DOMException && err.name === "AbortError";
    console.error(`[weather-api] ${isAbort ? "Timeout" : "Fetch error"} for city="${city}"`, err);
    return NextResponse.json(
      { error: "Weather service temporarily unavailable" },
      { status: 503, headers: CACHE_HEADERS }
    );
  }
}
