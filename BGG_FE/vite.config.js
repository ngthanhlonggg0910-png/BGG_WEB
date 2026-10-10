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

      manifest: {
        name: "eGMF",
        short_name: "eGMF",

        start_url: "/",
        display: "standalone",

        theme_color: "#ffffff",
        background_color: "#ffffff",

        icons: [
          {
            src: "/ic_launcher_192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/ic_launcher_512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],

  server: {
    host: "0.0.0.0",
    port: 5173,

    allowedHosts: ["happening-duty-undertook.ngrok-free.dev"],

    // Chuyển API từ Frontend sang Backend
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});
