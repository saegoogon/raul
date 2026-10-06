import { resolve } from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";

const shared = resolve("src/shared");

export default defineConfig({
  main: {
    resolve: { alias: { "@shared": shared } },
    plugins: [externalizeDepsPlugin()],
  },
  preload: {
    resolve: { alias: { "@shared": shared } },
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        output: {
          format: "cjs",
          entryFileNames: "index.js",
        },
      },
    },
  },
  renderer: {
    resolve: {
      alias: {
        "@renderer": resolve("src/renderer/src"),
        "@shared": shared,
      },
    },
    plugins: [react(), tailwindcss()],
  },
});
