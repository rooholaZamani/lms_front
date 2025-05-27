<template>
  <div class="modern-container large animate-slide-up">
    <!-- Header -->
    <div class="modern-header text-center mb-4">
      <div class="modern-logo large success">
        <i class="fas fa-graduation-cap"></i>
      </div>
      <h2 class="modern-title">داشبورد دانش‌آموز</h2>
      <p class="modern-subtitle">خوش آمدید {{ getUserName() }}</p>
    </div>

    <!-- خلاصه وضعیت -->
    <div class="row mb-4">
      <div class="col-md-3 col-sm-6 mb-3">
        <div class="modern-stat-card animate-slide-up">
          <div class="modern-stat-icon text-primary">
            <i class="fas fa-book"></i>
          </div>
          <div class="modern-stat-value">{{ stats.totalCourses }}</div>
          <div class="modern-stat-label">تعداد دوره‌ها</div>
        </div>
      </div>
      <div class="col-md-3 col-sm-6 mb-3">
        <div class="modern-stat-card animate-slide-up" style="animation-delay: 0.1s;">
          <div class="modern-stat-icon text-success">
            <i class="fas fa-check-circle"></i>
          </div>
          <div class="modern-stat-value">{{ stats.completedCourses }}</div>
          <div class="modern-stat-label">دوره‌های تکمیل شده</div>
        </div>
      </div>
      <div class="col-md-3 col-sm-6 mb-3">
        <div class="modern-stat-card animate-slide-up" style="animation-delay: 0.2s;">
          <div class="modern-stat-icon text-warning">
            <i class="fas fa-chart-line"></i>
          </div>
          <div class="modern-stat-value">{{ stats.averageProgress }}%</div>
          <div class="modern-stat-label">میانگین پیشرفت</div>
        </div>
      </div>
      <div class="col-md-3 col-sm-6 mb-3">
        <div class="modern-stat-card animate-slide-up" style="animation-delay: 0.3s;">
          <div class="modern-stat-icon text-info">
            <i class="fas fa-clipboard-check"></i>
          </div>
          <div class="modern-stat-value">{{ exams.length }}</div>
          <div class="modern-stat-label">آزمون‌های انجام شده</div>
        </div>
      </div>
    </div>

    <!-- تب‌های اطلاعات -->
    <div class="modern-card mb-4">
      <div class="modern-card-header">
        <ul class="nav nav-tabs card-header-tabs">
          <li class="nav-item">
            <a class="nav-link" :class="{ active: activeTab === 'courses' }" href="#" @click.prevent="activeTab = 'courses'">
              <i class="fas fa-book me-1"></i> دوره‌های من
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" :class="{ active: activeTab === 'exams' }" href="#" @click.prevent="activeTab = 'exams'">
              <i class="fas fa-clipboard-check me-1"></i> آزمون‌ها
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" :class="{ active: activeTab === 'progress' }" href="#" @click.prevent="activeTab = 'progress'">
              <i class="fas fa-chart-line me-1"></i> پیشرفت تحصیلی
            </a>
          </li>
        </ul>
      </div>

      <div class="modern-card-body">
        <!-- دوره‌ها -->
        <div v-if="activeTab === 'courses'">
          <loading-spinner :loading="loading">
            <template v-if="courses.length === 0">
              <div class="text-center py-5">
                <div class="modern-logo large secondary mb-4">
                  <i class="fas fa-book"></i>
                </div>
                <h5 class="text-muted mb-3">شما هنوز در هیچ دوره‌ای ثبت‌نام نکرده‌اید</h5>
                <router-link :to="{ name: 'AvailableCourses' }" class="modern-btn modern-btn-primary">
                  <i class="fas fa-search me-1"></i>
                  جستجوی دوره‌های جدید
                </router-link>
              </div>
            </template>

            <template v-else>
              <div class="row">
                <div v-for="course in courses" :key="course.id" class="col-md-4 mb-4">
                  <student-course-card
                      :course="course"
                      :progress="progressMap[course.id]"
                  />
                </div>
              </div>

              <div v-if="courses.length > 6" class="text-center mt-4">
                <router-link :to="{ name: 'Courses' }" class="modern-btn modern-btn-outline">
                  مشاهده همه دوره‌ها
                </router-link>
              </div>
            </template>
          </loading-spinner>
        </div>

        <!-- آزمون‌ها -->
        <div v-if="activeTab === 'exams'">
          <loading-spinner :loading="loadingExams">
            <template v-if="exams.length === 0">
              <div class="text-center py-5">
                <div class="modern-logo large secondary mb-4">
                  <i class="fas fa-clipboard-check"></i>
                </div>
                <h5 class="text-muted">شما هنوز در هیچ آزمونی شرکت نکرده‌اید</h5>
              </div>
            </template>

            <template v-else>
              <student-exams-table :exams="exams" />
            </template>
          </loading-spinner>
        </div>

        <!-- پیشرفت تحصیلی -->
        <div v-if="activeTab === 'progress'">
          <loading-spinner :loading="loadingProgress">
            <template v-if="progressList.length === 0">
              <div class="text-center py-5">
                <div class="modern-logo large secondary mb-4">
                  <i class="fas fa-chart-line"></i>
                </div>
                <h5 class="text-muted">اطلاعات پیشرفت تحصیلی موجود نیست</h5>
              </div>
            </template>

            <template v-else>
              <div class="row">
                <div v-for="progress in progressList" :key="progress.course.id" class="col-md-6 mb-3">
                  <div class="modern-card h-100">
                    <div class="modern-card-body">
                      <div class="d-flex justify-content-between align-items-center mb-2">
                        <h6 class="mb-0">{{ progress.course.title }}</h6>
                        <span class="modern-badge" :class="getProgressBadgeClass(progress.completionPercentage)">
                          {{ Math.round(progress.completionPercentage) }}%
                        </span>
                      </div>

                      <div class="progress-modern" :class="getProgressClass(progress.completionPercentage)">
                        <div class="progress-bar-modern"
                             :style="`width: ${progress.completionPercentage}%`"
                             :aria-valuenow="progress.completionPercentage"
                             role="progressbar" aria-valuemin="0" aria-valuemax="100">
                        </div>
                      </div>

                      <div class="d-flex justify-content-between mt-2">
                        <small class="text-muted">
                          {{ progress.completedLessonCount }} از {{ progress.totalLessons }} درس
                        </small>
                        <small class="text-muted" v-if="progress.lastAccessed">
                          {{ formatDate(progress.lastAccessed) }}
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </loading-spinner>
        </div>
      </div>
    </div>

    <!-- توصیه‌های یادگیری -->
    <div class="modern-card">
      <div class="modern-card-header bg-primary text-white">
        <h5 class="mb-0">
          <i class="fas fa-lightbulb me-2"></i>
          توصیه‌های یادگیری
        </h5>
      </div>
      <div class="modern-card-body">
        <div class="row">
          <div class="col-md-4 mb-3">
            <div class="recommendation-card">
              <div class="recommendation-icon">
                <i class="fas fa-graduation-cap text-primary"></i>
              </div>
              <h6>تکمیل دوره‌های پایه</h6>
              <p class="text-muted">پیشنهاد می‌شود ابتدا دوره‌های پایه را تکمیل کنید.</p>
              <router-link :to="{ name: 'Courses' }" class="modern-btn modern-btn-primary btn-sm">
                مشاهده
              </router-link>
            </div>
          </div>
          <div class="col-md-4 mb-3">
            <div class="recommendation-card">
              <div class="recommendation-icon">
                <i class="fas fa-book-reader text-success"></i>
              </div>
              <h6>منابع مطالعاتی</h6>
              <p class="text-muted">مطالعه منابع اضافی به درک بهتر مفاهیم کمک می‌کند.</p>
              <button class="modern-btn modern-btn-success btn-sm">
                مشاهده
              </button>
            </div>
          </div>
          <div class="col-md-4 mb-3">
            <div class="recommendation-card">
              <div class="recommendation-icon">
                <i class="fas fa-tasks text-warning"></i>
              </div>
              <h6>تمرین‌های تکمیلی</h6>
              <p class="text-muted">برای تقویت مهارت‌ها، این تمرین‌ها را انجام دهید.</p>
              <button class="modern-btn modern-btn-warning btn-sm">
                مشاهده
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import StudentCourseCard from '@/components/dashboard/StudentCourseCard.vue';
import StudentExamsTable from '@/components/dashboard/StudentExamsTable.vue';
import { useFormatters } from '@/composables/useFormatters.js';

