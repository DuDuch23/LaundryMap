import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  server: {
    proxy: {
      '/uploads': {
        target: 'https://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
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
        // Forme objet : Rollup gère les deps transitives automatiquement, évite les problèmes d'interop CJS cross-chunk
        // vendor-uppy ABSENT intentionnellement : Rollup le bundle avec AjoutLaverie (lazy) → non préchargé sur la homepage
        manualChunks: {
          'vendor-react':    ['react', 'react-dom', 'react-router'],
          'vendor-leaflet':  ['leaflet', 'react-leaflet'],
          'vendor-baseui':   ['@base-ui/react'],
          'vendor-lightbox': ['yet-another-react-lightbox'],
        },
      },
    },
  },
})
