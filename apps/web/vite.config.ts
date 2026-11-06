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
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/react/") || id.includes("node_modules/react-dom/") || id.includes("node_modules\\react\\") || id.includes("node_modules\\react-dom\\")) {
            return "vendor-react";
          }
          if (id.includes("node_modules/lucide-react") || id.includes("node_modules\\lucide-react")) {
            return "vendor-icons";
          }
          if (id.includes("node_modules/@supabase") || id.includes("node_modules\\@supabase")) {
            return "vendor-supabase";
          }
          if (id.includes("features/founders") || id.includes("features\\founders")) {
            return "realm-founders";
          }
          if (id.includes("features/socializing") || id.includes("features\\socializing")) {
            return "realm-socializing";
          }
        },
      },
    },
  },
});
