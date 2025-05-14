<template>
  <div class="course-list">
    <div class="container-fluid p-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>دوره‌های من</h2>
        <router-link :to="{ name: 'AvailableCourses' }" class="btn btn-primary">
          <i class="fas fa-plus me-2"></i> یافتن دوره‌های جدید
        </router-link>
      </div>

      <!-- فیلتر و جستجو -->
      <div class="card mb-4">
        <div class="card-body">
          <div class="row">
            <div class="col-md-4">
              <div class="form-group mb-3">
                <label for="searchQuery" class="form-label">جستجو</label>
                <div class="input-group">
                  <input
                      type="text"
                      class="form-control"
                      id="searchQuery"
                      v-model="searchQuery"
                      placeholder="عنوان دوره یا نام استاد"
                  >
                  <button class="btn btn-primary" @click="searchCourses">
                    <i class="fas fa-search"></i>
                  </button>
                </div>
              </div>
            </div>
            <div class="col-md-3">
              <div class="form-group">
                <label for="statusFilter" class="form-label">وضعیت</label>
                <select class="form-select" id="statusFilter" v-model="statusFilter" @change="filterCourses">
                  <option value="all">همه</option>
                  <option value="in-progress">در حال انجام</option>
                  <option value="completed">تکمیل شده</option>
                </select>
              </div>
            </div>
            <div class="col-md-3">
              <div class="form-group">
                <label for="sortBy" class="form-label">مرتب‌سازی بر اساس</label>
                <select class="form-select" id="sortBy" v-model="sortBy" @change="sortCourses">
                  <option value="date">تاریخ ثبت‌نام</option>
                  <option value="name">نام</option>
                  <option value="progress">پیشرفت</option>
                </select>
              </div>
            </div>
            <div class="col-md-2 d-flex align-items-end">
              <button class="btn btn-secondary w-100" @click="resetFilters">
                <i class="fas fa-redo me-2"></i> بازنشانی
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- لیست دوره‌ها -->
      <loading-spinner :loading="loading">
        <empty-state
            v-if="filteredCourses.length === 0"
            title="دوره‌ای یافت نشد"
            description="شما در هیچ دوره‌ای ثبت‌نام نکرده‌اید یا دوره‌ای که با فیلترهای انتخابی مطابقت داشته باشد، وجود ندارد."
            icon="book-open"
        >
          <router-link :to="{ name: 'AvailableCourses' }" class="btn btn-primary mt-3">
            جستجوی دوره‌های جدید
          </router-link>
        </empty-state>

        <div v-else class="row">
          <div v-for="course in filteredCourses" :key="course.id" class="col-md-4 mb-4">
            <div class="card course-card h-100">
              <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                <h5 class="card-title mb-0">{{ course.title }}</h5>
              </div>
              <div class="card-body">
                <p class="card-text">{{ truncateText(course.description, 100) }}</p>

                <!-- نمایش پیشرفت دوره -->
                <div v-if="course.progress">
                  <div class="d-flex justify-content-between mb-2">
                    <span>پیشرفت دوره:</span>
                    <span>{{ Math.round(course.progress.completionPercentage) }}%</span>
                  </div>
                  <div class="progress mb-3">
                    <div class="progress-bar bg-success"
                         :style="`width: ${course.progress.completionPercentage}%`"
                         :aria-valuenow="course.progress.completionPercentage"
                         role="progressbar" aria-valuemin="0" aria-valuemax="100"></div>
                  </div>
                  <div class="d-flex justify-content-between">
                    <small class="text-muted">{{ course.progress.completedLessonCount }} از {{ course.lessonsCount }} درس</small>
                    <small class="text-muted" v-if="course.progress.lastAccessed">
                      آخرین بازدید: {{ formatDate(course.progress.lastAccessed) }}
                    </small>
                  </div>
                </div>

                <div class="d-flex justify-content-between align-items-center mt-3">
                  <span class="badge" :class="getCourseStatusClass(course)">{{ getCourseStatusText(course) }}</span>
                  <router-link :to="{ name: 'CourseDetail', params: { id: course.id } }" class="btn btn-primary">
                    مشاهده دوره
                  </router-link>
                </div>
              </div>
              <div class="card-footer text-muted">
                <small>استاد: {{ getTeacherName(course) }}</small>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <pagination
            v-if="totalPages > 1"
            :current-page="currentPage"
            :total-pages="totalPages"
            @page-changed="changePage"
        />
      </loading-spinner>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import Pagination from '@/components/common/Pagination.vue';
