<template>
  <div class="my-activities-container">
    <!-- Header -->
    <div class="page-header">
      <h1 class="page-title">
        <i class="fas fa-chart-line me-3"></i>
        فعالیت‌های من
      </h1>
      <p class="page-description">
        مشاهده و تحلیل فعالیت‌های آموزشی شما
      </p>
    </div>

    <!-- Filters Section -->
    <div class="filters-section mb-4">
      <div class="row g-3">
        <div class="col-md-4">
          <div class="filter-group">
            <label class="form-label">انتخاب دوره:</label>
            <select v-model="selectedCourseId" @change="fetchData" class="form-select">
              <option value="">همه دوره‌ها</option>
              <option v-for="course in enrolledCourses" :key="course.id" :value="course.id">
                {{ course.title }}
              </option>
            </select>
          </div>
        </div>

        <div class="col-md-4">
          <div class="filter-group">
            <label class="form-label">بازه زمانی:</label>
            <select v-model="selectedTimeFilter" @change="fetchData" class="form-select">
              <option v-for="filter in timeFilters" :key="filter.value" :value="filter.value">
                {{ filter.label }}
              </option>
            </select>
          </div>
        </div>

        <div class="col-md-4">
          <div class="filter-group">
            <label class="form-label">نوع فعالیت:</label>
            <select v-model="selectedActivityType" @change="filterActivities" class="form-select">
              <option value="">همه فعالیت‌ها</option>
              <option v-for="type in activityTypes" :key="type.value" :value="type.value">
                {{ type.label }}
              </option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">در حال بارگذاری...</span>
        </div>
        <p class="mt-3 text-muted">در حال بارگذاری فعالیت‌ها...</p>
      </div>
    </div>

    <!-- Main Content -->
    <div v-else class="main-content">
      <!-- Summary Cards -->
      <div class="summary-cards mb-4">
        <div class="row g-3">
          <div class="col-md-3 col-sm-6">
            <div class="stat-card">
              <div class="stat-icon bg-primary">
                <i class="fas fa-chart-bar"></i>
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ activitySummary.totalActivities }}</div>
                <div class="stat-label">کل فعالیت‌ها</div>
              </div>
            </div>
          </div>

          <div class="col-md-3 col-sm-6">
            <div class="stat-card">
              <div class="stat-icon bg-success">
                <i class="fas fa-clock"></i>
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ formatTime(activitySummary.totalTime) }}</div>
                <div class="stat-label">زمان کل مطالعه</div>
              </div>
            </div>
          </div>

          <div class="col-md-3 col-sm-6">
            <div class="stat-card">
              <div class="stat-icon bg-info">
                <i class="fas fa-book"></i>
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ activitySummary.uniqueCourses }}</div>
                <div class="stat-label">دوره‌های فعال</div>
              </div>
            </div>
          </div>

          <div class="col-md-3 col-sm-6">
            <div class="stat-card">
              <div class="stat-icon bg-warning">
                <i class="fas fa-calendar-day"></i>
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ activitySummary.activeDays }}</div>
                <div class="stat-label">روزهای فعال</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Charts Section -->
      <div class="charts-section mb-4">
        <div class="row g-4">
          <!-- Activity Distribution Chart -->
          <div class="col-lg-6">
            <div class="chart-card">
              <div class="chart-header">
                <h3 class="chart-title">
                  <i class="fas fa-pie-chart me-2"></i>
                  توزیع انواع فعالیت
                </h3>
              </div>
              <div class="chart-body">
                <canvas ref="activityDistributionChart"></canvas>
              </div>
            </div>
          </div>

          <!-- Daily Activity Chart -->
          <div class="col-lg-6">
            <div class="chart-card">
              <div class="chart-header">
                <h3 class="chart-title">
                  <i class="fas fa-chart-line me-2"></i>
                  فعالیت روزانه
                </h3>
              </div>
              <div class="chart-body">
                <canvas ref="dailyActivityChart"></canvas>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Activity Timeline -->
      <div class="timeline-section">
        <div class="section-header mb-4">
          <h3 class="section-title">
            <i class="fas fa-history me-2"></i>
            تاریخچه فعالیت‌ها
          </h3>
          <div class="section-actions">
            <div class="btn-group" role="group">
              <button
                  type="button"
                  class="btn btn-outline-primary btn-sm"
                  :class="{ active: timelineView === 'timeline' }"
                  @click="timelineView = 'timeline'"
              >
                <i class="fas fa-list me-1"></i>
                Timeline
              </button>
              <button
                  type="button"
                  class="btn btn-outline-primary btn-sm"
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
            <button @click="resetFilters" class="btn btn-primary">
              <i class="fas fa-refresh me-2"></i>
              بازنشانی فیلترها
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, computed, nextTick } from 'vue'
import axios from 'axios'
import Chart from 'chart.js/auto'
import { useFormatters } from '@/composables/useFormatters.js'

