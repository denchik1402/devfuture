"use client";

import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import OfferStrip from "@/components/OfferStrip";
import BriefQuiz from "@/components/BriefQuiz";
import Packages from "@/components/Packages";
import ContactForm from "@/components/ContactForm";
import Footer from "@/components/Footer";
import TelegramFloat from "@/components/TelegramFloat";
import QuizStickyBar from "@/components/QuizStickyBar";
import Link from "next/link";

/** Короткая воронка для рекламы: hero → оффер → квиз → пакеты → контакт */
export default function CompactHome() {
  return (
    <main className="relative min-h-screen bg-void">
      <Navbar />
      <Hero />
      <OfferStrip />
      <BriefQuiz />
      <Packages />
      <ContactForm />
      <p className="mx-auto max-w-6xl px-6 pb-8 text-center text-sm text-zinc-500">
        <Link href="/" className="text-cyan-neon hover:underline">
          Полная версия сайта
        </Link>
      </p>
      <Footer />
      <QuizStickyBar />
      <TelegramFloat />
    </main>
  );
}
