<template>
  <div class="course-list-container">
    <div class="container-fluid p-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>دوره‌های من</h2>

        <div class="d-flex">
          <div class="me-2">
            <input
                type="text"
                class="form-control"
                v-model="searchQuery"
                placeholder="جستجو در دوره‌ها..."
                @input="filterCourses"
            >
          </div>

          <div class="dropdown">
            <button class="btn btn-outline-secondary dropdown-toggle" type="button" id="sortDropdown" data-bs-toggle="dropdown" aria-expanded="false">
              مرتب‌سازی
            </button>
            <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="sortDropdown">
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
            <div class="course-card">
              <div class="course-card-header">
                <div class="course-image">
                  <img :src="getCourseImage(course)" :alt="course.title">
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
                    <i class="fas" :class="course.isFavorite ? 'fa-heart text-danger' : 'fa-heart-o'"></i>
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
                <router-link :to="`/courses/${course.id}`" class="btn btn-primary btn-sm">
                  مشاهده دوره
                </router-link>

                <div class="course-students">
                  <i class="fas fa-users me-1"></i>
                  {{ course.enrolledStudents ? course.enrolledStudents.length : 0 }} دانش‌آموز
                </div>
              </div>
            </div>
          </div>
        </div>

        <empty-state
            v-else
            title="هیچ دوره‌ای یافت نشد"
            description="شما در هیچ دوره‌ای ثبت‌نام نکرده‌اید یا نتیجه‌ای با جستجوی شما مطابقت ندارد"
            icon="graduation-cap"
        >
          <router-link :to="{ name: 'AvailableCourses' }" class="btn btn-primary">
            مشاهده دوره‌های قابل ثبت‌نام
          </router-link>
        </empty-state>
      </loading-spinner>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import EmptyState from '@/components/common/EmptyState.vue';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import { useUser } from '@/composables/useUser.js';
import { useFormatters } from '@/composables/useFormatters.js';

export default {
  name: 'CourseList',
  components: {
    EmptyState,
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
      // اگر جستجو خالی باشد، همه دوره‌ها را نمایش بده
      if (!this.searchQuery.trim()) {
        return this.coursesData;
      }

      // فیلتر دوره‌ها بر اساس عنوان یا توضیحات
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
      // استفاده از اکشن‌های مربوط به Vuex برای دریافت دوره‌ها
      try {
        await this.$store.dispatch('courses/fetchEnrolledCourses');
        this.coursesData = [...this.enrolledCourses];

        // اضافه کردن فیلد isFavorite برای دوره‌ها (در پروژه واقعی این داده از سرور می‌آید)
        this.coursesData = this.coursesData.map(course => ({
          ...course,
          isFavorite: false
        }));

        this.sortCourses(this.sortBy);
      } catch (error) {
        throw error;
      }
    },

    getCourseImage(course) {
      // در یک پروژه واقعی، تصویر دوره از سرور دریافت می‌شود
      // این یک پیاده‌سازی موقت است
      return `/api/placeholder/400/200`;
    },

    getTeacherName(teacher) {
      if (!teacher) return 'نامشخص';
      return this.getUserFullName(teacher);
    },

    getCourseProgress(course) {
      // در یک پروژه واقعی، پیشرفت از سرور دریافت می‌شود
      // در اینجا یک عدد تصادفی بین 0 تا 100 تولید می‌کنیم
      if (!course.progress) {
        // تولید عدد تصادفی بین 0 تا 100 برای نمایش
        course.progress = Math.floor(Math.random() * 101);
      }
      return course.progress;
    },

    toggleFavorite(course) {
      // تغییر وضعیت علاقه‌مندی به دوره
      course.isFavorite = !course.isFavorite;

      // در یک پروژه واقعی، این تغییر در سرور ذخیره می‌شود
      const message = course.isFavorite
          ? `"${course.title}" به علاقه‌مندی‌ها اضافه شد`
          : `"${course.title}" از علاقه‌مندی‌ها حذف شد`;

      this.$toast.info(message);
    },

    filterCourses() {
      // فیلتر کردن بر اساس جستجو در computed property انجام می‌شود
      // این متد برای زمانی است که بخواهید پیاده‌سازی پیچیده‌تری داشته باشید
    },

    sortCourses(criterion) {
      this.sortBy = criterion;

      // تغییر جهت مرتب‌سازی اگر معیار یکسان باشد
      if (this.previousSortBy === criterion) {
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortDirection = 'asc';
      }

      this.previousSortBy = criterion;

      // مرتب‌سازی بر اساس معیار و جهت انتخاب شده
      this.coursesData.sort((a, b) => {
        let comparison = 0;

        switch(criterion) {
          case 'title':
            comparison = a.title.localeCompare(b.title);
            break;
          case 'date':
            // فرض می‌کنیم هر دوره دارای فیلد createdAt است
            const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
            const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
            comparison = dateB - dateA; // مرتب‌سازی نزولی برای تاریخ
            break;
          case 'progress':
            const progressA = this.getCourseProgress(a);
            const progressB = this.getCourseProgress(b);
            comparison = progressB - progressA; // مرتب‌سازی نزولی برای پیشرفت
            break;
        }

        // اعمال جهت مرتب‌سازی
        return this.sortDirection === 'asc' ? comparison : -comparison;
      });
    }
  }
}
</script>

<style scoped>
.course-card {
  background-color: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s, box-shadow 0.3s;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.course-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.course-card-header {
  position: relative;
}

.course-image {
  position: relative;
  height: 160px;
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
  transition: background-color 0.3s;
}

.btn-action:hover {
  background-color: #fff;
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
  padding: 12px 16px;
  background-color: #f8f9fa;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #eee;
}

.course-students {
  font-size: 0.85rem;
  color: #6c757d;
}
</style>