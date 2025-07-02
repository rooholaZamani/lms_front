// src/main.js
import { createApp } from 'vue'

import Vue3Toastify, { toast } from 'vue3-toastify'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from 'axios'

// استایل‌ها
import './assets/styles/main.css'
import './assets/styles/common-pages.css'
import 'bootstrap/dist/css/bootstrap.rtl.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import '@fortawesome/fontawesome-free/css/all.min.css'
import * as bootstrap from 'bootstrap'

window.bootstrap = bootstrap

// پلاگین‌ها
import PerformancePlugin from './plugins/performance'
import ErrorHandler from './plugins/errorHandler'
import UserGuide from './plugins/userGuide'



import VuePersianDatetimePicker from 'vue3-persian-datetime-picker'
// console.log(VuePersianDatetimePicker)

// اضافه کردن ماژول notification به store
import notification from './store/notification'
store.registerModule('notification', notification)

// تنظیم URL پایه برای Axios
// axios.defaults.baseURL = process.env.VUE_APP_API_URL || '/api'
axios.defaults.baseURL = 'http://localhost:8080/api';
axios.defaults.headers.common['Accept'] = 'application/json';

// ارسال توکن احراز هویت با هر درخواست
axios.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token')
        if (token) {
            config.headers['Authorization'] = `Basic ${token}`
        }
        return config
    },
    error => {
        return Promise.reject(error)
    }
)

// ایجاد نمونه Vue
const app = createApp(App)

app.component('DatePicker', VuePersianDatetimePicker)
// ثبت پلاگین‌ها
app.use(router)
app.use(store)
app.use(PerformancePlugin)
app.use(ErrorHandler)
app.use(UserGuide)

app.use(Vue3Toastify, {
    autoClose: 3000,
    position: 'top-left',
    rtl: true,
    theme: 'auto',
    transition: 'slide',
    pauseOnHover: true,
    closeOnClick: true,
    hideProgressBar: false
})

// ثبت اشیا عمومی
app.config.globalProperties.$http = axios
app.config.globalProperties.$toast = toast
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

// // اضافه کردن کامپوننت NotificationsContainer به app
// import NotificationsContainer from '@/components/common/NotificationsContainer.vue'
// app.component('NotificationsContainer', NotificationsContainer)


// نصب اپلیکیشن
app.mount('#app')