import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TelegramFloat from "@/components/TelegramFloat";
import { BLOG_POSTS } from "@/lib/blog";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Блог DevFuture — боты, MVP, практика разработки",
  description:
    "Заметки DevFuture: боты заявок, роли в Telegram, стоимость бота, MVP за день и практика разработки.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "Блог DevFuture",
    description: "Практика: боты, MVP, кабинеты.",
    url: `${siteConfig.url}/blog`,
    locale: siteConfig.locale,
    siteName: siteConfig.name,
  },
};

export default function BlogIndexPage() {
  return (
    <main className="relative min-h-screen bg-void">
      <Navbar />
      <div className="mx-auto max-w-6xl px-6 pb-20 pt-28 md:pt-32">
        <p className="font-display text-xs uppercase tracking-[0.3em] text-cyan-neon/70">
          Блог
        </p>
        <h1 className="mt-3 font-display text-3xl font-bold text-white md:text-5xl">
          Заметки по делу
        </h1>
        <p className="mt-4 max-w-2xl text-zinc-400">
          Без воды: как устроены боты, что реально успеть за день и как не
          раздуть scope.
        </p>

        <div className="mt-12 space-y-4">
          {BLOG_POSTS.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="glass block rounded-2xl p-6 transition hover:border-cyan-neon/30"
            >
              <time
                dateTime={post.date}
                className="text-xs uppercase tracking-wider text-zinc-500"
              >
                {post.date} · {post.readingMinutes} мин
              </time>
              <h2 className="mt-2 font-display text-xl font-semibold text-white">
                {post.title}
              </h2>
              <p className="mt-2 text-sm text-zinc-400">{post.description}</p>
            </Link>
          ))}
        </div>
      </div>
      <Footer />
      <TelegramFloat />
    </main>
  );
}
