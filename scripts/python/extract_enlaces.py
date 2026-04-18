import re
import json
import os

def main():
    if not os.path.exists('tmp_source.html'):
        print("tmp_source.html not found")
        return

    with open('tmp_source.html', 'r', encoding='utf-8') as f:
        data = f.read()

    # The enlaces dict is like "Name" : "url.html"
    # It can span multiple lines or be one big line.
    match = re.search(r'const enlaces\s*=\s*\{(.*?)\};', data, re.DOTALL)
    if not match:
        print("Could not find enlaces object")
        return

    content = match.group(1).strip()
    
    # Simple parser for "Key" : "Value" entries
    enlaces = {}
    # Use regex to find all "Key" : "Value" pairs
    # Handles escaped quotes too
    pairs = re.findall(r'\"(.*?)\"\s*:\s*\"(.*?)\"', content)
    for key, val in pairs:
        enlaces[key] = val

    os.makedirs('data', exist_ok=True)
    with open('data/municipios_enlaces.json', 'w', encoding='utf-8') as f:
        json.dump(enlaces, f, ensure_ascii=False, indent=2)

    print(f"Extracted {len(enlaces)} mapping entries to data/municipios_enlaces.json")

if __name__ == "__main__":
    main()
