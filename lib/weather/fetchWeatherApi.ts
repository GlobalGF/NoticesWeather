// Simple fetcher for WeatherAPI (server-side)
export async function fetchWeatherApi(city: string) {
  const cityOverrides: Record<string, string> = {
    "Añana": "Anana-alava",
    "anana": "Anana-alava",
    "anana-arabaalava": "Anana-alava",
  };
  const query = cityOverrides[city] || cityOverrides[city.toLowerCase()] || city;
  const finalQuery = `${query}-spain`;

  const apiKey = process.env.WEATHERAPI_KEY;
  if (!apiKey) throw new Error("WEATHERAPI_KEY not set");
  const url = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${encodeURIComponent(finalQuery)}&lang=es`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("WeatherAPI error: " + res.status);
  return res.json();
}
