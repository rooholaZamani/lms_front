<template>
  <div class="modern-card lesson-manager animate-slide-up">
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h5 class="modern-title mb-0">
        <i class="fas fa-list-ul text-primary me-2"></i>
        مدیریت دروس
      </h5>
<!--      <button class="modern-btn modern-btn-success" @click="showAddLessonModal">-->
<!--        <i class="fas fa-plus me-2"></i>-->
<!--        افزودن درس جدید-->
<!--      </button>-->
    </div>

    <!-- Lessons List -->
    <div v-if="lessons && lessons.length > 0" class="lesson-list">
      <div v-for="(lesson, index) in lessons" :key="lesson.id"
           class="lesson-item animate-slide-up"
           :style="`animation-delay: ${index * 0.1}s`">
        <div class="lesson-number">
          {{ index + 1 }}
        </div>

        <div class="lesson-info">
          <div class="lesson-title">{{ lesson.title }}</div>
          <div class="lesson-description" v-if="lesson.description">
            {{ lesson.description }}
          </div>
          <div class="lesson-meta">
            <span v-if="lesson.contents" class="meta-item">
              <i class="fas fa-file-alt me-1"></i>
              {{ lesson.contents?.length || 0 }} محتوا
            </span>
            <span v-if="lesson.hasExam" class="meta-item">
              <i class="fas fa-clipboard-check me-1 text-danger"></i>
              آزمون
            </span>
            <span v-if="lesson.hasExercise" class="meta-item">
              <i class="fas fa-dumbbell me-1 text-warning"></i>
              تمرین
            </span>
            <span v-if="lesson.hasAssignment" class="meta-item">
              <i class="fas fa-tasks me-1 text-info"></i>
              تکلیف
            </span>
          </div>
        </div>

        <div class="lesson-actions">
          <button
              class="modern-btn modern-btn-primary btn-sm me-1"
              @click="addContent(lesson)"
              title="افزودن محتوا">
            <i class="fas fa-plus"></i>
            محتوا
          </button>
          <button
              class="modern-btn modern-btn-warning btn-sm me-1"
              @click="addAssignment(lesson)"
              title="افزودن تکلیف">
            <i class="fas fa-tasks"></i>
            تکلیف
          </button>
          <button
              class="modern-btn modern-btn-danger btn-sm me-1"
              @click="addExam(lesson)"
              title="افزودن آزمون">
            <i class="fas fa-clipboard-check"></i>
            آزمون
          </button>
          <button
              class="modern-btn modern-btn-secondary btn-sm me-1"
              @click="editLesson(lesson)"
              title="ویرایش درس">
            <i class="fas fa-edit"></i>
          </button>
          <button
              class="modern-btn modern-btn-outline btn-sm"
              @click="confirmDeleteLesson(lesson)"
              title="حذف درس">
            <i class="fas fa-trash text-danger"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-5">
      <div class="modern-logo large secondary mb-4">
        <i class="fas fa-book-open"></i>
      </div>
      <h5 class="mb-3">هنوز درسی اضافه نشده است</h5>
      <p class="text-muted mb-4">
        با استفاده از دکمه بالا، اولین درس خود را اضافه کنید
      </p>
    </div>

    <!-- Lesson Modal -->
    <div class="modal fade" id="lessonModalNew" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="fas fa-book me-2"></i>
              {{ selectedLesson.id ? 'ویرایش درس' : 'افزودن درس جدید' }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveLesson">
              <div class="modern-form-group">
                <label for="lessonTitle" class="modern-form-label">عنوان درس</label>
                <input
                    type="text"
                    class="modern-form-control"
                    id="lessonTitle"
                    v-model="selectedLesson.title"
                    placeholder="عنوان درس را وارد کنید"
                    required>
              </div>

              <div class="modern-form-group">
                <label for="lessonDescription" class="modern-form-label">توضیحات درس</label>
                <textarea
                    class="modern-form-control"
                    id="lessonDescription"
                    v-model="selectedLesson.description"
                    rows="3"
                    placeholder="توضیحات مختصری از درس بنویسید..."></textarea>
              </div>

              <div class="modern-form-group">
                <label for="lessonOrder" class="modern-form-label">ترتیب نمایش</label>
                <input
                    type="number"
                    class="modern-form-control"
                    id="lessonOrder"
                    v-model="selectedLesson.orderIndex"
                    min="0"
                    placeholder="0">
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="modern-btn modern-btn-secondary" data-bs-dismiss="modal">
              انصراف
            </button>
            <button
                type="button"
                class="modern-btn modern-btn-success"
                @click="saveLesson"
                :disabled="isSaving">
              <span v-if="isSaving" class="spinner-border spinner-border-sm me-2"></span>
              <i class="fas fa-save me-1"></i>
              ذخیره
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Confirmation Modal -->
    <div class="modal fade" id="confirmationModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title text-danger">
              <i class="fas fa-exclamation-triangle me-2"></i>
              تأیید حذف
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="modern-alert modern-alert-warning">
              <i class="fas fa-exclamation-triangle me-2"></i>
              آیا از حذف درس "<strong>{{ selectedLesson.title }}</strong>" اطمینان دارید؟
            </div>
            <p class="text-muted mb-0">
              این عمل قابل بازگشت نیست و تمامی محتوای مرتبط با این درس نیز حذف خواهد شد.
            </p>
          </div>
          <div class="modal-footer">
            <button type="button" class="modern-btn modern-btn-secondary" data-bs-dismiss="modal">
              انصراف
            </button>
            <button
                type="button"
                class="modern-btn modern-btn-danger"
                @click="deleteLesson"
                :disabled="isDeleting">
              <span v-if="isDeleting" class="spinner-border spinner-border-sm me-2"></span>
              <i class="fas fa-trash me-1"></i>
              حذف درس
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'LessonManager',
  props: {
    courseId: {
      type: [String, Number],
      required: true
    },
    lessons: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      selectedLesson: {
        id: null,
        title: '',
        description: '',
        orderIndex: 0
      },
      isSaving: false,
      isDeleting: false,
      lessonModal: null,
      confirmationModal: null
    };
  },
  mounted() {
    this.initModals();
  },
  methods: {
    initModals() {
      if (window.bootstrap) {
        this.lessonModal = new bootstrap.Modal(document.getElementById('lessonModalNew'));
        this.confirmationModal = new bootstrap.Modal(document.getElementById('confirmationModal'));
      } else {
        setTimeout(() => {
          if (window.bootstrap) {
            this.lessonModal = new bootstrap.Modal(document.getElementById('lessonModalNew'));
            this.confirmationModal = new bootstrap.Modal(document.getElementById('confirmationModal'));
          }
        }, 1000);
      }
    },

    showAddLessonModal() {
      this.selectedLesson = {
        id: null,
        title: '',
        description: '',
        orderIndex: this.lessons ? this.lessons.length : 0
      };

      if (this.lessonModal) {
        this.lessonModal.show();
      } else {
        this.initModals();
        setTimeout(() => {
          if (this.lessonModal) this.lessonModal.show();
        }, 100);
      }
    },

    editLesson(lesson) {
      this.selectedLesson = { ...lesson };

      if (this.lessonModal) {
        this.lessonModal.show();
      } else {
        this.initModals();
        setTimeout(() => {
          if (this.lessonModal) this.lessonModal.show();
        }, 100);
      }
    },

    async saveLesson() {
      if (this.isSaving) return;
      this.isSaving = true;

      try {
        let response;

        if (this.selectedLesson.id) {
          response = await axios.put(`/lessons/${this.selectedLesson.id}`, {
            title: this.selectedLesson.title,
            description: this.selectedLesson.description,
            orderIndex: this.selectedLesson.orderIndex
          });

          this.$emit('lesson-updated', response.data);
        } else {
          response = await axios.post(`/lessons/course/${this.courseId}`, {
            title: this.selectedLesson.title,
            description: this.selectedLesson.description,
            orderIndex: this.selectedLesson.orderIndex
          });

          this.$emit('lesson-added', response.data);
        }

        if (this.$toast) {
          this.$toast.success(this.selectedLesson.id ? 'درس با موفقیت به‌روزرسانی شد' : 'درس جدید با موفقیت ایجاد شد');
        }

        if (this.lessonModal) {
          this.lessonModal.hide();
        } else {
          const modal = bootstrap.Modal.getInstance(document.getElementById('lessonModalNew'));
          if (modal) modal.hide();
        }
      } catch (error) {
        console.error('Error saving lesson:', error);
        if (this.$toast) {
          this.$toast.error('خطا در ذخیره درس');
        }
      } finally {
        this.isSaving = false;
      }
    },

    confirmDeleteLesson(lesson) {
      this.selectedLesson = { ...lesson };

      if (this.confirmationModal) {
        this.confirmationModal.show();
      } else {
        this.initModals();
        setTimeout(() => {
          if (this.confirmationModal) this.confirmationModal.show();
        }, 100);
      }
    },

    async deleteLesson() {
      if (this.isDeleting) return;
      this.isDeleting = true;

      try {
        await axios.delete(`/lessons/${this.selectedLesson.id}`);

        this.$emit('lesson-deleted', this.selectedLesson.id);

        if (this.$toast) {
          this.$toast.success('درس با موفقیت حذف شد');
        }

        if (this.confirmationModal) {
          this.confirmationModal.hide();
        } else {
          const modal = bootstrap.Modal.getInstance(document.getElementById('confirmationModal'));
          if (modal) modal.hide();
        }
      } catch (error) {
        console.error('Error deleting lesson:', error);
        if (this.$toast) {
          this.$toast.error('خطا در حذف درس');
        }
      } finally {
        this.isDeleting = false;
      }
    },

    addContent(lesson) {
      this.$emit('add-content', lesson);
    },

    addAssignment(lesson) {
      this.$emit('add-assignment', lesson);
    },

    addExam(lesson) {
      this.$emit('show-questions-manager', lesson);
    }
  }
};
</script>

