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
                      <span class="stat-value">{{ classRankDisplay }}</span>
                      <span class="stat-label">رتبه کلاس</span>
                    </div>
                    <div class="quick-stat">
                      <span class="stat-value">{{ studentProgressPercentage }}%</span>
                      <span class="stat-label">پیشرفت کلی</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- آمار کلی بهبود یافته -->
        <div class="row mb-4" v-if="studentAnalytics">
          <div class="col-lg-3 col-md-6 mb-3">
            <div class="modern-card stat-card stat-primary animate-fade-in">
              <div class="stat-icon">
                <i class="fas fa-chart-line"></i>
              </div>
              <div class="stat-content">
                <h3 class="stat-number">{{ studentStatsData.averageScore }}%</h3>
                <p class="stat-label">میانگین نمرات</p>
                <div class="stat-progress">
                  <div class="progress-bar" :style="{width: studentStatsData.averageScore + '%'}"></div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-lg-3 col-md-6 mb-3">
            <div class="modern-card stat-card stat-success animate-fade-in" style="animation-delay: 0.1s;">
              <div class="stat-icon">
                <i class="fas fa-tasks"></i>
              </div>
              <div class="stat-content">
                <h3 class="stat-number">{{ studentStatsData.completionRate }}%</h3>
                <p class="stat-label">درصد تکمیل</p>
                <div class="stat-progress">
                  <div class="progress-bar" :style="{width: studentStatsData.completionRate + '%'}"></div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-lg-3 col-md-6 mb-3">
            <div class="modern-card stat-card stat-warning animate-fade-in" style="animation-delay: 0.2s;">
              <div class="stat-icon">
                <i class="fas fa-clock"></i>
              </div>
              <div class="stat-content">
                <h3 class="stat-number">{{ studentStatsData.totalStudyHours }}h</h3>
                <p class="stat-label">ساعات مطالعه</p>
                <div class="stat-trend">
                  <span class="trend-up">
                    <i class="fas fa-arrow-up"></i>
                    {{ studentStatsData.consistencyScore }}% ثبات
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div class="col-lg-3 col-md-6 mb-3">
            <div class="modern-card stat-card stat-info animate-fade-in" style="animation-delay: 0.3s;">
              <div class="stat-icon">
                <i class="fas fa-medal"></i>
              </div>
              <div class="stat-content">
                <h3 class="stat-number">{{ studentStatsData.examsTaken + studentStatsData.assignmentsDone }}</h3>
                <p class="stat-label">کل فعالیت‌ها</p>
                <div class="stat-breakdown">
                  <small>{{ studentStatsData.examsTaken }} آزمون • {{ studentStatsData.assignmentsDone }} تکلیف</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- نمودارهای تحلیلی -->
        <div class="row mb-4" v-if="studentAnalytics">
          <!-- نمودار فعالیت هفتگی -->
          <div class="col-lg-8 mb-4">
            <div class="modern-card animate-fade-in" style="animation-delay: 0.4s;">
              <div class="modern-card-header">
                <h6 class="mb-0">
                  <i class="fas fa-chart-area me-2"></i>
                  فعالیت هفتگی
                </h6>
              </div>
              <div class="modern-card-body">
                <Charts v-if="weeklyActivityData.length" type="activity" :data="weeklyActivityData" height="300px" />
                <div v-else class="text-center text-muted py-4">
                  <i class="fas fa-chart-area fa-2x mb-2"></i>
                  <p>داده‌ای برای نمایش فعالیت هفتگی وجود ندارد</p>
                </div>
              </div>
            </div>
          </div>

          <!-- نمودار توزیع نمرات -->
          <div class="col-lg-4 mb-4">
            <div class="modern-card animate-fade-in" style="animation-delay: 0.5s;">
              <div class="modern-card-header">
                <h6 class="mb-0">
                  <i class="fas fa-chart-pie me-2"></i>
                  توزیع نمرات
                </h6>
              </div>
              <div class="modern-card-body">
                <Charts v-if="scoreDistributionData.length" type="pie" :data="scoreDistributionData" height="280px" />
                <div v-else class="text-center text-muted py-4">
                  <i class="fas fa-chart-pie fa-2x mb-2"></i>
                  <p>داده‌ای برای توزیع نمرات وجود ندارد</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ردیف دوم نمودارها -->
        <div class="row mb-4" v-if="studentAnalytics">
          <!-- نمودار عملکرد آزمون‌ها -->
          <div class="col-lg-6 mb-4">
            <div class="modern-card animate-fade-in" style="animation-delay: 0.6s;">
              <div class="modern-card-header">
                <h6 class="mb-0">
                  <i class="fas fa-chart-bar me-2"></i>
                  عملکرد آزمون‌ها
                </h6>
              </div>
              <div class="modern-card-body">
                <Charts v-if="examPerformanceChartData.length" type="scores" :data="examPerformanceChartData" height="280px" />
                <div v-else class="text-center text-muted py-4">
                  <i class="fas fa-chart-bar fa-2x mb-2"></i>
                  <p>داده‌ای برای عملکرد آزمون‌ها وجود ندارد</p>
                </div>
              </div>
            </div>
          </div>

          <!-- نمودار تحلیل زمان -->
          <div class="col-lg-6 mb-4">
            <div class="modern-card animate-fade-in" style="animation-delay: 0.7s;">
              <div class="modern-card-header">
                <h6 class="mb-0">
                  <i class="fas fa-clock me-2"></i>
                  تحلیل زمان مطالعه
                </h6>
              </div>
              <div class="modern-card-body">
                <Charts v-if="timeAnalysisChartData.length" type="pie" :data="timeAnalysisChartData" height="280px" />
                <div v-else class="text-center text-muted py-4">
                  <i class="fas fa-clock fa-2x mb-2"></i>
                  <p>داده‌ای برای تحلیل زمان وجود ندارد</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- نمودار پیشرفت زمانی -->
        <div class="row mb-4" v-if="progressTimelineData.length">
          <div class="col-12">
            <div class="modern-card animate-fade-in" style="animation-delay: 0.8s;">
              <div class="modern-card-header">
                <h6 class="mb-0">
                  <i class="fas fa-trending-up me-2"></i>
                  روند پیشرفت ماهانه
                </h6>
              </div>
              <div class="modern-card-body">
                <Charts type="timeDistribution" :data="progressTimelineData" height="300px" />
              </div>
            </div>
          </div>
        </div>

        <!-- بخش فعالیت‌های اخیر -->
        <div class="row mb-4" v-if="recentActivities.length">
          <div class="col-12">
            <div class="modern-card animate-fade-in" style="animation-delay: 0.9s;">
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

        <!-- بخش اطلاعات تکمیلی -->
        <div class="row mb-4" v-if="studentAnalytics">
          <div class="col-lg-6 mb-3">
            <div class="modern-card insight-card animate-fade-in" style="animation-delay: 1.0s;">
              <div class="modern-card-header">
                <h6 class="mb-0">
                  <i class="fas fa-lightbulb me-2"></i>
                  تحلیل‌ها و بینش‌ها
                </h6>
              </div>
              <div class="modern-card-body">
                <div class="insights-grid">
                  <div class="insight-item" v-if="studentStatsData.averageScore >= 80">
                    <i class="fas fa-star text-warning"></i>
                    <span>عملکرد عالی در نمرات</span>
                  </div>
                  <div class="insight-item" v-if="studentStatsData.consistencyScore >= 75">
                    <i class="fas fa-check-circle text-success"></i>
                    <span>ثبات مطلوب در مطالعه</span>
                  </div>
                  <div class="insight-item" v-if="studentStatsData.classRank <= 3">
                    <i class="fas fa-crown text-warning"></i>
                    <span>در میان ۳ نفر برتر کلاس</span>
                  </div>
                  <div class="insight-item" v-if="studentStatsData.totalStudyHours >= 20">
                    <i class="fas fa-clock text-info"></i>
                    <span>حجم مطالعه مناسب</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-lg-6 mb-3">
            <div class="modern-card recommendation-card animate-fade-in" style="animation-delay: 1.1s;">
              <div class="modern-card-header">
                <h6 class="mb-0">
                  <i class="fas fa-bullseye me-2"></i>
                  پیشنهادات بهبود
                </h6>
              </div>
              <div class="modern-card-body">
                <div class="recommendations-list">
                  <div class="recommendation-item" v-if="studentStatsData.completionRate < 70">
                    <i class="fas fa-arrow-up text-primary"></i>
                    <span>افزایش میزان تکمیل دروس</span>
                  </div>
                  <div class="recommendation-item" v-if="studentStatsData.consistencyScore < 60">
                    <i class="fas fa-calendar-check text-success"></i>
                    <span>ایجاد برنامه مطالعه منظم</span>
                  </div>
                  <div class="recommendation-item" v-if="studentStatsData.examsTaken < 3">
                    <i class="fas fa-file-alt text-warning"></i>
                    <span>شرکت در آزمون‌های بیشتر</span>
                  </div>
                  <div class="recommendation-item" v-else>
                    <i class="fas fa-thumbs-up text-success"></i>
                    <span>ادامه روند مطلوب فعلی</span>
                  </div>
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
import LoadingSpinner from '../common/LoadingSpinner.vue';
import Charts from '../charts/Charts.vue';

