<template>
  <div class="lesson-list">
    <!-- Empty State -->
    <div v-if="lessons.length === 0" class="modern-card text-center animate-slide-up">
      <div class="py-5">
        <div class="modern-logo large secondary mb-4">
          <i class="fas fa-book-open"></i>
        </div>
        <h5 class="mb-3">هنوز درسی ایجاد نشده است</h5>
        <p class="text-muted">
          درس‌های این دوره در اینجا نمایش داده خواهند شد
        </p>
      </div>
    </div>

    <!-- Lessons Accordion -->
    <div v-else class="lesson-accordion">
      <div
          v-for="(lesson, index) in lessons"
          :key="lesson.id"
          class="modern-card lesson-card animate-slide-up"
          :style="`animation-delay: ${index * 0.1}s`"
      >
        <!-- Lesson Header -->
        <div class="lesson-header" @click="toggleLesson(index)">
          <div class="lesson-info">
            <div class="lesson-number">
              {{ lesson.orderIndex + 1 || index + 1 }}
            </div>
            <div class="lesson-details">
              <h6 class="lesson-title">{{ lesson.title }}</h6>
              <p class="lesson-description" v-if="lesson.description">
                {{ lesson.description }}
              </p>
            </div>
          </div>

          <div class="lesson-status">
            <!-- Student Progress -->
            <div v-if="isEnrolled && !isTeacher" class="student-indicators">
              <span
                  v-if="completedLessons.includes(lesson.id)"
                  class="modern-badge modern-badge-success me-2"
              >
                <i class="fas fa-check me-1"></i>
                تکمیل شده
              </span>
              <span v-else class="modern-badge modern-badge-warning me-2">
                <i class="fas fa-clock me-1"></i>
                در انتظار
              </span>
            </div>

            <!-- Content Indicators -->
            <div class="content-indicators">
              <span v-if="lessonContents[lesson.id] && lessonContents[lesson.id].length > 0"
                    class="modern-badge modern-badge-info me-1">
                <i class="fas fa-file-alt me-1"></i>
                {{ lessonContents[lesson.id].length }}
              </span>
              <span v-if="lesson.hasExam || (lesson.exams && lesson.exams.length > 0)"
                    class="modern-badge modern-badge-danger me-1">
                <i class="fas fa-clipboard-check me-1"></i>
                آزمون
              </span>
              <span v-if="lesson.hasExercise || (lesson.exercises && lesson.exercises.length > 0)"
                    class="modern-badge modern-badge-warning me-1">
                <i class="fas fa-dumbbell me-1"></i>
                تمرین
              </span>
              <span v-if="lesson.hasAssignment || (lesson.assignments && lesson.assignments.length > 0)"
                    class="modern-badge modern-badge-secondary me-1">
                <i class="fas fa-tasks me-1"></i>
                تکلیف
              </span>
            </div>

            <div class="lesson-expand-icon">
              <i :class="lesson.expanded ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
            </div>
          </div>
        </div>

        <!-- Expanded Content -->
        <div v-if="lesson.expanded" class="lesson-content animate-fade-in">
          <!-- Loading Content -->
          <div v-if="loadingContent[lesson.id]" class="text-center py-3">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">در حال بارگذاری...</span>
            </div>
            <p class="mt-2 text-muted">در حال بارگذاری محتوا...</p>
          </div>

          <!-- Lesson Contents -->
          <div v-else-if="lessonContents[lesson.id] && lessonContents[lesson.id].length > 0" class="lesson-section">
            <h6 class="section-title">
              <i class="fas fa-play-circle text-primary me-2"></i>
              محتوای درس
            </h6>
            <div class="content-grid">
              <div
                  v-for="content in lessonContents[lesson.id]"
                  :key="content.id"
                  class="content-item"
              >
                <div class="content-icon">
                  <i v-if="content.type === 'TEXT'" class="fas fa-align-left text-info"></i>
                  <i v-else-if="content.type === 'VIDEO'" class="fas fa-play-circle text-primary"></i>
                  <i v-else-if="content.type === 'PDF'" class="fas fa-file-pdf text-danger"></i>
                  <i v-else class="fas fa-file text-secondary"></i>
                </div>
                <div class="content-details">
                  <h6 class="content-title">{{ content.title }}</h6>
                  <p v-if="content.textContent" class="content-preview">
                    {{ content.textContent.substring(0, 100) }}...
                  </p>
                  <span class="content-type">{{ getContentTypeText(content.type) }}</span>
                </div>
                <div class="content-actions">
                  <button
                      v-if="isEnrolled || isTeacherOfCourse"
                      class="modern-btn modern-btn-primary btn-sm"
                      @click="viewContent(content)"
                  >
                    <i class="fas fa-eye me-1"></i>
                    مشاهده
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- No Content Message -->
          <div v-else class="lesson-section">
            <div class="modern-alert modern-alert-info">
              <i class="fas fa-info-circle me-2"></i>
              هنوز محتوایی برای این درس اضافه نشده است.
            </div>
          </div>

          <!-- Lesson Exams -->
          <div v-if="lesson.hasExam || (lesson.exams && lesson.exams.length > 0)" class="lesson-section">
            <h6 class="section-title">
              <i class="fas fa-clipboard-check text-danger me-2"></i>
              آزمون‌های درس
            </h6>
            <div class="assessment-item">
              <div class="assessment-icon bg-danger">
                <i class="fas fa-clipboard-check"></i>
              </div>
              <div class="assessment-details">
                <h6>آزمون درس</h6>
                <p class="text-muted">ارزیابی نهایی یادگیری شما</p>
                <div class="assessment-meta">
                  <span class="meta-badge">
                    <i class="fas fa-clock me-1"></i>
                    ۳۰ دقیقه
                  </span>
                  <span class="meta-badge">
                    <i class="fas fa-question-circle me-1"></i>
                    ۱۰ سوال
                  </span>
                </div>
              </div>
              <div class="assessment-actions">
                <button v-if="isEnrolled && !isTeacher" class="modern-btn modern-btn-danger">
                  <i class="fas fa-pen me-1"></i>
                  شرکت در آزمون
                </button>
                <button v-if="isTeacher && isTeacherOfCourse" class="modern-btn modern-btn-secondary">
                  <i class="fas fa-cog me-1"></i>
                  مدیریت
                </button>
              </div>
            </div>
          </div>

          <!-- Lesson Exercises -->
          <div v-if="lesson.hasExercise || (lesson.exercises && lesson.exercises.length > 0)" class="lesson-section">
            <h6 class="section-title">
              <i class="fas fa-dumbbell text-warning me-2"></i>
              تمرین‌های درس
            </h6>
            <div class="assessment-item">
              <div class="assessment-icon bg-warning">
                <i class="fas fa-dumbbell"></i>
              </div>
              <div class="assessment-details">
                <h6>تمرین درس</h6>
                <p class="text-muted">تمرین برای تقویت یادگیری</p>
                <div class="assessment-meta">
                  <span class="meta-badge">
                    <i class="fas fa-clock me-1"></i>
                    ۱۵ دقیقه
                  </span>
                  <span class="meta-badge">
                    <i class="fas fa-star me-1"></i>
                    تطبیقی
                  </span>
                </div>
              </div>
              <div class="assessment-actions">
                <button v-if="isEnrolled && !isTeacher" class="modern-btn modern-btn-warning">
                  <i class="fas fa-play me-1"></i>
                  شروع تمرین
                </button>
                <button v-if="isTeacher && isTeacherOfCourse" class="modern-btn modern-btn-secondary">
                  <i class="fas fa-cog me-1"></i>
                  مدیریت
                </button>
              </div>
            </div>
          </div>

          <!-- Lesson Assignments -->
          <div v-if="lesson.hasAssignment || (lesson.assignments && lesson.assignments.length > 0)" class="lesson-section">
            <h6 class="section-title">
              <i class="fas fa-tasks text-info me-2"></i>
              تکالیف درس
            </h6>
            <div class="assessment-item">
              <div class="assessment-icon bg-info">
                <i class="fas fa-tasks"></i>
              </div>
              <div class="assessment-details">
                <h6>تکلیف درس</h6>
                <p class="text-muted">تکلیف عملی برای تمرین مهارت‌ها</p>
                <div class="assessment-meta">
                  <span class="meta-badge">
                    <i class="fas fa-calendar me-1"></i>
                    مهلت: ۷ روز
                  </span>
                  <span class="meta-badge">
                    <i class="fas fa-file me-1"></i>
                    فایل
                  </span>
                </div>
              </div>
              <div class="assessment-actions">
                <button v-if="isEnrolled && !isTeacher" class="modern-btn modern-btn-info">
                  <i class="fas fa-upload me-1"></i>
                  ارسال تکلیف
                </button>
                <button v-if="isTeacher && isTeacherOfCourse" class="modern-btn modern-btn-secondary">
                  <i class="fas fa-cog me-1"></i>
                  مدیریت
                </button>
              </div>
            </div>
          </div>

          <!-- Student Completion Button -->
          <div v-if="isEnrolled && !completedLessons.includes(lesson.id)" class="lesson-completion">
            <button
                class="modern-btn modern-btn-success w-100"
                @click="$emit('mark-complete', lesson.id)"
            >
              <i class="fas fa-check me-2"></i>
              علامت‌گذاری به عنوان تکمیل شده
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Content Viewer Modal -->
    <!-- Replace the bootstrap modal with this: -->
