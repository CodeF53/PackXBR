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
})
