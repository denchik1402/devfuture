import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TelegramFloat from "@/components/TelegramFloat";
import NeonButton from "@/components/NeonButton";
import { JsonLd } from "@/components/JsonLd";
import {
  getAllSeoLandingSlugs,
  getSeoLanding,
} from "@/lib/seo-landings";
import { getBlogPost } from "@/lib/blog";
import { siteConfig } from "@/lib/site";
import { buildBreadcrumbSchema, buildFaqSchema } from "@/lib/seo";

type Props = { params: { slug: string } };

export function generateStaticParams() {
  return getAllSeoLandingSlugs().map((slug) => ({ slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const page = getSeoLanding(params.slug);
  if (!page) return {};
  const url = `${siteConfig.url}/resheniya/${page.slug}`;
  return {
    title: page.title,
    description: page.description,
    keywords: page.keywords,
    alternates: { canonical: `/resheniya/${page.slug}` },
    openGraph: {
      title: page.h1,
      description: page.description,
      url,
      type: "website",
      locale: siteConfig.locale,
      siteName: siteConfig.name,
    },
  };
}

export default function SeoLandingPage({ params }: Props) {
  const page = getSeoLanding(params.slug);
  if (!page) notFound();

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: page.h1,
    description: page.description,
    provider: {
      "@type": "ProfessionalService",
      name: siteConfig.name,
      url: siteConfig.url,
    },
    areaServed: "RU",
    offers: {
      "@type": "Offer",
      priceCurrency: "RUB",
      price: page.priceFrom.replace(/[^\d]/g, ""),
      description: `от ${page.priceFrom}`,
    },
  };

  const crumbs = buildBreadcrumbSchema([
    { name: "Главная", path: "/" },
    { name: "Решения", path: "/resheniya" },
    { name: page.h1, path: `/resheniya/${page.slug}` },
  ]);

  return (
    <main className="relative min-h-screen bg-void">
      <JsonLd data={[serviceSchema, buildFaqSchema(page.faq), crumbs]} />
      <Navbar />

      <article className="relative overflow-hidden pb-8 pt-28 md:pt-32">
        <div className="pointer-events-none absolute inset-0 dot-grid opacity-30" />
        <div className="relative mx-auto max-w-6xl px-6">
          <Link
            href="/resheniya"
            className="inline-flex items-center gap-2 text-sm text-zinc-500 transition hover:text-cyan-neon"
          >
            <ArrowLeft className="h-4 w-4" />
            Все решения
          </Link>

          <h1 className="mt-8 max-w-3xl font-display text-3xl font-bold leading-tight text-white md:text-5xl">
            {page.h1}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-zinc-400 md:text-lg">
            {page.description}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <span className="rounded-full border border-white/10 px-4 py-2 text-sm text-zinc-300">
              от {page.priceFrom}
            </span>
            <span className="rounded-full border border-cyan-neon/30 bg-cyan-neon/10 px-4 py-2 text-sm text-cyan-neon">
              {page.term}
            </span>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <NeonButton href={siteConfig.telegramUrl} pulse>
              Написать в Telegram
            </NeonButton>
            <NeonButton href="/#quiz" variant="ghost">
              Собрать бриф за 30 сек
            </NeonButton>
          </div>

          <section className="glass mt-14 rounded-2xl p-7">
            <h2 className="font-display text-xl font-semibold text-white">
              Что получите
            </h2>
            <ul className="mt-5 space-y-3">
              {page.bullets.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-sm text-zinc-400"
                >
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-cyan-neon" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          {page.sections.map((section) => (
            <section key={section.heading} className="mt-14 max-w-3xl">
              <h2 className="font-display text-2xl font-bold text-white">
                {section.heading}
              </h2>
              <div className="mt-4 space-y-4 text-sm leading-relaxed text-zinc-400 md:text-base">
                {section.paragraphs.map((p) => (
                  <p key={p.slice(0, 48)}>{p}</p>
                ))}
              </div>
            </section>
          ))}

          <section className="mt-14">
            <h2 className="font-display text-2xl font-bold text-white">
              Частые вопросы
            </h2>
            <div className="mt-6 space-y-3">
              {page.faq.map((item) => (
                <div key={item.q} className="glass rounded-2xl p-6">
                  <h3 className="font-display text-base font-medium text-white">
                    {item.q}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                    {item.a}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {(page.relatedLandings?.length ||
            page.relatedPosts?.length ||
            page.relatedService) && (
            <section className="mt-14 border-t border-white/5 pt-10">
              <h2 className="font-display text-xl font-semibold text-white">
                Читайте также
              </h2>
              <ul className="mt-4 flex flex-col gap-2 text-sm text-zinc-400">
                {page.relatedService && (
                  <li>
                    <Link
                      href={`/uslugi/${page.relatedService}`}
                      className="text-cyan-neon hover:underline"
                    >
                      Услуга: подробнее
                    </Link>
                  </li>
                )}
                {page.relatedLandings?.map((slug) => {
                  const rel = getSeoLanding(slug);
                  if (!rel) return null;
                  return (
                    <li key={slug}>
                      <Link
                        href={`/resheniya/${slug}`}
                        className="text-cyan-neon hover:underline"
                      >
                        {rel.h1}
                      </Link>
                    </li>
                  );
                })}
                {page.relatedPosts?.map((slug) => {
                  const post = getBlogPost(slug);
                  if (!post) return null;
                  return (
                    <li key={slug}>
                      <Link
                        href={`/blog/${slug}`}
                        className="text-cyan-neon hover:underline"
                      >
                        {post.title}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
        </div>
      </article>

      <Footer />
      <TelegramFloat />
    </main>
  );
}
