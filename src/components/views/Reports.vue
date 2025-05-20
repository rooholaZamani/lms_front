<template>
  <div class="reports-container">
    <div class="container-fluid p-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>گزارش‌ها</h2>

        <div class="d-flex gap-2">
          <button class="btn btn-outline-primary">
            <i class="fas fa-download me-1"></i> دانلود گزارش
          </button>
          <button class="btn btn-outline-secondary">
            <i class="fas fa-print me-1"></i> چاپ
          </button>
        </div>
      </div>

      <loading-spinner :loading="loading">
        <div class="row mb-4">
          <div class="col-md-3 mb-3">
            <div class="stat-card">
              <div class="stat-icon"><i class="fas fa-users"></i></div>
              <div class="stat-value">152</div>
              <div class="stat-label">کل دانش‌آموزان</div>
            </div>
          </div>

          <div class="col-md-3 mb-3">
            <div class="stat-card">
              <div class="stat-icon"><i class="fas fa-book"></i></div>
              <div class="stat-value">24</div>
              <div class="stat-label">کل دوره‌ها</div>
            </div>
          </div>

          <div class="col-md-3 mb-3">
            <div class="stat-card">
              <div class="stat-icon"><i class="fas fa-check-circle"></i></div>
              <div class="stat-value">87%</div>
              <div class="stat-label">نرخ قبولی</div>
            </div>
          </div>

          <div class="col-md-3 mb-3">
            <div class="stat-card">
              <div class="stat-icon"><i class="fas fa-chart-line"></i></div>
              <div class="stat-value">68%</div>
              <div class="stat-label">میانگین پیشرفت</div>
            </div>
          </div>
        </div>

        <div class="row">
          <!-- نمودار پیشرفت دانش‌آموزان -->
          <div class="col-md-8 mb-4">
            <div class="card">
              <div class="card-header">
                <h5 class="mb-0">پیشرفت دانش‌آموزان در دوره‌ها</h5>
              </div>
              <div class="card-body">
                <div class="chart-placeholder">
                  <img src="/api/placeholder/800/300" alt="نمودار پیشرفت دانش‌آموزان" class="img-fluid">
                </div>
              </div>
            </div>
          </div>

          <!-- دوره‌های محبوب -->
          <div class="col-md-4 mb-4">
            <div class="card">
              <div class="card-header">
                <h5 class="mb-0">دوره‌های محبوب</h5>
              </div>
              <div class="card-body">
                <ul class="list-group">
                  <li v-for="course in popularCourses" :key="course.id" class="list-group-item d-flex justify-content-between align-items-center">
                    {{ course.title }}
                    <span class="badge bg-primary rounded-pill">{{ course.students }}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div class="row">
          <!-- جدول فعالیت دانش‌آموزان -->
          <div class="col-md-12 mb-4">
            <div class="card">
              <div class="card-header d-flex justify-content-between">
                <h5 class="mb-0">فعالیت دانش‌آموزان</h5>
                <div class="dropdown">
                  <button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" id="activityPeriodDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                    هفته اخیر
                  </button>
                  <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="activityPeriodDropdown">
                    <li><a class="dropdown-item" href="#">امروز</a></li>
                    <li><a class="dropdown-item" href="#">هفته اخیر</a></li>
                    <li><a class="dropdown-item" href="#">ماه اخیر</a></li>
                    <li><a class="dropdown-item" href="#">سه ماه اخیر</a></li>
                  </ul>
                </div>
              </div>
              <div class="card-body">
                <div class="table-responsive">
                  <table class="table table-hover">
                    <thead class="table-light">
                    <tr>
                      <th>دانش‌آموز</th>
                      <th>نوع فعالیت</th>
                      <th>دوره</th>
                      <th>درس</th>
                      <th>تاریخ</th>
                      <th>نمره</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-for="activity in studentActivities" :key="activity.id">
                      <td>{{ activity.student }}</td>
                      <td>
                          <span class="badge" :class="getActivityBadgeClass(activity.type)">
                            {{ getActivityTypeText(activity.type) }}
                          </span>
                      </td>
                      <td>{{ activity.course }}</td>
                      <td>{{ activity.lesson }}</td>
                      <td>{{ formatDate(activity.date) }}</td>
                      <td>{{ activity.score !== null ? activity.score : '-' }}</td>
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
    // در یک برنامه واقعی، این داده‌ها از API دریافت می‌شوند
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
          return 'bg-primary';
        case 'lesson_complete':
          return 'bg-success';
        case 'assignment':
          return 'bg-warning';
        case 'course_enrollment':
          return 'bg-info';
        default:
          return 'bg-secondary';
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
.reports-container {
  min-height: calc(100vh - 56px);
}

.stat-card {
  background-color: #fff;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  text-align: center;
  height: 100%;
  transition: transform 0.3s, box-shadow 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  font-size: 2rem;
  margin-bottom: 10px;
  color: #007bff;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
}

.stat-label {
  color: #6c757d;
  font-size: 0.9rem;
}

.chart-placeholder {
  background-color: #f8f9fa;
  border-radius: 5px;
  overflow: hidden;
  text-align: center;
}

.table th, .table td {
  vertical-align: middle;
}
</style>