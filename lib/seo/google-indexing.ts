import { google } from "google-auth-library";

/**
 * Google Indexing API Helper
 * Used to notify Google about new or updated URLs in the pSEO project.
 * 
 * Required ENV:
 * - GOOGLE_INDEXING_SA_KEY: The JSON string of your Google Service Account key.
 */

export type IndexingAction = "URL_UPDATED" | "URL_DELETED";

export async function notifyGoogleOfUrl(url: string, action: IndexingAction = "URL_UPDATED") {
  const saKeyString = process.env.GOOGLE_INDEXING_SA_KEY;

  if (!saKeyString) {
    console.warn("[GoogleIndexing] GOOGLE_INDEXING_SA_KEY not found in ENV. Skipping...");
    return { success: false, error: "Missing GOOGLE_INDEXING_SA_KEY" };
  }

  try {
    const saKey = JSON.parse(saKeyString);
    
    // Scopes needed: https://www.googleapis.com/auth/indexing
    const jwtClient = new google.auth.JWT(
      saKey.client_email,
      undefined,
      saKey.private_key,
      ["https://www.googleapis.com/auth/indexing"],
      undefined
    );

    const tokens = await jwtClient.authorize();
    
    const response = await fetch("https://indexing.googleapis.com/v3/urlNotifications:publish", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${tokens.access_token}`,
      },
      body: JSON.stringify({
        url: url,
        type: action,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(`[GoogleIndexing] Error for ${url}:`, data);
      return { success: false, error: data };
    }

    console.info(`[GoogleIndexing] Success for ${url}:`, data.urlNotificationMetadata?.latestUpdate?.type);
    return { success: true, data };

  } catch (error: any) {
    console.error(`[GoogleIndexing] Fatal Error for ${url}:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Batch version (Google Indexing API doesn't support true batching in V3, 
 * but we can wrap multiple calls with concurrency control)
 */
export async function notifyGoogleOfUrlBatch(urls: string[], action: IndexingAction = "URL_UPDATED") {
  const results = [];
  // We process in small chunks to avoid rate limits or overwhelming the runtime
  const CHUNK_SIZE = 10;
  
  for (let i = 0; i < urls.length; i += CHUNK_SIZE) {
    const chunk = urls.slice(i, i + CHUNK_SIZE);
    const chunkPromises = chunk.map(url => notifyGoogleOfUrl(url, action));
    const chunkResults = await Promise.all(chunkPromises);
    results.push(...chunkResults);
    
    // Subtle delay between chunks
    if (i + CHUNK_SIZE < urls.length) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  return results;
}
