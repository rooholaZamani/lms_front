<template>
  <div class="modern-page-bg primary-gradient">
    <div class="modern-container large animate-slide-up">
      <div class="modern-header text-center">
        <div class="modern-logo large primary mb-4">
          <i class="fas fa-clipboard-check"></i>
        </div>
        <h1 class="modern-title">آزمون‌ها</h1>
        <p class="modern-subtitle">مدیریت و شرکت در آزمون‌های آموزشی</p>
      </div>

      <div v-if="error" class="modern-alert modern-alert-danger">
        <i class="fas fa-exclamation-circle me-2"></i>
        {{ error }}
      </div>

      <!-- Teacher Actions -->
      <div v-if="isTeacher" class="text-center mb-4">
        <router-link :to="{ name: 'ExamCreator' }" class="modern-btn modern-btn-success">
          <i class="fas fa-plus me-2"></i>
          ایجاد آزمون جدید
        </router-link>
      </div>

      <loading-spinner :loading="loading">
        <!-- Filter Section -->
        <div class="modern-card mb-4 animate-fade-in">
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
              >
            </div>
<!--            <div class="col-md-3 modern-form-group">-->
<!--              <label class="modern-form-label">وضعیت</label>-->
<!--              <select class="modern-form-control" v-model="statusFilter">-->
<!--                <option value="all">همه وضعیت‌ها</option>-->
<!--                <option value="active">فعال</option>-->
<!--                <option value="upcoming">در آینده</option>-->
<!--                <option value="completed">پایان یافته</option>-->
<!--              </select>-->
<!--            </div>-->
            <div class="col-md-3 modern-form-group">
              <label class="modern-form-label">مرتب‌سازی</label>
              <select class="modern-form-control" v-model="sortBy">
                <option value="date">تاریخ (جدیدترین)</option>
                <option value="title">عنوان (الفبا)</option>
                <option value="score">نمره (بیشترین)</option>
              </select>
            </div>
            <div class="col-md-2 modern-form-group">
              <label class="modern-form-label">&nbsp;</label>
              <button class="modern-btn modern-btn-secondary w-100" @click="resetFilters">
                <i class="fas fa-refresh me-1"></i>
                بازنشانی
              </button>
            </div>
          </div>
        </div>

        <!-- Exams List -->
        <div v-if="filteredExams.length > 0" class="modern-card animate-slide-up" style="animation-delay: 0.1s;">
          <h6 class="section-title">
            <i class="fas fa-list me-2"></i>
            لیست آزمون‌ها
          </h6>

          <div class="exams-grid">
            <div
                v-for="exam in filteredExams"
                :key="exam.id"
                class="exam-card modern-card animate-fade-in"
            >
              <div class="exam-header">
                <div class="exam-title">{{ exam.title }}</div>
                <span class="modern-badge" :class="getStatusBadgeClass(exam.status)">
                  {{ getStatusText(exam.status) }}
                </span>
              </div>

              <div class="exam-body">
                <div class="exam-meta">
                  <div class="meta-item">
                    <i class="fas fa-book text-primary me-2"></i>
                    <span>{{ getLessonTitle(exam) }}</span>
                  </div>
                  <div class="meta-item">
                    <i class="fas fa-calendar text-info me-2"></i>
                    <span>{{ formatDate(exam.createdAt) }}</span>
                  </div>
                  <div class="meta-item">
                    <i class="fas fa-clock text-warning me-2"></i>
                    <span>{{ exam.duration }} دقیقه</span>
                  </div>
                  <div v-if="isTeacher" class="meta-item">
                    <i class="fas fa-chart-bar text-success me-2"></i>
                    <span>میانگین: {{ calculateAverageScore(exam) }}</span>
                  </div>
                </div>
              </div>

              <div class="exam-footer">
                <!-- Teacher actions -->
                <div v-if="isTeacher" class="action-buttons">
                  <button class="modern-btn modern-btn-primary" @click="editExam(exam.id)">
                    <i class="fas fa-edit me-1"></i>
                    ویرایش
                  </button>
                  <button class="modern-btn modern-btn-info" @click="viewResults(exam.id)">
                    <i class="fas fa-chart-bar me-1"></i>
                    نتایج
                  </button>
                </div>

                <!-- Student actions -->
                <div v-else class="action-buttons">
                  <button
                      v-if="!hasCompletedExam(exam)"
                      class="modern-btn modern-btn-success"
                      @click="viewExam(exam.id)"
                  >
                    <i class="fas fa-pen me-1"></i>
                    شرکت در آزمون
                  </button>
                  <button
                      v-else
                      class="modern-btn modern-btn-secondary"
                      @click="viewResults(exam.id)"
                  >
                    <i class="fas fa-eye me-1"></i>
                    مشاهده نتیجه
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="modern-card text-center animate-slide-up" style="animation-delay: 0.2s;">
          <div class="empty-state">
            <div class="modern-logo large secondary mb-4">
              <i class="fas fa-clipboard-check"></i>
            </div>
            <h4 class="modern-title">هیچ آزمونی یافت نشد</h4>
            <p class="modern-subtitle">
              در حال حاضر هیچ آزمونی برای نمایش وجود ندارد یا هیچ موردی با معیارهای جستجوی شما مطابقت ندارد.
            </p>

            <div class="mt-4">
              <router-link v-if="isTeacher" :to="{ name: 'ExamCreator' }" class="modern-btn modern-btn-primary me-3">
                <i class="fas fa-plus me-1"></i>
                ایجاد آزمون جدید
              </router-link>
              <router-link v-else :to="{ name: 'Courses' }" class="modern-btn modern-btn-primary me-3">
                <i class="fas fa-book me-1"></i>
                مشاهده دوره‌ها
              </router-link>
              <button class="modern-btn modern-btn-outline" @click="resetFilters">
                <i class="fas fa-refresh me-1"></i>
                بازنشانی فیلتر
              </button>
            </div>
          </div>
        </div>
      </loading-spinner>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import axios from 'axios';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import { useUser } from '@/composables/useUser.js';
