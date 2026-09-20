import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        noir: {
          DEFAULT: "#0B0B0B",
          soft: "#121212",
          card: "#171614",
          line: "#2A2724",
        },
        creme: {
          DEFAULT: "#EFE3CD",
          soft: "#F6EEE0",
          dim: "#C9BBA3",
          muted: "#8E8271",
        },
        or: {
          DEFAULT: "#C9A227",
          soft: "#E0BE52",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
