import fs from "fs";

async function checkWeather(query: string) {
  const url = `https://api.weatherapi.com/v1/current.json?key=07b8f64f184e4a49926123839262303&q=${encodeURIComponent(query)}&lang=es`;
  const res = await fetch(url);
  const data = await res.json();
  fs.writeFileSync(query.replace(/[^a-z]/gi, '') + ".json", JSON.stringify(data, null, 2));
}

async function run() {
  await checkWeather("Gaianes, Alicante, Spain");
}

run();
