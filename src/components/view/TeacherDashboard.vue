<template>
  <div>
    <div class="d-flex justify-content-between align-items-center">
      <h2 class="dashboard-title">داشبورد استاد</h2>
      <button class="btn btn-primary" @click="showCreateCourseModal">
        <i class="fas fa-plus"></i> ایجاد دوره جدید
      </button>
    </div>

    <!-- خلاصه وضعیت -->
    <div class="row mb-4">
      <div class="col-md-3 col-sm-6">
        <div class="stats-card">
          <div class="icon"><i class="fas fa-book"></i></div>
          <div class="number">{{ courses.length }}</div>
          <div class="label">تعداد دوره‌ها</div>
        </div>
      </div>
      <div class="col-md-3 col-sm-6">
        <div class="stats-card">
          <div class="icon"><i class="fas fa-users"></i></div>
          <div class="number">{{ totalStudents }}</div>
          <div class="label">تعداد دانش‌آموزان</div>
        </div>
      </div>
      <div class="col-md-3 col-sm-6">
        <div class="stats-card">
          <div class="icon"><i class="fas fa-list-check"></i></div>
          <div class="number">{{ totalLessons }}</div>
          <div class="label">تعداد درس‌ها</div>
        </div>
      </div>
      <div class="col-md-3 col-sm-6">
        <div class="stats-card">
          <div class="icon"><i class="fas fa-clipboard-question"></i></div>
          <div class="number">{{ activeExams }}</div>
          <div class="label">آزمون‌های فعال</div>
        </div>
      </div>
    </div>

    <!-- دوره‌های استاد -->
    <h3 class="dashboard-subtitle">دوره‌های من</h3>

    <div v-if="loading" class="text-center my-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">در حال بارگذاری...</span>
      </div>
    </div>

    <div v-else-if="courses.length === 0" class="alert alert-info text-center">
      <h5>شما هنوز هیچ دوره‌ای ایجاد نکرده‌اید</h5>
      <button class="btn btn-primary mt-3" @click="showCreateCourseModal">
        <i class="fas fa-plus"></i> ایجاد دوره جدید
      </button>
    </div>

    <div v-else class="table-responsive">
      <table class="table table-striped table-hover">
        <thead class="table-dark">
        <tr>
          <th>عنوان دوره</th>
          <th>تعداد درس‌ها</th>
          <th>تعداد دانش‌آموزان</th>
          <th>وضعیت</th>
          <th>عملیات</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="course in courses" :key="course.id">
          <td>{{ course.title }}</td>
          <td>{{ course.lessons ? course.lessons.length : 0 }}</td>
          <td>{{ course.enrolledStudents ? course.enrolledStudents.length : 0 }}</td>
          <td><span class="badge bg-success">فعال</span></td>
          <td>
            <div class="d-flex gap-1">
              <router-link :to="{ name: 'CourseDetail', params: { id: course.id } }" class="btn btn-sm btn-primary">
                <i class="fas fa-eye"></i>
              </router-link>
              <button class="btn btn-sm btn-success" @click="editCourse(course)">
                <i class="fas fa-edit"></i>
              </button>
              <button class="btn btn-sm btn-info" @click="addLesson(course)">
                <i class="fas fa-plus"></i> درس
              </button>
              <button class="btn btn-sm btn-warning" @click="addExam(course)">
                <i class="fas fa-clipboard-check"></i> آزمون
              </button>
            </div>
          </td>
        </tr>
        </tbody>
      </table>
    </div>

    <!-- آزمون‌های اخیر -->
    <h3 class="dashboard-subtitle mt-5">نتایج آزمون‌های اخیر</h3>

    <div v-if="loadingExams" class="text-center my-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">در حال بارگذاری...</span>
      </div>
    </div>

    <div v-else-if="recentSubmissions.length === 0" class="alert alert-info text-center">
      <p>هنوز هیچ آزمونی انجام نشده است</p>
    </div>

    <div v-else class="table-responsive">
      <table class="table table-hover">
        <thead class="table-light">
        <tr>
          <th>نام دانش‌آموز</th>
          <th>عنوان آزمون</th>
          <th>دوره</th>
          <th>نمره</th>
          <th>وضعیت</th>
          <th>تاریخ</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="submission in recentSubmissions" :key="submission.id">
          <td>{{ getStudentName(submission.student) }}</td>
          <td>{{ submission.exam ? submission.exam.title : 'نامشخص' }}</td>
          <td>{{ getCourseTitle(submission.exam ? submission.exam.lesson : null) }}</td>
          <td>{{ submission.score }}</td>
          <td>
              <span :class="submission.passed ? 'badge bg-success' : 'badge bg-danger'">
                {{ submission.passed ? 'قبول' : 'مردود' }}
              </span>
          </td>
          <td>{{ formatDate(submission.submissionTime) }}</td>
        </tr>
        </tbody>
      </table>
    </div>

    <!-- دکمه مشاهده همه نتایج -->
    <div v-if="recentSubmissions.length > 0" class="text-center mt-4">
      <router-link :to="{ name: 'ExamResults' }" class="btn btn-outline-primary">
        مشاهده همه نتایج
      </router-link>
    </div>

    <!-- مودال ایجاد دوره -->
    <div class="modal fade" id="createCourseModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">ایجاد دوره جدید</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="createCourse">
              <div class="mb-3">
                <label for="title" class="form-label">عنوان دوره</label>
                <input type="text" class="form-control" id="title" v-model="newCourse.title" required>
              </div>
              <div class="mb-3">
                <label for="description" class="form-label">توضیحات دوره</label>
                <textarea class="form-control" id="description" v-model="newCourse.description" rows="3" required></textarea>
              </div>
              <button type="submit" class="btn btn-primary w-100" :disabled="isSubmitting">
                <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                ایجاد دوره
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min.js'

