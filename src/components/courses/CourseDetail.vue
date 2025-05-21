<template>
  <div class="course-detail-container">
    <div class="container-fluid p-4">
      <loading-spinner :loading="loading">
        <div v-if="course">
          <!-- Course Header -->
          <course-header
              :course="course"
              :is-teacher="isTeacher"
              :is-teacher-of-course="isTeacherOfCourse"
              :is-enrolled="isEnrolled"
              @edit-course="showEditCourseModal"
              @add-lesson="showAddLessonModal"
              @enroll-course="enrollInCourse"
          />

          <!-- Tabs for different sections -->
          <div class="course-content-tabs">
            <ul class="nav nav-tabs" id="courseTab" role="tablist">
              <li class="nav-item" role="presentation">
                <button class="nav-link active" id="overview-tab" data-bs-toggle="tab" data-bs-target="#overview"
                        type="button" role="tab" aria-controls="overview" aria-selected="true">
                  معرفی دوره
                </button>
              </li>
              <li class="nav-item" role="presentation">
                <button class="nav-link" id="lessons-tab" data-bs-toggle="tab" data-bs-target="#lessons"
                        type="button" role="tab" aria-controls="lessons" aria-selected="false">
                  درس‌ها
                </button>
              </li>
              <li class="nav-item" role="presentation">
                <button class="nav-link" id="students-tab" data-bs-toggle="tab" data-bs-target="#students"
                        type="button" role="tab" aria-controls="students" aria-selected="false">
                  دانش‌آموزان
                </button>
              </li>
              <li v-if="isTeacher && isTeacherOfCourse" class="nav-item" role="presentation">
                <button class="nav-link" id="manage-tab" data-bs-toggle="tab" data-bs-target="#manage"
                        type="button" role="tab" aria-controls="manage" aria-selected="false">
                  مدیریت دوره
                </button>
              </li>
            </ul>

            <div class="tab-content p-4 course-tab-content" id="courseTabContent">
              <!-- Overview Tab -->
              <div class="tab-pane fade show active" id="overview" role="tabpanel" aria-labelledby="overview-tab">
                <!-- Course Information -->
                <div class="course-info">
                  <h3>معرفی دوره</h3>
                  <div class="course-description">
                    <p>{{ course.description }}</p>
                  </div>

                  <!-- Course Stats -->
                  <div class="course-stats mt-4">
                    <div class="row">
                      <div class="col-md-4">
                        <div class="stat-card">
                          <div class="stat-icon"><i class="fas fa-book"></i></div>
                          <div class="stat-value">{{ course.lessons ? course.lessons.length : 0 }}</div>
                          <div class="stat-label">تعداد درس‌ها</div>
                        </div>
                      </div>
                      <div class="col-md-4">
                        <div class="stat-card">
                          <div class="stat-icon"><i class="fas fa-users"></i></div>
                          <div class="stat-value">{{ course.enrolledStudents ? course.enrolledStudents.length : 0 }}</div>
                          <div class="stat-label">دانش‌آموزان</div>
                        </div>
                      </div>
                      <div class="col-md-4">
                        <div class="stat-card">
                          <div class="stat-icon"><i class="fas fa-clock"></i></div>
                          <div class="stat-value">{{ getTotalDuration() }} دقیقه</div>
                          <div class="stat-label">مدت زمان دوره</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Course Teacher -->
                  <div class="course-teacher mt-4">
                    <h3>استاد دوره</h3>
                    <div class="teacher-info">
                      <div class="teacher-avatar">
                        <!--                        <img src="/api/placeholder/80/80" alt="Teacher Avatar">-->
                      </div>
                      <div class="teacher-details">
                        <h4>{{ getTeacherName() }}</h4>
                        <p>{{ course.teacher?.description || 'توضیحات استاد در دسترس نیست.' }}</p>
                      </div>
                    </div>
                  </div>

                  <!-- Course Prerequisites if any -->
                  <div class="course-prerequisites mt-4">
                    <h3>پیش‌نیازها</h3>
                    <ul v-if="course.prerequisites && course.prerequisites.length > 0">
                      <li v-for="prerequisite in course.prerequisites" :key="prerequisite.id">
                        {{ prerequisite.title }}
                      </li>
                    </ul>
                    <p v-else>این دوره پیش‌نیازی ندارد.</p>
                  </div>
                </div>
              </div>

              <!-- Lessons Tab -->
              <div class="tab-pane fade" id="lessons" role="tabpanel" aria-labelledby="lessons-tab">
                <lesson-list
                    :lessons="course.lessons || []"
                    :is-teacher="isTeacher"
                    :is-teacher-of-course="isTeacherOfCourse"
                    :is-enrolled="isEnrolled"
                    :completed-lessons="progress.completedLessonIds || []"
                    @edit-lesson="editLesson"
                    @add-content="showAddContentModal"
                    @add-exam="showAddExamModal"
                    @toggle-lesson="toggleLesson"
                    @mark-complete="markLessonComplete"
                />
              </div>

              <!-- Students Tab -->
              <div class="tab-pane fade" id="students" role="tabpanel" aria-labelledby="students-tab">
                <students-tab
                    :course="course"
                    @view-student-progress="viewStudentProgress"
                />
              </div>

              <!-- Manage Tab (Teacher Only) -->
              <div
                  v-if="isTeacher && isTeacherOfCourse"
                  class="tab-pane fade"
                  id="manage"
                  role="tabpanel"
                  aria-labelledby="manage-tab"
              >
                <div class="course-management">
                  <!-- Course Info Section -->
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
                      <div v-if="showQuestionsManager && selectedLessonForQuestions" class="management-section mt-4">
                        <lesson-questions-manager
                            :lesson-id="selectedLessonForQuestions.id"
                            :lesson-title="selectedLessonForQuestions.title"
                            @close="hideLessonQuestionsManager"
                        />
                      </div>
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
                  <!-- Lessons Management Section -->
                  <div class="management-section">
                    <lesson-manager
                        :course-id="id"
                        :lessons="course.lessons"
                        @lesson-added="handleLessonAdded"
                        @lesson-updated="handleLessonUpdated"
                        @lesson-deleted="handleLessonDeleted"
                        @add-content="showAddContentModal"
                        @add-assignment="showAddAssignmentModal"
                        @show-questions-manager="showLessonQuestionsManager"
                    />
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
            <form @submit.prevent="saveLesson">
              <div class="mb-3">
                <label for="lessonTitle" class="form-label">عنوان درس</label>
                <input type="text" class="form-control" id="lessonTitle" v-model="lessonForm.title" required>
              </div>
              <div class="mb-3">
                <label for="lessonDescription" class="form-label">توضیحات درس</label>
                <textarea class="form-control" id="lessonDescription" v-model="lessonForm.description" rows="3"></textarea>
              </div>
              <div class="mb-3">
                <label for="lessonOrder" class="form-label">ترتیب نمایش</label>
                <input type="number" class="form-control" id="lessonOrder" v-model="lessonForm.orderIndex" min="0">
              </div>
              <div class="d-flex justify-content-end gap-2">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">انصراف</button>
                <button type="submit" class="btn btn-primary" :disabled="savingLesson">
                  <span v-if="savingLesson" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                  ذخیره
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- مودال افزودن محتوا به درس -->
    <content-modal
        :modal-id="'contentModal'"
        :lesson-id="selectedLesson.id"
        ref="contentModal"
        @content-saved="handleContentSaved"
    />

    <!-- Modal for adding assignment -->
    <div class="modal fade" id="assignmentModal" tabindex="-1" aria-labelledby="assignmentModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="assignmentModalLabel">افزودن تکلیف به درس: {{ selectedLesson.title }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveAssignment">
              <div class="mb-3">
                <label for="assignmentTitle" class="form-label">عنوان تکلیف</label>
                <input type="text" class="form-control" id="assignmentTitle" v-model="assignmentForm.title" required>
              </div>
              <div class="mb-3">
                <label for="assignmentDescription" class="form-label">توضیحات تکلیف</label>
                <textarea class="form-control" id="assignmentDescription" v-model="assignmentForm.description" rows="4" required></textarea>
              </div>
              <div class="mb-3">
                <label for="assignmentDueDate" class="form-label">تاریخ تحویل</label>
                <input type="date" class="form-control" id="assignmentDueDate" v-model="assignmentForm.dueDate" required>
              </div>
              <div class="mb-3">
                <label for="assignmentFile" class="form-label">فایل پیوست (اختیاری)</label>
                <input type="file" class="form-control" id="assignmentFile" @change="handleAssignmentFileSelect">
              </div>
              <button type="submit" class="btn btn-primary" :disabled="isAssignmentSubmitting">
                <span v-if="isAssignmentSubmitting" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                ذخیره تکلیف
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal for adding exam -->
    <div class="modal fade" id="examModal" tabindex="-1" aria-labelledby="examModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="examModalLabel">افزودن آزمون به درس: {{ selectedLesson.title }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveExam">
              <!-- Exam Info Section -->
              <div class="card mb-4">
                <div class="card-header bg-light">
                  <h6 class="mb-0">مشخصات آزمون</h6>
                </div>
                <div class="card-body">
                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <label for="examTitle" class="form-label">عنوان آزمون</label>
                      <input type="text" class="form-control" id="examTitle" v-model="examForm.title" required>
                    </div>
                    <div class="col-md-6 mb-3">
                      <label for="examDuration" class="form-label">مدت زمان (دقیقه)</label>
                      <input type="number" class="form-control" id="examDuration" v-model="examForm.duration" min="5" required>
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <label for="examPassingScore" class="form-label">نمره قبولی</label>
                      <input type="number" class="form-control" id="examPassingScore" v-model="examForm.passingScore" min="0" max="100" required>
                    </div>
                    <div class="col-md-6 mb-3">
                      <div class="form-check mt-4">
                        <input class="form-check-input" type="checkbox" id="shuffleQuestions" v-model="examForm.shuffleQuestions">
                        <label class="form-check-label" for="shuffleQuestions">
                          تغییر ترتیب تصادفی سوالات
                        </label>
                      </div>
                    </div>
                  </div>
                  <div class="mb-3">
                    <label for="examDescription" class="form-label">توضیحات آزمون</label>
                    <textarea class="form-control" id="examDescription" v-model="examForm.description" rows="3"></textarea>
                  </div>
                </div>
              </div>

              <!-- Questions Section (Preview) -->
              <div class="card mb-4">
                <div class="card-header bg-light d-flex justify-content-between align-items-center">
                  <h6 class="mb-0">سوالات آزمون</h6>
                  <div>
                    <button type="button" class="btn btn-primary btn-sm" @click="createExamFirst">
                      افزودن سوال
                    </button>
                  </div>
                </div>
                <div class="card-body">
                  <p class="text-muted">برای افزودن سوالات به آزمون، ابتدا آزمون را ایجاد کنید.</p>
                </div>
              </div>

              <button type="submit" class="btn btn-primary" :disabled="isExamSubmitting">
                <span v-if="isExamSubmitting" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                ایجاد آزمون
              </button>
            </form>
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
import LessonQuestionsManager from '@/components/exams/LessonQuestionsManager.vue';
import { mapGetters } from 'vuex';
import { useUser } from '@/composables/useUser.js';
import { useFormatters } from '@/composables/useFormatters.js';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import ConfirmationDialog from '@/components/common/ConfirmationDialog.vue';
import ContentModal from '@/components/courses/ContentModal.vue';
import CourseHeader from '@/components/courses/CourseHeader.vue';
import LessonList from '@/components/courses/LessonList.vue';
import StudentsTab from '@/components/courses/StudentsTab.vue';
import LessonManager from '@/components/courses/LessonManager.vue';


