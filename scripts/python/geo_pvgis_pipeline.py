import argparse
import csv
import json
import re
import time
import unicodedata
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional, Tuple
from urllib.parse import urlencode
from urllib.request import urlopen

PVGIS_ENDPOINT = "https://re.jrc.ec.europa.eu/api/v5_2/PVcalc"


@dataclass
class MunicipioRow:
    municipio: str
    provincia: str
    comunidad_autonoma: str
    poblacion: int
    latitud: float
    longitud: float
    codigo_postal: str
    slug: str


def slugify(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value or "")
    ascii_only = normalized.encode("ascii", "ignore").decode("ascii")
    slug = re.sub(r"[^a-zA-Z0-9]+", "-", ascii_only.lower()).strip("-")
    return slug


def detect_delimiter(sample: str) -> str:
    candidates = [";", ",", "\t", "|"]
    counts = {d: sample.count(d) for d in candidates}
    return max(counts, key=counts.get)


def normalize_header(value: str) -> str:
    lowered = (value or "").strip().lower()
    lowered = unicodedata.normalize("NFKD", lowered).encode("ascii", "ignore").decode("ascii")
    return re.sub(r"[^a-z0-9]+", "_", lowered).strip("_")


def pick_value(row: Dict[str, Any], aliases: Iterable[str]) -> Optional[str]:
    for alias in aliases:
        if alias in row and str(row[alias]).strip() != "":
            return str(row[alias]).strip()
    return None


def parse_float(value: Optional[str], default: float = 0.0) -> float:
    if value is None:
        return default
    normalized = value.replace(".", "").replace(",", ".") if value.count(",") == 1 and value.count(".") > 1 else value.replace(",", ".")
    try:
        return float(normalized)
    except ValueError:
        return default


def parse_int(value: Optional[str], default: int = 0) -> int:
    if value is None:
        return default
    digits = re.sub(r"[^0-9-]", "", value)
    if not digits:
        return default
    try:
        return int(digits)
    except ValueError:
        return default


def parse_municipios_csv(content: str, limit: Optional[int]) -> List[MunicipioRow]:
    delimiter = detect_delimiter(content[:5000])
    reader = csv.DictReader(content.splitlines(), delimiter=delimiter)

    normalized_rows: List[MunicipioRow] = []
    for raw_row in reader:
        row = {normalize_header(k): (v or "").strip() for k, v in raw_row.items() if k}

        municipio = pick_value(row, ["municipio", "nombre_municipio", "nombre", "municipality"]) or ""
        provincia = pick_value(row, ["provincia", "nombre_provincia", "province"]) or ""
        comunidad = pick_value(row, ["comunidad_autonoma", "ccaa", "comunidad", "autonomous_community"]) or ""
        poblacion = parse_int(pick_value(row, ["poblacion", "habitantes", "population"]), 0)
        latitud = parse_float(pick_value(row, ["latitud", "latitude", "lat", "y"]), 0.0)
        longitud = parse_float(pick_value(row, ["longitud", "longitude", "lon", "lng", "x"]), 0.0)
        cp = pick_value(row, ["codigo_postal", "cp", "postal_code", "cod_postal"]) or "00000"

        if not municipio or not provincia or not comunidad:
            continue
        if latitud == 0.0 and longitud == 0.0:
            continue

        cp_clean = re.sub(r"[^0-9]", "", cp).zfill(5)[:5] if cp else "00000"
        slug = slugify(municipio)

        normalized_rows.append(
            MunicipioRow(
                municipio=municipio,
                provincia=provincia,
                comunidad_autonoma=comunidad,
                poblacion=poblacion,
                latitud=latitud,
                longitud=longitud,
                codigo_postal=cp_clean,
                slug=slug,
            )
        )

        if limit and len(normalized_rows) >= limit:
            break

    return normalized_rows


def load_source_csv(source: str, timeout: int) -> str:
    if source.startswith("http://") or source.startswith("https://"):
        with urlopen(source, timeout=timeout) as response:
            return response.read().decode("utf-8", errors="replace")

    path = Path(source)
    if not path.exists():
        raise FileNotFoundError(f"CSV source not found: {source}")
    return path.read_text(encoding="utf-8")


