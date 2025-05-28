<template>
  <div class="modern-card animate-slide-up">
    <div class="modern-header text-center mb-4">
      <div class="modern-logo primary mb-3">
        <i class="fas fa-compass"></i>
      </div>
      <h5 class="modern-title">پیمایش سوالات</h5>
      <p class="modern-subtitle">راهیابی در آزمون</p>
    </div>

    <div class="exam-nav-legend d-flex justify-content-center flex-wrap gap-3 mb-4">
      <div class="legend-item d-flex align-items-center">
        <span class="modern-badge modern-badge-success me-2"></span>
        <small>پاسخ داده شده</small>
      </div>
      <div class="legend-item d-flex align-items-center">
        <span class="modern-badge modern-badge-warning me-2"></span>
        <small>نیاز به بررسی</small>
      </div>
      <div class="legend-item d-flex align-items-center">
        <span class="modern-badge modern-badge-secondary me-2"></span>
        <small>پاسخ داده نشده</small>
      </div>
    </div>

    <div class="exam-nav-items">
      <button
          v-for="index in totalQuestions"
          :key="index - 1"
          :class="{
          'modern-btn-success': isAnswered(index - 1) && !isMarkedForReview(index - 1),
          'modern-btn-warning': isMarkedForReview(index - 1),
          'modern-btn-secondary': !isAnswered(index - 1),
          'active': currentQuestion === index - 1
        }"
          class="modern-btn question-nav-item"
          @click="$emit('go-to-question', index - 1)">
        {{ index }}
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ExamNavigation',
  props: {
    currentQuestion: {
      type: Number,
      required: true
    },
    totalQuestions: {
      type: Number,
      required: true
    },
    answers: {
      type: Array,
      required: true
    },
    reviewQuestions: {
      type: Array,
      required: true
    }
  },
  methods: {
    isAnswered(index) {
      return this.answers[index] !== null && this.answers[index] !== undefined;
    },
    isMarkedForReview(index) {
      return this.reviewQuestions.includes(index);
    }
  }
}
</script>

<style scoped>
.legend-item {
  font-size: 0.85rem;
  color: #6c757d;
}

.legend-item .modern-badge {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.exam-nav-items {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(50px, 1fr));
  gap: 0.75rem;
  margin-top: 1rem;
}

.question-nav-item {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.9rem;
  border-radius: 12px;
  transition: all 0.3s ease;
  position: relative;
}

.question-nav-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.question-nav-item.active {
  border: 3px solid #667eea;
  box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
}

.question-nav-item.active::after {
  content: '';
  position: absolute;
  top: -8px;
  right: -8px;
  width: 20px;
  height: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.question-nav-item.active::before {
  content: '●';
  position: absolute;
  top: -8px;
  right: -8px;
  width: 20px;
  height: 20px;
  color: white;
  font-size: 0.6rem;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

/* Responsive */
@media (max-width: 768px) {
  .exam-nav-items {
    grid-template-columns: repeat(auto-fill, minmax(40px, 1fr));
    gap: 0.5rem;
  }

  .question-nav-item {
    width: 40px;
    height: 40px;
    font-size: 0.8rem;
  }

  .exam-nav-legend {
    flex-direction: column;
    gap: 0.75rem;
  }

  .legend-item {
    justify-content: center;
  }
}
</style>