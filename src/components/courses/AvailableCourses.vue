<template>
  <div class="modern-page-bg primary-gradient">
    <div class="modern-container large animate-slide-up">
      <div class="modern-header">
        <div class="modern-logo primary">
          <i class="fas fa-search"></i>
        </div>
        <h1 class="modern-title">دوره‌های قابل ثبت‌نام</h1>
        <p class="modern-subtitle">دوره‌های مناسب خود را پیدا کرده و در آنها ثبت‌نام کنید</p>
      </div>

      <!-- Search and Filters -->
      <div class="form-section animate-fade-in" style="animation-delay: 0.1s;">
        <h6 class="section-title">
          <i class="fas fa-filter me-2"></i>
          جستجو و فیلتر
        </h6>

        <div class="row g-3">
          <div class="col-md-4">
            <div class="modern-form-group">
              <label class="modern-form-label">جستجو در دوره‌ها</label>
              <input
                  type="text"
                  class="modern-form-control"
                  placeholder="عنوان دوره یا استاد..."
                  v-model="searchQuery"
                  @input="filterCourses"
              >
            </div>
          </div>

          <div class="col-md-3">
<!--            <div class="modern-form-group">-->
<!--              <label class="modern-form-label">دسته‌بندی</label>-->
<!--              <select v-model="categoryFilter" class="modern-form-control" @change="filterCourses">-->
<!--                <option value="">همه دسته‌بندی‌ها</option>-->
<!--                <option v-for="category in categories" :key="category.id" :value="category.id">-->
<!--                  {{ category.name }}-->
<!--                </option>-->
<!--              </select>-->
<!--            </div>-->
          </div>

          <div class="col-md-3">
            <div class="modern-form-group">
              <label class="modern-form-label">مرتب‌سازی</label>
              <select v-model="sortBy" class="modern-form-control" @change="sortCourses">
                <option value="title">نام (الفبا)</option>
                <option value="newest">جدیدترین</option>
                <option value="students">تعداد دانش‌آموزان</option>
              </select>
            </div>
          </div>

          <div class="col-md-2">
            <div class="modern-form-group">
              <label class="modern-form-label">&nbsp;</label>
              <button class="modern-btn modern-btn-outline w-100" @click="resetFilters">
                <i class="fas fa-sync-alt me-1"></i> پاک کردن
              </button>
            </div>
          </div>
        </div>

        <div class="d-flex align-items-center mt-3">
<!--          <div class="form-check form-switch">-->
<!--            <input-->
<!--                class="form-check-input"-->
<!--                type="checkbox"-->
<!--                id="showOnlyPopular"-->
<!--                v-model="showOnlyPopular"-->
<!--                @change="filterCourses"-->
<!--            >-->
<!--&lt;!&ndash;            <label class="form-check-label" for="showOnlyPopular">&ndash;&gt;-->
<!--&lt;!&ndash;              فقط دوره‌های محبوب&ndash;&gt;-->
<!--&lt;!&ndash;            </label>&ndash;&gt;-->
<!--          </div>-->

          <div class="view-mode-toggle ms-auto">
            <button
                class="modern-btn"
                :class="viewMode === 'grid' ? 'modern-btn-primary' : 'modern-btn-outline'"
                @click="changeViewMode('grid')"
            >
              <i class="fas fa-th-large"></i>
            </button>
            <button
                class="modern-btn"
                :class="viewMode === 'list' ? 'modern-btn-primary' : 'modern-btn-outline'"
                @click="changeViewMode('list')"
            >
              <i class="fas fa-list"></i>
            </button>
          </div>
        </div>
      </div>

      <loading-spinner :loading="loading">
        <!-- Grid View Mode -->
        <div v-if="viewMode === 'grid'" class="courses-grid animate-fade-in" style="animation-delay: 0.2s;">
          <div v-for="course in paginatedCourses" :key="course.id" class="course-card-wrapper">
            <div class="course-card">
              <div class="course-card-header">
                <div class="course-image">
<!--                  <img :src="getCourseImage(course)" :alt="course.title">-->
<!--                  <div class="course-popularity" v-if="isPopularCourse(course)">-->
<!--                    <i class="fas fa-fire"></i> محبوب-->
<!--                  </div>-->
                </div>
