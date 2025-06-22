<template>
  <div class="exam-results-table">
    <div class="modern-card animate-slide-up">
      <div class="modern-card-header bg-success text-white">
        <h5 class="mb-0">
          <i class="fas fa-table me-2"></i>
          جدول نتایج آزمون‌ها
        </h5>
      </div>

      <div class="modern-card-body">
        <!-- Empty State -->
        <div v-if="!submissions || submissions.length === 0" class="empty-state">
          <div class="text-center py-5">
            <div class="modern-logo large secondary mb-4">
              <i class="fas fa-chart-line"></i>
            </div>
            <h4 class="text-muted mb-3">نتیجه‌ای یافت نشد</h4>
            <p class="text-muted">
              هنوز هیچ دانش‌آموزی در آزمون‌ها شرکت نکرده است
            </p>
          </div>
        </div>

        <!-- Results Table -->
        <div v-else class="modern-table-container">
          <table class="modern-table table">
            <thead>
            <tr>
              <th>
                <i class="fas fa-user me-1"></i>
                نام دانش‌آموز
              </th>
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
            <tr v-for="submission in submissions" :key="submission.id" class="result-row">
              <td>
                <div class="student-info">
                  <div class="student-avatar">
                    {{ getStudentInitials(submission.student) }}
                  </div>
                  <div class="student-details">
                    <div class="student-name">{{ getStudentName(submission.student) }}</div>
                    <small class="student-username text-muted">
                      @{{ submission.student?.username || 'نامشخص' }}
                    </small>
                  </div>
                </div>
              </td>
              <td>
                <div class="exam-info">
                  <div class="exam-title">{{ submission.exam ? submission.exam.title : 'نامشخص' }}</div>
                  <small class="text-muted">
                    <i class="fas fa-question-circle me-1"></i>
                    {{ submission.exam?.questionCount || 0 }} سوال
                  </small>
                </div>
              </td>
              <td>
                <div class="course-info">
                    <span class="modern-badge modern-badge-secondary">
                      {{ getCourseTitle(submission.exam ? submission.exam.lesson : null) }}
                    </span>
                </div>
              </td>
              <td>
                <div class="score-container">
                  <div class="score-circle" :class="getScoreClass(submission.score)">
                    <span class="score-value">{{ submission.score }}</span>
                    <span class="score-unit">%</span>
                  </div>
                </div>
              </td>
              <td>
                  <span :class="submission.passed ? 'modern-badge modern-badge-success' : 'modern-badge modern-badge-danger'">
                    <i :class="submission.passed ? 'fas fa-check-circle' : 'fas fa-times-circle'" class="me-1"></i>
                    {{ submission.passed ? 'قبول' : 'مردود' }}
                  </span>
              </td>
              <td>
                <div class="date-info">
                  <div class="submission-date">{{ formatDate(submission.submissionTime) }}</div>
                  <small class="text-muted">{{ formatTime(submission.submissionTime) }}</small>
                </div>
              </td>
            </tr>
            </tbody>
          </table>
        </div>

        <!-- Statistics Summary -->
        <div v-if="submissions && submissions.length > 0" class="results-summary mt-4">
          <div class="form-section">
            <h6 class="section-title">
              <i class="fas fa-chart-pie text-info me-2"></i>
              خلاصه آمار
            </h6>
            <div class="row">
              <div class="col-md-3 mb-3">
                <div class="modern-stat-card">
                  <div class="modern-stat-icon text-primary">
                    <i class="fas fa-users"></i>
                  </div>
                  <div class="modern-stat-value">{{ submissions.length }}</div>
                  <div class="modern-stat-label">کل شرکت‌کنندگان</div>
                </div>
              </div>

              <div class="col-md-3 mb-3">
                <div class="modern-stat-card">
                  <div class="modern-stat-icon text-success">
                    <i class="fas fa-user-check"></i>
                  </div>
                  <div class="modern-stat-value">{{ getPassedCount() }}</div>
                  <div class="modern-stat-label">قبول شدگان</div>
                </div>
              </div>

              <div class="col-md-3 mb-3">
                <div class="modern-stat-card">
                  <div class="modern-stat-icon text-danger">
                    <i class="fas fa-user-times"></i>
                  </div>
                  <div class="modern-stat-value">{{ getFailedCount() }}</div>
                  <div class="modern-stat-label">مردود شدگان</div>
                </div>
              </div>

              <div class="col-md-3 mb-3">
                <div class="modern-stat-card">
                  <div class="modern-stat-icon text-warning">
                    <i class="fas fa-chart-line"></i>
                  </div>
                  <div class="modern-stat-value">{{ getAverageScore() }}%</div>
                  <div class="modern-stat-label">میانگین نمرات</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import tableMixin from '@/mixins/tableMixin.js';

