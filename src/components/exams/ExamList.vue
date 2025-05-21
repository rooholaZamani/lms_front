<script>
import { mapGetters } from 'vuex';
import axios from 'axios';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import { useUser } from '@/composables/useUser.js';
import { useFormatters } from '@/composables/useFormatters.js';

export default {
  name: 'ExamList',
  components: {
    LoadingSpinner,
    EmptyState
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
        if (this.statusFilter === 'active') {
          result = result.filter(exam => exam.status === 'active');
        } else if (this.statusFilter === 'completed') {
          result = result.filter(exam => exam.status === 'completed');
        } else if (this.statusFilter === 'upcoming') {
          result = result.filter(exam => exam.status === 'upcoming');
        }
      }

      // Apply sorting
      if (this.sortBy === 'title') {
        result.sort((a, b) => a.title.localeCompare(b.title));
      } else if (this.sortBy === 'score') {
        result.sort((a, b) => (b.averageScore || 0) - (a.averageScore || 0));
      } else {
        // Default: date sorting
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
          // For teachers, fetch exams they created
          response = await axios.get('/exams/teaching');
        } else {
          // For students, fetch exams available to them
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
          return 'bg-success';
        case 'upcoming':
          return 'bg-primary';
        case 'completed':
          return 'bg-secondary';
        default:
          return 'bg-info';
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

<template>
  <div class="exam-list-container">
    <div class="container-fluid p-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>آزمون‌ها</h2>
        <div v-if="isTeacher" class="d-flex">
          <router-link :to="{ name: 'ExamCreator' }" class="btn btn-primary">
            <i class="fas fa-plus me-1"></i> ایجاد آزمون جدید
          </router-link>
        </div>
      </div>

      <!-- Filter and Search Section -->
      <div class="card mb-4">
        <div class="card-body">
          <div class="row">
            <div class="col-md-4 mb-3">
              <div class="input-group">
                <input
                    type="text"
                    class="form-control"
                    v-model="searchQuery"
                    placeholder="جستجو در آزمون‌ها..."
                />
                <button class="btn btn-outline-secondary" type="button">
                  <i class="fas fa-search"></i>
                </button>
              </div>
            </div>
            <div class="col-md-3 mb-3">
              <select class="form-select" v-model="statusFilter">
                <option value="all">همه وضعیت‌ها</option>
                <option value="active">فعال</option>
                <option value="upcoming">در آینده</option>
                <option value="completed">پایان یافته</option>
              </select>
            </div>
            <div class="col-md-3 mb-3">
              <select class="form-select" v-model="sortBy">
                <option value="date">تاریخ (جدیدترین)</option>
                <option value="title">عنوان (الفبا)</option>
                <option value="score">نمره (بیشترین)</option>
              </select>
            </div>
            <div class="col-md-2 mb-3">
              <button class="btn btn-outline-secondary w-100" @click="resetFilters">
                <i class="fas fa-sync-alt me-1"></i> بازنشانی
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Exams List -->
      <loading-spinner :loading="loading">
        <div v-if="error" class="alert alert-danger">
          {{ error }}
        </div>

        <div v-else-if="filteredExams.length > 0" class="card">
          <div class="table-responsive">
            <table class="table table-hover">
              <thead class="table-light">
              <tr>
                <th>عنوان آزمون</th>
                <th>درس مربوطه</th>
                <th>تاریخ</th>
                <th>زمان آزمون</th>
                <th>وضعیت</th>
                <th v-if="isTeacher">متوسط نمره</th>
                <th>عملیات</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="exam in filteredExams" :key="exam.id">
                <td>{{ exam.title }}</td>
                <td>{{ getLessonTitle(exam) }}</td>
                <td>{{ formatDate(exam.createdAt) }}</td>
                <td>{{ exam.duration }} دقیقه</td>
                <td>
                    <span class="badge" :class="getStatusBadgeClass(exam.status)">
                      {{ getStatusText(exam.status) }}
                    </span>
                </td>
                <td v-if="isTeacher">{{ calculateAverageScore(exam) }}</td>
                <td>
                  <div class="d-flex gap-1">
                    <!-- Teacher actions -->
                    <template v-if="isTeacher">
                      <button class="btn btn-sm btn-outline-primary" @click="editExam(exam.id)">
                        <i class="fas fa-edit"></i>
                      </button>
                      <button class="btn btn-sm btn-outline-info" @click="viewResults(exam.id)">
                        <i class="fas fa-chart-bar"></i>
                      </button>
                    </template>

                    <!-- Student actions -->
                    <template v-else>
                      <button v-if="!hasCompletedExam(exam)" class="btn btn-sm btn-primary" @click="viewExam(exam.id)">
                        <i class="fas fa-pen"></i> شرکت در آزمون
                      </button>
                      <button v-else class="btn btn-sm btn-info" @click="viewResults(exam.id)">
                        <i class="fas fa-eye"></i> مشاهده نتیجه
                      </button>
                    </template>
                  </div>
                </td>
              </tr>
              </tbody>
            </table>
          </div>
        </div>

        <empty-state
            v-else
            title="هیچ آزمونی یافت نشد"
            description="در حال حاضر هیچ آزمونی برای نمایش وجود ندارد."
            icon="clipboard-check"
        >
          <div v-if="isTeacher">
            <router-link :to="{ name: 'ExamCreator' }" class="btn btn-primary">
              ایجاد آزمون جدید
            </router-link>
          </div>
          <div v-else>
            <router-link :to="{ name: 'Courses' }" class="btn btn-primary">
              مشاهده دوره‌ها
            </router-link>
          </div>
        </empty-state>
      </loading-spinner>
    </div>
  </div>
</template>

<style scoped>
.exam-list-container {
  min-height: calc(100vh - 56px);
}

.badge {
  padding: 0.5em 0.8em;
}

.table td {
  vertical-align: middle;
}
</style>