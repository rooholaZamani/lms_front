<template>
  <div class="modern-card animate-slide-up">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h5 class="modern-title mb-0">
        <i class="fas fa-list text-primary me-2"></i>
        دوره‌های من
      </h5>
      <div class="d-flex gap-2">
        <button class="modern-btn modern-btn-success" @click="$emit('add-course')">
          <i class="fas fa-plus me-1"></i> افزودن دوره
        </button>
        <button class="modern-btn modern-btn-secondary">
          <i class="fas fa-download me-1"></i> خروجی Excel
        </button>
      </div>
    </div>

    <div class="modern-table-container" v-if="courses.length > 0">
      <table class="modern-table table">
        <thead>
        <tr>
          <th>
            <i class="fas fa-book me-1"></i>
            عنوان دوره
          </th>
          <th>
            <i class="fas fa-list-ol me-1"></i>
            تعداد درس‌ها
          </th>
          <th>
            <i class="fas fa-users me-1"></i>
            تعداد دانش‌آموزان
          </th>
          <th>
            <i class="fas fa-info-circle me-1"></i>
            وضعیت
          </th>
          <th>
            <i class="fas fa-cogs me-1"></i>
            عملیات
          </th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="course in courses" :key="course.id" class="course-row">
          <td>
            <div class="course-info">
              <h6 class="course-title">{{ course.title }}</h6>
              <small class="text-muted">{{ truncateText(course.description, 50) }}</small>
            </div>
          </td>
          <td>
              <span class="modern-badge modern-badge-info">
                {{ course.lessons ? course.lessons.length : 0 }}
              </span>
          </td>
          <td>
            <div class="d-flex align-items-center">
                <span class="fw-bold text-primary me-2">
                  {{ course.enrolledStudents ? course.enrolledStudents.length : 0 }}
                </span>
              <i class="fas fa-user-graduate text-muted"></i>
            </div>
          </td>
          <td>
              <span class="modern-badge modern-badge-success">
                <i class="fas fa-check-circle me-1"></i>
                فعال
              </span>
          </td>
          <td>
            <div class="action-buttons">
              <router-link
                  :to="{ name: 'CourseDetail', params: { id: course.id } }"
                  class="action-btn primary"
                  title="مشاهده جزئیات"
              >
                <i class="fas fa-eye"></i>
              </router-link>
              <button
                  class="action-btn success"
                  @click="$emit('edit', course)"
                  title="ویرایش دوره"
              >
                <i class="fas fa-edit"></i>
              </button>
              <button
                  class="action-btn info"
                  @click="$emit('add-lesson', course)"
                  title="افزودن درس"
              >
                <i class="fas fa-plus"></i>
              </button>
              <button
                  class="action-btn warning"
                  @click="$emit('add-exam', course)"
                  title="افزودن آزمون"
              >
                <i class="fas fa-clipboard-check"></i>
              </button>
            </div>
          </td>
        </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <div class="text-center py-5">
        <div class="modern-logo large secondary mb-4">
          <i class="fas fa-graduation-cap"></i>
        </div>
        <h4 class="text-muted mb-3">هنوز دوره‌ای ایجاد نکرده‌اید</h4>
        <p class="text-muted mb-4">
          با ایجاد اولین دوره خود، آموزش را شروع کنید.
        </p>
        <button class="modern-btn modern-btn-primary" @click="$emit('add-course')">
          <i class="fas fa-plus me-1"></i> ایجاد دوره جدید
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { useFormatters } from '@/composables/useFormatters.js';

export default {
  name: 'CourseTable',
  props: {
    courses: {
      type: Array,
      required: true
    }
  },
  setup() {
    const { truncateText } = useFormatters();

    return {
      truncateText
    };
  }
}
</script>

<style scoped>
/* Course Row */
.course-row {
  transition: all 0.2s ease;
}

.course-row:hover {
  background: rgba(102, 126, 234, 0.05);
  transform: translateY(-1px);
}

/* Course Info */
.course-info .course-title {
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: #333;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 0.25rem;
}

.action-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.75rem;
  text-decoration: none;
}

.action-btn.primary {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
}

.action-btn.success {
  background: rgba(40, 167, 69, 0.1);
  color: #28a745;
}

.action-btn.info {
  background: rgba(23, 162, 184, 0.1);
  color: #17a2b8;
}

.action-btn.warning {
  background: rgba(255, 193, 7, 0.1);
  color: #ffc107;
}

.action-btn:hover {
  transform: scale(1.1);
}

.action-btn.primary:hover {
  background: rgba(102, 126, 234, 0.2);
}

.action-btn.success:hover {
  background: rgba(40, 167, 69, 0.2);
}

.action-btn.info:hover {
  background: rgba(23, 162, 184, 0.2);
}

.action-btn.warning:hover {
  background: rgba(255, 193, 7, 0.2);
}

/* Empty State */
.empty-state {
  padding: 3rem 1rem;
}

/* Responsive */
@media (max-width: 768px) {
  .d-flex.justify-content-between.align-items-center {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch !important;
  }

  .action-buttons {
    justify-content: center;
  }
}

@media (max-width: 992px) {
  .modern-table-container {
    overflow-x: auto;
  }

  .modern-table {
    min-width: 700px;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .course-row:hover {
    background: rgba(102, 126, 234, 0.1);
  }

  .course-info .course-title {
    color: #e2e8f0;
  }
}
</style>