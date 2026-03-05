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
          50: "#effcf6",
          500: "#1e7f4f",
          700: "#145434"
        }
      }
    }
  },
  plugins: []
};

export default config;
