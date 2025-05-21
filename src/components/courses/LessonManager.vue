<template>
  <div class="lesson-manager">
    <!-- Header with Add Lesson button always visible -->
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h4>مدیریت دروس</h4>
      <button class="btn btn-success" @click="showAddLessonModal">
        <i class="fas fa-plus me-1"></i> افزودن درس جدید
      </button>
    </div>

    <!-- Lessons List -->
    <div v-if="lessons && lessons.length > 0" class="lesson-list">
      <div v-for="(lesson, index) in lessons" :key="lesson.id" class="lesson-item">
        <div class="lesson-number">{{ index + 1 }}</div>
        <div class="lesson-info">
          <div class="lesson-title">{{ lesson.title }}</div>
          <div class="lesson-meta">
            <span v-if="lesson.contents">{{ lesson.contents?.length || 0 }} محتوا</span>
            <span v-if="lesson.hasExam">
              <i class="fas fa-file-alt ms-2 me-1"></i> آزمون
            </span>
            <span v-if="lesson.hasExercise">
              <i class="fas fa-tasks ms-2 me-1"></i> تمرین
            </span>
          </div>
        </div>
        <div class="lesson-actions">
          <button class="btn btn-sm btn-outline-primary me-1" @click="addContent(lesson)">
            <i class="fas fa-plus"></i> محتوا
          </button>
          <button class="btn btn-sm btn-outline-warning me-1" @click="addAssignment(lesson)">
            <i class="fas fa-tasks"></i> تکلیف
          </button>
          <button class="btn btn-sm btn-outline-info me-1" @click="addExam(lesson)">
            <i class="fas fa-file-alt"></i> آزمون
          </button>
          <button class="btn btn-sm btn-outline-secondary me-1" @click="editLesson(lesson)">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-sm btn-outline-danger" @click="confirmDeleteLesson(lesson)">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    </div>
    <empty-state
        v-else
        title="هنوز درسی اضافه نشده است"
        description="با استفاده از دکمه بالا، درس جدید اضافه کنید."
        icon="book"
        compact
    />

    <!-- Lesson Modal -->
    <div class="modal fade" id="lessonModalNew" tabindex="-1" aria-labelledby="lessonModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="lessonModalLabel">
              {{ selectedLesson.id ? 'ویرایش درس' : 'افزودن درس جدید' }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveLesson">
              <div class="mb-3">
                <label for="lessonTitle" class="form-label">عنوان درس</label>
                <input type="text" class="form-control" id="lessonTitle" v-model="selectedLesson.title" required>
              </div>
              <div class="mb-3">
                <label for="lessonDescription" class="form-label">توضیحات درس</label>
                <textarea class="form-control" id="lessonDescription" v-model="selectedLesson.description" rows="3"></textarea>
              </div>
              <div class="mb-3">
                <label for="lessonOrder" class="form-label">ترتیب نمایش</label>
                <input type="number" class="form-control" id="lessonOrder" v-model="selectedLesson.orderIndex" min="0">
              </div>
              <div class="d-flex justify-content-end gap-2">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">انصراف</button>
                <button type="submit" class="btn btn-primary" :disabled="isSaving">
                  <span v-if="isSaving" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                  ذخیره
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Confirmation Dialog Modal -->
    <div class="modal fade" id="confirmationModal" tabindex="-1" aria-labelledby="confirmationModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="confirmationModalLabel">تأیید حذف</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p>آیا از حذف درس "{{ selectedLesson.title }}" اطمینان دارید؟</p>
            <p class="text-danger">این عمل قابل بازگشت نیست.</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">انصراف</button>
            <button type="button" class="btn btn-danger" @click="deleteLesson" :disabled="isDeleting">
              <span v-if="isDeleting" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
              حذف
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import EmptyState from '@/components/common/EmptyState.vue';

export default {
  name: 'LessonManager',
  components: {
    EmptyState
  },
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
    // Initialize Bootstrap modals
    this.initModals();
  },
  methods: {
    initModals() {
      // بررسی بارگذاری Bootstrap
      if (window.bootstrap) {
        this.lessonModal = new bootstrap.Modal(document.getElementById('lessonModalNew'));
        this.confirmationModal = new bootstrap.Modal(document.getElementById('confirmationModal'));
      } else {
        console.error('Bootstrap is not loaded!');
        // سعی کنید کتابخانه را بعد از تأخیر بارگذاری کنید
        setTimeout(() => {
          if (window.bootstrap) {
            this.lessonModal = new bootstrap.Modal(document.getElementById('lessonModalNew'));
            this.confirmationModal = new bootstrap.Modal(document.getElementById('confirmationModal'));
          } else {
            console.error('Bootstrap could not be loaded after delay');
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
          // ویرایش درس موجود
          response = await axios.put(`/lessons/${this.selectedLesson.id}`, {
            title: this.selectedLesson.title,
            description: this.selectedLesson.description,
            orderIndex: this.selectedLesson.orderIndex
          });

          this.$emit('lesson-updated', response.data);
        } else {
          // ایجاد درس جدید
          response = await axios.post(`/lessons/course/${this.courseId}`, {
            title: this.selectedLesson.title,
            description: this.selectedLesson.description,
            orderIndex: this.selectedLesson.orderIndex
          });

          this.$emit('lesson-added', response.data);
        }

        // نمایش پیام موفقیت
        if (this.$toast) {
          this.$toast.success(this.selectedLesson.id ? 'درس با موفقیت به‌روزرسانی شد' : 'درس جدید با موفقیت ایجاد شد');
        }

        // بستن مودال
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

        // اطلاع‌رسانی به کامپوننت والد
        this.$emit('lesson-deleted', this.selectedLesson.id);

        // نمایش پیام موفقیت
        if (this.$toast) {
          this.$toast.success('درس با موفقیت حذف شد');
        }

        // بستن مودال
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
  margin-top: 1rem;
}

.lesson-item {
  display: flex;
  align-items: center;
  padding: 15px;
  background-color: #fff;
  border: 1px solid #eee;
  border-radius: 8px;
  margin-bottom: 10px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.lesson-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
}

.lesson-number {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #007bff;
  color: #fff;
  border-radius: 50%;
  font-weight: bold;
  margin-left: 15px;
}

.lesson-info {
  flex-grow: 1;
}

.lesson-title {
  font-weight: 600;
  margin-bottom: 5px;
}

.lesson-meta {
  display: flex;
  gap: 15px;
  color: #6c757d;
  font-size: 0.875rem;
}

.lesson-actions {
  display: flex;
  gap: 5px;
}

@media (max-width: 768px) {
  .lesson-item {
    flex-direction: column;
    align-items: flex-start;
    padding: 15px;
  }

  .lesson-number {
    margin-bottom: 10px;
    margin-left: 0;
  }

  .lesson-info {
    width: 100%;
    margin-bottom: 15px;
  }

  .lesson-actions {
    width: 100%;
    overflow-x: auto;
    padding-bottom: 5px;
  }
}
</style>