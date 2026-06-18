import { PROVINCES_METADATA } from "../lib/data/provinces-metadata";

async function checkImages() {
    console.log("Checking background images in PROVINCES_METADATA...");
    const entries = Object.entries(PROVINCES_METADATA);
    console.log(`Found ${entries.length} provinces.`);
    
    let failedCount = 0;
    
    for (const [slug, data] of entries) {
        const url = data.backgroundUrl;
        if (!url) {
            console.log(`❌ Province ${slug} has no backgroundUrl.`);
            failedCount++;
            continue;
        }
        
        try {
            const res = await fetch(url, { 
                method: "GET", 
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                }
            });
            if (res.status !== 200) {
                console.log(`❌ Province ${slug} image failed: HTTP ${res.status} - ${url}`);
                failedCount++;
            } else {
                console.log(`✅ Province ${slug} image OK: HTTP 200`);
            }
        } catch (err: any) {
            console.log(`❌ Province ${slug} image failed: Error: ${err.message} - ${url}`);
            failedCount++;
        }
    }
    
    console.log("\n--- Summary ---");
    console.log(`Total checked: ${entries.length}`);
    console.log(`Passed: ${entries.length - failedCount}`);
    console.log(`Failed: ${failedCount}`);
}

checkImages();
