import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  build: {
    // Enable source maps for debugging
    sourcemap: false,
    // Minification settings
    minify: 'esbuild',
    // Chunk size warning limit (in KB)
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          // React core
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // Ant Design (large library)
          'vendor-antd': ['antd', '@ant-design/icons'],
          // TanStack libraries
          'vendor-tanstack': ['@tanstack/react-query', '@tanstack/react-table'],
          // Form and validation
          'vendor-form': ['react-hook-form', '@hookform/resolvers', 'zod'],
          // Utilities
          'vendor-utils': ['axios', 'dayjs', 'decimal.js', 'zustand'],
        },
      },
    },
  },
});