import { useFormatters } from '@/composables/useFormatters.js';

export default {
  name: 'CourseList',
  components: {
    LoadingSpinner,
    EmptyState,
    Pagination
  },
  setup() {
    const { formatDate, truncateText } = useFormatters();

    return {
      formatDate,
      truncateText
    };
  },
  data() {
    return {
      courses: [],
      loading: true,
      error: null,

      // pagination
      currentPage: 1,
      itemsPerPage: 9,
      totalCourses: 0,

      // filters
      searchQuery: '',
      statusFilter: 'all',
      sortBy: 'date'
    };
  },
  computed: {
    filteredCourses() {
      let result = [...this.courses];

      // apply search filter
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        result = result.filter(course =>
            course.title.toLowerCase().includes(query) ||
            (course.teacher && course.teacher.firstName && course.teacher.lastName &&
                `${course.teacher.firstName} ${course.teacher.lastName}`.toLowerCase().includes(query))
        );
      }

      // apply status filter
      if (this.statusFilter !== 'all') {
        if (this.statusFilter === 'completed') {
          result = result.filter(course => this.isCourseCompleted(course));
        } else if (this.statusFilter === 'in-progress') {
          result = result.filter(course => !this.isCourseCompleted(course));
        }
      }

      // apply sorting
      if (this.sortBy === 'name') {
        result.sort((a, b) => a.title.localeCompare(b.title));
      } else if (this.sortBy === 'progress') {
        result.sort((a, b) => {
          const progressA = a.progress ? a.progress.completionPercentage : 0;
          const progressB = b.progress ? b.progress.completionPercentage : 0;
          return progressB - progressA;
        });
      } else {
        // default: date
        result.sort((a, b) => new Date(b.enrollmentDate) - new Date(a.enrollmentDate));
      }

      return result;
    },
    totalPages() {
      return Math.ceil(this.filteredCourses.length / this.itemsPerPage);
    },
    paginatedCourses() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredCourses.slice(start, end);
    }
  },
  created() {
    this.fetchCourses();
  },
  methods: {
    async fetchCourses() {
      try {
        this.loading = true;

        // fetch enrolled courses
        const response = await axios.get('/courses/enrolled');
        this.courses = response.data.map(course => ({
          ...course,
          lessonsCount: course.lessons ? course.lessons.length : 0
        }));

        // fetch progress data
        const progressResponse = await axios.get('/progress');

        // map progress data to courses
        for (const progress of progressResponse.data) {
          const courseIndex = this.courses.findIndex(c => c.id === progress.courseId);
          if (courseIndex !== -1) {
            this.courses[courseIndex].progress = progress;
          }
        }

        this.loading = false;
      } catch (error) {
        console.error('Error fetching courses:', error);
        this.error = 'مشکلی در دریافت لیست دوره‌ها رخ داد. لطفاً دوباره تلاش کنید.';
        this.loading = false;
      }
    },

    getTeacherName(course) {
      if (!course.teacher) return 'نامشخص';
      return course.teacher.firstName && course.teacher.lastName
          ? `${course.teacher.firstName} ${course.teacher.lastName}`
          : course.teacher.username;
    },

    isCourseCompleted(course) {
      return course.progress && course.progress.completionPercentage >= 100;
    },

    getCourseStatusClass(course) {
      if (this.isCourseCompleted(course)) {
        return 'bg-success';
      } else if (course.progress && course.progress.completionPercentage > 0) {
        return 'bg-primary';
      } else {
        return 'bg-secondary';
      }
    },

    getCourseStatusText(course) {
      if (this.isCourseCompleted(course)) {
        return 'تکمیل شده';
      } else if (course.progress && course.progress.completionPercentage > 0) {
        return 'در حال انجام';
      } else {
        return 'شروع نشده';
      }
    },

    changePage(page) {
      this.currentPage = page;
      window.scrollTo(0, 0);
    },

    searchCourses() {
      this.currentPage = 1;
    },

    filterCourses() {
      this.currentPage = 1;
    },

    sortCourses() {
      this.currentPage = 1;
    },

    resetFilters() {
      this.searchQuery = '';
      this.statusFilter = 'all';
      this.sortBy = 'date';
      this.currentPage = 1;
    }
  }
}
</script>

<style scoped>
.course-card {
  transition: transform 0.3s;
}

.course-card:hover {
  transform: translateY(-5px);
}

.course-list {
  min-height: calc(100vh - 56px);
}
</style>