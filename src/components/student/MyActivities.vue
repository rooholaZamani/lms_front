<template>
  <div class="my-activities-container">
    <!-- Page Header -->
    <div class="page-header">
      <h1 class="page-title">فعالیت‌های من</h1>
      <p class="page-description">مشاهده و تحلیل فعالیت‌های آموزشی شما</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">در حال بارگذاری...</span>
      </div>
    </div>

    <!-- Main Content -->
    <div v-else>
      <!-- Filters Section -->
      <div class="filters-section mb-4">
        <div class="row g-3 align-items-end">
          <div class="col-md-3">
            <div class="filter-group">
              <label class="form-label">دوره</label>
              <select v-model="selectedCourseId" @change="fetchData" class="form-select">
                <option value="">همه دوره‌ها</option>
                <option v-for="course in enrolledCourses" :key="course.id" :value="course.id">
                  {{ course.title }}
                </option>
              </select>
            </div>
          </div>
          <div class="col-md-3">
            <div class="filter-group">
              <label class="form-label">بازه زمانی</label>
              <select v-model="selectedTimeFilter" @change="fetchData" class="form-select">
                <option v-for="filter in timeFilters" :key="filter.value" :value="filter.value">
                  {{ filter.label }}
                </option>
              </select>
            </div>
          </div>

          <div class="col-md-3">
            <p class="mb-2 text-muted">مجموع فعالیت‌ها: {{ activities.length }}</p>
            <button @click="resetFilters" class="btn btn-primary">
              <i class="fas fa-refresh me-2"></i>
              بازنشانی فیلترها
            </button>
          </div>
        </div>
      </div>

      <!-- Summary Cards -->
      <div class="summary-cards row g-3 mb-4">
        <div class="col-lg-3 col-md-6">
          <div class="stat-card">
            <div class="stat-icon bg-primary text-white">
              <i class="fas fa-chart-line"></i>
            </div>
            <div class="stat-info">
              <h3 class="stat-number">{{ activitySummary.totalActivities }}</h3>
              <p class="stat-label">کل فعالیت‌ها</p>
            </div>
          </div>
        </div>
        <div class="col-lg-3 col-md-6">
          <div class="stat-card">
            <div class="stat-icon bg-success text-white">
              <i class="fas fa-clock"></i>
            </div>
            <div class="stat-info">
              <h3 class="stat-number">{{ formatDuration(activitySummary.totalTime) }}</h3>
              <p class="stat-label">کل زمان فعالیت</p>
            </div>
          </div>
        </div>
        <div class="col-lg-3 col-md-6">
          <div class="stat-card">
            <div class="stat-icon bg-info text-white">
              <i class="fas fa-book"></i>
            </div>
            <div class="stat-info">
              <h3 class="stat-number">{{ activitySummary.uniqueCourses }}</h3>
              <p class="stat-label">دوره‌های فعال</p>
            </div>
          </div>
        </div>
        <div class="col-lg-3 col-md-6">
          <div class="stat-card">
            <div class="stat-icon bg-warning text-white">
              <i class="fas fa-calendar"></i>
            </div>
            <div class="stat-info">
              <h3 class="stat-number">{{ activitySummary.activeDays }}</h3>
              <p class="stat-label">روزهای فعال</p>
            </div>
          </div>
        </div>

        <div class="col-lg-3 col-md-6">
          <div class="stat-card">
            <div class="stat-icon bg-info text-white">
              <i class="fas fa-star"></i>
            </div>
            <div class="stat-info">
              <h3 class="stat-number">{{ calculateAverageScore }}</h3>
              <p class="stat-label"> میانگین نمرات آزمون</p>
            </div>
          </div>
        </div>
        <div class="col-lg-3 col-md-6">
          <div class="stat-card">
            <div class="stat-icon bg-success text-white">
              <i class="fas fa-clipboard-check"></i>
            </div>
            <div class="stat-info">
              <h3 class="stat-number">{{ totalExams }}</h3>
              <p class="stat-label">تعداد آزمون‌ها</p>
            </div>
          </div>
        </div>
      </div>


      <!-- Charts Section -->
      <div class="charts-section row g-4 mb-4">
        <div class="col-lg-6">
          <div class="chart-card">
            <div class="chart-header">
              <h5>توزیع فعالیت‌ها</h5>
            </div>
            <div class="chart-container">
              <canvas ref="activityDistributionChart"></canvas>
            </div>
          </div>
        </div>
        <div class="col-lg-6">
          <div class="chart-card">
            <div class="chart-header">
              <h5>فعالیت روزانه</h5>
            </div>
            <div class="chart-container">
              <canvas ref="dailyActivityChart"></canvas>
            </div>
          </div>
        </div>
        <div class="col-lg-6">
          <div class="chart-card">
            <div class="chart-header">
              <h5>توزیع نمرات آزمون‌ها</h5>
            </div>
            <div class="chart-container">
              <canvas ref="examDistributionChartRef" v-if="!loading"></canvas>
              <div v-else class="text-center py-4">
                <i class="fas fa-spinner fa-spin fa-2x text-muted"></i>
                <p class="text-muted mt-2">در حال بارگذاری...</p>
              </div>
            </div>
          </div>
        </div>
        <div class="col-lg-6">
          <div class="chart-card">
            <div class="chart-header">
              <h5>توزیع نمرات تکالیف</h5>
            </div>
            <div class="chart-container">
              <canvas ref="assignmentDistributionChartRef" v-if="!loading"></canvas>
              <div v-else class="text-center py-4">
                <i class="fas fa-spinner fa-spin fa-2x text-muted"></i>
                <p class="text-muted mt-2">در حال بارگذاری...</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Activities List -->
      <div class="activities-section">
        <div class="section-header">
          <div class="activities-header d-flex justify-content-between align-items-center mb-3">
            <div>
              <h5 class="mb-1">
                <i class="fas fa-history text-info me-2"></i>
                فعالیت‌های اخیر
              </h5>
            </div>
            <div class="activity-filter">
              <select v-model="selectedActivityType" class="form-select form-select-sm" style="width: 200px;">
                <option value="">همه فعالیت‌ها</option>
                <option v-for="type in activityTypes" :key="type.value" :value="type.value">
                  {{ type.label }}
                </option>
              </select>
            </div>
          </div>
          <div class="view-toggles">
            <div class="btn-group" role="group">
              <button
                  type="button"
                  class="btn btn-outline-secondary"
                  :class="{ active: timelineView === 'timeline' }"
                  @click="timelineView = 'timeline'"
              >
                <i class="fas fa-list me-1"></i>
                جدول زمانی
              </button>
              <button
                  type="button"
                  class="btn btn-outline-secondary"
                  :class="{ active: timelineView === 'cards' }"
                  @click="timelineView = 'cards'"
              >
                <i class="fas fa-th me-1"></i>
                کارت‌ها
              </button>
            </div>
          </div>
        </div>

        <!-- Timeline View -->
        <div v-if="timelineView === 'timeline'" class="timeline-container">
          <div class="timeline">
            <div
                v-for="activity in filteredActivities"
                :key="activity.id"
                class="timeline-item"
                :class="`timeline-${getActivityClass(activity.type)}`"
            >
              <div class="timeline-marker">
                <i :class="getActivityIcon(activity.type)"></i>
              </div>
              <div class="timeline-content">
                <div class="timeline-header">
                  <div class="timeline-title">{{ getActivityDescription(activity) }}</div>
                  <div class="timeline-time">{{ formatDateTime(activity.timestamp) }}</div>
                </div>
                <div class="timeline-meta">
                  <span v-if="activity.courseName" class="badge badge-outline me-2">
                    {{ activity.courseName }}
                  </span>
                  <span v-if="activity.timeSpent" class="badge badge-time">
                    <i class="fas fa-clock me-1"></i>
                    {{ formatDuration(activity.timeSpent) }}
                  </span>
                </div>
                <div v-if="activity.metadata" class="timeline-details mt-2">
                  <small class="text-muted">{{ getEnhancedDescription(activity) }}</small>
                </div>
              </div>
            </div>
          </div>

          <!-- Load More Button -->
          <div v-if="hasMoreActivities" class="text-center mt-4">
            <button @click="loadMoreActivities" class="btn btn-outline-primary" :disabled="loadingMore">
              <span v-if="loadingMore" class="spinner-border spinner-border-sm me-2"></span>
              {{ loadingMore ? 'در حال بارگذاری...' : 'نمایش بیشتر' }}
            </button>
          </div>
        </div>

        <!-- Cards View -->
        <div v-else class="cards-container">
          <div class="row g-3">
            <div
                v-for="activity in filteredActivities"
                :key="activity.id"
                class="col-lg-4 col-md-6"
            >
              <div class="activity-card" :class="`activity-${getActivityClass(activity.type)}`">
                <div class="activity-card-header">
                  <div class="activity-icon">
                    <i :class="getActivityIcon(activity.type)"></i>
                  </div>
                  <div class="activity-type">{{ getActivityTypeName(activity.type) }}</div>
                </div>
                <div class="activity-card-body">
                  <h6 class="activity-title">{{ getActivityDescription(activity) }}</h6>
                  <p class="activity-details">{{ getEnhancedDescription(activity) }}</p>
                </div>
                <div class="activity-card-footer">
                  <div class="activity-meta">
                    <span class="activity-course">{{ activity.courseName }}</span>
                    <span class="activity-time">{{ formatDateTime(activity.timestamp) }}</span>
                  </div>
                  <div v-if="activity.timeSpent" class="activity-duration">
                    <i class="fas fa-clock me-1"></i>
                    {{ formatDuration(activity.timeSpent) }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="filteredActivities.length === 0" class="empty-state">
          <div class="empty-state-content">
            <div class="empty-state-icon">
              <i class="fas fa-chart-line"></i>
            </div>
            <h3 class="empty-state-title">هیچ فعالیتی یافت نشد</h3>
            <p class="empty-state-description">
              در بازه زمانی انتخاب شده فعالیتی ثبت نشده است.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {ref, reactive, onMounted, computed, nextTick, watch, onUnmounted} from 'vue'
import axios from 'axios'
import Chart from 'chart.js/auto'
import { useFormatters } from '@/composables/useFormatters.js'

export default {
  name: 'MyActivities',
  setup() {
    const { formatDate, formatTime } = useFormatters()

    // Reactive data
    const loading = ref(true)
    const loadingMore = ref(false)
    const selectedCourseId = ref('')
    const selectedTimeFilter = ref('month')
    const selectedActivityType = ref('')
    const timelineView = ref('timeline')
    const currentPage = ref(1)
    const hasMoreActivities = ref(false)

    const gradesDistribution = ref({
      excellent: 0,
      good: 0,
      average: 0,
      poor: 0
    })

    const examDistributionChart = ref(null)
    const assignmentDistributionChart = ref(null)
    const examDistributionChartRef = ref(null)
    const assignmentDistributionChartRef = ref(null)

    const examDistribution = ref({})
    const assignmentDistribution = ref({})


    const examScores = ref([])
    const assignmentScores = ref([])
    const gradeDistributionChart = ref(null)
    const gradeDistributionChartRef = ref(null)

    // Data storage
    const enrolledCourses = ref([])
    const activities = ref([])
    const activitySummary = reactive({
      totalActivities: 0,
      totalTime: 0,
      uniqueCourses: 0,
      activeDays: 0
    })

    // Chart references
    const activityDistributionChart = ref(null)
    const dailyActivityChart = ref(null)
    let distributionChartInstance = null
    let dailyChartInstance = null

    // Configuration data
    const timeFilters = [
      { value: 'week', label: 'یک هفته گذشته' },
      { value: 'month', label: 'یک ماه گذشته' },
      { value: '3months', label: 'سه ماه گذشته' },
      { value: 'semester', label: 'ترم جاری' }
    ]

    const activityTypes = [
      { value: 'CONTENT_VIEW', label: 'مشاهده محتوا' },
      { value: 'LESSON_COMPLETION', label: 'تکمیل درس' },
      { value: 'EXAM_SUBMISSION', label: 'شرکت در آزمون' },
      { value: 'ASSIGNMENT_SUBMISSION', label: 'ارسال تکلیف' },
      { value: 'CHAT_MESSAGE_SEND', label: 'ارسال پیام' },
      { value: 'LOGIN', label: 'ورود به سیستم' }
    ]

    // Computed properties
    const filteredActivities = computed(() => {
      if (!selectedActivityType.value) return activities.value
      return activities.value.filter(activity => activity.type === selectedActivityType.value)
    })

    // Methods
    const fetchEnrolledCourses = async () => {
      try {
        const response = await axios.get('/courses/enrolled')
        enrolledCourses.value = response.data
      } catch (error) {
        console.error('Error fetching enrolled courses:', error)
      }
    }

    // اضافه کردن این متدها در قسمت methods
    const fetchGradesData = async () => {
      try {
        const params = {
          timeFilter: selectedTimeFilter.value,
        }

        if (selectedCourseId.value) {
          params.courseId = selectedCourseId.value
        }

        const response = await axios.get('/analytics/student/grades-distribution', { params })

        examScores.value = response.data.examScores || []
        assignmentScores.value = response.data.assignmentScores || []
        examDistribution.value = response.data.examDistribution || {}
        assignmentDistribution.value = response.data.assignmentDistribution || {}


      } catch (error) {
        console.error('Error fetching grades data:', error)
      }
    }

    const createExamDistributionChart = () => {
      if (!examDistributionChartRef.value || Object.keys(examDistribution.value).length === 0) return

      const ctx = examDistributionChartRef.value.getContext('2d')

      if (examDistributionChart.value) {
        examDistributionChart.value.destroy()
      }

      examDistributionChart.value = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['ممتاز (18-20)', 'خوب (15-17)', 'متوسط (10-14)', 'ضعیف (0-9)'],
          datasets: [{
            data: [
              examDistribution.value.excellent || 0,
              examDistribution.value.good || 0,
              examDistribution.value.average || 0,
              examDistribution.value.poor || 0
            ],
            backgroundColor: ['#28a745', '#17a2b8', '#ffc107', '#dc3545'],
            borderWidth: 2,
            borderColor: '#fff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                font: { family: 'IRANSans' },
                padding: 15
              }
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const label = context.label || '';
                  const value = context.parsed || 0;
                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                  return `${label}: ${value} (${percentage}%)`;
                }
              }
            }
          }
        }
      })
    }

    const createAssignmentDistributionChart = () => {
      if (!assignmentDistributionChartRef.value || Object.keys(assignmentDistribution.value).length === 0) return

      const ctx = assignmentDistributionChartRef.value.getContext('2d')

      if (assignmentDistributionChart.value) {
        assignmentDistributionChart.value.destroy()
      }

      assignmentDistributionChart.value = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['ممتاز (18-20)', 'خوب (15-17)', 'متوسط (10-14)', 'ضعیف (0-9)'],
          datasets: [{
            data: [
              assignmentDistribution.value.excellent || 0,
              assignmentDistribution.value.good || 0,
              assignmentDistribution.value.average || 0,
              assignmentDistribution.value.poor || 0
            ],
            backgroundColor: ['#28a745', '#17a2b8', '#ffc107', '#dc3545'],
            borderWidth: 2,
            borderColor: '#fff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                font: { family: 'IRANSans' },
                padding: 15
              }
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const label = context.label || '';
                  const value = context.parsed || 0;
                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                  return `${label}: ${value} (${percentage}%)`;
                }
              }
            }
          }
        }
      })
    }

    const fetchData = async () => {
      loading.value = true
      currentPage.value = 1

      try {
        const params = {
          timeFilter: selectedTimeFilter.value,
          limit: 10
        }

        if (selectedCourseId.value) {
          params.courseId = selectedCourseId.value
        }

        const response = await axios.get('/analytics/student/my-activities', { params })

        activities.value = response.data.activities || []


        if (response.data.statistics) {
          activitySummary.totalActivities = response.data.statistics.totalActivities || 0
          activitySummary.totalTime = response.data.statistics.totalTime || 0
          activitySummary.uniqueCourses = response.data.statistics.uniqueCourses || 0
          activitySummary.activeDays = response.data.statistics.activeDays || 0
        }

        // updateActivitySummary()
        hasMoreActivities.value = activities.value.length >= 10

        await fetchGradesData()

        await nextTick()
        // if (activities.value.length > 0) {
        //   createCharts()
        // }

      } catch (error) {
        console.error('Error fetching activities:', error)
        activities.value = []
      } finally {
        loading.value = false
      }
    }
    const calculateAverageScore = computed(() => {
      if (!examScores.value || examScores.value.length === 0) return 0

      const total = examScores.value.reduce((sum, exam) => sum + (exam.score || 0), 0)
      return Math.round(total / examScores.value.length)
    })

    const totalExams = computed(() => {
      return examScores.value ? examScores.value.length : 0
    })

    const hasGradesData = computed(() => {
      return gradesDistribution.value &&
          (gradesDistribution.value.excellent > 0 ||
              gradesDistribution.value.good > 0 ||
              gradesDistribution.value.average > 0 ||
              gradesDistribution.value.poor > 0)
    })
    const loadMoreActivities = async () => {
      loadingMore.value = true
      currentPage.value++

      try {
        const params = {
          timeFilter: selectedTimeFilter.value,
          limit: 10,
          page: currentPage.value
        }

        if (selectedCourseId.value) {
          params.courseId = selectedCourseId.value
        }

        const response = await axios.get('/analytics/student/my-activities', { params })
        const newActivities = response.data.activities || []

        activities.value.push(...newActivities)
        hasMoreActivities.value = newActivities.length >= 50

      } catch (error) {
        console.error('Error loading more activities:', error)
      } finally {
        loadingMore.value = false
      }
    }

    const createCharts = () => {
      createDistributionChart()
      createDailyChart()
      createExamDistributionChart()
      createAssignmentDistributionChart()
    }

    const createDistributionChart = () => {
      if (distributionChartInstance) {
        distributionChartInstance.destroy()
      }

      const ctx = activityDistributionChart.value?.getContext('2d')

      if (!ctx || activities.value.length === 0) {
        console.log('Canvas not found or no activities data')
        return
      }
      if (!ctx) return

      const activityCounts = {}
      activities.value
        .filter(activity => activity.type !== 'FILE_ACCESS') // Filter out FILE_ACCESS activities
        .forEach(activity => {
          const typeName = getActivityTypeName(activity.type)
          activityCounts[typeName] = (activityCounts[typeName] || 0) + 1
        })

      const labels = Object.keys(activityCounts)
      const data = Object.values(activityCounts)

      distributionChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels,
          datasets: [{
            data,
            backgroundColor: [
              '#667eea',
              '#f093fb',
              '#ff6b6b',
              '#4ecdc4',
              '#45b7d1',
              '#f9ca24',
              '#f0932b'
            ]
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom'
            }
          }
        }
      })
    }

    const createDailyChart = () => {
      if (dailyChartInstance) {
        dailyChartInstance.destroy()
      }

      const ctx = dailyActivityChart.value?.getContext('2d')
      if (!ctx || activities.value.length === 0) {
        console.log('Canvas not found or no activities data')
        return
      }
      if (!ctx) return

      // Group activities by date
      const dailyData = {}
      activities.value.forEach(activity => {
        const date = new Date(activity.timestamp).toISOString().split('T')[0]
        dailyData[date] = (dailyData[date] || 0) + 1
      })

      const sortedDates = Object.keys(dailyData).sort()
      const labels = sortedDates.map(date => new Date(date).toLocaleDateString('fa-IR'))
      const data = sortedDates.map(date => dailyData[date])

      dailyChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: 'تعداد فعالیت',
            data,
            borderColor: '#667eea',
            backgroundColor: 'rgba(102, 126, 234, 0.1)',
            fill: true,
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 1
              }
            }
          },
          plugins: {
            legend: {
              display: false
            }
          }
        }
      })
    }

    const filterActivities = () => {
      // This is handled by the computed property
    }

    const resetFilters = () => {
      selectedCourseId.value = ''
      selectedTimeFilter.value = 'month'
      selectedActivityType.value = ''
      fetchData()
    }

    // Local formatting functions
    const formatDateTime = (dateString) => {
      if (!dateString) return 'نامشخص'
      const date = new Date(dateString)
      
      // Since backend now sends Iran time, we can display directly
      const dateStr = date.toLocaleDateString('fa-IR', {
        timeZone: 'Asia/Tehran'
      })
      const timeStr = date.toLocaleTimeString('fa-IR', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Tehran'
      })
      return `${dateStr} ${timeStr}`
    }

    const formatDuration = (seconds) => {
      if (!seconds || seconds < 60) return `${seconds || 0} ثانیه`
      const hours = Math.floor(seconds / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)

      if (hours > 0) {
        return `${hours} ساعت ${minutes > 0 ? `${minutes} دقیقه` : ''}`
      }
      return `${minutes} دقیقه`
    }
    const getActivityClass = (type) => {
      const classMap = {
        'CONTENT_VIEW': 'content',
        'LESSON_COMPLETION': 'lesson',
        'EXAM_SUBMISSION': 'exam',
        'ASSIGNMENT_SUBMISSION': 'assignment',
        'CHAT_MESSAGE_SEND': 'chat',
        'CHAT_VIEW': 'chat',
        'FILE_ACCESS': 'file',
        'LESSON_ACCESS': 'lesson',
        'EXAM_START': 'exam',
        'ASSIGNMENT_VIEW': 'assignment',
        'CONTENT_COMPLETION': 'content',
        'LOGIN': 'login'
      }
      return classMap[type] || 'default'
    }

    const getActivityIcon = (type) => {
      const iconMap = {
        'CONTENT_VIEW': 'fas fa-play-circle',
        'LESSON_COMPLETION': 'fas fa-check-circle',
        'EXAM_SUBMISSION': 'fas fa-clipboard-check',
        'ASSIGNMENT_SUBMISSION': 'fas fa-tasks',
        'CHAT_MESSAGE_SEND': 'fas fa-comment',
        'CHAT_VIEW': 'fas fa-comments',
        'FILE_ACCESS': 'fas fa-file',
        'LESSON_ACCESS': 'fas fa-book-open',
        'EXAM_START': 'fas fa-play',
        'ASSIGNMENT_VIEW': 'fas fa-eye',
        'CONTENT_COMPLETION': 'fas fa-check-double',
        'LOGIN': 'fas fa-sign-in-alt'
      }
      return iconMap[type] || 'fas fa-circle'
    }

    const getActivityTypeName = (type) => {
      const typeNames = {
        'CONTENT_VIEW': 'مشاهده محتوا',
        'LESSON_COMPLETION': 'تکمیل درس',
        'EXAM_SUBMISSION': 'شرکت در آزمون',
        'ASSIGNMENT_SUBMISSION': 'ارسال تکلیف',
        'CHAT_MESSAGE_SEND': 'ارسال پیام',
        'CHAT_VIEW': 'مشاهده چت',
        'FILE_ACCESS': 'دسترسی به فایل',
        'LESSON_ACCESS': 'دسترسی به درس',
        'EXAM_START': 'شروع آزمون',
        'ASSIGNMENT_VIEW': 'مشاهده تکالیف',
        'CONTENT_COMPLETION': 'تکمیل محتوا',
        'LOGIN': 'ورود به سیستم'
      }
      return typeNames[type] || type || 'فعالیت نامشخص'
    }

    const getActivityDescription = (activity) => {
      if (activity.description) return activity.description
      return getActivityTypeName(activity.type)
    }

    const getEnhancedDescription = (activity) => {
      if (!activity.metadata) return ''

      const meta = activity.metadata
      switch (activity.type) {
        case 'CONTENT_VIEW':
          return meta.contentTitle ? `محتوای: ${meta.contentTitle}` : ''
        case 'EXAM_SUBMISSION':
          return meta.examTitle ? `آزمون: ${meta.examTitle}` : ''
        case 'ASSIGNMENT_SUBMISSION':
          return meta.assignmentTitle ? `تکلیف: ${meta.assignmentTitle}` : ''
        case 'LESSON_COMPLETION':
          return meta.lessonTitle ? `درس: ${meta.lessonTitle}` : ''
        default:
          return ''
      }
    }
    watch([activities, loading], ([newActivities, isLoading]) => {
      console.log('Activities watch triggered:', {
        activitiesLength: newActivities.length,
        isLoading
      })

      if (!isLoading && newActivities.length > 0) {
        nextTick(() => {
          console.log('Creating charts from watch')
          createCharts()
        })
      }
    }, {
      deep: true,
      flush: 'post' // اطمینان از اجرا بعد از DOM update
    })
    // Lifecycle
    onMounted(async () => {
      await fetchEnrolledCourses()
      await fetchData()
    })

    watch(selectedTimeFilter, () => {
      console.log('Time filter changed to:', selectedTimeFilter.value)
      fetchData()
    })

    watch(selectedCourseId, () => {
      console.log('Course changed to:', selectedCourseId.value)
      fetchData()
    })
    onUnmounted(() => {
      if (examDistributionChart.value) {
        examDistributionChart.value.destroy()
      }
      if (assignmentDistributionChart.value) {
        assignmentDistributionChart.value.destroy()
      }
    })

    return {
      // Reactive data
      loading,
      loadingMore,
      selectedCourseId,
      selectedTimeFilter,
      selectedActivityType,
      timelineView,
      hasMoreActivities,
      enrolledCourses,
      activities,
      activitySummary,
      timeFilters,
      activityTypes,
      filteredActivities,

      calculateAverageScore,
      totalExams,
      hasGradesData,

      // Chart refs
      activityDistributionChart,
      dailyActivityChart,
      gradeDistributionChartRef,

      // Methods
      fetchData,
      loadMoreActivities,
      filterActivities,
      resetFilters,
      formatDateTime,
      formatDuration,
      getActivityClass,
      getActivityIcon,
      getActivityTypeName,
      getActivityDescription,
      getEnhancedDescription,
      examDistributionChartRef,
      assignmentDistributionChartRef,
      createExamDistributionChart,
      createAssignmentDistributionChart,
      createCharts,
      createDistributionChart,
      createDailyChart
    }
  },

}
</script>

