<template>
  <div class="course-detail-container">
    <div class="container-fluid p-4">
      <loading-spinner :loading="loading">
        <div v-if="course">
          <!-- Course Header -->
          <div class="course-header">
            <div class="course-banner">
              <img :src="getCourseImage(course)" :alt="course.title">

              <!-- Enrollment Status -->
              <div v-if="isStudent" class="enrollment-status">
                <span v-if="isEnrolled" class="badge bg-success">
                  <i class="fas fa-check-circle me-1"></i> ثبت‌نام شده
                </span>
                <button
                    v-else
                    class="btn btn-success btn-sm"
                    @click="enrollCourse"
                    :disabled="enrolling"
                >
                  <span v-if="enrolling" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                  ثبت‌نام در دوره
                </button>
              </div>
            </div>

            <div class="course-info-section">
              <div class="row">
                <div class="col-md-8">
                  <h1 class="course-title">{{ course.title }}</h1>
                  <p class="course-description">{{ course.description }}</p>

                  <div class="course-teacher">
                    <div class="teacher-avatar">
                      <span>{{ getTeacherInitials() }}</span>
                    </div>
                    <div class="teacher-info">
                      <div class="teacher-name">{{ getTeacherName() }}</div>
                      <div class="teacher-role">استاد دوره</div>
                    </div>
                  </div>
                </div>

                <div class="col-md-4">
                  <div class="course-stats">
                    <div class="stat-item">
                      <div class="stat-icon">
                        <i class="fas fa-users"></i>
                      </div>
                      <div class="stat-info">
                        <div class="stat-value">{{ getStudentCount() }}</div>
                        <div class="stat-label">دانش‌آموز</div>
                      </div>
                    </div>

                    <div class="stat-item">
                      <div class="stat-icon">
                        <i class="fas fa-book-open"></i>
                      </div>
                      <div class="stat-info">
                        <div class="stat-value">{{ getLessonCount() }}</div>
                        <div class="stat-label">درس</div>
                      </div>
                    </div>

                    <div v-if="isStudent && isEnrolled" class="stat-item">
                      <div class="stat-icon">
                        <i class="fas fa-chart-line"></i>
                      </div>
                      <div class="stat-info">
                        <div class="stat-value">{{ getProgress() }}%</div>
                        <div class="stat-label">پیشرفت</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Tabs for different sections -->
          <div class="course-content-tabs">
            <ul class="nav nav-tabs" id="courseTab" role="tablist">
              <li class="nav-item" role="presentation">
                <button
                    class="nav-link active"
                    id="lessons-tab"
                    data-bs-toggle="tab"
                    data-bs-target="#lessons"
                    type="button"
                    role="tab"
                    aria-controls="lessons"
                    aria-selected="true"
                >
                  <i class="fas fa-book me-1"></i> دروس و محتوا
                </button>
              </li>
              <li class="nav-item" role="presentation">
                <button
                    class="nav-link"
                    id="info-tab"
                    data-bs-toggle="tab"
                    data-bs-target="#info"
                    type="button"
                    role="tab"
                    aria-controls="info"
                    aria-selected="false"
                >
                  <i class="fas fa-info-circle me-1"></i> اطلاعات دوره
                </button>
              </li>
              <li class="nav-item" role="presentation">
                <button
                    class="nav-link"
                    id="students-tab"
                    data-bs-toggle="tab"
                    data-bs-target="#students"
                    type="button"
                    role="tab"
                    aria-controls="students"
                    aria-selected="false"
                >
                  <i class="fas fa-users me-1"></i> دانش‌آموزان
                </button>
              </li>
              <li v-if="isTeacher" class="nav-item" role="presentation">
                <button
                    class="nav-link"
                    id="manage-tab"
                    data-bs-toggle="tab"
                    data-bs-target="#manage"
                    type="button"
                    role="tab"
                    aria-controls="manage"
                    aria-selected="false"
                >
                  <i class="fas fa-cog me-1"></i> مدیریت دوره
                </button>
              </li>
              <li v-if="isStudent && isEnrolled" class="nav-item" role="presentation">
                <button
                    class="nav-link"
                    id="progress-tab"
                    data-bs-toggle="tab"
                    data-bs-target="#progress"
                    type="button"
                    role="tab"
                    aria-controls="progress"
                    aria-selected="false"
                >
                  <i class="fas fa-chart-line me-1"></i> پیشرفت من
                </button>
              </li>
            </ul>

            <div class="tab-content p-4 course-tab-content" id="courseTabContent">
              <!-- Lessons Tab -->
              <div
                  class="tab-pane fade show active"
                  id="lessons"
                  role="tabpanel"
                  aria-labelledby="lessons-tab"
              >
                <div v-if="course.lessons && course.lessons.length > 0">
                  <div class="lessons-list">
                    <div v-for="(lesson, index) in course.lessons" :key="lesson.id" class="lesson-item">
                      <div class="lesson-header" @click="toggleLesson(lesson)">
                        <div class="lesson-number">{{ index + 1 }}</div>
                        <div class="lesson-info">
                          <div class="lesson-title">{{ lesson.title }}</div>
                          <div class="lesson-meta">
                            <span v-if="lesson.contents">{{ lesson.contents.length }} محتوا</span>
                            <span v-if="lesson.hasExam">
                              <i class="fas fa-file-alt ms-2 me-1"></i> آزمون
                            </span>
                            <span v-if="lesson.hasExercise">
                              <i class="fas fa-tasks ms-2 me-1"></i> تمرین
                            </span>
                          </div>
                        </div>
                        <div class="lesson-status">
                          <span v-if="isStudent && isLessonCompleted(lesson)" class="badge bg-success">
                            <i class="fas fa-check"></i> تکمیل شده
                          </span>
                          <i class="fas" :class="lesson.expanded ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
                        </div>
                      </div>

                      <div v-if="lesson.expanded" class="lesson-content">
                        <div v-if="lesson.description" class="lesson-description mb-3">
                          {{ lesson.description }}
                        </div>

                        <div v-if="lesson.contents && lesson.contents.length > 0" class="content-list">
                          <div v-for="content in lesson.contents" :key="content.id" class="content-item">
                            <div class="content-type-icon">
                              <i :class="getContentIcon(content.type)"></i>
                            </div>
                            <div class="content-info">
                              <div class="content-title">{{ content.title }}</div>
                              <div v-if="content.type === 'TEXT'" class="content-preview">
                                {{ truncateText(content.textContent, 100) }}
                              </div>
                            </div>
                            <div class="content-actions">
                              <button
                                  v-if="content.type === 'TEXT'"
                                  class="btn btn-sm btn-outline-primary"
                                  @click="viewTextContent(content)"
                              >
                                مشاهده
                              </button>
                              <a
                                  v-else-if="content.file"
                                  :href="`/api/content/files/${content.file.id}`"
                                  target="_blank"
                                  class="btn btn-sm btn-outline-primary"
                              >
                                دانلود
                              </a>
                            </div>
                          </div>
                        </div>

                        <div class="lesson-actions mt-3">
                          <div>
                            <button
                                v-if="lesson.hasExam"
                                class="btn btn-primary btn-sm me-2"
                                @click="navigateToExam(lesson)"
                            >
                              <i class="fas fa-file-alt me-1"></i> شرکت در آزمون
                            </button>

                            <button
                                v-if="lesson.hasExercise"
                                class="btn btn-info btn-sm"
                                @click="navigateToExercise(lesson)"
                            >
                              <i class="fas fa-tasks me-1"></i> انجام تمرین
                            </button>
                          </div>

                          <button
                              v-if="isStudent && isEnrolled && !isLessonCompleted(lesson)"
                              class="btn btn-success btn-sm"
                              @click="markLessonAsComplete(lesson)"
                          >
                            <i class="fas fa-check me-1"></i> علامت‌گذاری به عنوان تکمیل شده
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <empty-state
                    v-else
                    title="هنوز درسی اضافه نشده است"
                    description="استاد دوره در حال آماده‌سازی محتوای دوره است."
                    icon="book"
                    compact
                />
              </div>

              <!-- Course Info Tab -->
              <div
                  class="tab-pane fade"
                  id="info"
                  role="tabpanel"
                  aria-labelledby="info-tab"
              >
                <div class="course-details">
                  <h4>درباره دوره</h4>
                  <p>{{ course.description }}</p>

                  <div class="course-meta-info">
                    <div class="meta-item">
                      <div class="meta-label">تاریخ شروع:</div>
                      <div class="meta-value">{{ formatDate(course.createdAt) }}</div>
                    </div>

                    <div class="meta-item">
                      <div class="meta-label">استاد دوره:</div>
                      <div class="meta-value">{{ getTeacherName() }}</div>
                    </div>

                    <div class="meta-item">
                      <div class="meta-label">تعداد دروس:</div>
                      <div class="meta-value">{{ getLessonCount() }}</div>
                    </div>

                    <div class="meta-item">
                      <div class="meta-label">تعداد دانش‌آموزان:</div>
                      <div class="meta-value">{{ getStudentCount() }}</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Students Tab -->
              <div
                  class="tab-pane fade"
                  id="students"
                  role="tabpanel"
                  aria-labelledby="students-tab"
              >
                <div v-if="course.enrolledStudents && course.enrolledStudents.length > 0">
                  <div class="students-list">
                    <div class="row">
                      <div
                          v-for="student in course.enrolledStudents"
                          :key="student.id"
                          class="col-md-6 col-lg-4 mb-3"
                      >
                        <div class="student-card">
                          <div class="student-avatar">
                            <span>{{ getStudentInitials(student) }}</span>
                          </div>
                          <div class="student-info">
                            <div class="student-name">{{ getStudentName(student) }}</div>
                            <div class="student-progress" v-if="isTeacher">
                              <div class="progress">
                                <div
                                    class="progress-bar bg-success"
                                    role="progressbar"
                                    :style="`width: ${getStudentProgress(student)}%`"
                                    :aria-valuenow="getStudentProgress(student)"
                                    aria-valuemin="0"
                                    aria-valuemax="100"
                                >
                                  {{ getStudentProgress(student) }}%
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <empty-state
                    v-else
                    title="هنوز دانش‌آموزی در این دوره ثبت‌نام نکرده است"
                    description="به محض ثبت‌نام دانش‌آموزان، آنها را در اینجا مشاهده خواهید کرد."
                    icon="users"
                    compact
                />
              </div>

              <!-- Course Management Tab (Teacher Only) -->
              <div
                  v-if="isTeacher"
                  class="tab-pane fade"
                  id="manage"
                  role="tabpanel"
                  aria-labelledby="manage-tab"
              >
                <div class="course-management">
                  <div class="management-section">
                    <h4>ویرایش اطلاعات دوره</h4>
                    <div class="form-group mb-3">
                      <label for="courseTitle" class="form-label">عنوان دوره</label>
                      <input
                          type="text"
                          id="courseTitle"
                          class="form-control"
                          v-model="editCourseForm.title"
                          placeholder="عنوان دوره"
                      >
                    </div>

                    <div class="form-group mb-3">
                      <label for="courseDescription" class="form-label">توضیحات دوره</label>
                      <textarea
                          id="courseDescription"
                          class="form-control"
                          v-model="editCourseForm.description"
                          rows="4"
                          placeholder="توضیحات دوره"
                      ></textarea>
                    </div>

                    <button
                        class="btn btn-primary"
                        @click="updateCourseInfo"
                        :disabled="updatingCourse"
                    >
                      <span v-if="updatingCourse" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                      ذخیره تغییرات
                    </button>
                  </div>

                  <hr class="my-4">

                  <div class="management-section">
                    <h4>مدیریت دروس</h4>
                    <button class="btn btn-success mb-3" @click="showAddLessonModal">
                      <i class="fas fa-plus me-1"></i> افزودن درس جدید
                    </button>

                    <div v-if="course.lessons && course.lessons.length > 0" class="lesson-management-list">
                      <div v-for="(lesson, index) in course.lessons" :key="lesson.id" class="lesson-management-item">
                        <div class="lesson-number">{{ index + 1 }}</div>
                        <div class="lesson-info">
                          <div class="lesson-title">{{ lesson.title }}</div>
                          <div class="lesson-meta">
                            <span v-if="lesson.contents">{{ lesson.contents?.length || 0 }} محتوا</span>
                            <span v-if="lesson.hasExam">
                              <i class="fas fa-file-alt ms-2 me-1"></i> آزمون
                            </span>
                            <span v-if="lesson.hasExercise">
                              <i class="fas fa-tasks ms-2 me-1"></i> تمرین
                            </span>
                          </div>
                        </div>
                        <div class="lesson-actions">
                          <button class="btn btn-sm btn-outline-primary me-1" @click="editLesson(lesson)">
                            <i class="fas fa-edit"></i>
                          </button>
                          <button class="btn btn-sm btn-outline-danger" @click="deleteLesson(lesson)">
                            <i class="fas fa-trash"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                    <empty-state
                        v-else
                        title="هنوز درسی اضافه نشده است"
                        description="با استفاده از دکمه بالا، درس جدید اضافه کنید."
                        icon="book"
                        compact
                    />
                  </div>
                </div>
              </div>

              <!-- Progress Tab (Student Only) -->
              <div
                  v-if="isStudent && isEnrolled"
                  class="tab-pane fade"
                  id="progress"
                  role="tabpanel"
                  aria-labelledby="progress-tab"
              >
                <div class="student-progress-overview">
                  <div class="row">
                    <div class="col-md-4">
                      <div class="progress-circle-container">
                        <svg width="160" height="160" viewBox="0 0 160 160">
                          <circle cx="80" cy="80" r="70" fill="none" stroke="#e9ecef" stroke-width="15" />
                          <circle
                              cx="80"
                              cy="80"
                              r="70"
                              fill="none"
                              stroke="#20c997"
                              stroke-width="15"
                              :stroke-dasharray="progress.circleLength"
                              :stroke-dashoffset="progress.circleDashOffset"
                              transform="rotate(-90, 80, 80)"
                          />
                        </svg>
                        <div class="progress-text">
                          <div class="progress-percentage">{{ getProgress() }}%</div>
                          <div class="progress-label">پیشرفت</div>
                        </div>
                      </div>
                    </div>

                    <div class="col-md-8">
                      <div class="row">
                        <div class="col-md-6 mb-3">
                          <div class="progress-stat-card">
                            <div class="stat-icon">
                              <i class="fas fa-book text-primary"></i>
                            </div>
                            <div class="stat-info">
                              <div class="stat-value">{{ progress.completedLessons }}/{{ getLessonCount() }}</div>
                              <div class="stat-label">دروس تکمیل شده</div>
                            </div>
                          </div>
                        </div>

                        <div class="col-md-6 mb-3">
                          <div class="progress-stat-card">
                            <div class="stat-icon">
                              <i class="fas fa-clock text-warning"></i>
                            </div>
                            <div class="stat-info">
                              <div class="stat-value">{{ formatTimeSpent(progress.totalTimeSpent) }}</div>
                              <div class="stat-label">زمان صرف شده</div>
                            </div>
                          </div>
                        </div>

                        <div class="col-md-6 mb-3">
                          <div class="progress-stat-card">
                            <div class="stat-icon">
                              <i class="fas fa-file-alt text-danger"></i>
                            </div>
                            <div class="stat-info">
                              <div class="stat-value">{{ progress.examsPassed }}/{{ progress.examsTotal }}</div>
                              <div class="stat-label">آزمون‌های قبول شده</div>
                            </div>
                          </div>
                        </div>

                        <div class="col-md-6 mb-3">
                          <div class="progress-stat-card">
                            <div class="stat-icon">
                              <i class="fas fa-tasks text-info"></i>
                            </div>
                            <div class="stat-info">
                              <div class="stat-value">{{ progress.exercisesCompleted }}/{{ progress.exercisesTotal }}</div>
                              <div class="stat-label">تمرین‌های انجام شده</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="progress-timeline mt-4">
                    <h5>گزارش پیشرفت</h5>
                    <div class="timeline">
                      <div v-for="(event, index) in progress.timeline" :key="index" class="timeline-item">
                        <div class="timeline-icon">
                          <i :class="getTimelineIcon(event.type)"></i>
                        </div>
                        <div class="timeline-content">
                          <div class="timeline-title">{{ event.title }}</div>
                          <div class="timeline-date">{{ formatDate(event.date) }}</div>
                          <div v-if="event.description" class="timeline-description">
                            {{ event.description }}
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

        <empty-state
            v-else
            title="دوره یافت نشد"
            description="متأسفانه دوره مورد نظر یافت نشد یا شما دسترسی به آن ندارید."
            icon="graduation-cap"
        >
          <router-link :to="{ name: 'Courses' }" class="btn btn-primary">
            بازگشت به لیست دوره‌ها
          </router-link>
        </empty-state>
      </loading-spinner>
    </div>

    <!-- Modal for adding/editing lessons -->
    <div class="modal fade" id="lessonModal" tabindex="-1" aria-labelledby="lessonModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="lessonModalLabel">
              {{ lessonForm.id ? 'ویرایش درس' : 'افزودن درس جدید' }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="form-group mb-3">
              <label for="lessonTitle" class="form-label">عنوان درس</label>
              <input type="text" id="lessonTitle" class="form-control" v-model="lessonForm.title" placeholder="عنوان درس">
            </div>

            <div class="form-group mb-3">
              <label for="lessonDescription" class="form-label">توضیحات درس</label>
              <textarea id="lessonDescription" class="form-control" v-model="lessonForm.description" rows="3" placeholder="توضیحات درس"></textarea>
            </div>

            <div class="form-group mb-3">
              <label for="lessonOrder" class="form-label">ترتیب نمایش</label>
              <input type="number" id="lessonOrder" class="form-control" v-model="lessonForm.orderIndex" min="0">
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">انصراف</button>
            <button
                type="button"
                class="btn btn-primary"
                @click="saveLesson"
                :disabled="savingLesson"
            >
              <span v-if="savingLesson" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
              ذخیره
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal for viewing text content -->
    <div class="modal fade" id="contentModal" tabindex="-1" aria-labelledby="contentModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="contentModalLabel">{{ selectedContent.title }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="content-text">
              {{ selectedContent.textContent }}
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">بستن</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Confirmation Dialog -->
    <confirmation-dialog
        ref="confirmDialog"
        title="تأیید حذف"
        message="آیا از حذف این مورد اطمینان دارید؟ این عمل قابل بازگشت نیست."
        confirm-button-type="danger"
        icon="trash"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { useUser } from '@/composables/useUser.js';
import { useFormatters } from '@/composables/useFormatters.js';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import ConfirmationDialog from '@/components/common/ConfirmationDialog.vue';

export default {
  name: 'CourseDetail',
  components: {
    LoadingSpinner,
    EmptyState,
    ConfirmationDialog
  },
  props: {
    id: {
      type: [String, Number],
      required: true
    }
  },
  setup() {
    const { isStudent, isTeacher, getUserFullName } = useUser();
    const { formatDate, truncateText } = useFormatters();

    return {
      isStudent,
      isTeacher,
      getUserFullName,
      formatDate,
      truncateText
    };
  },
  data() {
    return {
      loading: true,
      enrolling: false,
      updatingCourse: false,
      savingLesson: false,
      course: null,
      isEnrolled: false,

      // Modals state
      lessonForm: {
        id: null,
        title: '',
        description: '',
        orderIndex: 0
      },
      selectedContent: {
        id: null,
        title: '',
        textContent: ''
      },
      editCourseForm: {
        title: '',
        description: ''
      },

      // Student progress data
      progress: {
        completedLessons: 0,
        totalTimeSpent: 0,
        examsPassed: 0,
        examsTotal: 0,
        exercisesCompleted: 0,
        exercisesTotal: 0,
        circleLength: 439.6, // 2 * PI * 70 (circle radius)
        circleDashOffset: 439.6, // Initial offset (0% progress)
        completedLessonIds: [],
        timeline: [
          {
            type: 'enrollment',
            title: 'ثبت‌نام در دوره',
            date: '2025-05-15',
            description: 'شما با موفقیت در این دوره ثبت‌نام کردید.'
          }
          // سایر رویدادهای پیشرفت در اینجا اضافه می‌شوند
        ]
      }
    };
  },
  computed: {
    ...mapGetters({
      courseDetail: 'courses/getCurrentCourse'
    }),
    courseId() {
      return parseInt(this.id);
    }
  },
  async created() {
    try {
      await this.fetchCourseDetails();
    } catch (error) {
      console.error('Error fetching course details:', error);
      this.$toast.error('خطا در دریافت اطلاعات دوره');
    } finally {
      this.loading = false;
    }
  },
  methods: {
    async fetchCourseDetails() {
      try {
        // استفاده از اکشن Vuex برای دریافت جزئیات دوره
        await this.$store.dispatch('courses/fetchCourseById', this.courseId);
        this.course = { ...this.courseDetail };

        if (!this.course) {
          return;
        }

        // تنظیم فرم ویرایش دوره
        this.editCourseForm.title = this.course.title;
        this.editCourseForm.description = this.course.description || '';

        // اضافه کردن ویژگی expanded برای هر درس
        if (this.course.lessons) {
          this.course.lessons = this.course.lessons.map(lesson => ({
            ...lesson,
            expanded: false
          }));
        }

        // بررسی وضعیت ثبت‌نام دانش‌آموز در دوره
        if (this.isStudent) {
          this.checkEnrollmentStatus();

          // مقداردهی اولیه اطلاعات پیشرفت دانش‌آموز (در پروژه واقعی از API دریافت می‌شود)
          if (this.isEnrolled) {
            this.fetchStudentProgress();
          }
        }
      } catch (error) {
        throw error;
      }
    },

    checkEnrollmentStatus() {
      // در پروژه واقعی، این اطلاعات از پاسخ API درباره دوره استخراج می‌شود
      // برای اهداف نمایشی، ما وضعیت را به صورت تصادفی تعیین می‌کنیم
      this.isEnrolled = true;
    },

    fetchStudentProgress() {
      // در پروژه واقعی، این اطلاعات از API پیشرفت دانش‌آموز دریافت می‌شود
      // برای اهداف نمایشی، داده‌های نمونه ایجاد می‌کنیم

      // تنظیم درس‌های تکمیل شده به صورت تصادفی
      if (this.course.lessons) {
        const lessonCount = this.course.lessons.length;
        const completedCount = Math.floor(Math.random() * (lessonCount + 1));
        this.progress.completedLessons = completedCount;

        // ایجاد آرایه تصادفی از شناسه درس‌های تکمیل شده
        this.progress.completedLessonIds = this.course.lessons
            .slice(0, completedCount)
            .map(lesson => lesson.id);
      }

      // اطلاعات آزمون و تمرین
      this.progress.examsTotal = this.course.lessons?.filter(l => l.hasExam)?.length || 0;
      this.progress.examsPassed = Math.floor(Math.random() * (this.progress.examsTotal + 1));

      this.progress.exercisesTotal = this.course.lessons?.filter(l => l.hasExercise)?.length || 0;
      this.progress.exercisesCompleted = Math.floor(Math.random() * (this.progress.exercisesTotal + 1));

      // زمان صرف شده (به ثانیه)
      this.progress.totalTimeSpent = Math.floor(Math.random() * 10000);

      // محاسبه مقدار dashoffset برای دایره پیشرفت
      const progressPercent = this.getProgress();
      this.progress.circleDashOffset = this.progress.circleLength * (1 - progressPercent / 100);

      // ایجاد رویدادهای تایم‌لاین تصادفی
      this.generateRandomTimelineEvents();
    },

    generateRandomTimelineEvents() {
      // این متد رویدادهای تصادفی برای تایم‌لاین پیشرفت ایجاد می‌کند
      const events = [
        {
          type: 'enrollment',
          title: 'ثبت‌نام در دوره',
          date: '2025-05-15',
          description: 'شما با موفقیت در این دوره ثبت‌نام کردید.'
        }
      ];

      // اضافه کردن رویدادهای تکمیل درس
      if (this.course.lessons) {
        for (let i = 0; i < this.progress.completedLessons; i++) {
          const lesson = this.course.lessons[i];
          const date = new Date('2025-05-15');
          date.setDate(date.getDate() + i + 1);

          events.push({
            type: 'lesson_completed',
            title: `تکمیل درس: ${lesson.title}`,
            date: date.toISOString().split('T')[0],
            description: null
          });
        }
      }

      // اضافه کردن رویدادهای آزمون و تمرین
      for (let i = 0; i < this.progress.examsPassed; i++) {
        const date = new Date('2025-05-20');
        date.setDate(date.getDate() + i * 2);

        events.push({
          type: 'exam_passed',
          title: `قبولی در آزمون درس ${i + 1}`,
          date: date.toISOString().split('T')[0],
          description: `نمره: ${Math.floor(Math.random() * 20) + 80}/100`
        });
      }

      for (let i = 0; i < this.progress.exercisesCompleted; i++) {
        const date = new Date('2025-05-18');
        date.setDate(date.getDate() + i * 3);

        events.push({
          type: 'exercise_completed',
          title: `تکمیل تمرین درس ${i + 1}`,
          date: date.toISOString().split('T')[0],
          description: null
        });
      }

      // مرتب‌سازی بر اساس تاریخ (نزولی)
      events.sort((a, b) => new Date(b.date) - new Date(a.date));

      this.progress.timeline = events;
    },

    toggleLesson(lesson) {
      lesson.expanded = !lesson.expanded;
    },

    getCourseImage(course) {
      // در یک پروژه واقعی، تصویر دوره از سرور دریافت می‌شود
      return `/api/placeholder/800/300`;
    },

    getTeacherName() {
      if (!this.course || !this.course.teacher) return 'نامشخص';
      return this.getUserFullName(this.course.teacher);
    },

    getTeacherInitials() {
      if (!this.course || !this.course.teacher) return 'N/A';

      const teacher = this.course.teacher;
      const firstInitial = teacher.firstName ? teacher.firstName.charAt(0) : '';
      const lastInitial = teacher.lastName ? teacher.lastName.charAt(0) : '';

      return (firstInitial + lastInitial).toUpperCase();
    },

    getStudentName(student) {
      if (!student) return 'نامشخص';
      return this.getUserFullName(student);
    },

    getStudentInitials(student) {
      if (!student) return 'N/A';

      const firstInitial = student.firstName ? student.firstName.charAt(0) : '';
      const lastInitial = student.lastName ? student.lastName.charAt(0) : '';

      return (firstInitial + lastInitial).toUpperCase();
    },

    getStudentCount() {
      if (!this.course || !this.course.enrolledStudents) return 0;
      return this.course.enrolledStudents.length;
    },

    getLessonCount() {
      if (!this.course || !this.course.lessons) return 0;
      return this.course.lessons.length;
    },

    getProgress() {
      // در کد واقعی، این مقدار از API دریافت می‌شود
      if (!this.course || !this.course.lessons || this.course.lessons.length === 0) {
        return 0;
      }

      return Math.round((this.progress.completedLessons / this.course.lessons.length) * 100);
    },

    getStudentProgress(student) {
      // در کد واقعی، این مقدار از API دریافت می‌شود
      // برای اهداف نمایشی، یک مقدار تصادفی برمی‌گردانیم
      if (!student.progress) {
        student.progress = Math.floor(Math.random() * 101);
      }
      return student.progress;
    },

    isLessonCompleted(lesson) {
      return this.progress.completedLessonIds.includes(lesson.id);
    },

    getContentIcon(contentType) {
      switch (contentType) {
        case 'TEXT':
          return 'fas fa-file-alt';
        case 'VIDEO':
          return 'fas fa-video';
        case 'PDF':
          return 'fas fa-file-pdf';
        case 'IMAGE':
          return 'fas fa-file-image';
        default:
          return 'fas fa-file';
      }
    },

    getTimelineIcon(eventType) {
      switch (eventType) {
        case 'enrollment':
          return 'fas fa-user-plus text-primary';
        case 'lesson_completed':
          return 'fas fa-book-reader text-success';
        case 'exam_passed':
          return 'fas fa-file-alt text-danger';
        case 'exercise_completed':
          return 'fas fa-tasks text-info';
        default:
          return 'fas fa-circle text-secondary';
      }
    },

    formatTimeSpent(seconds) {
      if (!seconds) return '0 دقیقه';

      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);

      if (hours > 0) {
        return `${hours} ساعت و ${minutes} دقیقه`;
      } else {
        return `${minutes} دقیقه`;
      }
    },

    async enrollCourse() {
      if (!this.isStudent || this.enrolling) return;

      this.enrolling = true;

      try {
        await this.$store.dispatch('courses/enrollCourse', this.courseId);
        this.isEnrolled = true;
        this.$toast.success('شما با موفقیت در این دوره ثبت‌نام شدید');

        // بازیابی اطلاعات دوره و پیشرفت دانش‌آموز
        await this.fetchCourseDetails();
      } catch (error) {
        console.error('Error enrolling in course:', error);
        this.$toast.error('خطا در ثبت‌نام دوره');
      } finally {
        this.enrolling = false;
      }
    },

    async markLessonAsComplete(lesson) {
      try {
        // در کد واقعی، این اطلاعات از طریق API به سرور ارسال می‌شود
        // در اینجا فقط به صورت محلی وضعیت را تغییر می‌دهیم

        this.progress.completedLessonIds.push(lesson.id);
        this.progress.completedLessons = this.progress.completedLessonIds.length;

        // بروزرسانی مقدار circleDashOffset
        const progressPercent = this.getProgress();
        this.progress.circleDashOffset = this.progress.circleLength * (1 - progressPercent / 100);

        // اضافه کردن به تایم‌لاین
        const today = new Date().toISOString().split('T')[0];
        this.progress.timeline.unshift({
          type: 'lesson_completed',
          title: `تکمیل درس: ${lesson.title}`,
          date: today,
          description: null
        });

        this.$toast.success(`درس "${lesson.title}" به عنوان تکمیل شده علامت‌گذاری شد`);
      } catch (error) {
        console.error('Error marking lesson as complete:', error);
        this.$toast.error('خطا در ثبت وضعیت تکمیل درس');
      }
    },

    navigateToExam(lesson) {
      // در کد واقعی، کاربر به صفحه آزمون هدایت می‌شود
      this.$router.push(`/exams/${lesson.id}`);
    },

    navigateToExercise(lesson) {
      // در کد واقعی، کاربر به صفحه تمرین هدایت می‌شود
      this.$router.push(`/exercises/${lesson.id}`);
    },

    viewTextContent(content) {
      this.selectedContent = { ...content };
      const modal = new bootstrap.Modal(document.getElementById('contentModal'));
      modal.show();
    },

    // متدهای مربوط به مدیریت دوره (برای معلمان)
    async updateCourseInfo() {
      if (!this.isTeacher || this.updatingCourse) return;

      this.updatingCourse = true;

      try {
        const courseData = {
          title: this.editCourseForm.title,
          description: this.editCourseForm.description
        };

        await this.$store.dispatch('courses/updateCourse', {
          courseId: this.courseId,
          courseData
        });

        // بروزرسانی اطلاعات دوره در حالت محلی
        this.course.title = courseData.title;
        this.course.description = courseData.description;

        this.$toast.success('اطلاعات دوره با موفقیت بروزرسانی شد');
      } catch (error) {
        console.error('Error updating course:', error);
        this.$toast.error('خطا در بروزرسانی اطلاعات دوره');
      } finally {
        this.updatingCourse = false;
      }
    },

    showAddLessonModal() {
      // ریست کردن فرم
      this.lessonForm = {
        id: null,
        title: '',
        description: '',
        orderIndex: this.course.lessons?.length || 0
      };

      // نمایش مودال
      const modal = new bootstrap.Modal(document.getElementById('lessonModal'));
      modal.show();
    },

    editLesson(lesson) {
      // پر کردن فرم با اطلاعات درس
      this.lessonForm = {
        id: lesson.id,
        title: lesson.title,
        description: lesson.description || '',
        orderIndex: lesson.orderIndex || 0
      };

      // نمایش مودال
      const modal = new bootstrap.Modal(document.getElementById('lessonModal'));
      modal.show();
    },

    async saveLesson() {
      if (this.savingLesson) return;

      this.savingLesson = true;

      try {
        const lessonData = {
          title: this.lessonForm.title,
          description: this.lessonForm.description,
          orderIndex: this.lessonForm.orderIndex
        };

        if (this.lessonForm.id) {
          // ویرایش درس موجود
          // در کد واقعی، یک درخواست به API ارسال می‌شود
          // در اینجا فقط به صورت محلی وضعیت را تغییر می‌دهیم

          const lessonIndex = this.course.lessons.findIndex(l => l.id === this.lessonForm.id);
          if (lessonIndex !== -1) {
            this.course.lessons[lessonIndex] = {
              ...this.course.lessons[lessonIndex],
              ...lessonData
            };
          }

          this.$toast.success('درس با موفقیت ویرایش شد');
        } else {
          // ایجاد درس جدید
          // در کد واقعی، یک درخواست به API ارسال می‌شود
          // در اینجا فقط به صورت محلی وضعیت را تغییر می‌دهیم

          const newLesson = {
            id: Date.now(), // تولید یک شناسه موقت
            ...lessonData,
            expanded: false,
            contents: []
          };

          if (!this.course.lessons) {
            this.course.lessons = [];
          }

          this.course.lessons.push(newLesson);

          this.$toast.success('درس جدید با موفقیت اضافه شد');
        }

        // مرتب‌سازی دروس بر اساس orderIndex
        this.course.lessons.sort((a, b) => a.orderIndex - b.orderIndex);

        // بستن مودال
        const modal = bootstrap.Modal.getInstance(document.getElementById('lessonModal'));
        modal.hide();
      } catch (error) {
        console.error('Error saving lesson:', error);
        this.$toast.error('خطا در ذخیره اطلاعات درس');
      } finally {
        this.savingLesson = false;
      }
    },

    async deleteLesson(lesson) {
      // نمایش دیالوگ تأیید
      const confirmed = await this.$refs.confirmDialog.show();

      if (!confirmed) return;

      try {
        // در کد واقعی، یک درخواست به API ارسال می‌شود
        // در اینجا فقط به صورت محلی وضعیت را تغییر می‌دهیم

        const lessonIndex = this.course.lessons.findIndex(l => l.id === lesson.id);
        if (lessonIndex !== -1) {
          this.course.lessons.splice(lessonIndex, 1);
        }

        this.$toast.success('درس با موفقیت حذف شد');
      } catch (error) {
        console.error('Error deleting lesson:', error);
        this.$toast.error('خطا در حذف درس');
      }
    }
  }
}
</script>

