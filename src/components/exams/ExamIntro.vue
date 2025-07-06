<template>
  <div class="modern-page-bg info-gradient">
    <div class="modern-container large animate-slide-up">
      <div class="modern-header text-center">
        <div class="modern-logo large info mb-4">
          <i class="fas fa-clipboard-check"></i>
        </div>
        <h1 class="modern-title">{{ exam.title }}</h1>
        <p class="modern-subtitle">آماده‌سازی برای شرکت در آزمون</p>
      </div>

      <div class="row">
        <!-- Exam Description -->
        <div class="col-lg-8 mb-4">
          <div class="modern-card animate-slide-right">
            <h6 class="section-title">
              <i class="fas fa-info-circle me-2"></i>
              توضیحات آزمون
            </h6>
            <p class="exam-description">{{ exam.description || 'توضیحاتی برای این آزمون ارائه نشده است.' }}</p>

            <h6 class="section-title mt-4">
              <i class="fas fa-list-check me-2"></i>
              قوانین و مقررات آزمون
            </h6>
            <div class="rules-container">
              <div class="rule-item">
                <div class="rule-icon">
                  <i class="fas fa-clock"></i>
                </div>
                <div class="rule-content">
                  <span class="rule-title">مدت زمان آزمون</span>
                  <span class="rule-value">{{ exam.timeLimit }} دقیقه</span>
                </div>
              </div>

              <div class="rule-item">
                <div class="rule-icon">
                  <i class="fas fa-question-circle"></i>
                </div>
                <div class="rule-content">
                  <span class="rule-title">تعداد سوالات</span>
                  <span class="rule-value">{{ exam.questions ? exam.questions.length : 0 }} سوال</span>
                </div>
              </div>

              <div class="rule-item">
                <div class="rule-icon">
                  <i class="fas fa-percentage"></i>
                </div>
                <div class="rule-content">
                  <span class="rule-title">نمره قبولی</span>
                  <span class="rule-value">{{ exam.passingScore || 60 }}%</span>
                </div>
              </div>

              <div class="rule-item warning">
                <div class="rule-icon">
                  <i class="fas fa-exclamation-triangle"></i>
                </div>
                <div class="rule-content">
                  <span class="rule-title">توجه مهم</span>
                  <span class="rule-value">پس از شروع آزمون، امکان متوقف کردن آن وجود ندارد</span>
                </div>
              </div>

              <div class="rule-item danger">
                <div class="rule-icon">
                  <i class="fas fa-times-circle"></i>
                </div>
                <div class="rule-content">
                  <span class="rule-title">هشدار</span>
                  <span class="rule-value">در صورت بستن صفحه، پاسخ‌های شما ذخیره نخواهد شد</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Exam Info Sidebar -->
        <div class="col-lg-4 mb-4">
          <div class="modern-card animate-slide-left">
            <h6 class="section-title">
              <i class="fas fa-info me-2"></i>
              اطلاعات آزمون
            </h6>

            <div class="exam-info-items">
              <div class="info-item">
                <div class="info-icon">
                  <i class="fas fa-book"></i>
                </div>
                <div class="info-content">
                  <span class="info-label">درس</span>
                  <span class="info-value">{{ exam.lessonTitle || 'نامشخص' }}</span>
                </div>
              </div>

              <div class="info-item">
                <div class="info-icon">
                  <i class="fas fa-graduation-cap"></i>
                </div>
                <div class="info-content">
                  <span class="info-label">دوره</span>
                  <span class="info-value">{{ exam.courseTitle || 'نامشخص' }}</span>
                </div>
              </div>

              <div class="info-item">
                <div class="info-icon">
                  <i class="fas fa-clock"></i>
                </div>
                <div class="info-content">
                  <span class="info-label">زمان آزمون</span>
                  <span class="info-value">{{ exam.timeLimit || exam.duration || 0 }} دقیقه</span>
                </div>
              </div>

              <div class="info-item">
                <div class="info-icon">
                  <i class="fas fa-check-circle"></i>
                </div>
                <div class="info-content">
                  <span class="info-label">نمره قبولی</span>
                  <span class="info-value">{{ exam.passingScore || 60 }}%</span>
                </div>
              </div>
            </div>

            <div class="exam-start-section mt-4">
              <div class="text-center mb-3">
                <div class="modern-logo success mb-3">
                  <i class="fas fa-play"></i>
                </div>
                <h6 class="start-title">آماده شروع هستید؟</h6>
                <p class="start-subtitle">با کلیک روی دکمه زیر آزمون را شروع کنید</p>
              </div>

              <button class="modern-btn modern-btn-success w-100" @click="$emit('start-exam')">
                <i class="fas fa-play me-2"></i>
                شروع آزمون
              </button>

              <button class="modern-btn modern-btn-danger mt-3 w-100" @click="backToCourse">
                <i class="fas fa-play me-2"></i>
                بازگشت به درس
              </button>

            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ExamIntro',
  props: {
    exam: {
      type: Object,
      required: true
    }
  },
  methods: {
    backToCourse() {
      if (this.exam && this.exam.courseId) {
        this.$router.push({ name: 'CourseDetail', params: { id: this.exam.courseId } });
      } else {
        this.$router.push({ name: 'Dashboard' });
      }
    }

  }
}
</script>

