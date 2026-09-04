import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { LegalRequisitesBlock } from "@/components/LegalRequisites";
import { formatDocsDate, legalConfig } from "@/lib/legal";
import { siteConfig } from "@/lib/site";

export { LegalRequisitesBlock };

type LegalDocProps = {
  eyebrow?: string;
  title: string;
  children: React.ReactNode;
};

export function LegalDoc({
  eyebrow = "Legal",
  title,
  children,
}: LegalDocProps) {
  return (
    <main className="relative min-h-screen bg-void">
      <Navbar />
      <article className="relative mx-auto max-w-3xl px-6 pb-24 pt-28 md:pt-32">
        <p className="font-display text-xs uppercase tracking-[0.3em] text-cyan-neon/80">
          {eyebrow}
        </p>
        <h1 className="mt-3 font-display text-3xl font-bold text-white md:text-4xl">
          {title}
        </h1>
        <p className="mt-4 text-sm text-zinc-500">
          Актуально на {formatDocsDate()} · {legalConfig.entityName} (
          {siteConfig.url})
        </p>

        <div className="prose-invert mt-10 space-y-8 text-sm leading-relaxed text-zinc-300">
          {children}
        </div>

        <p className="mt-12 text-sm text-zinc-500">
          <Link href="/" className="text-cyan-neon hover:underline">
            ← На главную
          </Link>
        </p>
      </article>
      <Footer />
    </main>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="font-display text-lg font-semibold text-white">{title}</h2>
      {children}
    </section>
  );
}