export default {
  name: 'CourseDetail',
  components: {
    LoadingSpinner,
    EmptyState,
    ConfirmationDialog,
    ContentModal,
    CourseHeader,
    LessonList,
    StudentsTab,
    LessonManager,
    LessonQuestionsManager
  },
  props: {
    id: {
      type: [String, Number],
      required: true
    }
  },
  setup() {
    const {isStudent, isTeacher, getUserFullName} = useUser();
    const {formatDate, truncateText} = useFormatters();

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
      isTeacherOfCourse: false,
      selectedLessonForQuestions: null,
      showQuestionsManager: false,

      // فرم درس
      lessonForm: {
        id: null,
        title: '',
        description: '',
        orderIndex: 0
      },

      // فرم ویرایش دوره
      editCourseForm: {
        title: '',
        description: ''
      },

      // درس انتخاب شده برای افزودن محتوا
      selectedLesson: {},

      // فرم تکلیف
      assignmentForm: {
        title: '',
        description: '',
        dueDate: '',
        file: null
      },
      isAssignmentSubmitting: false,

      // فرم آزمون
      examForm: {
        title: '',
        description: '',
        duration: 60,
        passingScore: 70,
        shuffleQuestions: false
      },
      isExamSubmitting: false,

      // اطلاعات پیشرفت
      progress: {
        completedLessons: 0,
        totalTimeSpent: 0,
        examsPassed: 0,
        examsTotal: 0,
        exercisesCompleted: 0,
        exercisesTotal: 0,
        circleLength: 439.6, // 2 * PI * 70 (شعاع دایره)
        circleDashOffset: 439.6, // جابجایی اولیه (0٪ پیشرفت)
        completedLessonIds: [],
        timeline: []
      }
    };
  },
  computed: {
    ...mapGetters({
      currentCourse: 'courses/getCurrentCourse',
      currentUser: 'currentUser'
    })
  },
  async created() {
    try {
      await this.fetchCourseData();
      this.setupBootstrapTabs();
    } catch (error) {
      console.error('Error fetching course data:', error);
      this.$toast.error('خطا در دریافت اطلاعات دوره');
    } finally {
      this.loading = false;
    }
  },
  mounted() {
    // فعال‌سازی زبانه‌های بوت‌استرپ
    this.setupBootstrapTabs();
    console.log('User roles:', {
      isTeacher: this.isTeacher,
      isTeacherOfCourse: this.isTeacherOfCourse,
      currentUser: this.currentUser
    });
  },
  methods: {
    // راه‌اندازی زبانه‌های Bootstrap
    setupBootstrapTabs() {
      // بررسی وجود زبانه‌های Bootstrap
        const tabListEl = document.getElementById('courseTab');
        if (tabListEl) {
          // فعال‌سازی زبانه فعال بر اساس پارامتر URL
          const urlParams = new URLSearchParams(window.location.search);
          const tabParam = urlParams.get('tab');
          if (tabParam) {
            // دکمه زبانه مربوطه را پیدا کنید
            const tabToShow = document.querySelector(`#${tabParam}-tab`);
            if (tabToShow) {
              // ایجاد نمونه Tab بوت‌استرپ و نمایش زبانه مربوطه
              const tab = new bootstrap.Tab(tabToShow);
              tab.show();
            }
          }

        // ایجاد Event Listener برای تغییر URL هنگام تغییر زبانه
        tabListEl.addEventListener('shown.bs.tab', function (event) {
          const tabId = event.target.id.replace('-tab', '');
          const newUrl = new URL(window.location);
          newUrl.searchParams.set('tab', tabId);
          window.history.replaceState({}, '', newUrl);
        });
      }
    },
    showLessonQuestionsManager(lesson) {
      this.selectedLessonForQuestions = lesson;
      this.showQuestionsManager = true;

      // If you're using tabs, switch to the manage tab
      const manageTab = document.querySelector('#manage-tab');
      if (manageTab) {
        const tab = new bootstrap.Tab(manageTab);
        tab.show();
      }
    },

    hideLessonQuestionsManager() {
      this.showQuestionsManager = false;
      this.selectedLessonForQuestions = null;
    },

    handleLessonAdded(newLesson) {
      if (!this.course.lessons) {
        this.course.lessons = [];
      }
      this.course.lessons.push(newLesson);
    },

    handleLessonUpdated(updatedLesson) {
      const index = this.course.lessons.findIndex(l => l.id === updatedLesson.id);
      if (index !== -1) {
        // this.$set(this.course.lessons, index, updatedLesson);
        this.course.lessons[index] = updatedLesson;
      }
    },

    handleLessonDeleted(lessonId) {
      this.course.lessons = this.course.lessons.filter(l => l.id !== lessonId);
    },

    async fetchCourseData() {
      try {
        // دریافت اطلاعات دوره از سرور
        await this.$store.dispatch('courses/fetchCourseById', this.id);

        // console.log('Course response in fetchCourseData:', {
        //   data: this.course,
        // })
        this.course = this.currentCourse.course;

        if (!this.course) {
          console.warn('No course data returned from API');
          return;
        }

        // بررسی دسترسی معلم به دوره
        if (this.isTeacher) {
          // console.log("currentUser: " +this.currentUser.id + " teacher: " + this.course);

          // console.log('Course response in fetchCourseData:', {
          //   data: this.course,
          // })
          this.isTeacherOfCourse = (this.currentUser.id === this.course.teacher.id);
        }

        // بررسی ثبت‌نام دانش‌آموز در دوره
        if (this.isStudent && this.course.enrolledStudents) {
          this.isEnrolled = this.course.enrolledStudents.some(student => student.id === this.currentUser.id);
        }

        // تنظیم داده‌های فرم ویرایش دوره
        this.editCourseForm = {
          title: this.course.title,
          description: this.course.description
        };

        // دریافت اطلاعات پیشرفت برای دانش‌آموزان
        if (this.isStudent && this.isEnrolled) {
          await this.fetchProgressData();
        }

        console.log("Course loaded:", this.course);

      } catch (error) {
        console.error('Error in fetchCourseData:', error);
        throw error;
      }
    },

    async fetchProgressData() {
      try {
        // در پروژه واقعی، اطلاعات پیشرفت از سرور دریافت می‌شود
        // this.progress = await API.getProgress(this.id);

        // برای نمونه، یک پیشرفت ساختگی ایجاد می‌کنیم
        if (this.course.lessons) {
          const totalLessons = this.course.lessons.length;
          const completedLessons = Math.floor(Math.random() * (totalLessons + 1));

          // ایجاد آرایه‌ای از شناسه‌های درس‌های تکمیل‌شده
          const completedLessonIds = [];
          for (let i = 0; i < completedLessons; i++) {
            if (this.course.lessons[i]) {
              completedLessonIds.push(this.course.lessons[i].id);
            }
          }

          this.progress = {
            completedLessons,
            totalLessons,
            completedLessonIds,
            totalTimeSpent: Math.floor(Math.random() * 1000),
            examsPassed: Math.floor(Math.random() * 3),
            examsTotal: Math.floor(Math.random() * 5),
            exercisesCompleted: Math.floor(Math.random() * 4),
            exercisesTotal: Math.floor(Math.random() * 6),
            circleLength: 439.6,
            circleDashOffset: 439.6 * (1 - (completedLessons / totalLessons))
          };
        }
      } catch (error) {
        console.error('Error fetching progress data:', error);
        // نمایش خطا به کاربر
        this.$toast.error('خطا در دریافت اطلاعات پیشرفت');
      }
    },

    getTeacherName() {
      if (!this.course.teacher) return 'نامشخص';
      return this.getUserFullName(this.course.teacher);
    },

    getTotalDuration() {
      if (!this.course.lessons) return 0;

      let totalMinutes = 0;
      this.course.lessons.forEach(lesson => {
        if (lesson.duration) {
          totalMinutes += parseInt(lesson.duration);
        }
      });

      return totalMinutes;
    },

    async enrollInCourse() {
      if (this.enrolling || this.isEnrolled) return;

      this.enrolling = true;

      try {
        await this.$store.dispatch('courses/enrollCourse', this.id);
        this.isEnrolled = true;
        this.$toast.success('شما با موفقیت در این دوره ثبت‌نام کردید.');
      } catch (error) {
        console.error('Error enrolling in course:', error);
        this.$toast.error('خطا در ثبت‌نام دوره');
      } finally {
        this.enrolling = false;
      }
    },

    showEditCourseModal() {
      this.editCourseForm = {
        title: this.course.title,
        description: this.course.description
      };

      // در پروژه واقعی، یک مودال برای ویرایش دوره نمایش داده می‌شود
      console.log('Edit course modal should be shown');
    },

    async updateCourseInfo() {
      if (this.updatingCourse) return;

      this.updatingCourse = true;

      try {
        await this.$store.dispatch('courses/updateCourse', {
          courseId: this.id,
          courseData: this.editCourseForm
        });

        this.$toast.success('اطلاعات دوره با موفقیت به‌روزرسانی شد.');
      } catch (error) {
        console.error('Error updating course:', error);
        this.$toast.error('خطا در به‌روزرسانی اطلاعات دوره');
      } finally {
        this.updatingCourse = false;
      }
    },

    showAddLessonModal() {
      this.lessonForm = {
        id: null,
        title: '',
        description: '',
        orderIndex: this.course.lessons ? this.course.lessons.length : 0
      };

      const modal = new bootstrap.Modal(document.getElementById('lessonModal'));
      modal.show();
    },

    editLesson(lesson) {
      this.lessonForm = {
        id: lesson.id,
        title: lesson.title,
        description: lesson.description,
        orderIndex: lesson.orderIndex || 0
      };

      const modal = new bootstrap.Modal(document.getElementById('lessonModal'));
      modal.show();
    },

    async saveLesson() {
      if (this.savingLesson) return;

      this.savingLesson = true;

      try {
        let response;

        if (this.lessonForm.id) {
          // ویرایش درس موجود
          response = await this.$http.put(`/lessons/${this.lessonForm.id}`, this.lessonForm);

          // به‌روزرسانی درس در لیست دروس
          const index = this.course.lessons.findIndex(l => l.id === this.lessonForm.id);
          if (index !== -1) {
            // this.$set(this.course.lessons, index, response.data);
            this.course.lessons[index] = response.data;
          }

          this.$toast.success('درس با موفقیت به‌روزرسانی شد.');
        } else {
          // ایجاد درس جدید
          response = await this.$http.post(`/lessons/course/${this.id}`, this.lessonForm);

          // افزودن درس جدید به لیست دروس
          if (!this.course.lessons) {
            this.course.lessons = [];
          }

          this.course.lessons.push(response.data);
          this.$toast.success('درس جدید با موفقیت افزوده شد.');
        }

        // بستن مودال
        const modal = bootstrap.Modal.getInstance(document.getElementById('lessonModal'));
        modal.hide();
      } catch (error) {
        console.error('Error saving lesson:', error);
        this.$toast.error('خطا در ذخیره درس');
      } finally {
        this.savingLesson = false;
      }
    },

    async deleteLesson(lesson) {
      // نمایش دیالوگ تأیید
      const confirmed = await this.$refs.confirmDialog.show();

      if (!confirmed) return;

      try {
        await this.$http.delete(`/lessons/${lesson.id}`);

        // حذف درس از لیست دروس
        this.course.lessons = this.course.lessons.filter(l => l.id !== lesson.id);

        this.$toast.success('درس با موفقیت حذف شد.');
      } catch (error) {
        console.error('Error deleting lesson:', error);
        this.$toast.error('خطا در حذف درس');
      }
    },

    toggleLesson(index) {
      if (!this.course.lessons[index].expanded) {
        this.course.lessons.forEach((lesson, i) => {
          if (i !== index) {
            // this.$set(lesson, 'expanded', false);
            lesson['expanded'] = false;
          }
        });
      }

      // this.$set(this.course.lessons[index], 'expanded', !this.course.lessons[index].expanded);
      this.course.lessons[index]['expanded'] = !this.course.lessons[index].expanded;
    },

    async markLessonComplete(lessonId) {
      try {
        await this.$http.post(`/progress/lesson/${lessonId}/complete`);

        // به‌روزرسانی وضعیت پیشرفت
        if (!this.progress.completedLessonIds) {
          this.progress.completedLessonIds = [];
        }

        this.progress.completedLessonIds.push(lessonId);
        this.progress.completedLessons++;

        // به‌روزرسانی درصد پیشرفت
        const percentage = this.progress.completedLessons / this.progress.totalLessons;
        this.progress.circleDashOffset = this.progress.circleLength * (1 - percentage);

        this.$toast.success('درس به عنوان تکمیل شده علامت‌گذاری شد.');
      } catch (error) {
        console.error('Error marking lesson complete:', error);
        this.$toast.error('خطا در علامت‌گذاری درس');
      }
    },

    showAddContentModal(lesson) {
      this.selectedLesson = lesson;

      // استفاده از کامپوننت ContentModal
      this.$nextTick(() => {
        const modal = new bootstrap.Modal(document.getElementById('contentModal'));
        modal.show();
      });
    },

    showAddAssignmentModal(lesson) {
      this.selectedLesson = lesson;

      // تنظیم تاریخ تحویل به 7 روز بعد
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 7);

      this.assignmentForm = {
        title: '',
        description: '',
        dueDate: dueDate.toISOString().split('T')[0],
        file: null
      };

      const modal = new bootstrap.Modal(document.getElementById('assignmentModal'));
      modal.show();
    },

    handleAssignmentFileSelect(event) {
      if (event.target.files.length > 0) {
        this.assignmentForm.file = event.target.files[0];
      }
    },

    async saveAssignment() {
      if (this.isAssignmentSubmitting) return;

      this.isAssignmentSubmitting = true;

      try {
        // در یک پروژه واقعی، این درخواست به API ارسال می‌شود
        console.log('Creating assignment:', {
          lessonId: this.selectedLesson.id,
          title: this.assignmentForm.title,
          description: this.assignmentForm.description,
          dueDate: this.assignmentForm.dueDate,
          file: this.assignmentForm.file
        });

        // شبیه‌سازی پاسخ موفقیت‌آمیز
        setTimeout(() => {
          // به‌روزرسانی درس برای نشان دادن اینکه یک تکلیف دارد
          const lessonIndex = this.course.lessons.findIndex(l => l.id === this.selectedLesson.id);
          if (lessonIndex !== -1) {
            // this.$set(this.course.lessons[lessonIndex], 'hasAssignment', true);
            this.course.lessons[lessonIndex]['hasAssignment'] = true;
          }

          this.$toast.success('تکلیف با موفقیت ایجاد شد.');

          // بستن مودال
          const modal = bootstrap.Modal.getInstance(document.getElementById('assignmentModal'));
          modal.hide();

          this.isAssignmentSubmitting = false;
        }, 800);
      } catch (error) {
        console.error('Error creating assignment:', error);
        this.$toast.error('خطا در ایجاد تکلیف');
        this.isAssignmentSubmitting = false;
      }
    },

    showAddExamModal(lesson) {
      this.selectedLesson = lesson;

      this.examForm = {
        title: '',
        description: '',
        duration: 60,
        passingScore: 70,
        shuffleQuestions: false
      };

      const modal = new bootstrap.Modal(document.getElementById('examModal'));
      modal.show();
    },

    createExamFirst() {
      this.$toast.info('لطفاً ابتدا آزمون را ایجاد کنید، سپس می‌توانید سوالات را اضافه کنید.');
    },

    async saveExam() {
      if (this.isExamSubmitting) return;

      this.isExamSubmitting = true;

      try {
        // در یک پروژه واقعی، این درخواست به API ارسال می‌شود
        console.log('Creating exam:', {
          lessonId: this.selectedLesson.id,
          title: this.examForm.title,
          description: this.examForm.description,
          duration: this.examForm.duration,
          passingScore: this.examForm.passingScore,
          shuffleQuestions: this.examForm.shuffleQuestions
        });

        // شبیه‌سازی پاسخ موفقیت‌آمیز
        setTimeout(() => {
          // به‌روزرسانی درس برای نشان دادن اینکه یک آزمون دارد
          const lessonIndex = this.course.lessons.findIndex(l => l.id === this.selectedLesson.id);
          if (lessonIndex !== -1) {
            // this.$set(this.course.lessons[lessonIndex], 'hasExam', true);
            this.course.lessons[lessonIndex]['hasExam'] = true;
          }

          this.$toast.success('آزمون با موفقیت ایجاد شد.');

          // نمایش پیام در مورد نحوه افزودن سوالات
          this.$toast.info('برای افزودن سوالات به آزمون، به صفحه مدیریت آزمون‌ها مراجعه کنید.');

          // بستن مودال
          const modal = bootstrap.Modal.getInstance(document.getElementById('examModal'));
          modal.hide();

          // هدایت به صفحه ایجاد آزمون
          this.$router.push(`/exams/create?lessonId=${this.selectedLesson.id}`);

          this.isExamSubmitting = false;
        }, 1000);
      } catch (error) {
        console.error('Error creating exam:', error);
        this.$toast.error('خطا در ایجاد آزمون');
        this.isExamSubmitting = false;
      }
    },

    viewStudentProgress(student) {
      // در یک پروژه واقعی، به صفحه پیشرفت دانش‌آموز هدایت می‌شود
      this.$router.push({
        name: 'StudentProgress',
        params: {courseId: this.id, studentId: student.id}
      });
    },

    handleContentSaved(updatedLesson) {
      // به‌روزرسانی درس پس از ذخیره محتوا
      const index = this.course.lessons.findIndex(l => l.id === updatedLesson.id);
      if (index !== -1) {
        // this.$set(this.course.lessons, index, updatedLesson);
        this.course.lessons[index] = updatedLesson;
      }

      this.$toast.success('محتوای درس با موفقیت به‌روزرسانی شد.');

    }

  }
}
</script>

