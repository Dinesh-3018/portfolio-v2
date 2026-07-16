import type { MetadataRoute } from "next";

const SITE_URL = "https://dineshg.xyz";

/** Allow everything crawlable; keep bots out of the API routes. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/api/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
