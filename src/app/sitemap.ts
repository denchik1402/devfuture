import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";
import { getAllServiceSlugs } from "@/lib/services";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const services = getAllServiceSlugs().map((slug) => ({
    url: `${siteConfig.url}/uslugi/${slug}`,
    lastModified,
    changeFrequency: "monthly" as const,
    priority: 0.85,
  }));

  return [
    {
      url: siteConfig.url,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteConfig.url}/uslugi`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...services,
  ];
}
