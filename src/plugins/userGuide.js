// src/plugins/userGuide.js
import { createApp, h } from 'vue';
import UserGuideStep from '@/components/common/UserGuideStep.vue';

class UserGuide {
    constructor() {
        this.steps = [];
        this.currentStep = 0;
        this.active = false;
        this.container = null;
        this.app = null;
        this.onCompleteCallback = null;
    }

    setSteps(steps) {
        this.steps = steps;
        return this;
    }

    start(startIndex = 0) {
        if (this.steps.length === 0) {
            console.warn('No steps defined for the user guide');
            return;
        }

        this.currentStep = startIndex < this.steps.length ? startIndex : 0;
        this.active = true;
        this.render();

        return this;
    }

    stop() {
        this.active = false;
        if (this.app) {
            this.app.unmount();
            this.app = null;
        }
        if (this.container && document.body.contains(this.container)) {
            document.body.removeChild(this.container);
        }
        this.container = null;
        return this;
    }

    next() {
        if (this.currentStep < this.steps.length - 1) {
            this.currentStep++;
            this.render();
        } else {
            this.complete();
        }
        return this;
    }

    prev() {
        if (this.currentStep > 0) {
            this.currentStep--;
            this.render();
        }
        return this;
    }

    goToStep(stepIndex) {
        if (stepIndex >= 0 && stepIndex < this.steps.length) {
            this.currentStep = stepIndex;
            this.render();
        }
        return this;
    }

    complete() {
        if (typeof this.onCompleteCallback === 'function') {
            this.onCompleteCallback();
        }
        this.stop();
        return this;
    }

    onComplete(callback) {
        this.onCompleteCallback = callback;
        return this;
    }

    render() {
        if (!this.active) return;

        const step = this.steps[this.currentStep];

        // ایجاد یا دسترسی به المان هدف مشخص شده در گام
        let targetElement = null;
        if (step.target) {
            if (typeof step.target === 'string') {
                targetElement = document.querySelector(step.target);
            } else if (step.target instanceof HTMLElement) {
                targetElement = step.target;
            }
        }

        if (!targetElement && step.target) {
            console.warn(`Target element not found: ${step.target}`);
            return;
        }

        // ایجاد کانتینر برای نمایش راهنما اگر وجود نداشته باشد
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.className = 'user-guide-container';
            document.body.appendChild(this.container);
        }

        // ایجاد یا به‌روزرسانی کامپوننت Vue
        const props = {
            step,
            currentStep: this.currentStep,
            totalSteps: this.steps.length,
            targetElement,
            onNext: () => this.next(),
            onPrev: () => this.prev(),
            onSkip: () => this.complete()
        };

        if (!this.app) {
            this.app = createApp({
                render: () => h(UserGuideStep, props)
            });
            this.app.mount(this.container);
        } else {
            // به‌روزرسانی props در کامپوننت موجود
            const instance = this.app._instance;
            if (instance && instance.proxy) {
                Object.assign(instance.proxy.$props, props);
            }
        }
    }
}

export default {
    install(app) {
        const userGuide = new UserGuide();
        app.config.globalProperties.$userGuide = userGuide;
        window.UserGuide = userGuide;
    }
};