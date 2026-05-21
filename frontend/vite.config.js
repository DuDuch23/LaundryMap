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
          if (id.includes('@uppy'))                          return; // chargé à la demande (pages pro uniquement)
          if (id.includes('leaflet'))                        return 'vendor-leaflet';
          if (id.includes('@base-ui'))                       return 'vendor-baseui';
          if (id.includes('yet-another-react-lightbox'))     return 'vendor-lightbox';
          if (id.includes('i18next') || id.includes('react-i18next')) return 'vendor-i18n';
          if (id.includes('lucide-react'))                   return 'vendor-icons';
          if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) return 'vendor-react';
          return 'vendor-misc';
        },
      },
    },
  },
})
