import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'icon.svg', 'icon-192.png', 'icon-512.png'],
      manifest: {
        name: '말메 AI',
        short_name: '말메 AI',
        description: '말하면 AI가 정리해드려요 — 음성 메모',
        lang: 'ko',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#faf5ff',
        theme_color: '#7c3aed',
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // SPA 라우팅: 오프라인 시 index.html 로 폴백
        navigateFallback: 'index.html',
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
      },
    }),
  ],
  server: {
    port: 5173,
    watch: {
      // WSL2에서 /mnt/c (Windows 파일시스템)의 변경을 감지하려면 폴링이 필요합니다.
      // (inotify 이벤트가 마운트를 넘어 전달되지 않아 HMR 이 동작하지 않는 문제 해결)
      usePolling: true,
      interval: 300,
    },
  },
})