def load_cache(cache_file: Path) -> Dict[str, Dict[str, float]]:
    if not cache_file.exists():
        return {}
    try:
        return json.loads(cache_file.read_text(encoding="utf-8"))
    except Exception:
        return {}


def save_cache(cache_file: Path, cache: Dict[str, Dict[str, float]]) -> None:
    cache_file.parent.mkdir(parents=True, exist_ok=True)
    cache_file.write_text(json.dumps(cache, ensure_ascii=False, indent=2), encoding="utf-8")


def cache_key(lat: float, lon: float) -> str:
    return f"{lat:.4f},{lon:.4f}"


def fetch_pvgis(lat: float, lon: float, timeout: int, retries: int, sleep_seconds: float) -> Tuple[Optional[float], Optional[float]]:
    params = {
        "lat": f"{lat:.6f}",
        "lon": f"{lon:.6f}",
        "peakpower": "1",
        "loss": "14",
        "outputformat": "json",
    }

    last_exc: Optional[Exception] = None
    for attempt in range(retries):
        try:
            url = f"{PVGIS_ENDPOINT}?{urlencode(params)}"
            with urlopen(url, timeout=timeout) as response:
                payload = json.loads(response.read().decode("utf-8", errors="replace"))

            annual_prod = payload.get("outputs", {}).get("totals", {}).get("fixed", {}).get("E_y")
            if annual_prod is None:
                return None, None

            annual_prod_value = float(annual_prod)
            equivalent_hours = float(annual_prod)
            time.sleep(sleep_seconds)
            return annual_prod_value, equivalent_hours
        except Exception as exc:
            last_exc = exc
            time.sleep(min(2.0 * (attempt + 1), 6.0))

    print(f"[WARN] PVGIS failed for ({lat}, {lon}): {last_exc}")
    return None, None


def sql_escape(value: str) -> str:
    return value.replace("'", "''")


def build_municipios_sql(rows: List[MunicipioRow]) -> str:
    header = """-- Auto-generated by scripts/python/geo_pvgis_pipeline.py
insert into municipios_dataset_es (
  municipio, provincia, comunidad_autonoma, poblacion, latitud, longitud, codigo_postal, slug
)
values
"""

    values: List[str] = []
    for row in rows:
        values.append(
            f"  ('{sql_escape(row.municipio)}', '{sql_escape(row.provincia)}', '{sql_escape(row.comunidad_autonoma)}', {row.poblacion}, {row.latitud:.6f}, {row.longitud:.6f}, '{row.codigo_postal}', '{sql_escape(row.slug)}')"
        )

    body = ",\n".join(values)
    conflict = """
on conflict (slug) do update set
  municipio = excluded.municipio,
  provincia = excluded.provincia,
  comunidad_autonoma = excluded.comunidad_autonoma,
  poblacion = excluded.poblacion,
  latitud = excluded.latitud,
  longitud = excluded.longitud,
  codigo_postal = excluded.codigo_postal,
  updated_at = now();
"""
    return header + body + conflict


def aggregate_provincia_radiacion(
    rows: List[MunicipioRow],
    pvgis_map: Dict[str, Dict[str, float]],
) -> List[Tuple[str, int, float, float]]:
    acc: Dict[str, Dict[str, float]] = {}

    for row in rows:
        key = cache_key(row.latitud, row.longitud)
        pvgis = pvgis_map.get(key)
        if not pvgis:
            continue

        annual_prod = pvgis.get("annual_prod")
        annual_hours = pvgis.get("annual_hours")
        if annual_prod is None or annual_hours is None:
            continue

        provincia = row.provincia
        if provincia not in acc:
            acc[provincia] = {"prod_sum": 0.0, "hours_sum": 0.0, "count": 0.0}

        acc[provincia]["prod_sum"] += annual_prod
        acc[provincia]["hours_sum"] += annual_hours
        acc[provincia]["count"] += 1.0

    result: List[Tuple[str, int, float, float]] = []
    for provincia, agg in sorted(acc.items(), key=lambda x: x[0].lower()):
        count = max(agg["count"], 1.0)
        avg_prod = agg["prod_sum"] / count
        avg_hours = agg["hours_sum"] / count

        # Proxy simple para irradiacion desde produccion especifica anual.
        irradiacion_proxy = avg_prod / 0.78
        result.append((provincia, int(round(avg_hours)), round(irradiacion_proxy, 1), round(avg_prod, 1)))

    return result


