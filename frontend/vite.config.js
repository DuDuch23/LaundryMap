import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react':   ['react', 'react-dom', 'react-router'],
          'vendor-leaflet': ['leaflet', 'react-leaflet'],
          'vendor-uppy':    ['@uppy/core', '@uppy/react', '@uppy/dashboard'],
          'vendor-baseui':  ['@base-ui/react'],
        },
      },
    },
  },
})
