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
          <li class="nav-item">
            <a class="nav-link" :class="{ active: activeTab === 'activities' }" href="#" @click.prevent="activeTab = 'activities'">
              <i class="fas fa-chart-bar me-1"></i> فعالیت‌های من
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
                <div v-for="progress in progressList" :key="progress.courseId" class="col-md-6 mb-3">
                  <div class="modern-card h-100">
                    <div class="modern-card-body">
                      <div class="d-flex justify-content-between align-items-center mb-2">
                        <h6 class="mb-0">{{ progress.courseTitle }}</h6>
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

        <!-- فعالیت‌های من -->
        <div v-if="activeTab === 'activities'">
          <loading-spinner :loading="loadingActivities">
            <div class="row">
              <!-- Daily Activity Chart -->
              <div class="col-lg-8 mb-4">
                <div class="modern-card">
                  <div class="modern-card-header">
                    <h5 class="mb-0">
                      <i class="fas fa-chart-line me-2"></i>
                      فعالیت‌های روزانه (30 روز گذشته)
                    </h5>
                  </div>
                  <div class="modern-card-body">
                    <canvas ref="dailyActivityChart" style="max-height: 400px;"></canvas>
                  </div>
                </div>
              </div>

              <!-- Activity Summary -->
              <div class="col-lg-4 mb-4">
                <div class="modern-card h-100">
                  <div class="modern-card-header">
                    <h5 class="mb-0">
                      <i class="fas fa-chart-pie me-2"></i>
                      خلاصه فعالیت‌ها
                    </h5>
                  </div>
                  <div class="modern-card-body">
                    <div v-if="activitySummary" class="activity-summary">
                      <div class="summary-item mb-3">
                        <div class="d-flex justify-content-between">
                          <span class="text-muted">کل فعالیت‌ها</span>
                          <strong>{{ activitySummary.totalActivities || 0 }}</strong>
                        </div>
                      </div>
                      <div class="summary-item mb-3">
                        <div class="d-flex justify-content-between">
                          <span class="text-muted">روزهای فعال</span>
                          <strong>{{ activitySummary.activeDays || 0 }}</strong>
                        </div>
                      </div>
                      <div class="summary-item mb-3">
                        <div class="d-flex justify-content-between">
                          <span class="text-muted">کل زمان مطالعه</span>
                          <strong>{{ formatTime(activitySummary.totalTimeSpent) }}</strong>
                        </div>
                      </div>
                      <div class="summary-item mb-3">
                        <div class="d-flex justify-content-between">
                          <span class="text-muted">میانگین روزانه</span>
                          <strong>{{ Math.round(activitySummary.averageActivitiesPerDay || 0) }}</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Activity Type Breakdown -->
              <div class="col-lg-6 mb-4">
                <div class="modern-card">
                  <div class="modern-card-header">
                    <h5 class="mb-0">
                      <i class="fas fa-tasks me-2"></i>
                      انواع فعالیت‌ها
                    </h5>
                  </div>
                  <div class="modern-card-body">
                    <canvas ref="activityTypeChart" style="max-height: 300px;"></canvas>
                  </div>
                </div>
              </div>

              <!-- Time of Day Activity -->
              <div class="col-lg-6 mb-4">
                <div class="modern-card">
                  <div class="modern-card-header">
                    <h5 class="mb-0">
                      <i class="fas fa-clock me-2"></i>
                      فعالیت در ساعات مختلف
                    </h5>
                  </div>
                  <div class="modern-card-body">
                    <canvas ref="timeOfDayChart" style="max-height: 300px;"></canvas>
                  </div>
                </div>
              </div>
            </div>

            <!-- No Activities Message -->
            <div v-if="!loadingActivities && dailyActivityData && dailyActivityData.summary && dailyActivityData.summary.totalActivities === 0" class="text-center py-5">
              <div class="modern-logo large secondary mb-4">
                <i class="fas fa-chart-bar"></i>
              </div>
              <h5 class="text-muted mb-3">هنوز فعالیتی ثبت نشده است</h5>
              <p class="text-muted">با شروع مطالعه در دوره‌ها، فعالیت‌های شما در اینجا نمایش داده خواهد شد.</p>
            </div>
          </loading-spinner>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import StudentCourseCard from '@/components/dashboard/StudentCourseCard.vue';
