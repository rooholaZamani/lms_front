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
            <select v-model="selectedStudentId" @change="fetchAdvancedAnalytics" class="form-select">
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
            <select v-model="selectedTimeFilter" @change="fetchAdvancedAnalytics" class="form-select">
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
      <div class="empty-state-content">
        <div class="empty-state-icon">
          <i class="fas fa-user-graduate"></i>
        </div>
        <h3 class="empty-state-title">انتخاب دانش‌آموز</h3>
        <p class="empty-state-description">
          برای مشاهده گزارش عملکرد، ابتدا دوره و سپس دانش‌آموز مورد نظر را انتخاب کنید
        </p>
      </div>
    </div>

    <!-- گزارش دانش‌آموز -->
    <div v-else-if="selectedStudentId && advancedAnalytics">
      <div class="analytics-dashboard">

        <!-- ردیف اول نمودارها -->
        <div class="row mb-4">
          <!-- نمودار توزیع انواع فعالیت -->
          <div class="col-md-6 mb-4">
            <div class="modern-card">
              <div class="modern-card-header">
                <h5 class="mb-0">
                  <i class="fas fa-pie-chart text-primary me-2"></i>
                  توزیع انواع فعالیت‌ها
                </h5>
              </div>
              <div class="modern-card-body">
                <canvas ref="activityTypeChart" height="300"></canvas>
              </div>
            </div>
          </div>

          <!-- نمودار تحلیل زمان -->
          <div class="col-md-6 mb-4">
            <div class="modern-card">
              <div class="modern-card-header">
                <h5 class="mb-0">
                  <i class="fas fa-clock text-warning me-2"></i>
                  تحلیل زمان بر اساس نوع فعالیت
                </h5>
              </div>
              <div class="modern-card-body">
                <canvas ref="timeAnalysisChart" height="300"></canvas>
              </div>
            </div>
          </div>
        </div>

        <!-- ردیف دوم نمودارها -->
        <div class="row mb-4">
          <!-- نمودار فعالیت در هر درس -->
          <div class="col-12 mb-4">
            <div class="modern-card">
              <div class="modern-card-header">
                <h5 class="mb-0">
                  <i class="fas fa-chart-bar text-success me-2"></i>
                  فعالیت در هر درس
                </h5>
              </div>
              <div class="modern-card-body">
                <canvas ref="lessonActivityChart" height="400"></canvas>
              </div>
            </div>
          </div>
        </div>

        <!-- Timeline فعالیت‌ها -->
        <div class="row">
          <div class="col-12">
            <div class="modern-card">
              <div class="modern-card-header">
                <h5 class="mb-0">
                  <i class="fas fa-history text-info me-2"></i>
                  Timeline فعالیت‌های اخیر
                </h5>
              </div>
              <div class="modern-card-body">
                <div class="activity-timeline">
                  <div v-for="activity in activityTimeline" :key="activity.id"
                       class="timeline-item" :class="`timeline-${activity.type.toLowerCase()}`">
                    <div class="timeline-marker">
                      <i :class="getActivityIcon(activity.type)"></i>
                    </div>
                    <div class="timeline-content">
                      <div class="timeline-header">
                        <span class="activity-type-badge" :class="`badge-${activity.type.toLowerCase()}`">
                          {{ activity.typeLabel }}
                        </span>
                        <span class="timeline-time">{{ formatDate(activity.timestamp) }}</span>
                      </div>
                      <div class="timeline-description">{{ getEnhancedDescription(activity) }}</div>
                      <div v-if="activity.metadata && Object.keys(activity.metadata).length > 0" class="timeline-metadata">
                        <small class="text-muted">
                          <i class="fas fa-info-circle me-1"></i>
                          {{ formatMetadata(activity.metadata) }}
                        </small>
                      </div>
                      <div v-if="activity.score !== undefined" class="timeline-score">
                        نمره: <strong>{{ activity.score }}</strong>
                      </div>
                      <div v-if="activity.timeSpent" class="timeline-duration">
                        مدت زمان: {{ Math.round(activity.timeSpent / 60) }} دقیقه
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- Loading State -->
    <div v-else-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">در حال بارگذاری...</span>
      </div>
    </div>

  </div>
</template>

<script>
import { Chart, registerables } from 'chart.js'
import axios from 'axios'

Chart.register(...registerables)

