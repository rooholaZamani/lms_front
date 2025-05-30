<template>
  <div class="assignment-grading-table">
    <div class="modern-table-container">
      <table class="modern-table table">
        <thead>
        <tr>
          <th scope="col">#</th>
          <th scope="col">عنوان تکلیف</th>
          <th scope="col">دوره</th>
          <th scope="col">دانش‌آموز</th>
          <th scope="col">تاریخ ارسال</th>
          <th scope="col">وضعیت</th>
          <th scope="col">عملیات</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(assignment, index) in assignments" :key="assignment.id">
          <td>{{ index + 1 }}</td>
          <td>
            <div class="d-flex align-items-center">
              <div class="assignment-icon me-2">
                <i :class="getAssignmentIcon(assignment.type)"></i>
              </div>
              <div>
                {{ assignment.title }}
                <div class="small text-muted">{{ truncateText(assignment.description, 50) }}</div>
              </div>
            </div>
          </td>
          <td>{{ assignment.course.title }}</td>
          <td>
            <div class="d-flex align-items-center">
              <div class="student-avatar me-2">
                <span>{{ getInitials(assignment.student.firstName, assignment.student.lastName) }}</span>
              </div>
              <div>
                {{ assignment.student.firstName }} {{ assignment.student.lastName }}
              </div>
            </div>
          </td>
          <td>
            <div>{{ formatDate(assignment.submissionDate) }}</div>
            <div class="small text-muted">{{ getTimeAgo(assignment.submissionDate) }}</div>
          </td>
          <td>
              <span
                  class="modern-badge"
                  :class="getStatusBadgeClass(assignment.status)">
                {{ getStatusLabel(assignment.status) }}
              </span>
          </td>
          <td>
            <button
                class="modern-btn modern-btn-primary modern-btn-sm me-1"
                @click="$emit('grade', assignment)"
                title="نمره‌دهی">
              <i class="fas fa-check-circle me-1"></i> ارزیابی
            </button>
            <button
                class="modern-btn modern-btn-outline modern-btn-sm"
                @click="previewAssignment(assignment)"
                title="پیش‌نمایش">
              <i class="fas fa-eye"></i>
            </button>
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
  name: 'AssignmentGradingTable',
  props: {
    assignments: {
      type: Array,
      required: true
    }
  },
  setup() {
    const { formatDate, truncateText } = useFormatters();

    return { formatDate, truncateText };
  },
  methods: {
    getInitials(firstName, lastName) {
      if (!firstName && !lastName) return 'N/A';

      const firstInitial = firstName ? firstName.charAt(0) : '';
      const lastInitial = lastName ? lastName.charAt(0) : '';

      return (firstInitial + lastInitial).toUpperCase();
    },

    getAssignmentIcon(type) {
      const icons = {
        document: 'fas fa-file-alt',
        code: 'fas fa-code',
        research: 'fas fa-search',
        presentation: 'fas fa-file-powerpoint',
        design: 'fas fa-paint-brush',
        writing: 'fas fa-pen'
      };

      return icons[type] || 'fas fa-file-alt';
    },

    getStatusBadgeClass(status) {
      if (status === 'pending') return 'modern-badge-warning';
      if (status === 'reviewed') return 'modern-badge-success';
      if (status === 'late') return 'modern-badge-danger';
      if (status === 'resubmit') return 'modern-badge-info';
      return 'modern-badge-secondary';
    },

    getStatusLabel(status) {
      const labels = {
        pending: 'در انتظار بررسی',
        reviewed: 'بررسی شده',
        late: 'با تاخیر',
        resubmit: 'نیاز به ارسال مجدد'
      };

      return labels[status] || 'نامشخص';
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

    previewAssignment(assignment) {
      this.$emit('preview', assignment);
    }
  }
}
</script>

<style scoped>
.student-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: bold;
  color: white;
}

.assignment-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: rgba(102, 126, 234, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  color: #667eea;
}
</style>