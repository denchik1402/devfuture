import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";
import { getAllServiceSlugs } from "@/lib/services";
import { getAllSeoLandingSlugs } from "@/lib/seo-landings";
import { getAllBlogSlugs } from "@/lib/blog";
import { getAllCaseSlugs } from "@/lib/cases";

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

  const cases = getAllCaseSlugs().map((slug) => ({
    url: `${siteConfig.url}/keysy/${slug}`,
    lastModified,
    changeFrequency: "monthly" as const,
    priority: 0.8,
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
      url: `${siteConfig.url}/keysy`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${siteConfig.url}/kak-rabotaem`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${siteConfig.url}/sobrat-scenarij`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.75,
    },
    {
      url: `${siteConfig.url}/brief`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.55,
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
    ...cases,
    ...posts,
  ];
}
