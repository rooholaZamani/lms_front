<template>
  <div>
    <h2 class="dashboard-title">داشبورد دانش‌آموز</h2>

    <!-- خلاصه وضعیت -->
    <div class="row mb-4">
      <div class="col-md-3 col-sm-6">
        <div class="stats-card">
          <div class="icon"><i class="fas fa-book"></i></div>
          <div class="number">{{ stats.totalCourses }}</div>
          <div class="label">تعداد دوره‌ها</div>
        </div>
      </div>
      <div class="col-md-3 col-sm-6">
        <div class="stats-card">
          <div class="icon"><i class="fas fa-check-circle"></i></div>
          <div class="number">{{ stats.completedCourses }}</div>
          <div class="label">دوره‌های تکمیل شده</div>
        </div>
      </div>
      <div class="col-md-3 col-sm-6">
        <div class="stats-card">
          <div class="icon"><i class="fas fa-chart-line"></i></div>
          <div class="number">{{ stats.averageProgress }}%</div>
          <div class="label">میانگین پیشرفت</div>
        </div>
      </div>
      <div class="col-md-3 col-sm-6">
        <div class="stats-card">
          <div class="icon"><i class="fas fa-clipboard-check"></i></div>
          <div class="number">{{ exams.length }}</div>
          <div class="label">آزمون‌های انجام شده</div>
        </div>
      </div>
    </div>

    <!-- دوره‌های در حال انجام -->
    <h3 class="dashboard-subtitle">دوره‌های من</h3>

    <div v-if="loading" class="text-center my-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">در حال بارگذاری...</span>
      </div>
    </div>

    <div v-else-if="courses.length === 0" class="alert alert-info text-center">
      <h5>شما هنوز در هیچ دوره‌ای ثبت‌نام نکرده‌اید</h5>
      <router-link :to="{ name: 'AvailableCourses' }" class="btn btn-primary mt-3">
        جستجوی دوره‌های جدید
      </router-link>
    </div>

    <div v-else class="row">
      <!-- کارت دوره‌ها -->
      <div v-for="course in courses" :key="course.id" class="col-md-4 mb-4">
        <div class="card course-card">
          <div class="card-header bg-primary text-white">
            <h5 class="card-title mb-0">{{ course.title }}</h5>
          </div>
          <div class="card-body">
            <p class="card-text" v-if="course.description">{{ truncateText(course.description, 100) }}</p>

            <!-- نمایش پیشرفت دوره -->
            <div v-if="progressMap[course.id]">
              <div class="d-flex justify-content-between mb-2">
                <span>پیشرفت دوره:</span>
                <span>{{ Math.round(progressMap[course.id].completionPercentage) }}%</span>
              </div>
              <div class="progress mb-3">
                <div class="progress-bar bg-success"
                     :style="`width: ${progressMap[course.id].completionPercentage}%`"
                     :aria-valuenow="progressMap[course.id].completionPercentage"
                     role="progressbar" aria-valuemin="0" aria-valuemax="100"></div>
              </div>

              <div class="d-flex justify-content-between">
                <small class="text-muted">
                  {{ progressMap[course.id].completedLessonCount }} از
                  {{ progressMap[course.id].totalLessons }} درس تکمیل شده
                </small>
                <small class="text-muted" v-if="progressMap[course.id].lastAccessed">
                  آخرین بازدید: {{ formatDate(progressMap[course.id].lastAccessed) }}
                </small>
              </div>
            </div>

            <router-link :to="{ name: 'CourseDetail', params: { id: course.id } }" class="btn btn-primary mt-3 w-100">
              مشاهده دوره
            </router-link>
          </div>
          <div class="card-footer text-muted">
            <small>استاد: {{ course.teacher ? course.teacher.firstName + ' ' + course.teacher.lastName : 'نامشخص' }}</small>
          </div>
        </div>
      </div>
    </div>

    <!-- دکمه مشاهده همه دوره‌ها -->
    <div v-if="courses.length > 0" class="text-center mt-4">
      <router-link :to="{ name: 'Courses' }" class="btn btn-outline-primary">
        مشاهده همه دوره‌ها
      </router-link>
    </div>

    <!-- آزمون‌های اخیر -->
    <h3 class="dashboard-subtitle mt-5">آزمون‌های اخیر</h3>

    <div v-if="loadingExams" class="text-center my-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">در حال بارگذاری...</span>
      </div>
    </div>

    <div v-else-if="exams.length === 0" class="alert alert-info text-center">
      <p>شما هنوز در هیچ آزمونی شرکت نکرده‌اید</p>
    </div>

    <div v-else class="table-responsive">
      <table class="table table-hover">
        <thead class="table-light">
        <tr>
          <th>عنوان آزمون</th>
          <th>دوره</th>
          <th>نمره</th>
          <th>وضعیت</th>
          <th>تاریخ</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="exam in exams.slice(0, 5)" :key="exam.id">
          <td>{{ exam.exam ? exam.exam.title : 'نامشخص' }}</td>
          <td>{{ getCourseTitle(exam.exam ? exam.exam.lesson : null) }}</td>
          <td>{{ exam.score }}</td>
          <td>
              <span :class="exam.passed ? 'badge bg-success' : 'badge bg-danger'">
                {{ exam.passed ? 'قبول' : 'مردود' }}
              </span>
          </td>
          <td>{{ formatDate(exam.submissionTime) }}</td>
        </tr>
        </tbody>
      </table>
    </div>

    <!-- دکمه مشاهده همه آزمون‌ها -->
    <div v-if="exams.length > 5" class="text-center mt-4">
      <router-link :to="{ name: 'Exams' }" class="btn btn-outline-primary">
        مشاهده همه آزمون‌ها
      </router-link>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'StudentDashboard',
  props: {
    user: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      loading: true,
      loadingExams: true,
      courses: [],
      progressList: [],
      progressMap: {},
      exams: [],
      stats: {
        totalCourses: 0,
        completedCourses: 0,
        averageProgress: 0
      }
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    async fetchData() {
      try {
        // دریافت آمار کلی
        const statsResponse = await axios.get('/progress/stats')
        this.stats = statsResponse.data

        // دریافت دوره‌ها
        const coursesResponse = await axios.get('/courses/enrolled')
        this.courses = coursesResponse.data

        // دریافت پیشرفت دوره‌ها
        const progressResponse = await axios.get('/progress')
        this.progressList = progressResponse.data

        // تبدیل لیست پیشرفت به نقشه برای دسترسی آسان‌تر
        this.progressMap = {}
        this.progressList.forEach(progress => {
          if (progress.course) {
            this.progressMap[progress.course.id] = progress
          }
        })

        this.loading = false

        // دریافت آزمون‌های انجام شده
        const examsResponse = await axios.get('/exams/submissions/student')
        this.exams = examsResponse.data
        this.loadingExams = false
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        this.loading = false
        this.loadingExams = false
      }
    },

    truncateText(text, maxLength) {
      if (!text) return ''
      if (text.length <= maxLength) return text
      return text.substring(0, maxLength) + '...'
    },

    formatDate(dateString) {
      if (!dateString) return 'نامشخص'
      const date = new Date(dateString)
      return new Intl.DateTimeFormat('fa-IR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).format(date)
    },

    getCourseTitle(lesson) {
      if (!lesson || !lesson.course) return 'نامشخص'
      return lesson.course.title
    }
  }
}
</script>

<style scoped>
.dashboard-title {
  border-bottom: 2px solid #007bff;
  padding-bottom: 10px;
  margin-bottom: 20px;
}

.dashboard-subtitle {
  margin: 30px 0 20px;
  font-size: 1.5rem;
}

.stats-card {
  background-color: #fff;
  border-radius: 5px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  margin-bottom: 20px;
  padding: 20px;
  text-align: center;
}

.stats-card .icon {
  font-size: 2rem;
  margin-bottom: 10px;
  color: #007bff;
}

.stats-card .number {
  font-size: 1.8rem;
  font-weight: bold;
}

.stats-card .label {
  color: #6c757d;
  font-size: 0.9rem;
}

.course-card {
  transition: transform 0.3s;
  height: 100%;
}

.course-card:hover {
  transform: translateY(-5px);
}
</style>