export default {
  name: 'StudentActivities',
  data() {
    return {
      loading: false,
      teachingCourses: [],
      courseStudents: [],
      selectedCourseId: '',
      selectedStudentId: '',
      selectedTimeFilter: 'month',
      advancedAnalytics: null,

      // Chart instances
      activityTypeChartInstance: null,
      timeAnalysisChartInstance: null,
      lessonActivityChartInstance: null,

      timeFilters: [
        { value: 'week', label: 'هفته گذشته' },
        { value: 'month', label: 'ماه گذشته' },
        { value: '3months', label: '3 ماه گذشته' },
        { value: 'semester', label: 'ترم جاری' }
      ]
    }
  },

  computed: {
    activityTimeline() {
      return this.advancedAnalytics?.activityTimeline || []
    }
  },

  async mounted() {
    await this.fetchTeachingCourses()
  },

  beforeUnmount() {
    this.destroyCharts()
  },

  methods: {
    async fetchTeachingCourses() {
      try {
        const response = await axios.get('/courses/teaching')
        this.teachingCourses = response.data
      } catch (error) {
        console.error('Error fetching teaching courses:', error)
        this.$toast.error('خطا در بارگذاری دوره‌ها')
      }
    },

    async onCourseChange() {
      if (this.selectedCourseId) {
        await this.fetchCourseStudents()
      }
      this.selectedStudentId = ''
      this.advancedAnalytics = null
    },

    async fetchCourseStudents() {
      try {
        const response = await axios.get(`/analytics/teacher/course/${this.selectedCourseId}/students-summary`)
        this.courseStudents = response.data
      } catch (error) {
        console.error('Error fetching course students:', error)
        this.$toast.error('خطا در بارگذاری دانش‌آموزان')
      }
    },

    async fetchAdvancedAnalytics() {
      if (!this.selectedStudentId || !this.selectedCourseId) return

      this.loading = true
      try {
        const response = await axios.get(
            `/analytics/teacher/student/${this.selectedStudentId}/advanced-analytics`,
            {
              params: {
                courseId: this.selectedCourseId,
                timeFilter: this.selectedTimeFilter
              }
            }
        )

        this.advancedAnalytics = response.data

        // Wait for DOM update then create charts
        await this.$nextTick()
        this.createCharts()

      } catch (error) {
        console.error('Error fetching advanced analytics:', error)
        this.$toast.error('خطا در بارگذاری آنالیز پیشرفته')
      } finally {
        this.loading = false
      }
    },

    createCharts() {
      this.destroyCharts()
      this.createActivityTypeChart()
      this.createTimeAnalysisChart()
      this.createLessonActivityChart()
    },

    createActivityTypeChart() {
      if (!this.$refs.activityTypeChart || !this.advancedAnalytics?.activityTypeDistribution) return

      const data = this.advancedAnalytics.activityTypeDistribution
      const chartData = Object.entries(data).map(([type, info]) => ({
        label: info.label,
        value: info.count,
        percentage: info.percentage
      }))

      const ctx = this.$refs.activityTypeChart.getContext('2d')
      this.activityTypeChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: chartData.map(item => item.label),
          datasets: [{
            data: chartData.map(item => item.value),
            backgroundColor: [
              '#667eea',
              '#f093fb',
              '#ff6b6b',
              '#4ecdc4',
              '#45b7d1',
              '#f9ca24',
              '#6c5ce7',
              '#fd79a8'
            ],
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
                generateLabels: (chart) => {
                  return chartData.map((item, index) => ({
                    text: `${item.label}: ${item.percentage}%`,
                    fillStyle: chart.data.datasets[0].backgroundColor[index],
                    index: index
                  }))
                }
              }
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const item = chartData[context.dataIndex]
                  return `${item.label}: ${item.value} (${item.percentage}%)`
                }
              }
            }
          }
        }
      })
    },

    createTimeAnalysisChart() {
      if (!this.$refs.timeAnalysisChart || !this.advancedAnalytics?.timeAnalysisByActivityType) return

      const data = this.advancedAnalytics.timeAnalysisByActivityType
      const chartData = Object.entries(data).map(([type, info]) => ({
        label: info.label,
        hours: info.totalHours,
        percentage: info.percentage
      }))

      const ctx = this.$refs.timeAnalysisChart.getContext('2d')
      this.timeAnalysisChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: chartData.map(item => item.label),
          datasets: [{
            label: 'ساعت',
            data: chartData.map(item => item.hours),
            backgroundColor: [
              '#667eea',
              '#f093fb',
              '#ff6b6b',
              '#4ecdc4',
              '#45b7d1',
              '#f9ca24'
            ],
            borderColor: [
              '#5a67d8',
              '#e879f9',
              '#e53e3e',
              '#38b2ac',
              '#3182ce',
              '#d69e2e'
            ],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'ساعت'
              }
            }
          },
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const item = chartData[context.dataIndex]
                  return `${item.hours} ساعت (${item.percentage}%)`
                }
              }
            }
          }
        }
      })
    },

    createLessonActivityChart() {
      if (!this.$refs.lessonActivityChart || !this.advancedAnalytics?.lessonActivityBreakdown) return

      const data = this.advancedAnalytics.lessonActivityBreakdown
      const lessons = Object.keys(data)

      const datasets = [
        {
          label: 'مشاهده محتوا',
          data: lessons.map(lesson => data[lesson].contentViews || 0),
          backgroundColor: '#667eea',
          borderColor: '#5a67d8'
        },
        {
          label: 'تکالیف',
          data: lessons.map(lesson => data[lesson].assignments || 0),
          backgroundColor: '#f093fb',
          borderColor: '#e879f9'
        },
        {
          label: 'آزمون‌ها',
          data: lessons.map(lesson => data[lesson].exams || 0),
          backgroundColor: '#ff6b6b',
          borderColor: '#e53e3e'
        },
        {
          label: 'تکمیل درس',
          data: lessons.map(lesson => data[lesson].completions || 0),
          backgroundColor: '#4ecdc4',
          borderColor: '#38b2ac'
        }
      ]

      const ctx = this.$refs.lessonActivityChart.getContext('2d')
      this.lessonActivityChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: lessons,
          datasets: datasets
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'تعداد فعالیت'
              }
            },
            x: {
              title: {
                display: true,
                text: 'دروس'
              }
            }
          },
          plugins: {
            legend: {
              position: 'top'
            }
          }
        }
      })
    },

    destroyCharts() {
      if (this.activityTypeChartInstance) {
        this.activityTypeChartInstance.destroy()
        this.activityTypeChartInstance = null
      }
      if (this.timeAnalysisChartInstance) {
        this.timeAnalysisChartInstance.destroy()
        this.timeAnalysisChartInstance = null
      }
      if (this.lessonActivityChartInstance) {
        this.lessonActivityChartInstance.destroy()
        this.lessonActivityChartInstance = null
      }
    },

    getActivityIcon(activityType) {
      const icons = {
        'CONTENT_VIEW': 'fas fa-play-circle',
        'LESSON_COMPLETION': 'fas fa-check-circle',
        'EXAM_SUBMISSION': 'fas fa-clipboard-check',
        'ASSIGNMENT_SUBMISSION': 'fas fa-tasks',
        'CHAT_MESSAGE_SEND': 'fas fa-comment',
        'CHAT_VIEW': 'fas fa-comments',
        'FILE_ACCESS': 'fas fa-file',
        'LOGIN': 'fas fa-sign-in-alt'
      }
      return icons[activityType] || 'fas fa-circle'
    },

    getEnhancedDescription(activity) {
      // اگر metadata وجود دارد، توضیحات غنی‌تری بسازیم
      if (activity.metadata && Object.keys(activity.metadata).length > 0) {
        const meta = activity.metadata;

        switch (activity.type) {
          case 'CONTENT_VIEW':
            if (meta.contentTitle && meta.lessonTitle) {
              return `مشاهده محتوای "${meta.contentTitle}" در درس "${meta.lessonTitle}"`
            } else if (meta.lessonTitle) {
              return `مشاهده محتوا در درس "${meta.lessonTitle}"`
            } else if (meta.contentTitle) {
              return `مشاهده محتوای "${meta.contentTitle}"`
            }
            break;

          case 'EXAM_SUBMISSION':
            if (meta.examTitle && meta.lessonTitle) {
              return `شرکت در آزمون "${meta.examTitle}" درس "${meta.lessonTitle}"`
            } else if (meta.examTitle) {
              return `شرکت در آزمون "${meta.examTitle}"`
            } else if (meta.lessonTitle) {
              return `شرکت در آزمون درس "${meta.lessonTitle}"`
            }
            break;

          case 'ASSIGNMENT_SUBMISSION':
            if (meta.assignmentTitle && meta.lessonTitle) {
              return `ارسال تکلیف "${meta.assignmentTitle}" درس "${meta.lessonTitle}"`
            } else if (meta.assignmentTitle) {
              return `ارسال تکلیف "${meta.assignmentTitle}"`
            } else if (meta.lessonTitle) {
              return `ارسال تکلیف درس "${meta.lessonTitle}"`
            }
            break;

          case 'LESSON_COMPLETION':
            if (meta.lessonTitle) {
              return `تکمیل درس "${meta.lessonTitle}"`
            }
            break;

          case 'LESSON_ACCESS':
            if (meta.lessonTitle) {
              return `دسترسی به درس "${meta.lessonTitle}"`
            }
            break;

          case 'CHAT_MESSAGE_SEND':
            if (meta.courseTitle) {
              return `ارسال پیام در چت دوره "${meta.courseTitle}"`
            }
            break;

          case 'FILE_ACCESS':
            if (meta.fileName && meta.lessonTitle) {
              return `دسترسی به فایل "${meta.fileName}" در درس "${meta.lessonTitle}"`
            } else if (meta.fileName) {
              return `دسترسی به فایل "${meta.fileName}"`
            }
            break;
        }
      }

      // اگر metadata کامل نبود، از توضیحات پیش‌فرض استفاده کن
      return activity.description || activity.typeLabel
    },

    formatMetadata(metadata) {
      const metaArray = []

      // فیلدهای مهم metadata را نمایش بده
      if (metadata.courseTitle) {
        metaArray.push(`دوره: ${metadata.courseTitle}`)
      }

      if (metadata.score !== undefined) {
        metaArray.push(`نمره: ${metadata.score}`)
      }

      if (metadata.difficulty) {
        const difficultyMap = {
          'EASY': 'آسان',
          'MEDIUM': 'متوسط',
          'HARD': 'سخت'
        }
        metaArray.push(`سطح: ${difficultyMap[metadata.difficulty] || metadata.difficulty}`)
      }

      if (metadata.questionCount) {
        metaArray.push(`${metadata.questionCount} سؤال`)
      }

      if (metadata.fileSize) {
        metaArray.push(`حجم: ${this.formatFileSize(metadata.fileSize)}`)
      }

      if (metadata.progress && metadata.progress !== '100') {
        metaArray.push(`پیشرفت: ${metadata.progress}%`)
      }

      return metaArray.join(' • ')
    },

    formatFileSize(bytes) {
      if (!bytes || bytes === 0) return '0 B'
      const sizes = ['B', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(1024))
      return Math.round(bytes / Math.pow(1024, i) * 10) / 10 + ' ' + sizes[i]
    },

    formatDate(dateString) {
      if (!dateString) return 'نامشخص'
      const date = new Date(dateString)
      return new Intl.DateTimeFormat('fa-IR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date)
    }
  }
}
</script>

