// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/ui'],
  css: ['~/assets/css/main.css'],
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  
  // Enable SSR
  ssr: true,
  
  // Nitro server configuration
  nitro: {
    preset: 'node-server'
  },
  
  // App configuration
  app: {
    head: {
      title: 'Doable - Project Management',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Modern project management platform' }
      ]
    }
  }
})
