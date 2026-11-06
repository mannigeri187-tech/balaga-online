import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@platform/config": path.resolve(__dirname, "../../packages/config/src"),
      "@platform/shared-types": path.resolve(__dirname, "../../packages/shared-types/src"),
      "@platform/validation": path.resolve(__dirname, "../../packages/validation/src"),
    },
  },
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
      },
    },
  },
});
