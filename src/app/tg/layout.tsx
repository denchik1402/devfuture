import type { Metadata } from "next";
import Script from "next/script";

export const metadata: Metadata = {
  title: "DevFuture — Telegram Mini App",
  robots: { index: false, follow: false },
};

export default function TgLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script
        src="https://telegram.org/js/telegram-web-app.js"
        strategy="beforeInteractive"
      />
      <div className="min-h-[100dvh] bg-void">{children}</div>
    </>
  );
}
