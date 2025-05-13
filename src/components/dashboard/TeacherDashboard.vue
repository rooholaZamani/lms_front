<template>
  <div class="teacher-dashboard">
    <div class="d-flex justify-content-between align-items-center">
      <h2 class="dashboard-title">داشبورد استاد</h2>
      <button class="btn btn-primary" @click="showCreateCourseModal">
        <i class="fas fa-plus"></i> ایجاد دوره جدید
      </button>
    </div>

    <!-- خلاصه وضعیت -->
    <div class="row mb-4">
      <div class="col-md-3 col-sm-6">
        <stat-card icon="fas fa-book" :value="courses.length" label="تعداد دوره‌ها" />
      </div>
      <div class="col-md-3 col-sm-6">
        <stat-card icon="fas fa-users" :value="totalStudents" label="تعداد دانش‌آموزان" />
      </div>
      <div class="col-md-3 col-sm-6">
        <stat-card icon="fas fa-list-check" :value="totalLessons" label="تعداد درس‌ها" />
      </div>
      <div class="col-md-3 col-sm-6">
        <stat-card icon="fas fa-clipboard-question" :value="activeExams" label="آزمون‌های فعال" />
      </div>
    </div>

    <!-- دوره‌های استاد -->
    <h3 class="dashboard-subtitle">دوره‌های من</h3>

    <loading-spinner :loading="loading">
      <div v-if="courses.length === 0" class="alert alert-info text-center">
        <h5>شما هنوز هیچ دوره‌ای ایجاد نکرده‌اید</h5>
        <button class="btn btn-primary mt-3" @click="showCreateCourseModal">
          <i class="fas fa-plus"></i> ایجاد دوره جدید
        </button>
      </div>

      <div v-else class="table-responsive">
        <course-table :courses="courses" @edit="editCourse" @add-lesson="addLesson" @add-exam="addExam" />
      </div>
    </loading-spinner>

    <!-- آزمون‌های اخیر -->
    <h3 class="dashboard-subtitle mt-5">نتایج آزمون‌های اخیر</h3>

    <loading-spinner :loading="loadingExams">
      <div v-if="recentSubmissions.length === 0" class="alert alert-info text-center">
        <p>هنوز هیچ آزمونی انجام نشده است</p>
      </div>

      <div v-else class="table-responsive">
        <exam-results-table :submissions="recentSubmissions" />
      </div>
    </loading-spinner>

    <!-- دکمه مشاهده همه نتایج -->
    <div v-if="recentSubmissions.length > 0" class="text-center mt-4">
      <router-link :to="{ name: 'ExamResults' }" class="btn btn-outline-primary">
        مشاهده همه نتایج
      </router-link>
    </div>

    <!-- مودال ایجاد دوره -->
    <base-modal
        modal-id="createCourseModal"
        title="ایجاد دوره جدید">
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
    </base-modal>
  </div>
</template>

<script>
import axios from 'axios';
import bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min.js';
import StatCard from '@/components/common/StatCard.vue';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import BaseModal from '@/components/common/BaseModal.vue';
import CourseTable from '@/components/courses/CourseTable.vue';
import ExamResultsTable from '@/components/exams/ExamResultsTable.vue';
import { useFormatters } from '@/composables/useFormatters.js';
import formMixin from '@/mixins/formMixin.js';

export default {
  name: 'TeacherDashboard',
  components: {
    StatCard,
    LoadingSpinner,
    BaseModal,
    CourseTable,
    ExamResultsTable
  },
  mixins: [formMixin],
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
      }
    }
  },
  setup() {
    const { formatDate } = useFormatters();

    return {
      formatDate
    };
  },
  mounted() {
    this.createCourseModal = new bootstrap.Modal(document.getElementById('createCourseModal'));
    this.fetchData();
  },
  methods: {
    async fetchData() {
      try {
        // دریافت دوره‌های استاد
        const coursesResponse = await axios.get('/courses/teaching');
        this.courses = coursesResponse.data;

        // محاسبه آمار
        this.calculateStats();

        this.loading = false;

        // دریافت نتایج آزمون‌ها
        await this.fetchExamSubmissions();
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        this.showErrorToast('مشکلی در دریافت داده‌های داشبورد رخ داد.');
        this.loading = false;
        this.loadingExams = false;
      }
    },

    calculateStats() {
      this.totalStudents = 0;
      this.totalLessons = 0;
      this.activeExams = 0;

      this.courses.forEach(course => {
        // تعداد دانش‌آموزان
        if (course.enrolledStudents) {
          this.totalStudents += course.enrolledStudents.length;
        }

        // تعداد درس‌ها
        if (course.lessons) {
          this.totalLessons += course.lessons.length;

          // تعداد آزمون‌ها
          course.lessons.forEach(lesson => {
            if (lesson.exam) {
              this.activeExams++;
            }
          });
        }
      });
    },

    async fetchExamSubmissions() {
      try {
        // ابتدا تمام آزمون‌های دوره‌های استاد را پیدا می‌کنیم
        const examIds = [];

        this.courses.forEach(course => {
          if (course.lessons) {
            course.lessons.forEach(lesson => {
              if (lesson.exam) {
                examIds.push(lesson.exam.id);
              }
            });
          }
        });

        if (examIds.length === 0) {
          this.loadingExams = false;
          return;
        }

        // دریافت نتایج آزمون‌ها
        const allSubmissions = [];

        for (const examId of examIds) {
          try {
            const response = await axios.get(`/exams/${examId}/submissions`);
            if (response.data && response.data.length) {
              allSubmissions.push(...response.data);
            }
          } catch (error) {
            console.error(`Error fetching submissions for exam ${examId}:`, error);
          }
        }

        // مرتب‌سازی بر اساس تاریخ (جدیدترین اول)
        this.recentSubmissions = allSubmissions
            .sort((a, b) => new Date(b.submissionTime) - new Date(a.submissionTime))
            .slice(0, 10); // 10 نتیجه آخر

        this.loadingExams = false;
      } catch (error) {
        console.error('Error fetching exam submissions:', error);
        this.loadingExams = false;
      }
    },

    showCreateCourseModal() {
      this.newCourse = { title: '', description: '' };
      this.createCourseModal.show();
    },

    async createCourse() {
      this.startSubmitting();

      try {
        const response = await axios.post('/courses', this.newCourse);

        // اضافه کردن دوره جدید به لیست
        this.courses.push(response.data);

        // محاسبه مجدد آمار
        this.calculateStats();

        // بستن مودال
        this.createCourseModal.hide();

        this.finishSubmitting('دوره با موفقیت ایجاد شد.');
      } catch (error) {
        console.error('Error creating course:', error);
        this.finishSubmitting(null, 'خطا در ایجاد دوره. لطفاً دوباره تلاش کنید.');
      }
    },

    editCourse(course) {
      // انتقال به صفحه ویرایش دوره
      this.$router.push({
        name: 'CourseEdit',
        params: { id: course.id }
      });
    },

    addLesson(course) {
      // انتقال به صفحه افزودن درس با انتخاب دوره
      this.$router.push({
        name: 'CourseDetail',
        params: { id: course.id },
        query: { addLesson: true }
      });
    },

    addExam(course) {
      // انتقال به صفحه افزودن آزمون با انتخاب دوره
      this.$router.push({
        name: 'CourseDetail',
        params: { id: course.id },
        query: { addExam: true }
      });
    }
  }
}
</script>