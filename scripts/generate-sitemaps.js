#!/usr/bin/env node

/**
 * Genera sitemaps pSEO desde Supabase (tabla: pseo_slug_index)
 * - Divide en varios ficheros cuando supera 50.000 URLs
 * - Genera sitemap index
 * - Optimizado para Google (loc + lastmod)
 *
 * Variables requeridas:
 *   BASE_URL=https://dominio.com
 *   SUPABASE_URL=https://xxx.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY=sb_secret_xxx
 */

const fs = require("node:fs/promises");
const path = require("node:path");
const { createClient } = require("@supabase/supabase-js");

const MAX_URLS_PER_SITEMAP = 50000;
const FETCH_BATCH_SIZE = 10000;
const OUTPUT_DIR = path.resolve(process.cwd(), "public", "sitemaps");
const INDEX_FILE = path.resolve(process.cwd(), "public", "sitemap.xml");

const BASE_URL = (process.env.BASE_URL || "").trim().replace(/\/$/, "");
const SUPABASE_URL = (process.env.SUPABASE_URL || "").trim();
const SUPABASE_SERVICE_ROLE_KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();

if (!BASE_URL || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error(
    "Missing env vars. Required: BASE_URL, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY"
  );
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

function xmlEscape(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function normalizeLastmod(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

function buildUrlsetXml(entries) {
  const body = entries
    .map((entry) => {
      const lastmod = entry.lastmod ? `<lastmod>${xmlEscape(entry.lastmod)}</lastmod>` : "";
      return `<url><loc>${xmlEscape(entry.loc)}</loc>${lastmod}</url>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</urlset>`;
}

function buildIndexXml(entries) {
  const body = entries
    .map((entry) => {
      const lastmod = entry.lastmod ? `<lastmod>${xmlEscape(entry.lastmod)}</lastmod>` : "";
      return `<sitemap><loc>${xmlEscape(entry.loc)}</loc>${lastmod}</sitemap>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>` +
    `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</sitemapindex>`;
}

async function fetchAllPseoSlugs() {
  const rows = [];
  let from = 0;

  while (true) {
    const to = from + FETCH_BATCH_SIZE - 1;
    const { data, error } = await supabase
      .from("pseo_slug_index")
      .select("slug,updated_at")
      .order("slug", { ascending: true })
      .range(from, to);

    if (error) {
      throw new Error(`Error reading pseo_slug_index: ${error.message}`);
    }

    if (!data || data.length === 0) break;

    rows.push(...data);

    if (data.length < FETCH_BATCH_SIZE) break;
    from += FETCH_BATCH_SIZE;
  }

  return rows;
}

async function main() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  const rows = await fetchAllPseoSlugs();
  if (!rows.length) {
    throw new Error("No rows found in pseo_slug_index");
  }

  const urls = rows
    .filter((row) => row && row.slug)
    .map((row) => ({
      loc: `${BASE_URL}/placas-solares/${String(row.slug).replace(/^\//, "")}`,
      lastmod: normalizeLastmod(row.updated_at)
    }));

  if (!urls.length) {
    throw new Error("No valid slugs found after normalization");
  }

  const sitemapFiles = [];
  const generatedAt = new Date().toISOString();

  for (let i = 0; i < urls.length; i += MAX_URLS_PER_SITEMAP) {
    const chunk = urls.slice(i, i + MAX_URLS_PER_SITEMAP);
    const part = Math.floor(i / MAX_URLS_PER_SITEMAP) + 1;
    const fileName = `sitemap-pseo-${part}.xml`;
    const filePath = path.join(OUTPUT_DIR, fileName);

    await fs.writeFile(filePath, buildUrlsetXml(chunk), "utf8");

    sitemapFiles.push({
      loc: `${BASE_URL}/sitemaps/${fileName}`,
      lastmod: generatedAt
    });
  }

  await fs.writeFile(INDEX_FILE, buildIndexXml(sitemapFiles), "utf8");

  console.log(
    `Sitemap generation complete: ${urls.length} URLs, ${sitemapFiles.length} file(s), index at /sitemap.xml`
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
