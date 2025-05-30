<!--<template>-->
<!--  <div class="alert-container">-->
<!--    <div-->
<!--        v-if="message"-->
<!--        :class="`modern-alert modern-alert-${type} animate-slide-down`"-->
<!--        role="alert"-->
<!--    >-->
<!--      <div class="alert-icon">-->
<!--        <i v-if="icon" :class="`fas fa-${icon}`"></i>-->
<!--        <i v-else :class="getDefaultIcon()"></i>-->
<!--      </div>-->
<!--      <div class="alert-content">-->
<!--        <div class="alert-message">{{ message }}</div>-->
<!--      </div>-->
<!--      <button-->
<!--          v-if="dismissible"-->
<!--          type="button"-->
<!--          class="alert-close"-->
<!--          @click="dismiss"-->
<!--          aria-label="بستن"-->
<!--      >-->
<!--        <i class="fas fa-times"></i>-->
<!--      </button>-->
<!--    </div>-->
<!--  </div>-->
<!--</template>-->

<!--<script>-->
<!--export default {-->
<!--  name: 'AlertMessage',-->
<!--  props: {-->
<!--    message: {-->
<!--      type: String,-->
<!--      default: ''-->
<!--    },-->
<!--    type: {-->
<!--      type: String,-->
<!--      default: 'info',-->
<!--      validator: (value) => ['success', 'info', 'warning', 'danger', 'primary'].includes(value)-->
<!--    },-->
<!--    dismissible: {-->
<!--      type: Boolean,-->
<!--      default: true-->
<!--    },-->
<!--    icon: {-->
<!--      type: String,-->
<!--      default: ''-->
<!--    },-->
<!--    autoClose: {-->
<!--      type: Boolean,-->
<!--      default: true-->
<!--    },-->
<!--    duration: {-->
<!--      type: Number,-->
<!--      default: 5000-->
<!--    }-->
<!--  },-->
<!--  data() {-->
<!--    return {-->
<!--      timer: null-->
<!--    }-->
<!--  },-->
<!--  watch: {-->
<!--    message(newVal) {-->
<!--      if (newVal && this.autoClose) {-->
<!--        this.startTimer();-->
<!--      }-->
<!--    }-->
<!--  },-->
<!--  mounted() {-->
<!--    if (this.message && this.autoClose) {-->
<!--      this.startTimer();-->
<!--    }-->
<!--  },-->
<!--  beforeUnmount() {-->
<!--    this.clearTimer();-->
<!--  },-->
<!--  methods: {-->
<!--    dismiss() {-->
<!--      this.$emit('update:message', '');-->
<!--      this.$emit('dismissed');-->
<!--      this.clearTimer();-->
<!--    },-->
<!--    startTimer() {-->
<!--      this.clearTimer();-->
<!--      if (this.autoClose && this.duration > 0) {-->
<!--        this.timer = setTimeout(() => {-->
<!--          this.dismiss();-->
<!--        }, this.duration);-->
<!--      }-->
<!--    },-->
<!--    clearTimer() {-->
<!--      if (this.timer) {-->
<!--        clearTimeout(this.timer);-->
<!--        this.timer = null;-->
<!--      }-->
<!--    },-->
<!--    getDefaultIcon() {-->
<!--      const icons = {-->
<!--        success: 'fas fa-check-circle',-->
<!--        info: 'fas fa-info-circle',-->
<!--        warning: 'fas fa-exclamation-triangle',-->
<!--        danger: 'fas fa-exclamation-circle',-->
<!--        primary: 'fas fa-bell'-->
<!--      };-->
<!--      return icons[this.type] || 'fas fa-info-circle';-->
<!--    }-->
<!--  }-->
<!--}-->
<!--</script>-->

<!--<style scoped>-->
<!--.alert-container {-->
<!--  margin-bottom: 1rem;-->
<!--}-->

<!--.modern-alert {-->
<!--  display: flex;-->
<!--  align-items: center;-->
<!--  padding: 1rem 1.5rem;-->
<!--  border-radius: 12px;-->
<!--  backdrop-filter: blur(10px);-->
<!--  border: 1px solid rgba(255, 255, 255, 0.2);-->
<!--  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);-->
<!--  margin-bottom: 1rem;-->
<!--  position: relative;-->
<!--  overflow: hidden;-->
<!--}-->

<!--.modern-alert::before {-->
<!--  content: '';-->
<!--  position: absolute;-->
<!--  top: 0;-->
<!--  left: 0;-->
<!--  right: 0;-->
<!--  bottom: 0;-->
<!--  opacity: 0.1;-->
<!--  background: linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.05));-->
<!--  pointer-events: none;-->
<!--}-->

