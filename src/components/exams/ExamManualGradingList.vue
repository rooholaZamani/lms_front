<template>
  <div class="exam-manual-grading-list">
    <div class="container-fluid">
      <!-- Page Header -->
      <div class="page-header">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <h1 class="page-title">نمره‌گذاری دستی آزمون‌ها</h1>
            <p class="page-subtitle">آزمون‌هایی که نیاز به نمره‌گذاری دستی دارند</p>
          </div>
          <div class="header-actions">
            <button class="modern-btn modern-btn-outline" @click="refreshData">
              <i class="fas fa-sync-alt me-2"></i>
              تازه‌سازی
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">در حال بارگذاری...</span>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="alert alert-danger">
        <i class="fas fa-exclamation-triangle me-2"></i>
        {{ error }}
      </div>

      <!-- Main Content -->
      <div v-else>
        <!-- Stats -->
        <div class="row mb-4">
          <div class="col-md-3">
            <div class="stat-card">
              <div class="stat-icon bg-primary">
                <i class="fas fa-clipboard-list"></i>
              </div>
              <div class="stat-content">
                <h3>{{ totalExams }}</h3>
                <p>کل آزمون‌ها</p>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="stat-card">
              <div class="stat-icon bg-warning">
                <i class="fas fa-clock"></i>
              </div>
              <div class="stat-content">
                <h3>{{ examsNeedingGrading }}</h3>
                <p>نیازمند نمره‌گذاری</p>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="stat-card">
              <div class="stat-icon bg-info">
                <i class="fas fa-users"></i>
              </div>
              <div class="stat-content">
                <h3>{{ totalPendingSubmissions }}</h3>
                <p>ارسالی در انتظار</p>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="stat-card">
              <div class="stat-icon bg-success">
                <i class="fas fa-check"></i>
              </div>
              <div class="stat-content">
                <h3>{{ completedGrading }}</h3>
                <p>تکمیل شده</p>
              </div>
            </div>
          </div>
        </div>

        <!-- No Data State -->
        <div v-if="!exams || exams.length === 0" class="no-data-container">
          <div class="no-data-content">
            <i class="fas fa-clipboard-check"></i>
            <h3>آزمونی یافت نشد</h3>
            <p>در حال حاضر آزمونی برای نمره‌گذاری دستی وجود ندارد.</p>
          </div>
        </div>

        <!-- Exams List -->
        <div v-else class="modern-card">
          <div class="modern-card-header">
            <h5 class="card-title mb-0">
              <i class="fas fa-list me-2"></i>
              آزمون‌های نیازمند نمره‌گذاری
            </h5>
          </div>
          <div class="modern-card-body">
            <div class="table-responsive">
              <table class="table table-hover">
                <thead>
                <tr>
                  <th>آزمون</th>
                  <th>درس</th>
                  <th>تعداد سوالات تشریحی</th>
                  <th>ارسالی‌های در انتظار</th>
                  <th>آخرین به‌روزرسانی</th>
                  <th>وضعیت</th>
                  <th>عملیات</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="exam in exams" :key="exam.id">
                  <td>
                    <div class="exam-info">
                      <div class="exam-title">{{ exam.title }}</div>
                      <div class="exam-meta">
                        کل سوالات: {{ exam.totalQuestions }} |
                        حداکثر نمره: {{ exam.totalPossibleScore }}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div class="lesson-info">
                      <div class="lesson-name">{{ exam.lessonTitle }}</div>
                      <div class="course-name">{{ exam.courseTitle }}</div>
                    </div>
                  </td>
                  <td>
                  <span class="manual-questions-count">
                    {{ exam.manualQuestionsCount }}
                  </span>
                  </td>
                  <td>
                    <div class="pending-count">
                    <span class="badge bg-warning text-dark" v-if="exam.pendingSubmissions > 0">
                      {{ exam.pendingSubmissions }}
                    </span>
                      <span class="text-muted" v-else>-</span>
                    </div>
                  </td>
                  <td>
                    <div class="last-update">
                      {{ formatDateTime(exam.lastSubmission) }}
                    </div>
                  </td>
                  <td>
<span class="badge" :class="getStatusClass(exam)">
                                                 {{ getStatusText(exam) }}
