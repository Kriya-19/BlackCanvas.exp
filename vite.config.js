import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // When developing locally with `vercel dev`, Vercel proxies to this port
    // and serves /api/* from the api/ folder automatically.
  },
});