<style scoped>
.course-detail-container {
  min-height: calc(100vh - 56px);
}

.course-header {
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
  overflow: hidden;
}

.course-banner {
  position: relative;
  height: 240px;
  overflow: hidden;
}

.course-banner img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: brightness(0.85);
}

.enrollment-status {
  position: absolute;
  top: 20px;
  right: 20px;
}

.course-info-section {
  padding: 2rem;
}

.course-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #2c3e50;
}

.course-description {
  color: #6c757d;
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.course-teacher {
  display: flex;
  align-items: center;
  margin-top: 1.5rem;
}

.teacher-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: #e9ecef;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  font-weight: bold;
  color: #495057;
  margin-left: 12px;
}

.teacher-info {
  display: flex;
  flex-direction: column;
}

.teacher-name {
  font-weight: 600;
  color: #2c3e50;
}

.teacher-role {
  font-size: 0.85rem;
  color: #6c757d;
}

.course-stats {
  display: flex;
  flex-direction: column;
  gap: 10px;
  background-color: #f8f9fa;
  border-radius: 10px;
  padding: 1.5rem;
  height: 100%;
}

.stat-item {
  display: flex;
  align-items: center;
  padding: 10px;
  border-radius: 10px;
  background-color: #fff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
}

.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background-color: #e9ecef;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 12px;
  color: #495057;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-weight: 700;
  color: #2c3e50;
}

