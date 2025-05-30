<template>
  <div class="user-guide-overlay animate-fade-in" ref="overlay">
    <div
        v-if="targetElement"
        class="user-guide-highlight"
        :style="highlightStyle"
    ></div>

    <div
        class="modern-card user-guide-tooltip animate-slide-up"
        :style="tooltipStyle"
        :class="step.tooltipClass || ''"
    >
      <!-- Header -->
      <div class="guide-header">
        <div class="modern-badge modern-badge-primary guide-step-counter">
          {{ currentStep + 1 }} / {{ totalSteps }}
        </div>

        <h5 class="modern-title guide-title">
          <i v-if="step.icon" :class="`fas fa-${step.icon} me-2`"></i>
          {{ step.title }}
        </h5>
      </div>

      <!-- Content -->
      <div class="guide-content">
        <p>{{ step.content }}</p>

        <!-- نکات اضافی در صورت وجود -->
        <div v-if="step.tips" class="guide-tips">
          <div class="modern-alert modern-alert-info">
            <i class="fas fa-lightbulb me-2"></i>
            {{ step.tips }}
          </div>
        </div>
      </div>

      <!-- Progress Bar -->
      <div class="guide-progress">
        <div class="progress-bar">
          <div
              class="progress-fill"
              :style="{ width: `${((currentStep + 1) / totalSteps) * 100}%` }"
          ></div>
        </div>
        <span class="progress-text">
          پیشرفت: {{ Math.round(((currentStep + 1) / totalSteps) * 100) }}%
        </span>
      </div>

      <!-- Actions -->
      <div class="guide-actions">
        <div class="actions-right">
          <button
              v-if="currentStep > 0"
              class="modern-btn modern-btn-outline"
              @click="onPrev"
          >
            <i class="fas fa-chevron-right me-1"></i>
            قبلی
          </button>
        </div>

        <div class="actions-left">
          <button
              class="modern-btn modern-btn-secondary"
              @click="onSkip"
          >
            <i class="fas fa-times me-1"></i>
            رد کردن
          </button>

          <button
              class="modern-btn modern-btn-success ms-2"
              @click="onNext"
          >
            {{ isLastStep ? 'پایان' : 'بعدی' }}
            <i :class="`fas fa-${isLastStep ? 'check' : 'chevron-left'} ms-1`"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UserGuideStep',
  props: {
    step: {
      type: Object,
      required: true
    },
    currentStep: {
      type: Number,
      required: true
    },
    totalSteps: {
      type: Number,
      required: true
    },
    targetElement: {
      type: Object,
      default: null
    },
    onNext: {
      type: Function,
      required: true
    },
    onPrev: {
      type: Function,
      required: true
    },
    onSkip: {
      type: Function,
      required: true
    }
  },
  computed: {
    isLastStep() {
      return this.currentStep === this.totalSteps - 1;
    },
    highlightStyle() {
      if (!this.targetElement) return {};

      const rect = this.targetElement.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

      return {
        top: `${rect.top + scrollTop}px`,
        left: `${rect.left + scrollLeft}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`
      };
    },
    tooltipStyle() {
      if (!this.targetElement) {
        return {
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        };
      }

      const rect = this.targetElement.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

      const position = this.step.position || 'bottom';
      const tooltipWidth = 350;
      const tooltipHeight = 250;
      const margin = 20;

      let top, left;

      switch (position) {
        case 'top':
          top = rect.top + scrollTop - tooltipHeight - margin;
          left = rect.left + scrollLeft + (rect.width / 2) - (tooltipWidth / 2);
          break;
        case 'right':
          top = rect.top + scrollTop + (rect.height / 2) - (tooltipHeight / 2);
          left = rect.left + scrollLeft + rect.width + margin;
          break;
        case 'bottom':
          top = rect.top + scrollTop + rect.height + margin;
          left = rect.left + scrollLeft + (rect.width / 2) - (tooltipWidth / 2);
          break;
        case 'left':
          top = rect.top + scrollTop + (rect.height / 2) - (tooltipHeight / 2);
          left = rect.left + scrollLeft - tooltipWidth - margin;
          break;
        default:
          top = rect.top + scrollTop + rect.height + margin;
          left = rect.left + scrollLeft + (rect.width / 2) - (tooltipWidth / 2);
      }

      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      if (left < 20) left = 20;
      if (left + tooltipWidth > windowWidth - 20) left = windowWidth - tooltipWidth - 20;

      if (top < 20) top = 20;
      if (top + tooltipHeight > windowHeight - 20) top = windowHeight - tooltipHeight - 20;

      return {
        top: `${top}px`,
        left: `${left}px`,
        width: `${tooltipWidth}px`,
        maxWidth: `${tooltipWidth}px`
      };
    }
  },
  mounted() {
    if (this.targetElement) {
      this.targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });

      this.targetElement.classList.add('user-guide-target');
    }

    document.addEventListener('keydown', this.handleKeyPress);
  },
  beforeUnmount() {
    if (this.targetElement) {
      this.targetElement.classList.remove('user-guide-target');
    }

    document.removeEventListener('keydown', this.handleKeyPress);
  },
  methods: {
    handleKeyPress(e) {
      if (e.key === 'Escape') {
        this.onSkip();
      } else if (e.key === 'ArrowRight') {
        this.onPrev();
      } else if (e.key === 'ArrowLeft') {
        this.onNext();
      }
    }
  }
}
</script>

