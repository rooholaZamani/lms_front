<template>
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: calc(100vh - 56px); padding: 2rem 1rem;">
    <div class="container-fluid">
      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="text-white mb-2">
            <i class="fas fa-chart-line me-3"></i>
            گزارش‌ها و آمارها
          </h2>
          <p class="text-white-50 mb-0">مشاهده کامل عملکرد سیستم آموزشی</p>
        </div>

        <div class="d-flex gap-2">
          <button class="modern-btn modern-btn-outline text-white">
            <i class="fas fa-download me-1"></i> دانلود گزارش
          </button>
          <button class="modern-btn modern-btn-outline text-white">
            <i class="fas fa-print me-1"></i> چاپ
          </button>
        </div>
      </div>

      <loading-spinner :loading="loading">
        <!-- Stats Overview -->
        <div class="row mb-4">
          <div class="col-md-3 mb-3">
            <div class="modern-stat-card animate-slide-up">
              <div class="modern-stat-icon text-primary">
                <i class="fas fa-users"></i>
              </div>
              <div class="modern-stat-value">152</div>
              <div class="modern-stat-label">کل دانش‌آموزان</div>
            </div>
          </div>

          <div class="col-md-3 mb-3">
            <div class="modern-stat-card animate-slide-up" style="animation-delay: 0.1s;">
              <div class="modern-stat-icon text-success">
                <i class="fas fa-book"></i>
              </div>
              <div class="modern-stat-value">24</div>
              <div class="modern-stat-label">کل دوره‌ها</div>
            </div>
          </div>

          <div class="col-md-3 mb-3">
            <div class="modern-stat-card animate-slide-up" style="animation-delay: 0.2s;">
              <div class="modern-stat-icon text-warning">
                <i class="fas fa-check-circle"></i>
              </div>
              <div class="modern-stat-value">87%</div>
              <div class="modern-stat-label">نرخ قبولی</div>
            </div>
          </div>

          <div class="col-md-3 mb-3">
            <div class="modern-stat-card animate-slide-up" style="animation-delay: 0.3s;">
              <div class="modern-stat-icon text-info">
                <i class="fas fa-chart-line"></i>
              </div>
              <div class="modern-stat-value">68%</div>
              <div class="modern-stat-label">میانگین پیشرفت</div>
            </div>
          </div>
        </div>

        <div class="row">
          <!-- Chart Section -->
          <div class="col-md-8 mb-4">
            <div class="modern-card animate-slide-right">
              <div class="d-flex justify-content-between align-items-center mb-4">
                <h5 class="modern-title mb-0">
                  <i class="fas fa-chart-area text-primary me-2"></i>
                  پیشرفت دانش‌آموزان در دوره‌ها
                </h5>
                <div class="dropdown">
                  <button class="modern-btn modern-btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                    <i class="fas fa-filter me-1"></i> فیلتر
                  </button>
                  <ul class="dropdown-menu">
                    <li><a class="dropdown-item" href="#">ماه اخیر</a></li>
                    <li><a class="dropdown-item" href="#">سه ماه اخیر</a></li>
                    <li><a class="dropdown-item" href="#">سال اخیر</a></li>
                  </ul>
                </div>
              </div>

              <div class="chart-container bg-light rounded p-4" style="height: 300px;">
                <div class="d-flex align-items-center justify-content-center h-100">
                  <div class="text-center">
                    <i class="fas fa-chart-line fa-3x text-muted mb-3"></i>
                    <p class="text-muted">نمودار پیشرفت دانش‌آموزان</p>
                    <small class="text-muted">داده‌های واقعی در اینجا نمایش داده می‌شود</small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Popular Courses -->
          <div class="col-md-4 mb-4">
            <div class="modern-card animate-slide-left">
              <h5 class="modern-title mb-4">
                <i class="fas fa-star text-warning me-2"></i>
                دوره‌های محبوب
              </h5>

              <div class="list-group list-group-flush">
                <div v-for="course in popularCourses" :key="course.id"
                     class="list-group-item d-flex justify-content-between align-items-center bg-transparent border-0 px-0">
                  <div>
                    <h6 class="mb-1">{{ course.title }}</h6>
                    <small class="text-muted">{{ course.students }} دانش‌آموز</small>
                  </div>
                  <span class="modern-badge modern-badge-primary">{{ course.students }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Activity Table -->
        <div class="row">
          <div class="col-12">
            <div class="modern-card animate-slide-up" style="animation-delay: 0.4s;">
              <div class="d-flex justify-content-between align-items-center mb-4">
                <h5 class="modern-title mb-0">
                  <i class="fas fa-history text-info me-2"></i>
                  فعالیت‌های اخیر دانش‌آموزان
                </h5>
                <div class="dropdown">
                  <button class="modern-btn modern-btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                    <i class="fas fa-calendar me-1"></i> هفته اخیر
                  </button>
                  <ul class="dropdown-menu dropdown-menu-end">
                    <li><a class="dropdown-item" href="#">امروز</a></li>
                    <li><a class="dropdown-item" href="#">هفته اخیر</a></li>
                    <li><a class="dropdown-item" href="#">ماه اخیر</a></li>
                    <li><a class="dropdown-item" href="#">سه ماه اخیر</a></li>
                  </ul>
                </div>
              </div>

              <div class="modern-table-container">
                <table class="modern-table table">
                  <thead>
                  <tr>
                    <th>
                      <i class="fas fa-user me-1"></i>
                      دانش‌آموز
                    </th>
                    <th>
                      <i class="fas fa-tasks me-1"></i>
                      نوع فعالیت
                    </th>
                    <th>
                      <i class="fas fa-book me-1"></i>
                      دوره
                    </th>
                    <th>
                      <i class="fas fa-play-circle me-1"></i>
                      درس
                    </th>
                    <th>
                      <i class="fas fa-clock me-1"></i>
                      تاریخ
                    </th>
                    <th>
                      <i class="fas fa-star me-1"></i>
                      نمره
                    </th>
                  </tr>
                  </thead>
                  <tbody>
                  <tr v-for="activity in studentActivities" :key="activity.id">
                    <td>
                      <div class="d-flex align-items-center">
                        <div class="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-2"
                             style="width: 32px; height: 32px; font-size: 0.8rem;">
                          {{ activity.student.charAt(0) }}
                        </div>
                        {{ activity.student }}
                      </div>
                    </td>
                    <td>
                        <span class="modern-badge" :class="getActivityBadgeClass(activity.type)">
                          <i :class="getActivityIcon(activity.type)" class="me-1"></i>
                          {{ getActivityTypeText(activity.type) }}
                        </span>
                    </td>
                    <td>{{ activity.course }}</td>
                    <td>{{ activity.lesson }}</td>
                    <td>
                      <small>{{ formatDate(activity.date) }}</small>
                    </td>
                    <td>
                        <span v-if="activity.score !== null" class="fw-bold text-success">
                          {{ activity.score }}
                        </span>
                      <span v-else class="text-muted">-</span>
                    </td>
                  </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </loading-spinner>
    </div>
  </div>
</template>

<script>
import { useFormatters } from '@/composables/useFormatters.js';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';

export default {
  name: 'Reports',
  components: {
    LoadingSpinner
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
      popularCourses: [],
      studentActivities: []
    };
  },
  created() {
    setTimeout(() => {
      this.popularCourses = this.generatePopularCourses();
      this.studentActivities = this.generateStudentActivities();
      this.loading = false;
    }, 800);
  },
  methods: {
    generatePopularCourses() {
      return [
        { id: 1, title: 'برنامه‌نویسی پایتون', students: 45 },
        { id: 2, title: 'مقدمه‌ای بر هوش مصنوعی', students: 38 },
        { id: 3, title: 'طراحی وب پیشرفته', students: 32 },
        { id: 4, title: 'ریاضیات مهندسی', students: 27 },
        { id: 5, title: 'آموزش زبان انگلیسی', students: 24 }
      ];
    },

    generateStudentActivities() {
      return [
        {
          id: 1,
          student: 'علی محمدی',
          type: 'exam',
          course: 'برنامه‌نویسی پایتون',
          lesson: 'ساختارهای داده',
          date: '2023-09-15T10:30:00Z',
          score: 92
        },
        {
          id: 2,
          student: 'مریم احمدی',
          type: 'lesson_complete',
          course: 'طراحی وب پیشرفته',
          lesson: 'فریم‌ورک‌های CSS',
          date: '2023-09-14T14:15:00Z',
          score: null
        },
        {
          id: 3,
          student: 'حسین رضایی',
          type: 'assignment',
          course: 'مقدمه‌ای بر هوش مصنوعی',
          lesson: 'شبکه‌های عصبی',
          date: '2023-09-13T08:45:00Z',
          score: 85
        },
        {
          id: 4,
          student: 'فاطمه کریمی',
          type: 'course_enrollment',
          course: 'ریاضیات مهندسی',
          lesson: '',
          date: '2023-09-12T11:20:00Z',
          score: null
        },
        {
          id: 5,
          student: 'محمد حسینی',
          type: 'exam',
          course: 'آموزش زبان انگلیسی',
          lesson: 'گرامر پیشرفته',
          date: '2023-09-11T15:30:00Z',
          score: 78
        }
      ];
    },

    getActivityBadgeClass(type) {
      switch (type) {
        case 'exam':
          return 'modern-badge-primary';
        case 'lesson_complete':
          return 'modern-badge-success';
        case 'assignment':
          return 'modern-badge-warning';
        case 'course_enrollment':
          return 'modern-badge-secondary';
        default:
          return 'modern-badge-secondary';
      }
    },

    getActivityIcon(type) {
      switch (type) {
        case 'exam':
          return 'fas fa-clipboard-check';
        case 'lesson_complete':
          return 'fas fa-check-circle';
        case 'assignment':
          return 'fas fa-file-alt';
        case 'course_enrollment':
          return 'fas fa-user-plus';
        default:
          return 'fas fa-circle';
      }
    },

    getActivityTypeText(type) {
      switch (type) {
        case 'exam':
          return 'آزمون';
        case 'lesson_complete':
          return 'تکمیل درس';
        case 'assignment':
          return 'تکلیف';
        case 'course_enrollment':
          return 'ثبت‌نام دوره';
        default:
          return 'نامشخص';
      }
    }
  }
}
</script>

