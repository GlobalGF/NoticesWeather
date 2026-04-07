import type { Metadata } from "next";

type MetadataInput = {
  title: string;
  description: string;
  pathname: string;
};

export function buildMetadata(input: MetadataInput): Metadata {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";
  const canonical = `${base}${input.pathname}`;

  return {
    title: input.title,
    description: input.description,
    alternates: { canonical },
    openGraph: {
      title: input.title,
      description: input.description,
      url: canonical,
      type: "article"
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
    },
  };
}