.stat-label {
  font-size: 0.85rem;
  color: #6c757d;
}

.course-content-tabs {
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.course-tab-content {
  min-height: 400px;
}

.lessons-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.lesson-item {
  border: 1px solid #e9ecef;
  border-radius: 10px;
  overflow: hidden;
}

.lesson-header {
  display: flex;
  align-items: center;
  padding: 15px;
  background-color: #f8f9fa;
  cursor: pointer;
  transition: background-color 0.3s;
}

.lesson-header:hover {
  background-color: #e9ecef;
}

.lesson-number {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #007bff;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  margin-left: 12px;
}

.lesson-info {
  flex: 1;
}

.lesson-title {
  font-weight: 600;
  color: #2c3e50;
}

.lesson-meta {
  font-size: 0.85rem;
  color: #6c757d;
  margin-top: 4px;
}

.lesson-status {
  display: flex;
  align-items: center;
  gap: 10px;
}

.lesson-content {
  padding: 20px;
  border-top: 1px solid #e9ecef;
  background-color: #fff;
}

.content-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.content-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  background-color: #f8f9fa;
}

.content-type-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background-color: #e9ecef;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 12px;
  color: #495057;
}

.content-info {
  flex: 1;
}

.content-title {
  font-weight: 600;
  color: #2c3e50;
}

