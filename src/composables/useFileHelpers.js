/**
 * composable برای مدیریت فایل‌ها
 */
export function useFileHelpers() {
    /**
     * دریافت آیکون مناسب براساس نوع فایل
     * @param {string} fileType - نوع فایل (پسوند)
     * @returns {string} - کلاس Font Awesome متناسب با نوع فایل
     */
    const getFileIcon = (fileType) => {
        if (!fileType) return 'fas fa-file';

        switch (fileType.toLowerCase()) {
            case 'pdf':
                return 'fas fa-file-pdf';
            case 'doc':
            case 'docx':
                return 'fas fa-file-word';
            case 'xls':
            case 'xlsx':
                return 'fas fa-file-excel';
            case 'ppt':
            case 'pptx':
                return 'fas fa-file-powerpoint';
            case 'zip':
            case 'rar':
                return 'fas fa-file-archive';
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
                return 'fas fa-file-image';
            case 'mp4':
            case 'webm':
            case 'avi':
                return 'fas fa-file-video';
            case 'mp3':
            case 'wav':
                return 'fas fa-file-audio';
            default:
                return 'fas fa-file';
        }
    };

    /**
     * تبدیل نام فایل به نام بدون پسوند
     * @param {string} filename - نام کامل فایل
     * @returns {string} - نام فایل بدون پسوند
     */
    const getFileName = (filename) => {
        if (!filename) return '';
        return filename.split('.').slice(0, -1).join('.');
    };

    /**
     * دریافت پسوند فایل
     * @param {string} filename - نام کامل فایل
     * @returns {string} - پسوند فایل
     */
    const getFileExtension = (filename) => {
        if (!filename) return '';
        return filename.split('.').pop().toLowerCase();
    };

    /**
     * بررسی اینکه آیا فایل تصویر است
     * @param {string} filename - نام کامل فایل
     * @returns {boolean} - آیا فایل تصویر است؟
     */
    const isImageFile = (filename) => {
        const ext = getFileExtension(filename);
        return ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext);
    };

    /**
     * بررسی اینکه آیا فایل ویدیو است
     * @param {string} filename - نام کامل فایل
     * @returns {boolean} - آیا فایل ویدیو است؟
     */
    const isVideoFile = (filename) => {
        const ext = getFileExtension(filename);
        return ['mp4', 'webm', 'avi', 'mov', 'mkv'].includes(ext);
    };

    return {
        getFileIcon,
        getFileName,
        getFileExtension,
        isImageFile,
        isVideoFile
    };
}