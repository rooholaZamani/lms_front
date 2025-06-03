<template>
  <div class="modern-page-bg primary-gradient">
    <div class="modern-container large animate-slide-up">
      <div class="modern-header">
        <div class="modern-logo primary">
          <i class="fas fa-user-graduate"></i>
        </div>
        <h1 class="modern-title">تحلیل فعالیت دانش‌آموزان</h1>
        <p class="modern-subtitle">بررسی جامع و پیشرفت تحصیلی دانش‌آموزان منتخب</p>
      </div>

      <!-- انتخاب دانش‌آموز -->
      <div class="modern-card animate-fade-in mb-4">
        <div class="modern-card-header bg-primary text-white">
          <h5 class="mb-0">
            <i class="fas fa-user-friends me-2"></i>
            انتخاب دانش‌آموز
          </h5>
        </div>
        <div class="modern-card-body">
          <div class="row">
            <div class="col-md-6 modern-form-group">
              <label class="modern-form-label">دوره</label>
              <select class="modern-form-control" v-model="selectedCourseId" @change="fetchStudentsForCourse">
                <option value="">انتخاب دوره</option>
                <option v-for="course in teachingCourses" :key="course.id" :value="course.id">
                  {{ course.title }}
                </option>
              </select>
            </div>
            <div class="col-md-6 modern-form-group">
              <label class="modern-form-label">دانش‌آموز</label>
              <select class="modern-form-control" v-model="selectedStudentId" @change="fetchStudentAnalytics" :disabled="!selectedCourseId">
                <option value="">انتخاب دانش‌آموز</option>
                <option v-for="student in courseStudents" :key="student.studentId" :value="student.studentId">
                  {{ student.studentName }}
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <loading-spinner :loading="loading">
        <div v-if="selectedStudent && studentAnalytics" class="analytics-content">
          <!-- خلاصه عملکرد دانش‌آموز -->
          <div class="modern-card animate-fade-in mb-4" style="animation-delay: 0.1s;">
            <div class="modern-card-header bg-success text-white">
              <h5 class="mb-0">
                <i class="fas fa-chart-line me-2"></i>
                {{ selectedStudent.studentName }} - خلاصه عملکرد
              </h5>
            </div>
            <div class="modern-card-body">
              <div class="row">
                <div class="col-lg-8">
                  <div class="row">
                    <div class="col-md-3 mb-3">
                      <div class="modern-stat-card">
                        <div class="modern-stat-icon text-primary">
                          <i class="fas fa-percentage"></i>
                        </div>
                        <div class="modern-stat-value">{{ studentAnalytics.completionPercentage || 0 }}%</div>
                        <div class="modern-stat-label">تکمیل دوره</div>
                      </div>
                    </div>
                    <div class="col-md-3 mb-3">
                      <div class="modern-stat-card">
                        <div class="modern-stat-icon text-success">
                          <i class="fas fa-clipboard-check"></i>
                        </div>
                        <div class="modern-stat-value">{{ studentAnalytics.examsTaken || 0 }}</div>
                        <div class="modern-stat-label">آزمون‌های گذرانده</div>
                      </div>
                    </div>
                    <div class="col-md-3 mb-3">
                      <div class="modern-stat-card">
                        <div class="modern-stat-icon text-warning">
                          <i class="fas fa-star"></i>
                        </div>
                        <div class="modern-stat-value">{{ studentAnalytics.averageExamScore || 0 }}</div>
                        <div class="modern-stat-label">میانگین نمره آزمون</div>
                      </div>
                    </div>
                    <div class="col-md-3 mb-3">
                      <div class="modern-stat-card">
                        <div class="modern-stat-icon text-info">
                          <i class="fas fa-dumbbell"></i>
                        </div>
                        <div class="modern-stat-value">{{ studentAnalytics.exercisesTaken || 0 }}</div>
                        <div class="modern-stat-label">تمرین‌های انجام شده</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="col-lg-4">
                  <div class="progress-circle-container">
                    <div class="progress-circle" :class="getProgressClass(studentAnalytics.completionPercentage)">
                      <div class="progress-text">
                        <div class="progress-number">{{ studentAnalytics.completionPercentage || 0 }}%</div>
                        <div class="progress-label">تکمیل شده</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- نمودارهای عملکرد -->
          <div class="row">
            <div class="col-lg-6 mb-4">
              <div class="modern-card animate-fade-in" style="animation-delay: 0.2s;">
                <div class="modern-card-header bg-info text-white">
                  <h6 class="mb-0">
                    <i class="fas fa-chart-bar me-2"></i>
                    روند عملکرد آزمون‌ها
                  </h6>
                </div>
                <div class="modern-card-body">
                  <div class="chart-container">
                    <Charts
                        type="activity"
                        :data="examPerformanceData"
                        height="300px"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div class="col-lg-6 mb-4">
              <div class="modern-card animate-fade-in" style="animation-delay: 0.3s;">
                <div class="modern-card-header bg-warning text-white">
                  <h6 class="mb-0">
                    <i class="fas fa-pie-chart me-2"></i>
                    توزیع فعالیت‌ها
                  </h6>
                </div>
                <div class="modern-card-body">
                  <div class="chart-container">
                    <Charts
                        type="scores"
                        :data="activityDistributionData"
                        height="300px"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- مقایسه عملکرد دانش‌آموز با کلاس -->}
          <div class="modern-card animate-fade-in mb-4" style="animation-delay: 0.4s;">
            <div class="modern-card-header bg-secondary text-white">
              <h5 class="mb-0">
                <i class="fas fa-balance-scale me-2"></i>
                مقایسه عملکرد با میانگین کلاس
              </h5>
            </div>
            <div class="modern-card-body">
              <div class="row">
                <div class="col-lg-8">
                  <div class="chart-container">
                    <Charts
                        type="activity"
                        :data="progressTimelineData"
                        height="350px"
                        title="تایم‌لاین پیشرفت یادگیری"
                    />
                  </div>
                </div>
                <div class="col-lg-4">
                  <div class="comparison-radar">
                    <h6 class="text-center mb-3">
                      <i class="fas fa-radar me-2"></i>
                      نمودار مقایسه‌ای عملکرد
                    </h6>
                    <div class="radar-chart-placeholder">
                      <!-- در اینجا می‌توان از کتابخانه Chart.js استفاده کرد -->
                      <div class="radar-metrics">
                        <div class="metric-item">
                          <span class="metric-label">سرعت:</span>
                          <div class="metric-bar">
                            <div class="metric-fill" :style="`width: ${comparisonData.speed}%`"></div>
                          </div>
                          <span class="metric-value">{{ comparisonData.speed }}%</span>
                        </div>
                        <div class="metric-item">
                          <span class="metric-label">دقت:</span>
                          <div class="metric-bar">
                            <div class="metric-fill" :style="`width: ${comparisonData.accuracy}%`"></div>
                          </div>
                          <span class="metric-value">{{ comparisonData.accuracy }}%</span>
                        </div>
                        <div class="metric-item">
                          <span class="metric-label">مشارکت:</span>
                          <div class="metric-bar">
                            <div class="metric-fill" :style="`width: ${comparisonData.participation}%`"></div>
                          </div>
                          <span class="metric-value">{{ comparisonData.participation }}%</span>
                        </div>
                        <div class="metric-item">
                          <span class="metric-label">ثبات:</span>
                          <div class="metric-bar">
                            <div class="metric-fill" :style="`width: ${comparisonData.consistency}%`"></div>
                          </div>
                          <span class="metric-value">{{ comparisonData.consistency }}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- تحلیل زمان و سختی -->
          <div class="row mb-4">
            <div class="col-lg-6">
              <div class="modern-card animate-fade-in" style="animation-delay: 0.5s;">
                <div class="modern-card-header bg-primary text-white">
                  <h6 class="mb-0">
                    <i class="fas fa-clock me-2"></i>
                    تحلیل زمان بر اساس نوع محتوا
                  </h6>
                </div>
                <div class="modern-card-body">
                  <div class="chart-container">
                    <Charts
                        type="activity"
                        :data="timeAnalysisData"
                        height="300px"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div class="col-lg-6">
              <div class="modern-card animate-fade-in" style="animation-delay: 0.6s;">
                <div class="modern-card-header bg-danger text-white">
                  <h6 class="mb-0">
                    <i class="fas fa-brain me-2"></i>
                    تحلیل سختی موضوعات
                  </h6>
                </div>
                <div class="modern-card-body">
                  <div class="chart-container">
                    <Charts
                        type="scores"
                        :data="difficultyAnalysisData"
                        height="300px"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- تحلیل تفصیلی عملکرد -->
          <div class="modern-card animate-fade-in mb-4" style="animation-delay: 0.7s;">
            <div class="modern-card-header bg-dark text-white">
              <h5 class="mb-0">
                <i class="fas fa-list-alt me-2"></i>
                تحلیل تفصیلی عملکرد
              </h5>
            </div>
            <div class="modern-card-body">
              <div class="row">
                <div class="col-lg-6">
                  <h6 class="section-title">
                    <i class="fas fa-clock me-2"></i>
                    تحلیل زمان
                  </h6>
                  <div class="time-analysis">
                    <div class="time-item">
                      <div class="time-label">میانگین زمان هر درس</div>
                      <div class="time-value">{{ formatTime(studentAnalytics.averageTimePerLesson) }}</div>
                    </div>
                    <div class="time-item">
                      <div class="time-label">میانگین زمان هر آزمون</div>
                      <div class="time-value">{{ formatTime(studentAnalytics.averageTimePerExam) }}</div>
                    </div>
                    <div class="time-item">
                      <div class="time-label">کل زمان مطالعه</div>
                      <div class="time-value">{{ formatTime(studentAnalytics.totalStudyTime) }}</div>
                    </div>
                    <div class="time-item">
                      <div class="time-label">آخرین فعالیت</div>
                      <div class="time-value">{{ formatDate(studentAnalytics.lastAccessed) }}</div>
                    </div>
                  </div>
                </div>
                <div class="col-lg-6">
                  <h6 class="section-title">
                    <i class="fas fa-trophy me-2"></i>
                    دستاوردها و پیشرفت
                  </h6>
                  <div class="achievements">
                    <div class="achievement-item" :class="{ 'achieved': studentAnalytics.completedLessons >= studentAnalytics.totalLessons }">
                      <i class="fas fa-medal"></i>
                      <span>تمام درس‌ها تکمیل شده</span>
                    </div>
                    <div class="achievement-item" :class="{ 'achieved': studentAnalytics.averageExamScore >= 80 }">
                      <i class="fas fa-star"></i>
                      <span>عملکرد عالی (میانگین +80)</span>
                    </div>
                    <div class="achievement-item" :class="{ 'achieved': studentAnalytics.exercisesTaken >= 5 }">
                      <i class="fas fa-dumbbell"></i>
                      <span>علاقه‌مند به تمرین</span>
                    </div>
                    <div class="achievement-item" :class="{ 'achieved': studentAnalytics.streak >= 7 }">
                      <i class="fas fa-fire"></i>
                      <span>۷ روز پیاپی فعال</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- فعالیت‌های هفتگی و اخیر -->
          <div class="row mb-4">
            <div class="col-lg-6">
              <div class="modern-card animate-fade-in" style="animation-delay: 0.8s;">
                <div class="modern-card-header bg-info text-white">
                  <h6 class="mb-0">
                    <i class="fas fa-calendar-week me-2"></i>
                    نمای کلی فعالیت هفتگی
                  </h6>
                </div>
                <div class="modern-card-body">
                  <div class="chart-container">
                    <Charts
                        type="activity"
                        :data="weeklyActivityData"
                        height="300px"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div class="col-lg-6">
              <div class="modern-card animate-fade-in" style="animation-delay: 0.9s;">
                <div class="modern-card-header bg-success text-white">
                  <h6 class="mb-0">
                    <i class="fas fa-history me-2"></i>
                    فعالیت‌های اخیر
                  </h6>
                </div>
                <div class="modern-card-body">
                  <div class="activity-timeline">
                    <div v-for="(activity, index) in recentActivities" :key="index" class="activity-item">
                      <div class="activity-icon" :class="getActivityIconClass(activity.type)">
                        <i :class="getActivityIcon(activity.type)"></i>
                      </div>
                      <div class="activity-content">
                        <div class="activity-title">{{ activity.description }}</div>
                        <div class="activity-time">{{ formatRelativeTime(activity.timestamp) }}</div>
                      </div>
                      <div class="activity-score" v-if="activity.score">
                        <span class="modern-badge modern-badge-success">{{ activity.score }}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- رتبه‌بندی و موقعیت در کلاس -->
          <div class="modern-card animate-fade-in" style="animation-delay: 1s;">
            <div class="modern-card-header bg-warning text-white">
              <h5 class="mb-0">
                <i class="fas fa-ranking-star me-2"></i>
                موقعیت در کلاس
              </h5>
            </div>
            <div class="modern-card-body">
              <div class="row align-items-center">
                <div class="col-md-4 text-center">
                  <div class="rank-display">
                    <div class="rank-number">{{ studentAnalytics.classRank || 'N/A' }}</div>
                    <div class="rank-label">رتبه در کلاس</div>
                    <div class="rank-total">از {{ studentAnalytics.totalStudents || 0 }} نفر</div>
                  </div>
                </div>
                <div class="col-md-8">
                  <div class="rank-progress-container">
                    <h6>توزیع رتبه در کلاس</h6>
                    <div class="rank-progress-bar">
                      <div class="rank-indicator" :style="`left: ${getRankPercentage()}%`">
                        <div class="rank-tooltip">شما اینجا هستید!</div>
                      </div>
                    </div>
                    <div class="rank-scale">
                      <span>رتبه ۱</span>
                      <span>میانه</span>
                      <span>رتبه {{ studentAnalytics.totalStudents }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- حالت خالی -->
        <div v-else-if="!loading" class="empty-state">
          <div class="modern-logo large secondary mb-4">
            <i class="fas fa-user-graduate"></i>
          </div>
          <h4 class="text-muted mb-3">انتخاب دانش‌آموز</h4>
          <p class="text-muted mb-4">
            یک دوره و دانش‌آموز انتخاب کنید تا تحلیل تفصیلی فعالیت و پیگیری پیشرفت نمایش داده شود.
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
  </div>
</template>

<script>
import axios from 'axios';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
// import formMixin from '@/mixins/formMixin.js';
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
      examPerformanceData: [],
      activityDistributionData: [],
      progressTimelineData: [],
      timeAnalysisData: [],
      difficultyAnalysisData: [],
      comparisonData: {
        speed: 88,
        accuracy: 92,
        participation: 85,
        consistency: 79
      },
      weeklyActivityData: [],
      recentActivities: []
    };
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
        console.error('خطا در دریافت دوره‌های تدریس:', error);
        this.showErrorToast('خطا در بارگذاری دوره‌ها');
      }
    },
    showErrorToast(message) {
      this.$toast?.error(message);
    },

    showSuccessToast(message) {
      this.$toast?.success(message);
    },
    async fetchStudentsForCourse() {
      if (!this.selectedCourseId) {
        this.courseStudents = [];
        return;
      }

      try {
        const response = await axios.get(`/analytics/teacher/course/${this.selectedCourseId}/participation`);
        this.courseStudents = response.data;
      } catch (error) {
        console.error('خطا در دریافت دانش‌آموزان دوره:', error);
        this.showErrorToast('خطا در بارگذاری دانش‌آموزان');
      }
    },

    async fetchStudentAnalytics() {
      if (!this.selectedStudentId || !this.selectedCourseId) return;

      this.loading = true;
      try {
        this.selectedStudent = this.courseStudents.find(s => s.studentId === this.selectedStudentId);

        // دریافت تحلیل‌های دانش‌آموز
        const [performanceResponse, comparisonResponse] = await Promise.all([
          axios.get(`/analytics/student/${this.selectedStudentId}/course/${this.selectedCourseId}/detailed`),
          axios.get(`/analytics/course/${this.selectedCourseId}/student-comparison?studentId=${this.selectedStudentId}`)
        ]);

        this.studentAnalytics = {
          ...this.selectedStudent,
          ...performanceResponse.data,
          ...comparisonResponse.data
        };

        await this.generateChartData();
        await this.fetchRecentActivities();
      } catch (error) {
        console.error('خطا در دریافت تحلیل‌های دانش‌آموز:', error);
        this.showErrorToast('خطا در بارگذاری تحلیل‌های دانش‌آموز');
      } finally {
        this.loading = false;
      }
    },

    async generateChartData() {
      // تولید داده‌های نمودار عملکرد آزمون‌ها
      this.examPerformanceData = [
        { date: '1403/09/01', views: 15, submissions: 8, completions: 6 },
        { date: '1403/09/08', views: 22, submissions: 12, completions: 10 },
        { date: '1403/09/15', views: 18, submissions: 15, completions: 12 },
        { date: '1403/09/22', views: 28, submissions: 18, completions: 16 },
        { date: '1403/09/29', views: 32, submissions: 22, completions: 20 }
      ];

      // تولید داده‌های توزیع فعالیت
      this.activityDistributionData = [
        { range: '90-100', count: 8 },
        { range: '80-89', count: 12 },
        { range: '70-79', count: 6 },
        { range: '60-69', count: 4 },
        { range: '0-59', count: 2 }
      ];

      // تولید تایم‌لاین پیشرفت
      this.progressTimelineData = this.generateProgressTimeline();

      // تولید داده‌های تحلیل زمان
      this.timeAnalysisData = [
        { date: '1403/09/01', views: 45, submissions: 28, completions: 22 },
        { date: '1403/09/08', views: 52, submissions: 35, completions: 30 },
        { date: '1403/09/15', views: 38, submissions: 32, completions: 28 },
        { date: '1403/09/22', views: 48, submissions: 38, completions: 35 },
        { date: '1403/09/29', views: 55, submissions: 42, completions: 38 }
      ];

      // تولید داده‌های تحلیل سختی
      this.difficultyAnalysisData = [
        { range: 'آسان', count: 15 },
        { range: 'متوسط', count: 18 },
        { range: 'سخت', count: 8 },
        { range: 'خیلی سخت', count: 3 }
      ];

      // تولید داده‌های فعالیت هفتگی
      this.weeklyActivityData = [
        { date: 'هفته ۱', views: 120, submissions: 85, completions: 72 },
        { date: 'هفته ۲', views: 135, submissions: 92, completions: 80 },
        { date: 'هفته ۳', views: 148, submissions: 105, completions: 88 },
        { date: 'هفته ۴', views: 162, submissions: 118, completions: 95 }
      ];
    },

    generateProgressTimeline() {
      const timeline = [];
      const today = new Date();

      for (let i = 30; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);

        timeline.push({
          date: this.formatDate(date.toISOString()),
          views: Math.min(100, (30 - i) * 3 + Math.random() * 10),
          submissions: Math.min(80, (30 - i) * 2.5 + Math.random() * 8),
          completions: Math.min(60, (30 - i) * 2 + Math.random() * 6)
        });
      }

      return timeline;
    },

    async fetchRecentActivities() {
      try {
        const response = await axios.get(`/analytics/student/${this.selectedStudentId}/activity-timeline`);
        this.recentActivities = response.data || [];
      } catch (error) {
        console.error('Error fetching student activities:', error);
        // Fallback to mock data if needed
        this.recentActivities = [];
      }
    },
    async fetchStudentExamPerformance() {
      try {
        const response = await axios.get(`/analytics/student/${this.selectedStudentId}/exam-performance`);
        return response.data || [];
      } catch (error) {
        console.error('Error fetching exam performance:', error);
        return [];
      }
    },
    async fetchStudentTimeAnalysis() {
      try {
        const response = await axios.get(`/analytics/student/${this.selectedStudentId}/time-analysis`);
        return response.data || [];
      } catch (error) {
        console.error('Error fetching time analysis:', error);
        return [];
      }
    },
    getProgressClass(percentage) {
      if (percentage >= 90) return 'excellent';
      if (percentage >= 70) return 'good';
      if (percentage >= 50) return 'average';
      return 'poor';
    },

    getActivityIconClass(type) {
      switch (type) {
        case 'LESSON_COMPLETION': return 'activity-lesson';
        case 'EXAM_SUBMISSION': return 'activity-exam';
        case 'EXERCISE_COMPLETION': return 'activity-exercise';
        case 'CONTENT_VIEW': return 'activity-content';
        default: return 'activity-default';
      }
    },

    getActivityIcon(type) {
      switch (type) {
        case 'LESSON_COMPLETION': return 'fas fa-book-open';
        case 'EXAM_SUBMISSION': return 'fas fa-clipboard-check';
        case 'EXERCISE_COMPLETION': return 'fas fa-dumbbell';
        case 'CONTENT_VIEW': return 'fas fa-eye';
        default: return 'fas fa-circle';
      }
    },

    formatRelativeTime(timestamp) {
      const now = new Date();
      const diff = now - new Date(timestamp);
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const days = Math.floor(hours / 24);

      if (days > 0) return `${days} روز قبل`;
      if (hours > 0) return `${hours} ساعت قبل`;
      return 'همین الان';
    },
    getRankPercentage() {
      if (!this.studentAnalytics.classRank || !this.studentAnalytics.totalStudents) return 50;
      return ((this.studentAnalytics.classRank - 1) / (this.studentAnalytics.totalStudents - 1)) * 100;
    }
  }
}
</script>