.content-preview {
  font-size: 0.85rem;
  color: #6c757d;
  margin-top: 4px;
}

.content-actions {
  margin-right: 10px;
}

.lesson-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.content-text {
  white-space: pre-line;
  line-height: 1.6;
}

.course-management {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.management-section {
  background-color: #f8f9fa;
  border-radius: 10px;
  padding: 1.5rem;
}

.lesson-management-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 1rem;
}

.lesson-management-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  background-color: #fff;
}

.lesson-actions {
  display: flex;
  align-items: center;
}

.course-details {
  padding: 1rem;
}

.course-meta-info {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 2rem;
  background-color: #f8f9fa;
  border-radius: 10px;
  padding: 1.5rem;
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.meta-label {
  font-weight: 600;
  color: #495057;
}

.meta-value {
  color: #2c3e50;
}

.students-list {
  margin-top: 1rem;
}

.student-card {
  display: flex;
  align-items: center;
  padding: 15px;
  border: 1px solid #e9ecef;
  border-radius: 10px;
  background-color: #fff;
  height: 100%;
}

.student-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: #e9ecef;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  font-weight: bold;
  color: #495057;
  margin-left: 12px;
}

.student-info {
  flex: 1;
}

.student-name {
  font-weight: 600;
  color: #2c3e50;
}

