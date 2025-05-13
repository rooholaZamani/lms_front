// src/plugins/performance.js
export default {
    install(app) {
        // مشخص کردن کامپوننت‌های که باید کش شوند
        app.config.performance = process.env.NODE_ENV !== 'production';

        // تنظیم CacheManager برای کامپوننت‌های پرکاربرد
        const cacheManager = {
            data: new Map(),

            get(key) {
                return this.data.get(key);
            },

            set(key, value, ttl = 300000) { // پیش‌فرض: 5 دقیقه
                if (this.data.has(key)) {
                    clearTimeout(this.data.get(key).timeout);
                }

                const timeout = setTimeout(() => {
                    this.data.delete(key);
                }, ttl);

                this.data.set(key, {
                    value,
                    timeout,
                    timestamp: Date.now()
                });
            },

            remove(key) {
                if (this.data.has(key)) {
                    clearTimeout(this.data.get(key).timeout);
                    this.data.delete(key);
                }
            },

            clear() {
                this.data.forEach(item => {
                    clearTimeout(item.timeout);
                });
                this.data.clear();
            }
        };

        app.config.globalProperties.$cache = cacheManager;

        // میدل‌ویر router برای لود تنبل (lazy loading) کامپوننت‌ها
        app.router?.beforeEach((to, from, next) => {
            // ثبت زمان شروع ناوبری
            window.routeChangeStartTime = Date.now();
            next();
        });

        app.router?.afterEach(() => {
            // محاسبه زمان ناوبری
            if (window.routeChangeStartTime) {
                const routeChangeDuration = Date.now() - window.routeChangeStartTime;
                console.log(`Route change took ${routeChangeDuration}ms`);

                // می‌توان این اطلاعات را برای تحلیل عملکرد به سرویس آنالیتیکس ارسال کرد
                // reportPerformanceMetric('route-change', routeChangeDuration);
            }
        });

        // استفاده از Intersection Observer برای لود تنبل تصاویر
        app.directive('lazy-image', {
            mounted(el, binding) {
                function loadImage() {
                    if (binding.value) {
                        el.src = binding.value;
                    }
                    observer.unobserve(el);
                }

                function handleIntersect(entries, observer) {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            loadImage();
                        }
                    });
                }

                const observer = new IntersectionObserver(handleIntersect, {
                    rootMargin: '50px',
                    threshold: 0.1
                });

                observer.observe(el);
            },

            beforeUnmount(el) {
                // پاکسازی observer
                if (el._observer) {
                    el._observer.unobserve(el);
                    delete el._observer;
                }
            }
        });

        // ثبت متریک‌های عملکرد در console
        if (process.env.NODE_ENV === 'development') {
            if (window.performance) {
                window.addEventListener('load', () => {
                    let perfEntries = window.performance.getEntriesByType('navigation');

                    if (perfEntries.length > 0) {
                        const metrics = perfEntries[0];

                        console.group('Performance Metrics');
                        console.log(`Time to First Byte: ${Math.round(metrics.responseStart - metrics.requestStart)}ms`);
                        console.log(`DOM Content Loaded: ${Math.round(metrics.domContentLoadedEventStart - metrics.navigationStart || metrics.startTime)}ms`);
                        console.log(`First Paint: ${Math.round(metrics.responseEnd - metrics.navigationStart || metrics.startTime)}ms`);
                        console.log(`Window Load: ${Math.round(metrics.loadEventStart - metrics.navigationStart || metrics.startTime)}ms`);
                        console.groupEnd();
                    }
                });
            }
        }
    }
}