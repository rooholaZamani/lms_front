<template>
  <!-- Performance Analysis Component - Updated with new APIs -->
  <div class="performance-analysis-container">
    <LoadingSpinner v-if="loading" />

    <!-- Header with filters -->
    <div class="modern-card mb-4">
      <div class="card-header bg-primary text-white">
        <h5 class="mb-0">
          <i class="fas fa-chart-line me-2"></i>
          تحلیل عملکرد دوره
        </h5>
      </div>
      <div class="card-body">
        <div class="row g-3">
          <!-- Course Selection -->
          <div class="col-md-4">
            <label class="form-label">انتخاب دوره:</label>
            <select
                v-model="selectedCourse"
                @change="fetchAnalyticsData"
                class="form-select"
                :disabled="loading">
              <option value="">انتخاب کنید...</option>
              <option v-for="course in courses" :key="course.id" :value="course.id">
                {{ course.title }}
              </option>
            </select>
          </div>

          <!-- Time Period Selection -->
          <div class="col-md-3">
            <label class="form-label">بازه زمانی:</label>
            <select
                v-model="selectedPeriod"
                @change="fetchAnalyticsData"
                class="form-select"
                :disabled="!selectedCourse || loading">
              <option value="week">هفته گذشته</option>
              <option value="month">ماه گذشته</option>
              <option value="quarter">سه ماه گذشته</option>
              <option value="semester">شش ماه گذشته</option>
            </select>
          </div>

          <!-- Analysis Type Selection -->
          <div class="col-md-3">
            <label class="form-label">نوع تحلیل:</label>
            <select
                v-model="analysisType"
                @change="updateAnalysisView"
                class="form-select"
                :disabled="!selectedCourse || loading">
              <option value="progress">پیشرفت دانش‌آموزان</option>
              <option value="scores">توزیع نمرات</option>
              <option value="time">زمان صرف شده</option>
              <option value="difficult">دروس چالش‌برانگیز</option>
              <option value="participation">میزان مشارکت</option>
            </select>
          </div>

          <!-- Refresh Button -->
          <div class="col-md-2">
            <label class="form-label">&nbsp;</label>
            <button
                @click="refreshData"
                class="btn btn-outline-primary w-100"
                :disabled="!selectedCourse || loading">
              <i class="fas fa-sync-alt me-1"></i>
              بروزرسانی
            </button>
          </div>
        </div>

        <!-- Exam Selection for Score Distribution -->
        <div v-if="analysisType === 'scores'" class="row mt-3">
          <div class="col-md-4">
            <label class="form-label">انتخاب آزمون:</label>
            <select v-model="selectedExam" @change="fetchScoreDistribution" class="form-select">
              <option value="">همه آزمون‌ها</option>
              <option v-for="exam in availableExams" :key="exam.id" :value="exam.id">
                {{ exam.title }}
              </option>
            </select>
          </div>
        </div>
      </div>
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
            <canvas ref="analyticsChart" width="800" height="400"></canvas>
          </div>
        </div>
      </div>

      <!-- Analysis Specific Content -->

      <!-- Progress Analysis -->
      <div v-if="analysisType === 'progress'" class="row">
        <div class="col-md-6">
          <div class="modern-card">
            <div class="card-body">
              <h6 class="card-title">پیشرفت بر اساس درس</h6>
              <div class="lesson-progress-list">
                <div v-for="lesson in lessonProgress" :key="lesson.id" class="lesson-item">
                  <div class="lesson-info">
                    <span class="lesson-name">{{ lesson.title }}</span>
                    <span class="lesson-stats">{{ lesson.completedStudents }}/{{ courseStats.totalStudents }}</span>
                  </div>
                  <div class="progress mb-2">
                    <div
                        class="progress-bar"
                        :class="getProgressBarClass(lesson.completionRate)"
                        :style="{ width: lesson.completionRate + '%' }">
                      {{ Math.round(lesson.completionRate) }}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="modern-card">
            <div class="card-body">
              <h6 class="card-title">توزیع سطح پیشرفت</h6>
              <div class="progress-distribution">
                <div class="distribution-item">
                  <span class="level excellent">پیشرفته (90-100%)</span>
                  <span class="count">{{ progressDistribution.excellent }} نفر</span>
                </div>
                <div class="distribution-item">
                  <span class="level good">خوب (70-89%)</span>
                  <span class="count">{{ progressDistribution.good }} نفر</span>
                </div>
                <div class="distribution-item">
                  <span class="level average">متوسط (50-69%)</span>
                  <span class="count">{{ progressDistribution.average }} نفر</span>
                </div>
                <div class="distribution-item">
                  <span class="level poor">ضعیف (0-49%)</span>
                  <span class="count">{{ progressDistribution.poor }} نفر</span>
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
              <h6 class="card-title">دروس چالش‌برانگیز</h6>
              <div class="difficult-lessons-list">
                <div v-for="lesson in difficultLessons" :key="lesson.id" class="difficulty-item">
                  <div class="lesson-header">
                    <h6>{{ lesson.title }}</h6>
                    <span class="difficulty-badge" :class="getDifficultyClass(lesson.difficultyScore)">
                      {{ getDifficultyLabel(lesson.difficultyScore) }}
                    </span>
                  </div>
                  <div class="lesson-metrics">
                    <div class="metric">
                      <i class="fas fa-clock text-warning"></i>
                      <span>میانگین زمان: {{ Math.round(lesson.averageTime / 60) }} دقیقه</span>
                    </div>
                    <div class="metric">
                      <i class="fas fa-percentage text-info"></i>
                      <span>نرخ تکمیل: {{ Math.round(lesson.completionRate) }}%</span>
                    </div>
                    <div class="metric">
                      <i class="fas fa-users text-primary"></i>
                      <span>{{ lesson.strugglingStudents }} دانش‌آموز نیاز به کمک</span>
                    </div>
                  </div>
                  <div class="lesson-actions">
                    <button class="btn btn-sm btn-outline-primary" @click="viewLessonDetails(lesson)">
                      <i class="fas fa-eye me-1"></i>جزئیات
                    </button>
                    <button class="btn btn-sm btn-outline-success" @click="generateRecommendations(lesson)">
                      <i class="fas fa-lightbulb me-1"></i>پیشنهادات
                    </button>
                  </div>
                </div>
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
                  <span class="stat-label">دروس آسان</span>
                  <span class="stat-value text-success">{{ lessonStats.easy }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">دروس متوسط</span>
                  <span class="stat-value text-warning">{{ lessonStats.medium }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">دروس سخت</span>
                  <span class="stat-value text-danger">{{ lessonStats.hard }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Participation Analysis -->
      <div v-if="analysisType === 'participation'" class="row">
        <div class="col-md-6">
          <div class="modern-card">
            <div class="card-body">
              <h6 class="card-title">مشارکت بر اساس نوع فعالیت</h6>
              <div class="participation-metrics">
                <div class="participation-item">
                  <div class="activity-header">
                    <i class="fas fa-book text-primary"></i>
                    <span>مطالعه محتوا</span>
                  </div>
                  <div class="activity-stats">
                    <span class="percentage">{{ participationStats.contentStudy }}%</span>
                    <div class="progress">
                      <div class="progress-bar bg-primary" :style="{ width: participationStats.contentStudy + '%' }"></div>
                    </div>
                  </div>
                </div>

                <div class="participation-item">
                  <div class="activity-header">
                    <i class="fas fa-comments text-success"></i>
                    <span>فعالیت چت</span>
                  </div>
                  <div class="activity-stats">
                    <span class="percentage">{{ participationStats.chatActivity }}%</span>
                    <div class="progress">
                      <div class="progress-bar bg-success" :style="{ width: participationStats.chatActivity + '%' }"></div>
                    </div>
                  </div>
                </div>

                <div class="participation-item">
                  <div class="activity-header">
                    <i class="fas fa-file-alt text-warning"></i>
                    <span>ارسال تکلیف</span>
                  </div>
                  <div class="activity-stats">
                    <span class="percentage">{{ participationStats.assignmentSubmission }}%</span>
                    <div class="progress">
                      <div class="progress-bar bg-warning" :style="{ width: participationStats.assignmentSubmission + '%' }"></div>
                    </div>
                  </div>
                </div>

                <div class="participation-item">
                  <div class="activity-header">
                    <i class="fas fa-clipboard-check text-info"></i>
                    <span>شرکت در آزمون</span>
                  </div>
                  <div class="activity-stats">
                    <span class="percentage">{{ participationStats.examParticipation }}%</span>
                    <div class="progress">
                      <div class="progress-bar bg-info" :style="{ width: participationStats.examParticipation + '%' }"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="modern-card">
            <div class="card-body">
              <h6 class="card-title">روند مشارکت در زمان</h6>
              <div class="timeline-chart">
                <canvas ref="timelineChart" width="400" height="300"></canvas>
              </div>
              <div v-if="participationTimeline.length > 0" class="timeline-info mt-3">
                <small class="text-muted">
                  آخرین بروزرسانی: {{ participationTimeline.length }} هفته گذشته
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Time Analysis -->
      <div v-if="analysisType === 'time'" class="row">
        <div class="col-md-8">
          <div class="modern-card">
            <div class="card-body">
              <h6 class="card-title">توزیع زمان مطالعه</h6>
              <div class="time-distribution">
                <div class="time-item" v-for="range in timeDistribution" :key="range.label">
                  <div class="time-label">{{ range.label }}</div>
                  <div class="time-bar">
                    <div
                        class="time-fill"
                        :style="{ width: range.percentage + '%', backgroundColor: range.color }">
                    </div>
                    <span class="time-count">{{ range.count }} نفر</span>
                  </div>
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
                <div class="time-stat">
                  <i class="fas fa-clock text-primary"></i>
                  <div class="stat-info">
                    <span class="stat-value">{{ timeStats.averageDaily }}h</span>
                    <span class="stat-label">میانگین روزانه</span>
                  </div>
                </div>
                <div class="time-stat">
                  <i class="fas fa-calendar-week text-success"></i>
                  <div class="stat-info">
                    <span class="stat-value">{{ timeStats.averageWeekly }}h</span>
                    <span class="stat-label">میانگین هفتگی</span>
                  </div>
                </div>
                <div class="time-stat">
                  <i class="fas fa-users text-info"></i>
                  <div class="stat-info">
                    <span class="stat-value">{{ courseStats.totalStudents }}</span>
                    <span class="stat-label">کل دانش‌آموزان</span>
                  </div>
                </div>
                <div class="time-stat">
                  <i class="fas fa-chart-line text-warning"></i>
                  <div class="stat-info">
                    <span class="stat-value">{{ courseStats.averageTimeSpent }}h</span>
                    <span class="stat-label">میانگین کل</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Score Distribution -->
      <div v-if="analysisType === 'scores'" class="row">
        <div class="col-md-8">
          <div class="modern-card">
            <div class="card-body">
              <h6 class="card-title">توزیع نمرات {{ selectedExamTitle }}</h6>
              <div class="score-chart">
                <canvas ref="scoresChart" width="600" height="400"></canvas>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="modern-card">
            <div class="card-body">
              <h6 class="card-title">آمار نمرات</h6>
              <div class="score-stats">
                <div class="score-stat">
                  <span class="stat-label">کل آزمون‌ها</span>
                  <span class="stat-value">{{ availableExams.length }}</span>
                </div>
                <div class="score-stat">
                  <span class="stat-label">میانگین</span>
                  <span class="stat-value">{{ scoreStats.average }}/20</span>
                </div>
                <div class="score-stat">
                  <span class="stat-label">بالاترین نمره</span>
                  <span class="stat-value">{{ scoreStats.highest }}/20</span>
                </div>
                <div class="score-stat">
                  <span class="stat-label">پایین‌ترین نمره</span>
                  <span class="stat-value">{{ scoreStats.lowest }}/20</span>
                </div>
                <div class="score-stat">
                  <span class="stat-label">نرخ قبولی</span>
                  <span class="stat-value">{{ scoreStats.passRate }}%</span>
                </div>
              </div>

              <div class="grade-distribution mt-3">
                <div class="grade-item">
                  <span class="grade-label excellent">عالی (18-20)</span>
                  <span class="grade-count">{{ gradeDistribution.excellent }} نفر</span>
                </div>
                <div class="grade-item">
                  <span class="grade-label good">خوب (15-17)</span>
                  <span class="grade-count">{{ gradeDistribution.good }} نفر</span>
                </div>
                <div class="grade-item">
                  <span class="grade-label average">متوسط (12-14)</span>
                  <span class="grade-count">{{ gradeDistribution.average }} نفر</span>
                </div>
                <div class="grade-item">
                  <span class="grade-label poor">ضعیف (0-11)</span>
                  <span class="grade-count">{{ gradeDistribution.poor }} نفر</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Export and Actions -->
      <div class="mt-4">
        <div class="modern-card">
          <div class="card-body">
            <h6 class="card-title">عملیات</h6>
            <div class="d-flex gap-2 flex-wrap">
              <button class="btn btn-success" @click="exportData" :disabled="loading">
                <i class="fas fa-download me-1"></i>
                خروجی Excel
              </button>
              <button class="btn btn-info" @click="generateReport" :disabled="loading">
                <i class="fas fa-file-pdf me-1"></i>
                گزارش PDF
              </button>
              <button class="btn btn-primary" @click="shareAnalysis" :disabled="loading">
                <i class="fas fa-share me-1"></i>
                اشتراک‌گذاری
              </button>
              <button class="btn btn-warning" @click="scheduleReport" :disabled="loading">
                <i class="fas fa-calendar me-1"></i>
                گزارش دوره‌ای
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!selectedCourse && !loading" class="text-center py-5">
      <i class="fas fa-chart-line fa-3x text-muted mb-3"></i>
      <h5 class="text-muted">لطفاً یک دوره انتخاب کنید</h5>
      <p class="text-muted">برای مشاهده تحلیل عملکرد، ابتدا دوره مورد نظر را انتخاب کنید.</p>
    </div>

    <!-- Error State -->
    <div v-if="error" class="alert alert-danger" role="alert">
      <i class="fas fa-exclamation-triangle me-2"></i>
      {{ error }}
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
      } catch (err) {
        error.value = 'خطا در دریافت لیست دوره‌ها';
        console.error('Error fetching courses:', err);
      } finally {
        loading.value = false;
      }
    };

    const fetchAnalyticsData = async () => {
      if (!selectedCourse.value) return;

      try {
        loading.value = true;
        error.value = null;

        // Fetch all analytics data based on analysis type
        await Promise.all([
          fetchCourseStats(),
          fetchAnalysisSpecificData()
        ]);

        // Update charts
        await nextTick();
        updateCharts();
      } catch (err) {
        error.value = 'خطا در دریافت داده‌های تحلیلی';
        console.error('Error fetching analytics:', err);
      } finally {
        loading.value = false;
      }
    };

    const fetchCourseStats = async () => {
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
        totalStudents: performanceData.studentCount || 0,
        averageProgress: Math.round(performanceData.averageProgress || 0),
        averageTimeSpent: Math.round((timeData.averageTimePerStudent || 0) / 60), // Convert to hours
        completionRate: Math.round(performanceData.completionRate || 0)
      };
    };

    const fetchAnalysisSpecificData = async () => {
      switch (analysisType.value) {
        case 'progress':
          await fetchProgressAnalysis();
          break;
        case 'difficult':
          await fetchDifficultLessonsAnalysis();
          break;
        case 'participation':
          await fetchParticipationAnalysis();
          break;
        case 'time':
          await fetchTimeAnalysis();
          break;
        case 'scores':
          await fetchExamData();
          await fetchScoreDistribution();
          break;
      }
    };

    const fetchProgressAnalysis = async () => {
      // Fetch lesson performance
      const response = await axios.get('/analytics/teacher/lesson-performance', {
        params: { period: selectedPeriod.value }
      });

      // Filter lessons for the selected course
      lessonProgress.value = response.data
          .filter(lesson => lesson.courseId === selectedCourse.value)
          .map(lesson => ({
            ...lesson,
            completionRate: (lesson.completedStudents / courseStats.value.totalStudents) * 100
          }));

      // Calculate progress distribution
      calculateProgressDistribution();
    };

    const calculateProgressDistribution = () => {
      const students = courseStats.value.totalStudents;
      if (students === 0) return;

      // Simulate distribution based on average progress
      const avgProgress = courseStats.value.averageProgress;

      progressDistribution.value = {
        excellent: Math.round(students * 0.2),
        good: Math.round(students * 0.35),
        average: Math.round(students * 0.3),
        poor: Math.round(students * 0.15)
      };
    };

    const fetchDifficultLessonsAnalysis = async () => {
      const response = await axios.get(`/analytics/teacher/course/${selectedCourse.value}/difficult-lessons`, {
        params: { period: selectedPeriod.value }
      });

      difficultLessons.value = response.data.map(lesson => ({
        ...lesson,
        difficultyScore: calculateDifficultyScore(lesson),
        strugglingStudents: Math.round(courseStats.value.totalStudents * (1 - lesson.completionRate / 100) * 0.3)
      }));

      // Calculate lesson stats
      lessonStats.value = {
        easy: difficultLessons.value.filter(l => l.difficultyScore < 30).length,
        medium: difficultLessons.value.filter(l => l.difficultyScore >= 30 && l.difficultyScore < 70).length,
        hard: difficultLessons.value.filter(l => l.difficultyScore >= 70).length
      };
    };

    const calculateDifficultyScore = (lesson) => {
      const timeWeight = Math.min((lesson.averageTime / 3600), 1) * 40; // Max 40 points for time
      const completionWeight = (100 - lesson.completionRate) * 0.6; // Max 60 points for low completion
      return Math.round(timeWeight + completionWeight);
    };

    const fetchParticipationAnalysis = async () => {
      const response = await axios.get(`/analytics/course/${selectedCourse.value}/activity-stats`, {
        params: { period: selectedPeriod.value, includeTimeline: true }
      });

      const data = response.data;

      participationStats.value = {
        contentStudy: Math.round(data.participationMetrics?.contentStudy?.participationRate || 0),
        chatActivity: Math.round(data.participationMetrics?.chatActivity?.participationRate || 0),
        assignmentSubmission: Math.round(data.participationMetrics?.assignmentSubmission?.participationRate || 0),
        examParticipation: Math.round(data.participationMetrics?.examParticipation?.participationRate || 0)
      };

      // Store engagement timeline for chart
      participationTimeline.value = data.engagementTrend || [];
    };

    const fetchTimeAnalysis = async () => {
      const response = await axios.get(`/analytics/course/${selectedCourse.value}/time-distribution`, {
        params: { period: selectedPeriod.value, includeTimeline: true }
      });

      const data = response.data;

      timeStats.value = {
        averageDaily: Math.round(data.averageTimePerStudent / 60), // Convert to hours
        averageWeekly: Math.round((data.averageTimePerStudent * 7) / 60),
        mostActive: Math.round((data.timeDistribution?.ranges?.slice(-1)[0]?.maxTime || 300) / 60)
      };

      // Use actual time distribution from API
      timeDistribution.value = data.timeDistribution?.ranges?.map(range => ({
        label: range.label,
        count: range.studentCount,
        percentage: range.percentage,
        color: getTimeRangeColor(range.percentage)
      })) || [];
    };

    const fetchExamData = async () => {
      const response = await axios.get('/exams/teaching');
      // Filter exams for the selected course
      const courseExams = response.data.filter(exam =>
          exam.lesson && exam.lesson.course &&
          exam.lesson.course.id === selectedCourse.value &&
          exam.status === 'FINALIZED'
      );
      availableExams.value = courseExams;
    };

    const fetchScoreDistribution = async () => {
      const params = { period: selectedPeriod.value };
      if (selectedExam.value) {
        params.examId = selectedExam.value;
      }

      const response = await axios.get(`/analytics/course/${selectedCourse.value}/exam-scores`, {
        params
      });

      const data = response.data;

      scoreStats.value = {
        average: Math.round(data.averageScore || 0),
        highest: data.highestScore || 0,
        lowest: data.lowestScore || 0,
        passRate: Math.round(data.passRate || 0)
      };

      gradeDistribution.value = {
        excellent: data.gradeDistribution?.excellent || 0,
        good: data.gradeDistribution?.good || 0,
        average: data.gradeDistribution?.average || 0,
        poor: data.gradeDistribution?.poor || 0
      };
    };

    const updateCharts = () => {
      switch (analysisType.value) {
        case 'progress':
          drawProgressChart();
          break;
        case 'difficult':
          drawDifficultyChart();
          break;
        case 'participation':
          drawParticipationChart();
          break;
        case 'time':
          drawTimeChart();
          break;
        case 'scores':
          drawScoresChart();
          break;
      }
    };

    const drawProgressChart = () => {
      if (!analyticsChart.value) return;

      const ctx = analyticsChart.value.getContext('2d');
      const canvas = analyticsChart.value;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (lessonProgress.value.length === 0) {
        drawEmptyState(ctx, 'داده‌ای برای نمایش موجود نیست');
        return;
      }

      // Draw bar chart for lesson progress
      const barWidth = (canvas.width - 100) / lessonProgress.value.length;
      const maxHeight = canvas.height - 100;

      lessonProgress.value.forEach((lesson, index) => {
        const x = 50 + index * barWidth;
        const height = (lesson.completionRate / 100) * maxHeight;
        const y = canvas.height - 50 - height;

        // Draw bar
        ctx.fillStyle = getProgressBarColor(lesson.completionRate);
        ctx.fillRect(x, y, barWidth - 10, height);

        // Draw label
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.save();
        ctx.translate(x + barWidth/2, canvas.height - 20);
        ctx.rotate(-Math.PI/4);
        ctx.fillText(lesson.title.substring(0, 15) + '...', 0, 0);
        ctx.restore();

        // Draw percentage
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

      // Draw scatter plot for difficulty vs completion rate
      ctx.strokeStyle = '#ccc';
      ctx.lineWidth = 1;

      // Draw axes
      ctx.beginPath();
      ctx.moveTo(50, 50);
      ctx.lineTo(50, canvas.height - 50);
      ctx.lineTo(canvas.width - 50, canvas.height - 50);
      ctx.stroke();

      // Draw data points
      difficultLessons.value.forEach((lesson, index) => {
        const x = 50 + (lesson.difficultyScore / 100) * (canvas.width - 100);
        const y = canvas.height - 50 - (lesson.completionRate / 100) * (canvas.height - 100);

        ctx.fillStyle = getDifficultyColor(lesson.difficultyScore);
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, 2 * Math.PI);
        ctx.fill();
      });

      // Draw labels
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
        // Fallback to bar chart if no timeline data
        drawParticipationBarChart(ctx, canvas);
        return;
      }

      // Draw timeline chart with real data
      const timeline = participationTimeline.value;
      const margin = 50;
      const chartWidth = canvas.width - 2 * margin;
      const chartHeight = canvas.height - 2 * margin;

      // Draw axes
      ctx.strokeStyle = '#ddd';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(margin, margin);
      ctx.lineTo(margin, margin + chartHeight);
      ctx.lineTo(margin + chartWidth, margin + chartHeight);
      ctx.stroke();

      // Draw lines for each activity type
      const activities = ['contentViews', 'chatMessages', 'assignments', 'examAttempts'];
      const colors = ['#007bff', '#28a745', '#ffc107', '#17a2b8'];
      const labels = ['مشاهده محتوا', 'پیام‌های چت', 'تکالیف', 'آزمون‌ها'];

      activities.forEach((activity, index) => {
        const values = timeline.map(item => item[activity] || 0);
        const maxValue = Math.max(...values, 1);

        ctx.strokeStyle = colors[index];
        ctx.lineWidth = 2;
        ctx.beginPath();

        values.forEach((value, i) => {
          const x = margin + (i / (values.length - 1 || 1)) * chartWidth;
          const y = margin + chartHeight - (value / maxValue) * chartHeight;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        });

        ctx.stroke();

        // Draw legend
        const legendY = 10 + index * 20;
        ctx.fillStyle = colors[index];
        ctx.fillRect(10, legendY, 15, 15);
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.fillText(labels[index], 30, legendY + 12);
      });
    };

    const drawParticipationBarChart = (ctx, canvas) => {
      // Draw participation timeline (simplified)
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

        // Labels
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

      // Draw horizontal bar chart
      const barHeight = (canvas.height - 100) / timeDistribution.value.length;
      const maxWidth = canvas.width - 150;

      timeDistribution.value.forEach((range, index) => {
        const y = 50 + index * barHeight;
        const width = (range.percentage / 100) * maxWidth;

        ctx.fillStyle = range.color;
        ctx.fillRect(100, y, width, barHeight - 10);

        // Labels
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

      // Draw histogram of score distribution
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

        // Labels
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
      if (percentage >= 40) return '#28a745'; // Green for high activity
      if (percentage >= 20) return '#007bff'; // Blue for medium-high
      if (percentage >= 10) return '#ffc107'; // Yellow for medium
      return '#dc3545'; // Red for low activity
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
      // Implementation for viewing lesson details
      console.log('View lesson details:', lesson);
    };

    const generateRecommendations = (lesson) => {
      // Implementation for generating recommendations
      console.log('Generate recommendations for:', lesson);
    };

    const exportData = () => {
      // Implementation for exporting data
      console.log('Export data');
    };

    const generateReport = () => {
      // Implementation for generating PDF report
      console.log('Generate PDF report');
    };

    const shareAnalysis = () => {
      // Implementation for sharing analysis
      console.log('Share analysis');
    };

    const scheduleReport = () => {
      // Implementation for scheduling periodic reports
      console.log('Schedule report');
    };

    // Watchers
    watch(selectedPeriod, () => {
      if (selectedCourse.value) {
        fetchAnalyticsData();
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
      exportData,
      generateReport,
      shareAnalysis,
      scheduleReport
    };
  }
};
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
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
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
  font-weight: 500;
}

.activity-stats {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.percentage {
  font-weight: bold;
  min-width: 50px;
}

.time-distribution {
  padding: 1rem 0;
}

.time-item {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  gap: 1rem;
}

.time-label {
  min-width: 150px;
  font-size: 0.9rem;
}

.time-bar {
  flex: 1;
  height: 30px;
  background: #f8f9fa;
  border-radius: 15px;
  position: relative;
  display: flex;
  align-items: center;
  padding: 0 0.5rem;
}

.time-fill {
  height: 100%;
  border-radius: 15px;
  position: absolute;
  left: 0;
  top: 0;
}

.time-count {
  position: relative;
  z-index: 1;
  font-size: 0.9rem;
  font-weight: 500;
}

.time-stats {
  padding: 1rem 0;
}

.time-stat {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 1.2rem;
  font-weight: bold;
  color: #495057;
}

.stat-label {
  font-size: 0.9rem;
  color: #6c757d;
}

.score-stats {
  padding: 1rem 0;
}

.score-stat {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #dee2e6;
}

.grade-distribution {
  padding-top: 1rem;
  border-top: 1px solid #dee2e6;
}

.grade-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
}

.grade-label {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.9rem;
}

.grade-label.excellent { background: #d4edda; color: #155724; }
.grade-label.good { background: #d1ecf1; color: #0c5460; }
.grade-label.average { background: #fff3cd; color: #856404; }
.grade-label.poor { background: #f8d7da; color: #721c24; }

.grade-count {
  font-weight: 500;
}

/* Responsive design */
@media (max-width: 768px) {
  .metric-card {
    flex-direction: column;
    text-align: center;
  }

  .metric-icon {
    margin: 0 0 0.5rem 0;
  }

  .lesson-metrics {
    flex-direction: column;
    gap: 0.5rem;
  }

  .activity-stats {
    flex-direction: column;
    gap: 0.5rem;
  }

  .time-item {
    flex-direction: column;
    align-items: stretch;
  }
}

/* Chart responsiveness */
canvas {
  max-width: 100%;
  height: auto;
}

/* Loading and error states */
.alert {
  border-radius: 8px;
}

/* Action buttons */
.btn {
  border-radius: 6px;
  font-weight: 500;
}

.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}
</style>