export default {
  name: 'ExamResultsTable',
  mixins: [tableMixin],
  props: {
    submissions: {
      type: Array,
      required: true
    }
  },
  methods: {
    getCourseTitle(lesson) {
      if (!lesson || !lesson.course) return 'نامشخص';
      return lesson.course.title;
    },
    getStudentName(student) {
      if (!student) return 'نامشخص';

      const firstName = student.firstName || '';
      const lastName = student.lastName || '';

      if (firstName && lastName) {
        return `${firstName} ${lastName}`;
      } else if (firstName) {
        return firstName;
      } else if (lastName) {
        return lastName;
      } else if (student.username) {
        return student.username;
      }

      return 'نامشخص';
    },

    getStudentInitials(student) {
      if (!student) return 'N';
      const firstName = student.firstName || '';
      const lastName = student.lastName || '';
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || student.username?.charAt(0)?.toUpperCase() || 'U';
    },

    getScoreClass(score) {
      if (score >= 90) return 'excellent';
      if (score >= 80) return 'good';
      if (score >= 70) return 'average';
      if (score >= 60) return 'poor';
      return 'fail';
    },

    formatTime(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleTimeString('fa-IR', {
        hour: '2-digit',
        minute: '2-digit'
      });
    },

    getPassedCount() {
      return this.submissions.filter(sub => sub.passed).length;
    },

    getFailedCount() {
      return this.submissions.filter(sub => !sub.passed).length;
    },

    getAverageScore() {
      if (!this.submissions.length) return 0;
      const total = this.submissions.reduce((sum, sub) => sum + (sub.score || 0), 0);
      return Math.round(total / this.submissions.length);
    }
  }
}
</script>

<style scoped>
.exam-results-table {
  min-height: 400px;
}

/* Table row hover effect */
.result-row {
  transition: all 0.2s ease;
}

.result-row:hover {
  background: rgba(102, 126, 234, 0.05);
  transform: translateY(-1px);
}

/* Student info styling */
.student-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

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
  font-size: 0.85rem;
  flex-shrink: 0;
}

.student-details {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.student-name {
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.student-username {
  font-size: 0.75rem;
  margin-top: 0.1rem;
}

/* Exam info styling */
.exam-info {
  display: flex;
  flex-direction: column;
}

.exam-title {
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
  line-height: 1.3;
}

/* Course info styling */
.course-info {
  text-align: center;
}

/* Score circle styling */
.score-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.score-circle {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  border: 3px solid;
  font-weight: 700;
}

.score-circle.excellent {
  background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%);
  border-color: #27ae60;
  color: white;
}

.score-circle.good {
  background: linear-gradient(135deg, #3498db 0%, #74b9ff 100%);
  border-color: #3498db;
  color: white;
}

.score-circle.average {
  background: linear-gradient(135deg, #f39c12 0%, #fdcb6e 100%);
  border-color: #f39c12;
  color: white;
}

.score-circle.poor {
  background: linear-gradient(135deg, #e67e22 0%, #fd79a8 100%);
  border-color: #e67e22;
  color: white;
}

.score-circle.fail {
  background: linear-gradient(135deg, #e74c3c 0%, #fd79a8 100%);
  border-color: #e74c3c;
  color: white;
}

.score-value {
  font-size: 0.9rem;
  line-height: 1;
}

.score-unit {
  font-size: 0.6rem;
  margin-left: 1px;
}

/* Date info styling */
.date-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.submission-date {
  font-weight: 600;
  color: #333;
  font-size: 0.85rem;
  margin-bottom: 0.1rem;
}

/* Empty state */
.empty-state {
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Responsive adjustments */
@media (max-width: 992px) {
  .modern-table-container {
    overflow-x: auto;
  }

  .modern-table {
    min-width: 800px;
  }
}

@media (max-width: 768px) {
  .student-info {
    flex-direction: column;
    text-align: center;
    gap: 0.5rem;
  }

  .student-avatar {
    width: 35px;
    height: 35px;
    font-size: 0.75rem;
  }

  .score-circle {
    width: 45px;
    height: 45px;
  }

  .score-value {
    font-size: 0.8rem;
  }

  .exam-title {
    font-size: 0.8rem;
  }
}

@media (max-width: 576px) {
  .results-summary .col-md-3 {
    margin-bottom: 1rem;
  }

  .modern-stat-card {
    padding: 1rem;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .student-name,
  .exam-title,
  .submission-date {
    color: #e2e8f0;
  }

  .result-row:hover {
    background: rgba(102, 126, 234, 0.1);
  }
}
</style>