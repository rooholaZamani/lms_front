<template>
  <div class="user-guide-overlay" ref="overlay">
    <div
        v-if="targetElement"
        class="user-guide-highlight"
        :style="highlightStyle"
    ></div>

    <div
        class="user-guide-tooltip"
        :style="tooltipStyle"
        :class="step.tooltipClass || ''"
    >
      <div class="guide-step-counter">
        {{ currentStep + 1 }} / {{ totalSteps }}
      </div>

      <div class="guide-title">{{ step.title }}</div>

      <div class="guide-content">{{ step.content }}</div>

      <div class="guide-actions">
        <button
            v-if="currentStep > 0"
            class="btn btn-outline-secondary btn-sm"
            @click="onPrev"
        >
          <i class="fas fa-chevron-right me-1"></i> قبلی
        </button>

        <button
            class="btn btn-outline-danger btn-sm ms-auto"
            @click="onSkip"
        >
          رد کردن
        </button>

        <button
            class="btn btn-primary btn-sm ms-2"
            @click="onNext"
        >
          {{ isLastStep ? 'پایان' : 'بعدی' }}
          <i class="fas fa-chevron-left ms-1"></i>
        </button>
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

      // محاسبه موقعیت tooltip بر اساس موقعیت هدف و جهت مشخص شده
      const position = this.step.position || 'bottom';

      const tooltipWidth = 300; // عرض پیش‌فرض tooltip
      const tooltipHeight = 200; // ارتفاع پیش‌فرض tooltip
      const margin = 20; // فاصله از المان هدف

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

      // اطمینان از اینکه tooltip در صفحه قابل مشاهده است
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
    // اسکرول به موقعیت المان هدف
    if (this.targetElement) {
      this.targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });

      // اضافه کردن کلاس هایلایت به المان هدف
      this.targetElement.classList.add('user-guide-target');
    }

    // اضافه کردن event listener برای کلید‌های میانبر
    document.addEventListener('keydown', this.handleKeyPress);
  },
  beforeUnmount() {
    // حذف کلاس هایلایت از المان هدف
    if (this.targetElement) {
      this.targetElement.classList.remove('user-guide-target');
    }

    // حذف event listener
    document.removeEventListener('keydown', this.handleKeyPress);
  },
  methods: {
    handleKeyPress(e) {
      // میانبرهای کیبورد برای ناوبری
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

<style>
.user-guide-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 9998;
  pointer-events: all;
  display: flex;
  justify-content: center;
  align-items: center;
}

.user-guide-highlight {
  position: absolute;
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);
  border-radius: 4px;
  z-index: 9999;
  pointer-events: none;
}

.user-guide-tooltip {
  position: absolute;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
  padding: 20px;
  z-index: 10000;
  direction: rtl;
}

.guide-step-counter {
  position: absolute;
  right: 20px;
  top: 20px;
  font-size: 0.8rem;
  color: #6c757d;
}

.guide-title {
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 10px;
  padding-top: 10px;
}

.guide-content {
  margin-bottom: 20px;
  line-height: 1.6;
}

.guide-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #e9ecef;
  padding-top: 15px;
}

.user-guide-target {
  z-index: 10000;
  position: relative;
}
</style>