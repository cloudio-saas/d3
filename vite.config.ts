import { defineConfig } from 'vite';
import path from 'path';
import react from '@vitejs/plugin-react';

const resolveFixup = {
  name: 'resolve-fixup',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setup(build: any) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    build.onResolve({ filter: /react\/jsx-runtime.js/ }, async (args: any) => {
      return {
        path: path.resolve('./node_modules/react/jsx-runtime.js'),
      };
    });
  },
};

// https://vitejs.dev/config/
export default defineConfig({
  optimizeDeps: {
    esbuildOptions: {
      plugins: [resolveFixup],
      target: 'es2020',
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      cloudio: '/src/_/cloudio',
    },
  },
});
