import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

const isElectron = process.env.ELECTRON === "true";

export default defineConfig({
  plugins: [
    react(),
    !isElectron &&
      VitePWA({
        registerType: "autoUpdate",
        injectRegister: "auto",
        includeAssets: ["favicon.svg", "favicon-32x32.png", "apple-touch-icon.png"],
        manifest: {
          id: "/",
          lang: "ru",
          name: "Рэлан — Nova",
          short_name: "Nova",
          description: "CRM мебельного салона «Рэлан»: заказы, склад, касса, рабочий стол смены",
          theme_color: "#0b0c10",
          background_color: "#0b0c10",
          display: "standalone",
          orientation: "portrait-primary",
          start_url: "/",
          scope: "/",
          icons: [
            { src: "/pwa-192x192.png", sizes: "192x192", type: "image/png", purpose: "any" },
            { src: "/pwa-512x512.png", sizes: "512x512", type: "image/png", purpose: "any" },
            { src: "/pwa-maskable-512x512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
          ],
        },
        workbox: {
          // Precache only the app shell (JS/CSS/HTML) so the first install stays
          // small on mobile data; photos/stickers/audio are cached lazily below.
          globPatterns: ["**/*.{js,css,html,ico,svg,woff,woff2}"],
          globIgnores: ["**/audio/**", "**/stickers/**", "**/Борис*/**"],
          navigateFallbackDenylist: [/^\/api/],
          runtimeCaching: [
            {
              urlPattern: ({ request }) => request.destination === "image",
              handler: "CacheFirst",
              options: {
                cacheName: "nova-images",
                expiration: { maxEntries: 80, maxAgeSeconds: 30 * 24 * 60 * 60 },
              },
            },
            {
              urlPattern: ({ request }) => request.destination === "audio",
              handler: "CacheFirst",
              options: {
                cacheName: "nova-audio",
                expiration: { maxEntries: 20, maxAgeSeconds: 30 * 24 * 60 * 60 },
              },
            },
          ],
        },
      }),
  ],
  base: isElectron ? "./" : "/",
  server: {
    port: 5180,
    strictPort: true,
    allowedHosts: true,
    proxy: { "/api": { target: "http://localhost:3002", changeOrigin: true } },
    watch: {
      ignored: ["**/electron/**"],
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