<style scoped>
.user-guide-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  z-index: 9998;
  display: flex;
  justify-content: center;
  align-items: center;
  backdrop-filter: blur(3px);
}

.user-guide-highlight {
  position: absolute;
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.6);
  border-radius: 8px;
  z-index: 9999;
  pointer-events: none;
  border: 3px solid #667eea;
}

.user-guide-tooltip {
  position: absolute;
  z-index: 10000;
  direction: rtl;
  max-height: 80vh;
  overflow-y: auto;
}

.guide-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(102, 126, 234, 0.1);
}

.guide-step-counter {
  font-size: 0.8rem;
  font-weight: 600;
}

.guide-title {
  margin: 0;
  flex: 1;
  margin-right: 1rem;
}

.guide-content {
  margin-bottom: 1.5rem;
  line-height: 1.6;
  color: #495057;
}

.guide-tips {
  margin-top: 1rem;
}

.guide-progress {
  margin-bottom: 1.5rem;
}

.progress-bar {
  height: 6px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.8rem;
  color: #6c757d;
  font-weight: 600;
}

.guide-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid rgba(102, 126, 234, 0.1);
  padding-top: 1rem;
}

.actions-right {
  display: flex;
}

.actions-left {
  display: flex;
  gap: 0.5rem;
}

.user-guide-target {
  z-index: 10000;
  position: relative;
  box-shadow: 0 0 20px rgba(102, 126, 234, 0.5);
  border-radius: 8px;
}

/* Responsive */
@media (max-width: 768px) {
  .user-guide-tooltip {
    width: calc(100vw - 2rem) !important;
    max-width: calc(100vw - 2rem) !important;
    margin: 1rem;
    position: fixed !important;
    top: 50% !important;
    left: 50% !important;
    transform: translate(-50%, -50%) !important;
  }

  .guide-header {
    flex-direction: column;
    gap: 0.5rem;
  }

  .guide-actions {
    flex-direction: column;
    gap: 1rem;
  }

  .actions-left {
    width: 100%;
    justify-content: space-between;
  }
}

/* Animations */
.animate-fade-in {
  animation: fadeIn 0.3s ease forwards;
}

.animate-slide-up {
  animation: slideUp 0.4s ease forwards;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .guide-content {
    color: #e2e8f0;
  }

  .progress-text {
    color: #cbd5e0;
  }

  .guide-header {
    border-bottom-color: rgba(255, 255, 255, 0.1);
  }

  .guide-actions {
    border-top-color: rgba(255, 255, 255, 0.1);
  }
}
</style>