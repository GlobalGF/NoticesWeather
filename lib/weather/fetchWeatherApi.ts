// Simple fetcher for WeatherAPI (server-side)
export async function fetchWeatherApi(city: string, province: string, country: string = "Spain") {
  const cityOverrides: Record<string, string> = {
    "Añana": "Anana",
    "anana": "Anana",
  };
  
  // EXTRA ROBUSTNESS: Guard against null/undefined inputs
  const safeCity = city || "Madrid"; // Fallback to a known city if null
  const safeProvince = province || "";

  // Clean up dual names like "Alicante/Alacant" to just "Alicante"
  const cleanCity = (cityOverrides[safeCity] || cityOverrides[safeCity.toLowerCase()] || safeCity).split(/[\/\-]/)[0].trim();
  const cleanProvince = safeProvince.split(/[\/\-]/)[0].trim();

  // Combine them cleanly without slugs!
  const finalQuery = `${cleanCity}, ${cleanProvince}, ${country}`;

  const apiKey = process.env.WEATHERAPI_KEY;
  if (!apiKey) throw new Error("WEATHERAPI_KEY not set");
  
  const url = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${encodeURIComponent(finalQuery)}&lang=es`;
  
  // Use revalidate instead of no-store to be compatible with static generation
  const res = await fetch(url, { next: { revalidate: 3600 } });
  
  if (!res.ok) {
    console.error(`WeatherAPI error for query '${finalQuery}': ` + res.status);
    throw new Error("WeatherAPI error: " + res.status);
  }
  
  return res.json();
}
