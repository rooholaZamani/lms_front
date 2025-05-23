<template>
  <div class="lesson-list">
    <div v-if="lessons.length === 0" class="alert alert-info text-center">
      <p>هنوز درسی برای این دوره ایجاد نشده است</p>
    </div>

    <div class="lesson-accordion" v-else>
      <div
          v-for="(lesson, index) in lessons"
          :key="lesson.id"
          class="lesson-card"
      >
        <div class="lesson-header" @click="$emit('toggle-lesson', index)">
          <div class="lesson-info">
            <div class="lesson-number">{{ lesson.orderIndex + 1 || index + 1 }}</div>
            <div class="lesson-details">
              <h5 class="lesson-title">{{ lesson.title }}</h5>
              <p class="lesson-description">{{ lesson.description }}</p>
            </div>
          </div>

          <div class="lesson-status">
            <!-- Progress indicators for students -->
            <div v-if="isEnrolled && !isTeacher" class="student-indicators">
              <span
                  v-if="completedLessons.includes(lesson.id)"
                  class="badge bg-success me-2"
              >
                <i class="fas fa-check"></i> تکمیل شده
              </span>
              <span v-else class="badge bg-warning me-2">
                <i class="fas fa-clock"></i> در انتظار
              </span>
            </div>

            <!-- Content indicators -->
            <div class="content-indicators">
              <span v-if="lesson.contents && lesson.contents.length > 0" class="badge bg-info me-1">
                <i class="fas fa-file-alt"></i> {{ lesson.contents.length }}
              </span>
              <span v-if="lesson.hasExam || (lesson.exams && lesson.exams.length > 0)" class="badge bg-danger me-1">
                <i class="fas fa-clipboard-check"></i> آزمون
              </span>
              <span v-if="lesson.hasExercise || (lesson.exercises && lesson.exercises.length > 0)" class="badge bg-warning me-1">
                <i class="fas fa-dumbbell"></i> تمرین
              </span>
              <span v-if="lesson.hasAssignment || (lesson.assignments && lesson.assignments.length > 0)" class="badge bg-secondary me-1">
                <i class="fas fa-tasks"></i> تکلیف
              </span>
            </div>

            <div class="lesson-expand-icon">
              <i :class="lesson.expanded ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
            </div>
          </div>
        </div>

        <!-- Expanded Content -->
        <div v-if="lesson.expanded" class="lesson-content">
          <!-- Teacher Actions -->
          <div v-if="isTeacher && isTeacherOfCourse" class="teacher-actions mb-3">
<!--            <div class="d-flex flex-wrap gap-2">-->
<!--              <button class="btn btn-sm btn-outline-primary" @click="$emit('edit-lesson', lesson)">-->
<!--                <i class="fas fa-edit me-1"></i> ویرایش درس-->
<!--              </button>-->
<!--              <button class="btn btn-sm btn-outline-success" @click="$emit('add-content', lesson)">-->
<!--                <i class="fas fa-plus me-1"></i> افزودن محتوا-->
<!--              </button>-->
<!--              <button class="btn btn-sm btn-outline-danger" @click="$emit('add-exam', lesson)">-->
<!--                <i class="fas fa-clipboard-check me-1"></i> افزودن آزمون-->
<!--              </button>-->
<!--              <button class="btn btn-sm btn-outline-warning" @click="$emit('add-exercise', lesson)">-->
<!--                <i class="fas fa-dumbbell me-1"></i> افزودن تمرین-->
<!--              </button>-->
<!--              <button class="btn btn-sm btn-outline-secondary" @click="$emit('add-assignment', lesson)">-->
<!--                <i class="fas fa-tasks me-1"></i> افزودن تکلیف-->
<!--              </button>-->
<!--            </div>-->
          </div>

          <!-- Lesson Contents -->
          <div v-if="lesson.contents && lesson.contents.length > 0" class="lesson-materials">
            <h6 class="mb-3">محتوای درس</h6>
            <div class="content-list">
              <div
                  v-for="content in lesson.contents"
                  :key="content.id"
                  class="content-item"
              >
                <div class="content-icon">
                  <i v-if="content.type === 'TEXT'" class="fas fa-align-left"></i>
                  <i v-else-if="content.type === 'VIDEO'" class="fas fa-play-circle"></i>
                  <i v-else-if="content.type === 'PDF'" class="fas fa-file-pdf"></i>
                  <i v-else class="fas fa-file"></i>
                </div>
                <div class="content-details">
                  <h6>{{ content.title }}</h6>
                  <p v-if="content.textContent">{{ content.textContent.substring(0, 100) }}...</p>
                </div>
                <div class="content-actions">
                  <button v-if="isEnrolled" class="btn btn-sm btn-primary">
                    <i class="fas fa-eye"></i> مشاهده
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Lesson Exams -->
          <div v-if="lesson.hasExam || (lesson.exams && lesson.exams.length > 0)" class="lesson-exams mt-3">
            <h6 class="mb-3">آزمون‌های درس</h6>
            <div class="exam-list">
              <div class="exam-item">
                <div class="exam-icon">
                  <i class="fas fa-clipboard-check text-danger"></i>
                </div>
                <div class="exam-details">
                  <h6>آزمون درس</h6>
                  <p class="text-muted">برای شرکت در آزمون کلیک کنید</p>
                </div>
                <div class="exam-actions">
                  <button v-if="isEnrolled && !isTeacher" class="btn btn-sm btn-danger">
                    <i class="fas fa-pen"></i> شرکت در آزمون
                  </button>
                  <button v-if="isTeacher && isTeacherOfCourse" class="btn btn-sm btn-outline-info">
                    <i class="fas fa-cog"></i> مدیریت
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Lesson Exercises -->
          <div v-if="lesson.hasExercise || (lesson.exercises && lesson.exercises.length > 0)" class="lesson-exercises mt-3">
            <h6 class="mb-3">تمرین‌های درس</h6>
            <div class="exercise-list">
              <div class="exercise-item">
                <div class="exercise-icon">
                  <i class="fas fa-dumbbell text-warning"></i>
                </div>
                <div class="exercise-details">
                  <h6>تمرین درس</h6>
                  <p class="text-muted">برای انجام تمرین کلیک کنید</p>
                </div>
                <div class="exercise-actions">
                  <button v-if="isEnrolled && !isTeacher" class="btn btn-sm btn-warning">
                    <i class="fas fa-play"></i> شروع تمرین
                  </button>
                  <button v-if="isTeacher && isTeacherOfCourse" class="btn btn-sm btn-outline-info">
                    <i class="fas fa-cog"></i> مدیریت
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Lesson Assignments -->
          <div v-if="lesson.hasAssignment || (lesson.assignments && lesson.assignments.length > 0)" class="lesson-assignments mt-3">
            <h6 class="mb-3">تکالیف درس</h6>
            <div class="assignment-list">
              <div class="assignment-item">
                <div class="assignment-icon">
                  <i class="fas fa-tasks text-secondary"></i>
                </div>
                <div class="assignment-details">
                  <h6>تکلیف درس</h6>
                  <p class="text-muted">برای مشاهده تکلیف کلیک کنید</p>
                </div>
                <div class="assignment-actions">
                  <button v-if="isEnrolled && !isTeacher" class="btn btn-sm btn-secondary">
                    <i class="fas fa-upload"></i> ارسال تکلیف
                  </button>
                  <button v-if="isTeacher && isTeacherOfCourse" class="btn btn-sm btn-outline-info">
                    <i class="fas fa-cog"></i> مدیریت
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Student Completion Button -->
          <div v-if="isEnrolled && !completedLessons.includes(lesson.id)" class="lesson-completion mt-3">
            <button
                class="btn btn-success"
                @click="$emit('mark-complete', lesson.id)"
            >
              <i class="fas fa-check me-1"></i> علامت‌گذاری به عنوان تکمیل شده
            </button>
          </div>

          <!-- Empty Content Message -->
          <div v-if="(!lesson.contents || lesson.contents.length === 0) && !lesson.hasExam && !lesson.hasExercise && !lesson.hasAssignment" class="empty-lesson-content">
            <div class="alert alert-info text-center">
              <i class="fas fa-info-circle me-2"></i>
              هنوز محتوایی برای این درس اضافه نشده است.
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
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
  ]
}
</script>

