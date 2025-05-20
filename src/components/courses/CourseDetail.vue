<template>
  <div class="course-detail">
    <div class="container-fluid">
      <loading-spinner :loading="loading">
        <div v-if="error" class="alert alert-danger">
          {{ error }}
        </div>

        <template v-else>
          <!-- Course Header -->
          <course-header
              :course="course"
              :is-teacher="isTeacher"
              :is-teacher-of-course="isTeacherOfCourse"
              :is-enrolled="isEnrolled"
              @edit-course="showEditCourseModal"
              @add-lesson="showAddLessonModal"
              @enroll-course="enrollCourse" />

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
              <course-description :course="course" />
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

                  <lesson-list
                      v-else
                      :lessons="course.lessons"
                      :is-teacher="isTeacher"
                      :is-teacher-of-course="isTeacherOfCourse"
                      :is-enrolled="isEnrolled"
                      :completed-lessons="completedLessons"
                      @toggle-lesson="toggleLesson"
                      @edit-lesson="editLesson"
                      @add-content="addContent"
                      @add-exam="addExam"
                      @mark-complete="markLessonComplete" />
                </div>
              </div>
            </div>

            <!-- Tab: Exams -->
            <div class="tab-pane fade" id="exams" role="tabpanel" aria-labelledby="exams-tab">
              <exams-tab
                  :course-exams="courseExams"
                  :is-teacher="isTeacher"
                  :is-teacher-of-course="isTeacherOfCourse"
                  :is-enrolled="isEnrolled"
                  @edit-exam="editExam"
                  @view-exam-results="viewExamResults"
                  @start-exam="startExam"
                  @view-exam-result="viewExamResult" />
            </div>

            <!-- Tab: Students (مخصوص معلم) -->
            <div class="tab-pane fade" id="students" role="tabpanel" aria-labelledby="students-tab" v-if="isTeacher && isTeacherOfCourse">
              <students-tab
                  :course="course"
                  @view-student-progress="viewStudentProgress" />
            </div>
          </div>
        </template>
      </loading-spinner>
    </div>

    <!-- مودال افزودن/ویرایش درس -->
    <base-modal modal-id="lessonModal" :title="isEditingLesson ? 'ویرایش درس' : 'افزودن درس جدید'">
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
    </base-modal>

    <!-- مودال ویرایش دوره -->
    <base-modal modal-id="editCourseModal" title="ویرایش دوره">
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
    </base-modal>

    <!-- مودال افزودن محتوا -->
    <content-modal
        :modal-id="'contentModal'"
        :lesson-id="selectedLessonId"
        @content-saved="onContentSaved" />
  </div>
</template>

<script>
import axios from 'axios';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import BaseModal from '@/components/common/BaseModal.vue';
import CourseHeader from '@/components/courses/CourseHeader.vue';
import CourseDescription from '@/components/courses/CourseDescription.vue';
import LessonList from '@/components/courses/LessonList.vue';
import ExamsTab from '@/components/exams/ExamsTab.vue';
import StudentsTab from '@/components/courses/StudentsTab.vue';
import ContentModal from '@/components/courses/ContentModal.vue';
import { useUser } from '@/composables/useUser.js';
import formMixin from '@/mixins/formMixin.js';