import StudentExamsTable from '@/components/exams/StudentExamsTable.vue';
import Chart from 'chart.js/auto';
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
      loadingActivities: true,
      courses: [],
      progressList: [],
      progressMap: {},
      exams: [],
      stats: {
        totalCourses: 0,
        completedCourses: 0,
        averageProgress: 0
      },
      // Activity data
      dailyActivityData: null,
      activitySummary: null,
      activityBreakdown: null,
      hourlyBreakdown: null,
      // Chart instances
      dailyChart: null,
      typeChart: null,
      timeChart: null
    }
  },
  setup() {
    const { formatDate } = useFormatters();
    return { formatDate };
  },
  created() {
    this.fetchData();
  },
  beforeUnmount() {
    // Cleanup chart instances
    if (this.dailyChart) this.dailyChart.destroy();
    if (this.typeChart) this.typeChart.destroy();
    if (this.timeChart) this.timeChart.destroy();
  },
  watch: {
    activeTab(newTab) {
      if (newTab === 'activities' && !this.dailyActivityData) {
        this.fetchActivityData();
      }
    }
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
          if (progress.courseId) {
            this.progressMap[progress.courseId] = progress;
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
    },

    async fetchActivityData() {
      this.loadingActivities = true;
      try {
        const [dailyResponse, summaryResponse] = await Promise.all([
          axios.get('/analytics/student/daily-activity', {
            params: { days: 30 }
          }),
          axios.get('/analytics/student/activity-summary', {
            params: { timeFilter: 'month' }
          })
        ]);

        this.dailyActivityData = dailyResponse.data;
        this.activitySummary = {
          ...this.dailyActivityData.summary,
          ...summaryResponse.data
        };

        this.activityBreakdown = summaryResponse.data.activityBreakdown || {};
        this.hourlyBreakdown = summaryResponse.data.hourlyBreakdown || {};

        // Create charts after data is loaded
        this.$nextTick(() => {
          this.createCharts();
        });
      } catch (error) {
        console.error('Error fetching activity data:', error);
        this.$toast.error('خطا در بارگذاری داده‌های فعالیت');
      } finally {
        this.loadingActivities = false;
      }
    },

    createCharts() {
      this.createDailyActivityChart();
      this.createActivityTypeChart();
      this.createTimeOfDayChart();
    },

    createDailyActivityChart() {
      if (!this.dailyActivityData || !this.$refs.dailyActivityChart) return;

      const ctx = this.$refs.dailyActivityChart.getContext('2d');

      if (this.dailyChart) {
        this.dailyChart.destroy();
      }

      const dailyData = this.dailyActivityData.dailyData || [];

      this.dailyChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: dailyData.map(day => {
            const date = new Date(day.date);
            return date.toLocaleDateString('fa-IR', { month: 'short', day: 'numeric' });
          }),
          datasets: [
            {
              label: 'کل فعالیت‌ها',
              data: dailyData.map(day => day.totalActivities),
              borderColor: '#667eea',
              backgroundColor: 'rgba(102, 126, 234, 0.1)',
              tension: 0.4,
              fill: true
            },
            {
              label: 'مشاهده محتوا',
              data: dailyData.map(day => day.views),
              borderColor: '#22c55e',
              backgroundColor: 'rgba(34, 197, 94, 0.1)',
              tension: 0.4
            },
            {
              label: 'ارسال تکالیف',
              data: dailyData.map(day => day.submissions),
              borderColor: '#f59e0b',
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              tension: 0.4
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
              labels: {
                usePointStyle: true,
                font: {
                  family: 'Vazirmatn',
                  size: 12
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                font: {
                  family: 'Vazirmatn'
                }
              }
            },
            x: {
              ticks: {
                font: {
                  family: 'Vazirmatn'
                }
              }
            }
          }
        }
      });
    },

    createActivityTypeChart() {
      if (!this.activityBreakdown || !this.$refs.activityTypeChart) return;

      const ctx = this.$refs.activityTypeChart.getContext('2d');

      if (this.typeChart) {
        this.typeChart.destroy();
      }

      const typeLabels = {
        'CONTENT_VIEW': 'مشاهده محتوا',
        'EXAM_SUBMISSION': 'ارسال آزمون',
        'ASSIGNMENT_SUBMISSION': 'ارسال تکلیف',
        'LESSON_COMPLETION': 'تکمیل درس',
        'LOGIN': 'ورود به سیستم'
      };

      const labels = Object.keys(this.activityBreakdown).map(key => typeLabels[key] || key);
      const data = Object.values(this.activityBreakdown);

      this.typeChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: labels,
          datasets: [{
            data: data,
            backgroundColor: [
              '#667eea',
              '#22c55e',
              '#f59e0b',
              '#ef4444',
              '#8b5cf6'
            ],
            borderWidth: 2,
            borderColor: '#ffffff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                usePointStyle: true,
                font: {
                  family: 'Vazirmatn',
                  size: 11
                },
                padding: 15
              }
            }
          }
        }
      });
    },

    createTimeOfDayChart() {
      if (!this.hourlyBreakdown || !this.$refs.timeOfDayChart) return;

      const ctx = this.$refs.timeOfDayChart.getContext('2d');

      if (this.timeChart) {
        this.timeChart.destroy();
      }

      // Create 24-hour data array
      const hourlyData = [];
      for (let hour = 0; hour < 24; hour++) {
        hourlyData.push(this.hourlyBreakdown[hour.toString()] || 0);
      }

      this.timeChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: Array.from({length: 24}, (_, i) => `${i}:00`),
          datasets: [{
            label: 'تعداد فعالیت‌ها',
            data: hourlyData,
            backgroundColor: 'rgba(102, 126, 234, 0.6)',
            borderColor: '#667eea',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                font: {
                  family: 'Vazirmatn'
                }
              }
            },
            x: {
              ticks: {
                font: {
                  family: 'Vazirmatn',
                  size: 10
                }
              }
            }
          }
        }
      });
    },

    formatTime(minutes) {
      if (!minutes) return '0 دقیقه';

      const hours = Math.floor(minutes / 60);
      const remainingMinutes = Math.round(minutes % 60);

      if (hours > 0) {
        return `${hours} ساعت ${remainingMinutes > 0 ? `${remainingMinutes} دقیقه` : ''}`;
      }
      return `${remainingMinutes} دقیقه`;
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