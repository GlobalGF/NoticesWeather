import type { Metadata } from "next";

type MetadataInput = {
  title: string;
  description: string;
  pathname: string;
  noIndex?: boolean;
};

const SITE_NAME = "SolaryEco";
const DEFAULT_OG_IMAGE = "/og-default.png";

export function buildMetadata(input: MetadataInput): Metadata {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://solaryeco.es";
  const canonical = `${base}${input.pathname}`;
  const ogImageUrl = `${base}${DEFAULT_OG_IMAGE}`;

  return {
    title: input.title,
    description: input.description,
    alternates: { canonical },
    robots: input.noIndex ? { index: false, follow: true } : undefined,
    openGraph: {
      title: input.title,
      description: input.description,
      url: canonical,
      siteName: SITE_NAME,
      locale: "es_ES",
      type: "article",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: input.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
      site: "@solaryeco",
      images: [ogImageUrl],
    },
  };
}