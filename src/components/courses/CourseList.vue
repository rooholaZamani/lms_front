<template>
  <div class="modern-page-bg" style="min-height: calc(100vh - 56px); padding: 2rem 1rem;">
    <div class="container-fluid">
      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="text-white mb-2">
            <i class="fas fa-book me-3"></i>
            دوره‌های من
          </h2>
          <p class="text-white-50 mb-0">مشاهده و مدیریت دوره‌های ثبت‌نام شده</p>
        </div>

        <div class="d-flex flex-wrap gap-2">
          <div class="search-container">
            <input
                type="text"
                class="modern-form-control"
                placeholder="جستجو در دوره‌ها..."
                v-model="searchQuery"
                @input="filterCourses"
                style="min-width: 250px;">
            <i class="fas fa-search search-icon"></i>
          </div>

          <div class="dropdown">
            <button class="modern-btn modern-btn-outline text-gray dropdown-toggle" type="button" data-bs-toggle="dropdown">
              <i class="fas fa-sort me-1"></i> مرتب‌سازی
            </button>
            <ul class="dropdown-menu dropdown-menu-end">
              <li><a class="dropdown-item" href="#" @click.prevent="sortCourses('title')">نام (الفبا)</a></li>
              <li><a class="dropdown-item" href="#" @click.prevent="sortCourses('date')">تاریخ (جدیدترین)</a></li>
              <li><a class="dropdown-item" href="#" @click.prevent="sortCourses('progress')">پیشرفت (بیشترین)</a></li>
            </ul>
          </div>
        </div>
      </div>

      <loading-spinner :loading="loading">
        <div v-if="filteredCourses.length > 0" class="row">
          <div v-for="course in filteredCourses" :key="course.id" class="col-md-4 col-lg-3 mb-4">
            <div class="modern-card course-card animate-slide-up">
              <div class="course-card-header">
                <div class="course-image">
                  <div class="course-placeholder">
                    <i class="fas fa-graduation-cap fa-2x text-primary"></i>
                  </div>
                  <div class="course-progress" v-if="isStudent && getCourseProgress(course)">
                    <div class="progress">
                      <div
                          class="progress-bar bg-success"
                          role="progressbar"
                          :style="`width: ${getCourseProgress(course)}%`"
                          :aria-valuenow="getCourseProgress(course)"
                          aria-valuemin="0"
                          aria-valuemax="100"
                      >
                        {{ getCourseProgress(course) }}%
                      </div>
                    </div>
                  </div>
                </div>
                <div class="course-actions">
                  <button class="btn-action" @click="toggleFavorite(course)" title="افزودن به علاقه‌مندی‌ها">
                    <i class="fas" :class="course.isFavorite ? 'fa-heart text-danger' : 'fa-heart'"></i>
                  </button>
                </div>
              </div>

              <div class="course-card-body">
                <h5 class="course-title">{{ course.title }}</h5>
                <p class="course-description">{{ truncateText(course.description, 100) }}</p>

                <div class="course-meta">
                  <div class="course-teacher">
                    <i class="fas fa-chalkboard-teacher me-1"></i>
                    {{ getTeacherName(course.teacher) }}
                  </div>
                  <div class="course-lessons">
                    <i class="fas fa-book-open me-1"></i>
                    {{ course.lessons ? course.lessons.length : 0 }} درس
                  </div>
                </div>
              </div>

              <div class="course-card-footer">
                <router-link :to="`/courses/${course.id}`" class="modern-btn modern-btn-primary btn-sm w-100">
                  <i class="fas fa-eye me-1"></i>
                  مشاهده دوره
                </router-link>

                <div class="course-students mt-2 text-center">
                  <i class="fas fa-users me-1"></i>
                  {{ course.enrolledStudents ? course.enrolledStudents.length : 0 }} دانش‌آموز
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="modern-card animate-slide-up">
          <div class="text-center py-5">
            <div class="modern-logo large secondary mb-4">
              <i class="fas fa-graduation-cap"></i>
            </div>
            <h4 class="text-warning mb-3">هیچ دوره‌ای یافت نشد</h4>
            <p class="text-info mb-4">
              شما در هیچ دوره‌ای ثبت‌نام نکرده‌اید یا نتیجه‌ای با جستجوی شما مطابقت ندارد
            </p>
            <div class="d-flex justify-content-center gap-2">
              <router-link :to="{ name: 'AvailableCourses' }" class="modern-btn modern-btn-primary">
                <i class="fas fa-search me-1"></i>
                مشاهده دوره‌های قابل ثبت‌نام
              </router-link>
              <button class="modern-btn modern-btn-secondary" @click="resetSearch">
                <i class="fas fa-refresh me-1"></i>
                بازنشانی فیلتر
              </button>
            </div>
          </div>
        </div>
      </loading-spinner>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import { useUser } from '@/composables/useUser.js';
import { useFormatters } from '@/composables/useFormatters.js';

