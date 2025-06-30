
export function useTextFormatter() {

    const formatText = (text) => {
        if (!text) return '';

        // تبدیل خطوط جدید به BR
        let formatted = text.replace(/\n/g, '<br>');

        // تشخیص و تبدیل لینک‌ها
        const urlRegex = /(https?:\/\/[^\s<>]+)/g;
        formatted = formatted.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer" style="color: #007bff; text-decoration: underline;">$1</a>');

        // تشخیص ایمیل
        const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
        formatted = formatted.replace(emailRegex, '<a href="mailto:$1" style="color: #007bff; text-decoration: underline;">$1</a>');

        return formatted;
    };

    return {
        formatText
    };
}