<!--                <div class="course-actions">-->
<!--                  <button class="btn-action" @click="toggleFavorite(course)" title="افزودن به علاقه‌مندی‌ها">-->
<!--                    <i class="fas" :class="course.isFavorite ? 'fa-heart text-danger' : 'fa-heart-o'"></i>-->
<!--                  </button>-->
<!--                </div>-->
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
<!--                <div class="d-flex align-items-center mb-2">-->
<!--                  <div class="course-rating me-2">-->
<!--                    <i v-for="i in 5" :key="i" class="fas fa-star"-->
<!--                       :class="i <= (course.rating || 0) ? 'text-warning' : 'text-muted'"></i>-->
<!--                  </div>-->
<!--                  <div class="rating-count text-muted">({{ course.ratingCount || 0 }})</div>-->
<!--                </div>-->

                <div class="d-flex justify-content-between align-items-center text-white">
                  <div class="course-students">
                    <i class="fas fa-users me-1 "></i>
                    {{ course.enrolledStudents ? course.enrolledStudents.length : 0 }} دانش‌آموز
                  </div>

                  <button class="modern-btn modern-btn-primary modern-btn-sm" @click="enrollCourse(course)" :disabled="enrollingCourse">
                    <span v-if="enrollingCourse" class="spinner-border spinner-border-sm me-1" role="status"></span>
                    ثبت‌نام
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- List View Mode -->
        <div v-else class="courses-list animate-fade-in" style="animation-delay: 0.2s;">
          <div v-for="course in paginatedCourses" :key="course.id" class="course-list-item">
<!--            <div class="course-list-image">-->
<!--              <img :src="getCourseImage(course)" :alt="course.title">-->
<!--              <div class="course-popularity" v-if="isPopularCourse(course)">-->
<!--                <i class="fas fa-fire"></i> محبوب-->
<!--              </div>-->
<!--            </div>-->

            <div class="course-list-content">
              <div class="course-list-header">
                <div>
                  <h5 class="course-title">{{ course.title }}</h5>
                </div>
<!--                <div class="course-actions">-->
<!--                  <button class="btn-action" @click="toggleFavorite(course)" title="افزودن به علاقه‌مندی‌ها">-->
<!--                    <i class="fas" :class="course.isFavorite ? 'fa-heart text-danger' : 'fa-heart-o'"></i>-->
<!--                  </button>-->
<!--                </div>-->
              </div>

              <p class="course-description">{{ truncateText(course.description, 200) }}</p>

              <div class="course-list-footer">
                <div class="course-meta">
                  <div class="course-teacher">
                    <i class="fas fa-chalkboard-teacher me-1"></i>
                    {{ getTeacherName(course.teacher) }}
                  </div>
                  <div class="course-lessons">
                    <i class="fas fa-book-open me-1"></i>
                    {{ course.lessons ? course.lessons.length : 0 }} درس
                  </div>
                  <div class="course-students">
                    <i class="fas fa-users me-1"></i>
                    {{ course.enrolledStudents ? course.enrolledStudents.length : 0 }} دانش‌آموز
                  </div>
<!--                  <div class="course-rating">-->
<!--                    <i v-for="i in 5" :key="i" class="fas fa-star"-->
<!--                       :class="i <= (course.rating || 0) ? 'text-warning' : 'text-muted'"></i>-->
<!--                    <span class="rating-count text-muted">({{ course.ratingCount || 0 }})</span>-->
<!--                  </div>-->
                </div>

                <div class="course-actions">
                  <router-link :to="`/courses/${course.id}`" class="modern-btn modern-btn-outline modern-btn-sm me-2">
                    مشاهده دوره
                  </router-link>
                  <button class="modern-btn modern-btn-primary modern-btn-sm" @click="enrollCourse(course)" :disabled="enrollingCourse">
                    <span v-if="enrollingCourse" class="spinner-border spinner-border-sm me-1" role="status"></span>
                    ثبت‌نام
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="filteredCourses.length === 0" class="empty-state animate-fade-in" style="animation-delay: 0.3s;">
          <div class="modern-logo large secondary mb-4">
            <i class="fas fa-search"></i>
          </div>
          <h4>دوره‌ای یافت نشد</h4>
          <p class="text-muted mb-4">
            با معیارهای جستجو و فیلتر انتخاب شده، دوره‌ای یافت نشد.
          </p>
          <button class="modern-btn modern-btn-primary" @click="resetFilters">
            پاک کردن فیلترها
          </button>
        </div>

        <!-- Pagination -->
        <div v-if="filteredCourses.length > 0" class="pagination-container animate-fade-in" style="animation-delay: 0.4s;">
          <div class="d-flex justify-content-between align-items-center">
            <div class="pagination-info">
              نمایش {{ startIndex + 1 }} تا {{ endIndex }} از {{ filteredCourses.length }} دوره
            </div>
            <nav>
              <ul class="pagination">
                <li class="page-item" :class="{ disabled: currentPage === 1 }">
                  <button class="page-link" @click="changePage(currentPage - 1)" :disabled="currentPage === 1">
                    قبلی
                  </button>
                </li>
                <li
                    v-for="page in visiblePages"
                    :key="page"
                    class="page-item"
                    :class="{ active: page === currentPage }"
                >
                  <button class="page-link" @click="changePage(page)">{{ page }}</button>
                </li>
                <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                  <button class="page-link" @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages">
                    بعدی
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </loading-spinner>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import { useFormatters } from '@/composables/useFormatters.js';
import { useUser } from '@/composables/useUser.js';

