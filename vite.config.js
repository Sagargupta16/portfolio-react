import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'node:url'

export default defineConfig(({ mode }) => ({
  plugins: [
    tailwindcss(),
    react({
      fastRefresh: true,
      jsxRuntime: 'automatic'
    })
  ],
  base: mode === 'production' ? '/portfolio-react/' : '/',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@components': fileURLToPath(new URL('./src/components', import.meta.url)),
      '@pages': fileURLToPath(new URL('./src/pages', import.meta.url)),
      '@assets': fileURLToPath(new URL('./src/assets', import.meta.url)),
      '@utils': fileURLToPath(new URL('./src/utils', import.meta.url)),
      '@data': fileURLToPath(new URL('./src/data', import.meta.url))
    }
  },
  server: {
    port: 3000,
    open: true,
    hmr: true
  },
  build: {
    outDir: 'build',
    sourcemap: false,
    target: 'esnext',
    minify: 'esbuild',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          icons: ['react-icons', 'lucide-react'],
          animations: ['framer-motion'],
          threejs: ['three', '@react-three/fiber', '@react-three/drei'],
          particles: ['@tsparticles/react', '@tsparticles/slim']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  optimizeDeps: {
    include: ['react', 'react-dom']
  }
}))