<style scoped>
.course-detail-container {
  min-height: calc(100vh - 56px);
}

.course-header {
  margin-bottom: 2rem;
}

.course-tab-content {
  background-color: #fff;
  border: 1px solid #dee2e6;
  border-top: none;
  border-radius: 0 0 0.25rem 0.25rem;
}

.course-info {
  margin-bottom: 2rem;
}

.course-description {
  line-height: 1.6;
  margin-top: 1rem;
}

/* Course Stats */
.stat-card {
  background-color: #f8f9fa;
  border-radius: 10px;
  padding: 20px;
  text-align: center;
  height: 100%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  font-size: 2rem;
  color: #007bff;
  margin-bottom: 10px;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 5px;
}

.stat-label {
  color: #6c757d;
  font-size: 0.9rem;
}

/* Teacher Info */
.course-teacher {
  background-color: #f8f9fa;
  border-radius: 10px;
  padding: 20px;
  margin-top: 2rem;
}

.teacher-info {
  display: flex;
  align-items: center;
  margin-top: 1rem;
}

.teacher-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  margin-left: 1rem;
}

.teacher-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.teacher-details h4 {
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
}

.teacher-details p {
  color: #6c757d;
  margin-bottom: 0;
}

/* Course Progress */
.course-progress {
  background-color: #fff;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
}

