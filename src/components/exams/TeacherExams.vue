<template>
  <div class="modern-page-bg primary-gradient">
    <div class="modern-container large animate-slide-up">
      <div class="modern-header">
        <div class="modern-logo primary">
          <i class="fas fa-clipboard-check"></i>
        </div>
        <h1 class="modern-title">آزمون‌های من</h1>
        <p class="modern-subtitle">مدیریت و نظارت بر آزمون‌های ایجاد شده</p>
      </div>

      <div v-if="error" class="modern-alert modern-alert-danger">
        <i class="fas fa-exclamation-circle me-2"></i>
        {{ error }}
      </div>

      <!-- فیلترها و عملیات -->
      <div class="form-section">
        <h6 class="section-title">
          <i class="fas fa-filter me-2"></i>
          فیلتر و جستجو
        </h6>

        <div class="row">
          <div class="col-md-4 modern-form-group">
            <label class="modern-form-label">جستجو در آزمون‌ها</label>
            <input
                type="text"
                class="modern-form-control"
                v-model="searchQuery"
                placeholder="عنوان آزمون..."
                @input="filterExams"
            >
          </div>
          <div class="col-md-3 modern-form-group">
            <label class="modern-form-label">وضعیت</label>
            <select class="modern-form-control" v-model="statusFilter" @change="filterExams">
              <option value="">همه وضعیت‌ها</option>
              <option value="DRAFT">پیش‌نویس</option>
              <option value="FINALIZED">نهایی شده</option>
            </select>
          </div>
          <div class="col-md-3 modern-form-group">
            <label class="modern-form-label">مرتب‌سازی</label>
            <select class="modern-form-control" v-model="sortBy" @change="sortExams">
              <option value="date">تاریخ ایجاد</option>
              <option value="title">عنوان</option>
              <option value="submissions">تعداد شرکت‌کنندگان</option>
            </select>
          </div>
          <div class="col-md-2 d-flex align-items-end modern-form-group">
            <button class="modern-btn modern-btn-secondary w-100" @click="resetFilters">
              <i class="fas fa-redo me-1"></i> بازنشانی
            </button>
          </div>
        </div>
      </div>

      <!-- دکمه‌های عملیات -->
      <div class="d-flex justify-content-end gap-2 mb-4">
        <router-link :to="{ name: 'QuestionBank' }" class="modern-btn modern-btn-outline">
          <i class="fas fa-database me-1"></i> بانک سوالات
        </router-link>
        <router-link :to="{ name: 'ExamCreator' }" class="modern-btn modern-btn-success">
          <i class="fas fa-plus me-1"></i> ایجاد آزمون جدید
        </router-link>
      </div>

      <loading-spinner :loading="loading">
        <!-- لیست آزمون‌ها -->
        <div v-if="filteredExams.length > 0" class="exams-grid">
          <div v-for="exam in filteredExams" :key="exam.id" class="exam-card modern-card animate-fade-in">
            <div class="exam-header">
              <h5 class="exam-title">{{ exam.title }}</h5>
              <span class="modern-badge" :class="getStatusBadgeClass(exam.status)">
                {{ getStatusText(exam.status) }}
              </span>
            </div>

            <div class="exam-details">
              <div class="detail-item">
                <i class="fas fa-book text-primary me-2"></i>
                <span>{{ getLessonTitle(exam) }}</span>
              </div>
              <div class="detail-item">
                <i class="fas fa-calendar text-info me-2"></i>
                <span>{{ formatDate(exam.createdAt) }}</span>
              </div>
              <div class="detail-item">
                <i class="fas fa-users text-success me-2"></i>
                <span>{{ exam.submissions?.length || 0 }} شرکت‌کننده</span>
              </div>
              <div class="detail-item">
                <i class="fas fa-chart-line text-warning me-2"></i>
                <span>میانگین: {{ calculateAverageScore(exam) }}</span>
              </div>
            </div>

            <div class="exam-actions">
              <router-link :to="`/exams/${exam.id}/edit`" class="modern-btn modern-btn-primary">
                <i class="fas fa-edit me-1"></i> ویرایش
              </router-link>
              <router-link :to="`/exams/${exam.id}/results`" class="modern-btn modern-btn-info">
                <i class="fas fa-chart-bar me-1"></i> نتایج
              </router-link>
              <button class="modern-btn modern-btn-danger" @click="confirmDeleteExam(exam)">
                <i class="fas fa-trash me-1"></i> حذف
              </button>
            </div>
          </div>
        </div>

        <!-- حالت خالی -->
        <div v-else class="empty-state">
          <div class="modern-logo large secondary mb-4">
            <i class="fas fa-clipboard-check"></i>
          </div>
          <h4 class="text-muted mb-3">هیچ آزمونی یافت نشد</h4>
          <p class="text-muted mb-4">
            شما هنوز هیچ آزمونی ایجاد نکرده‌اید یا نتیجه‌ای با جستجوی شما مطابقت ندارد
          </p>
          <router-link :to="{ name: 'ExamCreator' }" class="modern-btn modern-btn-primary">
            <i class="fas fa-plus me-1"></i> ایجاد آزمون جدید
          </router-link>
        </div>
      </loading-spinner>
    </div>

    <!-- مودال تأیید حذف -->
    <confirmation-dialog
        ref="confirmDialog"
        title="حذف آزمون"
        message="آیا از حذف این آزمون اطمینان دارید؟"
        details="این عمل قابل بازگشت نیست و تمام نتایج آزمون نیز حذف خواهند شد."
        confirm-text="حذف آزمون"
        confirm-button-type="danger"
        icon="trash-alt"
        @confirm="deleteExam"
    />
  </div>
