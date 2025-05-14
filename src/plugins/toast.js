// src/plugins/toast.js
import { createApp, h } from 'vue';
import ToastContainer from '../components/common/ToastContainer.vue';

class Toast {
    constructor() {
        this.toasts = [];
        this.container = null;
        this.app = null;
    }

    init() {
        // Create container element for toasts
        this.container = document.createElement('div');
        this.container.id = 'toast-container';
        document.body.appendChild(this.container);

        // Create and mount Vue app
        this.app = createApp({
            render: () => h(ToastContainer, {
                toasts: this.toasts,
                onRemove: (id) => this.remove(id)
            })
        });
        this.app.mount(this.container);
    }

    success(message, options = {}) {
        this.show({
            type: 'success',
            message,
            icon: 'check-circle',
            ...options
        });
    }

    error(message, options = {}) {
        this.show({
            type: 'danger',
            message,
            icon: 'exclamation-circle',
            ...options
        });
    }

    info(message, options = {}) {
        this.show({
            type: 'info',
            message,
            icon: 'info-circle',
            ...options
        });
    }

    warning(message, options = {}) {
        this.show({
            type: 'warning',
            message,
            icon: 'exclamation-triangle',
            ...options
        });
    }

    show(toast) {
        const id = Date.now();
        const newToast = {
            id,
            type: toast.type || 'info',
            message: toast.message,
            icon: toast.icon,
            autoClose: toast.autoClose !== false,
            duration: toast.duration || 5000
        };

        this.toasts.push(newToast);

        // Auto-close toast if enabled
        if (newToast.autoClose) {
            setTimeout(() => {
                this.remove(id);
            }, newToast.duration);
        }
    }

    remove(id) {
        const index = this.toasts.findIndex(toast => toast.id === id);
        if (index !== -1) {
            this.toasts.splice(index, 1);
        }
    }
}

export default {
    install(app) {
        const toast = new Toast();
        toast.init();

        // Add toast methods to the global properties
        app.config.globalProperties.$toast = toast;

        // Make toast available on window for use in composables or non-Vue contexts
        window.toast = toast;
    }
};