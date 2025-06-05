/**
 * Composable برای مدیریت تمرین‌ها
 */
import { ref, computed } from 'vue';
import axios from 'axios';

export function useExercises() {
    const loading = ref(false);
    const error = ref(null);
    const exercises = ref([]);
    const currentExercise = ref(null);
    const submissions = ref([]);

    const fetchExerciseById = async (exerciseId) => {
        loading.value = true;
        error.value = null;
        try {
            const response = await axios.get(`/exercises/${exerciseId}`);
            currentExercise.value = response.data;
            return response.data;
        } catch (err) {
            error.value = 'خطا در دریافت تمرین';
            throw err;
        } finally {
            loading.value = false;
        }
    };

    const submitExercise = async (exerciseId, answers, answerTimes) => {
        loading.value = true;
        error.value = null;
        try {
            const response = await axios.post(`/exercises/${exerciseId}/submit`, {
                answers,
                answerTimes
            });
            return response.data;
        } catch (err) {
            error.value = 'خطا در ارسال تمرین';
            throw err;
        } finally {
            loading.value = false;
        }
    };

    const fetchExerciseDifficulty = async (exerciseId) => {
        try {
            const response = await axios.get(`/exercises/${exerciseId}/difficulty`);
            return response.data;
        } catch (err) {
            console.error('Error fetching exercise difficulty:', err);
            throw err;
        }
    };

    return {
        loading: computed(() => loading.value),
        error: computed(() => error.value),
        exercises,
        currentExercise,
        submissions,
        fetchExerciseById,
        submitExercise,
        fetchExerciseDifficulty
    };
}