<style scoped>
.progress-circle-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.progress-circle {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 8px solid;
  background: rgba(255, 255, 255, 0.1);
}

.progress-circle.excellent {
  border-color: #27ae60;
  color: #27ae60;
}

.progress-circle.good {
  border-color: #3498db;
  color: #3498db;
}

.progress-circle.average {
  border-color: #f39c12;
  color: #f39c12;
}

.progress-circle.poor {
  border-color: #e74c3c;
  color: #e74c3c;
}

.progress-text {
  text-align: center;
}

.progress-number {
  font-size: 1.8rem;
  font-weight: 700;
  line-height: 1;
}

.progress-label {
  font-size: 0.8rem;
  font-weight: 500;
  margin-top: 0.25rem;
}

.chart-container {
  display: flex;
  justify-content: center;
  width: 100%;
  overflow-x: auto;
}

.time-analysis {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.time-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: rgba(102, 126, 234, 0.05);
  border-radius: 8px;
  border-right: 4px solid #667eea;
}

.time-label {
  font-weight: 600;
  color: #495057;
}

.time-value {
  font-weight: 700;
  color: #667eea;
}

.achievements {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.achievement-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: rgba(108, 117, 125, 0.1);
  border-radius: 8px;
  color: #6c757d;
  transition: all 0.3s ease;
}

