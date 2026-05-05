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
        tunnel: {
          950: "#050708",
          900: "#0a0d10",
          800: "#111620",
          700: "#1a2230",
          600: "#243040",
          500: "#2e3e52",
        },
        signal: {
          amber: "#f59e0b",
          "amber-bright": "#fbbf24",
          cyan: "#06b6d4",
          "cyan-bright": "#22d3ee",
          red: "#ef4444",
          green: "#22c55e",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      backgroundImage: {
        "tunnel-gradient": "linear-gradient(180deg, #050708 0%, #0a0d10 40%, #111620 100%)",
        "road-line": "repeating-linear-gradient(90deg, transparent 0px, transparent 30px, #f59e0b22 30px, #f59e0b22 60px)",
      },
      animation: {
        "pulse-amber": "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "scan": "scan 3s linear infinite",
      },
      keyframes: {
        scan: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