<style scoped>
.section-title {
  color: #333;
  font-weight: 600;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid rgba(102, 126, 234, 0.2);
  display: flex;
  align-items: center;
}

.exam-description {
  color: #6c757d;
  line-height: 1.6;
  font-size: 1rem;
  margin-bottom: 0;
}

.rules-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.rule-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: rgba(102, 126, 234, 0.05);
  border-radius: 12px;
  border-left: 4px solid #667eea;
  transition: all 0.3s ease;
}

.rule-item:hover {
  background: rgba(102, 126, 234, 0.08);
  transform: translateX(-3px);
}

.rule-item.warning {
  background: rgba(255, 193, 7, 0.05);
  border-left-color: #ffc107;
}

.rule-item.danger {
  background: rgba(220, 53, 69, 0.05);
  border-left-color: #dc3545;
}

.rule-icon {
  width: 40px;
  height: 40px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #667eea;
  flex-shrink: 0;
}

.rule-item.warning .rule-icon {
  background: rgba(255, 193, 7, 0.1);
  color: #ffc107;
}

.rule-item.danger .rule-icon {
  background: rgba(220, 53, 69, 0.1);
  color: #dc3545;
}

.rule-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.rule-title {
  font-weight: 600;
  color: #333;
  font-size: 0.95rem;
}

.rule-value {
  color: #6c757d;
  font-size: 0.9rem;
  line-height: 1.4;
}

.exam-info-items {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(248, 249, 250, 0.8);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.info-item:hover {
  background: rgba(102, 126, 234, 0.05);
}

.info-icon {
  width: 35px;
  height: 35px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #667eea;
  flex-shrink: 0;
}

.info-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-label {
  font-size: 0.8rem;
  color: #6c757d;
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.info-value {
  color: #333;
  font-weight: 600;
  font-size: 0.95rem;
}

.exam-start-section {
  background: rgba(39, 174, 96, 0.05);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid rgba(39, 174, 96, 0.1);
}

.start-title {
  color: #333;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.start-subtitle {
  color: #6c757d;
  font-size: 0.9rem;
  margin-bottom: 0;
  line-height: 1.4;
}

/* Responsive */
@media (max-width: 768px) {
  .rule-item {
    flex-direction: column;
    text-align: center;
    gap: 0.75rem;
  }

  .rule-content {
    align-items: center;
  }

  .info-item {
    flex-direction: column;
    text-align: center;
    gap: 0.75rem;
  }

  .info-content {
    align-items: center;
  }

  .modern-container.large {
    padding: 1.5rem;
  }
}

@media (max-width: 576px) {
  .modern-container.large {
    margin: 0 0.5rem;
  }

  .exam-start-section {
    padding: 1rem;
  }
}
</style>