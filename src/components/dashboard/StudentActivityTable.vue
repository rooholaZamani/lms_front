<template>
  <div class="modern-card">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h5 class="modern-title mb-0">
        <i class="fas fa-users text-primary me-2"></i>
        فعالیت دانش‌آموزان
      </h5>
    </div>

    <div v-if="students.length === 0" class="text-center py-5">
      <div class="modern-logo large secondary mb-4">
        <i class="fas fa-user-graduate"></i>
      </div>
      <h5 class="text-muted">هیچ فعالیتی یافت نشد</h5>
      <p class="text-muted">در حال حاضر اطلاعات فعالیت دانش‌آموزی موجود نیست.</p>
    </div>

    <div v-else class="modern-table-container">
      <table class="modern-table table">
        <thead>
        <tr>
          <th scope="col">#</th>
          <th scope="col">
            <i class="fas fa-user me-1"></i>
            نام دانش‌آموز
          </th>
          <th scope="col">
            <i class="fas fa-chart-line me-1"></i>
            درصد پیشرفت
          </th>
          <th scope="col">
            <i class="fas fa-clock me-1"></i>
            آخرین فعالیت
          </th>
          <th scope="col">
            <i class="fas fa-star me-1"></i>
            عملکرد
          </th>
          <th scope="col">
            <i class="fas fa-cogs me-1"></i>
            عملیات
          </th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(student, index) in students" :key="student.id">
          <td>{{ index + 1 }}</td>
          <td>
            <div class="d-flex align-items-center">
              <div class="user-avatar me-3">
                <span>{{ getInitials(student) }}</span>
              </div>
              <div>
                <div class="fw-bold">{{ getStudentName(student) }}</div>
                <small class="text-muted">{{ student.email }}</small>
              </div>
            </div>
          </td>
          <td>
            <div class="progress-modern progress-primary">
              <div class="progress-bar-modern"
                   :style="`width: ${student.progress}%`"
                   :aria-valuenow="student.progress"
                   role="progressbar" aria-valuemin="0" aria-valuemax="100">
              </div>
            </div>
            <div class="small text-muted text-center mt-1">{{ student.progress }}%</div>
          </td>
          <td>
            <div>{{ formatDate(student.lastActivity) }}</div>
            <div class="small text-muted">{{ getTimeAgo(student.lastActivity) }}</div>
          </td>
          <td>
            <div class="d-flex align-items-center">
              <span class="modern-badge" :class="getPerformanceBadgeClass(student.performance)">
                {{ getPerformanceLabel(student.performance) }}
              </span>
              <i v-if="student.trend === 'up'" class="fas fa-arrow-up text-success ms-2"></i>
              <i v-else-if="student.trend === 'down'" class="fas fa-arrow-down text-danger ms-2"></i>
              <i v-else class="fas fa-arrows-left-right text-muted ms-2"></i>
            </div>
          </td>
          <td>
            <div class="d-flex gap-2">
              <button class="modern-btn modern-btn-primary btn-sm"
                      @click="$emit('view-progress', student)"
                      title="مشاهده جزئیات">
                <i class="fas fa-chart-line"></i>
              </button>
              <button class="modern-btn modern-btn-secondary btn-sm"
                      @click="$emit('send-message', student)"
                      title="ارسال پیام">
                <i class="fas fa-envelope"></i>
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

export default {
  name: 'StudentActivityTable',
  props: {
    students: {
      type: Array,
      required: true
    }
  },
  emits: ['view-progress', 'send-message'],
  setup() {
    const { formatDate } = useFormatters();

    return { formatDate };
  },
  methods: {
    getInitials(student) {
      if (!student) return 'N/A';
      const firstName = student.firstName || '';
      const lastName = student.lastName || '';
      return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
    },

    getStudentName(student) {
      if (!student) return 'نامشخص';
      return student.firstName && student.lastName
          ? `${student.firstName} ${student.lastName}`
          : student.username;
    },

    getTimeAgo(dateString) {
      if (!dateString) return 'نامشخص';
      const date = new Date(dateString);
      const now = new Date();
      const diffInSeconds = Math.floor((now - date) / 1000);

      if (diffInSeconds < 60) return 'هم‌اکنون';
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} دقیقه پیش`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} ساعت پیش`;
      if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} روز پیش`;
      return `${Math.floor(diffInSeconds / 604800)} هفته پیش`;
    },

    getPerformanceBadgeClass(performance) {
      const classes = {
        excellent: 'modern-badge-success',
        good: 'modern-badge-info',
        average: 'modern-badge-warning',
        poor: 'modern-badge-danger'
      };
      return classes[performance] || 'modern-badge-secondary';
    },

    getPerformanceLabel(performance) {
      const labels = {
        excellent: 'عالی',
        good: 'خوب',
        average: 'متوسط',
        poor: 'ضعیف'
      };
      return labels[performance] || 'نامشخص';
    }
  }
}
</script>

<style scoped>
.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  font-weight: 600;
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