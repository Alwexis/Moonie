import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { mooniePlugin } from "moonie/vite";
import { visualizer } from "rollup-plugin-visualizer";
import path from "path";

export default defineConfig({
  plugins: [tailwindcss(), mooniePlugin(), visualizer({ open: true })],
  resolve: {
    alias: {
      "@moonie": path.resolve(__dirname, "./src"),
    },
  },
});
