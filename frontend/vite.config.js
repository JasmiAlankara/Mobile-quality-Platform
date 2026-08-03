import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Configures Vite dev server with proxy settings to route /api traffic to port 8080
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  }
})