export default {
  name: 'CourseList',
  components: {
    LoadingSpinner
  },
  setup() {
    const { isStudent, isTeacher, getUserFullName } = useUser();
    const { truncateText } = useFormatters();

    return {
      isStudent,
      isTeacher,
      getUserFullName,
      truncateText
    };
  },
  data() {
    return {
      loading: true,
      searchQuery: '',
      coursesData: [],
      sortBy: 'title',
      sortDirection: 'asc'
    };
  },
  computed: {
    ...mapGetters({
      enrolledCourses: 'courses/getEnrolledCourses'
    }),
    filteredCourses() {
      if (!this.searchQuery.trim()) {
        return this.coursesData;
      }

      const query = this.searchQuery.toLowerCase().trim();
      return this.coursesData.filter(course => {
        return course.title.toLowerCase().includes(query) ||
            (course.description && course.description.toLowerCase().includes(query));
      });
    }
  },
  async created() {
    try {
      await this.fetchCourses();
    } catch (error) {
      console.error('Error fetching courses:', error);
      this.$toast.error('خطا در دریافت لیست دوره‌ها');
    } finally {
      this.loading = false;
    }
  },
  methods: {
    async fetchCourses() {
      try {
        await this.$store.dispatch('courses/fetchEnrolledCourses');
        this.coursesData = [...this.enrolledCourses];

        this.coursesData = this.coursesData.map(course => ({
          ...course,
          isFavorite: false
        }));

        this.sortCourses(this.sortBy);
      } catch (error) {
        throw error;
      }
    },

    getTeacherName(teacher) {
      if (!teacher) return 'نامشخص';
      return this.getUserFullName(teacher);
    },

    getCourseProgress(course) {
      if (!course.progress) {
        course.progress = Math.floor(Math.random() * 101);
      }
      return course.progress;
    },

    toggleFavorite(course) {
      course.isFavorite = !course.isFavorite;
      const message = course.isFavorite
          ? `"${course.title}" به علاقه‌مندی‌ها اضافه شد`
          : `"${course.title}" از علاقه‌مندی‌ها حذف شد`;
      this.$toast.info(message);
    },

    filterCourses() {
      // فیلتر در computed property انجام می‌شود
    },

    resetSearch() {
      this.searchQuery = '';
    },

    sortCourses(criterion) {
      this.sortBy = criterion;

      if (this.previousSortBy === criterion) {
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortDirection = 'asc';
      }

      this.previousSortBy = criterion;

      this.coursesData.sort((a, b) => {
        let comparison = 0;

        switch(criterion) {
          case 'title':
            comparison = a.title.localeCompare(b.title);
            break;
          case 'date':
            const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
            const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
            comparison = dateB - dateA;
            break;
          case 'progress':
            const progressA = this.getCourseProgress(a);
            const progressB = this.getCourseProgress(b);
            comparison = progressB - progressA;
            break;
        }

        return this.sortDirection === 'asc' ? comparison : -comparison;
      });
    }
  }
}
</script>

<style scoped>
/* Search container */
.search-container {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  pointer-events: none;
}

.search-container input {
  padding-left: 2.5rem;
}

/* Course Cards */
.course-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: transform 0.3s, box-shadow 0.3s;
}

.course-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.15);
}

.course-card-header {
  position: relative;
}

.course-image {
  position: relative;
  height: 160px;
  overflow: hidden;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.course-placeholder {
  opacity: 0.6;
}

.course-progress {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 8px;
  background: rgba(0, 0, 0, 0.5);
}

.course-progress .progress {
  height: 8px;
  border-radius: 4px;
  background-color: rgba(255, 255, 255, 0.3);
}

.course-actions {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  gap: 5px;
}

.btn-action {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.9);
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #6c757d;
}

.btn-action:hover {
  background-color: #fff;
  transform: scale(1.1);
}

.course-card-body {
  padding: 16px;
  flex-grow: 1;
}

.course-title {
  font-size: 1.1rem;
  margin-bottom: 10px;
  color: #2c3e50;
  font-weight: 700;
}

.course-description {
  color: #6c757d;
  font-size: 0.9rem;
  margin-bottom: 12px;
  line-height: 1.5;
}

.course-meta {
  display: flex;
  justify-content: space-between;
  color: #6c757d;
  font-size: 0.85rem;
  margin-top: auto;
}

.course-card-footer {
  padding: 16px;
  border-top: 1px solid #eee;
}

.course-students {
  font-size: 0.85rem;
  color: #6c757d;
}

/* Responsive */
@media (max-width: 768px) {
  .d-flex.justify-content-between.align-items-center {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch !important;
  }

  .search-container {
    order: 2;
  }

  .search-container input {
    min-width: auto;
    width: 100%;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .course-title {
    color: #e2e8f0;
  }

  .course-image {
    background: linear-gradient(135deg, #2d3748 0%, #4a5568 100%);
  }
}
</style>