/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: ["@supabase/supabase-js"]
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/sitemaps/:page.xml",
        destination: "/sitemaps/:page",
      },
      {
        source: "/sitemaps/sitemap-:comunidad.xml",
        destination: "/sitemaps/sitemap-:comunidad",
      }
    ];
  },
};

export default nextConfig;
