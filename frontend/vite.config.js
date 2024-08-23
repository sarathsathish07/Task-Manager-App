import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  root: './', // The root is the current folder (frontend)
  plugins: [react()],
  build: {
    outDir: 'dist', // Output directory will be in the project root (../dist)
    emptyOutDir: true, // Clear the output directory before building
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // Your backend server
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
