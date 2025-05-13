<template>
  <div class="student-dashboard">
    <div class="d-flex justify-content-between align-items-center">
      <h2 class="dashboard-title">داشبورد دانش‌آموز</h2>
    </div>

    <!-- خلاصه وضعیت -->
    <div class="row mb-4">
      <div class="col-md-3 col-sm-6">
        <stat-card
            icon="fas fa-book"
            :value="stats.totalCourses"
            label="تعداد دوره‌ها"
        />
      </div>
      <div class="col-md-3 col-sm-6">
        <stat-card
            icon="fas fa-check-circle"
            :value="stats.completedCourses"
            label="دوره‌های تکمیل شده"
        />
      </div>
      <div class="col-md-3 col-sm-6">
        <stat-card
            icon="fas fa-chart-line"
            :value="stats.averageProgress + '%'"
            label="میانگین پیشرفت"
        />
      </div>
      <div class="col-md-3 col-sm-6">
        <stat-card
            icon="fas fa-clipboard-check"
            :value="exams.length"
            label="آزمون‌های انجام شده"
        />
      </div>
    </div>

    <!-- دوره‌های در حال انجام -->
    <h3 class="dashboard-subtitle">دوره‌های من</h3>

    <loading-spinner :loading="loading">
      <empty-state
          v-if="courses.length === 0"
          title="شما هنوز در هیچ دوره‌ای ثبت‌نام نکرده‌اید"
          icon="book"
      >
        <router-link :to="{ name: 'AvailableCourses' }" class="btn btn-primary mt-3">
          جستجوی دوره‌های جدید
        </router-link>
      </empty-state>

      <div v-else class="row">
        <!-- کارت دوره‌ها -->
        <div v-for="course in courses" :key="course.id" class="col-md-4 mb-4">
          <student-course-card
              :course="course"
              :progress="progressMap[course.id]"
          />
        </div>
      </div>
    </loading-spinner>

    <!-- دکمه مشاهده همه دوره‌ها -->
    <div v-if="courses.length > 0" class="text-center mt-4">
      <router-link :to="{ name: 'Courses' }" class="btn btn-outline-primary">
        مشاهده همه دوره‌ها
      </router-link>
    </div>

    <!-- آزمون‌های اخیر -->
    <h3 class="dashboard-subtitle mt-5">آزمون‌های اخیر</h3>

    <loading-spinner :loading="loadingExams">
      <empty-state
          v-if="exams.length === 0"
          title="شما هنوز در هیچ آزمونی شرکت نکرده‌اید"
          icon="clipboard-check"
          compact
      />

      <div v-else class="table-responsive">
        <student-exams-table :exams="exams.slice(0, 5)" />
      </div>
    </loading-spinner>

    <!-- دکمه مشاهده همه آزمون‌ها -->
    <div v-if="exams.length > 5" class="text-center mt-4">
      <router-link :to="{ name: 'Exams' }" class="btn btn-outline-primary">
        مشاهده همه آزمون‌ها
      </router-link>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import StatCard from '@/components/common/StatCard.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import StudentCourseCard from '@/components/dashboard/StudentCourseCard.vue';
import StudentExamsTable from '@/components/dashboard/StudentExamsTable.vue';
import { useFormatters } from '@/composables/useFormatters.js';

export default {
  name: 'StudentDashboard',
  components: {
    LoadingSpinner,
    StatCard,
    EmptyState,
    StudentCourseCard,
    StudentExamsTable
  },
  props: {
    user: {
      type: Object,
      required: true
    }
  },
  setup() {
    const { formatDate } = useFormatters();

    return {
      formatDate
    };
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
    this.fetchData();
  },
  methods: {
    async fetchData() {
      try {
        // دریافت آمار کلی
        const statsResponse = await axios.get('/progress/stats');
        this.stats = statsResponse.data;

        // دریافت دوره‌ها
        const coursesResponse = await axios.get('/courses/enrolled');
        this.courses = coursesResponse.data;

        // دریافت پیشرفت دوره‌ها
        const progressResponse = await axios.get('/progress');
        this.progressList = progressResponse.data;

        // تبدیل لیست پیشرفت به نقشه برای دسترسی آسان‌تر
        this.progressMap = {};
        this.progressList.forEach(progress => {
          if (progress.course) {
            this.progressMap[progress.course.id] = progress;
          }
        });

        this.loading = false;

        // دریافت آزمون‌های انجام شده
        const examsResponse = await axios.get('/exams/submissions/student');
        this.exams = examsResponse.data;
        this.loadingExams = false;
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        this.$store.dispatch('notification/showError', 'مشکلی در دریافت اطلاعات داشبورد رخ داد.');
        this.loading = false;
        this.loadingExams = false;
      }
    }
  }
}
</script>