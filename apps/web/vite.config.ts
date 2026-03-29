/// <reference types="vitest" />
import path from "path"
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import cesium from "vite-plugin-cesium"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), cesium({
    cesiumBuildRootPath: path.resolve(__dirname, "../../node_modules/cesium/Build"),
    cesiumBuildPath: path.resolve(__dirname, "../../node_modules/cesium/Build/Cesium/"),
  })],
  build: {
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('cesium') || id.includes('resium')) {
            return 'vendor-cesium'
          }
          if (id.includes('three') || id.includes('@react-three/fiber') || id.includes('@react-three/drei')) {
            return 'vendor-three'
          }
          if (id.includes('@codemirror/') || id.includes('@uiw/react-codemirror') || id.includes('@uiw/codemirror-themes-all') || id.includes('@replit/codemirror-vim')) {
            return 'vendor-codemirror'
          }
          if (id.includes('recharts')) {
            return 'vendor-charts'
          }
          if (id.includes('framer-motion')) {
            return 'vendor-motion'
          }
          if (id.includes('@tsparticles/react') || id.includes('@tsparticles/slim')) {
            return 'vendor-particles'
          }
          if (id.includes('react-markdown') || id.includes('react-syntax-highlighter')) {
            return 'vendor-markdown'
          }
        },
      },
    },
  },
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
