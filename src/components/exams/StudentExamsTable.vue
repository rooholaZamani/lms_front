<template>
  <div class="exams-table-container">
    <div v-if="exams.length === 0" class="text-center py-5">
      <div class="modern-logo large secondary mb-4">
        <i class="fas fa-clipboard-check"></i>
      </div>
      <h5 class="text-muted mb-3">هنوز در هیچ آزمونی شرکت نکرده‌اید</h5>
      <p class="text-muted">آزمون‌های موجود در صفحه دوره‌ها قابل مشاهده است.</p>
    </div>

    <div v-else>
      <!-- Filters -->
      <div class="exam-filters mb-4">
        <div class="row align-items-center">
          <div class="col-md-4 modern-form-group">
            <select class="modern-form-control" v-model="statusFilter" @change="applyFilters">
              <option value="">همه آزمون‌ها</option>
              <option value="passed">قبول شده</option>
              <option value="failed">مردود</option>
              <option value="pending">در انتظار نتیجه</option>
            </select>
          </div>
          <div class="col-md-4 modern-form-group">
            <select class="modern-form-control" v-model="courseFilter" @change="applyFilters">
              <option value="">همه دوره‌ها</option>
              <option v-for="course in uniqueCourses" :key="course.id" :value="course.id">
                {{ course.title }}
              </option>
            </select>
          </div>
          <div class="col-md-4 modern-form-group">
            <input type="text" class="modern-form-control" placeholder="جستجو در آزمون‌ها..."
                   v-model="searchQuery" @input="applyFilters">
          </div>
        </div>
      </div>

      <!-- Summary Stats -->
      <div class="exam-summary mb-4">
        <div class="row">
          <div class="col-md-3 col-6 mb-3">
            <div class="summary-card summary-total">
              <div class="summary-icon">
                <i class="fas fa-clipboard-list"></i>
              </div>
              <div class="summary-content">
                <div class="summary-value">{{ stats.total }}</div>
                <div class="summary-label">کل آزمون‌ها</div>
              </div>
            </div>
          </div>
          <div class="col-md-3 col-6 mb-3">
            <div class="summary-card summary-passed">
              <div class="summary-icon">
                <i class="fas fa-check-circle"></i>
              </div>
              <div class="summary-content">
                <div class="summary-value">{{ stats.passed }}</div>
                <div class="summary-label">قبول شده</div>
              </div>
            </div>
          </div>
          <div class="col-md-3 col-6 mb-3">
            <div class="summary-card summary-failed">
              <div class="summary-icon">
                <i class="fas fa-times-circle"></i>
              </div>
              <div class="summary-content">
                <div class="summary-value">{{ stats.failed }}</div>
                <div class="summary-label">مردود</div>
              </div>
            </div>
          </div>
          <div class="col-md-3 col-6 mb-3">
            <div class="summary-card summary-average">
              <div class="summary-icon">
                <i class="fas fa-chart-line"></i>
              </div>
              <div class="summary-content">
                <div class="summary-value">{{ stats.average }}</div>
                <div class="summary-label">میانگین نمره</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Exams Table -->
      <div class="modern-table-container">
        <table class="modern-table table">
          <thead>
          <tr>
            <th>
              <button class="sort-btn" @click="sortBy('examTitle')">
                <i class="fas fa-clipboard-check me-1"></i>
                عنوان آزمون
                <i class="fas fa-sort ms-1"></i>
              </button>
            </th>
            <th>
              <button class="sort-btn" @click="sortBy('courseTitle')">
                <i class="fas fa-book me-1"></i>
                دوره
                <i class="fas fa-sort ms-1"></i>
              </button>
            </th>
            <th>
              <button class="sort-btn" @click="sortBy('score')">
                <i class="fas fa-star me-1"></i>
                نمره
                <i class="fas fa-sort ms-1"></i>
              </button>
            </th>
            <th>
              <button class="sort-btn" @click="sortBy('submissionTime')">
                <i class="fas fa-calendar me-1"></i>
                تاریخ شرکت
                <i class="fas fa-sort ms-1"></i>
              </button>
            </th>
            <th>
              <i class="fas fa-clock me-1"></i>
              مدت زمان
            </th>
            <th>
              <i class="fas fa-signal me-1"></i>
              وضعیت
            </th>
            <th>
              <i class="fas fa-cogs me-1"></i>
              عملیات
            </th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="exam in paginatedExams" :key="exam.id" class="exam-row">
            <td>
              <div class="exam-info">
                <div class="exam-title">{{ getExamTitle(exam) }}</div>
                <div class="exam-meta">
                    <span class="exam-type">
                      <i class="fas fa-question-circle me-1"></i>
                      {{ exam.questionCount || 0 }} سوال
                    </span>
                  <span class="exam-time-limit" v-if="exam?.timeLimit">
                      <i class="fas fa-hourglass-half me-1"></i>
                      {{ exam.timeLimit }} دقیقه
                    </span>
                </div>
              </div>
            </td>
            <td>
              <div class="course-info">
                  <span class="modern-badge modern-badge-info">
                    {{ getCourseTitle(exam) }}
                  </span>
                <div class="lesson-title" v-if="getLessonTitle(exam)">
                  <i class="fas fa-play-circle me-1"></i>
                  {{ getLessonTitle(exam) }}
                </div>
              </div>
            </td>
            <td>
              <div class="score-container">
                <div class="score-main">
                    <span class="score-value" :class="getScoreClass(exam)">
                      {{ exam.score || 0 }}
                    </span>
                  <span class="score-total">/ {{ exam?.totalPossibleScore || 100 }}</span>
                </div>
                <div class="score-percentage" :class="getScoreClass(exam)">
                  {{ getScorePercentage(exam) }}%
                </div>
                <div class="score-comparison" v-if="exam.classAverage">
                  <small class="text-muted">
                    میانگین کلاس: {{ exam.classAverage }}
                  </small>
                </div>
              </div>
            </td>
            <td>
              <div class="date-info">
                <div class="submission-date">{{ formatDate(exam.submissionTime) }}</div>
                <div class="time-ago">{{ getTimeAgo(exam.submissionTime) }}</div>
              </div>
            </td>
            <td>
              <div class="duration-info">
                <div class="actual-duration">{{ formatDurationSecend(exam.actualDuration) }}</div>
                <div class="duration-comparison" v-if="exam?.timeLimit">
                  <div class="progress" style="height: 4px;">
                    <div class="progress-bar"
                         :class="getDurationClass(exam)"
                         :style="`width: ${getDurationPercentage(exam)}%`"></div>
                  </div>
                  <small class="text-muted">
                    از {{ exam.timeLimit }} دقیقه
                  </small>
                </div>
              </div>
            </td>
            <td>
              <div class="status-container">
                  <span class="modern-badge" :class="getStatusBadgeClass(exam)">
                    <i :class="getStatusIcon(exam)" class="me-1"></i>
                    {{ getStatusText(exam) }}
                  </span>
                <div class="status-details" v-if="exam.passed !== undefined">
                  <small :class="exam.passed ? 'text-success' : 'text-danger'">
                    {{ exam.passed ? 'قبول' : 'مردود' }}
                    <span v-if="exam.exam?.passingScore">
                        (حد نصاب: {{ exam.exam.passingScore }})
                      </span>
                  </small>
                </div>
              </div>
            </td>
            <td>
              <div class="action-buttons">
                <button class="modern-btn modern-btn-primary modern-btn-sm"
                        @click="viewDetails(exam)"
                        title="مشاهده جزئیات">
                  <i class="fas fa-eye"></i>
                </button>
                <button class="modern-btn modern-btn-info modern-btn-sm"
                        @click="viewAnswers(exam)"
                        title="مشاهده پاسخ‌ها">
                  <i class="fas fa-list-alt"></i>
                </button>