</template>

<script>
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import ConfirmationDialog from '@/components/common/ConfirmationDialog.vue';
import { useFormatters } from '@/composables/useFormatters.js';
import axios from 'axios';

export default {
  name: 'TeacherExams',
  components: {
    LoadingSpinner,
    ConfirmationDialog
  },
  setup() {
    const { formatDate } = useFormatters();
    return { formatDate };
  },
  data() {
    return {
      loading: true,
      error: null,
      exams: [],
      searchQuery: '',
      statusFilter: '',
      sortBy: 'date',
      selectedExam: null,
      isDeleting: false
    };
  },
  computed: {
    filteredExams() {
      let filtered = [...this.exams];

      if (this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase().trim();
        filtered = filtered.filter(exam => {
          return exam.title.toLowerCase().includes(query) ||
              (exam.description && exam.description.toLowerCase().includes(query));
        });
      }

      if (this.statusFilter) {
        filtered = filtered.filter(exam => exam.status === this.statusFilter);
      }

      return filtered;
    }
  },
  async created() {
    await this.fetchExams();
  },
  methods: {
    async fetchExams() {
      try {
        this.loading = true;
        this.exams = this.generateMockExams();
        this.sortExams();
        this.loading = false;
      } catch (error) {
        console.error('Error fetching exams:', error);
        this.error = 'خطا در دریافت لیست آزمون‌ها';
        this.loading = false;
      }
    },

    generateMockExams() {
      return Array.from({ length: 8 }, (_, i) => {
        const id = i + 1;
        const statuses = ['DRAFT', 'FINALIZED'];
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

        return {
          id,
          title: `آزمون ${id}: ${['مبانی برنامه‌نویسی', 'ریاضیات مهندسی', 'هوش مصنوعی', 'پایگاه داده'][i % 4]}`,
          description: `توضیحات آزمون شماره ${id}`,
          lessonId: Math.floor(Math.random() * 5) + 1,
          lesson: {
            id: Math.floor(Math.random() * 5) + 1,
            title: `درس ${Math.floor(Math.random() * 5) + 1}`
          },
          createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
          status: randomStatus,
          duration: 60,
          passingScore: 70,
          submissions: Array.from({ length: Math.floor(Math.random() * 20) }, (_, j) => ({
            id: j + 1,
            score: Math.floor(Math.random() * 100),
            studentId: j + 1
          }))
        };
      });
    },

    getLessonTitle(exam) {
      return exam.lesson?.title || 'نامشخص';
    },

    getStatusBadgeClass(status) {
      switch (status) {
        case 'FINALIZED':
          return 'modern-badge-success';
        case 'DRAFT':
          return 'modern-badge-secondary';
        default:
          return 'modern-badge-secondary';
      }
    },

    getStatusText(status) {
      switch (status) {
        case 'FINALIZED':
          return 'نهایی شده';
        case 'DRAFT':
          return 'پیش‌نویس';
        default:
          return 'نامشخص';
      }
    },

    calculateAverageScore(exam) {
      if (!exam.submissions || exam.submissions.length === 0) {
        return 'بدون شرکت‌کننده';
      }
      const totalScore = exam.submissions.reduce((sum, sub) => sum + sub.score, 0);
      return (totalScore / exam.submissions.length).toFixed(1);
    },

    filterExams() {
      // فیلترینگ در computed property انجام می‌شود
    },

    sortExams() {
      this.exams.sort((a, b) => {
        switch (this.sortBy) {
          case 'title':
            return a.title.localeCompare(b.title);
          case 'submissions':
            return (b.submissions?.length || 0) - (a.submissions?.length || 0);
          case 'date':
          default:
            return new Date(b.createdAt) - new Date(a.createdAt);
        }
      });
    },

    resetFilters() {
      this.searchQuery = '';
      this.statusFilter = '';
      this.sortBy = 'date';
      this.sortExams();
    },

    confirmDeleteExam(exam) {
      this.selectedExam = exam;
      this.$refs.confirmDialog.show();
    },

    async deleteExam() {
      if (!this.selectedExam || this.isDeleting) return;

      this.isDeleting = true;
      try {
        this.exams = this.exams.filter(e => e.id !== this.selectedExam.id);
        this.$toast?.success('آزمون با موفقیت حذف شد.');
        this.selectedExam = null;
      } catch (error) {
        console.error('Error deleting exam:', error);
        this.$toast?.error('خطا در حذف آزمون');
      } finally {
        this.isDeleting = false;
      }
    }
  }
};
</script>

<style scoped>
.exams-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.exam-card {
  padding: 1.5rem;
  transition: all 0.3s ease;
  border: 1px solid rgba(102, 126, 234, 0.1);
}

.exam-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.15);
}

.exam-header {
  display: flex;
  justify-content: between;
  align-items: flex-start;
  margin-bottom: 1rem;
  gap: 1rem;
}

.exam-title {
  font-weight: 600;
  color: #333;
  margin: 0;
  flex: 1;
  line-height: 1.4;
}

.exam-details {
  margin-bottom: 1.5rem;
}

.detail-item {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: #6c757d;
}

.exam-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.exam-actions .modern-btn {
  flex: 1;
  min-width: 0;
  font-size: 0.8rem;
  padding: 0.5rem 0.75rem;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
}

@media (max-width: 768px) {
  .exams-grid {
    grid-template-columns: 1fr;
  }

  .exam-actions {
    flex-direction: column;
  }

  .exam-actions .modern-btn {
    flex: none;
  }
}
</style>