import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico"],
      manifest: {
        name: "Muhurto Breath — Breathing Exercises",
        short_name: "Muhurto Breath",
        description: "Muhurto Breath — offline breathing exercise app with voice guidance, themes, and smart suggestions.",
        theme_color: "#0c1929",
        background_color: "#0c1929",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        categories: ["health", "lifestyle"],
        icons: [
          { src: "/favicon.ico", sizes: "64x64", type: "image/x-icon" },
        ],
        shortcuts: [
          {
            name: "Box Breathing",
            short_name: "Box",
            url: "/session?technique=box-breathing",
            icons: [{ src: "/favicon.ico", sizes: "64x64" }],
          },
          {
            name: "4-7-8 Relaxation",
            short_name: "4-7-8",
            url: "/session?technique=4-7-8",
            icons: [{ src: "/favicon.ico", sizes: "64x64" }],
          },
          {
            name: "Wim Hof Method",
            short_name: "Wim Hof",
            url: "/session?technique=wim-hof",
            icons: [{ src: "/favicon.ico", sizes: "64x64" }],
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        navigateFallbackDenylist: [/^\/~oauth/],
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
