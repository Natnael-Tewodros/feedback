import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#17202a",
        muted: "#5d6673",
        line: "#d8dee6",
        panel: "#f7f9fb",
        brand: "#0f766e"
      }
    }
  },
  plugins: []
};
export default config;