def build_radiacion_sql(records: List[Tuple[str, int, float, float]]) -> str:
    header = """-- Auto-generated by scripts/python/geo_pvgis_pipeline.py
insert into radiacion_solar_provincial_es (
  provincia,
  horas_sol_anuales,
  irradiacion_kwh_m2,
  produccion_media_panel_1kw
)
values
"""

    values: List[str] = []
    for provincia, horas, irradiacion, prod in records:
        values.append(f"  ('{sql_escape(provincia)}', {horas}, {irradiacion:.1f}, {prod:.1f})")

    body = ",\n".join(values)
    conflict = """
on conflict (provincia) do update set
  horas_sol_anuales = excluded.horas_sol_anuales,
  irradiacion_kwh_m2 = excluded.irradiacion_kwh_m2,
  produccion_media_panel_1kw = excluded.produccion_media_panel_1kw,
  updated_at = now();
"""
    return header + body + conflict


def main() -> None:
    parser = argparse.ArgumentParser(description="Automatiza municipios + radiacion PVGIS y genera SQL para Supabase.")
    parser.add_argument("--source-csv", required=True, help="Ruta local o URL del CSV abierto (INE/CNIG u otra fuente).")
    parser.add_argument("--municipios-out", default="data/queries/generated/municipios_espana_dataset.generated.sql")
    parser.add_argument("--radiacion-out", default="data/queries/generated/radiacion_solar_provincial_dataset.generated.sql")
    parser.add_argument("--cache-file", default="data/cache/pvgis_cache.json")
    parser.add_argument("--timeout", type=int, default=30)
    parser.add_argument("--retries", type=int, default=3)
    parser.add_argument("--sleep-seconds", type=float, default=0.20)
    parser.add_argument("--limit", type=int, default=0, help="Limita municipios para pruebas rapidas (0 = sin limite).")
    args = parser.parse_args()

    raw_csv = load_source_csv(args.source_csv, timeout=args.timeout)
    municipios = parse_municipios_csv(raw_csv, limit=(None if args.limit == 0 else args.limit))

    if not municipios:
        raise RuntimeError("No se pudieron parsear municipios validos del CSV fuente.")

    cache_path = Path(args.cache_file)
    cache_data = load_cache(cache_path)

    for idx, row in enumerate(municipios, start=1):
        key = cache_key(row.latitud, row.longitud)
        if key not in cache_data:
            annual_prod, annual_hours = fetch_pvgis(
                row.latitud,
                row.longitud,
                timeout=args.timeout,
                retries=args.retries,
                sleep_seconds=args.sleep_seconds,
            )
            cache_data[key] = {
                "annual_prod": annual_prod if annual_prod is not None else None,
                "annual_hours": annual_hours if annual_hours is not None else None,
            }

        if idx % 250 == 0:
            print(f"[INFO] Procesados {idx}/{len(municipios)} municipios")

    save_cache(cache_path, cache_data)

    radiacion_records = aggregate_provincia_radiacion(municipios, cache_data)
    if not radiacion_records:
        raise RuntimeError("No hay datos de radiacion agregados. Revisa conectividad con PVGIS o coordenadas fuente.")

    municipios_sql = build_municipios_sql(municipios)
    radiacion_sql = build_radiacion_sql(radiacion_records)

    municipios_out = Path(args.municipios_out)
    radiacion_out = Path(args.radiacion_out)
    municipios_out.parent.mkdir(parents=True, exist_ok=True)
    radiacion_out.parent.mkdir(parents=True, exist_ok=True)

    municipios_out.write_text(municipios_sql, encoding="utf-8")
    radiacion_out.write_text(radiacion_sql, encoding="utf-8")

    print(f"[OK] Municipios SQL: {municipios_out}")
    print(f"[OK] Radiacion SQL: {radiacion_out}")
    print(f"[OK] Cache PVGIS: {cache_path}")
    print(f"[OK] Municipios procesados: {len(municipios)}")
    print(f"[OK] Provincias agregadas: {len(radiacion_records)}")


if __name__ == "__main__":
    main()