<!--                <button class="modern-btn modern-btn-secondary modern-btn-sm"-->
<!--                        @click="downloadResult(exam)"-->
<!--                        title="دانلود نتیجه">-->
<!--                  <i class="fas fa-download"></i>-->
<!--                </button>-->
                <button v-if="canRetakeExam(exam)"
                        class="modern-btn modern-btn-warning modern-btn-sm"
                        @click="retakeExam(exam)"
                        title="تکرار آزمون">
                  <i class="fas fa-redo"></i>
                </button>
              </div>
            </td>
          </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="d-flex justify-content-between align-items-center mt-4">
        <div class="pagination-info">
          نمایش {{ (currentPage - 1) * itemsPerPage + 1 }} تا
          {{ Math.min(currentPage * itemsPerPage, filteredExams.length) }} از
          {{ filteredExams.length }} آزمون
        </div>
        <nav>
          <ul class="pagination">
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
              <button class="page-link" @click="changePage(currentPage - 1)" :disabled="currentPage === 1">
                قبلی
              </button>
            </li>
            <li v-for="page in visiblePages" :key="page" class="page-item"
                :class="{ active: page === currentPage }">
              <button class="page-link" @click="changePage(page)">{{ page }}</button>
            </li>
            <li class="page-item" :class="{ disabled: currentPage === totalPages }">
              <button class="page-link" @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages">
                بعدی
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>

    <!-- Exam Details Modal -->
    <teleport to="body">
    <div class="modal fade" id="examDetailsModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="fas fa-clipboard-check me-2"></i>
              جزئیات آزمون: {{ selectedExam?.courseTitle }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body" v-if="selectedExam">
            <div class="row">
              <div class="col-md-6">
                <h6 class="mb-3">اطلاعات آزمون</h6>
                <div class="detail-list">
                  <div class="detail-item">
                    <span class="detail-label">عنوان:</span>
                    <span class="detail-value">{{ selectedExam?.courseTitle }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">دوره:</span>
                    <span class="detail-value">{{ getCourseTitle(selectedExam) }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">درس:</span>
                    <span class="detail-value">{{ getLessonTitle(selectedExam) }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">تعداد سوالات:</span>
                    <span class="detail-value">{{ selectedExam?.questionCount || 0 }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">حداکثر زمان:</span>
                    <span class="detail-value">{{ selectedExam?.timeLimit || 0 }} دقیقه</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">حد نصاب:</span>
                    <span class="detail-value">{{ selectedExam?.passingScore || 0 }}</span>
                  </div>
                </div>
              </div>
              <div class="col-md-6">
                <h6 class="mb-3">نتایج شما</h6>
                <div class="result-summary">
                  <div class="result-score">
                    <div class="score-circle" :class="getScoreClass(selectedExam)">
                      <div class="score-text">
                        <div class="score-number">{{ selectedExam.score || 0 }}</div>
                        <div class="score-total">از {{ selectedExam?.totalPossibleScore || 100 }}</div>
                      </div>
                    </div>
                  </div>
                  <div class="result-details mt-3">
                    <div class="detail-item">
                      <span class="detail-label">درصد نمره:</span>
                      <span class="detail-value">{{ getScorePercentage(selectedExam) }}%</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">زمان صرف شده:</span>
                      <span class="detail-value">{{ formatDurationSecend(selectedExam.actualDuration) }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">تاریخ شرکت:</span>
                      <span class="detail-value">{{ formatDate(selectedExam.submissionTime) }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">وضعیت:</span>
                      <span class="detail-value">
                        <span class="modern-badge" :class="getStatusBadgeClass(selectedExam)">
                          {{ getStatusText(selectedExam) }}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">بستن</button>
            <button type="button" class="btn btn-primary" @click="viewAnswers(selectedExam)">
              <i class="fas fa-list-alt me-1"></i>
              مشاهده پاسخ‌ها
            </button>
          </div>
        </div>
      </div>
    </div>
    </teleport>
  </div>
</template>

<script>
import { useFormatters } from '@/composables/useFormatters.js';

export default {
  name: 'StudentExamsTable',
  props: {
    exams: {
      type: Array,
      required: true
    }
  },
  setup() {
    const { formatDate } = useFormatters();
    return { formatDate };
  },
  data() {
    return {
      statusFilter: '',
      courseFilter: '',
      searchQuery: '',
      sortField: 'submissionTime',
      sortDirection: 'desc',
      currentPage: 1,
      itemsPerPage: 10,
      selectedExam: null,
      // isDevelopment: process.env.NODE_ENV === 'development'
    };
  },
  computed: {
    stats() {
      const total = this.exams.length;
      const passed = this.exams.filter(exam => exam.passed === true).length;
      const failed = this.exams.filter(exam => exam.passed === false).length;
      const totalScore = this.exams.reduce((sum, exam) => sum + (exam.score || 0), 0);
      const average = total > 0 ? Math.round(totalScore / total) : 0;

      return {
        total,
        passed,
        failed,
        average
      };
    },

    uniqueCourses() {
      const courses = new Map();
      this.exams.forEach(exam => {
        const course = exam.exam?.lesson?.course;
        if (course) {
          courses.set(course.id, course);
        }
      });
      return Array.from(courses.values());
    },

    filteredExams() {
      let filtered = [...this.exams];

      if (this.statusFilter) {
        filtered = filtered.filter(exam => {
          if (this.statusFilter === 'passed') return exam.passed === true;
          if (this.statusFilter === 'failed') return exam.passed === false;
          if (this.statusFilter === 'pending') return exam.passed === undefined;
          return true;
        });
      }

      if (this.courseFilter) {
        filtered = filtered.filter(exam =>
            exam.exam?.lesson?.course?.id == this.courseFilter
        );
      }

      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(exam =>
            this.getExamTitle(exam).toLowerCase().includes(query) ||
            this.getCourseTitle(exam).toLowerCase().includes(query)
        );
      }

      // Sort
      filtered.sort((a, b) => {
        let aVal = a[this.sortField];
        let bVal = b[this.sortField];

        if (this.sortField === 'examTitle') {
          aVal = this.getExamTitle(a);
          bVal = this.getExamTitle(b);
        } else if (this.sortField === 'courseTitle') {
          aVal = this.getCourseTitle(a);
          bVal = this.getCourseTitle(b);
        }

        if (typeof aVal === 'string') {
          return this.sortDirection === 'asc'
              ? aVal.localeCompare(bVal)
              : bVal.localeCompare(aVal);
        }

        return this.sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      });

      return filtered;
    },

    paginatedExams() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredExams.slice(start, end);
    },

    totalPages() {
      return Math.ceil(this.filteredExams.length / this.itemsPerPage);
    },

    visiblePages() {
      const pages = [];
      const start = Math.max(1, this.currentPage - 2);
      const end = Math.min(this.totalPages, this.currentPage + 2);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      return pages;
    }
  },
  methods: {
    getExamTitle(exam) {
      return exam.exam?.title || exam.title || exam.examTitle || 'نامشخص';
    },

    getCourseTitle(exam) {
      console.log(exam)
      return exam.exam?.lesson?.course?.title ||
          exam.course?.title ||
          exam.courseTitle ||
          exam.courseName || 'نامشخص';
    },

    getLessonTitle(exam) {
      return exam.exam?.lesson?.title ||
          exam.lesson?.title ||
          exam.lessonTitle ||
          exam.lessonName;
    },

    getScorePercentage(exam) {
      const score = exam.score || 0;
      const total = exam.exam?.totalPossibleScore || 100;
      return Math.round((score / total) * 100);
    },

    getScoreClass(exam) {
      const percentage = this.getScorePercentage(exam);
      if (percentage >= 90) return 'score-excellent';
      if (percentage >= 80) return 'score-good';
      if (percentage >= 70) return 'score-average';
      if (percentage >= 60) return 'score-poor';
      return 'score-fail';
    },

    getStatusBadgeClass(exam) {
      if (exam.passed === true) return 'modern-badge-success';
      if (exam.passed === false) return 'modern-badge-danger';
      return 'modern-badge-warning';
    },

    getStatusIcon(exam) {
      if (exam.passed === true) return 'fas fa-check-circle';
      if (exam.passed === false) return 'fas fa-times-circle';
      return 'fas fa-clock';
    },

    getStatusText(exam) {
      if (exam.passed === true) return 'قبول';
      if (exam.passed === false) return 'مردود';
      return 'در انتظار نتیجه';
    },

    formatDuration(minutes) {
      if (!minutes) return '-';
      const hrs = Math.floor(minutes / 60);
      const mins = minutes % 60;
      if (hrs > 0) {
        return `${hrs} ساعت و ${mins} دقیقه`;
      }
      return `${mins} دقیقه`;
    },

    formatDurationSecend(secends) {

      if (!secends) return '-';
      const min = Math.floor(secends / 60);
      const sec = secends % 60;
      const hrs = Math.floor(min / 60);
      const mins = min % 60;

      if (sec > 0) {
        return `${hrs} ساعت و ${mins} دقیقه و ${sec} ثانیه`;
      }
      return `${mins} دقیقه`;
    },

    getDurationPercentage(exam) {
      if (!exam.actualDuration || !exam?.timeLimit) return 0;
      return Math.min(100, ((exam.actualDuration/60) / exam.timeLimit) * 100);
    },

    getDurationClass(exam) {
      const percentage = this.getDurationPercentage(exam);
      if (percentage <= 50) return 'bg-success';
      if (percentage <= 80) return 'bg-warning';
      return 'bg-danger';
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

    canRetakeExam(exam) {
      // Logic to determine if exam can be retaken
      return exam.passed === false && exam.exam?.allowRetake;
    },

    applyFilters() {
      this.currentPage = 1;
    },

    sortBy(field) {
      if (this.sortField === field) {
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortField = field;
        this.sortDirection = 'asc';
      }
    },

    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
    },

    viewDetails(exam) {
      this.selectedExam = exam;
      const modal = new bootstrap.Modal(document.getElementById('examDetailsModal'));
      modal.show();
    },

    viewAnswers(exam) {
      // Navigate to exam answers page
      this.$router.push({
        name: 'ExamAnswers',
        params: { submissionId: exam.examId }
      });
    },

    downloadResult(exam) {
      this.$toast?.info('در حال تهیه فایل نتیجه آزمون...');
      setTimeout(() => {
        this.$toast?.success('فایل نتیجه آزمون دانلود شد');
      }, 1500);
    },

    retakeExam(exam) {
      if (confirm('آیا مطمئن هستید که می‌خواهید این آزمون را مجدداً شرکت کنید؟')) {
        this.$router.push({
          name: 'Exam',
          params: { id: exam.exam.id }
        });
      }
    }
  }
}
</script>

<style scoped>
.exams-table-container {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  padding: 1.5rem;
}

/* Filters */
.exam-filters {
  background: rgba(102, 126, 234, 0.05);
  border-radius: 8px;
  padding: 1rem;
  border: 1px solid rgba(102, 126, 234, 0.1);
}

/* Summary Cards */
.exam-summary .row {
  margin: 0;
}

.summary-card {
  background: white;
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.summary-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.summary-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
}

.summary-total .summary-icon { background: linear-gradient(135deg, #667eea, #764ba2); }
.summary-passed .summary-icon { background: linear-gradient(135deg, #28a745, #20c997); }
.summary-failed .summary-icon { background: linear-gradient(135deg, #dc3545, #e83e8c); }
.summary-average .summary-icon { background: linear-gradient(135deg, #ffc107, #fd7e14); }

.summary-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: #333;
  line-height: 1;
}

.summary-label {
  font-size: 0.9rem;
  color: #6c757d;
  margin-top: 0.25rem;
}

/* Table styles */
.sort-btn {
  background: none;
  border: none;
  color: inherit;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  cursor: pointer;
  transition: color 0.2s ease;
}

.sort-btn:hover {
  color: #667eea;
}

.exam-row {
  transition: all 0.2s ease;
}

.exam-row:hover {
  background: rgba(102, 126, 234, 0.05);
}

.exam-info {
  max-width: 250px;
}

.exam-title {
  font-weight: 600;
  color: #333;
  margin-bottom: 0.25rem;
}

.exam-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.8rem;
  color: #6c757d;
}

.course-info {
  max-width: 200px;
}

.lesson-title {
  font-size: 0.8rem;
  color: #6c757d;
  margin-top: 0.25rem;
}

.score-container {
  text-align: center;
}

.score-main {
  margin-bottom: 0.25rem;
}

.score-value {
  font-size: 1.25rem;
  font-weight: 700;
}

.score-total {
  font-size: 0.9rem;
  color: #6c757d;
  margin-left: 0.25rem;
}

.score-percentage {
  font-size: 0.8rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.score-excellent { color: #28a745; }
.score-good { color: #17a2b8; }
.score-average { color: #ffc107; }
.score-poor { color: #fd7e14; }
.score-fail { color: #dc3545; }

.date-info {
  text-align: center;
}

.submission-date {
  font-weight: 600;
  color: #333;
  margin-bottom: 0.25rem;
}

.time-ago {
  font-size: 0.8rem;
  color: #6c757d;
}

.duration-info {
  text-align: center;
}

.actual-duration {
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
}

.duration-comparison {
  max-width: 100px;
  margin: 0 auto;
}

.status-container {
  text-align: center;
}

.status-details {
  margin-top: 0.25rem;
}

.action-buttons {
  display: flex;
  gap: 0.25rem;
  justify-content: center;
  flex-wrap: wrap;
}

/* Modal styles */
.detail-list {
  background: rgba(248, 249, 250, 0.8);
  border-radius: 8px;
  padding: 1rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-label {
  font-weight: 600;
  color: #333;
}

.detail-value {
  color: #6c757d;
}

.result-summary {
  text-align: center;
}

.score-circle {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  position: relative;
  border: 8px solid;
}

.score-circle.score-excellent { border-color: #28a745; }
.score-circle.score-good { border-color: #17a2b8; }
.score-circle.score-average { border-color: #ffc107; }
.score-circle.score-poor { border-color: #fd7e14; }
.score-circle.score-fail { border-color: #dc3545; }

.score-text {
  text-align: center;
}

.score-number {
  font-size: 2rem;
  font-weight: 700;
  line-height: 1;
}

.score-total {
  font-size: 0.9rem;
  color: #6c757d;
}

/* Pagination */
.pagination-info {
  color: #6c757d;
  font-size: 0.9rem;
}

.pagination .page-link {
  border-radius: 6px;
  margin: 0 2px;
  border: 1px solid #dee2e6;
  color: #667eea;
}

.pagination .page-item.active .page-link {
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-color: #667eea;
  color: white;
}

.pagination .page-link:hover {
  background-color: rgba(102, 126, 234, 0.1);
  border-color: #667eea;
  color: #667eea;
}

/* Responsive */
@media (max-width: 768px) {
  .exam-summary .col-md-3 {
    margin-bottom: 1rem;
  }

  .modern-table-container {
    overflow-x: auto;
  }

  .modern-table {
    min-width: 800px;
  }

  .action-buttons {
    flex-direction: column;
    gap: 0.5rem;
  }

  .score-circle {
    width: 100px;
    height: 100px;
  }

  .score-number {
    font-size: 1.5rem;
  }
}
</style>