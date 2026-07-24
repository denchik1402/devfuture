import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        void: "#0A0A0A",
        cyan: {
          neon: "#00F0FF",
        },
        purple: {
          neon: "#B026FF",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        // Space Grotesk for Latin; Inter covers Cyrillic glyphs
        display: [
          "var(--font-space-grotesk)",
          "var(--font-inter)",
          "system-ui",
          "sans-serif",
        ],
      },
      backgroundImage: {
        "neon-gradient": "linear-gradient(135deg, #00F0FF 0%, #B026FF 100%)",
        "neon-radial":
          "radial-gradient(ellipse at center, rgba(0,240,255,0.15) 0%, transparent 70%)",
      },
      boxShadow: {
        neon: "0 0 20px rgba(0, 240, 255, 0.35), 0 0 40px rgba(176, 38, 255, 0.2)",
        glass: "0 8px 32px rgba(0, 0, 0, 0.4)",
      },
      animation: {
        marquee: "marquee 40s linear infinite",
        pulseGlow: "pulseGlow 2.4s ease-in-out infinite",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        // Opacity-only pulse — animating box-shadow forces expensive paints
        pulseGlow: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.82" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
