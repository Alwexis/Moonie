import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { mooniePlugin } from "moonie/vite";
import path from "path";

export default defineConfig({
  plugins: [tailwindcss(), mooniePlugin()],
  resolve: {
    alias: {
      "@moonie": path.resolve(__dirname, "./src"),
    },
  },
});