</span>
                  </td>
                  <td>
                    <div class="action-buttons">
                      <button
                          class="modern-btn modern-btn-sm modern-btn-primary"
                          @click="goToGrading(exam)"
                          :disabled="exam.pendingSubmissions === 0"
                      >
                        <i class="fas fa-edit me-1"></i>
                        نمره‌گذاری
                      </button>
                      <button
                          class="modern-btn modern-btn-sm modern-btn-outline"
                          @click="viewExamResults(exam)"
                      >
                        <i class="fas fa-chart-bar me-1"></i>
                        نتایج
                      </button>
                    </div>
                  </td>
                </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'ExamManualGradingList',
  data() {
    return {
      loading: false,
      error: null,
      exams: []
    }
  },
  computed: {
    totalExams() {
      return this.exams.length;
    },
    examsNeedingGrading() {
      return this.exams.filter(exam => exam.pendingSubmissions > 0).length;
    },
    totalPendingSubmissions() {
      return this.exams.reduce((total, exam) => total + exam.pendingSubmissions, 0);
    },
    completedGrading() {
      return this.exams.filter(exam => exam.pendingSubmissions === 0).length;
    }
  },
  async mounted() {
    await this.fetchData();
  },
  methods: {
    async fetchData() {
      try {
        this.loading = true;
        this.error = null;

        const response = await axios.get('/exams/manual-grading-overview');
        this.exams = response.data.exams || [];

      } catch (error) {
        console.error('Error fetching manual grading data:', error);
        this.error = 'خطا در دریافت اطلاعات آزمون‌ها';
      } finally {
        this.loading = false;
      }
    },

    async refreshData() {
      await this.fetchData();
    },

    goToGrading(exam) {
      this.$router.push({
        name: 'ExamManualGrading',
        params: {examId: exam.id}
      });
    },

    viewExamResults(exam) {
      this.$router.push({
        name: 'ExamAnswers',
        params: {examId: exam.id}
      });
    },

    getStatusClass(exam) {
      if (exam.pendingSubmissions === 0) {
        return 'bg-success';
      } else if (exam.pendingSubmissions > 0) {
        return 'bg-warning text-dark';
      } else {
        return 'bg-secondary';
      }
    },

    getStatusText(exam) {
      if (exam.pendingSubmissions === 0) {
        return 'تکمیل شده';
      } else if (exam.pendingSubmissions > 0) {
        return 'در انتظار نمره‌گذاری';
      } else {
        return 'بدون ارسالی';
      }
    },

    formatDateTime(dateString) {
      if (!dateString) return '-';
      const date = new Date(dateString);
      return date.toLocaleDateString('fa-IR') + ' ' + date.toLocaleTimeString('fa-IR', {
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  }
}
</script>

<style scoped>
.exam-manual-grading-list {
  background: #f8f9fa;
  min-height: 100vh;
  padding: 2rem 0;
}

.page-header {
  background: white;
  padding: 2rem;
  border-radius: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.page-title {
  color: #2c3e50;
  font-weight: 600;
  margin: 0;
}

.page-subtitle {
  color: #6c757d;
  margin: 0;
  font-size: 1.1rem;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.stat-card {
  background: white;
  border-radius: 15px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
  margin-left: 1rem;
}

.stat-content h3 {
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
}

.stat-content p {
  margin: 0;
  color: #6c757d;
  font-size: 0.9rem;
}

.modern-card {
  background: white;
  border-radius: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.modern-card-header {
  background: #f8f9fa;
  padding: 1.5rem;
  border-bottom: 1px solid #dee2e6;
}

.modern-card-body {
  padding: 1.5rem;
}

.modern-btn {
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-weight: 600;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  transition: all 0.3s ease;
}

.modern-btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
}

.modern-btn-primary {
  background: #007bff;
  color: white;
}

.modern-btn-primary:hover {
  background: #0056b3;
  color: white;
}

.modern-btn-primary:disabled {
  background: #6c757d;
  color: white;
  cursor: not-allowed;
}

.modern-btn-outline {
  background: transparent;
  color: #6c757d;
  border: 1px solid #dee2e6;
}

.modern-btn-outline:hover {
  background: #f8f9fa;
  color: #495057;
}

.exam-info {
  display: flex;
  flex-direction: column;
}

.exam-title {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.25rem;
}

.exam-meta {
  font-size: 0.85rem;
  color: #6c757d;
}

.lesson-info {
  display: flex;
  flex-direction: column;
}

.lesson-name {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.25rem;
}

.course-name {
  font-size: 0.85rem;
  color: #6c757d;
}

.manual-questions-count {
  font-weight: 600;
  font-size: 1.1rem;
  color: #007bff;
}

.pending-count {
  text-align: center;
}

.last-update {
  font-size: 0.9rem;
  color: #6c757d;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.no-data-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

.no-data-content {
  text-align: center;
  color: #6c757d;
}

.no-data-content i {
  font-size: 4rem;
  margin-bottom: 1rem;
  color: #dee2e6;
}

.no-data-content h3 {
  margin-bottom: 0.5rem;
  color: #495057;
}

@media (max-width: 768px) {
  .exam-manual-grading-list {
    padding: 1rem 0;
  }

  .page-header {
    padding: 1rem;
  }

  .stat-card {
    margin-bottom: 1rem;
  }

  .action-buttons {
    flex-direction: column;
  }

  .modern-btn-sm {
    width: 100%;
    margin-bottom: 0.5rem;
  }

  .header-actions {
    margin-top: 1rem;
  }
}
</style>