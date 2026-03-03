import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#0f4c5c",
        surface: "#f3f7f9",
        accent: "#5f0f40"
      }
    }
  },
  plugins: []
};

export default config;
