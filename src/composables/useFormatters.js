/**
 * composable برای فرمت کردن داده‌های مختلف
 */
export function useFormatters() {
    /**
     * تبدیل تاریخ میلادی به شمسی
     * @param {string} dateString - تاریخ به فرمت ISO یا هر فرمت معتبر
     * @returns {string} - تاریخ شمسی یا 'نامشخص' در صورت خالی بودن ورودی
     */
    const formatDate = (dateString) => {
        if (!dateString) return 'نامشخص';
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('fa-IR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).format(date);
    };

    /**
     * تبدیل سایز فایل به فرمت خوانا
     * @param {number} bytes - حجم فایل به بایت
     * @returns {string} - سایز فایل به فرمت خوانا (مثلاً "1.5 MB")
     */
    const formatFileSize = (bytes) => {
        if (!bytes || bytes === 0) return '0 B';

        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));

        return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
    };

    /**
     * فرمت کردن زمان به صورت ساعت:دقیقه:ثانیه
     * @param {number} seconds - زمان به ثانیه
     * @returns {string} - زمان به فرمت "HH:MM:SS"
     */
    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        return [
            hours.toString().padStart(2, '0'),
            minutes.toString().padStart(2, '0'),
            secs.toString().padStart(2, '0')
        ].join(':');
    };

    /**
     * خلاصه کردن متن با نقطه‌چین
     * @param {string} text - متن اصلی
     * @param {number} maxLength - حداکثر طول مجاز
     * @returns {string} - متن خلاصه شده
     */
    const truncateText = (text, maxLength) => {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    return { formatDate, formatFileSize, formatTime, truncateText };
}