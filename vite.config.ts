import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react(), tailwindcss()],

  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },

  // ── Dev server ──────────────────────────────────────────────
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },

  // ── Production build ────────────────────────────────────────
  build: {
    target: 'esnext',
    minify: 'esbuild',
    cssMinify: true,
    sourcemap: false,           // No sourcemaps in production
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor':  ['react', 'react-dom'],
          'motion':        ['motion'],
          'icons':         ['lucide-react'],
          'supabase':      ['@supabase/supabase-js'],
          'agora':         ['agora-rtc-sdk-ng'],
        },
      },
    },
  },

  // ── Optimize cold starts ────────────────────────────────────
  optimizeDeps: {
    include: ['react', 'react-dom', 'motion', 'lucide-react', '@supabase/supabase-js'],
  },
})
