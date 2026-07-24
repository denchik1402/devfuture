import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { rootMetadata } from "@/lib/metadata";
import {
  buildFaqSchema,
  buildOrganizationSchema,
  buildWebsiteSchema,
} from "@/lib/seo";
import { FAQ_ITEMS } from "@/lib/content";
import { JsonLd } from "@/components/JsonLd";
import { YandexMetrika } from "@/components/YandexMetrika";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin", "latin-ext"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = rootMetadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <head>
        <JsonLd
          data={[
            buildOrganizationSchema(),
            buildWebsiteSchema(),
            buildFaqSchema(FAQ_ITEMS),
          ]}
        />
      </head>
      <body className="font-sans antialiased bg-void text-zinc-100">
        <YandexMetrika />
        {children}
      </body>
    </html>
  );
}
