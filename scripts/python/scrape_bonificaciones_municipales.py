import os
import json
import re
import requests
from bs4 import BeautifulSoup
from dotenv import load_dotenv

load_dotenv(dotenv_path='.env')
load_dotenv(dotenv_path='.env.local', override=True)

SUPABASE_URL = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Error: Falta SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env/.env.local")
    exit(1)

OUTPUT_FILE = "data/scraped_bonificaciones.json"

def clean_slug(value: str) -> str:
    value = value.lower()
    value = value.replace('á', 'a').replace('é', 'e').replace('í', 'i').replace('ó', 'o').replace('ú', 'u')
    value = value.replace('ñ', 'n')
    value = re.sub(r'[^a-z0-9\-]', '-', value)
    value = re.sub(r'-+', '-', value)
    return value.strip('-')

def get_canonical_ccaa(ccaa: str) -> str:
    name = ccaa.lower()
    if "castilla" in name and "leon" in name: return "castilla-y-leon"
    if "castilla" in name and "mancha" in name: return "castilla-la-mancha"
    if "illes balears" in name or "islas baleares" in name: return "illes-balears"
    if "valenciana" in name: return "comunitat-valenciana"
    if "madrid" in name: return "comunidad-de-madrid"
    if "murcia" in name: return "region-de-murcia"
    if "navarra" in name: return "comunidad-foral-de-navarra"
    if "asturias" in name: return "principado-de-asturias"
    if "catalunya" in name or "cataluña" in name or "cataluna" in name: return "cataluna"
    if "vasco" in name or "euskadi" in name: return "pais-vasco"
    if "rioja" in name: return "la-rioja"
    if "canarias" in name: return "canarias"
    if "aragon" in name: return "aragon"
    if "extremadura" in name: return "extremadura"
    if "galicia" in name: return "galicia"
    if "cantabria" in name: return "cantabria"
    if "andalucia" in name: return "andalucia"
    
    return clean_slug(ccaa)

def clean_muni_slug(muni_slug: str, prov_slug: str) -> str:
    # Most URLs use the base name. Example: piera-barcelona-cataluna.
    # If the DB slug is 'piera-barcelona', we need 'piera'.
    if muni_slug.endswith(f"-{prov_slug}"):
        base = muni_slug[:-len(prov_slug)-1]
        if base: return base
    return muni_slug

def get_all_municipios():
    print(f"Fetching municipalities from {SUPABASE_URL}/rest/v1/municipios_energia...")
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Range-Unit": "items"
    }
    
    all_data = []
    offset = 0
    limit = 1000
    
    while True:
        headers["Range"] = f"{offset}-{offset+limit-1}"
        # Fetching all, ordered by habitants descending to hit larger cities first
        res = requests.get(f"{SUPABASE_URL}/rest/v1/municipios_energia?select=slug,municipio,provincia,comunidad_autonoma&order=habitantes.desc", headers=headers)
        if res.status_code >= 400:
            print("Error fetching:", res.text)
            break
            
        data = res.json()
        if not data:
            break
            
        all_data.extend(data)
        offset += limit
        
    print(f"Total municipalities found: {len(all_data)}")
    return all_data

# Load links mapping once
LINKS_MAPPING = {}
try:
    if os.path.exists('data/municipios_enlaces.json'):
        with open('data/municipios_enlaces.json', 'r', encoding='utf-8') as f:
            LINKS_MAPPING = json.load(f)
except Exception as e:
    print(f"Warning: could not load links mapping: {e}")

# Normalize mapping once for better matching
NORMALIZED_MAPPING = {}
for key, val in LINKS_MAPPING.items():
    norm_key = re.sub(r'[^a-z0-9]', '', key.lower())
    NORMALIZED_MAPPING[norm_key] = val