export default {
  name: 'AvailableCourses',
  components: {
    LoadingSpinner
  },
  setup() {
    const { formatDate, truncateText } = useFormatters();
    const { getUserFullName } = useUser();

    return {
      formatDate,
      truncateText,
      getUserFullName
    };
  },
  data() {
    return {
      loading: true,
      enrollingCourse: false,
      viewMode: 'grid',
      searchQuery: '',
      categoryFilter: '',
      sortBy: 'newest',
      showOnlyPopular: false,
      currentPage: 1,
      coursesPerPage: 12,

      coursesData: []
    };
  },
  computed: {
    filteredCourses() {
      let filtered = [...this.coursesData];

      if (this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase().trim();
        filtered = filtered.filter(course => {
          return course.title.toLowerCase().includes(query) ||
              (course.description && course.description.toLowerCase().includes(query)) ||
              (course.teacher && this.getTeacherName(course.teacher).toLowerCase().includes(query));
        });
      }

      if (this.categoryFilter) {
        filtered = filtered.filter(course => course.categoryId === this.categoryFilter);
      }

      if (this.showOnlyPopular) {
        filtered = filtered.filter(course => this.isPopularCourse(course));
      }

      return filtered;
    },

    paginatedCourses() {
      const startIndex = (this.currentPage - 1) * this.coursesPerPage;
      const endIndex = startIndex + this.coursesPerPage;
      return this.filteredCourses.slice(startIndex, endIndex);
    },

    totalPages() {
      return Math.ceil(this.filteredCourses.length / this.coursesPerPage);
    },

    startIndex() {
      return (this.currentPage - 1) * this.coursesPerPage;
    },

    endIndex() {
      return Math.min(this.startIndex + this.coursesPerPage, this.filteredCourses.length);
    },

    visiblePages() {
      const pages = [];
      const start = Math.max(1, this.currentPage - 2);
      const end = Math.min(this.totalPages, this.currentPage + 2);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      return pages;
    }
  },
  async created() {
    try {
      await this.fetchCourses();
    } catch (error) {
      console.error('Error fetching available courses:', error);
      this.$toast.error('خطا در دریافت لیست دوره‌ها');
    } finally {
      this.loading = false;
    }
  },
  methods: {
    async fetchCourses() {
      try {
        const response = await axios.get('/courses/available');
        this.coursesData = response.data.map(course => ({
          ...course,
          isFavorite: false,
          categoryId: Math.floor(Math.random() * 6) + 1,
          rating: Math.floor(Math.random() * 50 + 10) / 10,
          ratingCount: Math.floor(Math.random() * 100) + 5
        }));

        this.sortCourses();
      } catch (error) {
        console.error('Error fetching courses:', error);
        this.$toast.error('خطا در دریافت دوره‌های موجود');
        throw error;
      }
    },

    getCourseImage(course) {
      // return `https://picsum.photos/400/200?random=${course.id}`;
      return ``;
    },

    getTeacherName(teacher) {
      if (!teacher) return 'نامشخص';
      return this.getUserFullName(teacher);
    },

    isPopularCourse(course) {
      return (course.enrolledStudents?.length > 20 || (course.rating && course.rating >= 4));
    },

    changeViewMode(mode) {
      this.viewMode = mode;
    },

    resetFilters() {
      this.searchQuery = '';
      this.categoryFilter = '';
      this.showOnlyPopular = false;
      this.currentPage = 1;
      this.sortBy = 'newest';
      this.sortCourses();
    },

    filterCourses() {
      this.currentPage = 1;
    },

    sortCourses() {
      switch (this.sortBy) {
        case 'title':
          this.coursesData.sort((a, b) => a.title.localeCompare(b.title));
          break;
        case 'newest':
          this.coursesData.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
          break;
        case 'students':
          this.coursesData.sort((a, b) => (b.enrolledStudents?.length || 0) - (a.enrolledStudents?.length || 0));
          break;
      }
    },

    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
    },

    toggleFavorite(course) {
      course.isFavorite = !course.isFavorite;
      const message = course.isFavorite
          ? `"${course.title}" به علاقه‌مندی‌ها اضافه شد`
          : `"${course.title}" از علاقه‌مندی‌ها حذف شد`;
      this.$toast.info(message);
    },

    async enrollCourse(course) {
      if (this.enrollingCourse) return;

      this.enrollingCourse = true;

      try {
        await this.$store.dispatch('courses/enrollCourse', course.id);
        this.coursesData = this.coursesData.filter(c => c.id !== course.id);
        this.$toast.success(`شما با موفقیت در دوره "${course.title}" ثبت‌نام شدید`);
        this.$router.push(`/courses/${course.id}`);
      } catch (error) {
        console.error('Error enrolling in course:', error);
        this.$toast.error('خطا در ثبت‌نام دوره');
      } finally {
        this.enrollingCourse = false;
      }
    }
  }
}
</script>