.student-progress {
  margin-top: 8px;
}

.progress-circle-container {
  position: relative;
  width: 160px;
  height: 160px;
  margin: 0 auto;
}

.progress-text {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.progress-percentage {
  font-size: 2rem;
  font-weight: 700;
  color: #20c997;
}

.progress-label {
  font-size: 0.9rem;
  color: #6c757d;
}

.progress-stat-card {
  display: flex;
  align-items: center;
  padding: 15px;
  border-radius: 10px;
  background-color: #fff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
  height: 100%;
}

.progress-timeline {
  margin-top: 2rem;
}

.timeline {
  position: relative;
  padding: 20px;
}

.timeline:before {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  right: 20px;
  width: 2px;
  background-color: #e9ecef;
}

.timeline-item {
  position: relative;
  padding-right: 40px;
  margin-bottom: 20px;
}

.timeline-icon {
  position: absolute;
  right: 0;
  top: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #fff;
  border: 2px solid #e9ecef;
  display: flex;
  align-items: center;
  justify-content: center;
}

.timeline-content {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 10px 15px;
}

.timeline-title {
  font-weight: 600;
  color: #2c3e50;
}

.timeline-date {
  font-size: 0.85rem;
  color: #6c757d;
  margin-top: 2px;
}

.timeline-description {
  margin-top: 8px;
  font-size: 0.9rem;
  color: #495057;
}
</style>