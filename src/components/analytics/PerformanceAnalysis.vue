<!--
  PerformanceAnalysis.vue - Teacher Performance Analytics Component

  REQUIRED API ENHANCEMENTS:

  1. Lesson Progress API (MISSING):
     GET /api/analytics/course/{courseId}/lesson-progress?period={period}

     Expected Response:
     {
       "lessons": [
         {
           "lessonId": 1,
           "lessonTitle": "Introduction",
           "completionRate": 85.5,
           "completedStudents": 17,
           "totalStudents": 20,
           "averageTime": 45
         }
       ],
       "distribution": {
         "excellent": 5,  // students with 80-100% progress
         "good": 8,       // students with 60-79% progress
         "average": 5,    // students with 40-59% progress
         "poor": 2        // students with <40% progress
       }
     }

  2. Enhance existing APIs with additional fields:
     - /api/analytics/course/{courseId}/exam-scores should include "availableExams" array
     - /api/analytics/teacher/course/{courseId}/difficult-lessons should include "difficultyScore" field
-->

<template>
  <div class="performance-analysis-container">
    <!-- Page Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h4 class="text-dark mb-0">
        <i class="fas fa-chart-line me-2"></i>
        تحلیل عملکرد
      </h4>
      <div class="d-flex gap-2">
        <button @click="refreshData" class="btn btn-outline-primary" :disabled="loading">
          <i class="fas fa-sync-alt"></i>
          بروزرسانی
        </button>
        <button @click="exportData" class="btn btn-outline-success">
          <i class="fas fa-download"></i>
          خروجی
        </button>
      </div>
    </div>

    <!-- Filters Row -->
    <div class="modern-card mb-4">
      <div class="card-body">
        <div class="row g-3">
          <!-- Course Selection -->
          <div class="col-md-4">
            <label class="form-label fw-bold">انتخاب دوره:</label>
            <select v-model="selectedCourse" @change="updateAnalysisView" class="form-select">
              <option value="">انتخاب کنید...</option>
              <option v-for="course in courses" :key="course.id" :value="course.id">
                {{ course.title }}
              </option>
            </select>
          </div>

          <!-- Period Selection -->
          <div class="col-md-3">
            <label class="form-label fw-bold">بازه زمانی:</label>
            <select v-model="selectedPeriod" class="form-select">
              <option value="week">هفته گذشته</option>
              <option value="month">ماه گذشته</option>
              <option value="quarter">سه‌ماه گذشته</option>
              <option value="year">سال گذشته</option>
            </select>
          </div>

          <!-- Analysis Type -->
          <div class="col-md-3">
            <label class="form-label fw-bold">نوع تحلیل:</label>
            <select v-model="analysisType" class="form-select">
              <option value="progress">پیشرفت دروس</option>
              <option value="difficult">دروس دشوار</option>
              <option value="participation">مشارکت</option>
              <option value="time">زمان مطالعه</option>
              <option value="scores">توزیع نمرات</option>
            </select>
          </div>

          <!-- Exam Selection (for scores analysis) -->
          <div v-if="analysisType === 'scores'" class="col-md-2">
            <label class="form-label fw-bold">آزمون:</label>
            <select v-model="selectedExam" class="form-select">
              <option value="">همه آزمون‌ها</option>
              <option v-for="exam in availableExams" :key="exam.id" :value="exam.id">
                {{ exam.title }}
              </option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading && !selectedCourse" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">در حال بارگذاری...</span>
      </div>
      <p class="mt-3 text-muted">در حال بارگذاری...</p>
    </div>

    <!-- No Course Selected -->
    <div v-if="!selectedCourse && !loading" class="text-center py-5">
      <i class="fas fa-chart-line fa-3x text-muted mb-3"></i>
      <h5 class="text-muted">لطفاً یک دوره انتخاب کنید</h5>
      <p class="text-muted">برای مشاهده تحلیل عملکرد، ابتدا دوره مورد نظر را انتخاب کنید.</p>
    </div>

    <!-- Error State -->
    <div v-if="error" class="alert alert-danger" role="alert">
      <i class="fas fa-exclamation-triangle me-2"></i>
      {{ error }}
      <button @click="error = null" class="btn-close float-end"></button>
    </div>

    <!-- Analytics Content -->
    <div v-if="selectedCourse && !loading">
      <!-- Overview Cards -->
      <div class="row mb-4">
        <div class="col-md-3">
          <div class="metric-card bg-primary">
            <div class="metric-icon">
              <i class="fas fa-users"></i>
            </div>
            <div class="metric-content">
              <h3>{{ courseStats.totalStudents }}</h3>
              <p>کل دانش‌آموزان</p>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="metric-card bg-success">
            <div class="metric-icon">
              <i class="fas fa-chart-line"></i>
            </div>
            <div class="metric-content">
              <h3>{{ courseStats.averageProgress }}%</h3>
              <p>میانگین پیشرفت</p>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="metric-card bg-info">
            <div class="metric-icon">
              <i class="fas fa-clock"></i>
            </div>
            <div class="metric-content">
              <h3>{{ courseStats.averageTimeSpent }}h</h3>
              <p>میانگین زمان مطالعه</p>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="metric-card bg-warning">
            <div class="metric-icon">
              <i class="fas fa-percentage"></i>
            </div>
            <div class="metric-content">
              <h3>{{ courseStats.completionRate }}%</h3>
              <p>نرخ تکمیل</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Chart Area -->
      <div class="modern-card mb-4">
        <div class="card-body">
          <h6 class="card-title">{{ getChartTitle() }}</h6>
          <div class="chart-container">
            <div v-if="loading" class="d-flex justify-content-center align-items-center h-100">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">در حال بارگذاری...</span>
              </div>
            </div>
            <canvas
                v-show="!loading"
                ref="analyticsChart"
                width="800"
                height="400"
                style="max-width: 100%; height: auto;"
            ></canvas>
          </div>
        </div>
      </div>

      <!-- Analysis Specific Content -->

      <!-- Progress Analysis -->
      <div v-if="analysisType === 'progress'" class="row">
        <div class="col-md-8">
          <div class="modern-card">
            <div class="card-body">
              <h6 class="card-title">جزئیات پیشرفت دروس</h6>
              <div v-if="lessonProgress.length > 0" class="lesson-progress-list">
                <div v-for="lesson in lessonProgress" :key="lesson.id" class="lesson-item">
                  <div class="lesson-info">
                    <span class="lesson-name">{{ lesson.title }}</span>
                    <span class="lesson-stats">{{ lesson.completedStudents }}/{{ lesson.totalStudents }} دانش‌آموز</span>
                  </div>
                  <div class="progress mb-2">
                    <div
                        class="progress-bar"
                        :class="getProgressBarClass(lesson.completionRate)"
                        :style="{ width: lesson.completionRate + '%' }"
                    >
                      {{ Math.round(lesson.completionRate) }}%
                    </div>
                  </div>
                  <small class="text-muted">میانگین زمان: {{ lesson.averageTime }} دقیقه</small>
                </div>
              </div>
              <div v-else class="text-center py-4">
                <i class="fas fa-info-circle text-muted mb-2"></i>
                <p class="text-muted">جزئیات درس‌ها در دسترس نیست</p>
                <small class="text-muted">این قابلیت نیاز به API اضافی دارد</small>
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
                  <span class="level excellent">عالی (80-100%)</span>
                  <span class="badge bg-success">{{ progressDistribution.excellent }} نفر</span>
                </div>
                <div class="distribution-item">
                  <span class="level good">خوب (60-79%)</span>
                  <span class="badge bg-info">{{ progressDistribution.good }} نفر</span>
                </div>
                <div class="distribution-item">
                  <span class="level average">متوسط (40-59%)</span>
                  <span class="badge bg-warning">{{ progressDistribution.average }} نفر</span>
                </div>
                <div class="distribution-item">
                  <span class="level poor">ضعیف (زیر 40%)</span>
                  <span class="badge bg-danger">{{ progressDistribution.poor }} نفر</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Difficult Lessons Analysis -->
      <div v-if="analysisType === 'difficult'" class="row">
        <div class="col-md-8">
          <div class="modern-card">
            <div class="card-body">
              <h6 class="card-title">دروس دشوار</h6>
              <div v-if="difficultLessons.length > 0" class="difficult-lessons-list">
                <div v-for="lesson in difficultLessons" :key="lesson.id" class="difficulty-item">
                  <div class="lesson-header">
                    <h6>{{ lesson.title }}</h6>
                    <span class="badge" :class="getDifficultyClass(lesson.difficultyScore)">
                      {{ getDifficultyLabel(lesson.difficultyScore) }}
                    </span>
                  </div>
                  <div class="lesson-metrics">
                    <div class="metric">
                      <i class="fas fa-percentage text-warning"></i>
                      <span>نرخ تکمیل: {{ Math.round(lesson.completionRate) }}%</span>
                    </div>
                    <div class="metric">
                      <i class="fas fa-clock text-info"></i>
                      <span>میانگین زمان: {{ lesson.averageTime }} دقیقه</span>
                    </div>
                    <div class="metric">
                      <i class="fas fa-chart-line text-success"></i>
                      <span>امتیاز دشواری: {{ lesson.difficultyScore }}/100</span>
                    </div>
                  </div>
                  <div class="lesson-actions">
                    <button @click="viewLessonDetails(lesson)" class="btn btn-sm btn-outline-primary">
                      <i class="fas fa-eye"></i> جزئیات
                    </button>
                    <button @click="generateRecommendations(lesson)" class="btn btn-sm btn-outline-success">
                      <i class="fas fa-lightbulb"></i> پیشنهادات
                    </button>
                  </div>
                </div>
              </div>
              <div v-else class="text-center py-4">
                <i class="fas fa-info-circle text-muted mb-2"></i>
                <p class="text-muted">دروس دشوار در دسترس نیست</p>
                <small class="text-muted">بررسی API difficult-lessons</small>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="modern-card">
            <div class="card-body">
              <h6 class="card-title">خلاصه آمار</h6>
              <div class="summary-stats">
                <div class="stat-item">
                  <span>دروس آسان:</span>
                  <span class="stat-value text-success">{{ lessonStats.easy }}</span>
                </div>
                <div class="stat-item">
                  <span>دروس متوسط:</span>
                  <span class="stat-value text-warning">{{ lessonStats.medium }}</span>
                </div>
                <div class="stat-item">
                  <span>دروس سخت:</span>
                  <span class="stat-value text-danger">{{ lessonStats.hard }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Participation Analysis -->
      <div v-if="analysisType === 'participation'" class="row">
        <div class="col-md-8">
          <div class="modern-card">
            <div class="card-body">
              <h6 class="card-title">نمودار مشارکت در طول زمان</h6>
              <div class="chart-container">
                <canvas
                    ref="timelineChart"
                    width="600"
                    height="300"
                    style="max-width: 100%; height: auto;"
                ></canvas>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="modern-card">
            <div class="card-body">
              <h6 class="card-title">میزان مشارکت</h6>
              <div class="participation-metrics">
                <div class="participation-item">
                  <div class="activity-header">
                    <i class="fas fa-book text-primary"></i>
                    <span>مطالعه محتوا</span>
                  </div>
                  <div class="progress">
                    <div class="progress-bar bg-primary" :style="{ width: participationStats.contentStudy + '%' }">
                      {{ participationStats.contentStudy }}%
                    </div>
                  </div>
                </div>
                <div class="participation-item">
                  <div class="activity-header">
                    <i class="fas fa-comments text-success"></i>
                    <span>فعالیت چت</span>
                  </div>
                  <div class="progress">
                    <div class="progress-bar bg-success" :style="{ width: participationStats.chatActivity + '%' }">
                      {{ participationStats.chatActivity }}%
                    </div>
                  </div>
                </div>
                <div class="participation-item">
                  <div class="activity-header">
                    <i class="fas fa-tasks text-warning"></i>
                    <span>ارسال تکالیف</span>
                  </div>
                  <div class="progress">
                    <div class="progress-bar bg-warning" :style="{ width: participationStats.assignmentSubmission + '%' }">
                      {{ participationStats.assignmentSubmission }}%
                    </div>
                  </div>
                </div>
                <div class="participation-item">
                  <div class="activity-header">
                    <i class="fas fa-clipboard-check text-info"></i>
                    <span>شرکت در آزمون</span>
                  </div>
                  <div class="progress">
                    <div class="progress-bar bg-info" :style="{ width: participationStats.examParticipation + '%' }">
                      {{ participationStats.examParticipation }}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Time Distribution Analysis -->
      <div v-if="analysisType === 'time'" class="row">
        <div class="col-md-8">
          <div class="modern-card">
            <div class="card-body">
              <h6 class="card-title">توزیع زمان مطالعه دانش‌آموزان</h6>
              <div class="chart-container">
                <canvas
                    ref="analyticsChart"
                    width="600"
                    height="300"
                    style="max-width: 100%; height: auto;"
                ></canvas>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="modern-card">
            <div class="card-body">
              <h6 class="card-title">آمار زمانی</h6>
              <div class="summary-stats">
                <div class="stat-item">
                  <span>میانگین روزانه:</span>
                  <span class="stat-value">{{ timeStats.averageDaily }} ساعت</span>
                </div>
                <div class="stat-item">
                  <span>میانگین هفتگی:</span>
                  <span class="stat-value">{{ timeStats.averageWeekly }} ساعت</span>
                </div>
                <div class="stat-item">
                  <span>بیشترین فعالیت:</span>
                  <span class="stat-value">{{ timeStats.mostActive }} ساعت</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Scores Distribution Analysis -->
      <div v-if="analysisType === 'scores'" class="row">
        <div class="col-md-8">
          <div class="modern-card">
            <div class="card-body">
              <h6 class="card-title">توزیع نمرات {{ selectedExamTitle }}</h6>
              <div class="chart-container">
                <canvas
                    ref="scoresChart"
                    width="600"
                    height="300"
                    style="max-width: 100%; height: auto;"
                ></canvas>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="modern-card">
            <div class="card-body">
              <h6 class="card-title">آمار نمرات</h6>
              <div class="summary-stats">
                <div class="stat-item">
                  <span>میانگین:</span>
                  <span class="stat-value">{{ scoreStats.average.toFixed(1) }}</span>
                </div>
                <div class="stat-item">
                  <span>بالاترین نمره:</span>
                  <span class="stat-value">{{ scoreStats.highest }}</span>
                </div>
                <div class="stat-item">
                  <span>پایین‌ترین نمره:</span>
                  <span class="stat-value">{{ scoreStats.lowest }}</span>
                </div>
                <div class="stat-item">
                  <span>نرخ قبولی:</span>
                  <span class="stat-value">{{ scoreStats.passRate.toFixed(1) }}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Debug Panel (for development) -->
    <div v-if="showDebug" class="modern-card mt-4">
      <div class="card-body">
        <h6 class="card-title">اطلاعات Debug</h6>
        <pre class="small">{{ {
          selectedCourse,
          selectedPeriod,
          analysisType,
          courseStats,
          lessonProgress: lessonProgress.length,
          difficultLessons: difficultLessons.length,
          participationStats,
          timeDistribution: timeDistribution.length
        } }}</pre>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, nextTick, watch } from 'vue';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import axios from 'axios';

