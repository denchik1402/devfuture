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
  getAllServiceSlugs,
  getServiceBySlug,
  SERVICE_PAGES,
} from "@/lib/services";
import { getSeoLanding } from "@/lib/seo-landings";
import { getBlogPost } from "@/lib/blog";
import { siteConfig } from "@/lib/site";
import { buildFaqSchema, buildBreadcrumbSchema } from "@/lib/seo";

type Props = { params: { slug: string } };

export function generateStaticParams() {
  return getAllServiceSlugs().map((slug) => ({ slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const service = getServiceBySlug(params.slug);
  if (!service) return {};

  const url = `${siteConfig.url}/uslugi/${service.slug}`;
  return {
    title: service.title,
    description: service.description,
    keywords: service.keywords,
    alternates: { canonical: `/uslugi/${service.slug}` },
    openGraph: {
      title: service.title,
      description: service.description,
      url,
      type: "website",
      locale: siteConfig.locale,
      siteName: siteConfig.name,
    },
  };
}

export default function ServicePage({ params }: Props) {
  const service = getServiceBySlug(params.slug);
  if (!service) notFound();

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.name,
    description: service.description,
    provider: {
      "@type": "ProfessionalService",
      name: siteConfig.name,
      url: siteConfig.url,
    },
    areaServed: "RU",
    offers: {
      "@type": "Offer",
      priceCurrency: "RUB",
      price: service.priceFrom.replace(/[^\d]/g, ""),
      description: `от ${service.priceFrom}`,
    },
  };

  const crumbs = buildBreadcrumbSchema([
    { name: "Главная", path: "/" },
    { name: "Услуги", path: "/uslugi" },
    { name: service.shortName, path: `/uslugi/${service.slug}` },
  ]);

  return (
    <main className="relative min-h-screen bg-void">
      <JsonLd data={[serviceSchema, buildFaqSchema(service.faq), crumbs]} />
      <Navbar />

      <article className="relative overflow-hidden pb-8 pt-28 md:pt-32">
        <div className="pointer-events-none absolute inset-0 dot-grid opacity-30" />
        <div className="pointer-events-none absolute inset-0 bg-neon-radial opacity-60" />

        <div className="relative mx-auto max-w-6xl px-6">
          <Link
            href="/uslugi"
            className="inline-flex items-center gap-2 text-sm text-zinc-500 transition hover:text-cyan-neon"
          >
            <ArrowLeft className="h-4 w-4" />
            Все услуги
          </Link>

          <p className="mt-8 font-display text-xs uppercase tracking-[0.3em] text-cyan-neon/80">
            {service.shortName}
          </p>
          <h1 className="mt-3 max-w-3xl font-display text-3xl font-bold leading-tight text-white md:text-5xl">
            {service.name}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-zinc-400 md:text-lg">
            {service.description}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <span className="rounded-full border border-white/10 px-4 py-2 text-sm text-zinc-300">
              от {service.priceFrom}
            </span>
            <span className="rounded-full border border-cyan-neon/30 bg-cyan-neon/10 px-4 py-2 text-sm text-cyan-neon">
              {service.term}
            </span>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <NeonButton href="/#contact" pulse>
              Оставить бриф
            </NeonButton>
            <NeonButton href={siteConfig.telegramUrl} variant="ghost">
              Написать в Telegram
            </NeonButton>
          </div>

          <div className="mt-16 grid gap-5 md:grid-cols-2">
            <section className="glass rounded-2xl p-7">
              <h2 className="font-display text-xl font-semibold text-white">
                Что входит
              </h2>
              <ul className="mt-5 space-y-3">
                {service.highlights.map((item) => (
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

            <section className="glass rounded-2xl p-7">
              <h2 className="font-display text-xl font-semibold text-white">
                Как идём
              </h2>
              <ol className="mt-5 space-y-3">
                {service.process.map((item, i) => (
                  <li key={item} className="flex gap-3 text-sm text-zinc-400">
                    <span className="font-display text-xs tracking-widest text-purple-neon">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {item}
                  </li>
                ))}
              </ol>
            </section>
          </div>

          {service.sections.map((section) => (
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

          <section className="mt-16">
            <h2 className="font-display text-2xl font-bold text-white">
              Частые вопросы
            </h2>
            <div className="mt-6 space-y-3">
              {service.faq.map((item) => (
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

          <section className="mt-16">
            <h2 className="font-display text-xl font-semibold text-white">
              Другие услуги
            </h2>
            <div className="mt-5 flex flex-wrap gap-3">
              {SERVICE_PAGES.filter((s) => s.slug !== service.slug).map((s) => (
                <Link
                  key={s.slug}
                  href={`/uslugi/${s.slug}`}
                  className="rounded-full border border-white/10 px-4 py-2 text-sm text-zinc-400 transition hover:border-cyan-neon/40 hover:text-cyan-neon"
                >
                  {s.shortName}
                </Link>
              ))}
            </div>
          </section>

          {(service.relatedLandings?.length || service.relatedPosts?.length) && (
            <section className="mt-12 border-t border-white/5 pt-10">
              <h2 className="font-display text-xl font-semibold text-white">
                Решения и статьи
              </h2>
              <ul className="mt-4 flex flex-col gap-2 text-sm">
                {service.relatedLandings?.map((slug) => {
                  const landing = getSeoLanding(slug);
                  if (!landing) return null;
                  return (
                    <li key={slug}>
                      <Link
                        href={`/resheniya/${slug}`}
                        className="text-cyan-neon hover:underline"
                      >
                        {landing.h1}
                      </Link>
                    </li>
                  );
                })}
                {service.relatedPosts?.map((slug) => {
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
