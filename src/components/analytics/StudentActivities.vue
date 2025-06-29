<template>
  <div class="student-activities-container">
    <div class="page-header">
      <h1 class="page-title">
        <i class="fas fa-chart-bar me-3"></i>
        گزارش فعالیت دانش‌آموزان
      </h1>
      <p class="page-description">
        تحلیل جامع عملکرد و فعالیت‌های دانش‌آموزان در دوره‌های آموزشی
      </p>
    </div>

    <!-- فیلترهای انتخاب -->
    <div class="filters-section mb-4">
      <div class="row">
        <div class="col-md-4">
          <div class="filter-group">
            <label class="form-label">انتخاب دوره:</label>
            <select v-model="selectedCourseId" @change="onCourseChange" class="form-select">
              <option value="">دوره مورد نظر را انتخاب کنید</option>
              <option v-for="course in teachingCourses" :key="course.id" :value="course.id">
                {{ course.title }}
              </option>
            </select>
          </div>
        </div>

        <div class="col-md-4" v-if="selectedCourseId">
          <div class="filter-group">
            <label class="form-label">انتخاب دانش‌آموز:</label>
            <select v-model="selectedStudentId" @change="fetchStudentAnalytics" class="form-select">
              <option value="">دانش‌آموز مورد نظر را انتخاب کنید</option>
              <option v-for="student in courseStudents" :key="student.studentId" :value="student.studentId">
                {{ student.studentName }}
              </option>
            </select>
          </div>
        </div>

        <div class="col-md-4" v-if="selectedStudentId">
          <div class="filter-group">
            <label class="form-label">بازه زمانی:</label>
            <select v-model="selectedTimeFilter" @change="fetchStudentAnalytics" class="form-select">
              <option v-for="filter in timeFilters" :key="filter.value" :value="filter.value">
                {{ filter.label }}
              </option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- محتوای اصلی -->
    <div v-if="!selectedStudentId && !loading" class="empty-state">
      <loading-spinner :loading="false" type="empty">
        <div class="empty-state-content">
          <div class="empty-state-icon">
            <i class="fas fa-user-graduate"></i>
          </div>
          <h3 class="empty-state-title">انتخاب دانش‌آموز</h3>
          <p class="empty-state-description">
            برای مشاهده گزارش عملکرد، ابتدا دوره و سپس دانش‌آموز مورد نظر را انتخاب کنید
          </p>
          <div class="empty-state-features">
            <div class="feature-list">
              <div class="feature-item">
                <i class="fas fa-chart-line text-primary"></i>
                <span>تحلیل عمیق عملکرد دانش‌آموزان</span>
              </div>
              <div class="feature-item">
                <i class="fas fa-users text-success"></i>
                <span>پیگیری پیشرفت تحصیلی</span>
              </div>
              <div class="feature-item">
                <i class="fas fa-clock text-warning"></i>
                <span>تحلیل زمان و بهره‌وری</span>
              </div>
              <div class="feature-item">
                <i class="fas fa-medal text-info"></i>
                <span>سیستم دستاوردها و مدال</span>
              </div>
            </div>
          </div>
        </div>
      </loading-spinner>
    </div>

    <!-- گزارش دانش‌آموز -->
    <div v-else>
      <loading-spinner :loading="loading">
        <!-- هدر اطلاعات دانش‌آموز -->
        <div v-if="selectedStudent && studentAnalytics" class="student-header mb-4">
          <div class="modern-card">
            <div class="modern-card-body">
              <div class="row align-items-center">
                <div class="col-md-8">
                  <div class="student-info">
                    <div class="student-avatar">
                      <i class="fas fa-user-graduate"></i>
                    </div>
                    <div class="student-details">
                      <h4 class="student-name">{{ selectedStudent.studentName }}</h4>
                      <p class="student-meta">
                        <span class="badge bg-primary me-2">{{ selectedStudent.username }}</span>
                        <span class="text-muted">عضو از: {{ formatDate(studentAnalytics.studentInfo?.enrollmentDate) }}</span>
                      </p>
                    </div>
                  </div>
                </div>
                <div class="col-md-4 text-end">
                  <div class="quick-stats">
                    <div class="quick-stat">
                      <span class="stat-value">{{ studentAnalytics.overallStats?.classRank || '-' }}</span>
                      <span class="stat-label">رتبه کلاس</span>
                    </div>
                    <div class="quick-stat">
                      <span class="stat-value">{{ studentAnalytics.overallStats?.averageScore?.toFixed(1) || '0' }}</span>
                      <span class="stat-label">میانگین نمرات</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- نمودارهای اصلی -->
        <div class="row mb-4" v-if="studentAnalytics">
          <!-- نمودار عملکرد آزمون‌ها -->
          <div class="col-lg-8">
            <div class="modern-card animate-fade-in" style="animation-delay: 0.6s;">
              <div class="modern-card-header bg-primary text-white">
                <h6 class="mb-0">
                  <i class="fas fa-chart-line me-2"></i>
                  روند عملکرد آزمون‌ها
                </h6>
              </div>
              <div class="modern-card-body">
                <div class="chart-container" style="height: 300px;">
                  <Charts
                      v-if="examPerformanceChartData.length"
                      type="activity"
                      :data="examPerformanceChartData"
                      height="280px"
                  />
                  <div v-else class="empty-chart-message">
                    <i class="fas fa-chart-line text-muted"></i>
                    <p class="text-muted mt-2">هنوز آزمونی شرکت نکرده‌ است</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- آمار کلی عملکرد -->
          <div class="col-lg-4">
            <div class="modern-card animate-fade-in" style="animation-delay: 0.7s;">
              <div class="modern-card-header bg-success text-white">
                <h6 class="mb-0">
                  <i class="fas fa-trophy me-2"></i>
                  خلاصه عملکرد
                </h6>
              </div>
              <div class="modern-card-body">
                <div class="performance-stats">
                  <div class="stat-item">
                    <div class="stat-value">{{ studentAnalytics.overallStats?.averageScore?.toFixed(1) || 0 }}</div>
                    <div class="stat-label">میانگین نمرات</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-value">{{ studentAnalytics.overallStats?.examsTaken || 0 }}</div>
                    <div class="stat-label">آزمون‌های شرکت‌کرده</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-value">{{ studentAnalytics.overallStats?.completionRate?.toFixed(0) || 0 }}%</div>
                    <div class="stat-label">درصد تکمیل دروس</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-value">{{ Math.floor((studentAnalytics.overallStats?.totalStudyHours || 0)) }}</div>
                    <div class="stat-label">ساعات مطالعه</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ردیف دوم: توزیع نمرات و فعالیت هفتگی -->
        <div class="row mb-4" v-if="studentAnalytics">
          <div class="col-lg-6">
            <div class="modern-card animate-fade-in" style="animation-delay: 0.8s;">
              <div class="modern-card-header bg-warning text-white">
                <h6 class="mb-0">
                  <i class="fas fa-chart-pie me-2"></i>
                  توزیع نمرات آزمون‌ها
                </h6>
              </div>
              <div class="modern-card-body">
                <div class="chart-container" style="height: 250px;">
                  <Charts
                      v-if="scoreDistributionData.length"
                      type="pie"
                      :data="scoreDistributionData"
                      height="230px"
                  />
                  <div v-else class="empty-chart-message">
                    <i class="fas fa-chart-pie text-muted"></i>
                    <p class="text-muted mt-2">داده کافی برای نمایش وجود ندارد</p>
                  </div>
                </div>

                <!-- لژند توزیع نمرات -->
                <div class="score-legend mt-3" v-if="scoreDistributionData.length">
                  <div v-for="range in scoreDistributionData" :key="range.range"
                       class="legend-item">
                    <span class="legend-color" :style="{backgroundColor: range.color}"></span>
                    <span class="legend-label">{{ range.range }} ({{ range.count }} آزمون)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-lg-6">
            <div class="modern-card animate-fade-in" style="animation-delay: 0.9s;">
              <div class="modern-card-header bg-info text-white">
                <h6 class="mb-0">
                  <i class="fas fa-calendar-week me-2"></i>
                  فعالیت ۷ روز گذشته
                </h6>
              </div>
              <div class="modern-card-body">
                <div class="chart-container" style="height: 250px;">
                  <Charts
                      v-if="weeklyActivityData.length"
                      type="activity"
                      :data="weeklyActivityData"
                      height="230px"
                  />
                </div>

                <!-- راهنمای نمودار فعالیت -->
                <div class="activity-legend mt-3">
                  <div class="legend-row">
                    <span class="legend-dot" style="background-color: #667eea;"></span>
                    <span>بازدیدها</span>
                    <span class="legend-dot" style="background-color: #f093fb;"></span>
                    <span>ارسال‌ها</span>
                    <span class="legend-dot" style="background-color: #4facfe;"></span>
                    <span>تکمیل‌ها</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ردیف سوم: تحلیل زمان و پیشرفت دوره -->
        <div class="row mb-4" v-if="studentAnalytics">
          <div class="col-lg-6">
            <div class="modern-card animate-fade-in" style="animation-delay: 1.0s;">
              <div class="modern-card-header bg-secondary text-white">
                <h6 class="mb-0">
                  <i class="fas fa-clock me-2"></i>
                  تحلیل زمان مطالعه
                </h6>
              </div>
              <div class="modern-card-body">
                <div class="chart-container" style="height: 250px;">
                  <Charts
                      v-if="timeAnalysisChartData.length"
                      type="pie"
                      :data="timeAnalysisChartData"
                      height="230px"
                  />
                  <div v-else class="empty-chart-message">
                    <i class="fas fa-clock text-muted"></i>
                    <p class="text-muted mt-2">داده‌ای برای نمایش وجود ندارد</p>
                  </div>
                </div>

                <!-- جزئیات زمان مطالعه -->
                <div class="time-details mt-3" v-if="timeAnalysisChartData.length">
                  <div v-for="item in timeAnalysisChartData" :key="item.label"
                       class="time-detail-item">
                    <div class="time-activity">{{ item.label }}</div>
                    <div class="time-value">{{ item.hours }} ساعت</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-lg-6">
            <div class="modern-card animate-fade-in" style="animation-delay: 1.1s;">
              <div class="modern-card-header bg-dark text-white">
                <h6 class="mb-0">
                  <i class="fas fa-trend-up me-2"></i>
                  روند پیشرفت در دوره
                </h6>
              </div>
              <div class="modern-card-body">
                <div class="chart-container" style="height: 250px;">
                  <Charts
                      v-if="progressTimelineData.length"
                      type="activity"
                      :data="progressTimelineData"
                      height="230px"
                  />
                  <div v-else class="empty-chart-message">
                    <i class="fas fa-trend-up text-muted"></i>
                    <p class="text-muted mt-2">داده‌ای برای نمایش وجود ندارد</p>
                  </div>
                </div>

                <!-- نکات پیشرفت -->
                <div class="progress-insights mt-3" v-if="studentAnalytics.overallStats">
                  <div class="insight-item" v-if="studentAnalytics.overallStats.completionRate > 50">
                    <i class="fas fa-arrow-up text-success"></i>
                    <span>پیشرفت مناسب در دوره</span>
                  </div>
                  <div class="insight-item" v-if="studentAnalytics.overallStats.consistencyScore > 70">
                    <i class="fas fa-medal text-warning"></i>
                    <span>مطالعه منظم و مداوم</span>
                  </div>
                  <div class="insight-item" v-if="studentAnalytics.overallStats.classRank <= 3">
                    <i class="fas fa-crown text-warning"></i>
                    <span>در میان ۳ نفر برتر کلاس</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- بخش فعالیت‌های اخیر بهبود یافته -->
        <div class="row mb-4" v-if="recentActivities.length">
          <div class="col-12">
            <div class="modern-card animate-fade-in" style="animation-delay: 1.2s;">
              <div class="modern-card-header bg-success text-white">
                <h6 class="mb-0">
                  <i class="fas fa-history me-2"></i>
                  آخرین فعالیت‌ها ({{ recentActivities.length }} فعالیت)
                </h6>
              </div>
              <div class="modern-card-body">
                <div class="activity-timeline">
                  <div v-for="(activity, index) in displayedActivities"
                       :key="index" class="activity-item">
                    <div class="activity-icon" :class="getActivityIconClass(activity.type)">
                      <i :class="getActivityIcon(activity.type)"></i>
                    </div>
                    <div class="activity-content">
                      <div class="activity-title">{{ activity.description }}</div>
                      <div class="activity-meta">
                        <span class="activity-time">{{ formatRelativeTime(activity.timestamp) }}</span>
                        <span v-if="activity.score" class="activity-score">
                          نمره: {{ activity.score }}
                        </span>
                        <span v-if="activity.timeSpent" class="activity-duration">
                          مدت: {{ Math.floor(activity.timeSpent / 60) }} دقیقه
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- دکمه مشاهده بیشتر -->
                <div class="text-center mt-3" v-if="recentActivities.length > 5">
                  <button class="btn btn-outline-primary btn-sm" @click="showMoreActivities = !showMoreActivities">
                    <i class="fas" :class="showMoreActivities ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
                    {{ showMoreActivities ? 'نمایش کمتر' : 'نمایش بیشتر' }}
                  </button>
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
import axios from 'axios';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import Charts from '@/components/charts/Charts.vue';
import { useFormatters } from '@/composables/useFormatters.js';

