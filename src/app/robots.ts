import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/checkout/", "/plan", "/cancel"],
      },
    ],
    sitemap: "https://trydashdiet.com/sitemap.xml",
  };
}
