/**
 * Composable برای مدیریت تکالیف
 */
import { ref, computed } from 'vue';
import axios from 'axios';

export function useAssignments() {
    const loading = ref(false);
    const error = ref(null);
    const assignments = ref([]);
    const submissions = ref([]);

    const fetchLessonAssignments = async (lessonId) => {
        loading.value = true;
        error.value = null;
        try {
            const response = await axios.get(`/assignments/lesson/${lessonId}`);
            assignments.value = response.data || [];
            return assignments.value;
        } catch (err) {
            error.value = 'خطا در دریافت تکالیف';
            throw err;
        } finally {
            loading.value = false;
        }
    };

    const submitAssignment = async (assignmentId, formData) => {
        loading.value = true;
        error.value = null;
        try {
            const response = await axios.post(`/assignments/${assignmentId}/submit`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response.data;
        } catch (err) {
            error.value = 'خطا در ارسال تکلیف';
            throw err;
        } finally {
            loading.value = false;
        }
    };

    const fetchStudentSubmissions = async () => {
        loading.value = true;
        error.value = null;
        try {
            const response = await axios.get('/assignments/submissions/student');
            submissions.value = response.data || [];
            return submissions.value;
        } catch (err) {
            error.value = 'خطا در دریافت ارسالی‌ها';
            throw err;
        } finally {
            loading.value = false;
        }
    };

    return {
        loading: computed(() => loading.value),
        error: computed(() => error.value),
        assignments,
        submissions,
        fetchLessonAssignments,
        submitAssignment,
        fetchStudentSubmissions
    };
}