<style scoped>
.lesson-list {
  margin-top: 1rem;
}

.lesson-card {
  background-color: #fff;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  margin-bottom: 1rem;
  transition: box-shadow 0.2s;
}

.lesson-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.lesson-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  cursor: pointer;
  border-bottom: 1px solid #f8f9fa;
}

.lesson-info {
  display: flex;
  align-items: center;
  flex: 1;
}

.lesson-number {
  background-color: #007bff;
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-left: 1rem;
  flex-shrink: 0;
}

.lesson-details {
  flex: 1;
}

.lesson-title {
  margin-bottom: 0.25rem;
  font-size: 1.1rem;
}

.lesson-description {
  margin-bottom: 0;
  color: #6c757d;
  font-size: 0.9rem;
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
}

.lesson-expand-icon {
  color: #6c757d;
  font-size: 1.1rem;
}

.lesson-content {
  padding: 1rem;
  background-color: #f8f9fa;
}

.teacher-actions {
  border-bottom: 1px solid #dee2e6;
  padding-bottom: 1rem;
}

.lesson-materials, .lesson-exams, .lesson-exercises, .lesson-assignments {
  margin-bottom: 1rem;
}

.content-list, .exam-list, .exercise-list, .assignment-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.content-item, .exam-item, .exercise-item, .assignment-item {
  display: flex;
  align-items: center;
  background-color: white;
  padding: 0.75rem;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.content-icon, .exam-icon, .exercise-icon, .assignment-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
  border-radius: 6px;
  margin-left: 0.75rem;
  flex-shrink: 0;
}

.content-details, .exam-details, .exercise-details, .assignment-details {
  flex: 1;
}

.content-details h6, .exam-details h6, .exercise-details h6, .assignment-details h6 {
  margin-bottom: 0.25rem;
  font-size: 0.95rem;
}

.content-details p, .exam-details p, .exercise-details p, .assignment-details p {
  margin-bottom: 0;
  font-size: 0.85rem;
  color: #6c757d;
}

.content-actions, .exam-actions, .exercise-actions, .assignment-actions {
  flex-shrink: 0;
}

.lesson-completion {
  text-align: center;
  padding-top: 1rem;
  border-top: 1px solid #dee2e6;
}

.empty-lesson-content {
  text-align: center;
  padding: 2rem;
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

  .teacher-actions .d-flex {
    flex-direction: column;
    gap: 0.5rem;
  }

  .teacher-actions .btn {
    width: 100%;
  }

  .content-item, .exam-item, .exercise-item, .assignment-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .content-icon, .exam-icon, .exercise-icon, .assignment-icon {
    margin-left: 0;
  }

  .content-actions, .exam-actions, .exercise-actions, .assignment-actions {
    width: 100%;
  }

  .content-actions .btn, .exam-actions .btn, .exercise-actions .btn, .assignment-actions .btn {
    width: 100%;
  }
}

/* Badge Styles */
.badge {
  font-size: 0.75rem;
  padding: 0.375rem 0.5rem;
}

.badge i {
  margin-left: 0.25rem;
}

/* Animation for expanding/collapsing */
.lesson-content {
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>