export default {
  name: 'TeacherDashboard',
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
      recentSubmissions: [],
      activeExams: 0,
      totalStudents: 0,
      totalLessons: 0,
      createCourseModal: null,
      newCourse: {
        title: '',
        description: ''
      },
      isSubmitting: false
    }
  },
  mounted() {
    this.createCourseModal = new bootstrap.Modal(document.getElementById('createCourseModal'))
    this.fetchData()
  },
  methods: {
    async fetchData() {
      try {
        // دریافت دوره‌های استاد
        const coursesResponse = await axios.get('/courses/teaching')
        this.courses = coursesResponse.data

        // محاسبه آمار
        this.calculateStats()

        this.loading = false

        // دریافت نتایج آزمون‌ها
        await this.fetchExamSubmissions()
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        this.loading = false
        this.loadingExams = false
      }
    },

    calculateStats() {
      this.totalStudents = 0
      this.totalLessons = 0
      this.activeExams = 0

      this.courses.forEach(course => {
        // تعداد دانش‌آموزان
        if (course.enrolledStudents) {
          this.totalStudents += course.enrolledStudents.length
        }

        // تعداد درس‌ها
        if (course.lessons) {
          this.totalLessons += course.lessons.length

          // تعداد آزمون‌ها
          course.lessons.forEach(lesson => {
            if (lesson.exam) {
              this.activeExams++
            }
          })
        }
      })
    },

    async fetchExamSubmissions() {
      try {
        // ابتدا تمام آزمون‌های دوره‌های استاد را پیدا می‌کنیم
        const examIds = []

        this.courses.forEach(course => {
          if (course.lessons) {
            course.lessons.forEach(lesson => {
              if (lesson.exam) {
                examIds.push(lesson.exam.id)
              }
            })
          }
        })

        if (examIds.length === 0) {
          this.loadingExams = false
          return
        }

        // دریافت نتایج آزمون‌ها
        const allSubmissions = []

        for (const examId of examIds) {
          try {
            const response = await axios.get(`/exams/${examId}/submissions`)
            if (response.data && response.data.length) {
              allSubmissions.push(...response.data)
            }
          } catch (error) {
            console.error(`Error fetching submissions for exam ${examId}:`, error)
          }
        }

        // مرتب‌سازی بر اساس تاریخ (جدیدترین اول)
        this.recentSubmissions = allSubmissions.sort((a, b) => {
          return new Date(b.submissionTime) - new Date(a.submissionTime)
        }).slice(0, 10) // 10 نتیجه آخر

        this.loadingExams = false
      } catch (error) {
        console.error('Error fetching exam submissions:', error)
        this.loadingExams = false
      }
    },

    showCreateCourseModal() {
      this.newCourse = { title: '', description: '' }
      this.createCourseModal.show()
    },

    async createCourse() {
      this.isSubmitting = true

      try {
        const response = await axios.post('/courses', this.newCourse)

        // اضافه کردن دوره جدید به لیست
        this.courses.push(response.data)

        // محاسبه مجدد آمار
        this.calculateStats()

        // بستن مودال
        this.createCourseModal.hide()

        // نمایش پیام موفقیت
        this.$toast.success('دوره با موفقیت ایجاد شد.')
      } catch (error) {
        console.error('Error creating course:', error)
        this.$toast.error('خطا در ایجاد دوره. لطفاً دوباره تلاش کنید.')
      } finally {
        this.isSubmitting = false
      }
    },

    editCourse(course) {
      // انتقال به صفحه ویرایش دوره
      this.$router.push({
        name: 'CourseEdit',
        params: { id: course.id }
      })
    },

    addLesson(course) {
      // انتقال به صفحه افزودن درس با انتخاب دوره
      this.$router.push({
        name: 'CourseDetail',
        params: { id: course.id },
        query: { addLesson: true }
      })
    },

    addExam(course) {
      // انتقال به صفحه افزودن آزمون با انتخاب دوره
      this.$router.push({
        name: 'CourseDetail',
        params: { id: course.id },
        query: { addExam: true }
      })
    },

    getStudentName(student) {
      if (!student) return 'نامشخص'
      return student.firstName && student.lastName
          ? `${student.firstName} ${student.lastName}`
          : student.username
    },

    getCourseTitle(lesson) {
      if (!lesson || !lesson.course) return 'نامشخص'
      return lesson.course.title
    },

    formatDate(dateString) {
      if (!dateString) return 'نامشخص'
      const date = new Date(dateString)
      return new Intl.DateTimeFormat('fa-IR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).format(date)
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

.course-actions {
  display: flex;
  gap: 5px;
}
</style>