import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TelegramFloat from "@/components/TelegramFloat";
import NeonButton from "@/components/NeonButton";
import SeoViewBeacon from "@/components/SeoViewBeacon";
import { JsonLd } from "@/components/JsonLd";
import { getAllBlogSlugs, getBlogPost } from "@/lib/blog";
import { getSeoLanding } from "@/lib/seo-landings";
import { getCasePage } from "@/lib/cases";
import { getServiceBySlug } from "@/lib/services";
import { siteConfig } from "@/lib/site";
import { buildBreadcrumbSchema } from "@/lib/seo";

type Props = { params: { slug: string } };

export function generateStaticParams() {
  return getAllBlogSlugs().map((slug) => ({ slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const post = getBlogPost(params.slug);
  if (!post) return {};
  const url = `${siteConfig.url}/blog/${post.slug}`;
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      url,
      type: "article",
      locale: siteConfig.locale,
      siteName: siteConfig.name,
    },
  };
}

export default function BlogPostPage({ params }: Props) {
  const post = getBlogPost(params.slug);
  if (!post) notFound();

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: { "@type": "Organization", name: siteConfig.name },
    publisher: { "@type": "Organization", name: siteConfig.name },
    mainEntityOfPage: `${siteConfig.url}/blog/${post.slug}`,
  };

  const crumbs = buildBreadcrumbSchema([
    { name: "Главная", path: "/" },
    { name: "Блог", path: "/blog" },
    { name: post.title, path: `/blog/${post.slug}` },
  ]);

  return (
    <main className="relative min-h-screen bg-void">
      <SeoViewBeacon goal="view_blog" slug={post.slug} />
      <JsonLd data={[articleSchema, crumbs]} />
      <Navbar />
      <article className="mx-auto max-w-3xl px-6 pb-20 pt-28 md:pt-32">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 transition hover:text-cyan-neon"
        >
          <ArrowLeft className="h-4 w-4" />
          Все заметки
        </Link>
        <time
          dateTime={post.date}
          className="mt-8 block text-xs uppercase tracking-wider text-zinc-500"
        >
          {post.date} · {post.readingMinutes} мин чтения
        </time>
        <h1 className="mt-3 font-display text-3xl font-bold leading-tight text-white md:text-4xl">
          {post.title}
        </h1>
        <p className="mt-4 text-lg text-zinc-400">{post.description}</p>
        <div className="mt-10 space-y-5 text-base leading-relaxed text-zinc-300">
          {post.body.map((p) => (
            <p key={p.slice(0, 40)}>{p}</p>
          ))}
        </div>

        {(post.relatedLandings?.length ||
          post.relatedServices?.length ||
          post.relatedCases?.length) && (
          <section className="mt-12 border-t border-white/5 pt-8">
            <h2 className="font-display text-lg font-semibold text-white">
              Полезные ссылки
            </h2>
            <ul className="mt-4 space-y-2 text-sm">
              {post.relatedLandings?.map((slug) => {
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
              {post.relatedCases?.map((slug) => {
                const c = getCasePage(slug);
                if (!c) return null;
                return (
                  <li key={slug}>
                    <Link
                      href={`/keysy/${slug}`}
                      className="text-cyan-neon hover:underline"
                    >
                      Кейс: {c.h1}
                    </Link>
                  </li>
                );
              })}
              {post.relatedServices?.map((slug) => {
                const service = getServiceBySlug(slug);
                if (!service) return null;
                return (
                  <li key={slug}>
                    <Link
                      href={`/uslugi/${slug}`}
                      className="text-cyan-neon hover:underline"
                    >
                      {service.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        <div className="mt-12">
          <NeonButton href={siteConfig.telegramUrl} pulse>
            Обсудить задачу в Telegram
          </NeonButton>
        </div>
      </article>
      <Footer />
      <TelegramFloat />
    </main>
  );
}
