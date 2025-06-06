import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import envCompatible from 'vite-plugin-env-compatible';

export default defineConfig({
  plugins: [
    react(),
    envCompatible()
  ],
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  // Ensure environment variables are loaded
  envPrefix: 'VITE_',
  // Configure base URL for GitHub Pages
  base: './'
});
