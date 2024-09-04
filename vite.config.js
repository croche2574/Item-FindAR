const path = require('path')
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
    assetsInclude: ['**/*.glb'],
    base: './',
    commonjsOptions: {
        esmExternals: true,
     },
    optimizeDeps: {
        include: ['@react-three/fiber']
    },
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg,json,glb}']
            },
            manifest: {
                name: 'Item FindAR', 
                short_name: 'FindAR',
                description: 'An App for finding and identifying food products while shopping',
                background_color: '#848484',
                theme_color: '#1976d2',
                orientation: 'portrait',
            },
            pwaAssets: {
                overrideManifestIcons: true,
                injectThemeColor: true,
                image: path.resolve('src/assets/icon.png')
            },
            devOptions: {
                enabled: true,
                type: 'module',
            },
        })
    ]

})