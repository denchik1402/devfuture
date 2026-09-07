import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import OfferStrip from "@/components/OfferStrip";
import ScrollGoals from "@/components/ScrollGoals";
import CompactHome from "@/components/CompactHome";
import { JsonLd } from "@/components/JsonLd";
import { FAQ_ITEMS } from "@/lib/content";
import { buildFaqSchema } from "@/lib/seo";

const skeleton = (minHeight: string) => (
  <section
    className={`${minHeight} animate-pulse bg-gradient-to-b from-white/[0.03] to-transparent`}
    aria-hidden
  />
);

/** Below-the-fold: code-split to shrink first JS parse/hydrate */
const ServicesIntro = dynamic(() => import("@/components/ServicesIntro"), {
  loading: () => skeleton("min-h-[22rem]"),
});
const SolutionsStrip = dynamic(() => import("@/components/SolutionsStrip"), {
  loading: () => skeleton("min-h-[14rem]"),
});
const Packages = dynamic(() => import("@/components/Packages"), {
  loading: () => skeleton("min-h-[24rem]"),
});
const BudgetEstimator = dynamic(() => import("@/components/BudgetEstimator"), {
  loading: () => skeleton("min-h-[28rem]"),
});
const Process = dynamic(() => import("@/components/Process"), {
  loading: () => skeleton("min-h-[28rem]"),
});
const BotDemo = dynamic(() => import("@/components/BotDemo"), {
  loading: () => skeleton("min-h-[20rem]"),
});
const Cases = dynamic(() => import("@/components/Cases"), {
  loading: () => skeleton("min-h-[20rem]"),
});
const BriefQuiz = dynamic(() => import("@/components/BriefQuiz"), {
  loading: () => skeleton("min-h-[22rem]"),
});
const Faq = dynamic(() => import("@/components/Faq"), {
  loading: () => skeleton("min-h-[16rem]"),
});
const Testimonials = dynamic(() => import("@/components/Testimonials"), {
  loading: () => skeleton("min-h-[18rem]"),
});
const ContactForm = dynamic(() => import("@/components/ContactForm"), {
  loading: () => skeleton("min-h-[28rem]"),
});
const Footer = dynamic(() => import("@/components/Footer"), {
  loading: () => skeleton("min-h-[12rem]"),
});
const TelegramFloat = dynamic(() => import("@/components/TelegramFloat"), {
  ssr: false,
});
const QuizStickyBar = dynamic(() => import("@/components/QuizStickyBar"), {
  ssr: false,
});

type HomeProps = {
  searchParams?: { compact?: string; utm_source?: string };
};

export default function Home({ searchParams }: HomeProps) {
  const compact =
    searchParams?.compact === "1" ||
    searchParams?.compact === "true" ||
    searchParams?.utm_source === "yandex" ||
    searchParams?.utm_source === "ydirect";

  if (compact) {
    return <CompactHome />;
  }

  return (
    <main className="relative min-h-screen bg-void">
      <JsonLd data={buildFaqSchema(FAQ_ITEMS)} />
      <ScrollGoals />
      <Navbar />
      <Hero />
      <OfferStrip />
      {/* Конверсия раньше: пакеты + квиз до длинных кейсов */}
      <Packages />
      <BriefQuiz />
      <BudgetEstimator />
      <ServicesIntro />
      <SolutionsStrip />
      <Cases />
      <Testimonials />
      <Process />
      <BotDemo />
      <Faq />
      <ContactForm />
      <Footer />
      <QuizStickyBar />
      <TelegramFloat />
    </main>
  );
}