<style scoped>
.my-activities-container {
  padding: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 2rem;
  padding: 2rem 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: white;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.page-description {
  font-size: 1.1rem;
  opacity: 0.9;
  margin: 0;
}

.filters-section {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.filter-group label {
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.5rem;
}

.form-select {
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  padding: 0.75rem;
  transition: all 0.3s ease;
}

.form-select:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.summary-cards .stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  margin-left: 1rem;
}

.stat-info {
  flex: 1;
}

.stat-number {
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
  color: #2d3748;
}

.stat-label {
  font-size: 0.9rem;
  color: #6c757d;
  margin: 0;
}

.charts-section .chart-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  overflow: hidden;
}

.chart-header {
  padding: 1.5rem 1.5rem 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.chart-header h5 {
  margin: 0;
  font-weight: 600;
  color: #2d3748;
}

.chart-container {
  padding: 1.5rem;
  height: 300px;
}

.activities-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  padding: 1.5rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.section-header h4 {
  margin: 0;
  font-weight: 600;
  color: #2d3748;
}

.timeline {
  position: relative;
  padding-right: 2rem;
}

.timeline::before {
  content: '';
  position: absolute;
  right: 15px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(to bottom, #667eea, #764ba2);
}

.timeline-item {
  position: relative;
  margin-bottom: 2rem;
  padding-right: 3rem;
}

.timeline-marker {
  position: absolute;
  right: -22px;
  top: 0;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  border: 3px solid #667eea;
}

.timeline-content {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  border: 1px solid #e2e8f0;
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
}

.timeline-title {
  font-weight: 600;
  color: #2d3748;
  flex: 1;
}

.timeline-time {
  font-size: 0.875rem;
  color: #6c757d;
  white-space: nowrap;
  margin-right: 1rem;
}

.timeline-meta {
  margin-bottom: 0.5rem;
}

.badge {
  font-size: 0.75rem;
  padding: 0.375rem 0.75rem;
}

.badge-outline {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  border: 1px solid rgba(102, 126, 234, 0.3);
}

.badge-time {
  background: rgba(34, 197, 94, 0.1);
  color: #059669;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.activity-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.activity-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}

.activity-card-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 0.75rem;
}

.activity-type {
  font-weight: 600;
  color: #2d3748;
  font-size: 0.9rem;
}

.activity-card-body {
  padding: 1.5rem;
  flex: 1;
}

.activity-title {
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.5rem;
}

.activity-details {
  color: #6c757d;
  font-size: 0.875rem;
  margin: 0;
  line-height: 1.4;
}

.activity-card-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e2e8f0;
  background: rgba(248, 249, 250, 0.5);
}

.activity-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.activity-course {
  font-size: 0.8rem;
  color: #667eea;
  font-weight: 500;
}

.activity-time {
  font-size: 0.75rem;
  color: #6c757d;
}

.activity-duration {
  font-size: 0.8rem;
  color: #059669;
  font-weight: 500;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
}

.empty-state-icon {
  font-size: 4rem;
  color: #e2e8f0;
  margin-bottom: 1rem;
}

.empty-state-title {
  color: #6c757d;
  margin-bottom: 0.5rem;
}

.empty-state-description {
  color: #9ca3af;
  margin: 0;
}

@media (max-width: 768px) {
  .timeline-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .timeline-time {
    margin-right: 0;
    margin-top: 0.5rem;
  }

  .activity-meta {
    flex-direction: column;
    align-items: flex-start;
  }

  .activity-time {
    margin-top: 0.25rem;
  }
}
</style>