<!--    <div v-if="showContentModal" class="custom-modal-overlay" @click.self="closeContentModal">-->
<!--      <div class="custom-modal-dialog">-->
<!--        <div class="custom-modal-content">-->
<!--          <div class="custom-modal-header">-->
<!--            <h5 class="modal-title">-->
<!--              <i :class="getContentIcon(selectedContent?.type)" class="me-2"></i>-->
<!--              {{ selectedContent?.title }}-->
<!--            </h5>-->
<!--            <button type="button" class="btn-close" @click="closeContentModal"></button>-->
<!--          </div>-->
<!--          <div class="custom-modal-body">-->
<!--            &lt;!&ndash; Text Content &ndash;&gt;-->
<!--            <div v-if="selectedContent?.type === 'TEXT'" class="text-content">-->
<!--              <div class="content-text" v-html="formatTextContent(selectedContent.textContent)"></div>-->
<!--            </div>-->

<!--            &lt;!&ndash; Video Content &ndash;&gt;-->
<!--            <div v-else-if="selectedContent?.type === 'VIDEO'" class="video-content">-->
<!--              <div class="ratio ratio-16x9">-->
<!--                <video controls class="video-player">-->
<!--                  <source :src="getContentUrl(selectedContent)" type="video/mp4">-->
<!--                  مرورگر شما از پخش ویدیو پشتیبانی نمی‌کند.-->
<!--                </video>-->
<!--              </div>-->
<!--            </div>-->

