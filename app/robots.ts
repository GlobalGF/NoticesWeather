import type { MetadataRoute } from "next";
import { BASE_URL } from "@/lib/seo/seo-config";

export default function robots(): MetadataRoute.Robots {
  const base = BASE_URL;

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: "/precio-luz/*/",  // municipio pages 301'd to /placas-solares/*
      },
    ],
    sitemap: [`${base}/sitemap_index.xml`]
  };
}