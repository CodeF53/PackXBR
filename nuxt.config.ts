// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  css: ['~/assets/styles/layout.scss', '~/assets/styles/misc.scss', '~/assets/styles/components.scss'],

  build: { transpile: ['@jsquash/png', '@jsquash/oxipng'] },
  vite: {
    optimizeDeps: { exclude: ['@jsquash/png', '@jsquash/oxipng'] },
    worker: { format: 'es' },
  },
  app: {
    head: {
      title: 'PackXBR',
      link: [
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
        { rel: 'manifest', href: '/site.webmanifest' },
      ],
      meta: [
        { name: 'description', content: 'Bulk Pixel Art Upscaler' },
        { name: 'keywords', content: 'xBR, xBRZ, pixel art, upscaler, bulk' },
        { name: 'author', content: 'F53' },
        { name: 'theme-color', content: '#4b0000' },
        // twitter stuff
        { property: 'og:title', content: 'PackXBR' },
        { property: 'og:description', content: 'Bulk Pixel Art Upscaler' },
        { property: 'og:image', content: '/android-chrome-512x512.png' },
        { name: 'twitter:card', content: 'summary' },
        { name: 'twitter:site', content: '@CodeF53' },
        { name: 'twitter:creator', content: '@CodeF53' },
      ],
    },
  },
})
