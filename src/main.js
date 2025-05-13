import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from 'axios'
import 'bootstrap/dist/css/bootstrap.rtl.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import '@fortawesome/fontawesome-free/css/all.min.css'

// تنظیم URL پایه برای Axios
axios.defaults.baseURL = process.env.VUE_APP_API_URL || '/api'

// ارسال توکن احراز هویت با هر درخواست
axios.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// مدیریت خطاهای درخواست
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      // در صورت خطای احراز هویت، کاربر را به صفحه ورود منتقل می‌کنیم
      store.dispatch('logout')
      router.push('/login')
    }
    return Promise.reject(error)
  }
)

const app = createApp(App)

// مقدار دهی اولیه
app.config.globalProperties.$http = axios

app.use(router)
app.use(store)

app.mount('#app')
