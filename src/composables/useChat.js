/**
 * Composable برای سیستم چت
 */
import { ref, computed } from 'vue';
import axios from 'axios';

export function useChat() {
    const loading = ref(false);
    const error = ref(null);
    const messages = ref([]);
    const unreadCount = ref(0);
    const participants = ref([]);

    const sendMessage = async (courseId, message) => {
        try {
            await axios.post(`/chat/course/${courseId}/send`, null, {
                params: { message }
            });
            await fetchMessages(courseId); // Refresh messages
        } catch (err) {
            error.value = 'خطا در ارسال پیام';
            throw err;
        }
    };

    const fetchMessages = async (courseId, page = 0, size = 20) => {
        loading.value = true;
        error.value = null;
        try {
            const response = await axios.get(`/chat/course/${courseId}/messages`, {
                params: { page, size }
            });
            messages.value = response.data.content || [];
            return response.data;
        } catch (err) {
            error.value = 'خطا در دریافت پیام‌ها';
            throw err;
        } finally {
            loading.value = false;
        }
    };

    const fetchUnreadCount = async (courseId) => {
        try {
            const response = await axios.get(`/chat/course/${courseId}/unread`);
            unreadCount.value = response.data.count || 0;
            return unreadCount.value;
        } catch (err) {
            console.error('Error fetching unread count:', err);
        }
    };

    const markAsRead = async (courseId) => {
        try {
            await axios.post(`/chat/course/${courseId}/mark-read`);
            unreadCount.value = 0;
        } catch (err) {
            console.error('Error marking as read:', err);
        }
    };

    return {
        loading: computed(() => loading.value),
        error: computed(() => error.value),
        messages,
        unreadCount,
        participants,
        sendMessage,
        fetchMessages,
        fetchUnreadCount,
        markAsRead
    };
}