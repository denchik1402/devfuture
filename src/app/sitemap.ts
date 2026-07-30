import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";
import { getAllServiceSlugs } from "@/lib/services";
import { getAllSeoLandingSlugs } from "@/lib/seo-landings";
import { getAllBlogSlugs } from "@/lib/blog";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const services = getAllServiceSlugs().map((slug) => ({
    url: `${siteConfig.url}/uslugi/${slug}`,
    lastModified,
    changeFrequency: "monthly" as const,
    priority: 0.85,
  }));

  const landings = getAllSeoLandingSlugs().map((slug) => ({
    url: `${siteConfig.url}/resheniya/${slug}`,
    lastModified,
    changeFrequency: "monthly" as const,
    priority: 0.88,
  }));

  const posts = getAllBlogSlugs().map((slug) => ({
    url: `${siteConfig.url}/blog/${slug}`,
    lastModified,
    changeFrequency: "weekly" as const,
    priority: 0.7,
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
    {
      url: `${siteConfig.url}/resheniya`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${siteConfig.url}/blog`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.75,
    },
    {
      url: `${siteConfig.url}/privacy`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    ...services,
    ...landings,
    ...posts,
  ];
}
