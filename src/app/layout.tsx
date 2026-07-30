import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import { rootMetadata } from "@/lib/metadata";
import { buildOrganizationSchema, buildWebsiteSchema } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import { YandexMetrika } from "@/components/YandexMetrika";
import { AttributionCapture } from "@/components/AttributionCapture";
import { MotionProvider } from "@/components/MotionProvider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
});

/** Display font with Cyrillic — Space Grotesk had Latin-only glyphs */
const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-space-grotesk",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = rootMetadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`${inter.variable} ${manrope.variable}`}>
      <head>
        <JsonLd
          data={[buildOrganizationSchema(), buildWebsiteSchema()]}
        />
      </head>
      <body className="font-sans antialiased bg-void text-zinc-100">
        <MotionProvider>
          <AttributionCapture />
          <YandexMetrika />
          {children}
        </MotionProvider>
      </body>
    </html>
  );
}
