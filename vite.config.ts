import { defineConfig, splitVendorChunkPlugin } from 'vite';
import path from 'path';
import react from '@vitejs/plugin-react';
import strip from '@rollup/plugin-strip';
import analyze from 'rollup-plugin-analyzer';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    hmr: {
      overlay: true
    }
  },
  plugins: [
    react(),
    splitVendorChunkPlugin(),
    analyze({ limit: 10 }),
  ],
  resolve: {
    alias: [
      {
        find: '~',
        replacement: path.resolve(__dirname, 'src')
      },
    ],
  },
  build: {
    sourcemap: false,
    reportCompressedSize: true,
    rollupOptions: {
      plugins: [
        strip({
          functions: ['console.debug'],
          include: '**/*.(ts|tsx)',
        }),
      ]
    }
  }
});