<style scoped>
.student-activities-container {
  padding: 20px;
}

.page-header {
  text-align: center;
  margin-bottom: 30px;
}

.page-title {
  color: #2d3748;
  font-weight: bold;
  margin-bottom: 10px;
}

.page-description {
  color: #718096;
  font-size: 16px;
}

.filters-section {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.filter-group label {
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 5px;
}

.form-select {
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  padding: 10px;
  font-family: 'IRANSans';
}

.form-select:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.modern-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  border: none;
}

.modern-card-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 15px 20px;
  border-radius: 12px 12px 0 0;
  border-bottom: none;
}

.modern-card-body {
  padding: 20px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-state-icon {
  font-size: 4rem;
  color: #a0aec0;
  margin-bottom: 20px;
}

.empty-state-title {
  color: #2d3748;
  margin-bottom: 10px;
}

.empty-state-description {
  color: #718096;
  font-size: 16px;
}

.analytics-dashboard {
  margin-top: 20px;
}

/* Timeline Styles */
.activity-timeline {
  position: relative;
  padding: 20px 0;
}

.timeline-item {
  display: flex;
  margin-bottom: 20px;
  position: relative;
}

.timeline-item::before {
  content: '';
  position: absolute;
  left: 20px;
  top: 40px;
  bottom: -20px;
  width: 2px;
  background: #e2e8f0;
}

.timeline-item:last-child::before {
  display: none;
}

.timeline-marker {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
  margin-right: 20px;
  box-shadow: 0 2px 10px rgba(102, 126, 234, 0.3);
}

.timeline-content {
  flex: 1;
  background: white;
  padding: 15px 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  border-left: 4px solid #667eea;
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.activity-type-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  color: white;
}

.badge-content_view { background: #667eea; }
.badge-lesson_completion { background: #48bb78; }
.badge-exam_submission { background: #ed8936; }
.badge-assignment_submission { background: #9f7aea; }
.badge-chat_message_send { background: #38b2ac; }
.badge-login { background: #718096; }

.timeline-time {
  color: #718096;
  font-size: 14px;
}

.timeline-description {
  color: #2d3748;
  margin-bottom: 8px;
  font-weight: 500;
}

.timeline-metadata {
  background: #f7fafc;
  padding: 8px 12px;
  border-radius: 6px;
  margin-bottom: 8px;
  border-left: 3px solid #e2e8f0;
}

.timeline-score {
  color: #48bb78;
  font-size: 14px;
  margin-bottom: 4px;
}

.timeline-duration {
  color: #718096;
  font-size: 14px;
}

@media (max-width: 768px) {
  .filters-section .row {
    flex-direction: column;
  }

  .analytics-dashboard .row {
    flex-direction: column;
  }

  .timeline-item {
    flex-direction: column;
  }

  .timeline-marker {
    margin-right: 0;
    margin-bottom: 10px;
  }
}
</style>