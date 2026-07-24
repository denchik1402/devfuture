import { ImageResponse } from "next/og";
import { getSeoLanding } from "@/lib/seo-landings";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Props = { params: { slug: string } };

export default function LandingOgImage({ params }: Props) {
  const page = getSeoLanding(params.slug);
  const title = page?.h1 ?? "Решения DevFuture";
  const subtitle = page
    ? `от ${page.priceFrom} · ${page.term}`
    : "Цифровые продукты под ключ";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 64,
          background:
            "linear-gradient(145deg, #0A0A0A 0%, #12121a 55%, #1a0a24 100%)",
          color: "#fff",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 28,
            letterSpacing: 8,
            textTransform: "uppercase",
            color: "#00F0FF",
          }}
        >
          DevFuture
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              fontSize: 52,
              fontWeight: 700,
              lineHeight: 1.15,
              maxWidth: 980,
            }}
          >
            {title}
          </div>
          <div style={{ fontSize: 28, color: "#a1a1aa", maxWidth: 820 }}>
            {subtitle}
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 22, color: "#71717a" }}>
          devfuture.ru
        </div>
      </div>
    ),
    { ...size }
  );
}
