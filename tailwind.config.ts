import type { Config } from "tailwindcss";
export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#091722",
        panel: "#102330",
        surface: "#152c39",
        muted: "#91a6b0",
        accent: "#41d5b0",
        line: "#25404c",
        danger: "#ff7779",
        amber: "#f5ba62",
      },
      fontFamily: { sans: ["Arial", "Helvetica", "sans-serif"] },
      boxShadow: { glow: "0 0 80px rgba(65,213,176,.12)" },
    },
  },
  plugins: [],
} satisfies Config;
