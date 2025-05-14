// src/main.js
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from 'axios'

// استایل‌ها
import './assets/styles/main.css'
import 'bootstrap/dist/css/bootstrap.rtl.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import '@fortawesome/fontawesome-free/css/all.min.css'

// پلاگین‌ها
import PerformancePlugin from './plugins/performance'
import ErrorHandler from './plugins/errorHandler'
import UserGuide from './plugins/userGuide'
import ToastPlugin from './plugins/toast'

// اضافه کردن ماژول notification به store
import notification from './store/notification'
store.registerModule('notification', notification)

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

// ایجاد نمونه Vue
const app = createApp(App)

// ثبت پلاگین‌ها
app.use(router)
app.use(store)
app.use(PerformancePlugin)
app.use(ErrorHandler)
app.use(UserGuide)
app.use(ToastPlugin)

// ثبت اشیا عمومی
app.config.globalProperties.$http = axios

// اضافه کردن فیلترهای عمومی
app.config.globalProperties.$filters = {
    formatDate(date) {
        if (!date) return 'نامشخص'
        const dateObj = new Date(date)
        return new Intl.DateTimeFormat('fa-IR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).format(dateObj)
    },

    formatTime(seconds) {
        if (!seconds) return '00:00:00'
        const hours = Math.floor(seconds / 3600)
        const minutes = Math.floor((seconds % 3600) / 60)
        const secs = seconds % 60

        return [
            hours.toString().padStart(2, '0'),
            minutes.toString().padStart(2, '0'),
            secs.toString().padStart(2, '0')
        ].join(':')
    },

    formatNumber(number) {
        if (number === null || number === undefined) return 0
        return new Intl.NumberFormat('fa-IR').format(number)
    },

    truncate(text, length, suffix = '...') {
        if (!text) return ''
        if (text.length <= length) return text
        return text.substring(0, length) + suffix
    }
}

// اضافه کردن کامپوننت NotificationsContainer به app
import NotificationsContainer from '@/components/common/NotificationsContainer.vue'
app.component('NotificationsContainer', NotificationsContainer)

// آماده‌سازی محیط برای توسعه‌دهندگان
if (process.env.NODE_ENV === 'development') {
    console.log('Running in development mode')
    window.app = app
    window.router = router
    window.store = store
    window.axios = axios
}

// نصب اپلیکیشن
app.mount('#app')