export default {
  name: 'StudentDashboard',
  components: {
    LoadingSpinner,
    StudentCourseCard,
    StudentExamsTable
  },
  props: {
    user: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      activeTab: 'courses',
      loading: true,
      loadingExams: true,
      loadingProgress: true,
      courses: [],
      progressList: [],
      progressMap: {},
      exams: [],
      stats: {
        totalCourses: 0,
        completedCourses: 0,
        averageProgress: 0
      }
    }
  },
  setup() {
    const { formatDate } = useFormatters();
    return { formatDate };
  },
  created() {
    this.fetchData();
  },
  methods: {
    async fetchData() {
      try {
        const [statsResponse, progressResponse, coursesResponse, examsResponse] = await Promise.all([
          axios.get('/progress/stats'),
          axios.get('/progress'),
          axios.get('/courses/enrolled'),
          axios.get('/exams/submissions/student')
        ]);

        this.stats = statsResponse.data;
        this.progressList = progressResponse.data;
        this.courses = coursesResponse.data;
        this.exams = examsResponse.data;

        this.progressMap = {};
        this.progressList.forEach(progress => {
          if (progress.course) {
            this.progressMap[progress.course.id] = progress;
          }
        });

        this.loading = false;
        this.loadingExams = false;
        this.loadingProgress = false;
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        this.loading = false;
        this.loadingExams = false;
        this.loadingProgress = false;
      }
    },

    getUserName() {
      return this.user.firstName && this.user.lastName
          ? `${this.user.firstName} ${this.user.lastName}`
          : this.user.username;
    },

    getProgressBadgeClass(progress) {
      if (progress >= 75) return 'modern-badge-success';
      if (progress >= 50) return 'modern-badge-info';
      if (progress >= 25) return 'modern-badge-warning';
      return 'modern-badge-danger';
    },

    getProgressClass(progress) {
      if (progress >= 75) return 'progress-success';
      if (progress >= 50) return 'progress-info';
      if (progress >= 25) return 'progress-warning';
      return 'progress-danger';
    }
  }
}
</script>

<style scoped>
.recommendation-card {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  height: 100%;
  transition: transform 0.3s ease;
  border: 1px solid rgba(102, 126, 234, 0.1);
}

.recommendation-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.2);
}

.recommendation-icon {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.recommendation-card h6 {
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: #333;
}

.recommendation-card p {
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

/* Navigation tabs */
.nav-tabs .nav-link {
  border: none;
  color: #6c757d;
  font-weight: 500;
}

.nav-tabs .nav-link.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 8px 8px 0 0;
}

.nav-tabs .nav-link:hover {
  border: none;
  color: #667eea;
}

/* Responsive */
@media (max-width: 768px) {
  .modern-container.large {
    margin: 0 0.5rem;
  }

  .modern-stat-card {
    margin-bottom: 1rem;
  }
}
</style>