import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "DevFuture — цифровые продукты под ключ";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
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
          background: "linear-gradient(145deg, #0A0A0A 0%, #12121a 55%, #1a0a24 100%)",
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
              fontSize: 56,
              fontWeight: 700,
              lineHeight: 1.15,
              maxWidth: 900,
            }}
          >
            Сайты, веб и десктоп, Telegram-боты
          </div>
          <div style={{ fontSize: 28, color: "#a1a1aa", maxWidth: 820 }}>
            Цифровые продукты под ключ — от анализа до поддержки
          </div>
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 22,
            color: "#71717a",
          }}
        >
          devfuture.agency
        </div>
      </div>
    ),
    { ...size }
  );
}
