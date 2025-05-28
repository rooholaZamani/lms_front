<template>
  <div class="exams-tab">
    <div class="modern-card animate-slide-up">
      <div class="modern-card-header bg-primary text-white">
        <h5 class="mb-0">
          <i class="fas fa-clipboard-check me-2"></i>
          آزمون‌های دوره
        </h5>
      </div>

      <div class="modern-card-body">
        <!-- Empty State -->
        <div v-if="!courseExams || courseExams.length === 0" class="empty-state">
          <div class="text-center py-5">
            <div class="modern-logo large secondary mb-4">
              <i class="fas fa-clipboard-list"></i>
            </div>
            <h4 class="text-muted mb-3">آزمونی یافت نشد</h4>
            <p class="text-muted mb-4">
              هنوز آزمونی برای این دوره ایجاد نشده است
            </p>
            <div v-if="isTeacher && isTeacherOfCourse" class="d-flex justify-content-center">
              <button class="modern-btn modern-btn-primary">
                <i class="fas fa-plus me-1"></i> ایجاد آزمون جدید
              </button>
            </div>
          </div>
        </div>

        <!-- Exams List -->
        <div v-else class="exams-list">
          <div class="row">
            <div v-for="exam in courseExams" :key="exam.id" class="col-lg-6 col-xl-4 mb-4">
              <div class="exam-card modern-card h-100 animate-slide-up" :style="`animation-delay: ${courseExams.indexOf(exam) * 0.1}s`">
                <div class="modern-card-header d-flex justify-content-between align-items-center">
                  <h6 class="mb-0 exam-title">{{ exam.title }}</h6>
                  <span :class="getExamStatusBadgeClass(exam)">
                    <i :class="getExamStatusIcon(exam)" class="me-1"></i>
                    {{ getExamStatusText(exam) }}
                  </span>
                </div>

                <div class="modern-card-body">
                  <div class="exam-info">
                    <div class="info-item">
                      <div class="info-icon text-primary">
                        <i class="fas fa-book"></i>
                      </div>
                      <div class="info-content">
                        <div class="info-label">درس مربوطه</div>
                        <div class="info-value">{{ getRelatedLesson(exam) }}</div>
                      </div>
                    </div>

                    <div class="info-item">
                      <div class="info-icon text-warning">
                        <i class="fas fa-clock"></i>
                      </div>
                      <div class="info-content">
                        <div class="info-label">مدت زمان</div>
                        <div class="info-value">{{ exam.duration }} دقیقه</div>
                      </div>
                    </div>

                    <div class="info-item">
                      <div class="info-icon text-info">
                        <i class="fas fa-question-circle"></i>
                      </div>
                      <div class="info-content">
                        <div class="info-label">تعداد سوالات</div>
                        <div class="info-value">{{ exam.questions ? exam.questions.length : 0 }}</div>
                      </div>
                    </div>

                    <div class="info-item">
                      <div class="info-icon text-success">
                        <i class="fas fa-users"></i>
                      </div>
                      <div class="info-content">
                        <div class="info-label">وضعیت</div>
                        <div class="info-value">
                          <span :class="getExamStatusBadgeClass(exam)">
                            {{ getExamStatusText(exam) }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="modern-card-footer">
                  <!-- Teacher Actions -->
                  <template v-if="isTeacher && isTeacherOfCourse">
                    <div class="d-flex gap-2">
                      <button class="modern-btn modern-btn-primary flex-fill" @click="$emit('edit-exam', exam)">
                        <i class="fas fa-edit me-1"></i> ویرایش
                      </button>
                      <button class="modern-btn modern-btn-success flex-fill" @click="$emit('view-exam-results', exam)">
                        <i class="fas fa-chart-bar me-1"></i> نتایج
                      </button>
                    </div>
                  </template>

                  <!-- Student Actions -->
                  <template v-else-if="isEnrolled">
                    <button v-if="!hasCompletedExam(exam)"
                            class="modern-btn modern-btn-warning w-100"
                            @click="$emit('start-exam', exam)">
                      <i class="fas fa-pen me-1"></i> شروع آزمون
                    </button>
                    <button v-else
                            class="modern-btn modern-btn-info w-100"
                            @click="$emit('view-exam-result', exam)">
                      <i class="fas fa-eye me-1"></i> مشاهده نتیجه
                    </button>
                  </template>

                  <!-- No Access -->
                  <template v-else>
                    <div class="text-center text-muted">
                      <small>برای دسترسی به آزمون در دوره ثبت‌نام کنید</small>
                    </div>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ExamsTab',
  props: {
    courseExams: {
      type: Array,
      required: true
    },
    isTeacher: {
      type: Boolean,
      default: false
    },
    isTeacherOfCourse: {
      type: Boolean,
      default: true
    },
    isEnrolled: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    getRelatedLesson(exam) {
      if (!exam.lesson) return 'نامشخص';
      return exam.lesson.title || 'نامشخص';
    },

    getExamStatusBadgeClass(exam) {
      if (this.hasCompletedExam(exam)) {
        return 'modern-badge modern-badge-success';
      }
      return 'modern-badge modern-badge-primary';
    },

    getExamStatusIcon(exam) {
      if (this.hasCompletedExam(exam)) {
        return 'fas fa-check-circle';
      }
      return 'fas fa-clock';
    },

    getExamStatusText(exam) {
      if (this.hasCompletedExam(exam)) {
        return 'انجام شده';
      }
      return 'آماده';
    },

    hasCompletedExam(exam) {
      if (!exam || !exam.submissions || !this.$store.getters.currentUser) return false;
      return exam.submissions.some(sub => sub.studentId === this.$store.getters.currentUser.id);
    }
  }
}
</script>

