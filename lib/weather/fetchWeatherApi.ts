// Simple fetcher for WeatherAPI (server-side)
export async function fetchWeatherApi(city: string) {
  const apiKey = process.env.WEATHERAPI_KEY;
  if (!apiKey) throw new Error("WEATHERAPI_KEY not set");
  const url = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${encodeURIComponent(city)}&lang=es`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("WeatherAPI error: " + res.status);
  return res.json();
}
