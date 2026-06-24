import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const isElectron = process.env.ELECTRON === "true";

export default defineConfig({
  plugins: [react()],
  base: isElectron ? "./" : "/",
  server: {
    port: 5173,
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