def scrape_bonificaciones(muni_data):
    m_name = muni_data['municipio']
    # Try exact match, then normalized match
    url = None
    if m_name in LINKS_MAPPING:
        url = f"https://fundacionrenovables.org/autoconsumo/ibi-icio-iae/{LINKS_MAPPING[m_name]}"
    else:
        norm_m_name = re.sub(r'[^a-z0-9]', '', m_name.lower())
        if norm_m_name in NORMALIZED_MAPPING:
            url = f"https://fundacionrenovables.org/autoconsumo/ibi-icio-iae/{NORMALIZED_MAPPING[norm_m_name]}"
        else:
            # Fallback for bilingual names with / or ( )
            parts = re.split(r'[/()]', m_name)
            for p in parts:
                p_norm = re.sub(r'[^a-z0-9]', '', p.strip().lower())
                if p_norm in NORMALIZED_MAPPING:
                    url = f"https://fundacionrenovables.org/autoconsumo/ibi-icio-iae/{NORMALIZED_MAPPING[p_norm]}"
                    break
    
    if not url:
        # Final fallback to generated slug
        ccaa_slug = get_canonical_ccaa(muni_data['comunidad_autonoma'])
        prov_slug = clean_slug(muni_data['provincia'])
        
        if ccaa_slug in ['ceuta', 'melilla']:
            ccaa_slug = f"{ccaa_slug}-{ccaa_slug}"
        if prov_slug in ['ceuta', 'melilla']:
            prov_slug = f"{prov_slug}-{prov_slug}"
            
        m_slug = clean_muni_slug(muni_data['slug'], prov_slug)
        url = f"https://fundacionrenovables.org/autoconsumo/ibi-icio-iae/bonificaciones-ibi-icio-iae-{m_slug}-{prov_slug}-{ccaa_slug}.html"
    
    try:
        res = requests.get(url, timeout=10)
    except Exception as e:
        return {"status": "error", "message": str(e), "url": url}
    
    if res.status_code == 404:
        return {"status": "skip", "message": "Municipality not found in source", "url": url}
    if res.status_code >= 400:
        return {"status": f"error_{res.status_code}", "url": url}
        
    soup = BeautifulSoup(res.text, "html.parser")
    
    data = {
        "url": url,
        "status": "success",
        "ibi_pct": None,
        "ibi_years": None,
        "ibi_conditions": None,
        "icio_pct": None,
        "icio_years": None,
        "icio_conditions": None,
        "iae_pct": None,
        "iae_years": None,
        "iae_conditions": None
    }
    
    # The cards use itemprop microdata
    # We find cards by looking for the image alt text in the header
    for card in soup.select('.card'):
        header = card.select_one('.card-header img')
        if not header: continue
        
        tax_type = header.get('alt', '').lower() # 'ibi', 'icio', or 'iae'
        if tax_type not in ['ibi', 'icio', 'iae']: continue
        
        # Percentage
        price_span = card.select_one('[itemprop="price"]')
        if price_span:
            pct_txt = price_span.get_text()
            m = re.search(r'(\d+)', pct_txt)
            if m: data[f"{tax_type}_pct"] = int(m.group(1))
            
        # Duration
        dur_span = card.select_one('[itemprop="eligibleDuration"]')
        if dur_span:
            dur_txt = dur_span.get_text()
            m = re.search(r'(\d+)', dur_txt)
            if m: data[f"{tax_type}_years"] = int(m.group(1))
            
        # Conditions
        cond_val = card.select_one('[itemprop="value"]')
        if cond_val:
            conds = cond_val.get_text().strip()
            if conds and conds != '-':
                data[f"{tax_type}_conditions"] = conds
        
    return data


def main():
    import time
    municipios = get_all_municipios()
    
    valid_results = []
    
    import urllib3
    urllib3.disable_warnings()

    # Limit to top 11000 for testing, change to len(municipios) to do everything
    limit = 11000 
    print(f"Scraping top {limit} municipalities...")
    
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    
    for idx, m in enumerate(municipios[:limit]):
        # Safer print for different terminals
        try:
            m_display = m['municipio']
            print(f"[{idx+1}/{limit}] {m_display}...")
        except UnicodeEncodeError:
            print(f"[{idx+1}/{limit}] {m['municipio'].encode('ascii', 'ignore').decode('ascii')}...")
            
        result = scrape_bonificaciones(m)
        if result['status'] == 'success':
            doc = {
                "slug": m['slug'],
                "municipio": m['municipio'],
                "provincia": m['provincia'],
                "data": result
            }
            valid_results.append(doc)
            print(f"  [OK] IBI: {result['ibi_pct']}% | ICIO: {result['icio_pct']}%")
            
            # Send PATCH to Supabase
            patch_data = {}
            if result['ibi_pct'] is not None: patch_data['bonificacion_ibi'] = result['ibi_pct']
            if result['ibi_years'] is not None: patch_data['bonificacion_ibi_duracion'] = result['ibi_years']
            if result['ibi_conditions'] is not None: patch_data['bonificacion_ibi_condiciones'] = result['ibi_conditions']
            if result['icio_pct'] is not None: patch_data['bonificacion_icio'] = result['icio_pct']
            if result['icio_conditions'] is not None: patch_data['bonificacion_icio_condiciones'] = result['icio_conditions']
            if result['iae_pct'] is not None: patch_data['bonificacion_iae'] = result['iae_pct']
            if result['iae_years'] is not None: patch_data['bonificacion_iae_duracion'] = result['iae_years']
            if result['iae_conditions'] is not None: patch_data['bonificacion_iae_condiciones'] = result['iae_conditions']
                
            if patch_data:
                patch_headers = {
                    "apikey": SUPABASE_KEY,
                    "Authorization": f"Bearer {SUPABASE_KEY}",
                    "Content-Type": "application/json",
                    "Prefer": "return=minimal"
                }
                patch_url = f"{SUPABASE_URL}/rest/v1/municipios_energia?slug=eq.{m['slug']}"
                patch_res = requests.patch(patch_url, headers=patch_headers, json=patch_data)
                if patch_res.status_code >= 300:
                    print(f"  [WARN] Failed to patch DB: {patch_res.text}")
                    
        elif result['status'] == 'skip':
            print(f"  - No encontrado en fuente (404)")
        else:
            print(f"  [ERR] {result['status']} | {result.get('message', '')}")
            
        time.sleep(0.5)
        
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(valid_results, f, ensure_ascii=False, indent=2)
        
    print(f"[OK] Exported {len(valid_results)} records to {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
