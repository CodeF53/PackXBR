// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  css: ['~/assets/styles/layout.scss', '~/assets/styles/misc.scss'],

  build: { transpile: ['@jsquash/png', 'jsquash-oxipng'] },
  vite: {
    optimizeDeps: { exclude: ['@jsquash/png', 'jsquash-oxipng'] },
    worker: { format: 'es' },
  },
})