<!--            &lt;!&ndash; PDF Content &ndash;&gt;-->
<!--            <div v-else-if="selectedContent?.type === 'PDF'" class="pdf-content">-->
<!--              <div class="d-flex justify-content-center mb-3">-->
<!--                <button class="modern-btn modern-btn-primary" @click="downloadContent(selectedContent)">-->
<!--                  <i class="fas fa-download me-1"></i>-->
<!--                  دانلود PDF-->
<!--                </button>-->
<!--              </div>-->
<!--              <div class="pdf-viewer">-->
<!--                <iframe-->
<!--                    :src="getContentUrl(selectedContent)"-->
<!--                    width="100%"-->
<!--                    height="600px"-->
<!--                    style="border: none;">-->
<!--                </iframe>-->
<!--              </div>-->
<!--            </div>-->
<!--          </div>-->
<!--          <div class="custom-modal-footer">-->
<!--            <button type="button" class="modern-btn modern-btn-secondary" @click="closeContentModal">-->
<!--              بستن-->
<!--            </button>-->
<!--            <button-->
<!--                v-if="selectedContent?.type !== 'TEXT'"-->
<!--                type="button"-->
<!--                class="modern-btn modern-btn-primary"-->
<!--                @click="downloadContent(selectedContent)"-->
<!--            >-->
<!--              <i class="fas fa-download me-1"></i>-->
<!--              دانلود-->
<!--            </button>-->
<!--          </div>-->
<!--        </div>-->
<!--      </div>-->
<!--    </div>-->
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'LessonList',
  props: {
    lessons: {
      type: Array,
      required: true
    },
    isTeacher: {
      type: Boolean,
      default: false
    },
    isTeacherOfCourse: {
      type: Boolean,
      default: false
    },
    isEnrolled: {
      type: Boolean,
      default: false
    },
    completedLessons: {
      type: Array,
      default: () => []
    }
  },
  emits: [
    'toggle-lesson',
    'edit-lesson',
    'add-content',
    'add-exam',
    'add-exercise',
    'add-assignment',
    'mark-complete'
  ],
  data() {
    return {
      lessonContents: {},
      loadingContent: {},
      selectedContent: null,
      contentModal: null,
      showContentModal: false
    };
  },
  watch: {
    lessons: {
      handler(newLessons) {
        // Fetch content for all lessons when lessons change
        if (newLessons.length > 0) {
          this.fetchAllLessonsContent();
        }

        // Still fetch detailed content when expanded
        newLessons.forEach(lesson => {
          if (lesson.expanded && !this.loadingContent[lesson.id]) {
            this.fetchLessonContent(lesson.id);
          }
        });
      },
      deep: true,
      immediate: true
    }
  },
  mounted() {
    this.fetchAllLessonsContent();
  },
  // beforeUnmount() {
  //   // Cleanup when component is destroyed
  //   this.closeContentModal();
  // },
  methods: {
    async fetchAllLessonsContent() {
      // Fetch basic content info for all lessons without expanding them
      const contentPromises = this.lessons.map(async (lesson) => {
        try {
          const response = await axios.get(`/content/lesson/${lesson.id}`);
          this.lessonContents[lesson.id] = response.data;
        } catch (error) {
          console.error(`Error fetching content for lesson ${lesson.id}:`, error);
          this.lessonContents[lesson.id] = [];
        }
      });

      await Promise.all(contentPromises);
    },

    async fetchLessonContent(lessonId) {
      if (this.lessonContents[lessonId] || this.loadingContent[lessonId]) {
        return;
      }

      this.loadingContent[lessonId] = true;

      try {
        const response = await axios.get(`/content/lesson/${lessonId}`);
        this.lessonContents[lessonId] = response.data;
        console.log(`Content loaded for lesson ${lessonId}:`, response.data);
      } catch (error) {
        console.error(`Error fetching content for lesson ${lessonId}:`, error);
        this.lessonContents[lessonId] = [];

        if (this.$toast) {
          this.$toast.error('خطا در دریافت محتوای درس');
        }
      } finally {
        this.loadingContent[lessonId] = false;
      }
    },
    getContentTypeText(type) {
      switch (type) {
        case 'TEXT': return 'متن';
        case 'VIDEO': return 'ویدیو';
        case 'PDF': return 'فایل PDF';
        default: return 'فایل';
      }
    },


    viewContent(content) {
      this.markContentViewed(content.id);

      // Navigate to full-page content viewer
      this.$router.push({
        name: 'ContentViewer',
        params: { contentId: content.id },
        query: { lessonId: this.$route.params.id }
      });
    },

    async markContentViewed(contentId) {
      try {
        await axios.post(`/progress/content/${contentId}/view`);
      } catch (error) {
        console.error('Error marking content as viewed:', error);
      }
    },

    toggleLesson(index) {
      // Emit event to parent component to handle lesson expansion
      this.$emit('toggle-lesson', index);

      // Also trigger content fetch if lesson is being expanded
      const lesson = this.lessons[index];
      if (!lesson.expanded) {
        this.$nextTick(() => {
          if (lesson.expanded) {
            this.fetchLessonContent(lesson.id);
          }
        });
      }
    }
  }
}
</script>

