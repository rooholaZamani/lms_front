<template>
  <div class="toast-container">
    <transition-group name="toast" tag="div">
      <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="`toast toast-${toast.type}`"
          @click="$emit('remove', toast.id)"
      >
        <div class="toast-content">
          <i v-if="toast.icon" :class="`fas fa-${toast.icon}`"></i>
          <span class="toast-message">{{ toast.message }}</span>
        </div>
        <button class="toast-close" @click.stop="$emit('remove', toast.id)">
          <i class="fas fa-times"></i>
        </button>
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
  }
}
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 20px;
  left: 20px;
  z-index: 9999;
  width: 350px;
  direction: rtl;
}

.toast {
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.15);
  margin-bottom: 15px;
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s;
}

.toast-content {
  display: flex;
  align-items: center;
}

.toast-content i {
  margin-left: 10px;
  font-size: 1.2rem;
}

.toast-message {
  font-size: 0.95rem;
  line-height: 1.4;
}

.toast-close {
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
  color: #6c757d;
  font-size: 0.9rem;
  transition: color 0.2s;
}

.toast-close:hover {
  color: #343a40;
}

/* Colors for different toast types */
.toast-success {
  border-right: 4px solid #28a745;
}
.toast-success i {
  color: #28a745;
}

.toast-danger {
  border-right: 4px solid #dc3545;
}
.toast-danger i {
  color: #dc3545;
}

.toast-info {
  border-right: 4px solid #17a2b8;
}
.toast-info i {
  color: #17a2b8;
}

.toast-warning {
  border-right: 4px solid #ffc107;
}
.toast-warning i {
  color: #ffc107;
}

/* Animation */
.toast-enter-active, .toast-leave-active {
  transition: all 0.5s;
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(-50px);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(50px);
}
</style>