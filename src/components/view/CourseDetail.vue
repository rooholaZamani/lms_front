<template>
  <div class="course-detail">
    <div class="container-fluid">
      <div v-if="loading" class="text-center my-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">در حال بارگذاری...</span>
        </div>
      </div>

      <div v-else-if="error" class="alert alert-danger">
        {{ error }}
      </div>

      <template v-else>
        <!-- Course Header -->
        <div class="course-header mb-4">
          <div class="row align-items-center">
            <div class="col-md-8">
              <h1>{{ course.title }}</h1>
              <p class="text-muted">
                <span>استاد: {{ getTeacherName() }}</span>
                <span class="mx-2">|</span>
                <span>{{ course.enrolledStudents ? course.enrolledStudents.length : 0 }} دانش‌آموز</span>
              </p>
            </div>
            <div class="col-md-4 text-end">
              <!-- دکمه‌های مخصوص معلم -->
              <div v-if="isTeacher && isTeacherOfCourse" class="d-flex justify-content-end gap-2">
                <button class="btn btn-success" @click="showEditCourseModal">
                  <i class="fas fa-edit"></i> ویرایش دوره
                </button>
                <button class="btn btn-primary" @click="showAddLessonModal">
                  <i class="fas fa-plus"></i> افزودن درس
                </button>
              </div>
              <!-- دکمه‌های مخصوص دانش‌آموز -->
              <div v-else-if="!isTeacher">
                <button v-if="!isEnrolled" class="btn btn-primary" @click="enrollCourse">
                  <i class="fas fa-sign-in-alt"></i> ثبت‌نام در دوره
                </button>
                <button v-else class="btn btn-outline-success" disabled>
                  <i class="fas fa-check"></i> ثبت‌نام شده
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Course Content Tabs -->
        <ul class="nav nav-tabs mb-4" id="courseTab" role="tablist">
          <li class="nav-item" role="presentation">
            <button class="nav-link active" id="description-tab" data-bs-toggle="tab" data-bs-target="#description"
                    type="button" role="tab" aria-controls="description" aria-selected="true">
              توضیحات
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button class="nav-link" id="lessons-tab" data-bs-toggle="tab" data-bs-target="#lessons"
                    type="button" role="tab" aria-controls="lessons" aria-selected="false">
              درس‌ها
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button class="nav-link" id="exams-tab" data-bs-toggle="tab" data-bs-target="#exams"
                    type="button" role="tab" aria-controls="exams" aria-selected="false">
              آزمون‌ها
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button class="nav-link" id="students-tab" data-bs-toggle="tab" data-bs-target="#students"
                    type="button" role="tab" aria-controls="students" aria-selected="false"
                    v-if="isTeacher && isTeacherOfCourse">
              دانش‌آموزان
            </button>
          </li>
        </ul>

        <!-- Tab Content -->
        <div class="tab-content" id="courseTabContent">
          <!-- Tab: Description -->
          <div class="tab-pane fade show active" id="description" role="tabpanel" aria-labelledby="description-tab">
            <div class="card">
              <div class="card-body">
                <h3>درباره این دوره</h3>
                <p class="course-description">{{ course.description }}</p>

                <!-- نمایش اطلاعات تکمیلی -->
                <div class="row mt-4">
                  <div class="col-md-4">
                    <div class="info-box">
                      <i class="fas fa-clock"></i>
                      <div>
                        <h5>مدت زمان دوره</h5>
                        <p>{{ course.duration || 'نامشخص' }}</p>
                      </div>
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="info-box">
                      <i class="fas fa-graduation-cap"></i>
                      <div>
                        <h5>سطح دوره</h5>
                        <p>{{ course.level || 'متوسط' }}</p>
                      </div>
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="info-box">
                      <i class="fas fa-calendar-alt"></i>
                      <div>
                        <h5>تاریخ ایجاد</h5>
                        <p>{{ formatDate(course.createdAt) }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Tab: Lessons -->
          <div class="tab-pane fade" id="lessons" role="tabpanel" aria-labelledby="lessons-tab">
            <div class="card">
              <div class="card-body">
                <h3>درس‌های دوره</h3>

                <div v-if="!course.lessons || course.lessons.length === 0" class="alert alert-info text-center">
                  <p>هنوز درسی برای این دوره ایجاد نشده است</p>
                  <button v-if="isTeacher && isTeacherOfCourse" class="btn btn-primary mt-2" @click="showAddLessonModal">
                    <i class="fas fa-plus"></i> افزودن درس جدید
                  </button>
                </div>

                <div v-else class="lesson-list">
                  <div v-for="(lesson, index) in course.lessons" :key="lesson.id" class="lesson-item">
                    <div class="lesson-header" @click="toggleLesson(index)">
                      <div class="lesson-title">
                        <span class="lesson-number">{{ index + 1 }}</span>
                        <h4>{{ lesson.title }}</h4>
                      </div>
                      <div class="lesson-info">
                        <span v-if="lesson.duration" class="lesson-duration">
                          <i class="fas fa-clock"></i> {{ lesson.duration }}
                        </span>
                        <button class="btn btn-link" :class="{ 'collapsed': !lesson.expanded }">
                          <i class="fas" :class="lesson.expanded ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
                        </button>
                      </div>
                    </div>
                    <div class="lesson-content" v-if="lesson.expanded">
                      <p v-if="lesson.description">{{ lesson.description }}</p>

                      <!-- نمایش محتوای درس -->
                      <div v-if="isEnrolled || (isTeacher && isTeacherOfCourse)" class="lesson-materials mt-3">
                        <div v-if="lesson.content" class="content-text mb-3">
                          <div v-html="lesson.content"></div>
                        </div>

                        <!-- فایل‌های پیوست -->
                        <div v-if="lesson.attachments && lesson.attachments.length > 0" class="attachments mb-3">
                          <h5>فایل‌های پیوست</h5>
                          <ul class="list-group">
                            <li v-for="attachment in lesson.attachments" :key="attachment.id" class="list-group-item">
                              <i :class="getFileIcon(attachment.type)"></i>
                              <a :href="attachment.url" target="_blank" class="ms-2">{{ attachment.name }}</a>
                              <span class="badge bg-secondary float-end">{{ formatFileSize(attachment.size) }}</span>
                            </li>
                          </ul>
                        </div>

                        <!-- ویدیو -->
                        <div v-if="lesson.videoUrl" class="video-container mb-3">
                          <h5>ویدیوی آموزشی</h5>
                          <div class="ratio ratio-16x9">
                            <video controls>
                              <source :src="lesson.videoUrl" type="video/mp4">
                              مرورگر شما از پخش ویدیو پشتیبانی نمی‌کند.
                            </video>
                          </div>
                        </div>

                        <!-- دکمه‌های مدیریت درس برای معلم -->
                        <div v-if="isTeacher && isTeacherOfCourse" class="mt-3 d-flex gap-2">
                          <button class="btn btn-sm btn-success" @click="editLesson(lesson)">
                            <i class="fas fa-edit"></i> ویرایش درس
                          </button>
                          <button class="btn btn-sm btn-primary" @click="addContent(lesson)">
                            <i class="fas fa-plus"></i> افزودن محتوا
                          </button>
                          <button class="btn btn-sm btn-warning" @click="addExam(lesson)">
                            <i class="fas fa-clipboard-check"></i> ایجاد آزمون
                          </button>
                        </div>

                        <!-- دکمه تکمیل درس برای دانش‌آموز -->
                        <div v-else-if="isEnrolled" class="mt-3">
                          <button v-if="!isLessonCompleted(lesson.id)" class="btn btn-success" @click="markLessonComplete(lesson.id)">
                            <i class="fas fa-check"></i> علامت‌گذاری به عنوان تکمیل شده
                          </button>
                          <button v-else class="btn btn-outline-success" disabled>
                            <i class="fas fa-check-double"></i> تکمیل شده
                          </button>
                        </div>
                      </div>

                      <!-- پیام برای دانش‌آموزانی که ثبت‌نام نکرده‌اند -->
                      <div v-else class="alert alert-warning mt-3">
                        <i class="fas fa-lock me-2"></i>
                        برای دسترسی به محتوای این درس، لطفاً در دوره ثبت‌نام کنید.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Tab: Exams -->
          <div class="tab-pane fade" id="exams" role="tabpanel" aria-labelledby="exams-tab">
            <div class="card">
              <div class="card-body">
                <h3>آزمون‌های دوره</h3>

                <div v-if="!courseExams || courseExams.length === 0" class="alert alert-info text-center">
                  <p>هنوز آزمونی برای این دوره ایجاد نشده است</p>
                </div>

                <div v-else class="table-responsive">
                  <table class="table table-hover">
                    <thead class="table-light">
                    <tr>
                      <th>عنوان آزمون</th>
                      <th>درس مربوطه</th>
                      <th>مدت زمان (دقیقه)</th>
                      <th>تعداد سوالات</th>
                      <th>وضعیت</th>
                      <th>عملیات</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-for="exam in courseExams" :key="exam.id">
                      <td>{{ exam.title }}</td>
                      <td>{{ getRelatedLesson(exam) }}</td>
                      <td>{{ exam.duration }}</td>
                      <td>{{ exam.questions ? exam.questions.length : 0 }}</td>
                      <td>
                          <span :class="getExamStatusClass(exam)">
                            {{ getExamStatusText(exam) }}
                          </span>
                      </td>
                      <td>
                        <div class="d-flex gap-1">
                          <!-- دکمه‌های مخصوص معلم -->
                          <template v-if="isTeacher && isTeacherOfCourse">
                            <button class="btn btn-sm btn-success" @click="editExam(exam)">
                              <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-info" @click="viewExamResults(exam)">
                              <i class="fas fa-chart-bar"></i> نتایج
                            </button>
                          </template>

                          <!-- دکمه‌های مخصوص دانش‌آموز -->
                          <template v-else-if="isEnrolled">
                            <button v-if="!hasCompletedExam(exam)" class="btn btn-sm btn-primary" @click="startExam(exam)">
                              <i class="fas fa-pen"></i> شروع آزمون
                            </button>
                            <button v-else class="btn btn-sm btn-info" @click="viewExamResult(exam)">
                              <i class="fas fa-eye"></i> مشاهده نتیجه
                            </button>
                          </template>
                        </div>
                      </td>
                    </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <!-- Tab: Students (مخصوص معلم) -->
          <div class="tab-pane fade" id="students" role="tabpanel" aria-labelledby="students-tab">
            <div class="card">
              <div class="card-body">
                <h3>دانش‌آموزان ثبت‌نام شده</h3>

                <div v-if="!course.enrolledStudents || course.enrolledStudents.length === 0" class="alert alert-info text-center">
                  <p>هنوز دانش‌آموزی در این دوره ثبت‌نام نکرده است</p>
                </div>

                <div v-else class="table-responsive">
                  <table class="table table-hover">
                    <thead class="table-light">
                    <tr>
                      <th>نام</th>
                      <th>شماره دانش‌آموزی</th>
                      <th>تاریخ ثبت‌نام</th>
                      <th>پیشرفت</th>
                      <th>عملیات</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-for="student in course.enrolledStudents" :key="student.id">
                      <td>{{ getStudentName(student) }}</td>
                      <td>{{ student.studentId || '---' }}</td>
                      <td>{{ formatDate(student.enrollmentDate) }}</td>
                      <td>
                        <div class="progress">
                          <div class="progress-bar bg-success" role="progressbar"
                               :style="`width: ${getStudentProgress(student.id)}%`"
                               :aria-valuenow="getStudentProgress(student.id)"
                               aria-valuemin="0" aria-valuemax="100">
                            {{ getStudentProgress(student.id) }}%
                          </div>
                        </div>
                      </td>
                      <td>
                        <button class="btn btn-sm btn-info" @click="viewStudentProgress(student)">
                          <i class="fas fa-eye"></i> مشاهده جزئیات
                        </button>
                      </td>
                    </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- Modal: افزودن/ویرایش درس -->
    <div class="modal fade" id="lessonModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ isEditingLesson ? 'ویرایش درس' : 'افزودن درس جدید' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveLesson">
              <div class="mb-3">
                <label for="lessonTitle" class="form-label">عنوان درس</label>
                <input type="text" class="form-control" id="lessonTitle" v-model="currentLesson.title" required>
              </div>
              <div class="mb-3">
                <label for="lessonDescription" class="form-label">توضیحات</label>
                <textarea class="form-control" id="lessonDescription" v-model="currentLesson.description" rows="3"></textarea>
              </div>
              <div class="mb-3">
                <label for="lessonDuration" class="form-label">مدت زمان (اختیاری)</label>
                <input type="text" class="form-control" id="lessonDuration" v-model="currentLesson.duration">
              </div>
              <button type="submit" class="btn btn-primary w-100" :disabled="isSubmitting">
                <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                {{ isEditingLesson ? 'به‌روزرسانی درس' : 'افزودن درس' }}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: ویرایش دوره -->
    <div class="modal fade" id="editCourseModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">ویرایش دوره</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="updateCourse">
              <div class="mb-3">
                <label for="courseTitle" class="form-label">عنوان دوره</label>
                <input type="text" class="form-control" id="courseTitle" v-model="updatedCourse.title" required>
              </div>
              <div class="mb-3">
                <label for="courseDescription" class="form-label">توضیحات</label>
                <textarea class="form-control" id="courseDescription" v-model="updatedCourse.description" rows="3" required></textarea>
              </div>
              <div class="mb-3">
                <label for="courseLevel" class="form-label">سطح دوره</label>
                <select class="form-select" id="courseLevel" v-model="updatedCourse.level">
                  <option value="مبتدی">مبتدی</option>
                  <option value="متوسط">متوسط</option>
                  <option value="پیشرفته">پیشرفته</option>
                </select>
              </div>
              <div class="mb-3">
                <label for="courseDuration" class="form-label">مدت زمان کل دوره (اختیاری)</label>
                <input type="text" class="form-control" id="courseDuration" v-model="updatedCourse.duration">
              </div>
              <button type="submit" class="btn btn-primary w-100" :disabled="isSubmitting">
                <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                به‌روزرسانی دوره
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: افزودن محتوا به درس -->
    <div class="modal fade" id="contentModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">افزودن محتوا به درس</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <ul class="nav nav-tabs mb-3" id="contentTab" role="tablist">
              <li class="nav-item" role="presentation">
                <button class="nav-link active" id="text-tab" data-bs-toggle="tab" data-bs-target="#text"
                        type="button" role="tab" aria-controls="text" aria-selected="true">
                  متن
                </button>
              </li>
              <li class="nav-item" role="presentation">
                <button class="nav-link" id="file-tab" data-bs-toggle="tab" data-bs-target="#file"
                        type="button" role="tab" aria-controls="file" aria-selected="false">
                  فایل
                </button>
              </li>
              <li class="nav-item" role="presentation">
                <button class="nav-link" id="video-tab" data-bs-toggle="tab" data-bs-target="#video"
                        type="button" role="tab" aria-controls="video" aria-selected="false">
                  ویدیو
                </button>
              </li>
            </ul>
            <div class="tab-content" id="contentTabContent">
              <!-- Tab: متن -->
              <div class="tab-pane fade show active" id="text" role="tabpanel" aria-labelledby="text-tab">
                <form @submit.prevent="saveTextContent">
                  <div class="mb-3">
                    <label for="textContent" class="form-label">محتوای متنی</label>
                    <textarea class="form-control rich-editor" id="textContent"
                              v-model="contentData.text" rows="10" required></textarea>
                  </div>
                  <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
                    <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    ذخیره محتوای متنی
                  </button>
                </form>
              </div>

              <!-- Tab: فایل -->
              <div class="tab-pane fade" id="file" role="tabpanel" aria-labelledby="file-tab">
                <form @submit.prevent="uploadFile">
                  <div class="mb-3">
                    <label for="fileUpload" class="form-label">آپلود فایل</label>
                    <input type="file" class="form-control" id="fileUpload" @change="handleFileSelect">
                    <small class="form-text text-muted">فرمت‌های مجاز: PDF, DOCX, PPT, ZIP (حداکثر 10MB)</small>
                  </div>
                  <div class="mb-3">
                    <label for="fileName" class="form-label">نام نمایشی فایل</label>
                    <input type="text" class="form-control" id="fileName" v-model="contentData.fileName" required>
                  </div>
                  <button type="submit" class="btn btn-primary" :disabled="isSubmitting || !contentData.file">
                    <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    آپلود فایل
                  </button>
                </form>
              </div>

              <!-- Tab: ویدیو -->
              <div class="tab-pane fade" id="video" role="tabpanel" aria-labelledby="video-tab">
                <form @submit.prevent="uploadVideo">
                  <div class="mb-3">
                    <label for="videoUpload" class="form-label">آپلود ویدیو</label>
                    <input type="file" class="form-control" id="videoUpload" @change="handleVideoSelect" accept="video/mp4,video/webm">
                    <small class="form-text text-muted">فرمت‌های مجاز: MP4, WEBM (حداکثر 100MB)</small>
                  </div>
                  <div class="mb-3">
                    <label for="videoTitle" class="form-label">عنوان ویدیو</label>
                    <input type="text" class="form-control" id="videoTitle" v-model="contentData.videoTitle" required>
                  </div>
                  <button type="submit" class="btn btn-primary" :disabled="isSubmitting || !contentData.video">
                    <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    آپلود ویدیو
                  </button>
                </form>
              </div>
            </div>
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
  name: 'CourseDetail',
  props: {
    id: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      course: {},
      loading: true,
      error: null,
      completedLessons: [],
      courseExams: [],
      progressData: {},

      // Modals
      lessonModal: null,
      editCourseModal: null,
      contentModal: null,

      // Form data
      currentLesson: {
        title: '',
        description: '',
        duration: ''
      },
      updatedCourse: {
        title: '',
        description: '',
        level: '',
        duration: ''
      },
      contentData: {
        text: '',
        file: null,
        fileName: '',
        video: null,
        videoTitle: ''
      },

      isEditingLesson: false,
      selectedLessonId: null,
      isSubmitting: false
    }
  },
  computed: {
    isTeacher() {
      return this.$store.getters.userRole.isTeacher
    },
    isTeacherOfCourse() {
      if (!this.course || !this.course.teacher) return false
      const user = this.$store.getters.currentUser
      return user && user.id === this.course.teacher.id
    },
    isEnrolled() {
      if (!this.course || !this.course.enrolledStudents) return false
      const user = this.$store.getters.currentUser
      return user && this.course.enrolledStudents.some(student => student.id === user.id)
    }
  },
  async created() {
    await this.fetchCourseData()

    // اگر کوئری پارامتر وجود داشته باشد، عملیات مربوطه را انجام می‌دهیم
    if (this.$route.query.addLesson) {
      setTimeout(() => this.showAddLessonModal(), 500)
    }
    if (this.$route.query.addExam) {
      setTimeout(() => this.showAddExamModal(), 500)
    }
  },
  mounted() {
    this.initModals()
  },
  methods: {
    async fetchCourseData() {
      try {
        this.loading = true

        // دریافت اطلاعات دوره
        const response = await axios.get(`/courses/${this.id}`)
        this.course = response.data

        // دریافت آزمون‌های دوره
        if (this.course.lessons && this.course.lessons.length > 0) {
          const lessonIds = this.course.lessons.map(lesson => lesson.id)
          const examsResponse = await axios.get(`/exams`, { params: { lessonIds: lessonIds.join(',') } })
          this.courseExams = examsResponse.data
        }

        // اگر کاربر دانش‌آموز است، اطلاعات پیشرفت را دریافت می‌کنیم
        if (!this.isTeacher) {
          const progressResponse = await axios.get(`/progress/${this.id}`)
          this.progressData = progressResponse.data

          if (this.progressData && this.progressData.completedLessons) {
            this.completedLessons = this.progressData.completedLessons
          }
        }

        // افزودن ویژگی expanded به درس‌ها برای نمایش/مخفی‌سازی محتوا
        if (this.course.lessons) {
          this.course.lessons = this.course.lessons.map(lesson => ({
            ...lesson,
            expanded: false
          }))
        }

        this.loading = false
      } catch (error) {
        console.error('Error fetching course data:', error)
        this.error = 'مشکلی در دریافت اطلاعات دوره رخ داد. لطفاً دوباره تلاش کنید.'
        this.loading = false
      }
    },

    initModals() {
      // ایجاد نمونه‌های مودال
      this.lessonModal = new bootstrap.Modal(document.getElementById('lessonModal'))
      this.editCourseModal = new bootstrap.Modal(document.getElementById('editCourseModal'))
      this.contentModal = new bootstrap.Modal(document.getElementById('contentModal'))
    },

    // توابع مربوط به درس‌ها
    toggleLesson(index) {
      // تغییر وضعیت نمایش/مخفی بودن محتوای درس
      this.$set(this.course.lessons[index], 'expanded', !this.course.lessons[index].expanded)
    },

    showAddLessonModal() {
      this.isEditingLesson = false
      this.currentLesson = {
        title: '',
        description: '',
        duration: ''
      }
      this.lessonModal.show()
    },

    editLesson(lesson) {
      this.isEditingLesson = true
      this.selectedLessonId = lesson.id
      this.currentLesson = {
        title: lesson.title,
        description: lesson.description,
        duration: lesson.duration
      }
      this.lessonModal.show()
    },

    async saveLesson() {
      this.isSubmitting = true

      try {
        let response

        if (this.isEditingLesson) {
          // ویرایش درس موجود
          response = await axios.put(`/lessons/${this.selectedLessonId}`, this.currentLesson)

          // به‌روزرسانی درس در لیست درس‌ها
          const index = this.course.lessons.findIndex(lesson => lesson.id === this.selectedLessonId)
          if (index !== -1) {
            const updatedLesson = {
              ...this.course.lessons[index],
              title: response.data.title,
              description: response.data.description,
              duration: response.data.duration
            }
            this.$set(this.course.lessons, index, updatedLesson)
          }
        } else {
          // اضافه کردن درس جدید
          const lessonData = {
            ...this.currentLesson,
            courseId: this.course.id
          }
          response = await axios.post('/lessons', lessonData)

          // افزودن درس جدید به لیست
          if (!this.course.lessons) {
            this.course.lessons = []
          }
          this.course.lessons.push({
            ...response.data,
            expanded: false
          })
        }

        // بستن مودال
        this.lessonModal.hide()

        // پیام موفقیت
        this.$toast.success(
            this.isEditingLesson
                ? 'درس با موفقیت به‌روزرسانی شد.'
                : 'درس جدید با موفقیت اضافه شد.'
        )
      } catch (error) {
        console.error('Error saving lesson:', error)
        this.$toast.error('مشکلی در ذخیره درس رخ داد. لطفاً دوباره تلاش کنید.')
      } finally {
        this.isSubmitting = false
      }
    },

    // توابع مربوط به دوره
    showEditCourseModal() {
      this.updatedCourse = {
        title: this.course.title,
        description: this.course.description,
        level: this.course.level || 'متوسط',
        duration: this.course.duration || ''
      }
      this.editCourseModal.show()
    },

    async updateCourse() {
      this.isSubmitting = true

      try {
        const response = await axios.put(`/courses/${this.id}`, this.updatedCourse)

        // به‌روزرسانی اطلاعات دوره
        this.course = {
          ...this.course,
          title: response.data.title,
          description: response.data.description,
          level: response.data.level,
          duration: response.data.duration
        }

        // بستن مودال
        this.editCourseModal.hide()

        // پیام موفقیت
        this.$toast.success('اطلاعات دوره با موفقیت به‌روزرسانی شد.')
      } catch (error) {
        console.error('Error updating course:', error)
        this.$toast.error('مشکلی در به‌روزرسانی دوره رخ داد. لطفاً دوباره تلاش کنید.')
      } finally {
        this.isSubmitting = false
      }
    },

    // توابع مربوط به محتوا
    addContent(lesson) {
      this.selectedLessonId = lesson.id
      this.contentData = {
        text: lesson.content || '',
        file: null,
        fileName: '',
        video: null,
        videoTitle: ''
      }
      this.contentModal.show()
    },

    async saveTextContent() {
      this.isSubmitting = true

      try {
        const contentData = {
          content: this.contentData.text
        }

        await axios.put(`/lessons/${this.selectedLessonId}/content`, contentData)

        // به‌روزرسانی محتوا در درس
        const index = this.course.lessons.findIndex(lesson => lesson.id === this.selectedLessonId)
        if (index !== -1) {
          this.$set(this.course.lessons[index], 'content', this.contentData.text)
        }

        // بستن مودال
        this.contentModal.hide()

        // پیام موفقیت
        this.$toast.success('محتوای متنی با موفقیت ذخیره شد.')
      } catch (error) {
        console.error('Error saving text content:', error)
        this.$toast.error('مشکلی در ذخیره محتوای متنی رخ داد. لطفاً دوباره تلاش کنید.')
      } finally {
        this.isSubmitting = false
      }
    },

    handleFileSelect(event) {
      if (event.target.files.length > 0) {
        this.contentData.file = event.target.files[0]
        if (!this.contentData.fileName) {
          this.contentData.fileName = this.contentData.file.name
        }
      }
    },

    async uploadFile() {
      this.isSubmitting = true

      try {
        // ایجاد FormData برای آپلود فایل
        const formData = new FormData()
        formData.append('file', this.contentData.file)
        formData.append('name', this.contentData.fileName)
        formData.append('lessonId', this.selectedLessonId)

        const response = await axios.post('/attachments', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })

        // افزودن فایل جدید به لیست فایل‌های درس
        const index = this.course.lessons.findIndex(lesson => lesson.id === this.selectedLessonId)
        if (index !== -1) {
          if (!this.course.lessons[index].attachments) {
            this.course.lessons[index].attachments = []
          }
          this.course.lessons[index].attachments.push(response.data)
        }

        // بستن مودال
        this.contentModal.hide()

        // پیام موفقیت
        this.$toast.success('فایل با موفقیت آپلود شد.')
      } catch (error) {
        console.error('Error uploading file:', error)
        this.$toast.error('مشکلی در آپلود فایل رخ داد. لطفاً دوباره تلاش کنید.')
      } finally {
        this.isSubmitting = false
      }
    },

    handleVideoSelect(event) {
      if (event.target.files.length > 0) {
        this.contentData.video = event.target.files[0]
        if (!this.contentData.videoTitle) {
          this.contentData.videoTitle = this.contentData.video.name
        }
      }
    },

    async uploadVideo() {
      this.isSubmitting = true

      try {
        // ایجاد FormData برای آپلود ویدیو
        const formData = new FormData()
        formData.append('video', this.contentData.video)
        formData.append('title', this.contentData.videoTitle)
        formData.append('lessonId', this.selectedLessonId)

        const response = await axios.post('/videos', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })

        // به‌روزرسانی URL ویدیو در درس
        const index = this.course.lessons.findIndex(lesson => lesson.id === this.selectedLessonId)
        if (index !== -1) {
          this.$set(this.course.lessons[index], 'videoUrl', response.data.url)
        }

        // بستن مودال
        this.contentModal.hide()

        // پیام موفقیت
        this.$toast.success('ویدیو با موفقیت آپلود شد.')
      } catch (error) {
        console.error('Error uploading video:', error)
        this.$toast.error('مشکلی در آپلود ویدیو رخ داد. لطفاً دوباره تلاش کنید.')
      } finally {
        this.isSubmitting = false
      }
    },

    // توابع مربوط به آزمون
    getRelatedLesson(exam) {
      if (!exam.lesson) return 'نامشخص'
      return exam.lesson.title || 'نامشخص'
    },

    getExamStatusClass(exam) {
      if (this.hasCompletedExam(exam)) {
        return 'badge bg-success'
      }
      return 'badge bg-primary'
    },

    getExamStatusText(exam) {
      if (this.hasCompletedExam(exam)) {
        return 'انجام شده'
      }
      return 'آماده'
    },

    hasCompletedExam(exam) {
      // بررسی اینکه دانش‌آموز آزمون را انجام داده است یا خیر
      if (!exam || !exam.submissions || !this.$store.getters.currentUser) return false
      return exam.submissions.some(sub => sub.studentId === this.$store.getters.currentUser.id)
    },

    startExam(exam) {
      // انتقال به صفحه آزمون
      this.$router.push({ name: 'Exam', params: { id: exam.id } })
    },

    viewExamResult(exam) {
      // انتقال به صفحه نتیجه آزمون
      this.$router.push({ name: 'ExamResult', params: { id: exam.id } })
    },

    editExam(exam) {
      // انتقال به صفحه ویرایش آزمون
      this.$router.push({ name: 'ExamEdit', params: { id: exam.id } })
    },

    viewExamResults(exam) {
      // انتقال به صفحه نتایج آزمون (برای معلم)
      this.$router.push({ name: 'ExamResults', params: { id: exam.id } })
    },

    // توابع مربوط به ثبت‌نام دوره
    async enrollCourse() {
      try {
        await axios.post(`/courses/${this.id}/enroll`)

        // به‌روزرسانی لیست دانش‌آموزان ثبت‌نام شده
        if (!this.course.enrolledStudents) {
          this.course.enrolledStudents = []
        }

        // افزودن کاربر فعلی به لیست دانش‌آموزان
        const currentUser = this.$store.getters.currentUser
        this.course.enrolledStudents.push({
          ...currentUser,
          enrollmentDate: new Date().toISOString()
        })

        // پیام موفقیت
        this.$toast.success('ثبت‌نام در دوره با موفقیت انجام شد.')
      } catch (error) {
        console.error('Error enrolling in course:', error)
        this.$toast.error('مشکلی در ثبت‌نام دوره رخ داد. لطفاً دوباره تلاش کنید.')
      }
    },

    // توابع مربوط به تکمیل درس
    isLessonCompleted(lessonId) {
      return this.completedLessons.includes(lessonId)
    },

    async markLessonComplete(lessonId) {
      try {
        await axios.post(`/progress/lessons/${lessonId}/complete`)

        // افزودن درس به لیست درس‌های تکمیل شده
        if (!this.completedLessons.includes(lessonId)) {
          this.completedLessons.push(lessonId)
        }

        // پیام موفقیت
        this.$toast.success('درس با موفقیت به عنوان تکمیل شده علامت‌گذاری شد.')
      } catch (error) {
        console.error('Error marking lesson as complete:', error)
        this.$toast.error('مشکلی در علامت‌گذاری درس رخ داد. لطفاً دوباره تلاش کنید.')
      }
    },

    // توابع مربوط به پیشرفت دانش‌آموزان
    getStudentProgress(studentId) {
      // محاسبه درصد پیشرفت دانش‌آموز
      if (!this.course.lessons || this.course.lessons.length === 0) return 0

      const studentProgress = this.course.progress?.find(p => p.studentId === studentId)
      if (!studentProgress || !studentProgress.completedLessons) return 0

      const totalLessons = this.course.lessons.length
      const completedLessons = studentProgress.completedLessons.length

      return Math.round((completedLessons / totalLessons) * 100)
    },

    viewStudentProgress(student) {
      // انتقال به صفحه جزئیات پیشرفت دانش‌آموز
      this.$router.push({
        name: 'StudentProgress',
        params: { courseId: this.id, studentId: student.id }
      })
    },

    // توابع کمکی
    getTeacherName() {
      if (!this.course.teacher) return 'نامشخص'
      return this.course.teacher.firstName && this.course.teacher.lastName
          ? `${this.course.teacher.firstName} ${this.course.teacher.lastName}`
          : this.course.teacher.username
    },

    getStudentName(student) {
      if (!student) return 'نامشخص'
      return student.firstName && student.lastName
          ? `${student.firstName} ${student.lastName}`
          : student.username
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

    getFileIcon(fileType) {
      // تعیین آیکون مناسب بر اساس نوع فایل
      if (!fileType) return 'fas fa-file'

      switch (fileType.toLowerCase()) {
        case 'pdf':
          return 'fas fa-file-pdf'
        case 'doc':
        case 'docx':
          return 'fas fa-file-word'
        case 'xls':
        case 'xlsx':
          return 'fas fa-file-excel'
        case 'ppt':
        case 'pptx':
          return 'fas fa-file-powerpoint'
        case 'zip':
        case 'rar':
          return 'fas fa-file-archive'
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif':
          return 'fas fa-file-image'
        default:
          return 'fas fa-file'
      }
    },

    formatFileSize(bytes) {
      if (!bytes || bytes === 0) return '0 B'

      const sizes = ['B', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(1024))

      return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i]
    }
  }
}
</script>

