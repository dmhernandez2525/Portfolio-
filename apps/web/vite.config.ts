/// <reference types="vitest" />
import path from "path"
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import cesium from "vite-plugin-cesium"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), cesium()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    coverage: {
      provider: 'v8',
      include: [
        'src/components/game/pokemon/engine/**/*.ts',
        'src/data/ai-development.ts',
        'src/pages/AIDevelopmentPage.tsx',
        'src/components/sections/AIExperience.tsx',
      ],
      exclude: ['**/*.test.ts', '**/*.test.tsx', '**/renderer.ts', '**/sprites.ts', '**/tilemap.ts', '**/audio-manager.ts', '**/types.ts', '**/postgame.ts'],
    },
  },
})
