import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // انتخاب فایل کانفیگ بر اساس mode
  const clientConfigFile = mode === 'company'
    ? './src/config/client.company.js'
    : './src/config/client.school.js'

  return {
    plugins: [
      vue(),
      vueDevTools(),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        '@client-config': fileURLToPath(new URL(clientConfigFile, import.meta.url)),
      },
    },
    define: {
      // تعریف process.env برای استفاده در کل پروژه
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV),
        BASE_URL: JSON.stringify('/'),
        VUE_APP_API_URL: JSON.stringify(process.env.VUE_APP_API_URL || '/api')
      }
    },
    server: {
      port: 5173,
      host: true,
      proxy: {
        '/api': {
          target: 'http://localhost:8080',
          changeOrigin: true,
          secure: false,
          timeout: 300000,
          proxyTimeout: 300000
        }
      }
    }
  }
})
