<template>
  <div class="teacher-exams-container">
    <div class="container-fluid p-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>آزمون‌های من</h2>
<!--        <router-link :to="{ name: 'ExamCreator' }" class="btn btn-primary">-->
<!--          <i class="fas fa-plus me-1"></i> ایجاد آزمون جدید-->
<!--        </router-link>-->
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h2>آزمون‌های من</h2>
          <div>
            <router-link :to="{ name: 'QuestionBank' }" class="btn btn-outline-primary me-2">
              <i class="fas fa-database me-1"></i> بانک سوالات
            </router-link>
            <router-link :to="{ name: 'ExamCreator' }" class="btn btn-primary">
              <i class="fas fa-plus me-1"></i> ایجاد آزمون جدید
            </router-link>
          </div>
        </div>
      </div>

      <!-- فیلترها و جستجو -->
      <div class="filters-section card mb-4">
        <div class="card-body">
          <div class="row">
            <div class="col-md-4 mb-3">
              <input
                  type="text"
                  class="form-control"
                  v-model="searchQuery"
                  placeholder="جستجو در آزمون‌ها..."
                  @input="filterExams"
              >
            </div>
            <div class="col-md-3 mb-3">
              <select class="form-select" v-model="statusFilter" @change="filterExams">
                <option value="">همه وضعیت‌ها</option>
                <option value="active">فعال</option>
                <option value="draft">پیش‌نویس</option>
                <option value="completed">پایان یافته</option>
              </select>
            </div>
            <div class="col-md-3 mb-3">
              <select class="form-select" v-model="sortBy" @change="sortExams">
                <option value="date">مرتب‌سازی: تاریخ</option>
                <option value="title">مرتب‌سازی: عنوان</option>
                <option value="submissions">مرتب‌سازی: تعداد آزمون دهندگان</option>
              </select>
            </div>
            <div class="col-md-2 mb-3">
              <button class="btn btn-outline-secondary w-100" @click="resetFilters">
                <i class="fas fa-sync-alt me-1"></i> پاک کردن
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- بخش اصلی نمایش آزمون‌ها -->
      <loading-spinner :loading="loading">
        <!-- جدول آزمون‌ها -->
        <div v-if="filteredExams.length > 0" class="card">
          <div class="table-responsive">
            <table class="table table-hover">
              <thead class="table-light">
              <tr>
                <th>عنوان آزمون</th>
                <th>درس مربوطه</th>
                <th>تاریخ ایجاد</th>
                <th>وضعیت</th>
                <th>تعداد آزمون دهندگان</th>
                <th>میانگین نمرات</th>
                <th>عملیات</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="exam in filteredExams" :key="exam.id">
                <td>{{ exam.title }}</td>
                <td>{{ getLessonTitle(exam) }}</td>
                <td>{{ formatDate(exam.createdAt) }}</td>
                <td>
                    <span class="badge" :class="getStatusBadgeClass(exam.status)">
                      {{ getStatusText(exam.status) }}
                    </span>
                </td>
                <td>{{ exam.submissions?.length || 0 }}</td>
                <td>{{ calculateAverageScore(exam) }}</td>
                <td>
                  <div class="btn-group">
                    <router-link :to="`/exams/${exam.id}/edit`" class="btn btn-sm btn-outline-primary">
                      <i class="fas fa-edit"></i>
                    </router-link>
                    <router-link :to="`/exams/${exam.id}/results`" class="btn btn-sm btn-outline-info">
                      <i class="fas fa-chart-bar"></i>
                    </router-link>
                    <button class="btn btn-sm btn-outline-danger" @click="confirmDeleteExam(exam)">
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- نمایش حالت خالی -->
        <empty-state
            v-else
            title="هیچ آزمونی یافت نشد"
            description="شما هنوز هیچ آزمونی ایجاد نکرده‌اید یا نتیجه‌ای با جستجوی شما مطابقت ندارد"
            icon="clipboard-check"
        >
          <router-link :to="{ name: 'ExamCreator' }" class="btn btn-primary">
            ایجاد آزمون جدید
          </router-link>
        </empty-state>
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
import { mapGetters } from 'vuex';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import ConfirmationDialog from '@/components/common/ConfirmationDialog.vue';
import { useFormatters } from '@/composables/useFormatters.js';
import axios from 'axios';

export default {
  name: 'TeacherExams',
  components: {
    LoadingSpinner,
    EmptyState,
    ConfirmationDialog
  },
  setup() {
    const { formatDate } = useFormatters();

    return {
      formatDate
    };
  },
  data() {
    return {
      loading: true,
      exams: [],
      searchQuery: '',
      statusFilter: '',
      sortBy: 'date',
      selectedExam: null,
      isDeleting: false
    };
  },
  computed: {
    ...mapGetters({
      currentUser: 'currentUser'
    }),

    filteredExams() {
      let filtered = [...this.exams];

      // فیلتر براساس جستجو
      if (this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase().trim();
        filtered = filtered.filter(exam => {
          return exam.title.toLowerCase().includes(query) ||
              (exam.description && exam.description.toLowerCase().includes(query));
        });
      }

      // فیلتر براساس وضعیت
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

        // در یک پروژه واقعی، داده‌ها از API دریافت می‌شوند
        // const response = await axios.get('/exams/teaching');
        // this.exams = response.data;

        // برای نمونه، تعدادی داده تستی ایجاد می‌کنیم
        this.exams = this.generateMockExams();

        this.sortExams();
        this.loading = false;
      } catch (error) {
        console.error('Error fetching exams:', error);
        this.$toast.error('خطا در دریافت لیست آزمون‌ها');
        this.loading = false;
      }
    },

    generateMockExams() {
      // ایجاد داده‌های نمونه برای نمایش
      return Array.from({ length: 10 }, (_, i) => {
        const id = i + 1;
        const statuses = ['active', 'draft', 'completed'];
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
        case 'active':
          return 'bg-success';
        case 'draft':
          return 'bg-secondary';
        case 'completed':
          return 'bg-primary';
        default:
          return 'bg-secondary';
      }
    },

    getStatusText(status) {
      switch (status) {
        case 'active':
          return 'فعال';
        case 'draft':
          return 'پیش‌نویس';
        case 'completed':
          return 'پایان یافته';
        default:
          return 'نامشخص';
      }
    },

    calculateAverageScore(exam) {
      if (!exam.submissions || exam.submissions.length === 0) {
        return 'بدون آزمون دهنده';
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
        // در یک پروژه واقعی، درخواست حذف به API ارسال می‌شود
        // await axios.delete(`/exams/${this.selectedExam.id}`);

        // حذف از لیست محلی
        this.exams = this.exams.filter(e => e.id !== this.selectedExam.id);

        this.$toast.success('آزمون با موفقیت حذف شد.');
        this.selectedExam = null;
      } catch (error) {
        console.error('Error deleting exam:', error);
        this.$toast.error('خطا در حذف آزمون');
      } finally {
        this.isDeleting = false;
      }
    }
  }
};
</script>

<style scoped>
.teacher-exams-container {
  min-height: calc(100vh - 56px);
}

.filters-section {
  background-color: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.btn-group {
  display: flex;
  gap: 5px;
}
</style>