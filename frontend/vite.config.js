import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/tmdb-image': {
        target: 'https://image.tmdb.org/t/p',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/tmdb-image/, ''),
      }
    }
  }
})
