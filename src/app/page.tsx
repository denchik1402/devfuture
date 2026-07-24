import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import OfferStrip from "@/components/OfferStrip";
import Stats from "@/components/Stats";
import ServicesIntro from "@/components/ServicesIntro";
import Skills from "@/components/Skills";
import Packages from "@/components/Packages";
import Process from "@/components/Process";
import ContactForm from "@/components/ContactForm";
import Footer from "@/components/Footer";
import TelegramFloat from "@/components/TelegramFloat";
import Testimonials from "@/components/Testimonials";
import BriefQuiz from "@/components/BriefQuiz";
import ScrollGoals from "@/components/ScrollGoals";

const BotDemo = dynamic(() => import("@/components/BotDemo"), {
  loading: () => <section className="min-h-[20rem]" aria-hidden />,
});
const Cases = dynamic(() => import("@/components/Cases"), {
  loading: () => <section className="min-h-[20rem]" aria-hidden />,
});
const Faq = dynamic(() => import("@/components/Faq"), {
  loading: () => <section className="min-h-[16rem]" aria-hidden />,
});

export default function Home() {
  return (
    <main className="relative min-h-screen bg-void">
      <ScrollGoals />
      <Navbar />
      <Hero />
      <OfferStrip />
      <BotDemo />
      <Stats />
      <ServicesIntro />
      <Skills />
      <Packages />
      <Process />
      <Cases />
      <Testimonials />
      <BriefQuiz />
      <Faq />
      <ContactForm />
      <Footer />
      <TelegramFloat />
    </main>
  );
}