export default {
  name: 'CourseDetail',
  components: {
    LoadingSpinner,
    BaseModal,
    CourseHeader,
    CourseDescription,
    LessonList,
    ExamsTab,
    StudentsTab,
    ContentModal
  },
  mixins: [formMixin],
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

      isEditingLesson: false,
      selectedLessonId: null
    }
  },
  setup() {
    const { isTeacher } = useUser();

    return {
      isTeacher
    };
  },
  computed: {
    isTeacherOfCourse() {
      if (!this.course || !this.course.teacher) return false;
      const user = this.$store.getters.currentUser;
      return user && user.id === this.course.teacher.id;
    },
    isEnrolled() {
      if (!this.course || !this.course.enrolledStudents) return false;
      const user = this.$store.getters.currentUser;
      return user && this.course.enrolledStudents.some(student => student.id === user.id);
    }
  },
  async created() {
    await this.fetchCourseData();

    // اگر کوئری پارامتر وجود داشته باشد، عملیات مربوطه را انجام می‌دهیم
    if (this.$route.query.addLesson) {
      setTimeout(() => this.showAddLessonModal(), 500);
    }
    if (this.$route.query.addExam) {
      setTimeout(() => this.showAddExamModal(), 500);
    }
  },
  mounted() {
    this.initModals();
  },
  methods: {
    async fetchCourseData() {
      try {
        this.loading = true;

        // دریافت اطلاعات دوره
        const response = await axios.get(`/courses/${this.id}`);
        this.course = response.data;

        // دریافت آزمون‌های دوره
        if (this.course.lessons && this.course.lessons.length > 0) {
          const lessonIds = this.course.lessons.map(lesson => lesson.id);
          const examsResponse = await axios.get(`/exams`, { params: { lessonIds: lessonIds.join(',') } });
          this.courseExams = examsResponse.data;
        }

        // اگر کاربر دانش‌آموز است، اطلاعات پیشرفت را دریافت می‌کنیم
        if (!this.isTeacher) {
          const progressResponse = await axios.get(`/progress/${this.id}`);
          this.progressData = progressResponse.data;

          if (this.progressData && this.progressData.completedLessons) {
            this.completedLessons = this.progressData.completedLessons;
          }
        }

        // افزودن ویژگی expanded به درس‌ها برای نمایش/مخفی‌سازی محتوا
        if (this.course.lessons) {
          this.course.lessons = this.course.lessons.map(lesson => ({
            ...lesson,
            expanded: false
          }));
        }

        this.loading = false;
      } catch (error) {
        console.error('Error fetching course data:', error);
        this.error = 'مشکلی در دریافت اطلاعات دوره رخ داد. لطفاً دوباره تلاش کنید.';
        this.loading = false;
      }
    },

    initModals() {
      // ایجاد نمونه‌های مودال
      this.lessonModal = new bootstrap.Modal(document.getElementById('lessonModal'));
      this.editCourseModal = new bootstrap.Modal(document.getElementById('editCourseModal'));
      this.contentModal = new bootstrap.Modal(document.getElementById('contentModal'));
    },

    toggleLesson(index) {
      // تغییر وضعیت نمایش/مخفی بودن محتوای درس
      this.$set(this.course.lessons[index], 'expanded', !this.course.lessons[index].expanded);
    },

    showAddLessonModal() {
      this.isEditingLesson = false;
      this.currentLesson = {
        title: '',
        description: '',
        duration: ''
      };
      this.lessonModal.show();
    },

    editLesson(lesson) {
      this.isEditingLesson = true;
      this.selectedLessonId = lesson.id;
      this.currentLesson = {
        title: lesson.title,
        description: lesson.description,
        duration: lesson.duration
      };
      this.lessonModal.show();
    },

    async saveLesson() {
      this.startSubmitting();

      try {
        let response;

        if (this.isEditingLesson) {
          // ویرایش درس موجود
          response = await axios.put(`/lessons/${this.selectedLessonId}`, this.currentLesson);

          // به‌روزرسانی درس در لیست درس‌ها
          const index = this.course.lessons.findIndex(lesson => lesson.id === this.selectedLessonId);
          if (index !== -1) {
            const updatedLesson = {
              ...this.course.lessons[index],
              title: response.data.title,
              description: response.data.description,
              duration: response.data.duration
            };
            this.$set(this.course.lessons, index, updatedLesson);
          }

          this.finishSubmitting('درس با موفقیت به‌روزرسانی شد.');
        } else {
          // اضافه کردن درس جدید
          const lessonData = {
            ...this.currentLesson,
            courseId: this.course.id
          };
          response = await axios.post('/lessons', lessonData);

          // افزودن درس جدید به لیست
          if (!this.course.lessons) {
            this.course.lessons = [];
          }
          this.course.lessons.push({
            ...response.data,
            expanded: false
          });

          this.finishSubmitting('درس جدید با موفقیت اضافه شد.');
        }

        // بستن مودال
        this.lessonModal.hide();
      } catch (error) {
        console.error('Error saving lesson:', error);
        this.finishSubmitting(null, 'مشکلی در ذخیره درس رخ داد. لطفاً دوباره تلاش کنید.');
      }
    },

    showEditCourseModal() {
      this.updatedCourse = {
        title: this.course.title,
        description: this.course.description,
        level: this.course.level || 'متوسط',
        duration: this.course.duration || ''
      };
      this.editCourseModal.show();
    },

    async updateCourse() {
      this.startSubmitting();

      try {
        const response = await axios.put(`/courses/${this.id}`, this.updatedCourse);

        // به‌روزرسانی اطلاعات دوره
        this.course = {
          ...this.course,
          title: response.data.title,
          description: response.data.description,
          level: response.data.level,
          duration: response.data.duration
        };

        // بستن مودال
        this.editCourseModal.hide();

        this.finishSubmitting('اطلاعات دوره با موفقیت به‌روزرسانی شد.');
      } catch (error) {
        console.error('Error updating course:', error);
        this.finishSubmitting(null, 'مشکلی در به‌روزرسانی دوره رخ داد. لطفاً دوباره تلاش کنید.');
      }
    },

    addContent(lesson) {
      this.selectedLessonId = lesson.id;
      this.contentModal.show();
    },

    onContentSaved(updatedLesson) {
      // به‌روزرسانی محتوا در درس
      const index = this.course.lessons.findIndex(lesson => lesson.id === updatedLesson.id);
      if (index !== -1) {
        this.$set(this.course.lessons, index, {
          ...this.course.lessons[index],
          ...updatedLesson
        });
      }
    },

    async enrollCourse() {
      this.startSubmitting();

      try {
        await axios.post(`/courses/${this.id}/enroll`);

        // به‌روزرسانی لیست دانش‌آموزان ثبت‌نام شده
        if (!this.course.enrolledStudents) {
          this.course.enrolledStudents = [];
        }

        // افزودن کاربر فعلی به لیست دانش‌آموزان
        const currentUser = this.$store.getters.currentUser;
        this.course.enrolledStudents.push({
          ...currentUser,
          enrollmentDate: new Date().toISOString()
        });

        this.finishSubmitting('ثبت‌نام در دوره با موفقیت انجام شد.');
      } catch (error) {
        console.error('Error enrolling in course:', error);
        this.finishSubmitting(null, 'مشکلی در ثبت‌نام دوره رخ داد. لطفاً دوباره تلاش کنید.');
      }
    },

    async markLessonComplete(lessonId) {
      this.startSubmitting();

      try {
        await axios.post(`/progress/lessons/${lessonId}/complete`);

        // افزودن درس به لیست درس‌های تکمیل شده
        if (!this.completedLessons.includes(lessonId)) {
          this.completedLessons.push(lessonId);
        }

        this.finishSubmitting('درس با موفقیت به عنوان تکمیل شده علامت‌گذاری شد.');
      } catch (error) {
        console.error('Error marking lesson as complete:', error);
        this.finishSubmitting(null, 'مشکلی در علامت‌گذاری درس رخ داد. لطفاً دوباره تلاش کنید.');
      }
    },

    // توابع مربوط به آزمون
    addExam(lesson) {
      // انتقال به صفحه افزودن آزمون
      this.$router.push({
        name: 'ExamCreator',
        query: { lessonId: lesson.id }
      });
    },

    editExam(exam) {
      // انتقال به صفحه ویرایش آزمون
      this.$router.push({
        name: 'ExamCreator',
        params: { id: exam.id }
      });
    },

    viewExamResults(exam) {
      // انتقال به صفحه نتایج آزمون (برای معلم)
      this.$router.push({
        name: 'ExamResults',
        params: { id: exam.id }
      });
    },

    startExam(exam) {
      // انتقال به صفحه آزمون
      this.$router.push({
        name: 'Exam',
        params: { id: exam.id }
      });
    },

    viewExamResult(exam) {
      // انتقال به صفحه نتیجه آزمون
      this.$router.push({
        name: 'ExamResult',
        params: { id: exam.id }
      });
    },

    // توابع مربوط به پیشرفت دانش‌آموزان
    viewStudentProgress(student) {
      // انتقال به صفحه جزئیات پیشرفت دانش‌آموز
      this.$router.push({
        name: 'StudentProgress',
        params: { courseId: this.id, studentId: student.id }
      });
    }
  }
}
</script>

<style scoped>
.course-detail {
  padding: 20px 0;
}
</style>