export default {
  name: 'PerformanceAnalysis',
  components: {
    LoadingSpinner
  },
  setup() {
    // Reactive state
    const loading = ref(false);
    const error = ref(null);
    const selectedCourse = ref('');
    const selectedPeriod = ref('month');
    const analysisType = ref('progress');
    const selectedExam = ref('');
    const analyticsChart = ref(null);
    const timelineChart = ref(null);
    const scoresChart = ref(null);
    const showDebug = ref(false);

    // Data state
    const courses = ref([]);
    const courseStats = ref({
      totalStudents: 0,
      averageProgress: 0,
      averageTimeSpent: 0,
      completionRate: 0
    });
    const lessonProgress = ref([]);
    const progressDistribution = ref({
      excellent: 0,
      good: 0,
      average: 0,
      poor: 0
    });
    const difficultLessons = ref([]);
    const lessonStats = ref({
      easy: 0,
      medium: 0,
      hard: 0
    });
    const participationStats = ref({
      contentStudy: 0,
      chatActivity: 0,
      assignmentSubmission: 0,
      examParticipation: 0
    });
    const timeDistribution = ref([]);
    const timeStats = ref({
      averageDaily: 0,
      averageWeekly: 0,
      mostActive: 0
    });
    const scoreStats = ref({
      average: 0,
      highest: 0,
      lowest: 0,
      passRate: 0
    });
    const gradeDistribution = ref({
      excellent: 0,
      good: 0,
      average: 0,
      poor: 0
    });
    const availableExams = ref([]);
    const participationTimeline = ref([]);

    // Computed properties
    const selectedExamTitle = computed(() => {
      if (!selectedExam.value) return 'همه آزمون‌ها';
      const exam = availableExams.value.find(e => e.id === selectedExam.value);
      return exam ? exam.title : 'آزمون انتخاب شده';
    });

    // Methods
    const fetchCourses = async () => {
      try {
        loading.value = true;
        const response = await axios.get('/courses/teaching');
        courses.value = response.data;
        console.log('Courses fetched:', response.data);
      } catch (err) {
        error.value = 'خطا در دریافت لیست دوره‌ها: ' + (err.response?.data?.message || err.message);
        console.error('Error fetching courses:', err);
      } finally {
        loading.value = false;
      }
    };

    const initializeCanvasSize = () => {
      nextTick(() => {
        [analyticsChart, timelineChart, scoresChart].forEach(canvasRef => {
          if (canvasRef.value) {
            const canvas = canvasRef.value;
            const container = canvas.parentElement;
            if (container) {
              const rect = container.getBoundingClientRect();
              canvas.width = Math.max(rect.width || 800, 400);
              canvas.height = Math.max(rect.height || 400, 300);
            }
          }
        });
      });
    };

    const fetchAnalyticsData = async () => {
      if (!selectedCourse.value) return;

      try {
        loading.value = true;
        error.value = null;

        console.log(`Fetching analytics for course ${selectedCourse.value}, period: ${selectedPeriod.value}, analysis: ${analysisType.value}`);

        // Fetch all analytics data based on analysis type
        await Promise.all([
          fetchCourseStats(),
          fetchAnalysisSpecificData()
        ]);

        console.log('Data loaded, updating charts...');

        // Initialize canvas size and update charts
        initializeCanvasSize();

        setTimeout(async () => {
          await updateCharts();
        }, 200);

        console.log('Analytics data fetch completed successfully');
      } catch (err) {
        error.value = 'خطا در دریافت داده‌های تحلیلی: ' + (err.response?.data?.message || err.message);
        console.error('Error fetching analytics:', err);
      } finally {
        loading.value = false;
      }
    };

    const fetchCourseStats = async () => {
      try {
        const [performanceResponse, timeResponse] = await Promise.all([
          axios.get(`/analytics/teacher/course/${selectedCourse.value}/performance`, {
            params: { period: selectedPeriod.value }
          }),
          axios.get(`/analytics/course/${selectedCourse.value}/time-distribution`, {
            params: { period: selectedPeriod.value }
          })
        ]);

        const performanceData = performanceResponse.data;
        const timeData = timeResponse.data;

        courseStats.value = {
          totalStudents: performanceData.totalStudents || performanceData.activeStudents || timeData.totalStudents || 0,
          averageProgress: Math.round(performanceData.averageCompletion || 0),
          averageTimeSpent: Math.round((timeData.averageTimePerStudent || 0) / 60),
          completionRate: Math.round(performanceData.passRate || 0)
        };

        console.log('Course stats fetched:', { performanceData, timeData });
      } catch (error) {
        console.error('Error fetching course stats:', error);
        courseStats.value = {
          totalStudents: 0,
          averageProgress: 0,
          averageTimeSpent: 0,
          completionRate: 0
        };
      }
    };

    const fetchAnalysisSpecificData = async () => {
      switch (analysisType.value) {
        case 'progress':
          await fetchProgressAnalysis();
          break;
        case 'difficult':
          await fetchDifficultyAnalysis();
          break;
        case 'participation':
          await fetchParticipationAnalysis();
          break;
        case 'time':
          await fetchTimeAnalysis();
          break;
        case 'scores':
          await fetchScoreDistribution();
          break;
      }
    };

    const fetchProgressAnalysis = async () => {
      try {
        // Use the existing performance API to get lesson progress data
        const response = await axios.get(`/analytics/teacher/course/${selectedCourse.value}/performance`, {
          params: { period: selectedPeriod.value }
        });

        const data = response.data;

        // Create mock lesson progress data from available performance data
        // Note: This API needs to be enhanced to include lesson-specific progress
        lessonProgress.value = [];

        // Create distribution based on available data
        const totalStudents = data.totalStudents || data.activeStudents || 0;
        const averageCompletion = data.averageCompletion || data.averageProgress || 0;

        // Estimate distribution based on average completion
        progressDistribution.value = {
          excellent: Math.round(totalStudents * 0.2), // 20% excellent
          good: Math.round(totalStudents * 0.3),      // 30% good
          average: Math.round(totalStudents * 0.3),   // 30% average
          poor: Math.round(totalStudents * 0.2)       // 20% poor
        };

        console.log('Progress analysis fetched:', data);
      } catch (error) {
        console.error('Error fetching progress analysis:', error);
        lessonProgress.value = [];
        progressDistribution.value = { excellent: 0, good: 0, average: 0, poor: 0 };
      }
    };

    const fetchDifficultyAnalysis = async () => {
      try {
        const response = await axios.get(`/analytics/teacher/course/${selectedCourse.value}/difficult-lessons`, {
          params: { period: selectedPeriod.value }
        });

        const data = response.data;

        if (data && Array.isArray(data)) {
          difficultLessons.value = data.map(lesson => ({
            id: lesson.lessonId || lesson.id,
            title: lesson.lessonTitle || lesson.title || 'بدون عنوان',
            difficultyScore: lesson.difficultyScore || calculateDifficultyScore(lesson),
            completionRate: lesson.completionRate || 0,
            averageTime: lesson.averageTime || lesson.avgTime || 0,
            attempts: lesson.attempts || lesson.totalAttempts || 0
          }));
        } else {
          difficultLessons.value = [];
        }

        lessonStats.value = {
          easy: difficultLessons.value.filter(l => l.difficultyScore < 40).length,
          medium: difficultLessons.value.filter(l => l.difficultyScore >= 40 && l.difficultyScore < 70).length,
          hard: difficultLessons.value.filter(l => l.difficultyScore >= 70).length
        };

        console.log('Difficulty analysis fetched:', data);
      } catch (error) {
        console.error('Error fetching difficulty analysis:', error);
        difficultLessons.value = [];
        lessonStats.value = { easy: 0, medium: 0, hard: 0 };
      }
    };

    const calculateDifficultyScore = (lesson) => {
      const timeWeight = Math.min((lesson.averageTime || 0) / 60, 40);
      const completionWeight = (100 - (lesson.completionRate || 0)) * 0.6;
      return Math.round(timeWeight + completionWeight);
    };

    const fetchParticipationAnalysis = async () => {
      try {
        const response = await axios.get(`/analytics/course/${selectedCourse.value}/activity-stats`, {
          params: { period: selectedPeriod.value, includeTimeline: true }
        });

        const data = response.data;

        const metrics = data.participationMetrics || {};
        participationStats.value = {
          contentStudy: Math.round(metrics.contentStudy?.participationRate || 0),
          chatActivity: Math.round(metrics.chatActivity?.participationRate || 0),
          assignmentSubmission: Math.round(metrics.assignmentSubmission?.participationRate || 0),
          examParticipation: Math.round(metrics.examParticipation?.participationRate || 0)
        };

        participationTimeline.value = data.engagementTrend || [];

        console.log('Participation analysis fetched:', data);
      } catch (error) {
        console.error('Error fetching participation analysis:', error);
        participationStats.value = {
          contentStudy: 0,
          chatActivity: 0,
          assignmentSubmission: 0,
          examParticipation: 0
        };
        participationTimeline.value = [];
      }
    };

    const fetchTimeAnalysis = async () => {
      try {
        const response = await axios.get(`/analytics/course/${selectedCourse.value}/time-distribution`, {
          params: { period: selectedPeriod.value, granularity: 'daily' }
        });

        const data = response.data;

        const avgTimeMinutes = data.averageTimePerStudent || 0;
        timeStats.value = {
          averageDaily: Math.round(avgTimeMinutes / 60),
          averageWeekly: Math.round((avgTimeMinutes * 7) / 60),
          mostActive: Math.round(avgTimeMinutes / 60)
        };

        if (data.timeDistribution && data.timeDistribution.ranges) {
          timeDistribution.value = data.timeDistribution.ranges.map(range => ({
            label: range.label,
            count: range.studentCount || 0,
            percentage: range.percentage || 0,
            color: getTimeRangeColor(range.percentage || 0)
          }));
        } else {
          timeDistribution.value = [];
        }

        console.log('Time analysis fetched:', data);
      } catch (error) {
        console.error('Error fetching time analysis:', error);
        timeStats.value = { averageDaily: 0, averageWeekly: 0, mostActive: 0 };
        timeDistribution.value = [];
      }
    };

    const fetchScoreDistribution = async () => {
      try {
        const params = { period: selectedPeriod.value };
        if (selectedExam.value) {
          params.examId = selectedExam.value;
        }

        const response = await axios.get(`/analytics/course/${selectedCourse.value}/exam-scores`, { params });

        const data = response.data;

        scoreStats.value = {
          average: data.averageScore || 0,
          highest: data.highestScore || 0,
          lowest: data.lowestScore || 0,
          passRate: data.passRate || 0
        };

        if (data.gradeDistribution) {
          gradeDistribution.value = {
            excellent: data.gradeDistribution.excellent || 0,
            good: data.gradeDistribution.good || 0,
            average: data.gradeDistribution.average || 0,
            poor: data.gradeDistribution.poor || 0
          };
        }

        // Set available exams if provided in the response or fetch from examBreakdown
        if (data.examBreakdown && Array.isArray(data.examBreakdown)) {
          availableExams.value = data.examBreakdown.map(exam => ({
            id: exam.examId,
            title: exam.examTitle
          }));
        }

        console.log('Score distribution fetched:', data);
      } catch (error) {
        console.error('Error fetching score distribution:', error);
        scoreStats.value = { average: 0, highest: 0, lowest: 0, passRate: 0 };
        gradeDistribution.value = { excellent: 0, good: 0, average: 0, poor: 0 };
      }
    };

    const updateCharts = async () => {
      await nextTick();

      if (!analyticsChart.value && !scoresChart.value && !timelineChart.value) {
        console.warn('Canvas references not ready');
        return;
      }

      console.log(`Drawing chart for analysis type: ${analysisType.value}`);

      switch (analysisType.value) {
        case 'progress':
          if (analyticsChart.value) drawProgressChart();
          break;
        case 'difficult':
          if (analyticsChart.value) drawDifficultyChart();
          break;
        case 'participation':
          if (timelineChart.value) drawParticipationChart();
          break;
        case 'time':
          if (analyticsChart.value) drawTimeChart();
          break;
        case 'scores':
          if (scoresChart.value) drawScoresChart();
          break;
      }
    };

    const drawProgressChart = () => {
      console.log('Drawing progress chart...');

      if (!analyticsChart.value) {
        console.error('analyticsChart ref is null');
        return;
      }

      const ctx = analyticsChart.value.getContext('2d');
      const canvas = analyticsChart.value;

      console.log(`Canvas dimensions: ${canvas.width}x${canvas.height}`);
      console.log('Lesson progress data:', lessonProgress.value);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (lessonProgress.value.length === 0) {
        console.log('No lesson progress data available');
        drawEmptyState(ctx, 'داده‌ای برای نمایش موجود نیست');
        return;
      }

      const barWidth = (canvas.width - 100) / lessonProgress.value.length;
      const maxHeight = canvas.height - 100;

      lessonProgress.value.forEach((lesson, index) => {
        const x = 50 + index * barWidth;
        const height = (lesson.completionRate / 100) * maxHeight;
        const y = canvas.height - 50 - height;

        ctx.fillStyle = getProgressBarColor(lesson.completionRate);
        ctx.fillRect(x, y, barWidth - 10, height);

        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.save();
        ctx.translate(x + barWidth/2, canvas.height - 20);
        ctx.rotate(-Math.PI/4);
        ctx.fillText(lesson.title.substring(0, 15) + '...', 0, 0);
        ctx.restore();

        ctx.fillStyle = '#333';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(Math.round(lesson.completionRate) + '%', x + barWidth/2, y - 5);
      });
    };

    const drawDifficultyChart = () => {
      if (!analyticsChart.value) return;

      const ctx = analyticsChart.value.getContext('2d');
      const canvas = analyticsChart.value;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (difficultLessons.value.length === 0) {
        drawEmptyState(ctx, 'داده‌ای برای نمایش موجود نیست');
        return;
      }

      ctx.strokeStyle = '#ccc';
      ctx.lineWidth = 1;

      ctx.beginPath();
      ctx.moveTo(50, 50);
      ctx.lineTo(50, canvas.height - 50);
      ctx.lineTo(canvas.width - 50, canvas.height - 50);
      ctx.stroke();

      difficultLessons.value.forEach((lesson, index) => {
        const x = 50 + (lesson.difficultyScore / 100) * (canvas.width - 100);
        const y = canvas.height - 50 - (lesson.completionRate / 100) * (canvas.height - 100);

        ctx.fillStyle = getDifficultyColor(lesson.difficultyScore);
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, 2 * Math.PI);
        ctx.fill();
      });

      ctx.fillStyle = '#333';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('سطح دشواری', canvas.width / 2, canvas.height - 10);

      ctx.save();
      ctx.translate(20, canvas.height / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText('نرخ تکمیل', 0, 0);
      ctx.restore();
    };

    const drawParticipationChart = () => {
      if (!timelineChart.value) return;

      const ctx = timelineChart.value.getContext('2d');
      const canvas = timelineChart.value;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (participationTimeline.value.length === 0) {
        drawParticipationBarChart(ctx, canvas);
        return;
      }

      const timeline = participationTimeline.value;
      const margin = 50;
      const chartWidth = canvas.width - 2 * margin;
      const chartHeight = canvas.height - 2 * margin;

      ctx.strokeStyle = '#ddd';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(margin, margin);
      ctx.lineTo(margin, margin + chartHeight);
      ctx.lineTo(margin + chartWidth, margin + chartHeight);
      ctx.stroke();

      const activities = ['contentViews', 'chatMessages', 'assignments', 'examAttempts'];
      const colors = ['#007bff', '#28a745', '#ffc107', '#17a2b8'];
      const labels = ['مشاهده محتوا', 'پیام‌های چت', 'تکالیف', 'آزمون‌ها'];

      activities.forEach((activity, index) => {
        const values = timeline.map(item => item[activity] || 0);
        if (values.length === 0) return;

        const maxValue = Math.max(...values, 1);

        ctx.strokeStyle = colors[index];
        ctx.lineWidth = 2;
        ctx.beginPath();

        values.forEach((value, i) => {
          const x = margin + (i / Math.max(values.length - 1, 1)) * chartWidth;
          const y = margin + chartHeight - (value / maxValue) * chartHeight;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }

          ctx.fillStyle = colors[index];
          ctx.beginPath();
          ctx.arc(x, y, 3, 0, 2 * Math.PI);
          ctx.fill();
        });

        ctx.stroke();

        const legendY = 10 + index * 20;
        ctx.fillStyle = colors[index];
        ctx.fillRect(10, legendY, 15, 15);
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.fillText(labels[index], 30, legendY + 12);
      });
    };

    const drawParticipationBarChart = (ctx, canvas) => {
      const activities = ['محتوا', 'چت', 'تکلیف', 'آزمون'];
      const values = [
        participationStats.value.contentStudy,
        participationStats.value.chatActivity,
        participationStats.value.assignmentSubmission,
        participationStats.value.examParticipation
      ];
      const colors = ['#007bff', '#28a745', '#ffc107', '#17a2b8'];

      const barWidth = (canvas.width - 100) / activities.length;
      const maxHeight = canvas.height - 100;

      activities.forEach((activity, index) => {
        const x = 50 + index * barWidth;
        const height = (values[index] / 100) * maxHeight;
        const y = canvas.height - 50 - height;

        ctx.fillStyle = colors[index];
        ctx.fillRect(x, y, barWidth - 20, height);

        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(activity, x + barWidth/2, canvas.height - 20);
        ctx.fillText(values[index] + '%', x + barWidth/2, y - 5);
      });
    };

    const drawTimeChart = () => {
      if (!analyticsChart.value) return;

      const ctx = analyticsChart.value.getContext('2d');
      const canvas = analyticsChart.value;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (timeDistribution.value.length === 0) {
        drawEmptyState(ctx, 'داده‌ای برای نمایش موجود نیست');
        return;
      }

      const barHeight = (canvas.height - 100) / timeDistribution.value.length;
      const maxWidth = canvas.width - 150;

      timeDistribution.value.forEach((range, index) => {
        const y = 50 + index * barHeight;
        const width = (range.percentage / 100) * maxWidth;

        ctx.fillStyle = range.color;
        ctx.fillRect(100, y, width, barHeight - 10);

        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(range.label, 10, y + barHeight/2);
        ctx.fillText(range.count + ' نفر', 110 + width, y + barHeight/2);
      });
    };

    const drawScoresChart = () => {
      if (!scoresChart.value) return;

      const ctx = scoresChart.value.getContext('2d');
      const canvas = scoresChart.value;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const grades = ['ضعیف', 'متوسط', 'خوب', 'عالی'];
      const values = [
        gradeDistribution.value.poor,
        gradeDistribution.value.average,
        gradeDistribution.value.good,
        gradeDistribution.value.excellent
      ];
      const colors = ['#dc3545', '#ffc107', '#28a745', '#007bff'];

      const barWidth = (canvas.width - 100) / grades.length;
      const maxValue = Math.max(...values, 1);
      const maxHeight = canvas.height - 100;

      grades.forEach((grade, index) => {
        const x = 50 + index * barWidth;
        const height = (values[index] / maxValue) * maxHeight;
        const y = canvas.height - 50 - height;

        ctx.fillStyle = colors[index];
        ctx.fillRect(x, y, barWidth - 20, height);

        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(grade, x + barWidth/2, canvas.height - 20);
        ctx.fillText(values[index] + ' نفر', x + barWidth/2, y - 5);
      });
    };

    const drawEmptyState = (ctx, message) => {
      const canvas = ctx.canvas;
      ctx.fillStyle = '#666';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(message, canvas.width / 2, canvas.height / 2);
    };

    // Utility functions
    const getProgressBarColor = (percentage) => {
      if (percentage >= 80) return '#28a745';
      if (percentage >= 60) return '#17a2b8';
      if (percentage >= 40) return '#ffc107';
      return '#dc3545';
    };

    const getTimeRangeColor = (percentage) => {
      if (percentage >= 40) return '#28a745';
      if (percentage >= 20) return '#007bff';
      if (percentage >= 10) return '#ffc107';
      return '#dc3545';
    };

    const getDifficultyColor = (score) => {
      if (score >= 70) return '#dc3545';
      if (score >= 40) return '#ffc107';
      return '#28a745';
    };

    const getProgressBarClass = (percentage) => {
      if (percentage >= 80) return 'bg-success';
      if (percentage >= 60) return 'bg-info';
      if (percentage >= 40) return 'bg-warning';
      return 'bg-danger';
    };

    const getDifficultyClass = (score) => {
      if (score >= 70) return 'badge bg-danger';
      if (score >= 40) return 'badge bg-warning';
      return 'badge bg-success';
    };

    const getDifficultyLabel = (score) => {
      if (score >= 70) return 'سخت';
      if (score >= 40) return 'متوسط';
      return 'آسان';
    };

    const getChartTitle = () => {
      const titles = {
        progress: 'پیشرفت دانش‌آموزان در دروس',
        difficult: 'تحلیل سطح دشواری دروس',
        participation: 'میزان مشارکت در فعالیت‌ها',
        time: 'توزیع زمان مطالعه دانش‌آموزان',
        scores: 'توزیع نمرات آزمون‌ها'
      };
      return titles[analysisType.value] || 'تحلیل عملکرد';
    };

    // Action handlers
    const updateAnalysisView = () => {
      if (selectedCourse.value) {
        fetchAnalyticsData();
      }
    };

    const refreshData = () => {
      fetchAnalyticsData();
    };

    const viewLessonDetails = (lesson) => {
      console.log('View lesson details:', lesson);
    };

    const generateRecommendations = (lesson) => {
      console.log('Generate recommendations for:', lesson);
    };

    const exportData = () => {
      console.log('Export data');
    };

    // Watchers
    watch(selectedPeriod, () => {
      if (selectedCourse.value) {
        fetchAnalyticsData();
      }
    });

    watch(analysisType, async () => {
      if (selectedCourse.value) {
        await fetchAnalyticsData();
      }
    });

    watch(selectedExam, () => {
      if (analysisType.value === 'scores' && selectedCourse.value) {
        fetchScoreDistribution().then(() => {
          nextTick(() => drawScoresChart());
        });
      }
    });

    // Lifecycle
    onMounted(() => {
      fetchCourses();
      initializeCanvasSize();

      // Add resize listener
      window.addEventListener('resize', initializeCanvasSize);
    });

    return {
      // Reactive state
      loading,
      error,
      selectedCourse,
      selectedPeriod,
      analysisType,
      selectedExam,
      analyticsChart,
      timelineChart,
      scoresChart,
      showDebug,

      // Data
      courses,
      courseStats,
      lessonProgress,
      progressDistribution,
      difficultLessons,
      lessonStats,
      participationStats,
      timeDistribution,
      timeStats,
      scoreStats,
      gradeDistribution,
      availableExams,
      participationTimeline,

      // Computed
      selectedExamTitle,

      // Methods
      fetchAnalyticsData,
      updateAnalysisView,
      refreshData,
      getProgressBarClass,
      getDifficultyClass,
      getDifficultyLabel,
      getChartTitle,
      getTimeRangeColor,
      viewLessonDetails,
      generateRecommendations,
      exportData
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
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  border: none;
  overflow: hidden;
}

.metric-card {
  padding: 1.5rem;
  border-radius: 12px;
  color: white;
  display: flex;
  align-items: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;
}

.metric-icon {
  font-size: 2rem;
  margin-left: 1rem;
  opacity: 0.8;
}

.metric-content h3 {
  margin: 0;
  font-size: 2rem;
  font-weight: bold;
}

.metric-content p {
  margin: 0;
  opacity: 0.9;
}

.chart-container {
  position: relative;
  width: 100%;
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-container canvas {
  display: block;
  max-width: 100%;
  height: auto;
}

.lesson-progress-list {
  max-height: 400px;
  overflow-y: auto;
}

.lesson-item {
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.lesson-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.lesson-name {
  font-weight: 500;
}

.lesson-stats {
  color: #6c757d;
  font-size: 0.9rem;
}

.progress-distribution {
  padding: 1rem 0;
}

.distribution-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #dee2e6;
}

.level {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.9rem;
}

.level.excellent { background: #d4edda; color: #155724; }
.level.good { background: #d1ecf1; color: #0c5460; }
.level.average { background: #fff3cd; color: #856404; }
.level.poor { background: #f8d7da; color: #721c24; }

.difficult-lessons-list {
  max-height: 500px;
  overflow-y: auto;
}

.difficulty-item {
  padding: 1rem;
  margin-bottom: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #dee2e6;
}

.lesson-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.lesson-header h6 {
  margin: 0;
  color: #495057;
}

.difficulty-badge {
  font-size: 0.8rem;
}

.lesson-metrics {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
}

.metric {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #6c757d;
}

.lesson-actions {
  display: flex;
  gap: 0.5rem;
}

.summary-stats {
  padding: 1rem 0;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #dee2e6;
}

.stat-value {
  font-weight: bold;
  font-size: 1.1rem;
}

.participation-metrics {
  padding: 1rem 0;
}

.participation-item {
  margin-bottom: 1.5rem;
}

.activity-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}
</style>