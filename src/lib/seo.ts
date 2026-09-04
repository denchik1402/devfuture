import { siteConfig } from "@/lib/site";
import { legalConfig } from "@/lib/legal";

export function buildOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${siteConfig.url}/#organization`,
    name: siteConfig.name,
    legalName: legalConfig.entityName,
    url: siteConfig.url,
    description: siteConfig.description,
    ...(legalConfig.phone
      ? { telephone: legalConfig.phone.replace(/[^\d+]/g, "") }
      : {}),
    ...(legalConfig.email ? { email: legalConfig.email } : {}),
    ...(legalConfig.address
      ? {
          address: {
            "@type": "PostalAddress",
            streetAddress: legalConfig.address,
            addressCountry: "RU",
          },
        }
      : {}),
    ...(legalConfig.inn
      ? {
          taxID: legalConfig.inn,
          identifier: [
            { "@type": "PropertyValue", name: "ИНН", value: legalConfig.inn },
            ...(legalConfig.ogrn
              ? [
                  {
                    "@type": "PropertyValue",
                    name: legalConfig.ogrn.length === 15 ? "ОГРНИП" : "ОГРН",
                    value: legalConfig.ogrn,
                  },
                ]
              : []),
          ],
        }
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

export function buildCaseStudySchema(page: {
  h1: string;
  description: string;
  before: string;
  after: string;
  result: string;
  url: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: page.h1,
    description: page.description,
    url: page.url,
    mainEntityOfPage: page.url,
    author: { "@type": "Organization", name: siteConfig.name },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
    },
    about: {
      "@type": "Thing",
      name: page.h1,
      description: `${page.before} → ${page.after}. ${page.result}`,
    },
  };
}

export function buildItemListSchema(
  name: string,
  items: { name: string; url: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    numberOfItems: items.length,
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      url: item.url,
    })),
  };
}

export function buildHowToSchema(opts: {
  name: string;
  description: string;
  url: string;
  steps: { name: string; text: string }[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: opts.name,
    description: opts.description,
    url: opts.url,
    step: opts.steps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.name,
      text: s.text,
    })),
  };
}