<style scoped>
.course-detail {
  padding: 20px 0;
}

.course-header {
  border-bottom: 1px solid #dee2e6;
  padding-bottom: 15px;
}

.info-box {
  display: flex;
  align-items: center;
  padding: 15px;
  border-radius: 5px;
  background-color: #f8f9fa;
  margin-bottom: 10px;
}

.info-box i {
  font-size: 1.8rem;
  color: #007bff;
  margin-left: 15px;
}

.info-box h5 {
  margin-bottom: 5px;
  font-size: 0.9rem;
  color: #6c757d;
}

.info-box p {
  margin-bottom: 0;
  font-weight: bold;
}

.lesson-list {
  margin-top: 20px;
}

.lesson-item {
  border: 1px solid #dee2e6;
  border-radius: 5px;
  margin-bottom: 10px;
  overflow: hidden;
}

.lesson-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background-color: #f8f9fa;
  cursor: pointer;
}

.lesson-header:hover {
  background-color: #e9ecef;
}

.lesson-title {
  display: flex;
  align-items: center;
}

.lesson-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  background-color: #007bff;
  color: white;
  border-radius: 50%;
  margin-left: 10px;
  font-weight: bold;
}

.lesson-title h4 {
  margin-bottom: 0;
  font-size: 1.1rem;
}

.lesson-duration {
  color: #6c757d;
  margin-left: 15px;
}

.lesson-duration i {
  margin-left: 5px;
}

.lesson-content {
  padding: 20px;
  border-top: 1px solid #dee2e6;
}

.content-text {
  background-color: #fff;
  border: 1px solid #dee2e6;
  border-radius: 5px;
  padding: 15px;
}

.attachments ul {
  margin-bottom: 0;
}

.video-container {
  background-color: #000;
  border-radius: 5px;
  overflow: hidden;
}
</style>