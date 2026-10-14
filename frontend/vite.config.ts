import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('framer-motion'))                                           return 'vendor-motion'
            if (id.includes('@mui') || id.includes('@emotion'))                         return 'vendor-mui'
            // Exact packages only: a loose "react" match also caught @tiptap/react and
            // react-hook-form, putting the rich-text editor in every page's download.
            if (/[\\/]node_modules[\\/](react|react-dom|react-router|scheduler)[\\/]/.test(id)) return 'vendor-react'
          }
        },
      },
    },
  },
})
