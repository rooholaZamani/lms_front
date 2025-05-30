<template>
  <div class="modern-toast-container">
    <transition-group name="toast" tag="div" class="toasts-wrapper">
      <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="`modern-toast modern-toast-${toast.type}`"
          @click="$emit('remove', toast.id)"
      >
        <div class="toast-icon">
          <i v-if="toast.icon" :class="`fas fa-${toast.icon}`"></i>
          <i v-else :class="getDefaultIcon(toast.type)"></i>
        </div>

        <div class="toast-content">
          <div class="toast-message">{{ toast.message }}</div>
        </div>

        <button class="toast-close" @click.stop="$emit('remove', toast.id)">
          <i class="fas fa-times"></i>
        </button>

        <div v-if="toast.autoClose" class="toast-timer">
          <div class="timer-bar" :class="`timer-${toast.type}`"></div>
        </div>
      </div>
    </transition-group>
  </div>
</template>

<script>
export default {
  name: 'ToastContainer',
  props: {
    toasts: {
      type: Array,
      required: true
    }
  },
  methods: {
    getDefaultIcon(type) {
      const icons = {
        success: 'fas fa-check-circle',
        danger: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle',
        primary: 'fas fa-bell'
      };
      return icons[type] || 'fas fa-bell';
    }
  }
}
</script>

<style scoped>
.modern-toast-container {
  position: fixed;
  top: 80px;
  left: 20px;
  z-index: 9999;
  width: 350px;
  max-width: calc(100vw - 40px);
  direction: rtl;
  pointer-events: none;
}

.toasts-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.modern-toast {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.1);
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  transition: all 0.3s ease;
  pointer-events: auto;
  position: relative;
  overflow: hidden;
}

.modern-toast:hover {
  transform: translateX(-3px) scale(1.02);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

.modern-toast-success {
  border-right: 3px solid #27ae60;
  background: linear-gradient(135deg, rgba(39, 174, 96, 0.05), rgba(255, 255, 255, 0.95));
}

.modern-toast-danger {
  border-right: 3px solid #e74c3c;
  background: linear-gradient(135deg, rgba(231, 76, 60, 0.05), rgba(255, 255, 255, 0.95));
}

.modern-toast-warning {
  border-right: 3px solid #f39c12;
  background: linear-gradient(135deg, rgba(243, 156, 18, 0.05), rgba(255, 255, 255, 0.95));
}

.modern-toast-info {
  border-right: 3px solid #3498db;
  background: linear-gradient(135deg, rgba(52, 152, 219, 0.05), rgba(255, 255, 255, 0.95));
}

.modern-toast-primary {
  border-right: 3px solid #667eea;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(255, 255, 255, 0.95));
}

.toast-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  flex-shrink: 0;
}

.modern-toast-success .toast-icon {
  background: linear-gradient(135deg, rgba(39, 174, 96, 0.15), rgba(46, 204, 113, 0.08));
  color: #27ae60;
}

.modern-toast-danger .toast-icon {
  background: linear-gradient(135deg, rgba(231, 76, 60, 0.15), rgba(192, 57, 43, 0.08));
  color: #e74c3c;
}

.modern-toast-warning .toast-icon {
  background: linear-gradient(135deg, rgba(243, 156, 18, 0.15), rgba(230, 126, 34, 0.08));
  color: #f39c12;
}

.modern-toast-info .toast-icon {
  background: linear-gradient(135deg, rgba(52, 152, 219, 0.15), rgba(154, 207, 234, 0.08));
  color: #3498db;
}

.modern-toast-primary .toast-icon {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.15), rgba(118, 75, 162, 0.08));
  color: #667eea;
}

.toast-content {
  flex: 1;
  min-width: 0;
}

.toast-message {
  font-size: 0.9rem;
  font-weight: 500;
  line-height: 1.4;
  color: #2c3e50;
}

.toast-close {
  background: rgba(0, 0, 0, 0.1);
  border: none;
  border-radius: 6px;
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #6c757d;
  font-size: 0.75rem;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.toast-close:hover {
  background: rgba(231, 76, 60, 0.1);
  color: #e74c3c;
  transform: scale(1.1);
}

.toast-timer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.timer-bar {
  height: 100%;
  width: 100%;
  transform-origin: right;
  animation: shrink 5s linear forwards;
}

.timer-bar.timer-success {
  background: linear-gradient(135deg, #27ae60, #2ecc71);
}

.timer-bar.timer-danger {
  background: linear-gradient(135deg, #e74c3c, #c0392b);
}

.timer-bar.timer-warning {
  background: linear-gradient(135deg, #f39c12, #e67e22);
}

.timer-bar.timer-info {
  background: linear-gradient(135deg, #3498db, #5dade2);
}

.timer-bar.timer-primary {
  background: linear-gradient(135deg, #667eea, #764ba2);
}

@keyframes shrink {
  from {
    transform: scaleX(1);
  }
  to {
    transform: scaleX(0);
  }
}

/* Transitions */
.toast-enter-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.toast-leave-active {
  transition: all 0.3s ease-in;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(-80px) scale(0.9);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(80px) scale(0.9);
}

.toast-move {
  transition: transform 0.3s ease;
}

/* Responsive */
@media (max-width: 768px) {
  .modern-toast-container {
    top: 70px;
    left: 10px;
    right: 10px;
    width: auto;
    max-width: none;
  }

  .modern-toast {
    padding: 0.875rem;
    gap: 0.5rem;
  }

  .toast-icon {
    width: 28px;
    height: 28px;
    font-size: 0.9rem;
  }

  .toast-message {
    font-size: 0.85rem;
  }
}

@media (max-width: 480px) {
  .modern-toast {
    padding: 0.75rem;
    border-radius: 10px;
  }
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .modern-toast {
    background: rgba(45, 55, 72, 0.95);
    border-color: rgba(255, 255, 255, 0.1);
  }

  .toast-message {
    color: #e2e8f0;
  }

  .toast-close {
    background: rgba(255, 255, 255, 0.1);
    color: #cbd5e0;
  }

  .toast-close:hover {
    background: rgba(231, 76, 60, 0.2);
    color: #fc8181;
  }

  .toast-timer {
    background: rgba(255, 255, 255, 0.1);
  }
}
</style>