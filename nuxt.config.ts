// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  srcDir: 'app',
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  site: {
    url: 'https://microcms-how.vercel.app',
    name: 'HOW TO?',
  },
  vite: {
    plugins: [tailwindcss()]
  },
  css: ['~/assets/css/main.css'],
  modules: ['@nuxtjs/i18n', '@nuxt/image', '@nuxtjs/seo'],
  i18n: {
    locales: [
      { code: 'ja', iso: 'ja-JP', name: '日本語', file: 'ja.json' },
      { code: 'en', iso: 'en-US', name: 'English', file: 'en.json' }
    ],
    defaultLocale: 'en',
    strategy: 'prefix_except_default',
    langDir: 'locales',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root',
      alwaysRedirect: false
    },
    compilation: {
      strictMessage: false
    }
  },
  typescript: {
    strict: true,
    typeCheck: true
  },
  runtimeConfig: {
    public: {
      siteName: "HOW TO?",
      siteDomain: "https://example.com",
    },
    microcms: {
      serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN,
      apiKey: process.env.MICROCMS_API_KEY,
    },
  }
})