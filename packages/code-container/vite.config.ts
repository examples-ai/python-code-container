import { defineConfig } from 'vite'
import { resolve } from 'path'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [dts()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'CodeContainer',
      fileName: 'index',
      formats: ['es']
    },
    rollupOptions: {
      external: ['@webcontainer/api'],
      output: {
        globals: {
          '@webcontainer/api': 'WebContainerApi'
        }
      }
    },
    outDir: 'dist',
    emptyOutDir: true
  },
  esbuild: {
    target: 'es2020'
  },
  test: {
    environment: 'node',
    exclude: ['**/browser.test.ts', '**/node_modules/**'],
    include: ['tests/container.test.ts']
  }
})