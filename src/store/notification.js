// src/store/modules/notification.js
export default {
    namespaced: true,
    state: {
        notifications: []
    },
    getters: {
        getAllNotifications: state => state.notifications
    },
    mutations: {
        add(state, notification) {
            state.notifications.push({
                ...notification,
                id: Date.now()
            });
        },
        remove(state, id) {
            state.notifications = state.notifications.filter(notification => notification.id !== id);
        },
        clear(state) {
            state.notifications = [];
        }
    },
    actions: {
        add({ commit }, notification) {
            commit('add', {
                type: 'info',
                autoClose: true,
                duration: 5000,
                ...notification
            });

            // اگر autoClose فعال باشد، notifiction بعد از مدت مشخصی حذف می‌شود
            if (notification.autoClose !== false) {
                setTimeout(() => {
                    commit('remove', notification.id);
                }, notification.duration || 5000);
            }
        },

        remove({ commit }, id) {
            commit('remove', id);
        },

        clear({ commit }) {
            commit('clear');
        },

        showSuccess({ dispatch }, message) {
            dispatch('add', {
                message,
                type: 'success',
                icon: 'check-circle'
            });
        },

        showError({ dispatch }, message) {
            dispatch('add', {
                message,
                type: 'danger',
                icon: 'exclamation-circle',
                duration: 10000
            });
        },

        showInfo({ dispatch }, message) {
            dispatch('add', {
                message,
                type: 'info',
                icon: 'info-circle'
            });
        },

        showWarning({ dispatch }, message) {
            dispatch('add', {
                message,
                type: 'warning',
                icon: 'exclamation-triangle'
            });
        }
    }
}