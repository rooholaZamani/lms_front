<template>
  <div class="alert-container">
    <div
        v-if="message"
        :class="`alert alert-${type} alert-dismissible fade show`"
        role="alert"
    >
      <i v-if="icon" :class="`fas fa-${icon} me-2`"></i>
      {{ message }}
      <button
          v-if="dismissible"
          type="button"
          class="btn-close"
          @click="dismiss"
          aria-label="Close"
      ></button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AlertMessage',
  props: {
    message: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: 'info',
      validator: (value) => ['success', 'info', 'warning', 'danger', 'primary', 'secondary'].includes(value)
    },
    dismissible: {
      type: Boolean,
      default: false
    },
    icon: {
      type: String,
      default: ''
    },
    autoClose: {
      type: Boolean,
      default: false
    },
    duration: {
      type: Number,
      default: 5000 // 5 seconds
    }
  },
  data() {
    return {
      timer: null
    }
  },
  watch: {
    message(newVal) {
      // اگر پیامی نمایش داده می‌شود و auto-close فعال است
      if (newVal && this.autoClose) {
        this.startTimer();
      }
    }
  },
  mounted() {
    // اگر پیامی از ابتدا وجود دارد و auto-close فعال است
    if (this.message && this.autoClose) {
      this.startTimer();
    }
  },
  beforeUnmount() {
    this.clearTimer();
  },
  methods: {
    dismiss() {
      this.$emit('update:message', '');
      this.$emit('dismissed');
      this.clearTimer();
    },
    startTimer() {
      this.clearTimer();
      if (this.autoClose && this.duration > 0) {
        this.timer = setTimeout(() => {
          this.dismiss();
        }, this.duration);
      }
    },
    clearTimer() {
      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }
    }
  }
}
</script>

<style scoped>
.alert-container {
  margin-bottom: 1rem;
}
</style>