import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-manrope"
});

export const metadata: Metadata = {
  title: "Energia Solar en Espana",
  description: "Programmatic SEO para energia solar por municipio en Espana.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com")
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={manrope.className}>{children}</body>
    </html>
  );
}