export default {
  name: 'MyActivities',
  setup() {
    const { formatDateTime, formatDuration } = useFormatters()

    // Reactive data
    const loading = ref(true)
    const loadingMore = ref(false)
    const selectedCourseId = ref('')
    const selectedTimeFilter = ref('month')
    const selectedActivityType = ref('')
    const timelineView = ref('timeline')
    const currentPage = ref(1)
    const hasMoreActivities = ref(false)

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
      { value: 'FILE_ACCESS', label: 'دسترسی به فایل' },
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

    const fetchData = async () => {
      loading.value = true
      currentPage.value = 1

      try {
        const params = {
          timeFilter: selectedTimeFilter.value,
          limit: 50
        }

        if (selectedCourseId.value) {
          params.courseId = selectedCourseId.value
        }

        const response = await axios.get('/analytics/student/my-activities', { params })

        activities.value = response.data.activities || []
        updateActivitySummary()
        hasMoreActivities.value = activities.value.length >= 50

        await nextTick()
        createCharts()

      } catch (error) {
        console.error('Error fetching activities:', error)
        activities.value = []
      } finally {
        loading.value = false
      }
    }

    const loadMoreActivities = async () => {
      loadingMore.value = true
      currentPage.value++

      try {
        const params = {
          timeFilter: selectedTimeFilter.value,
          limit: 50,
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

    const updateActivitySummary = () => {
      activitySummary.totalActivities = activities.value.length
      activitySummary.totalTime = activities.value.reduce((sum, activity) => sum + (activity.timeSpent || 0), 0)

      const coursesSet = new Set(activities.value.map(activity => activity.courseName).filter(Boolean))
      activitySummary.uniqueCourses = coursesSet.size

      const datesSet = new Set(activities.value.map(activity =>
          new Date(activity.timestamp).toDateString()
      ))
      activitySummary.activeDays = datesSet.size
    }

    const createCharts = () => {
      createDistributionChart()
      createDailyChart()
    }

    const createDistributionChart = () => {
      if (distributionChartInstance) {
        distributionChartInstance.destroy()
      }

      const ctx = activityDistributionChart.value?.getContext('2d')
      if (!ctx) return

      // Count activities by type
      const typeCounts = {}
      activities.value.forEach(activity => {
        typeCounts[activity.type] = (typeCounts[activity.type] || 0) + 1
      })

      const labels = Object.keys(typeCounts).map(type => getActivityTypeName(type))
      const data = Object.values(typeCounts)
      const colors = [
        '#667eea', '#764ba2', '#f093fb', '#f5576c',
        '#4facfe', '#00f2fe', '#43e97b', '#38f9d7'
      ]

      distributionChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels,
          datasets: [{
            data,
            backgroundColor: colors.slice(0, labels.length),
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
                padding: 20,
                usePointStyle: true
              }
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

    // Utility methods
    const formatTime = (seconds) => {
      if (!seconds) return '0 دقیقه'
      const hours = Math.floor(seconds / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)

      if (hours > 0) {
        return `${hours} ساعت ${minutes > 0 ? `و ${minutes} دقیقه` : ''}`
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
        'FILE_ACCESS': 'fas fa-file',
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
        'FILE_ACCESS': 'دسترسی به فایل',
        'LOGIN': 'ورود به سیستم'
      }
      return typeNames[type] || 'فعالیت نامشخص'
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

    // Lifecycle
    onMounted(async () => {
      await fetchEnrolledCourses()
      await fetchData()
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

      // Chart refs
      activityDistributionChart,
      dailyActivityChart,

      // Methods
      fetchData,
      loadMoreActivities,
      filterActivities,
      resetFilters,
      formatTime,
      formatDateTime,
      formatDuration,
      getActivityClass,
      getActivityIcon,
      getActivityTypeName,
      getActivityDescription,
      getEnhancedDescription
    }
  }
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
  color: white;
  margin-left: 1rem;
}

.stat-icon.bg-primary { background: linear-gradient(135deg, #667eea, #764ba2); }
.stat-icon.bg-success { background: linear-gradient(135deg, #48bb78, #38a169); }
.stat-icon.bg-info { background: linear-gradient(135deg, #4299e1, #3182ce); }
.stat-icon.bg-warning { background: linear-gradient(135deg, #ed8936, #dd6b20); }

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: #2d3748;
  line-height: 1;
}

.stat-label {
  font-size: 0.875rem;
  color: #718096;
  margin-top: 0.25rem;
}

.charts-section .chart-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  overflow: hidden;
}

.chart-header {
  padding: 1.5rem 1.5rem 0;
  border-bottom: 1px solid #e2e8f0;
}

.chart-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0;
}

.chart-body {
  padding: 1.5rem;
  height: 300px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0;
}

.btn-group .btn {
  border-radius: 6px !important;
}

.btn-group .btn.active {
  background: #667eea;
  border-color: #667eea;
}

/* Timeline Styles */
.timeline-container {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  max-height: 800px;
  overflow-y: auto;
}

.timeline {
  position: relative;
  padding-right: 30px;
}

.timeline::before {
  content: '';
  position: absolute;
  right: 15px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(to bottom, #e2e8f0, #cbd5e0);
}

.timeline-item {
  position: relative;
  margin-bottom: 20px;
  padding-right: 20px;
}

.timeline-marker {
  position: absolute;
  right: -25px;
  top: 5px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: white;
  border: 2px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #718096;
}

.timeline-content {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 5px;
}

.timeline-title {
  flex: 1;
  font-weight: 500;
  color: #2d3748;
  font-size: 14px;
}

.timeline-time {
  font-size: 11px;
  color: #a0aec0;
  white-space: nowrap;
  margin-right: 10px;
}

.timeline-meta {
  font-size: 12px;
}

.badge-outline {
  background: transparent;
  border: 1px solid #e2e8f0;
  color: #718096;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
}

.badge-time {
  background: #f7fafc;
  color: #4a5568;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
}

/* Activity type colors */
.timeline-content .timeline-marker { border-color: #3182ce; color: #3182ce; }
.timeline-exam .timeline-marker { border-color: #e53e3e; color: #e53e3e; }
.timeline-assignment .timeline-marker { border-color: #38a169; color: #38a169; }
.timeline-lesson .timeline-marker { border-color: #d69e2e; color: #d69e2e; }
.timeline-chat .timeline-marker { border-color: #805ad5; color: #805ad5; }
.timeline-login .timeline-marker { border-color: #718096; color: #718096; }

/* Cards View */
.cards-container {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.activity-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
  height: 100%;
}

.activity-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

.activity-card-header {
  padding: 1rem;
  background: #f7fafc;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #667eea;
  color: white;
  margin-left: 0.75rem;
}

.activity-type {
  font-weight: 600;
  color: #2d3748;
}

.activity-card-body {
  padding: 1rem;
  flex: 1;
}

.activity-title {
  font-size: 1rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.5rem;
}

.activity-details {
  font-size: 0.875rem;
  color: #718096;
  margin: 0;
}

.activity-card-footer {
  padding: 0.75rem 1rem;
  background: #f7fafc;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.activity-meta {
  display: flex;
  flex-direction: column;
}

.activity-course {
  font-size: 0.75rem;
  color: #4a5568;
  font-weight: 500;
}

.activity-time {
  font-size: 0.75rem;
  color: #a0aec0;
}

.activity-duration {
  font-size: 0.75rem;
  color: #4a5568;
  background: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.empty-state-icon {
  font-size: 4rem;
  color: #cbd5e0;
  margin-bottom: 1rem;
}

.empty-state-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.5rem;
}

.empty-state-description {
  color: #718096;
  margin-bottom: 2rem;
}

.loading-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

/* Responsive */
@media (max-width: 768px) {
  .my-activities-container {
    padding: 1rem;
  }

  .page-title {
    font-size: 2rem;
  }

  .section-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .section-actions {
    align-self: center;
  }

  .stat-card {
    flex-direction: column;
    text-align: center;
  }

  .stat-icon {
    margin-left: 0;
    margin-bottom: 0.75rem;
  }

  .timeline {
    padding-right: 0;
  }

  .timeline::before {
    right: auto;
    left: 15px;
  }

  .timeline-item {
    padding-right: 0;
    padding-left: 40px;
  }

  .timeline-marker {
    right: auto;
    left: 1px;
  }

  .timeline-header {
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-start;
  }

  .timeline-time {
    margin-right: 0;
  }
}
</style>