import { useFormatters } from '@/composables/useFormatters.js';

export default {
  name: 'ExamList',
  components: {
    LoadingSpinner
  },
  setup() {
    const { isTeacher, isStudent } = useUser();
    const { formatDate } = useFormatters();

    return {
      isTeacher,
      isStudent,
      formatDate
    };
  },
  data() {
    return {
      loading: true,
      exams: [],
      error: null,
      searchQuery: '',
      statusFilter: 'all',
      sortBy: 'date'
    };
  },
  computed: {
    ...mapGetters({
      currentUser: 'currentUser'
    }),
    filteredExams() {
      let result = [...this.exams];

      // Apply search filter
      if (this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase().trim();
        result = result.filter(exam =>
            exam.title.toLowerCase().includes(query) ||
            (exam.description && exam.description.toLowerCase().includes(query))
        );
      }

      // Apply status filter
      if (this.statusFilter !== 'all') {
        result = result.filter(exam => exam.status === this.statusFilter);
      }

      // Apply sorting
      if (this.sortBy === 'title') {
        result.sort((a, b) => a.title.localeCompare(b.title));
      } else if (this.sortBy === 'score') {
        result.sort((a, b) => (b.averageScore || 0) - (a.averageScore || 0));
      } else {
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }

      return result;
    }
  },
  async created() {
    try {
      await this.fetchExams();
    } catch (error) {
      console.error('Error fetching exams:', error);
      if (this.$toast) {
        this.$toast.error('خطا در دریافت لیست آزمون‌ها');
      }
    }
  },
  methods: {
    async fetchExams() {
      try {
        this.loading = true;
        let response;

        if (this.isTeacher) {
          response = await axios.get('/exams/teaching');
        } else {
          response = await axios.get('/exams/available');
        }

        this.exams = response.data;
      } catch (err) {
        console.error('Error fetching exams:', err);
        this.error = 'خطا در دریافت لیست آزمون‌ها';
      } finally {
        this.loading = false;
      }
    },
    viewExam(examId) {
      this.$router.push({ name: 'Exam', params: { id: examId } });
    },
    editExam(examId) {
      this.$router.push({ name: 'ExamEditor', params: { id: examId } });
    },
    viewResults(examId) {
      this.$router.push({ name: 'ExamResults', params: { id: examId } });
    },
    resetFilters() {
      this.searchQuery = '';
      this.statusFilter = 'all';
      this.sortBy = 'date';
    },
    getStatusBadgeClass(status) {
      switch (status) {
        case 'active':
          return 'modern-badge-success';
        case 'upcoming':
          return 'modern-badge-primary';
        case 'completed':
          return 'modern-badge-secondary';
        default:
          return 'modern-badge-info';
      }
    },
    getStatusText(status) {
      switch (status) {
        case 'active':
          return 'فعال';
        case 'upcoming':
          return 'در آینده';
        case 'completed':
          return 'پایان یافته';
        default:
          return 'نامشخص';
      }
    },
    getLessonTitle(exam) {
      return exam.lesson?.title || 'نامشخص';
    },
    calculateAverageScore(exam) {
      if (!exam.submissions || exam.submissions.length === 0) {
        return 'بدون آزمون دهنده';
      }

      const total = exam.submissions.reduce((sum, sub) => sum + sub.score, 0);
      return (total / exam.submissions.length).toFixed(1);
    },
    hasCompletedExam(exam) {
      if (!exam || !exam.submissions || !this.currentUser) return false;
      return exam.submissions.some(sub => sub.studentId === this.currentUser.id);
    }
  }
};
</script>

<style scoped>
.section-title {
  color: #333;
  font-weight: 600;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid rgba(102, 126, 234, 0.2);
  display: flex;
  align-items: center;
}

.exams-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
}

.exam-card {
  transition: all 0.3s ease;
  border: 1px solid rgba(102, 126, 234, 0.1);
  overflow: hidden;
}

.exam-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.15);
}

.exam-header {
  display: flex;
  justify-content: between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
}

.exam-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  flex: 1;
  line-height: 1.4;
}

.exam-body {
  margin-bottom: 1.5rem;
}

.exam-meta {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.meta-item {
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  color: #6c757d;
}

.meta-item i {
  width: 20px;
}

.exam-footer {
  border-top: 1px solid rgba(102, 126, 234, 0.1);
  padding-top: 1rem;
}

.action-buttons {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.action-buttons .modern-btn {
  flex: 1;
  min-width: 120px;
  font-size: 0.85rem;
  padding: 0.6rem 1rem;
}

.empty-state {
  padding: 3rem 2rem;
}

/* Responsive */
@media (max-width: 768px) {
  .exams-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .action-buttons {
    flex-direction: column;
  }

  .action-buttons .modern-btn {
    min-width: auto;
  }

  .exam-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .modern-container.large {
    padding: 1.5rem;
  }
}

@media (max-width: 576px) {
  .modern-container.large {
    margin: 0 0.5rem;
  }

  .empty-state {
    padding: 2rem 1rem;
  }
}
</style>