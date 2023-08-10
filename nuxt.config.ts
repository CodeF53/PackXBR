// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  css: ['~/assets/styles/layout.scss', '~/assets/styles/misc.scss'],

  // don't die when compiling with @jsquash packages
  build: { transpile: ['@jsquash/png'] },
  vite: {
    optimizeDeps: { exclude: ['@jsquash/png'] },
    worker: { format: 'es' },
  },
})
