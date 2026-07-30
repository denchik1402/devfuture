import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TelegramFloat from "@/components/TelegramFloat";
import NeonButton from "@/components/NeonButton";
import SeoViewBeacon from "@/components/SeoViewBeacon";
import CaseBotMock from "@/components/CaseBotMock";
import { JsonLd } from "@/components/JsonLd";
import { getAllCaseSlugs, getCasePage } from "@/lib/cases";
import { getSeoLanding } from "@/lib/seo-landings";
import { getBlogPost } from "@/lib/blog";
import { getServiceBySlug } from "@/lib/services";
import { siteConfig, telegramBotStartLink } from "@/lib/site";
import {
  buildBreadcrumbSchema,
  buildCaseStudySchema,
  buildFaqSchema,
} from "@/lib/seo";

type Props = { params: { slug: string } };

export function generateStaticParams() {
  return getAllCaseSlugs().map((slug) => ({ slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const page = getCasePage(params.slug);
  if (!page) return {};
  const url = `${siteConfig.url}/keysy/${page.slug}`;
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: `/keysy/${page.slug}` },
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

export default function CasePage({ params }: Props) {
  const page = getCasePage(params.slug);
  if (!page) notFound();

  const crumbs = buildBreadcrumbSchema([
    { name: "Главная", path: "/" },
    { name: "Кейсы", path: "/keysy" },
    { name: page.h1, path: `/keysy/${page.slug}` },
  ]);

  const caseUrl = `${siteConfig.url}/keysy/${page.slug}`;
  const caseSchema = buildCaseStudySchema({
    h1: page.h1,
    description: page.description,
    before: page.before,
    after: page.after,
    result: page.result,
    url: caseUrl,
  });

  const botHref = telegramBotStartLink(page.demoStart || "order");

  return (
    <main className="relative min-h-screen bg-void">
      <SeoViewBeacon goal="view_case" slug={page.slug} />
      <JsonLd data={[caseSchema, buildFaqSchema(page.faq), crumbs]} />
      <Navbar />

      <article className="relative overflow-hidden pb-8 pt-28 md:pt-32">
        <div className="pointer-events-none absolute inset-0 dot-grid opacity-30" />
        <div className="relative mx-auto max-w-6xl px-6">
          <Link
            href="/keysy"
            className="inline-flex items-center gap-2 text-sm text-zinc-500 transition hover:text-cyan-neon"
          >
            <ArrowLeft className="h-4 w-4" />
            Все кейсы
          </Link>

          <p className="mt-8 text-xs uppercase tracking-[0.3em] text-cyan-neon/70">
            {page.category}
          </p>
          <h1 className="mt-3 max-w-3xl font-display text-3xl font-bold leading-tight text-white md:text-5xl">
            {page.h1}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-zinc-400 md:text-lg">
            {page.description}
          </p>

          {(page.term || page.result) && (
            <div className="mt-8 flex flex-wrap gap-3">
              {page.term && (
                <span className="rounded-full border border-cyan-neon/30 bg-cyan-neon/10 px-4 py-2 text-sm text-cyan-neon">
                  {page.term}
                </span>
              )}
              <span className="rounded-full border border-white/10 px-4 py-2 text-sm text-zinc-300">
                {page.result}
              </span>
            </div>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            <NeonButton href={botHref} pulse>
              Обсудить похожий сценарий
            </NeonButton>
            <NeonButton href="/#contact" variant="ghost">
              Написать через форму
            </NeonButton>
            <NeonButton
              href={`/brief?from=case_${page.slug}`}
              variant="ghost"
            >
              Черновик поста / брифа
            </NeonButton>
            {page.slug === "status-cabinet" ? (
              <NeonButton href="/status/demo-alpha" variant="ghost">
                Демо статуса по токену
              </NeonButton>
            ) : null}
          </div>

          {page.flowSteps?.length ? (
            <CaseBotMock
              title={page.h1}
              steps={page.flowSteps}
              variant={
                page.slug === "salon-booking" ||
                page.slug === "delivery-bot" ||
                page.slug === "status-cabinet"
                  ? "phone"
                  : "strip"
              }
            />
          ) : null}

          <section className="mt-14 grid gap-4 md:grid-cols-2">
            <div className="glass rounded-2xl p-7">
              <h2 className="font-display text-xl font-semibold text-white">
                Было
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-zinc-400">
                {page.before}
              </p>
            </div>
            <div className="glass rounded-2xl p-7">
              <h2 className="font-display text-xl font-semibold text-white">
                Стало
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-zinc-400">
                {page.after}
              </p>
            </div>
          </section>

          <section className="glass mt-6 rounded-2xl p-7">
            <h2 className="font-display text-xl font-semibold text-white">
              Стек
            </h2>
            <ul className="mt-5 flex flex-wrap gap-2">
              {page.stack.map((tech) => (
                <li
                  key={tech}
                  className="rounded-full border border-white/10 px-3 py-1 text-sm text-zinc-300"
                >
                  {tech}
                </li>
              ))}
            </ul>
            <p className="mt-5 flex items-start gap-2 text-sm text-zinc-400">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-cyan-neon" />
              Итог: {page.result}
            </p>
          </section>

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
            page.relatedServices?.length ||
            page.relatedPosts?.length) && (
            <section className="mt-14 border-t border-white/5 pt-10">
              <h2 className="font-display text-xl font-semibold text-white">
                Читайте также
              </h2>
              <ul className="mt-4 flex flex-col gap-2 text-sm text-zinc-400">
                {page.relatedServices?.map((slug) => {
                  const svc = getServiceBySlug(slug);
                  if (!svc) return null;
                  return (
                    <li key={slug}>
                      <Link
                        href={`/uslugi/${slug}`}
                        className="text-cyan-neon hover:underline"
                      >
                        Услуга: {svc.shortName}
                      </Link>
                    </li>
                  );
                })}
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
