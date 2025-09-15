import { defineConfig } from 'vite';
import { resolve } from 'path';
import type { Plugin } from 'vite';

// Plugin to enable cross-origin isolation for SharedArrayBuffer
const crossOriginIsolation = (): Plugin => ({
  name: 'cross-origin-isolation',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      // Set headers for cross-origin isolation (required for SharedArrayBuffer)
      res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
      res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      next();
    });
  },
  configurePreviewServer(server) {
    server.middlewares.use((req, res, next) => {
      res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
      res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      next();
    });
  },
  // Also configure for dev server
  config(config) {
    if (!config.server) config.server = {};
    if (!config.server.headers) config.server.headers = {};
    Object.assign(config.server.headers, {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Resource-Policy': 'cross-origin',
    });
  },
});

export default defineConfig({
  plugins: [crossOriginIsolation()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'CodeContainer',
      fileName: 'index',
      formats: ['es'],
    },
    rollupOptions: {
      external: ['@webcontainer/api'],
    },
    outDir: 'dist',
    emptyOutDir: true,
  },
  esbuild: {
    target: 'es2020',
  },
  test: {
    include: ['tests/*.browser.test.ts'],
    browser: {
      provider: 'playwright',
      enabled: true,
      instances: [
        {
          browser: 'chromium',
          // Launch options for cross-origin isolation support
          launchOptions: {
            args: [
              '--enable-features=SharedArrayBuffer',
              '--enable-blink-features=SharedArrayBuffer',
              '--disable-features=VizDisplayCompositor',
              '--disable-web-security',
              '--disable-features=site-per-process',
              '--allow-running-insecure-content',
              '--disable-features=BlockInsecurePrivateNetworkRequests',
            ],
          },
        },
      ],
      // Required for WebContainer SharedArrayBuffer support
      headless: false,
    },
  },
});
