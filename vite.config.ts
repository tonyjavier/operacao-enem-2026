import { defineConfig } from 'vite';
import { readFileSync } from 'node:fs';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

const appVersion = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')).version;

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'app-version-meta',
      transformIndexHtml: (html) => html.replace('</head>', `  <meta name="app-version" content="${appVersion}" />\n  </head>`),
    },
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png', 'enem-banner.jpg'],
      manifest: {
        name: 'Operação ENEM 2026',
        short_name: 'Operação ENEM',
        description: 'Seu cronograma do Enem 2026, com progresso pessoal na nuvem.',
        start_url: '/',
        scope: '/',
        lang: 'pt-BR',
        display: 'standalone',
        background_color: '#F5F5F5',
        theme_color: '#111111',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,ico,png,woff2}'],
      },
    }),
  ],
  server: {
    host: '0.0.0.0',
    allowedHosts: ['5173-idnlig6k0xqd8dbqfwu4q-0dec87ac.us3.manus.computer'],
    port: 5173,
    strictPort: true,
  },
  preview: {
    allowedHosts: ['4173-idnlig6k0xqd8dbqfwu4q-0dec87ac.us3.manus.computer'],
  },
});
