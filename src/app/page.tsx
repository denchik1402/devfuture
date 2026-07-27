import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import OfferStrip from "@/components/OfferStrip";
import ScrollGoals from "@/components/ScrollGoals";
import { JsonLd } from "@/components/JsonLd";
import { FAQ_ITEMS } from "@/lib/content";
import { buildFaqSchema } from "@/lib/seo";

const sectionFallback = (minHeight: string) => (
  <section className={minHeight} aria-hidden />
);

/** Below-the-fold: code-split to shrink first JS parse/hydrate */
const Stats = dynamic(() => import("@/components/Stats"), {
  loading: () => sectionFallback("min-h-[18rem]"),
});
const ServicesIntro = dynamic(() => import("@/components/ServicesIntro"), {
  loading: () => sectionFallback("min-h-[22rem]"),
});
const Skills = dynamic(() => import("@/components/Skills"), {
  loading: () => sectionFallback("min-h-[22rem]"),
});
const Packages = dynamic(() => import("@/components/Packages"), {
  loading: () => sectionFallback("min-h-[24rem]"),
});
const Process = dynamic(() => import("@/components/Process"), {
  loading: () => sectionFallback("min-h-[28rem]"),
});
const BotDemo = dynamic(() => import("@/components/BotDemo"), {
  loading: () => sectionFallback("min-h-[20rem]"),
});
const Cases = dynamic(() => import("@/components/Cases"), {
  loading: () => sectionFallback("min-h-[20rem]"),
});
const BriefQuiz = dynamic(() => import("@/components/BriefQuiz"), {
  loading: () => sectionFallback("min-h-[22rem]"),
});
const Faq = dynamic(() => import("@/components/Faq"), {
  loading: () => sectionFallback("min-h-[16rem]"),
});
const Testimonials = dynamic(() => import("@/components/Testimonials"), {
  loading: () => sectionFallback("min-h-[18rem]"),
});
const ContactForm = dynamic(() => import("@/components/ContactForm"), {
  loading: () => sectionFallback("min-h-[28rem]"),
});
const Footer = dynamic(() => import("@/components/Footer"), {
  loading: () => sectionFallback("min-h-[12rem]"),
});
const TelegramFloat = dynamic(() => import("@/components/TelegramFloat"), {
  ssr: false,
});

export default function Home() {
  return (
    <main className="relative min-h-screen bg-void">
      <JsonLd data={buildFaqSchema(FAQ_ITEMS)} />
      <ScrollGoals />
      <Navbar />
      <Hero />
      <OfferStrip />
      <Stats />
      <ServicesIntro />
      <Skills />
      <Packages />
      <Process />
      <BotDemo />
      <Cases />
      <BriefQuiz />
      <Faq />
      <Testimonials />
      <ContactForm />
      <Footer />
      <TelegramFloat />
    </main>
  );
}
