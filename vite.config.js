import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    logLevel: 'debug',  // Enable debug logs to inspect proxy behavio
    proxy: {
      "/create-thread": {
        target: "https://assistants.api.ea.huit.harvard.edu", // The URL of your Flask backend
        changeOrigin: true,
      },
      "/send-message": {
        target: "https://assistants.api.ea.huit.harvard.edu", // The URL of your Flask backend
        //target: "http://localhost", // The URL of your Flask backend
        changeOrigin: true,
      },
    },
  },
});
