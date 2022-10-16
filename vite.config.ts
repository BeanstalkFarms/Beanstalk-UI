import { splitVendorChunkPlugin } from 'vite';
import { defineConfig } from 'vitest/config';
import path from 'path';
import { createHtmlPlugin } from 'vite-plugin-html';
import react from '@vitejs/plugin-react';
import strip from '@rollup/plugin-strip';
import analyze from 'rollup-plugin-analyzer';

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => ({
  test: {
    globals: true,
  },
  server: {
    hmr: {
      overlay: true
    }
  },
  plugins: [
    react({
      // This definition ensures that the `css` prop from Emotion 
      // works at build time. The one in tsconfig.json ensures that
      // the IDE doesn't throw errors when using the prop.
      jsxImportSource: '@emotion/react',
    }),
    createHtmlPlugin({
      minify: true,
    }),
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
    sourcemap: command === 'serve',
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
}));
