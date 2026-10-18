import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.VITE_SUPABASE_URL': JSON.stringify(
        process.env.VITE_SUPABASE_URL && !process.env.VITE_SUPABASE_URL.includes('qyhbyoojbmaguujzmdwz')
          ? process.env.VITE_SUPABASE_URL
          : 'https://yflgdfvjigbcnagcuism.supabase.co'
      ),
      'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(
        process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmbGdkZnZqaWdiY25hZ2N1aXNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA4MzYxMDQsImV4cCI6MjEwNjQxMjEwNH0.45kAiQU70KDqdvR5L_hFO9b6Cjyhkb28ymSBYdEueDQ'
      ),
    },
    resolve: {
      dedupe: ['react', 'react-dom'],
      alias: {
        '@': path.resolve(__dirname, '.'),
        '~': path.resolve(__dirname, './src'),
      },
    },
    optimizeDeps: {
      include: ['react', 'react-dom'],
    },
    build: {
      target: 'esnext',
      minify: 'esbuild',
      cssMinify: true,
      sourcemap: false,
      chunkSizeWarningLimit: 1200,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('recharts') || id.includes('d3-')) {
                return 'vendor-charts';
              }
              if (id.includes('lucide-react')) {
                return 'vendor-icons';
              }
              if (id.includes('@supabase')) {
                return 'vendor-supabase';
              }
              if (id.includes('leaflet')) {
                return 'vendor-leaflet';
              }
              if (id.includes('canvas-confetti') || id.includes('qrcode') || id.includes('html5-qrcode')) {
                return 'vendor-fx';
              }
            }
            if (id.includes('src/components/admin')) {
              return 'admin-portal';
            }
          },
        },
      },
    },
    server: {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
