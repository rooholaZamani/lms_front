/**
 * composable برای دریافت داده‌های مرتبط با کاربر
 */
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

export function useUser() {
    const store = useStore();
    const router = useRouter();

    /**
     * دریافت اطلاعات کاربر فعلی
     */
    const currentUser = computed(() => store.getters.currentUser);

    /**
     * بررسی وضعیت ورود کاربر
     */
    const isLoggedIn = computed(() => store.getters.isLoggedIn);

    /**
     * بررسی نقش کاربر - آیا معلم است؟
     */
    const isTeacher = computed(() => store.getters.userRole.isTeacher);

    /**
     * بررسی نقش کاربر - آیا دانش‌آموز است؟
     */
    const isStudent = computed(() => store.getters.userRole.isStudent);

    /**
     * دریافت نام کامل کاربر
     * @param {object} user - اطلاعات کاربر
     * @returns {string} - نام کامل کاربر یا نام کاربری
     */
    const getUserFullName = (user) => {
        if (!user) return 'نامشخص';
        return user.firstName && user.lastName
            ? `${user.firstName} ${user.lastName}`
            : user.username;
    };

    /**
     * خروج کاربر
     */
    const logout = async () => {
        await store.dispatch('auth/logout');
        router.push({ name: 'Login' });
        return true;
    };

    return {
        currentUser,
        isLoggedIn,
        isTeacher,
        isStudent,
        getUserFullName,
        logout
    };
}