import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/vehicles': {target: 'http://localhost:8080', changeOrigin: true},
      '/repairs': {target: 'http://localhost:8080', changeOrigin: true},
      '/api/instructors': {target: 'http://localhost:8080', changeOrigin: true},
      '/users': {target: 'http://localhost:8080', changeOrigin: true},
    }
  }
})
