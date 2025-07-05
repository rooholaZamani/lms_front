<template>
  <div class="performance-analysis-container">
    <!-- Header Controls -->
    <div class="modern-card mb-4">
      <div class="card-body">
        <div class="row align-items-center">
          <div class="col-md-3">
            <label class="form-label">انتخاب درس:</label>
            <select
                v-model="selectedCourse"
                @change="updateAnalysisView"
                class="form-select"
            >
              <option value="">انتخاب کنید...</option>
              <option
                  v-for="course in courses"
                  :key="course.id"
                  :value="course.id"
              >
                {{ course.title }}
              </option>
            </select>
          </div>
          <div class="col-md-2">
            <label class="form-label">دوره زمانی:</label>
            <select
                v-model="selectedPeriod"
                @change="updateAnalysisView"
                class="form-select"
            >
              <option value="week">هفته</option>
              <option value="month">ماه</option>
              <option value="semester">ترم</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label">نوع تحلیل:</label>
            <select
                v-model="analysisType"
                @change="updateAnalysisView"
                class="form-select"
            >
              <option value="progress">پیشرفت دروس</option>
              <option value="challenging-questions">سوالات چالش‌برانگیز</option>
              <option value="at-risk-students">دانش‌آموزان در معرض خطر</option>
              <option value="trend-analysis">تحلیل روند زمانی</option>
              <option value="time-distribution">توزیع زمان مطالعه</option>
            </select>
          </div>
          <div class="col-md-4">
            <div class="btn-group mt-4">
              <button @click="refreshData" class="btn btn-outline-primary" :disabled="loading">
                <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
              </button>
              <button @click="exportData" class="btn btn-outline-success">
                <i class="fas fa-download"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <LoadingSpinner v-if="loading" />

    <!-- Error State -->
    <div v-if="error" class="alert alert-danger">
      <i class="fas fa-exclamation-triangle me-2"></i>
      {{ error }}
    </div>

    <!-- Main Content -->
    <div v-if="!loading && !error && selectedCourse">

      <!-- Course Overview Stats -->
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
              <h4 class="stat-number">{{ courseStats.averageProgress }}%</h4>
              <p class="stat-label">میانگین پیشرفت</p>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="modern-card stat-card">
            <div class="card-body text-center">
              <i class="fas fa-clock stat-icon text-warning"></i>
              <h4 class="stat-number">{{ courseStats.averageTimeSpent }}</h4>
              <p class="stat-label">میانگین زمان مطالعه (دقیقه)</p>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="modern-card stat-card">
            <div class="card-body text-center">
              <i class="fas fa-check-circle stat-icon text-info"></i>
              <h4 class="stat-number">{{ courseStats.completionRate }}%</h4>
              <p class="stat-label">نرخ تکمیل</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Progress Analysis -->
      <div v-if="analysisType === 'progress'" class="row">
        <div class="col-md-8">
          <div class="modern-card">
            <div class="card-body">
              <h6 class="card-title">پیشرفت دانش‌آموزان در دروس</h6>
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
              <h6 class="card-title">توزیع پیشرفت</h6>
              <div class="progress-distribution">
                <div class="distribution-item">
                  <span>عالی (80-100%):</span>
                  <span class="badge bg-success">{{ progressDistribution.excellent }}</span>
                </div>
                <div class="distribution-item">
                  <span>خوب (60-79%):</span>
                  <span class="badge bg-primary">{{ progressDistribution.good }}</span>
                </div>
                <div class="distribution-item">
                  <span>متوسط (40-59%):</span>
                  <span class="badge bg-warning">{{ progressDistribution.average }}</span>
                </div>
                <div class="distribution-item">
                  <span>ضعیف (<40%):</span>
                  <span class="badge bg-danger">{{ progressDistribution.poor }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Challenging Questions Analysis -->
      <div v-if="analysisType === 'challenging-questions'" class="row">
        <div class="col-md-8">
          <div class="modern-card">
            <div class="card-body">
              <h6 class="card-title">سوالات چالش‌برانگیز</h6>
              <div v-if="challengingQuestions.length > 0" class="questions-list">
                <div v-for="question in challengingQuestions" :key="question.id" class="question-item">
                  <div class="question-content">
                    <div class="question-header">
                      <h6 class="question-title">{{ question.title }}</h6>
                      <span class="badge bg-danger">دشواری: {{ question.difficultyScore }}%</span>
                    </div>
                    <p class="question-text">{{ question.text }}</p>
                    <div class="question-stats">
                      <span class="stat-item">
                        <i class="fas fa-times text-danger"></i>
                        پاسخ اشتباه: {{ question.wrongAnswers }}
                      </span>
                      <span class="stat-item">
                        <i class="fas fa-clock text-warning"></i>
                        زمان متوسط: {{ question.averageTime }}s
                      </span>
                      <span class="stat-item">
                        <i class="fas fa-users text-info"></i>
                        تعداد پاسخ: {{ question.totalAttempts }}
                      </span>
                    </div>
                  </div>
                  <div class="question-actions">
                    <button @click="viewQuestionAnalysis(question)" class="btn btn-sm btn-outline-primary">
                      <i class="fas fa-chart-line"></i> تحلیل تفصیلی
                    </button>
                    <button @click="generateQuestionHelp(question)" class="btn btn-sm btn-outline-success">
                      <i class="fas fa-lightbulb"></i> راهنمای تدریس
                    </button>
                  </div>
                </div>
              </div>
              <div v-else class="text-center py-4">
                <i class="fas fa-question-circle text-muted mb-2"></i>
                <p class="text-muted">سوال چالش‌برانگیزی یافت نشد</p>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="modern-card">
            <div class="card-body">
              <h6 class="card-title">خلاصه سوالات</h6>
              <div class="question-summary">
                <div class="stat-item">
                  <span>سخت‌ترین سوال:</span>
                  <span class="badge bg-danger">{{ questionStats.mostDifficult }}%</span>
                </div>
                <div class="stat-item">
                  <span>میانگین دشواری:</span>
                  <span class="badge bg-warning">{{ questionStats.averageDifficulty }}%</span>
                </div>
                <div class="stat-item">
                  <span>نیاز به بازنگری:</span>
                  <span class="badge bg-info">{{ questionStats.needsReview }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Time Distribution Analysis -->
      <div v-if="analysisType === 'time-distribution'" class="row">
        <div class="col-lg-8">
          <div class="modern-card">
            <div class="card-body">
              <h6 class="card-title">
                <i class="fas fa-clock me-2"></i>
                توزیع زمان مطالعه دانش‌آموزان
              </h6>
              <div class="chart-container">
                <Charts
                    v-if="timeDistributionData.length > 0"
                    type="time-distribution"
                    :data="timeDistributionData"
                    height="400px"
                />
                <div v-else class="text-center py-4">
                  <i class="fas fa-clock text-muted"></i>
                  <p class="text-muted mt-2">داده‌ای برای نمایش توزیع زمان وجود ندارد</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-lg-4">
          <div class="modern-card">
            <div class="card-body">
              <h6 class="card-title">آمار زمان مطالعه</h6>
              <div class="time-stats">
                <div class="stat-item">
                  <span>کل زمان مطالعه:</span>
                  <span class="badge bg-primary">{{ formatTotalTime(timeStats.totalStudyTime) }}</span>
                </div>
                <div class="stat-item">
                  <span>میانگین روزانه:</span>
                  <span class="badge bg-success">{{ formatTotalTime(timeStats.averageDailyTime) }}</span>
                </div>
                <div class="stat-item">
                  <span>بیشترین زمان:</span>
                  <span class="badge bg-info">{{ formatTotalTime(timeStats.maxDailyTime) }}</span>
                </div>
                <div class="stat-item">
                  <span>کمترین زمان:</span>
                  <span class="badge bg-warning">{{ formatTotalTime(timeStats.minDailyTime) }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="modern-card mt-3">
            <div class="card-body">
              <h6 class="card-title">پراکندگی ساعات مطالعه</h6>
              <div class="time-distribution-pie">
                <Charts
                    v-if="hourlyDistribution.length > 0"
                    type="pie"
                    :data="hourlyDistribution"
                    height="250px"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- جدول زمان‌بندی دانش‌آموزان -->
        <div class="col-12 mt-4">
          <div class="modern-card">
            <div class="card-body">
              <h6 class="card-title">
                <i class="fas fa-users-clock me-2"></i>
                زمان‌بندی دانش‌آموزان
              </h6>
              <div class="table-responsive">
                <table class="table table-hover">
                  <thead>
                  <tr>
                    <th>نام دانش‌آموز</th>
                    <th>کل زمان مطالعه</th>
                    <th>میانگین روزانه</th>
                    <th>بیشترین جلسه</th>
                    <th>آخرین فعالیت</th>
                    <th>وضعیت</th>
                  </tr>
                  </thead>
                  <tbody>
                  <tr v-for="student in studentTimeData" :key="student.studentId">
                    <td>
                      <div class="student-info">
                        <i class="fas fa-user-circle me-2"></i>
                        {{ student.studentName }}
                      </div>
                    </td>
                    <td>
                  <span class="badge bg-primary">
                    {{ formatTotalTime(student.totalStudyTime) }}
                  </span>
                    </td>
                    <td>{{ formatTotalTime(student.averageDailyTime) }}</td>
                    <td>{{ formatTotalTime(student.maxSessionTime) }}</td>
                    <td>{{ formatRelativeTime(student.lastActivity) }}</td>
                    <td>
                  <span class="badge" :class="getStudyStatusClass(student.status)">
                    {{ getStudyStatusText(student.status) }}
                  </span>
                    </td>
                  </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- At-Risk Students Analysis -->
      <div v-if="analysisType === 'at-risk-students'" class="row">
        <div class="col-md-8">
          <div class="modern-card">
            <div class="card-body">
              <h6 class="card-title">دانش‌آموزان در معرض خطر</h6>
              <div v-if="atRiskStudents.length > 0" class="students-list">
                <div v-for="student in atRiskStudents" :key="student.id" class="student-item">
                  <div class="student-content">
                    <div class="student-header">
                      <h6 class="student-name">{{ student.name }}</h6>
                      <span class="badge" :class="getRiskLevelClass(student.riskLevel)">
                        {{ getRiskLevelText(student.riskLevel) }}
                      </span>
                    </div>
                    <div class="risk-factors">
                      <span v-for="factor in student.riskFactors" :key="factor" class="risk-factor">
                        <i class="fas fa-exclamation-triangle text-warning"></i>
                        {{ factor }}
                      </span>
                    </div>
                  </div>
                  <div class="student-actions">
                    <button @click="viewStudentDetails(student)" class="btn btn-sm btn-outline-primary">
                      <i class="fas fa-user"></i> جزئیات
                    </button>
                    <button @click="createInterventionPlan(student)" class="btn btn-sm btn-outline-warning">
                      <i class="fas fa-hands-helping"></i> طرح مداخله
                    </button>
                    <button @click="notifyParents(student)" class="btn btn-sm btn-outline-info">
                      <i class="fas fa-envelope"></i> اطلاع والدین
                    </button>
                  </div>
                </div>
              </div>
              <div v-else class="text-center py-4">
                <i class="fas fa-shield-alt text-success mb-2"></i>
                <p class="text-muted">همه دانش‌آموزان در وضعیت مطلوبی هستند</p>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="modern-card">
            <div class="card-body">
              <h6 class="card-title">عوامل خطر</h6>
              <div class="risk-summary">
                <div class="risk-item">
                  <span>حضور پایین:</span>
                  <span class="badge bg-danger">{{ riskFactors.lowAttendance }}</span>
                </div>
                <div class="risk-item">
                  <span>عملکرد ضعیف:</span>
                  <span class="badge bg-warning">{{ riskFactors.poorPerformance }}</span>
                </div>
                <div class="risk-item">
                  <span>عدم فعالیت:</span>
                  <span class="badge bg-info">{{ riskFactors.inactivity }}</span>
                </div>
                <div class="risk-item">
                  <span>مشکلات رفتاری:</span>
                  <span class="badge bg-secondary">{{ riskFactors.behavioralIssues }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Trend Analysis -->
      <div v-if="analysisType === 'trend-analysis'" class="row">
        <div class="col-12">
          <div class="modern-card">
            <div class="card-body">
              <h6 class="card-title">تحلیل روند زمانی عملکرد</h6>
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
    // Reactive state
    const loading = ref(false);
    const error = ref(null);
    const selectedCourse = ref('');
    const selectedPeriod = ref('month');
    const analysisType = ref('progress');

    const timeDistributionData = ref([]);
    const timeStats = ref({
      totalStudyTime: 0,
      averageDailyTime: 0,
      maxDailyTime: 0,
      minDailyTime: 0
    });

    const hourlyDistribution = ref([]);
    const studentTimeData = ref([]);

    // Data state
    const courses = ref([]);
    const courseStats = ref({
      totalStudents: 0,
      averageProgress: 0,
      averageTimeSpent: 0,
      completionRate: 0
    });

    // Progress analysis data
    const lessonProgress = ref([]);
    const progressDistribution = ref({
      excellent: 0,
      good: 0,
      average: 0,
      poor: 0
    });

    // Challenging questions data
    const challengingQuestions = ref([]);
    const questionStats = ref({
      mostDifficult: 0,
      averageDifficulty: 0,
      needsReview: 0
    });

    // At-risk students data
    const atRiskStudents = ref([]);
    const riskFactors = ref({
      lowAttendance: 0,
      poorPerformance: 0,
      inactivity: 0,
      behavioralIssues: 0
    });

    // Trend analysis data
    const trendData = ref([]);

    // Computed chart data
    const progressChartData = computed(() => {
      return lessonProgress.value.map(lesson => ({
        label: lesson.lessonTitle,
        count: lesson.completionRate
      }));
    });

    const trendChartData = computed(() => {
      return trendData.value.map(item => ({
        label: item.date,
        views: item.averageScore || 0,
        submissions: item.attendanceRate || 0,
        completions: item.activityLevel || 0
      }));
    });

    // API Methods
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
        // Course stats
        const statsResponse = await axios.get(`/analytics/course/${selectedCourse.value}/activity-stats?period=${selectedPeriod.value}`);
        const activityData = statsResponse.data;

        courseStats.value = {
          totalStudents: activityData.totalStudents || 0,
          averageProgress: Math.round((activityData.participationMetrics?.contentStudy?.completionRate || 0)),
          averageTimeSpent: 0, // محاسبه از داده‌های موجود
          completionRate: activityData.participationMetrics?.contentStudy?.completionRate || 0
        };

        // Analysis type specific data
        switch (analysisType.value) {
          case 'progress':
            await fetchProgressData();
            break;
          case 'challenging-questions':
            await fetchChallengingQuestions();
            break;
          case 'at-risk-students':
            await fetchAtRiskStudents();
            break;
          case 'trend-analysis':
            await fetchTrendData();
            break;
        }

      } catch (err) {
        console.error('Error fetching analytics data:', err);
        error.value = 'خطا در دریافت داده‌های تحلیلی';
      } finally {
        loading.value = false;
      }
    };
    const fetchTimeDistributionData = async () => {
      if (!selectedCourse.value) return;

      loading.value = true;
      try {
        const { fetchTimeDistribution } = useAnalytics();
        const data = await fetchTimeDistribution(
            selectedCourse.value,
            selectedPeriod.value,
            'daily'
        );

        timeDistributionData.value = data.dailyDistribution || [];
        timeStats.value = data.statistics || {};
        hourlyDistribution.value = data.hourlyDistribution || [];
        studentTimeData.value = data.studentTimeData || [];

      } catch (error) {
        console.error('Error fetching time distribution:', error);
        error.value = 'خطا در دریافت توزیع زمان مطالعه';
      } finally {
        loading.value = false;
      }
    };

    const fetchProgressData = async () => {
      const response = await axios.get(`/analytics/course/${selectedCourse.value}/lesson-progress?period=${selectedPeriod.value}`);
      lessonProgress.value = response.data.lessons || [];
      progressDistribution.value = response.data.distribution || {};
    };

    const fetchChallengingQuestions = async () => {
      const response = await axios.get(`/analytics/course/${selectedCourse.value}/challenging-questions?period=${selectedPeriod.value}`);
      challengingQuestions.value = response.data.questions || [];
      questionStats.value = response.data.stats || {};
    };

    const fetchAtRiskStudents = async () => {
      const response = await axios.get(`/analytics/course/${selectedCourse.value}/at-risk-students?period=${selectedPeriod.value}`);
      atRiskStudents.value = response.data.students || [];
      riskFactors.value = response.data.riskFactors || {};
    };

    const fetchTrendData = async () => {
      const response = await axios.get(`/analytics/course/${selectedCourse.value}/trend-analysis?period=${selectedPeriod.value}`);
      trendData.value = response.data.trends || [];
    };

    // Utility methods
    const getRiskLevelClass = (level) => {
      const classes = {
        high: 'bg-danger',
        medium: 'bg-warning',
        low: 'bg-info'
      };
      return classes[level] || 'bg-secondary';
    };

    const getRiskLevelText = (level) => {
      const texts = {
        high: 'خطر بالا',
        medium: 'خطر متوسط',
        low: 'خطر کم'
      };
      return texts[level] || 'نامشخص';
    };

    // Action handlers
    const updateAnalysisView = async () => {
      if (selectedCourse.value) {
        fetchAnalyticsData();
      }
      if (analysisType.value === 'time-distribution') {
        await fetchTimeDistributionData();
      }
    };

    const formatTotalTime = (seconds) => {
      if (!seconds) return '0 دقیقه';

      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);

      if (hours > 0) {
        return `${hours} ساعت ${minutes > 0 ? `و ${minutes} دقیقه` : ''}`;
      }
      return `${minutes} دقیقه`;
    };

    const getStudyStatusClass = (status) => {
      switch(status) {
        case 'ACTIVE': return 'bg-success';
        case 'MODERATE': return 'bg-warning';
        case 'INACTIVE': return 'bg-danger';
        default: return 'bg-secondary';
      }
    };

    const getStudyStatusText = (status) => {
      switch(status) {
        case 'ACTIVE': return 'فعال';
        case 'MODERATE': return 'متوسط';
        case 'INACTIVE': return 'غیرفعال';
        default: return 'نامشخص';
      }
    };

    const refreshData = () => {
      fetchAnalyticsData();
    };

    const exportData = () => {
      console.log('Export data functionality');
    };

    const viewQuestionAnalysis = (question) => {
      console.log('View question analysis:', question);
    };

    const generateQuestionHelp = (question) => {
      console.log('Generate question help:', question);
    };

    const viewStudentDetails = (student) => {
      console.log('View student details:', student);
    };

    const createInterventionPlan = (student) => {
      console.log('Create intervention plan:', student);
    };

    const notifyParents = (student) => {
      console.log('Notify parents:', student);
    };

    // Watchers
    watch(selectedPeriod, () => {
      if (selectedCourse.value) {
        fetchAnalyticsData();
      }
    });

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

      // Data
      courses,
      courseStats,
      lessonProgress,
      progressDistribution,
      challengingQuestions,
      questionStats,
      atRiskStudents,
      riskFactors,
      trendData,

      // Computed
      progressChartData,
      trendChartData,

      // Methods
      fetchAnalyticsData,
      updateAnalysisView,
      refreshData,
      getRiskLevelClass,
      getRiskLevelText,
      exportData,
      viewQuestionAnalysis,
      generateQuestionHelp,
      viewStudentDetails,
      createInterventionPlan,
      notifyParents,
      timeDistributionData,
      timeStats,
      hourlyDistribution,
      studentTimeData,
      fetchTimeDistributionData,
      formatTotalTime,
      getStudyStatusClass,
      getStudyStatusText
    };
  }
}
</script>

