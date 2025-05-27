<template>
  <div class="modern-table-container">
    <table class="modern-table table">
      <thead>
      <tr>
        <th>
          <i class="fas fa-clipboard-check me-1"></i>
          عنوان آزمون
        </th>
        <th>
          <i class="fas fa-book me-1"></i>
          دوره
        </th>
        <th>
          <i class="fas fa-star me-1"></i>
          نمره
        </th>
        <th>
          <i class="fas fa-info-circle me-1"></i>
          وضعیت
        </th>
        <th>
          <i class="fas fa-calendar me-1"></i>
          تاریخ
        </th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="exam in exams" :key="exam.id">
        <td>
          <div class="d-flex align-items-center">
            <div class="exam-icon me-2">
              <i class="fas fa-clipboard-check"></i>
            </div>
            <span class="fw-semibold">{{ exam.exam ? exam.exam.title : 'نامشخص' }}</span>
          </div>
        </td>
        <td>{{ getCourseTitle(exam.exam ? exam.exam.lesson : null) }}</td>
        <td>
          <div class="d-flex align-items-center">
            <span class="fw-bold text-primary me-1">{{ exam.score }}</span>
            <small class="text-muted">/ 100</small>
          </div>
        </td>
        <td>
          <span class="modern-badge" :class="exam.passed ? 'modern-badge-success' : 'modern-badge-danger'">
            <i :class="exam.passed ? 'fas fa-check' : 'fas fa-times'" class="me-1"></i>
            {{ exam.passed ? 'قبول' : 'مردود' }}
          </span>
        </td>
        <td>
          <div>{{ formatDate(exam.submissionTime) }}</div>
          <small class="text-muted">{{ getTimeAgo(exam.submissionTime) }}</small>
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import { useFormatters } from '@/composables/useFormatters.js';

export default {
  name: 'StudentExamsTable',
  props: {
    exams: {
      type: Array,
      required: true
    }
  },
  setup() {
    const { formatDate } = useFormatters();
    return { formatDate };
  },
  methods: {
    getCourseTitle(lesson) {
      if (!lesson || !lesson.course) return 'نامشخص';
      return lesson.course.title;
    },

    getTimeAgo(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      const now = new Date();
      const diffInSeconds = Math.floor((now - date) / 1000);

      if (diffInSeconds < 60) return 'هم‌اکنون';
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} دقیقه پیش`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} ساعت پیش`;
      if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} روز پیش`;
      return `${Math.floor(diffInSeconds / 604800)} هفته پیش`;
    }
  }
}
</script>

<style scoped>
.exam-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
}

/* Responsive */
@media (max-width: 768px) {
  .modern-table-container {
    overflow-x: auto;
  }

  .modern-table {
    min-width: 600px;
  }
}
</style>