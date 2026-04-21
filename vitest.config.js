import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

/** Vitest uses a slim config so tests do not pull Tailwind/PostCSS unless needed. */
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    include: ["src/**/*.test.{js,jsx}"],
  },
});
