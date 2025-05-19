<template>
  <div class="student-activity-table">
    <table class="table table-hover">
      <thead class="table-light">
      <tr>
        <th scope="col">#</th>
        <th scope="col">نام دانش‌آموز</th>
        <th scope="col">درصد پیشرفت</th>
        <th scope="col">آخرین فعالیت</th>
        <th scope="col">عملکرد</th>
        <th scope="col">عملیات</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="(student, index) in students" :key="student.id">
        <td>{{ index + 1 }}</td>
        <td>
          <div class="d-flex align-items-center">
            <div class="avatar me-2">
              <span>{{ getInitials(student) }}</span>
            </div>
            <div>
              {{ getStudentName(student) }}
              <div class="small text-muted">{{ student.email }}</div>
            </div>
          </div>
        </td>
        <td>
          <div class="progress" style="height: 6px;">
            <div
                class="progress-bar"
                :class="getProgressBarClass(student.progress)"
                role="progressbar"
                :style="`width: ${student.progress}%`"
                :aria-valuenow="student.progress"
                aria-valuemin="0"
                aria-valuemax="100">
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
              <span
                  class="badge me-2"
                  :class="getPerformanceBadgeClass(student.performance)">
                {{ getPerformanceLabel(student.performance) }}
              </span>
            <i
                v-if="student.trend === 'up'"
                class="fas fa-arrow-up text-success"></i>
            <i
                v-else-if="student.trend === 'down'"
                class="fas fa-arrow-down text-danger"></i>
            <i
                v-else
                class="fas fa-arrows-left-right text-muted"></i>
          </div>
        </td>
        <td>
          <button
              class="btn btn-sm btn-outline-primary"
              @click="$emit('view-progress', student)"
              title="مشاهده جزئیات">
            <i class="fas fa-chart-line"></i>
          </button>
          <button
              class="btn btn-sm btn-outline-info ms-1"
              @click="$emit('send-message', student)"
              title="ارسال پیام">
            <i class="fas fa-envelope"></i>
          </button>
        </td>
      </tr>
      </tbody>
    </table>
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
  setup() {
    const { formatDate } = useFormatters();

    return { formatDate };
  },
  methods: {
    getInitials(student) {
      if (!student) return 'N/A';

      const firstName = student.firstName || '';
      const lastName = student.lastName || '';

      const firstInitial = firstName ? firstName.charAt(0) : '';
      const lastInitial = lastName ? lastName.charAt(0) : '';

      return (firstInitial + lastInitial).toUpperCase();
    },

    getStudentName(student) {
      if (!student) return 'نامشخص';
      return student.firstName && student.lastName
          ? `${student.firstName} ${student.lastName}`
          : student.username;
    },

    getProgressBarClass(progress) {
      if (progress >= 75) return 'bg-success';
      if (progress >= 50) return 'bg-info';
      if (progress >= 25) return 'bg-warning';
      return 'bg-danger';
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
      if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)} هفته پیش`;

      return `${Math.floor(diffInSeconds / 2592000)} ماه پیش`;
    },

    getPerformanceBadgeClass(performance) {
      if (performance === 'excellent') return 'bg-success';
      if (performance === 'good') return 'bg-info';
      if (performance === 'average') return 'bg-warning';
      if (performance === 'poor') return 'bg-danger';
      return 'bg-secondary';
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
.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #e9ecef;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: bold;
  color: #495057;
}

.progress {
  border-radius: 10px;
  background-color: #e9ecef;
}

.progress-bar {
  border-radius: 10px;
}
</style>