export default {
  name: 'StudentActivities',
  components: {
    LoadingSpinner,
    Charts
  },
  setup() {
    const { formatDate, formatTime } = useFormatters();
    return { formatDate, formatTime };
  },
  data() {
    return {
      loading: false,
      teachingCourses: [],
      courseStudents: [],
      selectedCourseId: '',
      selectedStudentId: '',
      selectedStudent: null,
      studentAnalytics: null,

      // داده‌های نمودارهای جدید
      examPerformanceChartData: [],
      scoreDistributionData: [],
      timeAnalysisChartData: [],
      progressTimelineData: [],

      // داده‌های موجود بهبود یافته
      examPerformanceData: [],
      activityDistributionData: [],
      timeAnalysisData: [],
      difficultyAnalysisData: [],
      weeklyActivityData: [],
      recentActivities: [],

      // تنظیمات نمایش
      showMoreActivities: false,

      // فیلترهای زمانی
      timeFilters: [
        { label: 'هفته گذشته', value: '7' },
        { label: 'ماه گذشته', value: '30' },
        { label: 'سه ماه گذشته', value: '90' }
      ],
      selectedTimeFilter: '30'
    };
  },
  computed: {
    displayedActivities() {
      if (this.showMoreActivities) {
        return this.recentActivities;
      }
      return this.recentActivities.slice(0, 5);
    }
  },
  async created() {
    await this.fetchTeachingCourses();
  },
  methods: {
    async fetchTeachingCourses() {
      try {
        const response = await axios.get('/courses/teaching');
        this.teachingCourses = response.data;
      } catch (error) {
        console.error('Error fetching teaching courses:', error);
        this.$toast.error('خطا در دریافت لیست دوره‌ها');
      }
    },

    async onCourseChange() {
      if (!this.selectedCourseId) {
        this.courseStudents = [];
        this.selectedStudentId = '';
        return;
      }

      try {
        const response = await axios.get(`/courses/${this.selectedCourseId}/students`);
        this.courseStudents = response.data.map(student => ({
          studentId: student.id,
          studentName: `${student.firstName} ${student.lastName}`,
          username: student.username
        }));
        this.selectedStudentId = '';
        this.studentAnalytics = null;
      } catch (error) {
        console.error('Error fetching course students:', error);
        this.$toast.error('خطا در دریافت لیست دانش‌آموزان');
      }
    },

    async fetchStudentAnalytics() {
      if (!this.selectedStudentId || !this.selectedCourseId) return;

      this.loading = true;
      try {
        this.selectedStudent = this.courseStudents.find(s => s.studentId === this.selectedStudentId);

        // استفاده از API جدید جامع
        const response = await axios.get(`/analytics/student/${this.selectedStudentId}/course/${this.selectedCourseId}/comprehensive-report`, {
          params: {
            days: this.selectedTimeFilter
          }
        });

        this.studentAnalytics = response.data;
        this.recentActivities = response.data.recentActivities || [];

        // آماده‌سازی داده‌ها برای نمودارها
        this.prepareChartData();

      } catch (error) {
        console.error('Error fetching student analytics:', error);
        this.$toast.error('خطا در دریافت آمار دانش‌آموز');
      } finally {
        this.loading = false;
      }
    },

    prepareChartData() {
      if (!this.studentAnalytics) return;

      // 1. نمودار عملکرد آزمون‌ها
      this.examPerformanceChartData = this.studentAnalytics.recentActivities
          ?.filter(activity => activity.type === 'EXAM_SUBMISSION' && activity.score)
          .map(exam => ({
            label: exam.description.replace('شرکت در آزمون ', ''),
            score: exam.score,
            date: exam.timestamp
          })) || [];

      // 2. نمودار توزیع نمرات
      this.scoreDistributionData = this.studentAnalytics.scoreDistribution || [];

      // 3. نمودار فعالیت هفتگی
      this.weeklyActivityData = this.studentAnalytics.weeklyActivity || [];

      // 4. نمودار تحلیل زمان
      this.timeAnalysisChartData = this.studentAnalytics.timeAnalysis?.map(item => ({
        label: item.label,
        value: item.value,
        count: item.hours
      })) || [];

      // 5. نمودار پیشرفت زمانی
      this.progressTimelineData = this.studentAnalytics.progressTrend?.map(trend => ({
        month: trend.month,
        progress: (trend.lessons + trend.exams + trend.assignments) * 10, // تبدیل به درصد تقریبی
        lessons: trend.lessons,
        exams: trend.exams
      })) || [];
    },

    // متد کمکی برای آیکون نوع فعالیت
    getActivityIcon(type) {
      const icons = {
        'CONTENT_VIEW': 'fas fa-eye',
        'LESSON_COMPLETION': 'fas fa-check-circle',
        'EXAM_SUBMISSION': 'fas fa-file-alt',
        'EXERCISE_SUBMISSION': 'fas fa-dumbbell',
        'CHAT_MESSAGE_SEND': 'fas fa-comments'
      };
      return icons[type] || 'fas fa-circle';
    },

    // متد کمکی برای کلاس CSS آیکون فعالیت
    getActivityIconClass(type) {
      const classes = {
        'CONTENT_VIEW': 'activity-content',
        'LESSON_COMPLETION': 'activity-lesson',
        'EXAM_SUBMISSION': 'activity-exam',
        'EXERCISE_SUBMISSION': 'activity-exercise',
        'CHAT_MESSAGE_SEND': 'activity-chat'
      };
      return classes[type] || 'activity-default';
    },

    // متد کمکی برای فرمت زمان نسبی
    formatRelativeTime(timestamp) {
      const now = new Date();
      const activityTime = new Date(timestamp);
      const diffInHours = Math.floor((now - activityTime) / (1000 * 60 * 60));

      if (diffInHours < 1) return 'کمتر از یک ساعت پیش';
      if (diffInHours < 24) return `${diffInHours} ساعت پیش`;

      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays === 1) return 'دیروز';
      if (diffInDays < 7) return `${diffInDays} روز پیش`;

      return this.formatDate(timestamp);
    }
  }
}
</script>

