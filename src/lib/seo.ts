import { siteConfig } from "@/lib/site";

export function buildOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${siteConfig.url}/#organization`,
    name: siteConfig.name,
    legalName: siteConfig.legalName,
    url: siteConfig.url,
    description: siteConfig.description,
    ...(siteConfig.phone
      ? { telephone: siteConfig.phone.replace(/[^\d+]/g, "") }
      : {}),
    image: `${siteConfig.url}/opengraph-image`,
    logo: {
      "@type": "ImageObject",
      url: `${siteConfig.url}/icon.svg`,
    },
    areaServed: {
      "@type": "Country",
      name: "Russia",
    },
    availableLanguage: ["Russian", "ru"],
    priceRange: "$$",
    sameAs: [...siteConfig.sameAs],
    knowsAbout: [...siteConfig.services],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Услуги DevFuture",
      itemListElement: siteConfig.services.map((name, i) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name,
        },
        position: i + 1,
      })),
    },
  };
}

export function buildWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteConfig.url}/#website`,
    url: siteConfig.url,
    name: siteConfig.name,
    description: siteConfig.shortDescription,
    inLanguage: "ru-RU",
    publisher: { "@id": `${siteConfig.url}/#organization` },
  };
}

export function buildFaqSchema(
  items: readonly { q: string; a: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };
}

export function buildBreadcrumbSchema(
  items: { name: string; path: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${siteConfig.url}${item.path}`,
    })),
  };
}
