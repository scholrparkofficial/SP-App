// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react"; // or your framework plugin

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // your dev server port
    host: true, // allow network access
    allowedHosts: ["myapp.loca.lt"], // allow your localtunnel subdomain
  },
});
