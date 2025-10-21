import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [dts()],
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        'react/index': resolve(__dirname, 'src/react/index.ts'),
      },
      formats: ['es'],
    },
    rollupOptions: {
      external: ['pyodide', 'react', 'react-dom', 'swr'],
      output: {
        preserveModules: false,
      },
    },
    outDir: 'dist',
    emptyOutDir: true,
  },
  esbuild: {
    target: 'es2020',
  },
  test: {
    environment: 'node',
    exclude: ['**/browser.test.ts', '**/node_modules/**'],
    include: ['tests/container.test.ts'],
  },
});
