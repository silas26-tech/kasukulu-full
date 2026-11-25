import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        useCredentials: true,
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'icon.svg'],
        manifest: {
          id: '/',
          name: 'Kasukulu — Personalized AI Voice Tutors',
          short_name: 'Kasukulu',
          description: 'Personalized AI voice tutors for Zambian learners across Grade 7, 9, 12 and A-Level.',
          theme_color: '#047857',
          background_color: '#f8fafc',
          display: 'standalone',
          start_url: '/',
          scope: '/',
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          cleanupOutdatedCaches: true,
          skipWaiting: true,
          clientsClaim: true,
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5 MB
          navigateFallbackDenylist: [
            /^\/api\//,
            /^\/live/,
            /^\/papers\//,
            /^\/assets\/aistudio\//,
          ],
          // Past-paper PDFs: keep every paper the learner has opened (or saved with
          // "Save for offline") available without data. Cache name must match
          // PAPER_CACHE_NAME in PastPapersPanel.tsx.
          runtimeCaching: [
            {
              urlPattern: /\/(papers|assets\/aistudio)\/.*\.pdf$/i,
              handler: 'CacheFirst' as const,
              options: {
                cacheName: 'ecz-papers',
                rangeRequests: true,
                cacheableResponse: { statuses: [200] },
                expiration: {
                  // Keep at most 40 papers on a phone (about 60 to 100 MB). The oldest are removed first,
                  // and everything is cleared automatically if the phone runs low on storage.
                  maxEntries: 40,
                  maxAgeSeconds: 60 * 60 * 24 * 90,
                  purgeOnQuotaError: true,
                },
              },
            },
          ],
        },
        devOptions: {
          enabled: true,
          type: 'module',
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: false,
    },
  };
});
