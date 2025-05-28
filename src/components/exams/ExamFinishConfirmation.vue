<template>
  <div class="modern-page-bg warning-gradient">
    <div class="modern-container animate-slide-up">
      <div class="modern-header">
        <div class="modern-logo warning">
          <i class="fas fa-exclamation-triangle"></i>
        </div>
        <h1 class="modern-title">آیا مطمئن هستید؟</h1>
        <p class="modern-subtitle">شما در حال پایان دادن به آزمون هستید. پس از تأیید، نمی‌توانید پاسخ‌های خود را تغییر دهید.</p>
      </div>

      <!-- آمار آزمون -->
      <div class="modern-card animate-fade-in" style="animation-delay: 0.1s;">
        <h5 class="modern-title">
          <i class="fas fa-chart-bar text-primary me-2"></i>
          آمار آزمون شما
        </h5>

        <div class="row">
          <div class="col-md-4 mb-3">
            <div class="modern-stat-card">
              <div class="modern-stat-icon text-info">
                <i class="fas fa-list"></i>
              </div>
              <div class="modern-stat-value">{{ totalQuestions }}</div>
              <div class="modern-stat-label">تعداد کل سوالات</div>
            </div>
          </div>

          <div class="col-md-4 mb-3">
            <div class="modern-stat-card">
              <div class="modern-stat-icon text-success">
                <i class="fas fa-check-circle"></i>
              </div>
              <div class="modern-stat-value">{{ answeredCount }}</div>
              <div class="modern-stat-label">پاسخ داده شده</div>
            </div>
          </div>

          <div class="col-md-4 mb-3">
            <div class="modern-stat-card">
              <div class="modern-stat-icon text-warning">
                <i class="fas fa-question-circle"></i>
              </div>
              <div class="modern-stat-value">{{ totalQuestions - answeredCount }}</div>
              <div class="modern-stat-label">بدون پاسخ</div>
            </div>
          </div>
        </div>
      </div>

      <!-- سوالات بدون پاسخ -->
      <div v-if="unansweredQuestions.length > 0" class="modern-card animate-fade-in" style="animation-delay: 0.2s;">
        <h5 class="modern-title">
          <i class="fas fa-exclamation-circle text-warning me-2"></i>
          سوالات بدون پاسخ
        </h5>

        <div class="question-nav-grid">
          <button
              v-for="index in unansweredQuestions"
              :key="index"
              class="modern-btn modern-btn-danger question-nav-btn"
              @click="$emit('go-to-question', index)">
            سوال {{ index + 1 }}
          </button>
        </div>
      </div>

      <!-- دکمه‌های عملیات -->
      <div class="d-flex justify-content-center gap-3 mt-4 animate-fade-in" style="animation-delay: 0.3s;">
        <button class="modern-btn modern-btn-secondary" @click="$emit('cancel')">
          <i class="fas fa-arrow-right me-2"></i>
          بازگشت به آزمون
        </button>
        <button class="modern-btn modern-btn-success" @click="$emit('finish')">
          <i class="fas fa-check me-2"></i>
          تأیید و ارسال
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ExamFinishConfirmation',
  props: {
    answers: {
      type: Array,
      required: true
    },
    totalQuestions: {
      type: Number,
      required: true
    }
  },
  computed: {
    answeredCount() {
      return this.answers.filter(answer => answer !== null && answer !== undefined).length;
    },
    unansweredQuestions() {
      const unanswered = [];
      this.answers.forEach((answer, index) => {
        if (answer === null || answer === undefined) {
          unanswered.push(index);
        }
      });
      return unanswered;
    }
  }
}
</script>

<style scoped>
.question-nav-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.75rem;
  margin-top: 1rem;
}

.question-nav-btn {
  padding: 0.75rem 1rem;
  font-weight: 600;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.question-nav-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3);
}

/* Responsive */
@media (max-width: 768px) {
  .question-nav-grid {
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: 0.5rem;
  }

  .d-flex.gap-3 {
    flex-direction: column;
    gap: 1rem !important;
  }

  .modern-btn {
    width: 100%;
  }
}
</style>