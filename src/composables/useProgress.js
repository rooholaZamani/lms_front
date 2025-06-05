/**
 * Composable برای مدیریت پیشرفت تحصیلی
 */
import { ref, computed } from 'vue';
import axios from 'axios';

export function useProgress() {
    const loading = ref(false);
    const error = ref(null);
    const progressData = ref([]);
    const progressStats = ref({
        totalCourses: 0,
        completedCourses: 0,
        averageProgress: 0
    });

    // Methods
    const fetchStudentProgress = async () => {
        loading.value = true;
        error.value = null;
        try {
            const response = await axios.get('/progress');
            progressData.value = response.data || [];
            return progressData.value;
        } catch (err) {
            error.value = 'خطا در دریافت پیشرفت';
            throw err;
        } finally {
            loading.value = false;
        }
    };

    const fetchProgressStats = async () => {
        loading.value = true;
        error.value = null;
        try {
            const response = await axios.get('/progress/stats');
            progressStats.value = response.data;
            return progressStats.value;
        } catch (err) {
            error.value = 'خطا در دریافت آمار پیشرفت';
            throw err;
        } finally {
            loading.value = false;
        }
    };

    const markLessonComplete = async (lessonId, timeSpent = 0) => {
        try {
            await axios.post(`/progress/lesson/${lessonId}/complete?timeSpent=${timeSpent}`);
            await fetchStudentProgress(); // Refresh data
        } catch (err) {
            error.value = 'خطا در ثبت تکمیل درس';
            throw err;
        }
    };

    const markContentViewed = async (contentId, timeSpent = 0) => {
        try {
            await axios.post(`/progress/content/${contentId}/view?timeSpent=${timeSpent}`);
        } catch (err) {
            console.error('Error marking content viewed:', err);
        }
    };

    const markContentComplete = async (contentId, timeSpent = 0) => {
        try {
            await axios.post(`/progress/content/${contentId}/complete?timeSpent=${timeSpent}`);
            await fetchStudentProgress(); // Refresh data
        } catch (err) {
            error.value = 'خطا در ثبت تکمیل محتوا';
            throw err;
        }
    };

    return {
        loading: computed(() => loading.value),
        error: computed(() => error.value),
        progressData,
        progressStats,
        fetchStudentProgress,
        fetchProgressStats,
        markLessonComplete,
        markContentViewed,
        markContentComplete
    };
}