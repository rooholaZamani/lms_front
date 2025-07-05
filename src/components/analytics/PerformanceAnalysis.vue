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

              <!-- انتخاب دوره زمانی -->
              <select v-model="selectedPeriod" class="form-select" @change="fetchAnalyticsData">
                <option value="week">هفته گذشته</option>
                <option value="month">ماه گذشته</option>
                <option value="quarter">سه ماه گذشته</option>
              </select>

              <!-- نوع تحلیل -->
              <select v-model="analysisType" class="form-select">
                <option value="progress">پیشرفت</option>
                <option value="time">زمان مطالعه</option>
                <option value="questions">سوالات دشوار</option>
                <option value="risk">دانش‌آموزان در معرض خطر</option>
                <option value="trend">روند کلی</option>
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
              <h4 class="stat-number">{{ courseStats.averageProgress }}%</h4>
              <p class="stat-label">میانگین پیشرفت</p>
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
              <h4 class="stat-number">{{ courseStats.completionRate }}%</h4>
              <p class="stat-label">نرخ تکمیل</p>
            </div>
          </div>
        </div>
      </div>

      <!-- تحلیل پیشرفت -->
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
                <div class="progress-item">
                  <span class="progress-label">عالی (90-100%)</span>
                  <span class="progress-count">{{ progressDistribution.excellent }}</span>
                </div>
                <div class="progress-item">
                  <span class="progress-label">خوب (70-89%)</span>
                  <span class="progress-count">{{ progressDistribution.good }}</span>
                </div>
                <div class="progress-item">
                  <span class="progress-label">متوسط (50-69%)</span>
                  <span class="progress-count">{{ progressDistribution.average }}</span>
                </div>
                <div class="progress-item">
                  <span class="progress-label">ضعیف (زیر 50%)</span>
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
                    type="activity"
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
                  <span class="stat-label">میانگین روزانه</span>
                  <span class="stat-value">{{ formatTime(timeStats.averageDailyTime) }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">بیشترین زمان</span>
                  <span class="stat-value">{{ formatTime(timeStats.maxDailyTime) }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">کمترین زمان</span>
                  <span class="stat-value">{{ formatTime(timeStats.minDailyTime) }}</span>
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
                    v-for="question in challengingQuestions"
                    :key="question.id"
                    class="question-item"
                >
                  <div class="question-info">
                    <h6>{{ question.title }}</h6>
                    <p>{{ question.description }}</p>
                    <div class="question-stats">
                      <span class="stat">
                        <i class="fas fa-users"></i>
                        {{ question.attemptCount }} تلاش
                      </span>
                      <span class="stat">
                        <i class="fas fa-percent"></i>
                        {{ question.successRate }}% موفقیت
                      </span>
                      <span class="stat difficulty">
                        <i class="fas fa-exclamation-triangle"></i>
                        سختی: {{ question.difficultyLevel }}
                      </span>
                    </div>
                  </div>
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
                    v-for="student in atRiskStudents"
                    :key="student.id"
                    class="student-item"
                >
                  <div class="student-info">
                    <div class="student-name">{{ student.name }}</div>
                    <div class="risk-factors">
                      <span
                          v-for="factor in student.riskFactors"
                          :key="factor"
                          class="risk-badge"
                      >
                        {{ getRiskFactorLabel(factor) }}
                      </span>
                    </div>
                    <div class="student-stats">
                      <span>پیشرفت: {{ student.progress }}%</span>
                      <span>نمره: {{ student.averageScore }}%</span>
                      <span>فعالیت: {{ student.lastActivity }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="modern-card">
            <div class="card-body">
              <h6 class="card-title">عوامل خطر</h6>
              <div class="risk-factors-summary">
                <div class="risk-factor">
                  <span class="factor-label">حضور پایین</span>
                  <span class="factor-count">{{ riskFactors.lowAttendance }}</span>
                </div>
                <div class="risk-factor">
                  <span class="factor-label">عملکرد ضعیف</span>
                  <span class="factor-count">{{ riskFactors.poorPerformance }}</span>
                </div>
                <div class="risk-factor">
                  <span class="factor-label">عدم فعالیت</span>
                  <span class="factor-count">{{ riskFactors.inactivity }}</span>
                </div>
                <div class="risk-factor">
                  <span class="factor-label">مسائل رفتاری</span>
                  <span class="factor-count">{{ riskFactors.behavioralIssues }}</span>
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

    // Course data
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

    // Time analysis data
    const timeDistributionData = ref([]);
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
        label: lesson.title || lesson.name,
        score: lesson.averageScore || 0,
        students: lesson.studentCount || 0,
        completed: lesson.completedCount || 0
      }));
    });

    const timeDistributionChartData = computed(() => {
      return timeDistributionData.value.map(item => ({
        label: item.date || item.period,
        value: item.totalTime || item.time || 0,
        students: item.activeStudents || 0
      }));
    });

    const trendChartData = computed(() => {
      return trendData.value.map(item => ({
        label: item.date || item.period,
        value: item.averageScore || item.score || 0,
        secondary: item.participation || 0
      }));
    });

    // Methods
    const formatTime = (minutes) => {
      if (!minutes) return '0 دقیقه';
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      if (hours > 0) {
        return `${hours} ساعت ${mins} دقیقه`;
      }
      return `${mins} دقیقه`;
    };

    const getRiskFactorLabel = (factor) => {
      const labels = {
        'LOW_ATTENDANCE': 'حضور پایین',
        'POOR_PERFORMANCE': 'عملکرد ضعیف',
        'INACTIVITY': 'عدم فعالیت',
        'BEHAVIORAL_ISSUES': 'مسائل رفتاری'
      };
      return labels[factor] || factor;
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

    const fetchCourseStats = async (courseId) => {
      try {
        const stats = await analytics.fetchCoursePerformance(courseId);
        courseStats.value = {
          totalStudents: stats.studentCount || 0,
          averageProgress: Math.round(stats.averageProgress || 0),
          averageTimeSpent: stats.averageTimeSpent || 0,
          completionRate: Math.round(stats.completionRate || 0)
        };
      } catch (err) {
        console.error('Error fetching course stats:', err);
      }
    };

    const fetchProgressData = async (courseId) => {
      try {
        const response = await analytics.fetchLessonPerformanceAnalysis();

        if (response && response.lessons) {
          lessonProgress.value = response.lessons;

          // محاسبه توزیع پیشرفت
          const total = response.lessons.length;
          const excellent = response.lessons.filter(l => l.averageScore >= 90).length;
          const good = response.lessons.filter(l => l.averageScore >= 70 && l.averageScore < 90).length;
          const average = response.lessons.filter(l => l.averageScore >= 50 && l.averageScore < 70).length;
          const poor = response.lessons.filter(l => l.averageScore < 50).length;

          progressDistribution.value = {
            excellent,
            good,
            average,
            poor
          };
        }
      } catch (err) {
        console.error('Error fetching progress data:', err);
      }
    };

    const fetchTimeData = async (courseId) => {
      try {
        const response = await analytics.fetchTimeDistribution(courseId, selectedPeriod.value);

        if (response) {
          timeDistributionData.value = response.distribution || [];
          timeStats.value = {
            totalStudyTime: response.totalTime || 0,
            averageDailyTime: response.averageDaily || 0,
            maxDailyTime: response.maxDaily || 0,
            minDailyTime: response.minDaily || 0
          };
        }
      } catch (err) {
        console.error('Error fetching time data:', err);
      }
    };

    const fetchQuestionData = async () => {
      try {
        const response = await analytics.fetchChallengingQuestions();

        if (response) {
          challengingQuestions.value = response.questions || [];
          questionStats.value = {
            mostDifficult: response.mostDifficult || 0,
            averageDifficulty: response.averageDifficulty || 0,
            needsReview: response.needsReview || 0
          };
        }
      } catch (err) {
        console.error('Error fetching question data:', err);
      }
    };

    const fetchRiskData = async (courseId) => {
      try {
        const response = await analytics.fetchAtRiskStudents();

        if (response) {
          atRiskStudents.value = response.students || [];
          riskFactors.value = {
            lowAttendance: response.riskFactors?.lowAttendance || 0,
            poorPerformance: response.riskFactors?.poorPerformance || 0,
            inactivity: response.riskFactors?.inactivity || 0,
            behavioralIssues: response.riskFactors?.behavioralIssues || 0
          };
        }
      } catch (err) {
        console.error('Error fetching risk data:', err);
      }
    };

    const fetchTrendData = async (courseId) => {
      try {
        const response = await analytics.fetchEngagementTrends();

        if (response) {
          trendData.value = response.trends || [];
        }
      } catch (err) {
        console.error('Error fetching trend data:', err);
      }
    };

    const fetchAnalyticsData = async () => {
      if (!selectedCourse.value) return;

      loading.value = true;
      error.value = null;

      try {
        await fetchCourseStats(selectedCourse.value);

        switch (analysisType.value) {
          case 'progress':
            await fetchProgressData(selectedCourse.value);
            break;
          case 'time':
            await fetchTimeData(selectedCourse.value);
            break;
          case 'questions':
            await fetchQuestionData();
            break;
          case 'risk':
            await fetchRiskData(selectedCourse.value);
            break;
          case 'trend':
            await fetchTrendData(selectedCourse.value);
            break;
        }
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

      // Data
      courses,
      courseStats,
      lessonProgress,
      progressDistribution,
      timeDistributionData,
      timeStats,
      challengingQuestions,
      questionStats,
      atRiskStudents,
      riskFactors,
      trendData,

      // Computed
      progressChartData,
      timeDistributionChartData,
      trendChartData,

      // Methods
      formatTime,
      getRiskFactorLabel,
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
</style>