<style scoped>
/* استایل‌های اصلی کامپوننت */
.student-activities-container {
  padding: 2rem;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 1rem;
}

.page-description {
  font-size: 1.1rem;
  color: #6c757d;
  max-width: 600px;
  margin: 0 auto;
}

/* فیلترها */
.filters-section {
  background: white;
  padding: 2rem;
  border-radius: 15px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.filter-group {
  margin-bottom: 1rem;
}

.filter-group label {
  font-weight: 600;
  color: #495057;
  margin-bottom: 0.5rem;
}

.form-select {
  border-radius: 8px;
  border: 2px solid #e9ecef;
  padding: 0.75rem;
  transition: all 0.3s ease;
}

.form-select:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
}

/* کارت‌ها */
.modern-card {
  background: white;
  border-radius: 15px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  border: none;
  overflow: hidden;
  transition: all 0.3s ease;
  margin-bottom: 1.5rem;
}

.modern-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.modern-card-header {
  padding: 1rem 1.5rem;
  border-bottom: none;
  font-weight: 600;
}

.modern-card-body {
  padding: 1.5rem;
}

/* هدر دانش‌آموز */
.student-header {
  margin-bottom: 2rem;
}

.student-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.student-avatar {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
}

.student-name {
  margin: 0;
  color: #2c3e50;
  font-weight: 700;
}

