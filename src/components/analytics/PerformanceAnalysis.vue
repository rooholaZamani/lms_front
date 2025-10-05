<template>
  <div class="performance-analysis">
    <!-- Header -->
    <div class="modern-card mb-4">
      <div class="card-body">
        <div class="row align-items-center">
          <div class="col-md-6">
            <h5 class="mb-0">
              <i class="fas fa-chart-line me-2"></i>
              تحلیل عملکرد درس
            </h5>
          </div>
          <div class="col-md-6">
            <div class="d-flex gap-2">
              <!-- انتخاب درس -->
              <select
                  v-model="selectedCourse"
                  class="form-select"
                  @change="onCourseChange"
              >
                <option value="">انتخاب درس</option>
                <option
                    v-for="course in courses"
                    :key="course.id"
                    :value="course.id"
                >
                  {{ course.title }}
                </option>
              </select>


              <!-- نوع تحلیل -->
              <select v-model="analysisType" class="form-select">
                <option value="progress">تحلیل آزمون</option>
                <option value="time">زمان مطالعه</option>
                <option value="questions">سوالات دشوار</option>
                <option value="risk">دانش‌آموزان در معرض خطر</option>
                <option value="trend">روند کلی</option>
              </select>


              <!-- انتخاب دوره زمانی -->
              <select v-if="analysisType==='time'" v-model="selectedPeriod" class="form-select" @change="fetchAnalyticsData">
                <option value="week">هفته گذشته</option>
                <option value="month">ماه گذشته</option>
                <option value="quarter">سه ماه گذشته</option>
              </select>


            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-5">
      <LoadingSpinner />
      <p class="text-muted mt-2">در حال بارگذاری داده‌ها...</p>
    </div>

    <!-- Error -->
    <div v-if="error && !loading" class="alert alert-danger">
      <i class="fas fa-exclamation-triangle me-2"></i>
      {{ error }}
    </div>

    <!-- Main Content -->
    <div v-if="!loading && !error && selectedCourse">
      <!-- آمار کلی درس -->
      <div class="row mb-4">
        <div class="col-md-3">
          <div class="modern-card stat-card">
            <div class="card-body text-center">
              <i class="fas fa-users stat-icon text-primary"></i>
              <h4 class="stat-number">{{ courseStats.totalStudents }}</h4>
              <p class="stat-label">تعداد دانش‌آموزان</p>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="modern-card stat-card">
            <div class="card-body text-center">
              <i class="fas fa-chart-line stat-icon text-success"></i>
              <h4 class="stat-number">{{ courseStats.passingRate }}%</h4>
              <p class="stat-label"> نرخ قبولی</p>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="modern-card stat-card">
            <div class="card-body text-center">
              <i class="fas fa-clock stat-icon text-warning"></i>
              <h4 class="stat-number">{{ formatTime(courseStats.averageTimeSpent) }}</h4>
              <p class="stat-label">میانگین زمان مطالعه</p>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="modern-card stat-card">
            <div class="card-body text-center">
              <i class="fas fa-check-circle stat-icon text-info"></i>
              <h4 class="stat-number">{{ courseStats.averageExamScore }}%</h4>
              <p class="stat-label"> میانگین نمره آزمون</p>
            </div>
          </div>
        </div>
      </div>

      <!-- تحلیل پیشرفت -->
      <div v-if="analysisType === 'progress'" class="row">
        <div class="col-md-8">
          <div class="modern-card">
            <div class="card-body">
              <h6 class="card-title mb-3">نمودار میانگین نمرات آزمون</h6>

              <!-- Tab Navigation for Courses -->
              <ul class="nav nav-pills mb-3 course-tabs" role="tablist">
                <li class="nav-item" role="presentation">
                  <button
                    class="nav-link"
                    :class="{ active: selectedCourseTab === 'all' }"
                    @click="selectedCourseTab = 'all'"
                    type="button"
                  >
                    همه دوره‌ها
                  </button>
                </li>
                <li
                  v-for="course in courses"
                  :key="course.id"
                  class="nav-item"
                  role="presentation"
                >
                  <button
                    class="nav-link"
                    :class="{ active: selectedCourseTab === course.id }"
                    @click="selectedCourseTab = course.id"
                    type="button"
                  >
                    {{ course.title }}
                  </button>
                </li>
              </ul>

              <!-- Chart Container -->
              <div class="chart-container">
                <Charts
                    v-if="progressChartData.length > 0"
                    type="scores"
                    :data="progressChartData"
                    height="400px"
                />
                <div v-else class="text-center py-4">
                  <i class="fas fa-chart-bar text-muted"></i>
                  <p class="text-muted mt-2">داده‌ای برای نمایش وجود ندارد</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="modern-card">
            <div class="card-body">
              <h6 class="card-title">توزیع آزمون ها</h6>
              <div class="progress-distribution">
                <div class="progress-item">
                  <span class="progress-label">بسیار آسان (90-100%)</span>
                  <span class="progress-count">{{ progressDistribution.excellent }}</span>
                </div>
                <div class="progress-item">
                  <span class="progress-label">آسان (70-89%)</span>
                  <span class="progress-count">{{ progressDistribution.good }}</span>
                </div>
                <div class="progress-item">
                  <span class="progress-label">متوسط (50-69%)</span>
                  <span class="progress-count">{{ progressDistribution.average }}</span>
                </div>
                <div class="progress-item">
                  <span class="progress-label">سخت (زیر 50%)</span>
                  <span class="progress-count">{{ progressDistribution.poor }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- تحلیل زمان مطالعه -->
      <div v-if="analysisType === 'time'" class="row">
        <div class="col-md-8">
          <div class="modern-card">
            <div class="card-body">
              <h6 class="card-title">توزیع زمان مطالعه</h6>
              <div class="chart-container">
                <Charts
                    v-if="timeDistributionChartData.length > 0"
                    type="timeDistribution"
                    :data="timeDistributionChartData"
                    height="400px"
                />
                <div v-else class="text-center py-4">
                  <i class="fas fa-clock text-muted"></i>
                  <p class="text-muted mt-2">داده‌ای برای نمایش وجود ندارد</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="modern-card">
            <div class="card-body">
              <h6 class="card-title">آمار زمانی</h6>
              <div class="time-stats">
                <div class="stat-item">
                  <span class="stat-label">کل زمان مطالعه</span>
                  <span class="stat-value">{{ formatTime(timeStats.totalStudyTime) }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">فعالیت کم (< 1 ساعت)</span>
                  <span class="stat-value">{{ timeDistribution.ranges[0]?.studentCount || 0  }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">فعالیت متوسط (1-3 ساعت) </span>
                  <span class="stat-value">{{ timeDistribution.ranges[1]?.studentCount || 0  }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">فعالیت زیاد (3-5 ساعت) </span>
                  <span class="stat-value">{{ timeDistribution.ranges[2]?.studentCount || 0  }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">"فعالیت بسیار زیاد (> 5 ساعت) </span>
                  <span class="stat-value">{{ timeDistribution.ranges[3]?.studentCount || 0  }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- سوالات چالش‌برانگیز -->
      <div v-if="analysisType === 'questions'" class="row">
        <div class="col-md-8">
          <div class="modern-card">
            <div class="card-body">
              <h6 class="card-title">سوالات چالش‌برانگیز</h6>
              <div class="challenging-questions">
                <div
                    v-if="challengingQuestions.length > 0"
                    v-for="question in challengingQuestions"
                    :key="question.id"
                    class="question-item"
                >
                  <div class="question-info">
                    <h6>{{ question.examTitle || question.topic || 'سوال' }}</h6>
                    <p>{{ question.questionText || question.lessonTitle || 'متن سوال در دسترس نیست' }}</p>
                    <div class="question-stats">
                      <span class="stat">
                        <i class="fas fa-users"></i>
                        {{ question.totalAttempts || 0 }} تلاش
                      </span>
                      <span class="stat">
                        <i class="fas fa-percent"></i>
                        {{ Math.round(100 - (question.errorRate || 0)) }}% موفقیت
                      </span>
                      <span class="stat difficulty">
                        <i class="fas fa-exclamation-triangle"></i>
                        سختی: {{ Math.round((question.difficulty || 0) * 100) / 100 }}
                      </span>
                    </div>
                  </div>
                </div>
                <div v-else class="text-center py-4">
                  <i class="fas fa-question-circle fa-2x text-muted mb-2"></i>
                  <p class="text-muted">سوال چالش‌برانگیزی در این دوره یافت نشد</p>
                  <small class="text-muted">این می‌تواند نشان‌دهنده عملکرد خوب دانش‌آموزان باشد</small>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="modern-card">
            <div class="card-body">
              <h6 class="card-title">آمار سوالات</h6>
              <div class="question-stats-summary">
                <div class="stat-item">
                  <span class="stat-label">سخت‌ترین سوال</span>
                  <span class="stat-value">{{ questionStats.mostDifficult }}%</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">میانگین سختی</span>
                  <span class="stat-value">{{ questionStats.averageDifficulty }}%</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">نیاز به بازبینی</span>
                  <span class="stat-value">{{ questionStats.needsReview }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- دانش‌آموزان در معرض خطر -->
      <div v-if="analysisType === 'risk'" class="row">
        <div class="col-md-8">
          <div class="modern-card">
            <div class="card-body">
              <h6 class="card-title">دانش‌آموزان در معرض خطر</h6>
              <div class="at-risk-students">
                <div
                    v-if="atRiskStudents.length > 0"
                    v-for="student in atRiskStudents"
                    :key="student.id"
                    class="student-item"
                    :class="'risk-' + student.riskLevel.toLowerCase()"
                >
                  <div class="student-info">
                    <div class="student-header">
                      <div class="student-name">{{ student.firstName }} {{ student.lastName }}</div>
                      <div class="risk-score-badge" :class="'risk-' + student.riskLevel.toLowerCase()">
                        {{ student.riskScore }}% خطر
                        <span class="risk-level">{{ getRiskLevelLabel(student.riskLevel) }}</span>
                      </div>
                    </div>

                    <!-- نمایش عوامل خطر وزن‌دار -->
                    <div class="weighted-factors">
                      <div class="factor-item" v-if="student.factors.progressFactor > 0">
                        <span class="factor-label">پیشرفت تحصیلی:</span>
                        <span class="factor-score">{{ student.factors.progressFactor }}% (وزن ۵۰%)</span>
                        <div class="factor-detail">
                          دانش‌آموز: {{ student.studentMetrics.progress.toFixed(1) }}% |
                          میانگین کلاس: {{ student.courseAverages.avgProgress.toFixed(1) }}%
                        </div>
                      </div>

                      <div class="factor-item" v-if="student.factors.gradeFactor > 0">
                        <span class="factor-label">میانگین نمرات:</span>
                        <span class="factor-score">{{ student.factors.gradeFactor }}% (وزن ۳۵%)</span>
                        <div class="factor-detail">
                          دانش‌آموز: {{ student.studentMetrics.averageGrade.toFixed(1) }} |
                          میانگین کلاس: {{ student.courseAverages.avgGrade.toFixed(1) }}
                        </div>
                      </div>

                      <div class="factor-item" v-if="student.factors.attendanceFactor > 0">
                        <span class="factor-label">روزهای حضور:</span>
                        <span class="factor-score">{{ student.factors.attendanceFactor }}% (وزن ۱۵%)</span>
                        <div class="factor-detail">
                          دانش‌آموز: {{ student.studentMetrics.attendanceDays }} روز |
                          میانگین کلاس: {{ student.courseAverages.avgAttendance.toFixed(1) }} روز
                        </div>
                      </div>
                    </div>

                    <!-- نمایش پیشرفت‌بار امتیاز خطر -->
                    <div class="risk-progress">
                      <div class="progress">
                        <div
                          class="progress-bar"
                          :class="'bg-' + getRiskColor(student.riskLevel)"
                          :style="{ width: student.riskScore + '%' }"
                        ></div>
                      </div>
                      <small class="text-muted">امتیاز خطر: {{ student.riskScore }}% از ۱۰۰%</small>
                    </div>
                  </div>
                </div>
                <div v-else class="text-center py-4">
                  <i class="fas fa-shield-alt fa-2x text-success mb-2"></i>
                  <p class="text-muted">دانش‌آموز در معرض خطری شناسایی نشد</p>
                  <small class="text-muted">همه دانش‌آموزان عملکرد مناسبی دارند</small>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="modern-card">
            <div class="card-body">
              <h6 class="card-title">آمار کلی خطر</h6>
              <div class="risk-summary">
                <div class="stat-item">
                  <span class="stat-label">تعداد کل دانش‌آموزان</span>
                  <span class="stat-value">{{ courseStats.totalStudents }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">در معرض خطر</span>
                  <span class="stat-value text-danger">{{ courseStats.atRiskCount }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">میانگین امتیاز خطر</span>
                  <span class="stat-value">{{ courseStats.averageRiskScore }}%</span>
                </div>
              </div>

              <h6 class="card-title mt-4">سطح خطر</h6>
              <div class="risk-level-counts">
                <div class="risk-level-item" v-for="(count, level) in riskLevelCounts" :key="level">
                  <span class="level-label" :class="'text-' + getRiskColor(level)">
                    {{ getRiskLevelLabel(level) }}
                  </span>
                  <span class="level-count">{{ count }}</span>
                </div>
              </div>

              <h6 class="card-title mt-4">میانگین کلاس</h6>
              <div class="course-averages">
                <div class="avg-item">
                  <span class="avg-label">پیشرفت:</span>
                  <span class="avg-value">{{ courseAverages.avgProgress?.toFixed(1) }}%</span>
                </div>
                <div class="avg-item">
                  <span class="avg-label">نمره:</span>
                  <span class="avg-value">{{ courseAverages.avgGrade?.toFixed(1) }}</span>
                </div>
                <div class="avg-item">
                  <span class="avg-label">حضور:</span>
                  <span class="avg-value">{{ courseAverages.avgAttendance?.toFixed(1) }} روز</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- تحلیل روند -->
      <div v-if="analysisType === 'trend'" class="row">
        <div class="col-12">
          <div class="modern-card">
            <div class="card-body">
              <h6 class="card-title">روند کلی عملکرد</h6>
              <div class="chart-container">
                <Charts
                    v-if="trendChartData.length > 0"
                    type="activity"
                    :data="trendChartData"
                    height="500px"
                />
                <div v-else class="text-center py-4">
                  <i class="fas fa-chart-line text-muted"></i>
                  <p class="text-muted mt-2">داده‌ای برای نمایش روند وجود ندارد</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- No Course Selected -->
    <div v-if="!loading && !selectedCourse" class="text-center py-5">
      <i class="fas fa-chart-bar fa-3x text-muted mb-3"></i>
      <h5 class="text-muted">انتخاب درس</h5>
      <p class="text-muted">برای مشاهده تحلیل عملکرد، ابتدا یک درس انتخاب کنید</p>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';
import { useAnalytics } from '@/composables/useAnalytics';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import Charts from '@/components/charts/Charts.vue';
import axios from 'axios';

export default {
  name: 'PerformanceAnalysis',
  components: {
    LoadingSpinner,
    Charts
  },
  setup() {
    // Analytics composable
    const analytics = useAnalytics();

    // Reactive state
    const loading = ref(false);
    const error = ref(null);
    const selectedCourse = ref('');
    const selectedPeriod = ref('month');
    const analysisType = ref('progress');
    const selectedCourseTab = ref('all'); // 'all' or courseId

    // Course data
    const courses = ref([]);
    const courseStats = ref({
      totalStudents: 0,
      averageProgress: 0,
      averageTimeSpent: 0,
      completionRate: 0,
      passingRate: 0,
      averageExamScore: 0
    });

    // Progress analysis data
    const lessonProgress = ref([]);
    const lessonsByCourse = ref({}); // Grouped by course
    const allLessons = ref([]); // All lessons combined
    const progressDistribution = ref({
      excellent: 0,
      good: 0,
      average: 0,
      poor: 0
    });

    // Time analysis data
    const timeDistributionData = ref([]);
    const timeDistribution = ref({
      ranges: []
    });

    const timeStats = ref({
      totalStudyTime: 0,
      averageDailyTime: 0,
      maxDailyTime: 0,
      minDailyTime: 0
    });

    // Challenging questions data
    const challengingQuestions = ref([]);
    const questionStats = ref({
      mostDifficult: 0,
      averageDifficulty: 0,
      needsReview: 0
    });

    // At-risk students data (updated for weighted scoring)
    const atRiskStudents = ref([]);
    const riskLevelCounts = ref({});
    const courseAverages = ref({
      avgProgress: 0,
      avgGrade: 0,
      avgAttendance: 0
    });

    // Trend analysis data
    const trendData = ref([]);

    // Computed chart data
    const progressChartData = computed(() => {
      let dataToProcess = [];

      // Choose data based on selected tab
      if (selectedCourseTab.value === 'all') {
        dataToProcess = allLessons.value || [];
      } else {
        // Find lessons for specific course
        const courseName = courses.value.find(c => c.id === selectedCourseTab.value)?.title;
        dataToProcess = lessonsByCourse.value[courseName] || [];
      }

      if (!dataToProcess || dataToProcess.length === 0) {
        console.log('No lesson progress data available for selected tab');
        return [];
      }

      console.log('Processing lesson progress data:', dataToProcess);

      return dataToProcess.map(lesson => ({
        label: lesson.lesson || lesson.title || lesson.name,
        score: lesson.avgScore || lesson.averageScore || 0,
        difficulty: lesson.difficulty || 'متوسط',
        completionRate: lesson.completionRate || 0,
        studentFeedback: lesson.studentFeedback || 0,
        courseTitle: lesson.courseTitle || ''
      }));
    });

    const timeDistributionChartData = computed(() => {
      if (!timeDistributionData.value || timeDistributionData.value.length === 0) {
        console.log('No time distribution data available');
        return [];
      }

      console.log('Processing time distribution data:', timeDistributionData.value);

      return timeDistributionData.value.map(item => ({
        date: item.date,
        activeStudents: item.activeStudents || 0,
        totalseconds: item.totalseconds || 0,
        totalTime: Math.round((item.totalseconds || 0) / 60) // زمان بر حسب دقیقه
      }));
    });

    const trendChartData = computed(() => {
      if (!trendData.value || trendData.value.length === 0) {
        console.log('No trend data available');
        return [];
      }

      console.log('Processing trend data:', trendData.value);

      return trendData.value.map(item => ({
        date: item.date,
        contentViews: item.contentViews || 0,
        logins: item.logins || 0,
        examSubmissions: item.examSubmissions || 0,
        assignmentSubmissions: item.assignmentSubmissions || 0,
        avgSessionTime: item.avgSessionTime || 0
      }));
    });

    // Methods
    const formatTime = (seconds) => {
      if (!seconds) return '0 ثانیه';

      const hours = Math.floor(seconds / 3600);
      const mins = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;

      let result = [];
      if (hours > 0) result.push(`${hours} ساعت`);
      if (mins > 0) result.push(`${mins} دقیقه`);
      if (secs > 0) result.push(`${secs} ثانیه`);

      return result.join(' ');
    };


    const formatDuration = (seconds) => {
      if (!seconds) return '0 ثانیه';
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const remainingSeconds = seconds % 60;
      
      if (hours > 0) {
        return `${hours}ساعت ${minutes}دقیقه`;
      } else if (minutes > 0) {
        return `${minutes}دقیقه ${remainingSeconds}ثانیه`;
      }
      return `${remainingSeconds}ثانیه`;
    };

    const getRiskFactorLabel = (factor) => {
      const labels = {
        'LOWATTENDANCE': 'حضور پایین',
        'POORPERFORMANCE': 'عملکرد ضعیف',
        'INACTIVITY': 'عدم فعالیت',
        'BEHAVIORALISSUES': 'مشکلات رفتاری'
      };
      return labels[factor] || factor;
    };

    const getRiskLevelLabel = (level) => {
      const labels = {
        'HIGH': 'خطر بالا',
        'MEDIUM': 'خطر متوسط',
        'LOW': 'خطر پایین',
        'NONE': 'بدون خطر'
      };
      return labels[level] || level;
    };

    const getRiskColor = (level) => {
      const colors = {
        'HIGH': 'danger',
        'MEDIUM': 'warning',
        'LOW': 'info',
        'NONE': 'success'
      };
      return colors[level] || 'secondary';
    };

    const fetchCourses = async () => {
      try {
        const response = await axios.get('/courses/teaching');
        courses.value = response.data || [];
      } catch (err) {
        console.error('Error fetching courses:', err);
        error.value = 'خطا در دریافت لیست دروس';
      }
    };

    const fetchAnalyticsData = async () => {
      if (!selectedCourse.value) return;

      loading.value = true;
      error.value = null;

      try {
        console.log(`Fetching analytics for course: ${selectedCourse.value}, type: ${analysisType.value}`);

        // 1. دریافت آمار کلی درس - استفاده از API صحیح
        try {
          const coursePerformanceResponse = await analytics.fetchCoursePerformance(selectedCourse.value);
          if (coursePerformanceResponse) {
            courseStats.value = {
              totalStudents: coursePerformanceResponse.totalStudents || coursePerformanceResponse.studentCount || 0,
              averageProgress: Math.round(coursePerformanceResponse.averageProgress || 0),
              averageTimeSpent: coursePerformanceResponse.averageTimeSpent || 0,
              completionRate: Math.round(coursePerformanceResponse.completionRate || 0),
              passingRate: coursePerformanceResponse.passingRate || 0,
              averageExamScore: coursePerformanceResponse.averageExamScore || 0

            };
          } else {
            // Fallback values when no data is returned
            courseStats.value = {
              totalStudents: 0,
              averageProgress: 0,
              averageTimeSpent: 0,
              completionRate: 0,
              passingRate: 0,
              averageExamScore: 0
            };
          }
        } catch (err) {
          console.error('Error fetching course performance:', err);
          // Fallback values on error
          courseStats.value = {
            totalStudents: 0,
            averageProgress: 0,
            averageTimeSpent: 0,
            completionRate: 0,
            passingRate: 0,
            averageExamScore: 0
          };
        }

        // 2. دریافت داده‌ها بر اساس نوع تحلیل
        if (analysisType.value === 'progress') {
          // تحلیل پیشرفت
          const lessonResponse = await analytics.fetchLessonPerformanceAnalysis();
          console.log('Lesson response from backend:', lessonResponse);

          if (lessonResponse) {
            lessonsByCourse.value = lessonResponse.lessonsByCourse || {};
            allLessons.value = lessonResponse.allLessons || [];
            lessonProgress.value = lessonResponse.allLessons || []; // For backward compatibility
          } else {
            lessonsByCourse.value = {};
            allLessons.value = [];
            lessonProgress.value = [];
          }

          console.log('Lessons by course:', lessonsByCourse.value);
          console.log('All lessons:', allLessons.value);

          // محاسبه توزیع پیشرفت
          const total = allLessons.value.length;
          if (total > 0) {
            progressDistribution.value = {
              excellent: allLessons.value.filter(l => (l.avgScore || 0) >= 90).length,
              good: allLessons.value.filter(l => (l.avgScore || 0) >= 70 && (l.avgScore || 0) < 90).length,
              average: allLessons.value.filter(l => (l.avgScore || 0) >= 50 && (l.avgScore || 0) < 70).length,
              poor: allLessons.value.filter(l => (l.avgScore || 0) < 50).length
            };
          }

        } else if (analysisType.value === 'time') {
          // تحلیل زمان
          const timeResponse = await analytics.fetchTimeDistribution(selectedCourse.value, selectedPeriod.value);
          console.log('Time distribution response:', timeResponse);

          if (timeResponse && timeResponse.timeline) {
            timeDistributionData.value = timeResponse.timeline.sort((a, b) => new Date(a.date) - new Date(b.date));

            // محاسبه آمار زمانی
            const totalActiveStudents = timeResponse.timeline.reduce((sum, day) => sum + (day.activeStudents || 0), 0);
            timeStats.value = {
              totalStudyTime: timeResponse.timeline.reduce((sum, day) => sum + (day.totalseconds || 0), 0),
              averageDailyTime: totalActiveStudents > 0 ? Math.round(totalActiveStudents / timeResponse.timeline.length) : 0,
              maxDailyTime: Math.max(...timeResponse.timeline.map(day => day.activeStudents || 0)),
              minDailyTime: Math.min(...timeResponse.timeline.map(day => day.activeStudents || 0))
            };

            timeDistribution.value = timeResponse.timeDistribution || { ranges: [] };
          }

        } else if (analysisType.value === 'questions') {
          // تحلیل سوالات چالش‌برانگیز
          try {
            const questionsResponse = await axios.get(`/analytics/course/${selectedCourse.value}/challenging-questions`);
            challengingQuestions.value = questionsResponse.data?.challengingQuestions || [];

            if (challengingQuestions.value.length > 0) {
              questionStats.value = {
                mostDifficult: questionsResponse.data?.summary?.maxDifficulty || Math.max(...challengingQuestions.value.map(q => q.difficulty || 0)),
                averageDifficulty: questionsResponse.data?.summary?.averageDifficulty || challengingQuestions.value.reduce((sum, q) => sum + (q.difficulty || 0), 0) / challengingQuestions.value.length,
                needsReview: questionsResponse.data?.summary?.questionsNeedingReview || challengingQuestions.value.filter(q => (q.errorRate || 0) > 80).length
              };
            } else {
              questionStats.value = {
                mostDifficult: 0,
                averageDifficulty: 0,
                needsReview: 0
              };
            }
          } catch (questionErr) {
            console.error('Error fetching challenging questions:', questionErr);
            challengingQuestions.value = [];
            questionStats.value = {
              mostDifficult: 0,
              averageDifficulty: 0,
              needsReview: 0
            };
          }

        } else if (analysisType.value === 'risk') {
          // دانش‌آموزان در معرض خطر (weighted scoring system)
          try {
            const riskResponse = await axios.get(`/analytics/course/${selectedCourse.value}/at-risk-students`);
            console.log('At-risk students response (weighted):', riskResponse.data);

            if (riskResponse.data) {
              atRiskStudents.value = riskResponse.data.students || [];
              riskLevelCounts.value = riskResponse.data.riskLevelCounts || {};
              courseAverages.value = riskResponse.data.courseAverages || {
                avgProgress: 0,
                avgGrade: 0,
                avgAttendance: 0
              };

              // Update courseStats with the new structure
              if (riskResponse.data.courseStats) {
                courseStats.value = {
                  ...courseStats.value,
                  ...riskResponse.data.courseStats
                };
              }
            } else {
              atRiskStudents.value = [];
              riskLevelCounts.value = {};
              courseAverages.value = {
                avgProgress: 0,
                avgGrade: 0,
                avgAttendance: 0
              };
            }
          } catch (riskErr) {
            console.error('Error fetching at-risk students:', riskErr);
            atRiskStudents.value = [];
            riskLevelCounts.value = {};
            courseAverages.value = {
              avgProgress: 0,
              avgGrade: 0,
              avgAttendance: 0
            };
          }

        } else if (analysisType.value === 'trend') {
          // تحلیل روند
          const trendResponse = await analytics.fetchEngagementTrends();
          console.log('Engagement trends response:', trendResponse);

          if (trendResponse && Array.isArray(trendResponse)) {
            // مرتب‌سازی بر اساس تاریخ
            trendData.value = trendResponse.sort((a, b) => new Date(a.date) - new Date(b.date));
          }
        }

        console.log('Final data check:');
        console.log('- lessonProgress:', lessonProgress.value.length);
        console.log('- timeDistributionData:', timeDistributionData.value.length);
        console.log('- trendData:', trendData.value.length);
        console.log('- atRiskStudents:', atRiskStudents.value.length);

      } catch (err) {
        error.value = 'خطا در دریافت داده‌های تحلیل';
        console.error('Error fetching analytics data:', err);
      } finally {
        loading.value = false;
      }
    };

    const onCourseChange = () => {
      if (selectedCourse.value) {
        fetchAnalyticsData();
      }
    };

    // Watchers
    watch(analysisType, () => {
      if (selectedCourse.value) {
        fetchAnalyticsData();
      }
    });

    // Lifecycle
    onMounted(() => {
      fetchCourses();
    });

    return {
      // Reactive state
      loading,
      error,
      selectedCourse,
      selectedPeriod,
      analysisType,
      selectedCourseTab,

      // Data
      courses,
      courseStats,
      lessonProgress,
      lessonsByCourse,
      allLessons,
      progressDistribution,
      timeDistributionData,
      timeDistribution,
      timeStats,
      challengingQuestions,
      questionStats,
      atRiskStudents,
      riskLevelCounts,
      courseAverages,
      trendData,

      // Computed
      progressChartData,
      timeDistributionChartData,
      trendChartData,

      // Methods
      formatTime,
      formatDuration,
      getRiskFactorLabel,
      getRiskLevelLabel,
      getRiskColor,
      onCourseChange,
      fetchAnalyticsData
    };
  }
};
</script>

<style scoped>
.performance-analysis {
  padding: 1rem;
}

.modern-card {
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.9rem;
  color: #6c757d;
  margin-bottom: 0;
}

.chart-container {
  min-height: 400px;
  position: relative;
}

.progress-distribution, .time-stats, .question-stats-summary, .risk-factors-summary {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.progress-item, .stat-item, .risk-factor {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: rgba(248, 249, 250, 0.8);
  border-radius: 8px;
  border-left: 4px solid #667eea;
}

.progress-count, .stat-value, .factor-count {
  font-weight: 600;
  color: #2c3e50;
}

.challenging-questions, .at-risk-students {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 400px;
  overflow-y: auto;
}

.question-item, .student-item {
  padding: 1rem;
  background: rgba(248, 249, 250, 0.6);
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.question-stats, .student-stats {
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
  font-size: 0.85rem;
  color: #6c757d;
}

.risk-factors {
  display: flex;
  gap: 0.5rem;
  margin: 0.5rem 0;
  flex-wrap: wrap;
}

.risk-badge {
  background: #dc3545;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
}

.student-name {
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.difficulty {
  color: #dc3545;
}

/* Course Tabs Styling */
.course-tabs {
  border-bottom: 2px solid rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem !important;
}

.course-tabs .nav-link {
  color: #6c757d;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px 8px 0 0;
  background: transparent;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.course-tabs .nav-link:hover {
  color: #667eea;
  background: rgba(102, 126, 234, 0.1);
}

.course-tabs .nav-link.active {
  color: white;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
}

@media (max-width: 768px) {
  .d-flex.gap-2 {
    flex-direction: column;
  }

  .form-select {
    margin-bottom: 0.5rem;
  }

  .progress-stats, .time-stats {
    gap: 0.5rem;
  }

  .challenging-questions, .at-risk-students {
    max-height: 300px;
  }
}

/* Weighted Risk Assessment Styles */
.student-item {
  border-left-width: 4px;
  border-left-style: solid;
}

.student-item.risk-high {
  border-left-color: #dc3545;
  background: rgba(220, 53, 69, 0.05);
}

.student-item.risk-medium {
  border-left-color: #ffc107;
  background: rgba(255, 193, 7, 0.05);
}

.student-item.risk-low {
  border-left-color: #17a2b8;
  background: rgba(23, 162, 184, 0.05);
}

.student-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.risk-score-badge {
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.85rem;
  text-align: center;
  min-width: 120px;
}

.risk-score-badge.risk-high {
  background: #dc3545;
  color: white;
}

.risk-score-badge.risk-medium {
  background: #ffc107;
  color: #212529;
}

.risk-score-badge.risk-low {
  background: #17a2b8;
  color: white;
}

.risk-score-badge .risk-level {
  display: block;
  font-size: 0.7rem;
  opacity: 0.8;
}

.weighted-factors {
  margin: 1rem 0;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.factor-item {
  padding: 0.8rem;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.factor-label {
  font-weight: 600;
  color: #495057;
  margin-left: 0.5rem;
}

.factor-score {
  font-weight: 700;
  color: #dc3545;
}

.factor-detail {
  font-size: 0.8rem;
  color: #6c757d;
  margin-top: 0.4rem;
  padding-top: 0.4rem;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.risk-progress {
  margin-top: 1rem;
}

.risk-progress .progress {
  height: 8px;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.1);
}

.risk-summary {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.risk-level-counts {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.risk-level-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0.8rem;
  background: rgba(248, 249, 250, 0.8);
  border-radius: 6px;
}

.level-label {
  font-weight: 600;
}

.level-count {
  background: #495057;
  color: white;
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

.course-averages {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.avg-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.4rem 0.6rem;
  background: rgba(23, 162, 184, 0.1);
  border-radius: 6px;
}

.avg-label {
  color: #495057;
  font-weight: 500;
}

.avg-value {
  color: #17a2b8;
  font-weight: 700;
}
</style>