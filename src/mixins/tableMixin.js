/**
 * میکسین پایه برای کامپوننت‌های جدول
 */
export default {
    methods: {
        /**
         * فرمت کردن تاریخ میلادی به شمسی
         * @param {string} dateString - تاریخ
         * @returns {string} - تاریخ شمسی یا 'نامشخص'
         */
        formatDate(dateString) {
            if (!dateString) return 'نامشخص';
            const date = new Date(dateString);
            return new Intl.DateTimeFormat('fa-IR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            }).format(date);
        },

        /**
         * دریافت نام کامل دانش‌آموز
         * @param {object} student - اطلاعات دانش‌آموز
         * @returns {string} - نام و نام خانوادگی یا نام کاربری یا 'نامشخص'
         */
        getStudentName(student) {
            if (!student) return 'نامشخص';
            return student.firstName && student.lastName
                ? `${student.firstName} ${student.lastName}`
                : student.username;
        },

        /**
         * دریافت نام کامل معلم
         * @param {object} teacher - اطلاعات معلم
         * @returns {string} - نام و نام خانوادگی یا نام کاربری یا 'نامشخص'
         */
        getTeacherName(teacher) {
            if (!teacher) return 'نامشخص';
            return teacher.firstName && teacher.lastName
                ? `${teacher.firstName} ${teacher.lastName}`
                : teacher.username;
        },

        /**
         * دریافت عنوان دوره
         * @param {object} course - اطلاعات دوره
         * @returns {string} - عنوان دوره یا 'نامشخص'
         */
        getCourseTitle(course) {
            if (!course) return 'نامشخص';
            return course.title || 'نامشخص';
        },

        /**
         * دریافت عنوان درس
         * @param {object} lesson - اطلاعات درس
         * @returns {string} - عنوان درس یا 'نامشخص'
         */
        getLessonTitle(lesson) {
            if (!lesson) return 'نامشخص';
            return lesson.title || 'نامشخص';
        },

        /**
         * فرمت کردن حجم فایل
         * @param {number} bytes - حجم فایل به بایت
         * @returns {string} - حجم فایل به فرمت خوانا
         */
        formatFileSize(bytes) {
            if (!bytes || bytes === 0) return '0 B';
            const sizes = ['B', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(1024));
            return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
        }
    }
}