<template>
  <div v-if="loading" class="modern-loading-container" :class="{ 'fullscreen': fullscreen, 'overlay': overlay }">
    <div class="loading-content">
      <div class="modern-spinner" :class="size">
        <div class="spinner-circle"></div>
        <div class="spinner-path"></div>
      </div>

      <div v-if="message" class="loading-message">
        <h5 class="message-title">{{ message }}</h5>
        <p v-if="description" class="message-description">{{ description }}</p>
      </div>

      <div v-if="showProgress && progress !== null" class="loading-progress">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: `${progress}%` }"></div>
        </div>
        <span class="progress-text">{{ progress }}%</span>
      </div>
    </div>
  </div>
  <slot v-else></slot>
</template>

<script>
export default {
  name: 'LoadingSpinner',
  props: {
    loading: {
      type: Boolean,
      default: true
    },
    message: {
      type: String,
      default: 'در حال بارگذاری...'
    },
    description: {
      type: String,
      default: ''
    },
    size: {
      type: String,
      default: 'medium',
      validator: (value) => ['small', 'medium', 'large'].includes(value)
    },
    fullscreen: {
      type: Boolean,
      default: false
    },
    overlay: {
      type: Boolean,
      default: false
    },
    showProgress: {
      type: Boolean,
      default: false
    },
    progress: {
      type: Number,
      default: null,
      validator: (value) => value === null || (value >= 0 && value <= 100)
    }
  }
}
</script>

<style scoped>
.modern-loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  background: linear-gradient(135deg, rgba(248, 249, 250, 0.9), rgba(233, 236, 239, 0.6));
  border-radius: 16px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.modern-loading-container.fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(248, 249, 250, 0.9));
  border-radius: 0;
  border: none;
}

.modern-loading-container.overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(248, 249, 250, 0.8));
}

.loading-content {
  text-align: center;
  max-width: 300px;
}

.modern-spinner {
  position: relative;
  margin: 0 auto 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modern-spinner.small {
  width: 40px;
  height: 40px;
}

.modern-spinner.medium {
  width: 60px;
  height: 60px;
}

.modern-spinner.large {
  width: 80px;
  height: 80px;
}

.spinner-circle {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: conic-gradient(from 0deg, transparent, rgba(102, 126, 234, 0.3), #667eea);
  animation: rotate 1.5s linear infinite;
}

.spinner-path {
  width: 85%;
  height: 85%;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(248, 249, 250, 0.8));
  backdrop-filter: blur(10px);
  box-shadow: inset 0 2px 8px rgba(102, 126, 234, 0.1);
}

.loading-message {
  margin-bottom: 1rem;
}

.message-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.message-description {
  font-size: 0.9rem;
  color: #6c757d;
  margin: 0;
  line-height: 1.4;
}

.loading-progress {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 3px;
  overflow: hidden;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 3px;
  transition: width 0.3s ease;
  box-shadow: 0 1px 3px rgba(102, 126, 234, 0.3);
}

.progress-text {
  font-size: 0.8rem;
  font-weight: 600;
  color: #667eea;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Responsive */
@media (max-width: 576px) {
  .modern-loading-container {
    padding: 2rem 1rem;
  }

  .loading-content {
    max-width: 250px;
  }

  .modern-spinner.medium {
    width: 50px;
    height: 50px;
  }

  .modern-spinner.large {
    width: 70px;
    height: 70px;
  }

  .message-title {
    font-size: 1rem;
  }

  .message-description {
    font-size: 0.85rem;
  }
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .modern-loading-container {
    background: linear-gradient(135deg, rgba(45, 55, 72, 0.9), rgba(74, 85, 104, 0.6));
    border-color: rgba(255, 255, 255, 0.1);
  }

  .modern-loading-container.fullscreen {
    background: linear-gradient(135deg, rgba(26, 32, 44, 0.95), rgba(45, 55, 72, 0.9));
  }

  .modern-loading-container.overlay {
    background: linear-gradient(135deg, rgba(45, 55, 72, 0.9), rgba(74, 85, 104, 0.8));
  }

  .spinner-path {
    background: linear-gradient(135deg, rgba(45, 55, 72, 0.9), rgba(74, 85, 104, 0.8));
  }

  .message-description {
    color: #cbd5e0;
  }

  .progress-bar {
    background: rgba(102, 126, 234, 0.2);
  }
}

/* Animation for smooth entrance */
.modern-loading-container {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>