<style scoped>
.lesson-manager {
  margin-bottom: 2rem;
}

.lesson-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.lesson-item {
  display: flex;
  align-items: flex-start;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(102, 126, 234, 0.1);
  border-radius: 12px;
  transition: all 0.3s ease;
  position: relative;
}

.lesson-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.15);
  border-color: rgba(102, 126, 234, 0.3);
}

.lesson-number {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 50%;
  font-weight: 700;
  font-size: 1rem;
  margin-left: 1rem;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.lesson-info {
  flex-grow: 1;
  min-width: 0;
}

.lesson-title {
  font-weight: 600;
  font-size: 1.1rem;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.lesson-description {
  color: #6c757d;
  font-size: 0.9rem;
  margin-bottom: 0.75rem;
  line-height: 1.4;
}

.lesson-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.meta-item {
  font-size: 0.85rem;
  color: #6c757d;
  display: flex;
  align-items: center;
}

.lesson-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: flex-start;
}

.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.8rem;
  white-space: nowrap;
}

/* Modal enhancements */
.modal-content {
  border-radius: 12px;
  border: none;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
}

.modal-header {
  border-bottom: 1px solid rgba(102, 126, 234, 0.1);
  background: rgba(102, 126, 234, 0.02);
}

.modal-footer {
  border-top: 1px solid rgba(102, 126, 234, 0.1);
  background: rgba(102, 126, 234, 0.02);
}

/* Responsive */
@media (max-width: 768px) {
  .lesson-item {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .lesson-number {
    align-self: flex-start;
    margin-left: 0;
    margin-bottom: 0;
  }

  .lesson-info {
    width: 100%;
  }

  .lesson-actions {
    justify-content: stretch;
  }

  .btn-sm {
    flex: 1;
    min-width: 0;
  }

  .lesson-meta {
    flex-direction: column;
    gap: 0.5rem;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .lesson-item {
    background: rgba(45, 55, 72, 0.8);
    border-color: rgba(255, 255, 255, 0.1);
  }

  .lesson-item:hover {
    border-color: rgba(102, 126, 234, 0.3);
  }

  .lesson-title {
    color: #e2e8f0;
  }

  .lesson-description,
  .meta-item {
    color: #cbd5e0;
  }
}
</style>