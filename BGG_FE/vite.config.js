import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),

    VitePWA({
      registerType: "autoUpdate",
      devOptions: {
        enabled: true,
      },

      manifest: {
        id: "/",
        name: "eGMF",
        short_name: "eGMF",

        start_url: "/",
        scope: "/",
        display: "standalone",
        orientation: "portrait",

        theme_color: "#ffffff",
        background_color: "#ffffff",

        icons: [
          {
            src: "/ic_launcher_192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable",
          },
          {
            src: "/ic_launcher_512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
    }),
  ],

  server: {
    host: "0.0.0.0",
    port: 5173,

    allowedHosts: ["happening-duty-undertook.ngrok-free.dev", "wh.bgg.vn"],

    // Chuyển API từ Frontend sang Backend
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});
