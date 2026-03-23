import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./modules/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f8fafc",
          500: "#2563eb",
          700: "#1e3a8a",
          900: "#0f172a"
        },
        accent: {
          500: "#f59e0b"
        }
      }
    }
  },
  plugins: []
};

export default config;