<style scoped>
.exams-tab {
  min-height: 400px;
}

.exam-card {
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.exam-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.15);
  border-color: rgba(102, 126, 234, 0.2);
}

.exam-title {
  color: #333;
  font-weight: 600;
  font-size: 1rem;
  line-height: 1.4;
}

.exam-info {
  padding: 0.5rem 0;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid rgba(0,0,0,0.05);
}

.info-item:last-child {
  border-bottom: none;
}

.info-icon {
  width: 35px;
  height: 35px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  background: rgba(102, 126, 234, 0.1);
  flex-shrink: 0;
}

.info-icon.text-primary {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
}

.info-icon.text-warning {
  background: rgba(255, 193, 7, 0.1);
  color: #ffc107;
}

.info-icon.text-info {
  background: rgba(23, 162, 184, 0.1);
  color: #17a2b8;
}

.info-icon.text-success {
  background: rgba(40, 167, 69, 0.1);
  color: #28a745;
}

.info-content {
  flex: 1;
  min-width: 0;
}

.info-label {
  font-size: 0.8rem;
  color: #6c757d;
  margin-bottom: 0.25rem;
  font-weight: 500;
}

.info-value {
  font-size: 0.9rem;
  color: #333;
  font-weight: 600;
  word-wrap: break-word;
}

/* Empty state */
.empty-state {
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Responsive */
@media (max-width: 768px) {
  .exams-list .col-lg-6 {
    margin-bottom: 2rem;
  }

  .exam-card {
    margin-bottom: 1rem;
  }

  .info-item {
    padding: 0.5rem 0;
  }

  .info-icon {
    width: 30px;
    height: 30px;
    font-size: 0.9rem;
  }

  .exam-title {
    font-size: 0.9rem;
  }
}

@media (max-width: 576px) {
  .modern-card-footer .d-flex {
    flex-direction: column;
    gap: 0.5rem;
  }

  .modern-card-footer .flex-fill {
    flex: none !important;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .exam-title {
    color: #e2e8f0;
  }

  .info-value {
    color: #e2e8f0;
  }

  .info-label {
    color: #cbd5e0;
  }

  .info-item {
    border-bottom-color: rgba(255, 255, 255, 0.1);
  }
}
</style>