<!--.modern-alert-success {-->
<!--  background: linear-gradient(135deg, rgba(39, 174, 96, 0.1), rgba(46, 204, 113, 0.05));-->
<!--  border-color: rgba(39, 174, 96, 0.3);-->
<!--  color: #27ae60;-->
<!--}-->

<!--.modern-alert-info {-->
<!--  background: linear-gradient(135deg, rgba(52, 152, 219, 0.1), rgba(154, 207, 234, 0.05));-->
<!--  border-color: rgba(52, 152, 219, 0.3);-->
<!--  color: #3498db;-->
<!--}-->

<!--.modern-alert-warning {-->
<!--  background: linear-gradient(135deg, rgba(243, 156, 18, 0.1), rgba(254, 211, 48, 0.05));-->
<!--  border-color: rgba(243, 156, 18, 0.3);-->
<!--  color: #f39c12;-->
<!--}-->

<!--.modern-alert-danger {-->
<!--  background: linear-gradient(135deg, rgba(231, 76, 60, 0.1), rgba(247, 121, 108, 0.05));-->
<!--  border-color: rgba(231, 76, 60, 0.3);-->
<!--  color: #e74c3c;-->
<!--}-->

<!--.modern-alert-primary {-->
<!--  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.05));-->
<!--  border-color: rgba(102, 126, 234, 0.3);-->
<!--  color: #667eea;-->
<!--}-->

<!--.alert-icon {-->
<!--  font-size: 1.25rem;-->
<!--  margin-left: 1rem;-->
<!--  margin-right: 0;-->
<!--  flex-shrink: 0;-->
<!--}-->

<!--.alert-content {-->
<!--  flex: 1;-->
<!--  min-width: 0;-->
<!--}-->

<!--.alert-message {-->
<!--  font-weight: 500;-->
<!--  line-height: 1.5;-->
<!--}-->

<!--.alert-close {-->
<!--  background: none;-->
<!--  border: none;-->
<!--  color: inherit;-->
<!--  opacity: 0.7;-->
<!--  cursor: pointer;-->
<!--  padding: 0.25rem;-->
<!--  margin-right: 0.5rem;-->
<!--  margin-left: 0;-->
<!--  border-radius: 6px;-->
<!--  transition: all 0.2s ease;-->
<!--  font-size: 0.9rem;-->
<!--  width: 30px;-->
<!--  height: 30px;-->
<!--  display: flex;-->
<!--  align-items: center;-->
<!--  justify-content: center;-->
<!--}-->

<!--.alert-close:hover {-->
<!--  opacity: 1;-->
<!--  background: rgba(0, 0, 0, 0.1);-->
<!--}-->

<!--.animate-slide-down {-->
<!--  animation: slideDown 0.3s ease-out;-->
<!--}-->

<!--@keyframes slideDown {-->
<!--  from {-->
<!--    opacity: 0;-->
<!--    transform: translateY(-10px);-->
<!--  }-->
<!--  to {-->
<!--    opacity: 1;-->
<!--    transform: translateY(0);-->
<!--  }-->
<!--}-->

<!--/* Responsive */-->
<!--@media (max-width: 576px) {-->
<!--  .modern-alert {-->
<!--    padding: 0.875rem 1rem;-->
<!--    margin-bottom: 0.75rem;-->
<!--  }-->

<!--  .alert-icon {-->
<!--    font-size: 1.1rem;-->
<!--    margin-left: 0.75rem;-->
<!--  }-->

<!--  .alert-message {-->
<!--    font-size: 0.9rem;-->
<!--  }-->
<!--}-->

<!--/* Dark mode */-->
<!--@media (prefers-color-scheme: dark) {-->
<!--  .modern-alert {-->
<!--    border-color: rgba(255, 255, 255, 0.1);-->
<!--  }-->

<!--  .modern-alert-success {-->
<!--    background: linear-gradient(135deg, rgba(39, 174, 96, 0.15), rgba(46, 204, 113, 0.08));-->
<!--  }-->

<!--  .modern-alert-info {-->
<!--    background: linear-gradient(135deg, rgba(52, 152, 219, 0.15), rgba(154, 207, 234, 0.08));-->
<!--  }-->

<!--  .modern-alert-warning {-->
<!--    background: linear-gradient(135deg, rgba(243, 156, 18, 0.15), rgba(254, 211, 48, 0.08));-->
<!--  }-->

<!--  .modern-alert-danger {-->
<!--    background: linear-gradient(135deg, rgba(231, 76, 60, 0.15), rgba(247, 121, 108, 0.08));-->
<!--  }-->

<!--  .modern-alert-primary {-->
<!--    background: linear-gradient(135deg, rgba(102, 126, 234, 0.15), rgba(118, 75, 162, 0.08));-->
<!--  }-->
<!--}-->
<!--</style>-->