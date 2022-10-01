import { splitVendorChunkPlugin } from 'vite';
import { defineConfig } from 'vitest/config';
import path from 'path';
import react from '@vitejs/plugin-react';
import strip from '@rollup/plugin-strip';
import analyze from 'rollup-plugin-analyzer';


// This plugin is a solution for an HRM/Vite/Context issue. 
// Details here: https://github.com/vitejs/vite/issues/3301#issuecomment-1191530937
const preserveRefPlugin = () => {
  const preverseRefFunc = `
    function __preserveRef(key, v) {
      if (import.meta.env.PROD) return v;

      import.meta.hot.data ??= {}
      import.meta.hot.data.contexts ??= {}
      const old = import.meta.hot.data.contexts[key];
      const now = old || v;

      import.meta.hot.on('vite:beforeUpdate', () => {
        import.meta.hot.data.contexts[key] = now;
      });

      return now;
    }
`;

  return {
    name: 'preserveRef',
    transform(code) {
      if (!code.includes('__preserveRef')) return;

      return {
        code: code + preverseRefFunc,
        map: null,
      };
    },
  };
};

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => ({
  test: {
    globals: true,
  },
  server: {
    hmr: {
      overlay: true,
    },
  },
  plugins: [react(), splitVendorChunkPlugin(), analyze({ limit: 10 }), preserveRefPlugin()],
  resolve: {
    alias: [
      {
        find: '~',
        replacement: path.resolve(__dirname, 'src'),
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
      ],
    },
  },
}));