<style scoped>
/* Component specific styles */
.chart-container {
  border: 2px dashed #dee2e6;
}

/* List styling */
.list-group-item {
  transition: background-color 0.2s ease;
}

.list-group-item:hover {
  background-color: rgba(102, 126, 234, 0.05) !important;
}

/* Avatar styling */
.rounded-circle {
  font-weight: 600;
}

/* Animation effects */
.animate-slide-right {
  animation: slideInRight 0.6s ease forwards;
}

.animate-slide-left {
  animation: slideInLeft 0.6s ease forwards;
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .d-flex.justify-content-between {
    flex-direction: column;
    gap: 1rem;
  }

  .modern-stat-card {
    padding: 1rem;
  }

  .modern-stat-icon {
    font-size: 2rem;
  }

  .modern-stat-value {
    font-size: 1.5rem;
  }

  .chart-container {
    height: 200px !important;
  }
}

/* Table responsive */
@media (max-width: 992px) {
  .modern-table-container {
    overflow-x: auto;
  }

  .modern-table {
    min-width: 600px;
  }
}

/* Dark mode enhancements */
@media (prefers-color-scheme: dark) {
  .chart-container {
    background-color: #2d3748 !important;
    border-color: #4a5568;
  }

  .list-group-item:hover {
    background-color: rgba(102, 126, 234, 0.1) !important;
  }
}
</style>