import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],

  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: false,
  },

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