<style scoped>
.lesson-list {
  margin-top: 1rem;
}

.lesson-accordion {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.lesson-card {
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.lesson-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.15);
}

.lesson-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.lesson-header:hover {
  background: rgba(102, 126, 234, 0.02);
}

.lesson-info {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
}

.lesson-number {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  width: 45px;
  height: 45px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.1rem;
  margin-left: 1rem;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.lesson-details {
  flex: 1;
  min-width: 0;
}

.lesson-title {
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
}

.lesson-description {
  margin-bottom: 0;
  color: #6c757d;
  font-size: 0.9rem;
  line-height: 1.4;
}

.lesson-status {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.student-indicators, .content-indicators {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.lesson-expand-icon {
  color: #6c757d;
  font-size: 1.2rem;
  transition: transform 0.3s ease;
}

.lesson-content {
  padding: 0 1.5rem 1.5rem 1.5rem;
  background: rgba(102, 126, 234, 0.02);
}

.lesson-section {
  margin-bottom: 2rem;
}

.lesson-section:last-child {
  margin-bottom: 0;
}

.section-title {
  margin-bottom: 1rem;
  font-weight: 600;
  color: #2c3e50;
  border-bottom: 2px solid rgba(102, 126, 234, 0.1);
  padding-bottom: 0.5rem;
}

.content-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.content-item {
  display: flex;
  align-items: center;
  background: white;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid rgba(102, 126, 234, 0.1);
  transition: all 0.2s ease;
}

.content-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
}

.content-icon {
  width: 45px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 8px;
  margin-left: 1rem;
  flex-shrink: 0;
  font-size: 1.2rem;
}

.content-details {
  flex: 1;
  min-width: 0;
}

.content-title {
  margin-bottom: 0.25rem;
  font-size: 0.95rem;
  font-weight: 600;
  color: #2c3e50;
}

.content-preview {
  margin-bottom: 0.5rem;
  font-size: 0.85rem;
  color: #6c757d;
  line-height: 1.4;
}

.content-type {
  font-size: 0.75rem;
  color: #667eea;
  background: rgba(102, 126, 234, 0.1);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.content-actions {
  flex-shrink: 0;
}

.assessment-item {
  display: flex;
  align-items: center;
  background: white;
  padding: 1.25rem;
  border-radius: 10px;
  border: 1px solid rgba(102, 126, 234, 0.1);
  transition: all 0.2s ease;
}

.assessment-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
}

.assessment-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.3rem;
  margin-left: 1rem;
  flex-shrink: 0;
}

.assessment-details {
  flex: 1;
  min-width: 0;
}

.assessment-details h6 {
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #2c3e50;
}

.assessment-details p {
  margin-bottom: 0.75rem;
  font-size: 0.9rem;
  color: #6c757d;
}

.assessment-meta {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.meta-badge {
  font-size: 0.75rem;
  color: #6c757d;
  background: rgba(102, 126, 234, 0.1);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  display: flex;
  align-items: center;
}

.assessment-actions {
  flex-shrink: 0;
}

.lesson-completion {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(102, 126, 234, 0.1);
}

.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.8rem;
}

/* Content Viewer Modal */
.text-content {
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
  line-height: 1.6;
}

.content-text {
  white-space: pre-wrap;
  word-break: break-word;
}

.video-content {
  text-align: center;
}

.video-player {
  width: 100%;
  height: 100%;
  background: #000;
  border-radius: 8px;
}

.pdf-content {
  text-align: center;
}

.pdf-viewer {
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
}

/* Responsive Design */
@media (max-width: 768px) {
  .lesson-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .lesson-info {
    width: 100%;
  }

  .lesson-status {
    width: 100%;
    justify-content: space-between;
  }

  .content-item,
  .assessment-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
    text-align: center;
  }

  .content-icon,
  .assessment-icon {
    margin-left: 0;
  }

  .content-actions,
  .assessment-actions {
    width: 100%;
  }

  .btn-sm {
    width: 100%;
  }

  .assessment-meta {
    justify-content: center;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .lesson-title {
    color: #e2e8f0;
  }

  .lesson-description {
    color: #cbd5e0;
  }

  .section-title {
    color: #e2e8f0;
  }

  .content-item,
  .assessment-item {
    background: rgba(45, 55, 72, 0.8);
    border-color: rgba(255, 255, 255, 0.1);
  }

  .content-title,
  .assessment-details h6 {
    color: #e2e8f0;
  }

  .content-preview,
  .assessment-details p {
    color: #cbd5e0;
  }
}
</style>