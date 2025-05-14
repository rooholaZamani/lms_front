/**
 * میکسین برای کامپوننت‌های فرم
 */
export default {
    data() {
        return {
            isSubmitting: false,
            error: null,
            success: null
        }
    },
    methods: {
        /**
         * شروع عملیات ارسال فرم
         */
        startSubmitting() {
            this.isSubmitting = true;
            this.error = null;
            this.success = null;
        },

        /**
         * پایان عملیات ارسال فرم
         * @param {string|null} successMessage - پیام موفقیت
         * @param {string|null} errorMessage - پیام خطا
         */
        finishSubmitting(successMessage = null, errorMessage = null) {
            this.isSubmitting = false;
            if (successMessage) {
                this.success = successMessage;
                this.showSuccessToast(successMessage);
            }
            if (errorMessage) {
                this.error = errorMessage;
                this.showErrorToast(errorMessage);
            }
        },

        /**
         * نمایش پیام موفقیت
         * @param {string} message - پیام
         */
        showSuccessToast(message) {
            if (this.$toast) {
                this.$toast.success(message);
            }
        },

        /**
         * نمایش پیام خطا
         * @param {string} message - پیام
         */
        showErrorToast(message) {
            if (this.$toast) {
                this.$toast.error(message);
            }
        },

        /**
         * اعتبارسنجی فیلد ایمیل
         * @param {string} email - ایمیل
         * @returns {boolean} - آیا ایمیل معتبر است؟
         */
        isValidEmail(email) {
            const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(String(email).toLowerCase());
        },

        /**
         * اعتبارسنجی فیلد شماره تلفن ایران
         * @param {string} phone - شماره تلفن
         * @returns {boolean} - آیا شماره تلفن معتبر است؟
         */
        isValidIranianPhone(phone) {
            const re = /^09[0-9]{9}$/;
            return re.test(String(phone));
        },

        /**
         * اعتبارسنجی فیلد کد ملی ایران
         * @param {string} nationalId - کد ملی
         * @returns {boolean} - آیا کد ملی معتبر است؟
         */
        isValidIranianNationalId(nationalId) {
            if (!/^\d{10}$/.test(nationalId)) return false;

            const check = +nationalId[9];
            const sum = nationalId.split('').slice(0, 9)
                .map((num, idx) => +num * (10 - idx))
                .reduce((acc, curr) => acc + curr, 0) % 11;

            return sum < 2 ? check === sum : check + sum === 11;
        },

        /**
         * پاکسازی فرم
         * @param {object} form - آبجکت فرم
         */
        resetForm(form) {
            Object.keys(form).forEach(key => {
                if (typeof form[key] === 'string') {
                    form[key] = '';
                } else if (typeof form[key] === 'number') {
                    form[key] = 0;
                } else if (typeof form[key] === 'boolean') {
                    form[key] = false;
                } else if (Array.isArray(form[key])) {
                    form[key] = [];
                } else if (typeof form[key] === 'object' && form[key] !== null) {
                    form[key] = {};
                }
            });

            this.error = null;
            this.success = null;
        }
    }
}