.progress-title {
  margin-bottom: 1rem;
}

.progress-stats {
  display: flex;
  justify-content: space-around;
  margin-top: 1.5rem;
  flex-wrap: wrap;
}

.progress-item {
  text-align: center;
  padding: 0 10px;
  margin-bottom: 1rem;
}

.progress-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #007bff;
}

.progress-label {
  color: #6c757d;
  font-size: 0.9rem;
}

.circle-progress {
  position: relative;
  width: 150px;
  height: 150px;
  margin: 0 auto;
}

.circle-progress-percentage {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 1.8rem;
  font-weight: 700;
}

/* Timeline */
.course-timeline {
  margin-top: 2rem;
}

.timeline-item {
  position: relative;
  padding-right: 30px;
  padding-bottom: 20px;
  border-right: 2px solid #e9ecef;
}

.timeline-marker {
  position: absolute;
  top: 0;
  right: -9px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: #007bff;
  border: 2px solid #fff;
}

.timeline-date {
  color: #6c757d;
  font-size: 0.85rem;
  margin-bottom: 0.3rem;
}

.timeline-content {
  background-color: #f8f9fa;
  padding: 10px 15px;
  border-radius: 5px;
}

/* Course Management */
.course-management {
  margin-top: 1rem;
}

.management-section {
  margin-bottom: 2rem;
}

.lesson-management-list {
  margin-top: 1rem;
}

.lesson-management-item {
  position: relative;
  padding: 15px;
  border: 1px solid #eee;
  border-radius: 8px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
}

.lesson-management-item .lesson-number {
  background-color: #007bff;
  color: white;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 10px;
}

.lesson-management-item .lesson-info {
  flex-grow: 1;
}

.lesson-management-item .lesson-actions {
  display: flex;
  gap: 5px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .lesson-management-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .lesson-management-item .lesson-actions {
    margin-top: 10px;
    width: 100%;
    justify-content: space-between;
  }

  .teacher-info {
    flex-direction: column;
    text-align: center;
  }

  .teacher-avatar {
    margin-left: 0;
    margin-bottom: 1rem;
  }
}
</style>