export default {
  name: 'StudentActivities',
  components: {
    LoadingSpinner,
    Charts
  },
  data() {
    return {
      loading: false,
      selectedCourseId: '',
      selectedStudentId: '',
      selectedTimeFilter: 30,
      teachingCourses: [],
      courseStudents: [],
      selectedStudent: null,
      studentAnalytics: null,
      recentActivities: [],
      showMoreActivities: false,

      // Chart data
      weeklyActivityData: [],
      scoreDistributionData: [],
      examPerformanceChartData: [],
      timeAnalysisChartData: [],
      progressTimelineData: [],
      studentStatsData: {},

      // Filter options
      timeFilters: [
        { value: 7, label: 'یک هفته گذشته' },
        { value: 30, label: 'یک ماه گذشته' },
        { value: 90, label: 'سه ماه گذشته' },
        { value: 180, label: 'شش ماه گذشته' },
        { value: 365, label: 'یک سال گذشته' }
      ]
    };
  },

  computed: {
    displayedActivities() {
      return this.showMoreActivities
          ? this.recentActivities
          : this.recentActivities.slice(0, 5);
    },

    studentProgressPercentage() {
      if (!this.studentAnalytics?.overallStats) return 0;
      return Math.round(this.studentAnalytics.overallStats.completionRate || 0);
    },

    classRankDisplay() {
      const stats = this.studentAnalytics?.overallStats;
      if (!stats?.classRank) return 'نامشخص';
      return `${stats.classRank} از ${stats.totalStudents || '?'}`;
    }
  },

  async mounted() {
    await this.fetchTeachingCourses();
  },

  methods: {
    async fetchTeachingCourses() {
      this.loading = true;
      try {
        const response = await axios.get('/courses/teaching');
        this.teachingCourses = response.data || [];
      } catch (error) {
        console.error('Error fetching teaching courses:', error);
        this.$toast.error('خطا در دریافت لیست دوره‌های تدریس');
        this.teachingCourses = [];
      } finally {
        this.loading = false;
      }
    },

    async onCourseChange() {
      if (!this.selectedCourseId) {
        this.courseStudents = [];
        this.selectedStudentId = '';
        this.studentAnalytics = null;
        return;
      }

      this.loading = true;
      try {
        const response = await axios.get(`/analytics/teacher/course/${this.selectedCourseId}/students-summary`);
        this.courseStudents = response.data || [];
        this.selectedStudentId = '';
        this.studentAnalytics = null;
      } catch (error) {
        console.error('Error fetching course students:', error);
        this.$toast.error('خطا در دریافت لیست دانش‌آموزان');
        this.courseStudents = [];
      } finally {
        this.loading = false;
      }
    },

    async fetchStudentAnalytics() {
      if (!this.selectedStudentId || !this.selectedCourseId) return;

      this.loading = true;
      try {
        this.selectedStudent = this.courseStudents.find(s => s.studentId === this.selectedStudentId);

        const response = await axios.get(`/analytics/student/${this.selectedStudentId}/course/${this.selectedCourseId}/comprehensive-report`, {
          params: {
            days: this.selectedTimeFilter
          }
        });

        if (response.data) {
          this.studentAnalytics = response.data;
          this.recentActivities = response.data.recentActivities || [];
          this.prepareChartData();
        } else {
          throw new Error('No data received from API');
        }

      } catch (error) {
        console.error('Error fetching student analytics:', error);
        this.$toast.error('خطا در دریافت آمار دانش‌آموز: ' + (error.response?.data?.message || error.message));

        // Reset data on error
        this.studentAnalytics = null;
        this.recentActivities = [];
        this.resetChartData();
      } finally {
        this.loading = false;
      }
    },

    prepareChartData() {
      if (!this.studentAnalytics) {
        this.resetChartData();
        return;
      }

      console.log('Preparing chart data for StudentActivities:', this.studentAnalytics);

      // 1. آمار کلی دانش‌آموز
      this.studentStatsData = {
        averageScore: Math.round(this.studentAnalytics.overallStats?.averageScore || 0),
        completionRate: Math.round(this.studentAnalytics.overallStats?.completionRate || 0),
        totalStudyHours: Math.round((this.studentAnalytics.overallStats?.totalStudyHours || 0) * 10) / 10,
        classRank: this.studentAnalytics.overallStats?.classRank || 0,
        totalStudents: this.studentAnalytics.overallStats?.totalStudents || 0,
        consistencyScore: Math.round(this.studentAnalytics.overallStats?.consistencyScore || 0),
        examsTaken: this.studentAnalytics.overallStats?.examsTaken || 0,
        assignmentsDone: this.studentAnalytics.overallStats?.assignmentsDone || 0
      };

      // 2. نمودار عملکرد آزمون‌ها
      if (this.studentAnalytics.recentActivities) {
        this.examPerformanceChartData = this.studentAnalytics.recentActivities
            .filter(activity => activity.type === 'EXAM_SUBMISSION' && activity.score)
            .slice(0, 10)
            .map(exam => ({
              label: exam.description?.replace('شرکت در آزمون ', '') || 'آزمون',
              score: exam.score || 0,
              date: exam.timestamp,
              timeSpent: exam.timeSpent ? Math.floor(exam.timeSpent / 60) : 0
            }));
      } else {
        this.examPerformanceChartData = [];
      }

      // 3. نمودار توزیع نمرات
      if (this.studentAnalytics.scoreDistribution && this.studentAnalytics.scoreDistribution.length > 0) {
        this.scoreDistributionData = this.studentAnalytics.scoreDistribution.map((item, index) => ({
          label: item.range || `بازه ${index + 1}`,
          value: item.count || 0,
          percentage: item.percentage || 0,
          color: item.color || ['#667eea', '#f093fb', '#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24'][index % 6]
        }));
      } else {
        this.scoreDistributionData = [];
      }

      // 4. نمودار فعالیت هفتگی
      if (this.studentAnalytics.weeklyActivity && this.studentAnalytics.weeklyActivity.length > 0) {
        this.weeklyActivityData = this.studentAnalytics.weeklyActivity.map(day => ({
          date: day.date,
          dayName: day.dayName || this.getDayName(day.date),
          contentViews: day.views || 0,
          logins: day.logins || 0,
          examSubmissions: day.submissions || 0,
          assignmentSubmissions: day.completions || 0,
          totalTime: day.totalTime || 0,
          avgSessionTime: day.avgSessionTime || day.totalTime || 0
        }));
      } else {
        this.weeklyActivityData = [];
      }

      // 5. نمودار تحلیل زمان
      if (this.studentAnalytics.timeAnalysis && this.studentAnalytics.timeAnalysis.length > 0) {
        const totalTime = this.studentAnalytics.timeAnalysis.reduce((sum, item) => sum + (item.seconds || item.value || 0), 0);

        this.timeAnalysisChartData = this.studentAnalytics.timeAnalysis.map((item, index) => {
          const seconds = item.seconds || item.value || 0;
          const hours = Math.round((seconds / 3600) * 10) / 10;
          const percentage = totalTime > 0 ? Math.round((seconds / totalTime) * 100) : 0;

          return {
            label: item.label || `فعالیت ${index + 1}`,
            value: seconds,
            hours: hours,
            minutes: Math.floor(seconds / 60),
            percentage: percentage,
            color: ['#667eea', '#f093fb', '#ff6b6b', '#4ecdc4', '#45b7d1'][index % 5]
          };
        });
      } else {
        this.timeAnalysisChartData = [];
      }

      // 6. نمودار پیشرفت زمانی
      if (this.studentAnalytics.progressTrend && this.studentAnalytics.progressTrend.length > 0) {
        this.progressTimelineData = this.studentAnalytics.progressTrend.map(trend => {
          const totalActivities = (trend.lessons || 0) + (trend.exams || 0) + (trend.assignments || 0);

          return {
            date: `${trend.month} ${trend.year}`,
            month: trend.month,
            year: trend.year,
            lessons: trend.lessons || 0,
            exams: trend.exams || 0,
            assignments: trend.assignments || 0,
            totalActivities: totalActivities,
            activeStudents: totalActivities, // برای سازگاری با Charts component
            totalseconds: totalActivities * 3600 // فرضی برای نمودار
          };
        });
      } else {
        this.progressTimelineData = [];
      }

      console.log('Chart data prepared successfully:');
      console.log('- examPerformanceChartData:', this.examPerformanceChartData.length);
      console.log('- scoreDistributionData:', this.scoreDistributionData.length);
      console.log('- weeklyActivityData:', this.weeklyActivityData.length);
      console.log('- timeAnalysisChartData:', this.timeAnalysisChartData.length);
      console.log('- progressTimelineData:', this.progressTimelineData.length);
    },

    resetChartData() {
      this.weeklyActivityData = [];
      this.scoreDistributionData = [];
      this.examPerformanceChartData = [];
      this.timeAnalysisChartData = [];
      this.progressTimelineData = [];
      this.studentStatsData = {};
    },

    getDayName(dateString) {
      try {
        return new Date(dateString).toLocaleDateString('fa-IR', { weekday: 'long' });
      } catch (error) {
        return 'نامشخص';
      }
    },

    formatDate(dateString) {
      if (!dateString) return 'نامشخص';

      try {
        return new Date(dateString).toLocaleDateString('fa-IR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      } catch (error) {
        return 'تاریخ نامعتبر';
      }
    },

    formatRelativeTime(timestamp) {
      if (!timestamp) return 'نامشخص';

      try {
        const now = new Date();
        const activityTime = new Date(timestamp);
        const diffInHours = Math.floor((now - activityTime) / (1000 * 60 * 60));

        if (diffInHours < 1) return 'کمتر از یک ساعت پیش';
        if (diffInHours < 24) return `${diffInHours} ساعت پیش`;

        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `${diffInDays} روز پیش`;

        const diffInWeeks = Math.floor(diffInDays / 7);
        if (diffInWeeks < 4) return `${diffInWeeks} هفته پیش`;

        return activityTime.toLocaleDateString('fa-IR');
      } catch (error) {
        return 'زمان نامعتبر';
      }
    },

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

    getActivityIconClass(type) {
      const classes = {
        'CONTENT_VIEW': 'activity-content',
        'LESSON_COMPLETION': 'activity-lesson',
        'EXAM_SUBMISSION': 'activity-exam',
        'EXERCISE_SUBMISSION': 'activity-exercise',
        'CHAT_MESSAGE_SEND': 'activity-chat'
      };
      return classes[type] || 'activity-default';
    }
  }
};
</script>

<style scoped>
.student-activities-container {
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
}

.page-header {
  text-align: center;
  margin-bottom: 2rem;
}

.page-title {
  color: #2c3e50;
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.page-description {
  color: #7f8c8d;
  font-size: 1.1rem;
  margin-bottom: 0;
}

.filters-section {
  background: white;
  padding: 1.5rem;
  border-radius: 15px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
}

.filter-group label {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.form-select {
  border: 2px solid #e9ecef;
  border-radius: 10px;
  padding: 0.75rem 1rem;
  transition: all 0.3s ease;
}

.form-select:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
}

.modern-card {
  background: white;
  border: none;
  border-radius: 15px;
  box-shadow: 0 5px 20px rgba(0,0,0,0.08);
  transition: all 0.3s ease;
  overflow: hidden;
}

.modern-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

.modern-card-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem 1.5rem;
  border: none;
}

.modern-card-body {
  padding: 1.5rem;
}

.student-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.student-avatar {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
}

.student-name {
  color: #2c3e50;
  margin-bottom: 0.5rem;
  font-weight: 700;
}

.student-meta {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.quick-stats {
  display: flex;
  gap: 2rem;
}

.quick-stat {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  color: #2c3e50;
}

.stat-label {
  font-size: 0.9rem;
  color: #7f8c8d;
}

.stat-card {
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
}

.stat-icon {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 50px;
  height: 50px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #667eea;
  font-size: 1.2rem;
}

.stat-content {
  padding: 1.5rem;
  position: relative;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
}

.stat-progress {
  width: 100%;
  height: 4px;
  background: #f1f2f6;
  border-radius: 2px;
  overflow: hidden;
  margin-top: 0.5rem;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-radius: 2px;
  transition: width 0.6s ease;
}

.activity-timeline {
  position: relative;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid #f1f2f6;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.9rem;
}

.activity-content {
  background: #667eea;
}

.activity-lesson {
  background: #2ecc71;
}

.activity-exam {
  background: #e74c3c;
}

.activity-exercise {
  background: #f39c12;
}

.activity-chat {
  background: #9b59b6;
}

.activity-default {
  background: #95a5a6;
}

.activity-title {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.25rem;
}

.activity-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.85rem;
  color: #7f8c8d;
}

.activity-score {
  color: #27ae60;
  font-weight: 600;
}

.activity-duration {
  color: #8e44ad;
}

.insights-grid {
  display: grid;
  gap: 0.75rem;
}

.insight-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 8px;
  font-size: 0.9rem;
}

.recommendations-list {
  display: grid;
  gap: 0.75rem;
}

.recommendation-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 8px;
  font-size: 0.9rem;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
}

.empty-state-icon {
  font-size: 4rem;
  color: #bdc3c7;
  margin-bottom: 1rem;
}

.empty-state-title {
  color: #2c3e50;
  margin-bottom: 1rem;
}

.empty-state-description {
  color: #7f8c8d;
  margin-bottom: 2rem;
}

.feature-list {
  display: grid;
  gap: 1rem;
  max-width: 600px;
  margin: 0 auto;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.animate-fade-in {
  animation: fadeInUp 0.6s ease forwards;
  opacity: 0;
  transform: translateY(20px);
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .quick-stats {
    flex-direction: column;
    gap: 1rem;
  }

  .activity-meta {
    flex-direction: column;
    gap: 0.25rem;
  }

  .page-title {
    font-size: 2rem;
  }
}
</style>