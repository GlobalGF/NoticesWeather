// Simple fetcher for WeatherAPI (server-side)
export async function fetchWeatherApi(city: string, province: string, country: string = "Spain") {
  const cityOverrides: Record<string, string> = {
    "Añana": "Anana",
    "anana": "Anana",
  };
  
  // Clean up dual names like "Alicante/Alacant" to just "Alicante"
  const cleanCity = (cityOverrides[city] || cityOverrides[city.toLowerCase()] || city).split(/[\/\-]/)[0].trim();
  const cleanProvince = province.split(/[\/\-]/)[0].trim();

  // Combine them cleanly without slugs!
  const finalQuery = `${cleanCity}, ${cleanProvince}, ${country}`;

  const apiKey = process.env.WEATHERAPI_KEY;
  if (!apiKey) throw new Error("WEATHERAPI_KEY not set");
  
  const url = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${encodeURIComponent(finalQuery)}&lang=es`;
  
  // Cache for 1 hour to prevent lock-in state if server doesn't restart
  const res = await fetch(url, { next: { revalidate: 3600 } });
  
  if (!res.ok) {
    console.error(`WeatherAPI error for query '${finalQuery}': ` + res.status);
    throw new Error("WeatherAPI error: " + res.status);
  }
  
  return res.json();
}