<style scoped>
.performance-analysis-container {
  padding: 1rem;
}

.modern-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border: none;
  margin-bottom: 1rem;
}

.stat-card {
  transition: transform 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
  margin: 0;
}

.stat-label {
  color: #6b7280;
  margin: 0;
  font-size: 0.9rem;
}

.chart-container {
  position: relative;
  width: 100%;
  max-width: 100%;
}

.distribution-item,
.stat-item,
.risk-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f3f4f6;
}

.distribution-item:last-child,
.stat-item:last-child,
.risk-item:last-child {
  border-bottom: none;
}

.question-item,
.student-item {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.question-header,
.student-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.question-title,
.student-name {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.question-text {
  color: #4b5563;
  margin: 0.5rem 0;
  font-size: 0.9rem;
}

.question-stats,
.risk-factors {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-top: 0.5rem;
}

.stat-item,
.risk-factor {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.85rem;
  color: #6b7280;
}

.question-actions,
.student-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex-shrink: 0;
}

.progress-distribution,
.question-summary,
.risk-summary {
  padding: 0.5rem 0;
}

.questions-list,
.students-list {
  max-height: 600px;
  overflow-y: auto;
}

@media (max-width: 768px) {
  .question-item,
  .student-item {
    flex-direction: column;
    gap: 1rem;
  }

  .question-actions,
  .student-actions {
    flex-direction: row;
    width: 100%;
  }

  .question-stats,
  .risk-factors {
    flex-direction: column;
    gap: 0.5rem;
  }
}
.time-stats {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.stat-item:last-child {
  border-bottom: none;
}

.time-distribution-pie {
  margin-top: 1rem;
}

.student-info {
  display: flex;
  align-items: center;
}

.table th {
  border-top: none;
  font-weight: 600;
  color: #495057;
  background-color: #f8f9fa;
}

.table td {
  vertical-align: middle;
}

@media (max-width: 768px) {
  .table-responsive {
    font-size: 0.875rem;
  }

  .time-stats {
    gap: 0.5rem;
  }
}
</style>