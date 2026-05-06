import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/auth": "http://localhost:8080",
      "/student": "http://localhost:8080",
      "/job": "http://localhost:8080",
      "/company": "http://localhost:8080",
      "/admin": "http://localhost:8080",
      "/payment": "http://localhost:8080",
      "/interview": "http://localhost:8080",
      "/email": "http://localhost:8080",
      "/message": "http://localhost:8080",
      "/ws": {
        target: "http://localhost:8084",
        ws: true,
      },
    },
  },
});
