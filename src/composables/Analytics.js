/**
 * Composable برای تحلیل‌های عمومی سیستم
 */
import { ref, computed } from 'vue';
import axios from 'axios';

export function useSystemAnalytics() {
    const loading = ref(false);
    const error = ref(null);

    const systemStats = ref({
        totalStudents: 0,
        totalCourses: 0,
        averageCompletion: 0,
        averageScore: 0
    });

    const fetchSystemStats = async () => {
        loading.value = true;
        error.value = null;
        try {
            const response = await axios.get('/analytics/teacher/system-overview');
            systemStats.value = response.data;
            return response.data;
        } catch (err) {
            error.value = 'خطا در دریافت آمار سیستم';
            throw err;
        } finally {
            loading.value = false;
        }
    };

    return {
        loading: computed(() => loading.value),
        error: computed(() => error.value),
        systemStats,
        fetchSystemStats
    };
}