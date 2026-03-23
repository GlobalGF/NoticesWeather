"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

/* ── Types ──────────────────────────────────────────────────────── */

export type WeatherData = {
  temp_c: number;
  condition: string;
  icon: string;
  uv: number;
  is_day: number;
  short_rad: number | null;
  ghi: number | null;
  dni: number | null;
  city: string;
  region: string;
  localtime: string;
};

type WeatherContextValue = {
  data: WeatherData | null;
  loading: boolean;
  error: boolean;
};

type CachedWeather = {
  data: WeatherData;
  ts: number;
};

/* ── Constants ──────────────────────────────────────────────────── */

const CACHE_TTL_MS = 30 * 60 * 1000; // 30 min
const FETCH_TIMEOUT_MS = 5_000;

/* ── Context ────────────────────────────────────────────────────── */

const WeatherContext = createContext<WeatherContextValue>({
  data: null,
  loading: true,
  error: false,
});

export function useWeather(): WeatherContextValue {
  return useContext(WeatherContext);
}

/* ── Cache helpers ──────────────────────────────────────────────── */

function cacheKey(slug: string) {
  return `weather:${slug}`;
}

function readCache(slug: string): WeatherData | null {
  try {
    const raw = localStorage.getItem(cacheKey(slug));
    if (!raw) return null;
    const parsed: CachedWeather = JSON.parse(raw);
    if (Date.now() - parsed.ts > CACHE_TTL_MS) {
      localStorage.removeItem(cacheKey(slug));
      return null;
    }
    return parsed.data;
  } catch {
    return null;
  }
}

function writeCache(slug: string, data: WeatherData) {
  try {
    localStorage.setItem(cacheKey(slug), JSON.stringify({ data, ts: Date.now() }));
  } catch {
    // localStorage full or disabled
  }
}

/* ── Provider ───────────────────────────────────────────────────── */

type WeatherProviderProps = {
  municipio: string;
  municipioSlug: string;
  children: ReactNode;
};

export function WeatherProvider({ municipio, municipioSlug, children }: WeatherProviderProps) {
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      // 1. Check localStorage
      const cached = readCache(municipioSlug);
      if (cached) {
        setData(cached);
        setLoading(false);
        // We do NOT return here! We continue to fetch in the background
        // to implement Stale-While-Revalidate so the user gets fresh data.
      }

      // 2. Fetch from API proxy in the background to ensure real-time update
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

        const res = await fetch(`/api/weather/${encodeURIComponent(municipio)}`, {
          signal: controller.signal,
          // Next.js aggressive caching bypass just in case 
          cache: "no-store",
        });
        clearTimeout(timeout);

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const payload: WeatherData = await res.json();
        if (cancelled) return;

        writeCache(municipioSlug, payload);
        setData(payload); // Update the state silently in the background
      } catch (err) {
        if (cancelled) return;
        // Only set error if we didn't have cached data to fall back on
        if (!cached) {
          console.error("[WeatherProvider] fetch error:", err);
          setError(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => { cancelled = true; };
  }, [municipio, municipioSlug]);

  return (
    <WeatherContext.Provider value={{ data, loading, error }}>
      {children}
    </WeatherContext.Provider>
  );
}
