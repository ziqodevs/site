import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const root = dirname(fileURLToPath(import.meta.url))

/**
 * Single-page React app that is deployed as Cloudflare Workers *static assets*
 * plus a tiny Worker (`worker/index.ts`) that owns every `/api/*` route.
 *
 * Because the API is same-origin (`/api/...`) the browser never talks to
 * api.github.com in production: the Worker does, at the edge, with caching —
 * so anonymous rate limits are a non-issue and the payload is shared by every
 * visitor hitting the same colo.
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(root, 'src'),
    },
  },
  build: {
    target: 'es2022',
    outDir: 'dist',
    assetsDir: 'assets',
    cssCodeSplit: false,
    reportCompressedSize: true,
    rollupOptions: {
      output: {
        // Keep the framework in its own long-lived chunk; the app code churns
        // far more often than React does.
        manualChunks: {
          react: ['react', 'react-dom'],
        },
      },
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: false,
    // the live preview is served through a proxied sandbox hostname
    allowedHosts: true,
    // No `/api` proxy on purpose: in dev there is no Worker, and the client's
    // fetcher falls back to calling api.github.com straight from the browser
    // (CORS-friendly, cached in localStorage). Production always uses the
    // edge-cached Worker route instead.
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
    allowedHosts: true,
  },
})
