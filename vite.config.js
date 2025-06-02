import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  define: {
    // تعریف process.env برای استفاده در کل پروژه
    'process.env': {
      NODE_ENV: JSON.stringify(process.env.NODE_ENV),
      BASE_URL: JSON.stringify('/'),
      VUE_APP_API_URL: JSON.stringify(process.env.VUE_APP_API_URL || '/api')
      // سایر متغیرهای محیطی که در پروژه استفاده می‌کنید را اینجا اضافه کنید
    }
  },
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:8080',
          changeOrigin: true
        }
      }

  }
})