<template>
  <div class="available-courses">
    <div class="container-fluid p-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>دوره‌های موجود</h2>
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
                <label for="levelFilter" class="form-label">سطح</label>
                <select class="form-select" id="levelFilter" v-model="levelFilter" @change="filterCourses">
                  <option value="all">همه</option>
                  <option value="مبتدی">مبتدی</option>
                  <option value="متوسط">متوسط</option>
                  <option value="پیشرفته">پیشرفته</option>
                </select>
              </div>
            </div>
            <div class="col-md-3">
              <div class="form-group">
                <label for="sortBy" class="form-label">مرتب‌سازی بر اساس</label>
                <select class="form-select" id="sortBy" v-model="sortBy" @change="sortCourses">
                  <option value="date">تاریخ ایجاد</option>
                  <option value="name">نام</option>
                  <option value="students">تعداد دانش‌آموزان</option>
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
            description="هیچ دوره‌ای که با فیلترهای انتخابی مطابقت داشته باشد، وجود ندارد."
            icon="book-open"
        >
          <button class="btn btn-primary mt-3" @click="resetFilters">
            <i class="fas fa-redo me-2"></i> حذف فیلترها
          </button>
        </empty-state>

        <div v-else class="row">
          <div v-for="course in paginatedCourses" :key="course.id" class="col-md-4 mb-4">
            <div class="card course-card h-100">
              <div class="card-header bg-primary text-white">
                <h5 class="card-title mb-0">{{ course.title }}</h5>
              </div>
              <div class="card-body">
                <p class="card-text">{{ truncateText(course.description, 150) }}</p>

                <div class="course-metadata">
                  <div class="metadata-item">
                    <i class="fas fa-user-graduate"></i>
                    <span>{{ course.enrolledStudents ? course.enrolledStudents.length : 0 }} دانش‌آموز</span>
                  </div>
                  <div class="metadata-item">
                    <i class="fas fa-list"></i>
                    <span>{{ course.lessons ? course.lessons.length : 0 }} درس</span>
                  </div>
                  <div class="metadata-item">
                    <i class="fas fa-layer-group"></i>
                    <span>سطح: {{ course.level || 'متوسط' }}</span>
                  </div>
                </div>

                <div class="d-flex justify-content-between align-items-center mt-3">
                  <span class="badge" :class="getCourseLevelClass(course)">{{ course.level || 'متوسط' }}</span>
                  <button
                      class="btn btn-primary"
                      @click="enrollInCourse(course)"
                      :disabled="isEnrolled(course)"
                  >
                    <span v-if="isEnrolled(course)">
                      <i class="fas fa-check-circle"></i> ثبت‌نام شده
                    </span>
                    <span v-else>
                      <i class="fas fa-sign-in-alt"></i> ثبت‌نام در دوره
                    </span>
                  </button>
                </div>
              </div>
              <div class="card-footer text-muted">
                <div class="d-flex justify-content-between">
                  <small>استاد: {{ getTeacherName(course) }}</small>
                  <small>{{ formatDate(course.createdAt) }}</small>
                </div>
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
import formMixin from '@/mixins/formMixin.js';

export default {
  name: 'AvailableCourses',
  components: {
    LoadingSpinner,
    EmptyState,
    Pagination
  },
  mixins: [formMixin],
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
      enrolledCourseIds: [],
      loading: true,
      error: null,

      // pagination
      currentPage: 1,
      itemsPerPage: 9,
      totalCourses: 0,

      // filters
      searchQuery: '',
      levelFilter: 'all',
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

      // apply level filter
      if (this.levelFilter !== 'all') {
        result = result.filter(course => course.level === this.levelFilter);
      }

      // apply sorting
      if (this.sortBy === 'name') {
        result.sort((a, b) => a.title.localeCompare(b.title));
      } else if (this.sortBy === 'students') {
        result.sort((a, b) => {
          const studentsA = a.enrolledStudents ? a.enrolledStudents.length : 0;
          const studentsB = b.enrolledStudents ? b.enrolledStudents.length : 0;
          return studentsB - studentsA;
        });
      } else {
        // default: date
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
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
    this.fetchEnrolledCourses();
  },
  methods: {
    async fetchCourses() {
      try {
        this.loading = true;

        // fetch all available courses
        const response = await axios.get('/courses/available');
        this.courses = response.data;

        this.loading = false;
      } catch (error) {
        console.error('Error fetching available courses:', error);
        this.error = 'مشکلی در دریافت لیست دوره‌ها رخ داد. لطفاً دوباره تلاش کنید.';
        this.loading = false;
      }
    },

    async fetchEnrolledCourses() {
      try {
        // fetch enrolled course IDs to know which courses the user is already enrolled in
        const response = await axios.get('/courses/enrolled');
        this.enrolledCourseIds = response.data.map(course => course.id);
      } catch (error) {
        console.error('Error fetching enrolled courses:', error);
      }
    },

    isEnrolled(course) {
      return this.enrolledCourseIds.includes(course.id);
    },

    getTeacherName(course) {
      if (!course.teacher) return 'نامشخص';
      return course.teacher.firstName && course.teacher.lastName
          ? `${course.teacher.firstName} ${course.teacher.lastName}`
          : course.teacher.username;
    },

    getCourseLevelClass(course) {
      const level = course.level || 'متوسط';
      switch (level) {
        case 'مبتدی':
          return 'bg-success';
        case 'متوسط':
          return 'bg-primary';
        case 'پیشرفته':
          return 'bg-danger';
        default:
          return 'bg-secondary';
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
      this.levelFilter = 'all';
      this.sortBy = 'date';
      this.currentPage = 1;
    },

    async enrollInCourse(course) {
      if (this.isEnrolled(course)) {
        return;
      }

      this.startSubmitting();

      try {
        await axios.post(`/courses/${course.id}/enroll`);

        // add to enrolled courses
        this.enrolledCourseIds.push(course.id);

        this.finishSubmitting(`شما با موفقیت در دوره "${course.title}" ثبت‌نام شدید.`);

      } catch (error) {
        console.error('Error enrolling in course:', error);
        this.finishSubmitting(null, 'خطا در ثبت‌نام دوره. لطفاً دوباره تلاش کنید.');
      }
    }
  }
}
</script>

<style scoped>
.available-courses {
  min-height: calc(100vh - 56px);
}

.course-card {
  transition: transform 0.3s;
}

.course-card:hover {
  transform: translateY(-5px);
}

.course-metadata {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 15px;
  margin-bottom: 15px;
}

.metadata-item {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #6c757d;
}

.metadata-item i {
  width: 20px;
  color: #007bff;
}
</style>