<!-- کامپوننت والد ExamResults.vue -->
<template>
  <div class="modern-page-bg primary-gradient">
    <div class="modern-container large animate-slide-up">
      <div class="modern-header">
        <div class="modern-logo primary">
          <i class="fas fa-chart-bar"></i>
        </div>
        <h1 class="modern-title">نتایج آزمون</h1>
        <p class="modern-subtitle">مشاهده نتایج و عملکرد دانش‌آموزان</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">در حال بارگذاری...</span>
        </div>
        <p class="mt-3">در حال دریافت نتایج آزمون...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="alert alert-danger">
        <i class="fas fa-exclamation-triangle me-2"></i>
        {{ error }}
      </div>

      <!-- Success State -->
      <div v-else>
        <!-- Exam Info -->
        <div v-if="exam" class="modern-card mb-4 animate-slide-up">
          <div class="modern-card-header bg-primary text-white">
            <h5 class="mb-0">
              <i class="fas fa-clipboard-check me-2"></i>
              اطلاعات آزمون
            </h5>
          </div>
          <div class="modern-card-body">
            <div class="row">
              <div class="col-md-6">
                <h6>{{ exam.title }}</h6>
                <p class="text-muted">{{ exam.description }}</p>
              </div>
              <div class="col-md-6">
                <div class="exam-stats">
                  <div class="stat-item">
                    <span class="stat-label">تعداد سوالات:</span>
                    <span class="stat-value">{{ exam.questionCount || 0 }}</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">حد نصاب:</span>
                    <span class="stat-value">{{ exam.passingScore || 0 }}</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">شرکت‌کنندگان:</span>
                    <span class="stat-value">{{ submissions.length }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Results Table -->
        <exam-results-table :submissions="submissions" />
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import ExamResultsTable from '@/components/exams/ExamResultsTable.vue';

export default {
  name: 'ExamResults',
  components: {
    ExamResultsTable
  },
  props: {
    id: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      loading: true,
      error: null,
      exam: null,
      submissions: [] // مهم: مقداردهی اولیه آرایه خالی
    };
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
        this.loading = true;
        this.error = null;

        // API call صحیح برای دریافت submissions آزمون خاص
        const response = await axios.get(`/exams/${this.id}/submissions`);

        // بررسی response
        if (response.data && Array.isArray(response.data)) {
          this.submissions = response.data;
        } else {
          // اگر response آرایه نباشد، آرایه خالی قرار دهیم
          this.submissions = [];
        }

        console.log('Submissions fetched:', this.submissions.length);

      } catch (error) {
        console.error('Error fetching submissions:', error);

        // تشخیص نوع خطا
        if (error.response) {
          // خطای HTTP
          if (error.response.status === 404) {
            this.error = 'آزمون مورد نظر یافت نشد';
          } else if (error.response.status === 403) {
            this.error = 'شما اجازه مشاهده نتایج این آزمون را ندارید';
          } else {
            this.error = 'خطا در دریافت نتایج آزمون';
          }
        } else {
          // خطای شبکه
          this.error = 'مشکل در اتصال به سرور';
        }

        // در صورت خطا، آرایه خالی قرار دهیم
        this.submissions = [];

      } finally {
        this.loading = false;
      }
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
</style>