.achievement-item.achieved {
  background: rgba(39, 174, 96, 0.1);
  color: #27ae60;
  border-right: 4px solid #27ae60;
}

.achievement-item i {
  font-size: 1.2rem;
}

.activity-timeline {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 300px;
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

.activity-time {
  font-size: 0.85rem;
  color: #6c757d;
}

.activity-score {
  margin-right: auto;
}

.comparison-radar {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 1.5rem;
  height: 100%;
}

.radar-metrics {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.metric-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.metric-label {
  min-width: 80px;
  font-size: 0.9rem;
  color: white;
}

.metric-bar {
  flex: 1;
  height: 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  overflow: hidden;
}

.metric-fill {
  height: 100%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.metric-value {
  min-width: 50px;
  font-weight: 600;
  color: white;
  text-align: left;
}

.rank-display {
  text-align: center;
}

.rank-number {
  font-size: 3rem;
  font-weight: 700;
  color: #667eea;
  line-height: 1;
}

.rank-label {
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  margin-top: 0.5rem;
}

.rank-total {
  font-size: 0.9rem;
  color: #666;
  margin-top: 0.25rem;
}

.rank-progress-container {
  padding: 1rem;
}

.rank-progress-bar {
  position: relative;
  height: 8px;
  background: linear-gradient(to left, #e74c3c, #f39c12, #f1c40f, #2ecc71, #27ae60);
  border-radius: 4px;
  margin: 1rem 0;
}

.rank-indicator {
  position: absolute;
  top: -8px;
  width: 24px;
  height: 24px;
  background: #667eea;
  border-radius: 50%;
  border: 3px solid white;
  transform: translateX(-50%);
  cursor: pointer;
}

.rank-tooltip {
  position: absolute;
  top: -35px;
  left: 50%;
  transform: translateX(-50%);
  background: #333;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.7rem;
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.rank-indicator:hover .rank-tooltip {
  opacity: 1;
}

.rank-scale {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: #666;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
}

.empty-state-features {
  max-width: 400px;
  margin: 0 auto;
}

.feature-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  text-align: right;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.feature-item i {
  font-size: 1.25rem;
  width: 24px;
  text-align: center;
}

/* Responsive */
@media (max-width: 768px) {
  .chart-container {
    overflow-x: scroll;
  }

  .time-item,
  .activity-item {
    flex-direction: column;
    text-align: center;
    gap: 0.5rem;
  }

  .progress-circle {
    width: 100px;
    height: 100px;
  }

  .progress-number {
    font-size: 1.5rem;
  }

  .rank-progress-container {
    padding: 0.5rem;
  }

  .metric-item {
    flex-direction: column;
    gap: 0.5rem;
  }

  .metric-bar {
    width: 100%;
  }
}
</style>