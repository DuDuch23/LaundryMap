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
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (id.includes('@uppy'))                                                    return; // pro pages only
          if (id.includes('leaflet'))                                                  return 'vendor-leaflet';
          if (id.includes('@base-ui'))                                                 return 'vendor-baseui';
          if (id.includes('yet-another-react-lightbox'))                               return 'vendor-lightbox';
          if (id.includes('lucide-react'))                                             return 'vendor-icons';
          // scheduler + @remix-run/* sont des deps internes de react-dom et react-router
          // les mettre dans un chunk séparé créait des cycles → on les group avec react
          // i18next/react-i18next restent dans index.js (interop CJS default import cross-chunk cassé)
          if (id.includes('react') || id.includes('@remix-run') || id.includes('scheduler')) return 'vendor-react';
        },
      },
    },
  },
})