.student-meta {
  margin: 0.5rem 0 0 0;
  color: #6c757d;
}

.quick-stats {
  display: flex;
  gap: 2rem;
}

.quick-stat {
  text-align: center;
}

.quick-stat .stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2c3e50;
  display: block;
}

.quick-stat .stat-label {
  font-size: 0.85rem;
  color: #6c757d;
}

/* نمودارهای خالی */
.empty-chart-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #6c757d;
}

.empty-chart-message i {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.3;
}

/* آمار عملکرد */
.performance-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.stat-item {
  text-align: center;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.stat-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.9rem;
  color: #6c757d;
  font-weight: 500;
}

/* لژند نمودارها */
.score-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-block;
}

.legend-label {
  color: #495057;
  font-weight: 500;
}

/* راهنمای فعالیت */
.activity-legend {
  background: rgba(248, 249, 250, 0.8);
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.legend-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
  font-size: 0.85rem;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}

/* تحلیل زمان */
.time-details {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.time-detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: rgba(248, 249, 250, 0.6);
  border-radius: 6px;
  border-right: 3px solid #667eea;
}

.time-activity {
  font-weight: 500;
  color: #495057;
}

.time-value {
  font-weight: 600;
  color: #667eea;
}

/* نکات پیشرفت */
.progress-insights {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.insight-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: rgba(248, 249, 250, 0.6);
  border-radius: 6px;
  font-size: 0.85rem;
  color: #495057;
}

