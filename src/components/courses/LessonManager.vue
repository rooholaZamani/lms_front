<template>
  <div class="modern-card lesson-manager animate-slide-up">
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h5 class="modern-title mb-0">
        <i class="fas fa-list-ul text-primary me-2"></i>
        مدیریت دروس
      </h5>
      <button class="modern-btn modern-btn-success" @click="showAddLessonModal">
        <i class="fas fa-plus me-2"></i>
        افزودن درس جدید
      </button>
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
    <teleport to="body" >
    <base-modal
        modal-id="lessonModal"
        :title="selectedLesson.id ? 'ویرایش درس' : 'افزودن درس'"
        icon="book"
        header-class="bg-primary"
        ref="lessonModal">

      <!-- محتوای فرم -->
      <form @submit.prevent="saveLesson" >
        <div class="mb-3">
          <label class="form-label">عنوان درس</label>
          <input type="text" class="form-control" v-model="selectedLesson.title" required>
        </div>
        <div class="mb-3">
          <label class="form-label">توضیحات</label>
          <textarea class="form-control" v-model="selectedLesson.description"></textarea>
        </div>
      </form>

      <!-- Footer -->
      <template #footer>
        <button type="button" class="btn btn-secondary" @click="$refs.lessonModal.hide()">
          انصراف
        </button>
        <button type="button" class="btn btn-primary" @click="saveLesson" :disabled="isSaving">
          <span v-if="isSaving" class="spinner-border spinner-border-sm me-2"></span>
          ذخیره
        </button>
      </template>
    </base-modal>

    <!-- Modal: تأیید حذف سوال -->
    <confirmation-dialog
        modal-id="deleteLessonModal"
        title="حذف سوال"
        :message="'آیا از حذف این سوال اطمینان دارید؟ این عمل قابل بازگشت نیست.'"
        :details=selectedLesson?.title
        confirm-text="حذف سوال"
        confirm-button-type="danger"
        icon="trash-alt"
        ref="deleteLessonModal"
        @confirm="deleteLesson"
    />
    </teleport>
  </div>
</template>

<script>
import axios from 'axios';
import BaseModal from '@/components/common/BaseModal.vue';
import ConfirmationDialog from "@/components/common/ConfirmationDialog.vue";
export default {
  name: 'LessonManager',
  components: {
    BaseModal,
    ConfirmationDialog

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
      isDeleting: false
    };
  },
  mounted() {

  },
  methods: {

    showAddLessonModal() {

      this.selectedLesson = {
        id: null,
        title: '',
        description: '',
        orderIndex: this.lessons ? this.lessons.length : 0
      };
      this.$refs.lessonModal.show();  // ← ساده!
    },

    async editLesson(lesson) {
      console.log('Editing lesson:', lesson);
      this.selectedLesson = {...lesson};
      this.$refs.lessonModal.show();

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

        this.$refs.lessonModal.hide();
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
      this.$refs.deleteLessonModal.show();
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
        // this.$refs.confirmationModal.hide();

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
      this.$router.push({
        name: 'ExamCreator',
        query: { lessonId: lesson.id, lessonTitle: lesson.title }
      });

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