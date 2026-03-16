import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Lowe's-inspired palette
        primary: "#0358A7",
        navy: "#1a365d",
        muted: "#6b7280",
        backgroundLight: "#f7f7f7",
        success: "#2e7d32",
        error: "#dc2626",
      },
    },
  },
  plugins: [],
};
export default config;
