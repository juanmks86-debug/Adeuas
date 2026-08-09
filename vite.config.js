import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Cuentas Claras — Préstamos',
        short_name: 'Cuentas Claras',
        description: 'Llevá el control de lo que prestás y lo que debés',
        theme_color: '#0f151c',
        background_color: '#0f151c',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' }
        ],
        shortcuts: [
          {
            name: 'Nuevo préstamo que doy',
            short_name: 'Presto',
            url: '/?nuevo=doy',
            icons: [{ src: 'icon-192.png', sizes: '192x192', type: 'image/png' }]
          },
          {
            name: 'Nuevo préstamo que tomo',
            short_name: 'Debo',
            url: '/?nuevo=tomo',
            icons: [{ src: 'icon-192.png', sizes: '192x192', type: 'image/png' }]
          }
        ]
      }
    })
  ]
})