.insight-item i {
  font-size: 1rem;
}

/* تایم‌لاین فعالیت‌ها */
.activity-timeline {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 400px;
  overflow-y: auto;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(248, 249, 250, 0.8);
  border-radius: 8px;
  border: 1px solid rgba(102, 126, 234, 0.1);
  transition: all 0.2s ease;
}

.activity-item:hover {
  background: rgba(102, 126, 234, 0.05);
  border-color: #667eea;
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1rem;
}

.activity-icon.activity-lesson {
  background: linear-gradient(135deg, #667eea, #764ba2);
}

.activity-icon.activity-exam {
  background: linear-gradient(135deg, #f093fb, #f5576c);
}

.activity-icon.activity-exercise {
  background: linear-gradient(135deg, #4facfe, #00f2fe);
}

.activity-icon.activity-content {
  background: linear-gradient(135deg, #43e97b, #38f9d7);
}

.activity-icon.activity-chat {
  background: linear-gradient(135deg, #667eea, #764ba2);
}

.activity-icon.activity-default {
  background: linear-gradient(135deg, #a8edea, #fed6e3);
}

.activity-content {
  flex: 1;
}

.activity-title {
  font-weight: 600;
  color: #333;
  margin-bottom: 0.25rem;
}

.activity-meta {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: center;
  margin-top: 0.25rem;
}

.activity-time {
  font-size: 0.8rem;
  color: #6c757d;
}

.activity-score {
  font-size: 0.8rem;
  color: #28a745;
  font-weight: 600;
  background: rgba(40, 167, 69, 0.1);
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
}

.activity-duration {
  font-size: 0.8rem;
  color: #17a2b8;
  font-weight: 500;
  background: rgba(23, 162, 184, 0.1);
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
}

/* انیمیشن‌ها */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fadeIn 0.6s ease-out forwards;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
}

.empty-state-content {
  max-width: 500px;
  margin: 0 auto;
}

.empty-state-icon i {
  font-size: 4rem;
  color: #667eea;
  margin-bottom: 2rem;
}

.empty-state-title {
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 1rem;
}

.empty-state-description {
  font-size: 1.1rem;
  color: #6c757d;
  margin-bottom: 2rem;
}

.feature-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-top: 2rem;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: left;
}

.feature-item i {
  font-size: 1.5rem;
}

/* Responsive */
@media (max-width: 768px) {
  .student-activities-container {
    padding: 1rem;
  }

  .page-title {
    font-size: 2rem;
  }

  .performance-stats {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .legend-row {
    flex-direction: column;
    gap: 0.5rem;
  }

  .activity-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .score-legend {
    flex-direction: column;
    align-items: flex-start;
  }

  .quick-stats {
    justify-content: space-around;
    gap: 1rem;
  }

  .student-info {
    flex-direction: column;
    text-align: center;
  }
}
</style>