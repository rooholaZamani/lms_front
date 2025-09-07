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
            میانگین نمره آزمون
          </th>
          <th>
            <i class="fas fa-cogs me-1"></i>
             میانگین نمره تکلیف
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
              {{ student.nationalId || '---' }}
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

              <span class="score-value" :class="getScoreClass(getStudentAverageScore(student.id))">
                 {{ getStudentAverageScore(student.id) }}
             </span>
            </div>
          </td>
          <td>
            <div class="d-flex gap-2">
              <span class="score-value" :class="getScoreClass(getStudentAssignmentAverageScore(student.id))">
                 {{ getStudentAssignmentAverageScore(student.id) }}
             </span>
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
import ConfirmationDialog from '@/components/common/ConfirmationDialog.vue';
import { useUser } from '@/composables/useUser.js';

export default {
  name: 'StudentsTab',
  mixins: [tableMixin],
  props: {
    course: {
      type: Object,
      required: true
    },
    isTeacherOfCourse: {
      type: Boolean,
      default: false
    }
  },
  setup() {
    const { formatDate } = useFormatters();
    return { formatDate };
  },
  methods: {
    getStudentAssignmentAverageScore(studentId) {
      // اگر دیتای تکالیف دانش‌آموز موجود است
      if (this.course.assignmentResults) {
        const studentAssignments = this.course.assignmentResults.filter(assignment => assignment.studentId === studentId);
        if (studentAssignments.length === 0) return 0;

        const totalScore = studentAssignments.reduce((sum, assignment) => sum + (assignment.score || 0), 0);
        return Math.round(totalScore / studentAssignments.length);
      }

      // اگر دیتا در قالب دیگر موجود است
      if (this.course.progress) {
        const studentProgress = this.course.progress.find(p => p.studentId === studentId);
        return studentProgress?.averageAssignmentScore || 0;
      }

      return 0;
    },
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
    getStudentAverageScore(studentId) {

      console.log('=== Debug Student Average Score ===');
      console.log('Student ID:', studentId);
      console.log('Course object:', this.course);
      console.log('Course.examResults:', this.course.examResults);
      console.log('Course.progress:', this.course.progress);
      console.log('Course keys:', Object.keys(this.course));

      // اگر دیتای آزمون‌های دانش‌آموز موجود است
      if (this.course.examResults) {
        const studentExams = this.course.examResults.filter(exam => exam.studentId === studentId);
        if (studentExams.length === 0) return 0;

        const totalScore = studentExams.reduce((sum, exam) => sum + (exam.score || 0), 0);
        return Math.round(totalScore / studentExams.length);
      }

      // اگر دیتا در قالب دیگر موجود است
      if (this.course.progress) {
        const studentProgress = this.course.progress.find(p => p.studentId === studentId);
        return studentProgress?.averageExamScore || 0;
      }

      return 0;
    },

    getScoreClass(score) {
      if (score >= 17) return 'score-excellent';
      if (score >= 14) return 'score-good';
      if (score >= 10) return 'score-average';
      if (score >= 7) return 'score-poor';
      return 'score-fail';
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