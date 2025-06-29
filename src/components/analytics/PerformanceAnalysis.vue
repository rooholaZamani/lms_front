<template>
  <div class="performance-analysis-container">
    <!-- Header Controls -->
    <div class="modern-card mb-4">
      <div class="card-body">
        <div class="row align-items-center">
          <div class="col-md-3">
            <label class="form-label">انتخاب درس:</label>
            <select v-model="selectedCourse" @change="updateAnalysisView" class="form-select">
              <option value="">انتخاب کنید</option>
              <option v-for="course in courses" :key="course.id" :value="course.id">
                {{ course.title }}
              </option>
            </select>
          </div>
          <div class="col-md-2">
            <label class="form-label">دوره زمانی:</label>
            <select v-model="selectedPeriod" class="form-select">
              <option value="week">هفته گذشته</option>
              <option value="month">ماه گذشته</option>
              <option value="quarter">سه ماه گذشته</option>
              <option value="semester">ترم جاری</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label">نوع تحلیل:</label>
            <select v-model="analysisType" class="form-select">
              <option value="progress">پیشرفت دانش‌آموزان</option>
              <option value="difficult">دروس دشوار</option>
              <option value="participation">میزان مشارکت</option>
              <option value="time">توزیع زمان مطالعه</option>
              <option value="scores">توزیع نمرات</option>
              <option value="challenging-questions">سوالات چالش‌برانگیز</option>
              <option value="at-risk-students">دانش‌آموزان در معرض خطر</option>
              <option value="trend-analysis">تحلیل روند زمانی</option>
            </select>
          </div>
          <div class="col-md-2" v-if="analysisType === 'scores'">
            <label class="form-label">آزمون:</label>
            <select v-model="selectedExam" class="form-select">
              <option value="">همه آزمون‌ها</option>
              <option v-for="exam in availableExams" :key="exam.id" :value="exam.id">
                {{ exam.title }}
              </option>
            </select>
          </div>
          <div class="col-md-2">
            <label class="form-label">&nbsp;</label>
            <div class="d-flex gap-2">
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
              <h6 class="card-title">{{ getChartTitle() }}</h6>
              <div class="chart-container">
                <canvas ref="analyticsChart" style="width: 100%; height: 400px;"></canvas>
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
                        نرخ خطا: {{ question.errorRate }}%
                      </span>
                      <span class="stat-item">
                        <i class="fas fa-clock text-warning"></i>
                        میانگین زمان: {{ question.averageTime }}s
                      </span>
                      <span class="stat-item">
                        <i class="fas fa-users text-info"></i>
                        تعداد پاسخ: {{ question.totalAnswers }}
                      </span>
                    </div>
                  </div>
                  <div class="question-actions">
                    <button @click="viewQuestionAnalysis(question)" class="btn btn-sm btn-outline-primary">
                      <i class="fas fa-chart-bar"></i> تحلیل تفصیلی
                    </button>
                    <button @click="generateQuestionHelp(question)" class="btn btn-sm btn-outline-success">
                      <i class="fas fa-lightbulb"></i> راهنمایی
                    </button>
                  </div>
                </div>
              </div>
              <div v-else class="text-center py-4">
                <i class="fas fa-info-circle text-muted mb-2"></i>
                <p class="text-muted">سوال چالش‌برانگیز در دسترس نیست</p>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="modern-card">
            <div class="card-body">
              <h6 class="card-title">آمار سوالات</h6>
              <div class="question-summary">
                <div class="stat-item">
                  <span>سخت‌ترین سوال:</span>
                  <span class="stat-value text-danger">{{ questionStats.mostDifficult }}%</span>
                </div>
                <div class="stat-item">
                  <span>میانگین دشواری:</span>
                  <span class="stat-value text-warning">{{ questionStats.averageDifficulty }}%</span>
                </div>
                <div class="stat-item">
                  <span>نیاز به بازنگری:</span>
                  <span class="stat-value text-info">{{ questionStats.needsReview }}</span>
                </div>
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
                  <div class="student-info">
                    <div class="student-header">
                      <h6 class="student-name">{{ student.firstName }} {{ student.lastName }}</h6>
                      <span class="badge" :class="getRiskLevelClass(student.riskLevel)">
                        {{ getRiskLevelText(student.riskLevel) }}
                      </span>
                    </div>
                    <div class="risk-factors">
                      <div v-if="student.factors.lowAttendance" class="risk-factor">
                        <i class="fas fa-calendar-times text-danger"></i>
                        حضور پایین: {{ student.factors.attendanceRate }}%
                      </div>
                      <div v-if="student.factors.poorPerformance" class="risk-factor">
                        <i class="fas fa-chart-line text-warning"></i>
                        عملکرد ضعیف: {{ student.factors.averageScore }}%
                      </div>
                      <div v-if="student.factors.inactivity" class="risk-factor">
                        <i class="fas fa-user-slash text-info"></i>
                        عدم فعالیت: {{ student.factors.daysSinceLastActivity }} روز
                      </div>
                      <div v-if="student.factors.behavioralIssues" class="risk-factor">
                        <i class="fas fa-exclamation-triangle text-danger"></i>
                        مشکلات رفتاری
                      </div>
                    </div>
                  </div>
                  <div class="student-actions">
                    <button @click="viewStudentDetails(student)" class="btn btn-sm btn-outline-primary">
                      <i class="fas fa-user"></i> جزئیات
                    </button>
                    <button @click="createInterventionPlan(student)" class="btn btn-sm btn-outline-warning">
                      <i class="fas fa-clipboard-list"></i> برنامه مداخله
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
                <canvas ref="trendChart" style="width: 100%; height: 500px;"></canvas>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Existing sections for other analysis types -->
      <!-- (keep existing difficult, participation, time, scores sections as they were) -->

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
    const trendChart = ref(null);

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

    // Other existing data
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
      return exam ? exam.title : 'نامشخص';
    });

    // API Methods
    const fetchCourses = async () => {
      try {
        const response = await axios.get('/courses/teaching');
        courses.value = response.data.courses || [];
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
        const promises = [];

        // Course stats
        promises.push(
            axios.get(`/analytics/course/${selectedCourse.value}/stats?period=${selectedPeriod.value}`)
                .then(response => {
                  courseStats.value = response.data;
                })
        );

        // Analysis type specific data
        switch (analysisType.value) {
          case 'progress':
            promises.push(fetchProgressData());
            break;
          case 'challenging-questions':
            promises.push(fetchChallengingQuestions());
            break;
          case 'at-risk-students':
            promises.push(fetchAtRiskStudents());
            break;
          case 'trend-analysis':
            promises.push(fetchTrendData());
            break;
            // Add other existing cases...
        }

        await Promise.all(promises);

        // Draw charts after data is loaded
        await nextTick();
        drawCharts();

      } catch (err) {
        console.error('Error fetching analytics data:', err);
        error.value = 'خطا در دریافت داده‌های تحلیلی';
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

    // Chart drawing methods
    const drawCharts = () => {
      switch (analysisType.value) {
        case 'progress':
          drawProgressChart();
          break;
        case 'trend-analysis':
          drawTrendChart();
          break;
          // Add other chart drawing methods...
      }
    };

    const drawProgressChart = () => {
      if (!analyticsChart.value || lessonProgress.value.length === 0) return;

      const ctx = analyticsChart.value.getContext('2d');

      // Clear any existing chart
      if (window.progressChartInstance) {
        window.progressChartInstance.destroy();
      }

      // Set canvas size properly
      const container = analyticsChart.value.parentElement;
      analyticsChart.value.width = container.offsetWidth;
      analyticsChart.value.height = 400;

      window.progressChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: lessonProgress.value.map(lesson => lesson.lessonTitle),
          datasets: [{
            label: 'نرخ تکمیل (%)',
            data: lessonProgress.value.map(lesson => lesson.completionRate),
            backgroundColor: '#3b82f6',
            borderColor: '#1d4ed8',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: 'top'
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              max: 100,
              ticks: {
                callback: function(value) {
                  return value + '%';
                }
              }
            }
          }
        }
      });
    };

    const drawTrendChart = () => {
      if (!trendChart.value || trendData.value.length === 0) return;

      const ctx = trendChart.value.getContext('2d');

      // Clear any existing chart
      if (window.trendChartInstance) {
        window.trendChartInstance.destroy();
      }

      // Set canvas size properly
      const container = trendChart.value.parentElement;
      trendChart.value.width = container.offsetWidth;
      trendChart.value.height = 500;

      window.trendChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
          labels: trendData.value.map(item => item.date),
          datasets: [
            {
              label: 'میانگین نمرات',
              data: trendData.value.map(item => item.averageScore),
              borderColor: '#10b981',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              tension: 0.4
            },
            {
              label: 'نرخ حضور',
              data: trendData.value.map(item => item.attendanceRate),
              borderColor: '#3b82f6',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              tension: 0.4
            },
            {
              label: 'میزان فعالیت',
              data: trendData.value.map(item => item.activityLevel),
              borderColor: '#f59e0b',
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              tension: 0.4
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            intersect: false,
            mode: 'index'
          },
          plugins: {
            legend: {
              display: true,
              position: 'top'
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              max: 100,
              ticks: {
                callback: function(value) {
                  return value + '%';
                }
              }
            }
          }
        }
      });
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

    const getChartTitle = () => {
      const titles = {
        progress: 'پیشرفت دانش‌آموزان در دروس',
        'challenging-questions': 'سوالات چالش‌برانگیز',
        'at-risk-students': 'دانش‌آموزان در معرض خطر',
        'trend-analysis': 'روند زمانی عملکرد',
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

    const exportData = () => {
      console.log('Export data functionality');
    };

    // New action handlers for new features
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

    watch(analysisType, async () => {
      if (selectedCourse.value) {
        await fetchAnalyticsData();
      }
    });

    // Handle window resize for charts
    const handleResize = () => {
      if (window.progressChartInstance) {
        window.progressChartInstance.resize();
      }
      if (window.trendChartInstance) {
        window.trendChartInstance.resize();
      }
    };

    // Lifecycle
    onMounted(() => {
      fetchCourses();
      window.addEventListener('resize', handleResize);
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
      trendChart,

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
      getRiskLevelClass,
      getRiskLevelText,
      getChartTitle,
      exportData,
      viewQuestionAnalysis,
      generateQuestionHelp,
      viewStudentDetails,
      createInterventionPlan,
      notifyParents
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

.chart-container canvas {
  max-width: 100% !important;
  height: auto !important;
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
</style>