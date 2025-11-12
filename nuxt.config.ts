export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  
  modules: [
    '@pinia/nuxt',
    '@nuxtjs/sitemap',
    '@nuxtjs/robots'
  ],

  runtimeConfig: {
    public: {
      kudagoApiUrl: 'https://kudago.com/public-api/v1.4'
    }
  },

  nitro: {
    storage: {
      redis: {
        driver: 'redis',
      }
    }
  },

  sitemap: {
    sources: [
      '/api/__sitemap__/urls'
    ],
    cacheMaxAgeSeconds: 24 * 60 * 60,
    xsl: false
  },

  css: [
    '~/assets/css/style.scss'
  ],

  srcDir: 'app/',
  dir: {
    pages: 'pages',
    middleware: 'middleware'
  }
})
