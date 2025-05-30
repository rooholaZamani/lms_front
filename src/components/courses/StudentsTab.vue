<template>
  <div class="modern-card animate-slide-up">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h5 class="modern-title mb-0">
        <i class="fas fa-user-graduate text-primary me-2"></i>
        دانش‌آموزان ثبت‌نام شده
      </h5>
      <span class="modern-badge modern-badge-info">
        {{ course.enrolledStudents?.length || 0 }} دانش‌آموز
      </span>
    </div>

    <div v-if="!course.enrolledStudents || course.enrolledStudents.length === 0"
         class="text-center py-5">
      <div class="modern-logo large secondary mb-4">
        <i class="fas fa-user-plus"></i>
      </div>
      <h5 class="mb-3">هنوز دانش‌آموزی ثبت‌نام نکرده</h5>
      <p class="text-muted mb-4">
        دانش‌آموزان می‌توانند از بخش دوره‌های موجود در این دوره ثبت‌نام کنند
      </p>
      <div class="modern-alert modern-alert-info">
        <i class="fas fa-info-circle me-2"></i>
        لینک دوره را با دانش‌آموزان خود به اشتراک بگذارید
      </div>
    </div>

    <div v-else class="modern-table-container">
      <table class="modern-table table">
        <thead>
        <tr>
          <th>
            <i class="fas fa-user me-1"></i>
            نام دانش‌آموز
          </th>
          <th>
            <i class="fas fa-id-card me-1"></i>
            شماره دانش‌آموزی
          </th>
          <th>
            <i class="fas fa-calendar me-1"></i>
            تاریخ ثبت‌نام
          </th>
          <th>
            <i class="fas fa-chart-line me-1"></i>
            پیشرفت
          </th>
          <th>
            <i class="fas fa-cogs me-1"></i>
            عملیات
          </th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="student in course.enrolledStudents" :key="student.id" class="student-row">
          <td>
            <div class="d-flex align-items-center">
              <div class="student-avatar me-3">
                {{ getStudentInitials(student) }}
              </div>
              <div>
                <div class="fw-bold">{{ getStudentName(student) }}</div>
                <small class="text-muted">@{{ student.username || 'نامشخص' }}</small>
              </div>
            </div>
          </td>
          <td>
            <span class="modern-badge modern-badge-secondary">
              {{ student.studentId || '---' }}
            </span>
          </td>
          <td>
            <div class="d-flex flex-column">
              <span>{{ formatDate(student.enrollmentDate) }}</span>
              <small class="text-muted">{{ getTimeAgo(student.enrollmentDate) }}</small>
            </div>
          </td>
          <td>
            <div class="progress-container">
              <div class="progress" style="height: 8px;">
                <div
                    class="progress-bar"
                    :class="getProgressClass(getStudentProgress(student.id))"
                    role="progressbar"
                    :style="`width: ${getStudentProgress(student.id)}%`"
                    :aria-valuenow="getStudentProgress(student.id)"
                    aria-valuemin="0"
                    aria-valuemax="100">
                </div>
              </div>
              <small class="text-muted mt-1">{{ getStudentProgress(student.id) }}%</small>
            </div>
          </td>
          <td>
            <div class="d-flex gap-2">
              <button
                  class="modern-btn modern-btn-primary btn-sm"
                  @click="$emit('view-student-progress', student)"
                  title="مشاهده جزئیات">
                <i class="fas fa-eye"></i>
              </button>
              <button
                  class="modern-btn modern-btn-success btn-sm"
                  @click="sendMessage(student)"
                  title="ارسال پیام">
                <i class="fas fa-envelope"></i>
              </button>
              <button
                  class="modern-btn modern-btn-warning btn-sm"
                  @click="viewAnalytics(student)"
                  title="آمارها">
                <i class="fas fa-chart-bar"></i>
              </button>
            </div>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { useFormatters } from '@/composables/useFormatters.js';
import tableMixin from '@/mixins/tableMixin.js';

export default {
  name: 'StudentsTab',
  mixins: [tableMixin],
  props: {
    course: {
      type: Object,
      required: true
    }
  },
  setup() {
    const { formatDate } = useFormatters();
    return { formatDate };
  },
  methods: {
    getStudentInitials(student) {
      const firstName = student.firstName || '';
      const lastName = student.lastName || '';
      if (firstName && lastName) {
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
      }
      return student.username ? student.username.charAt(0).toUpperCase() : 'U';
    },

    getStudentProgress(studentId) {
      if (!this.course.lessons || this.course.lessons.length === 0) return 0;

      const studentProgress = this.course.progress?.find(p => p.studentId === studentId);
      if (!studentProgress || !studentProgress.completedLessons) return 0;

      const totalLessons = this.course.lessons.length;
      const completedLessons = studentProgress.completedLessons.length;

      return Math.round((completedLessons / totalLessons) * 100);
    },

    getProgressClass(progress) {
      if (progress >= 80) return 'bg-success';
      if (progress >= 60) return 'bg-info';
      if (progress >= 40) return 'bg-warning';
      return 'bg-danger';
    },

    getTimeAgo(dateString) {
      if (!dateString) return '';

      const now = new Date();
      const date = new Date(dateString);
      const diffTime = Math.abs(now - date);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) return 'دیروز';
      if (diffDays < 7) return `${diffDays} روز قبل`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} هفته قبل`;
      return `${Math.floor(diffDays / 30)} ماه قبل`;
    },

    sendMessage(student) {
      // ارسال پیام به دانش‌آموز
      console.log('Send message to:', student);
      this.$toast.info('قابلیت ارسال پیام به زودی اضافه می‌شود');
    },

    viewAnalytics(student) {
      // مشاهده آمار دانش‌آموز
      console.log('View analytics for:', student);
      this.$router.push(`/analytics/student/${student.id}`);
    }
  }
}
</script>

<style scoped>
.student-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.9rem;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.student-row {
  transition: all 0.2s ease;
}

.student-row:hover {
  background: rgba(102, 126, 234, 0.05);
  transform: translateY(-1px);
}

.progress-container {
  min-width: 120px;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.8rem;
}

/* Responsive */
@media (max-width: 768px) {
  .modern-table-container {
    overflow-x: auto;
  }

  .modern-table {
    min-width: 600px;
  }

  .d-flex.gap-2 {
    flex-direction: column;
    gap: 0.25rem !important;
  }

  .btn-sm {
    width: 100%;
  }
}
</style>