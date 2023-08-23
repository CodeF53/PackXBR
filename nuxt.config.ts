import replaceWorkerImportMetaUrl from 'rollup-plugin-replace-worker-import-meta-url'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  css: ['~/assets/styles/layout.scss', '~/assets/styles/misc.scss'],

  build: { transpile: ['@jsquash/png', '@jsquash/oxipng'] },
  vite: {
    optimizeDeps: { exclude: ['@jsquash/png', '@jsquash/oxipng'] },
    plugins: [replaceWorkerImportMetaUrl()],
    worker: {
      plugins: [replaceWorkerImportMetaUrl()],
      format: 'es',
    },
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
        // twitter stuff
        { property: 'og:title', content: 'PackXBR' },
        { property: 'og:description', content: 'Bulk Pixel Art Upscaler' },
        { property: 'og:image', content: 'https://cdn.discordapp.com/attachments/821452669771972608/1143767310360916008/favicon.png' },
        { name: 'twitter:card', content: 'summary' },
        { name: 'twitter:site', content: '@CodeF53' },
        { name: 'twitter:creator', content: '@CodeF53' },
      ],
    },
  },
})
