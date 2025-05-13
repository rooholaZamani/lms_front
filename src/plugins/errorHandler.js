// src/plugins/errorHandler.js
import axios from 'axios'
import router from '@/router'
import store from '@/store'

export default {
    install(app) {
        // مدیریت خطاهای سراسری Vue
        app.config.errorHandler = (err, vm, info) => {
            console.error('Vue Error:', err);

            // اینجا می‌توانید خطاها را به یک سرویس ثبت خطا ارسال کنید
            // logErrorToService(err, vm, info);

            app.config.globalProperties.$toast.error('خطایی رخ داده است. لطفاً صفحه را بارگذاری مجدد کنید.');
        };

        // میان‌افزار Axios برای مدیریت خطاهای HTTP
        axios.interceptors.response.use(
            response => response,
            error => {
                // مدیریت خطای 401 (Unauthorized)
                if (error.response && error.response.status === 401) {
                    store.dispatch('auth/logout')
                        .then(() => {
                            router.push({
                                name: 'Login',
                                query: {
                                    redirect: router.currentRoute.value.fullPath,
                                    sessionExpired: 'true'
                                }
                            });

                            app.config.globalProperties.$toast.error('جلسه شما منقضی شده است. لطفاً دوباره وارد شوید.');
                        });
                }

                // مدیریت خطای 403 (Forbidden)
                else if (error.response && error.response.status === 403) {
                    router.push({ name: 'Forbidden' });
                    app.config.globalProperties.$toast.error('شما مجوز دسترسی به این بخش را ندارید.');
                }

                // مدیریت خطای 404 (Not Found)
                else if (error.response && error.response.status === 404) {
                    app.config.globalProperties.$toast.error('منبع درخواستی یافت نشد.');
                }

                // مدیریت خطای 500 (Internal Server Error)
                else if (error.response && error.response.status >= 500) {
                    app.config.globalProperties.$toast.error('خطای سرور رخ داده است. لطفاً بعداً دوباره تلاش کنید.');
                }

                // مدیریت خطای Network Error
                else if (error.message === 'Network Error') {
                    app.config.globalProperties.$toast.error('خطای شبکه: لطفاً اتصال اینترنت خود را بررسی کنید.');
                }

                // ثبت خطا در کنسول
                console.error('API Error:', error);

                return Promise.reject(error);
            }
        );

        // تنظیم متد سراسری برای نمایش خطاها
        app.config.globalProperties.$showError = (error) => {
            let errorMessage = 'خطایی رخ داده است. لطفاً دوباره تلاش کنید.';

            if (error.response && error.response.data && error.response.data.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }

            app.config.globalProperties.$toast.error(errorMessage);
        };

        // برای امکان استفاده در کامپوننت‌های Composition API
        window.showError = (error) => {
            let errorMessage = 'خطایی رخ داده است. لطفاً دوباره تلاش کنید.';

            if (error.response && error.response.data && error.response.data.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }

            store.dispatch('notification/showError', errorMessage);
        };
    }
}