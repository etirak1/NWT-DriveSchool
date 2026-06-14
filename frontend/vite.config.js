import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
  },
  server: {
    port: 5173,
    proxy: {
      '/vehicles':       { target: 'http://localhost:8080', changeOrigin: true },
      '/repairs':        { target: 'http://localhost:8080', changeOrigin: true },
      '/api/instructors':{ target: 'http://localhost:8080', changeOrigin: true },
      '/accounts':       { target: 'http://localhost:8080', changeOrigin: true },
      '/payments':       { target: 'http://localhost:8080', changeOrigin: true },
    }
  }
})