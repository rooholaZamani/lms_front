<!-- ExamResults.vue -->
<template>
  <div class="modern-page-bg success-gradient">
    <div class="modern-container large animate-slide-up">
      <div class="modern-header">
        <button class="modern-btn modern-btn-outline mb-3" @click="$router.go(-1)">
          <i class="fas fa-arrow-right me-1"></i>
          بازگشت
        </button>
        <div class="modern-logo success">
          <i class="fas fa-chart-bar"></i>
        </div>
        <h1 class="modern-title">نتایج آزمون</h1>
        <p class="modern-subtitle" v-if="exam">{{ exam.title }}</p>
      </div>

      <loading-spinner :loading="loading">
        <div v-if="error" class="alert alert-danger">
          {{ error }}
        </div>

        <div v-else-if="exam" class="row">
          <!-- آمار کلی آزمون -->
          <div class="col-md-4 mb-4">
            <div class="modern-card">
              <div class="modern-card-body">
                <h5 class="modern-card-title">آمار کلی</h5>
                <div class="exam-stats">
                  <div class="stat-item">
                    <span class="stat-label">تعداد شرکت‌کنندگان:</span>
                    <span class="stat-value">{{ submissions.length }}</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">میانگین نمرات:</span>
                    <span class="stat-value">{{ averageScore }}</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">نرخ قبولی:</span>
                    <span class="stat-value">{{ passRate }}%</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">بالاترین نمره:</span>
                    <span class="stat-value">{{ highestScore }}</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">پایین‌ترین نمره:</span>
                    <span class="stat-value">{{ lowestScore }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- جدول نتایج -->
          <div class="col-md-8 mb-4">
            <div class="modern-card">
              <div class="modern-card-header">
                <h5 class="modern-card-title">نتایج دانش‌آموزان</h5>
              </div>
              <div class="modern-card-body">
                <div v-if="submissions.length === 0" class="text-center p-4">
                  <i class="fas fa-inbox fa-3x text-muted mb-3"></i>
                  <p class="text-muted">هنوز هیچ دانش‌آموزی در این آزمون شرکت نکرده است.</p>
                </div>
                <div v-else class="table-responsive">
                  <table class="table table-hover">
                    <thead>
                    <tr>
                      <th>دانش‌آموز</th>
                      <th>نمره</th>
                      <th>درصد</th>
                      <th>وضعیت</th>
                      <th>زمان ارسال</th>
                      <th>عملیات</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-for="submission in sortedSubmissions" :key="submission.id">
                      <td>
                        <div class="student-info">
                          <strong>{{ getStudentName(submission) }}</strong>
                          <br>
                          <small class="text-muted">{{ submission.student.username }}</small>
                        </div>
                      </td>
                      <td>
                          <span class="score-badge" :class="getScoreBadgeClass(submission)">
                            {{ submission.score || 0 }} / {{ exam.totalPossibleScore || 0 }}
                          </span>
                      </td>
                      <td>
                        <div class="progress" style="height: 20px;">
                          <div class="progress-bar"
                               :class="getProgressBarClass(submission)"
                               :style="{ width: getScorePercentage(submission) + '%' }">
                            {{ getScorePercentage(submission) }}%
                          </div>
                        </div>
                      </td>
                      <td>
                          <span class="badge" :class="getStatusBadgeClass(submission)">
                            {{ submission.passed ? 'قبول' : 'مردود' }}
                          </span>
                      </td>
                      <td>
                        <small>{{ formatDate(submission.submissionTime) }}</small>
                      </td>
                      <td>
                        <button class="btn btn-sm btn-outline-primary"
                                @click="viewAnswers(submission.id)">
                          <i class="fas fa-eye"></i>
                          مشاهده پاسخ‌ها
                        </button>
                      </td>
                    </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </loading-spinner>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';

export default {
  name: 'ExamResults',
  components: {
    LoadingSpinner
  },
  props: {
    id: {
      type: [String, Number],
      required: true
    }
  },
  data() {
    return {
      loading: true,
      error: null,
      exam: null,
      submissions: []
    };
  },
  computed: {
    averageScore() {
      if (this.submissions.length === 0) return '0';
      const total = this.submissions.reduce((sum, sub) => sum + (sub.score || 0), 0);
      return (total / this.submissions.length).toFixed(1);
    },
    passRate() {
      if (this.submissions.length === 0) return '0';
      const passed = this.submissions.filter(sub => sub.passed).length;
      return Math.round((passed / this.submissions.length) * 100);
    },
    highestScore() {
      if (this.submissions.length === 0) return '0';
      return Math.max(...this.submissions.map(sub => sub.score || 0));
    },
    lowestScore() {
      if (this.submissions.length === 0) return '0';
      return Math.min(...this.submissions.map(sub => sub.score || 0));
    },
    sortedSubmissions() {
      return [...this.submissions].sort((a, b) => (b.score || 0) - (a.score || 0));
    }
  },
  async created() {
    await this.fetchExamData();
    await this.fetchSubmissions();
  },
  methods: {
    async fetchExamData() {
      try {
        const response = await axios.get(`/exams/${this.id}`);
        this.exam = response.data;
      } catch (error) {
        console.error('Error fetching exam data:', error);
        this.error = 'خطا در دریافت اطلاعات آزمون';
      }
    },

    async fetchSubmissions() {
      try {
        const response = await axios.get(`/exams/${this.id}/submissions`);
        this.submissions = response.data || [];
      } catch (error) {
        console.error('Error fetching submissions:', error);
        this.error = 'خطا در دریافت نتایج آزمون';
        this.submissions = [];
      } finally {
        this.loading = false;
      }
    },

    getStudentName(submission) {
      const student = submission.student;
      return `${student.firstName} ${student.lastName || ''}`.trim() || student.username;
    },

    getScorePercentage(submission) {
      if (!this.exam?.totalPossibleScore) return 0;
      return Math.round(((submission.score || 0) / this.exam.totalPossibleScore) * 100);
    },

    getScoreBadgeClass(submission) {
      return submission.passed ? 'badge bg-success' : 'badge bg-danger';
    },

    getProgressBarClass(submission) {
      const percentage = this.getScorePercentage(submission);
      if (percentage >= 80) return 'bg-success';
      if (percentage >= 60) return 'bg-warning';
      return 'bg-danger';
    },

    getStatusBadgeClass(submission) {
      return submission.passed ? 'badge bg-success' : 'badge bg-danger';
    },

    formatDate(dateString) {
      if (!dateString) return '';
      return new Date(dateString).toLocaleDateString('fa-IR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    },

    viewAnswers(examId) {
      this.$router.push({
        name: 'ExamAnswers',
        params: { examId }
      });
    }
  }
};
</script>

<style scoped>
.exam-stats {
  background: rgba(0, 0, 0, 0.02);
  padding: 1rem;
  border-radius: 8px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.stat-item:last-child {
  margin-bottom: 0;
}

.stat-label {
  font-weight: 600;
  color: #666;
}

.stat-value {
  color: #333;
  font-weight: 700;
}

.student-info strong {
  font-size: 0.95rem;
}

.score-badge {
  font-weight: 600;
  font-size: 0.9rem;
}

.progress {
  direction: ltr;
}

.table th {
  background-color: #f8f9fa;
  font-weight: 600;
  border-bottom: 2px solid #dee2e6;
}

.table td {
  vertical-align: middle;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.8rem;
}
</style>