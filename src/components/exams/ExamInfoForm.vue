<template>
  <div class="modern-page-bg success-gradient">
    <div class="modern-container large animate-slide-up">
      <div class="modern-header text-center">
        <div class="modern-logo large success mb-4">
          <i class="fas fa-clipboard-list"></i>
        </div>
        <h1 class="modern-title">اطلاعات آزمون</h1>
        <p class="modern-subtitle">تنظیمات و جزئیات آزمون را وارد کنید</p>
      </div>

      <div class="modern-card animate-fade-in">
        <form @submit.prevent="saveExamInfo">
          <!-- Basic Information Section -->
          <div class="form-section">
            <h6 class="section-title">
              <i class="fas fa-info-circle me-2"></i>
              اطلاعات پایه
            </h6>

            <div class="row">
              <div class="col-md-6 modern-form-group">
                <label for="examTitle" class="modern-form-label">
                  عنوان آزمون <span class="text-danger">*</span>
                </label>
                <input
                    type="text"
                    class="modern-form-control"
                    id="examTitle"
                    v-model="examData.title"
                    required
                    placeholder="عنوان آزمون را وارد کنید..."
                >
              </div>
              <div class="col-md-6 modern-form-group">
                <label for="examDuration" class="modern-form-label">
                  مدت زمان (دقیقه) <span class="text-danger">*</span>
                </label>
                <input
                    type="number"
                    class="modern-form-control"
                    id="examDuration"
                    v-model="examData.duration"
                    min="1"
                    required
                    placeholder="مثال: 60"
                >
              </div>
            </div>

            <div class="row">
              <div class="col-md-6 modern-form-group">
                <label for="examPassingScore" class="modern-form-label">
                  نمره قبولی (درصد)
                </label>
                <input
                    type="number"
                    class="modern-form-control"
                    id="examPassingScore"
                    v-model="examData.passingScore"
                    min="0"
                    max="100"
                    placeholder="مثال: 70"
                >
              </div>
              <div class="col-md-6 modern-form-group">
                <label for="examLesson" class="modern-form-label">
                  درس مربوطه <span class="text-danger">*</span>
                </label>
                <select class="modern-form-control" id="examLesson" v-model="examData.lessonId" required>
                  <option value="" disabled>انتخاب درس</option>
                  <option v-for="lesson in availableLessons" :key="lesson.id" :value="lesson.id">
                    {{ lesson.title }} ({{ getCourseTitle(lesson) }})
                  </option>
                </select>
              </div>
            </div>
          </div>

          <!-- Description Section -->
          <div class="form-section">
            <h6 class="section-title">
              <i class="fas fa-file-text me-2"></i>
              توضیحات و راهنمایی‌ها
            </h6>

            <div class="modern-form-group">
              <label for="examDescription" class="modern-form-label">
                توضیحات آزمون
              </label>
              <textarea
                  class="modern-form-control"
                  id="examDescription"
                  v-model="examData.description"
                  rows="4"
                  placeholder="توضیحات مربوط به آزمون، راهنمایی‌ها و نکات مهم را اینجا بنویسید..."
              ></textarea>
            </div>
          </div>

          <!-- Advanced Settings Section -->
          <div class="form-section">
            <h6 class="section-title">
              <i class="fas fa-cogs me-2"></i>
              تنظیمات پیشرفته
            </h6>

            <div class="settings-grid">
              <div class="setting-item">
                <div class="setting-icon">
                  <i class="fas fa-random"></i>
                </div>
                <div class="setting-content">
                  <div class="form-check">
                    <input
                        class="form-check-input"
                        type="checkbox"
                        id="shuffleQuestions"
                        v-model="examData.shuffleQuestions"
                    >
                    <label class="form-check-label" for="shuffleQuestions">
                      <span class="setting-title">ترتیب تصادفی سوالات</span>
                      <span class="setting-description">سوالات به صورت تصادفی برای هر دانش‌آموز نمایش داده شود</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Submit Button -->
          <div class="form-actions">
            <button type="submit" class="modern-btn modern-btn-success" :disabled="isSubmitting">
              <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              <i v-else class="fas fa-save me-2"></i>
              ذخیره اطلاعات
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { useFormatters } from '@/composables/useFormatters.js';
import formMixin from '@/mixins/formMixin.js';

export default {
  name: 'ExamInfoForm',
  mixins: [formMixin],
  props: {
    examData: {
      type: Object,
      required: true
    },
    availableLessons: {
      type: Array,
      required: true
    },
    isSubmitting: {
      type: Boolean,
      default: false
    }
  },
  setup() {
    const { formatDate } = useFormatters();

    return {
      formatDate
    };
  },
  methods: {
    saveExamInfo() {
      this.$emit('save-exam-info');
    },
    getCourseTitle(lesson) {
      if (!lesson.course) return 'نامشخص';
      return lesson.course.title || 'نامشخص';
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
  border-bottom: 2px solid rgba(39, 174, 96, 0.2);
  display: flex;
  align-items: center;
}

.form-section {
  margin-bottom: 2.5rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 12px;
  border: 1px solid rgba(39, 174, 96, 0.1);
}

.form-section:last-of-type {
  margin-bottom: 1.5rem;
}

.settings-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.setting-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: rgba(39, 174, 96, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(39, 174, 96, 0.1);
  transition: all 0.3s ease;
}

.setting-item:hover {
  background: rgba(39, 174, 96, 0.08);
  border-color: rgba(39, 174, 96, 0.2);
}

.setting-icon {
  width: 40px;
  height: 40px;
  background: rgba(39, 174, 96, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #27ae60;
  flex-shrink: 0;
  margin-top: 0.25rem;
}

.setting-content {
  flex: 1;
}

.form-check {
  margin: 0;
}

.form-check-input {
  margin-left: 0;
}

.form-check-label {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  cursor: pointer;
}

.setting-title {
  font-weight: 600;
  color: #333;
  font-size: 0.95rem;
}

.setting-description {
  color: #6c757d;
  font-size: 0.85rem;
  line-height: 1.4;
}

.form-check-input:checked {
  background-color: #27ae60;
  border-color: #27ae60;
}

.form-check-input:focus {
  border-color: #27ae60;
  outline: 0;
  box-shadow: 0 0 0 0.2rem rgba(39, 174, 96, 0.25);
}

.form-actions {
  text-align: center;
  padding-top: 1rem;
  border-top: 1px solid rgba(39, 174, 96, 0.1);
}

.modern-form-control:focus {
  border-color: #27ae60;
  box-shadow: 0 0 0 0.2rem rgba(39, 174, 96, 0.25);
}

.text-danger {
  color: #dc3545;
}

/* Responsive */
@media (max-width: 768px) {
  .setting-item {
    flex-direction: column;
    text-align: center;
    gap: 0.75rem;
  }

  .setting-icon {
    margin: 0 auto;
  }

  .form-check-label {
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

  .form-section {
    padding: 1rem;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .section-title {
    color: #e2e8f0;
    border-bottom-color: rgba(39, 174, 96, 0.3);
  }

  .form-section {
    background: rgba(45, 55, 72, 0.7);
    border-color: rgba(39, 174, 96, 0.2);
  }

  .setting-item {
    background: rgba(39, 174, 96, 0.1);
    border-color: rgba(39, 174, 96, 0.2);
  }

  .setting-title {
    color: #e2e8f0;
  }

  .setting-description {
    color: #cbd5e0;
  }
}
</style>