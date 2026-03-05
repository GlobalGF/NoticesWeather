import hashlib
import json
import os
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

import feedparser
import requests
from bs4 import BeautifulSoup
from dateutil import parser as date_parser

KEYWORDS = [
    "autoconsumo",
    "fotovolta",
    "placas solares",
    "energia solar",
    "comunidad energetica",
    "almacenamiento",
    "bateria"
]

DEFAULT_SOURCES_FILE = "scripts/python/subsidies_sources.json"
DEFAULT_OUTPUT_FILE = "data/subsidies_latest.json"


def normalize_text(value: str) -> str:
    text = re.sub(r"\s+", " ", value or "").strip()
    return text


def text_matches_solar(text: str) -> bool:
    lower = (text or "").lower()
    return any(keyword in lower for keyword in KEYWORDS)


def parse_date(value: Optional[str]) -> Optional[str]:
    if not value:
        return None
    try:
        dt = date_parser.parse(value)
        if not dt.tzinfo:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.astimezone(timezone.utc).isoformat()
    except Exception:
        return None


def extract_amount_eur(text: str) -> Optional[float]:
    if not text:
        return None

    # Matches amounts like 12.000,50 EUR or 12000 EUR.
    match = re.search(r"(\d{1,3}(?:[.\s]\d{3})*(?:,\d{1,2})?|\d+(?:,\d{1,2})?)\s*(?:EUR|euros?)", text, re.IGNORECASE)
    if not match:
        return None

    numeric = match.group(1).replace(" ", "").replace(".", "").replace(",", ".")
    try:
        return float(numeric)
    except ValueError:
        return None


def extract_deadline(text: str) -> Optional[str]:
    if not text:
        return None

    patterns = [
        r"(?:hasta\s+el|plazo\s+hasta\s+el)\s+(\d{1,2}/\d{1,2}/\d{2,4})",
        r"(?:hasta\s+el|plazo\s+hasta\s+el)\s+(\d{1,2}-\d{1,2}-\d{2,4})"
    ]
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return parse_date(match.group(1))

    return None


def make_source_hash(source_id: str, title: str, source_url: str) -> str:
    key = f"{source_id}|{title}|{source_url}"
    return hashlib.sha256(key.encode("utf-8")).hexdigest()


def fetch_rss_items(source: Dict[str, Any]) -> List[Dict[str, Any]]:
    parsed = feedparser.parse(source["url"])
    items: List[Dict[str, Any]] = []

    for entry in parsed.entries:
        title = normalize_text(getattr(entry, "title", ""))
        summary = normalize_text(getattr(entry, "summary", ""))
        link = getattr(entry, "link", source["url"])
        published = parse_date(getattr(entry, "published", None) or getattr(entry, "updated", None))

        if not text_matches_solar(f"{title} {summary}"):
            continue

        items.append(
            {
                "source_id": source["id"],
                "issuer_scope": source["scope"],
                "issuer_name": source["name"],
                "region": source["region"],
                "bulletin_name": source["name"],
                "title": title,
                "summary": summary,
                "program_code": None,
                "amount_eur": extract_amount_eur(f"{title} {summary}"),
                "currency": "EUR",
                "published_at": published,
                "deadline_at": extract_deadline(summary),
                "application_url": link,
                "source_url": link,
                "status": "open",
                "raw_payload": {
                    "title": title,
                    "summary": summary,
                    "url": link,
                    "published": published,
                    "source_type": "rss"
                }
            }
        )

    return items


def fetch_html_items(source: Dict[str, Any]) -> List[Dict[str, Any]]:
    response = requests.get(source["url"], timeout=30)
    response.raise_for_status()

    soup = BeautifulSoup(response.text, "html.parser")
    anchors = soup.select("a[href]")
    items: List[Dict[str, Any]] = []

    for anchor in anchors[:250]:
        text = normalize_text(anchor.get_text(" ", strip=True))
        href = anchor.get("href", "")
        if not text or not text_matches_solar(text):
            continue

        if href.startswith("/"):
            link = source["url"].rstrip("/") + href
        elif href.startswith("http"):
            link = href
        else:
            link = source["url"]

        items.append(
            {
                "source_id": source["id"],
                "issuer_scope": source["scope"],
                "issuer_name": source["name"],
                "region": source["region"],
                "bulletin_name": source["name"],
                "title": text,
                "summary": text,
                "program_code": None,
                "amount_eur": extract_amount_eur(text),
                "currency": "EUR",
                "published_at": datetime.now(timezone.utc).isoformat(),
                "deadline_at": extract_deadline(text),
                "application_url": link,
                "source_url": link,
                "status": "open",
                "raw_payload": {
                    "title": text,
                    "url": link,
                    "source_type": "html"
                }
            }
        )

    return items


def collect_sources(sources: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    aggregated: List[Dict[str, Any]] = []

    for source in sources:
        source_type = source.get("type", "rss")
        try:
            if source_type == "rss":
                records = fetch_rss_items(source)
            elif source_type == "html":
                records = fetch_html_items(source)
            else:
                records = []

            aggregated.extend(records)
        except Exception as exc:
            print(f"[WARN] Source failed: {source.get('id')} - {exc}")

    dedup: Dict[str, Dict[str, Any]] = {}
    for item in aggregated:
        item["title"] = normalize_text(item.get("title", ""))
        item["summary"] = normalize_text(item.get("summary", ""))
        item["source_hash"] = make_source_hash(item["source_id"], item["title"], item["source_url"])
        dedup[item["source_hash"]] = item

    return list(dedup.values())


def save_json(items: List[Dict[str, Any]], output_file: str) -> None:
    output_path = Path(output_file)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with output_path.open("w", encoding="utf-8") as fh:
        json.dump({"generated_at": datetime.now(timezone.utc).isoformat(), "items": items}, fh, ensure_ascii=False, indent=2)


def upsert_supabase(items: List[Dict[str, Any]]) -> None:
    supabase_url = os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL")
    service_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

    if not supabase_url or not service_key:
        raise RuntimeError("Missing SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY")

    endpoint = f"{supabase_url}/rest/v1/public_subsidies?on_conflict=source_hash"
    headers = {
        "apikey": service_key,
        "Authorization": f"Bearer {service_key}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates,return=minimal"
    }

    chunk_size = 200
    for i in range(0, len(items), chunk_size):
        chunk = items[i : i + chunk_size]
        response = requests.post(endpoint, headers=headers, json=chunk, timeout=60)
        if response.status_code >= 300:
            raise RuntimeError(f"Supabase upsert failed [{response.status_code}] {response.text}")


def load_sources(path: str) -> List[Dict[str, Any]]:
    with open(path, "r", encoding="utf-8") as fh:
        return json.load(fh)


def main() -> None:
    sources_file = os.getenv("SCRAPER_SOURCES_FILE", DEFAULT_SOURCES_FILE)
    output_file = os.getenv("SCRAPER_OUTPUT_FILE", DEFAULT_OUTPUT_FILE)

    sources = load_sources(sources_file)
    records = collect_sources(sources)

    if not records:
        print("No subsidy records found.")
        return

    save_json(records, output_file)
    upsert_supabase(records)

    print(f"Collected {len(records)} records.")
    print(f"JSON output: {output_file}")


if __name__ == "__main__":
    main()