<style scoped>
/* Form sections */
.form-section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.section-title {
  color: #333;
  font-weight: 600;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid rgba(102, 126, 234, 0.2);
}

.view-mode-toggle {
  display: flex;
  gap: 0.5rem;
}

.form-check-input:checked {
  background-color: #667eea;
  border-color: #667eea;
}

/* Grid View */
.courses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.course-card-wrapper {
  height: 100%;
}

.course-card {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.course-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.course-card-header {
  position: relative;
}

.course-image {
  position: relative;
  height: 180px;
  overflow: hidden;
}

.course-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s;
}

.course-card:hover .course-image img {
  transform: scale(1.05);
}

.course-popularity {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(255, 59, 48, 0.9);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
}

.course-actions {
  position: absolute;
  top: 10px;
  left: 10px;
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
  background: rgba(255, 255, 255, 0.9);
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-action:hover {
  background: white;
  transform: scale(1.1);
}

.course-card-body {
  padding: 1.5rem;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.course-category {
  display: inline-block;
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  margin-bottom: 0.75rem;
}

.course-title {
  font-size: 1.1rem;
  margin-bottom: 0.75rem;
  color: #2c3e50;
  font-weight: 700;
}

.course-description {
  color: #6c757d;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  line-height: 1.5;
  flex-grow: 1;
}

.course-meta {
  display: flex;
  justify-content: space-between;
  color: #6c757d;
  font-size: 0.85rem;
  margin-bottom: 1rem;
}

.course-card-footer {
  padding: 1rem 1.5rem;
  background: rgba(248, 249, 250, 0.8);
  border-top: 1px solid rgba(102, 126, 234, 0.1);
}

.course-rating {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.rating-count {
  font-size: 0.8rem;
}

/* List View */
.courses-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.course-list-item {
  display: flex;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.course-list-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.course-list-image {
  position: relative;
  width: 250px;
  min-width: 250px;
  overflow: hidden;
}

.course-list-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.course-list-content {
  flex: 1;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
}

.course-list-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.course-list-footer {
  margin-top: auto;
  display: flex;
  justify-content: between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid rgba(102, 126, 234, 0.1);
}

.course-meta {
  display: flex;
  gap: 1.5rem;
  color: #6c757d;
  font-size: 0.85rem;
  flex-wrap: wrap;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #6c757d;
}

/* Pagination */
.pagination-container {
  margin-top: 2rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 12px;
}

.pagination-info {
  color: #6c757d;
  font-size: 0.9rem;
}

.pagination {
  margin: 0;
}

.pagination .page-link {
  border-radius: 8px;
  margin: 0 2px;
  border: none;
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  transition: all 0.2s ease;
}

.pagination .page-item.active .page-link {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.pagination .page-link:hover {
  background: rgba(102, 126, 234, 0.2);
  transform: translateY(-1px);
}

/* Small button size */
.modern-btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
}

/* Responsive */
@media (max-width: 768px) {
  .courses-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .course-list-item {
    flex-direction: column;
  }

  .course-list-image {
    width: 100%;
    height: 200px;
  }

  .course-list-footer {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .course-meta {
    justify-content: center;
  }

  .view-mode-toggle {
    margin-top: 1rem;
    margin-left: 0 !important;
  }

  .d-flex.align-items-center {
    flex-direction: column;
    align-items: stretch !important;
  }
}

@media (max-width: 576px) {
  .form-section {
    padding: 1rem;
  }

  .course-card-body,
  .course-list-content {
    padding: 1rem;
  }

  .pagination-container {
    padding: 1rem;
  }

  .pagination-container .d-flex {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .form-section {
    background: rgba(45, 55, 72, 0.5);
    border-color: rgba(255, 255, 255, 0.1);
  }

  .section-title {
    color: #e2e8f0;
    border-bottom-color: rgba(102, 126, 234, 0.3);
  }

  .course-card,
  .course-list-item {
    background: rgba(45, 55, 72, 0.9);
  }

  .course-title {
    color: #e2e8f0;
  }

  .course-description,
  .course-meta {
    color: #cbd5e0;
  }

  .course-card-footer {
    background: rgba(255, 255, 255, 0.05);
    border-top-color: rgba(255, 255, 255, 0.1);
  }

  .pagination-container {
    background: rgba(45, 55, 72, 0.5);
  }

  .pagination-info {
    color: #cbd5e0;
  }
}
</style>