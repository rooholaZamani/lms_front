<template>
  <div class="available-courses-container">
    <div class="container-fluid p-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>دوره‌های قابل ثبت‌نام</h2>

        <div class="d-flex align-items-center">
          <div class="form-check form-switch me-3">
            <input
                class="form-check-input"
                type="checkbox"
                id="showOnlyPopular"
                v-model="showOnlyPopular"
                @change="filterCourses"
            >
            <label class="form-check-label" for="showOnlyPopular">فقط دوره‌های محبوب</label>
          </div>

          <div class="dropdown">
            <button class="btn btn-outline-secondary dropdown-toggle" type="button" id="viewModeDropdown" data-bs-toggle="dropdown" aria-expanded="false">
              <i class="fas" :class="viewMode === 'grid' ? 'fa-th-large' : 'fa-list'"></i>
              {{ viewMode === 'grid' ? 'نمایش شبکه‌ای' : 'نمایش لیستی' }}
            </button>
            <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="viewModeDropdown">
              <li><a class="dropdown-item" href="#" @click.prevent="changeViewMode('grid')"><i class="fas fa-th-large me-2"></i> نمایش شبکه‌ای</a></li>
              <li><a class="dropdown-item" href="#" @click.prevent="changeViewMode('list')"><i class="fas fa-list me-2"></i> نمایش لیستی</a></li>
            </ul>
          </div>
        </div>
      </div>

      <div class="course-filters mb-4">
        <div class="row g-3">
          <div class="col-md-4">
            <input
                type="text"
                class="form-control"
                v-model="searchQuery"
                placeholder="جستجو در دوره‌ها..."
                @input="filterCourses"
            >
          </div>

          <div class="col-md-3">
            <select v-model="categoryFilter" class="form-select" @change="filterCourses">
              <option value="">همه دسته‌بندی‌ها</option>
              <option v-for="category in categories" :key="category.id" :value="category.id">
                {{ category.name }}
              </option>
            </select>
          </div>

          <div class="col-md-3">
            <select v-model="sortBy" class="form-select" @change="sortCourses">
              <option value="title">مرتب‌سازی: نام (الفبا)</option>
              <option value="popularity">مرتب‌سازی: محبوبیت</option>
              <option value="newest">مرتب‌سازی: جدیدترین</option>
              <option value="students">مرتب‌سازی: تعداد دانش‌آموزان</option>
            </select>
          </div>

          <div class="col-md-2">
            <button class="btn btn-outline-secondary w-100" @click="resetFilters">
              <i class="fas fa-sync-alt me-1"></i> پاک کردن
            </button>
          </div>
        </div>
      </div>

      <loading-spinner :loading="loading">
        <!-- Grid View Mode -->
        <div v-if="viewMode === 'grid'" class="row">
          <div v-for="course in paginatedCourses" :key="course.id" class="col-lg-3 col-md-4 col-sm-6 mb-4">
            <div class="course-card">
              <div class="course-card-header">
                <div class="course-image">
                  <img :src="getCourseImage(course)" :alt="course.title">
                  <div class="course-popularity" v-if="isPopularCourse(course)">
                    <i class="fas fa-fire"></i> محبوب
                  </div>
                </div>
                <div class="course-actions">
                  <button class="btn-action" @click="toggleFavorite(course)" title="افزودن به علاقه‌مندی‌ها">
                    <i class="fas" :class="course.isFavorite ? 'fa-heart text-danger' : 'fa-heart-o'"></i>
                  </button>
                </div>
              </div>

              <div class="course-card-body">
                <div class="course-category" v-if="course.category">
                  {{ getCategoryName(course.category) }}
                </div>
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
                <div class="d-flex align-items-center mb-2">
                  <div class="course-rating me-2">
                    <i v-for="i in 5" :key="i" class="fas fa-star"
                       :class="i <= course.rating ? 'text-warning' : 'text-muted'"></i>
                  </div>
                  <div class="rating-count text-muted">({{ course.ratingCount || 0 }})</div>
                </div>

                <div class="d-flex justify-content-between align-items-center">
                  <div class="course-students">
                    <i class="fas fa-users me-1"></i>
                    {{ course.enrolledStudents ? course.enrolledStudents.length : 0 }} دانش‌آموز
                  </div>

                  <button class="btn btn-primary btn-sm" @click="enrollCourse(course)">
                    ثبت‌نام
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- List View Mode -->
        <div v-else class="course-list-view">
          <div v-for="course in paginatedCourses" :key="course.id" class="course-list-item">
            <div class="course-list-image">
              <img :src="getCourseImage(course)" :alt="course.title">
              <div class="course-popularity" v-if="isPopularCourse(course)">
                <i class="fas fa-fire"></i> محبوب
              </div>
            </div>

            <div class="course-list-content">
              <div class="course-list-header">
                <div>
                  <div class="course-category" v-if="course.category">
                    {{ getCategoryName(course.category) }}
                  </div>
                  <h5 class="course-title">{{ course.title }}</h5>
                </div>
                <div class="course-actions">
                  <button class="btn-action" @click="toggleFavorite(course)" title="افزودن به علاقه‌مندی‌ها">
                    <i class="fas" :class="course.isFavorite ? 'fa-heart text-danger' : 'fa-heart-o'"></i>
                  </button>
                </div>
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
                  <div class="course-rating">
                    <i v-for="i in 5" :key="i" class="fas fa-star"
                       :class="i <= course.rating ? 'text-warning' : 'text-muted'"></i>
                    <span class="rating-count text-muted">({{ course.ratingCount || 0 }})</span>
                  </div>
                </div>

                <div class="course-actions">
                  <router-link :to="`/courses/${course.id}`" class="btn btn-outline-primary btn-sm me-2">
                    مشاهده دوره
                  </router-link>
                  <button class="btn btn-primary btn-sm" @click="enrollCourse(course)">
                    ثبت‌نام
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="filteredCourses.length === 0" class="mt-4">
          <empty-state
              title="دوره‌ای یافت نشد"
              description="با معیارهای جستجو و فیلتر انتخاب شده، دوره‌ای یافت نشد."
              icon="search"
          >
            <button class="btn btn-primary" @click="resetFilters">
              پاک کردن فیلترها
            </button>
          </empty-state>
        </div>

        <pagination
            v-if="filteredCourses.length > 0"
            :current-page="currentPage"
            :total-pages="totalPages"
            @page-changed="changePage"
            class="mt-4"
        />
      </loading-spinner>
    </div>

    <!-- Course Detail Modal -->
    <div class="modal fade" id="courseDetailModal" tabindex="-1" aria-labelledby="courseDetailModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="courseDetailModalLabel">{{ selectedCourse.title }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="row">
              <div class="col-md-5">
                <img :src="getCourseDetailImage(selectedCourse)" :alt="selectedCourse.title" class="course-detail-image">

                <div class="course-quick-info">
                  <div class="info-item">
                    <i class="fas fa-chalkboard-teacher"></i>
                    <span>استاد: {{ getTeacherName(selectedCourse.teacher) }}</span>
                  </div>
                  <div class="info-item">
                    <i class="fas fa-users"></i>
                    <span>{{ selectedCourse.enrolledStudents ? selectedCourse.enrolledStudents.length : 0 }} دانش‌آموز</span>
                  </div>
                  <div class="info-item">
                    <i class="fas fa-book-open"></i>
                    <span>{{ selectedCourse.lessons ? selectedCourse.lessons.length : 0 }} درس</span>
                  </div>
                  <div class="info-item">
                    <i class="fas fa-calendar-alt"></i>
                    <span>تاریخ شروع: {{ formatDate(selectedCourse.createdAt) }}</span>
                  </div>
                </div>
              </div>

              <div class="col-md-7">
                <h6>درباره دوره</h6>
                <p class="course-detail-description">{{ selectedCourse.description }}</p>

                <div class="course-rating-detail mb-3">
                  <div class="rating-stars">
                    <i v-for="i in 5" :key="i" class="fas fa-star"
                       :class="i <= selectedCourse.rating ? 'text-warning' : 'text-muted'"></i>
                  </div>
                  <div class="rating-text">
                    <strong>{{ selectedCourse.rating }}/5</strong> ({{ selectedCourse.ratingCount || 0 }} نظر)
                  </div>
                </div>

                <h6>سرفصل‌های دوره</h6>
                <div v-if="selectedCourse.lessons && selectedCourse.lessons.length > 0" class="course-lessons-list">
                  <div v-for="(lesson, index) in selectedCourse.lessons.slice(0, 5)" :key="lesson.id" class="lesson-item">
                    <div class="lesson-number">{{ index + 1 }}</div>
                    <div class="lesson-info">
                      <div class="lesson-title">{{ lesson.title }}</div>
                      <div class="lesson-meta" v-if="lesson.duration">
                        <i class="fas fa-clock me-1"></i> {{ lesson.duration }} دقیقه
                      </div>
                    </div>
                  </div>

                  <div v-if="selectedCourse.lessons.length > 5" class="more-lessons">
                    و {{ selectedCourse.lessons.length - 5 }} درس دیگر...
                  </div>
                </div>
                <empty-state
                    v-else
                    title="هنوز درسی اضافه نشده است"
                    description="استاد در حال آماده‌سازی محتوای دوره است."
                    icon="book"
                    compact
                />
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">بستن</button>
            <button type="button" class="btn btn-primary" @click="enrollSelectedCourse">ثبت‌نام در دوره</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import Pagination from '@/components/common/Pagination.vue';
import { useFormatters } from '@/composables/useFormatters.js';
import { useUser } from '@/composables/useUser.js';

export default {
  name: 'AvailableCourses',
  components: {
    LoadingSpinner,
    EmptyState,
    Pagination
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
      viewMode: 'grid', // 'grid' or 'list'
      searchQuery: '',
      categoryFilter: '',
      sortBy: 'newest',
      showOnlyPopular: false,
      currentPage: 1,
      coursesPerPage: 8,

      // دسته‌بندی‌های دوره (داده نمونه)
      categories: [
        { id: 1, name: 'برنامه‌نویسی' },
        { id: 2, name: 'طراحی وب' },
        { id: 3, name: 'ریاضیات' },
        { id: 4, name: 'فیزیک' },
        { id: 5, name: 'زبان انگلیسی' },
        { id: 6, name: 'هوش مصنوعی' }
      ],

      coursesData: [],
      selectedCourse: {}, // برای نمایش در مودال

      // حالت‌های در حال انجام
      enrollingCourse: false,
      courseDetailLoading: false
    };
  },
  computed: {
    ...mapGetters({
      availableCourses: 'courses/getAllCourses'
    }),
    filteredCourses() {
      // فیلتر براساس جستجو و دسته‌بندی
      let filtered = [...this.coursesData];

      // فیلتر براساس جستجو
      if (this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase().trim();
        filtered = filtered.filter(course => {
          return course.title.toLowerCase().includes(query) ||
              (course.description && course.description.toLowerCase().includes(query));
        });
      }

      // فیلتر براساس دسته‌بندی
      if (this.categoryFilter) {
        filtered = filtered.filter(course => course.categoryId === this.categoryFilter);
      }

      // فیلتر دوره‌های محبوب
      if (this.showOnlyPopular) {
        filtered = filtered.filter(course => this.isPopularCourse(course));
      }

      return filtered;
    },
    paginatedCourses() {
      // صفحه‌بندی دوره‌ها
      const startIndex = (this.currentPage - 1) * this.coursesPerPage;
      const endIndex = startIndex + this.coursesPerPage;

      return this.filteredCourses.slice(startIndex, endIndex);
    },
    totalPages() {
      // محاسبه تعداد کل صفحات
      return Math.ceil(this.filteredCourses.length / this.coursesPerPage);
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
        // استفاده از اکشن Vuex برای دریافت دوره‌های قابل ثبت‌نام
        await this.$store.dispatch('courses/fetchEnrolledCourses');

        // در پروژه واقعی، ما از API استفاده می‌کنیم تا فقط دوره‌هایی که دانش‌آموز
        // در آنها ثبت‌نام نکرده است دریافت کنیم. اینجا به عنوان نمونه، تعدادی دوره تولید می‌کنیم.

        // تولید داده‌های نمونه برای نمایش
        this.coursesData = Array.from({ length: 20 }, (_, i) => {
          const courseIndex = i + 1;
          return {
            id: courseIndex,
            title: `دوره ${courseIndex}: ${this.getRandomCourseName()}`,
            description: `این یک توضیح نمونه برای دوره ${courseIndex} است. در این دوره شما با مفاهیم اساسی این موضوع آشنا خواهید شد و مهارت‌های لازم را کسب خواهید کرد.`,
            teacher: {
              id: Math.floor(Math.random() * 5) + 1,
              firstName: this.getRandomTeacherFirstName(),
              lastName: this.getRandomTeacherLastName()
            },
            categoryId: Math.floor(Math.random() * 6) + 1, // انتخاب تصادفی دسته‌بندی
            enrolledStudents: Array.from({ length: Math.floor(Math.random() * 50) + 5 }, (_, j) => ({
              id: j + 1,
              username: `student${j + 1}`
            })),
            lessons: Array.from({ length: Math.floor(Math.random() * 10) + 3 }, (_, j) => ({
              id: (courseIndex * 100) + j,
              title: `درس ${j + 1}: ${this.getRandomLessonName()}`,
              duration: Math.floor(Math.random() * 60) + 30 // 30 تا 90 دقیقه
            })),
            createdAt: this.getRandomDate(),
            rating: Math.floor(Math.random() * 50 + 10) / 10, // امتیاز بین 1 تا 5
            ratingCount: Math.floor(Math.random() * 100) + 5,
            isFavorite: false
          };
        });

        // مرتب‌سازی اولیه
        this.sortCourses();
      } catch (error) {
        throw error;
      }
    },

    getRandomCourseName() {
      const courseNames = [
        'آموزش برنامه‌نویسی پایتون',
        'مقدمه‌ای بر هوش مصنوعی',
        'طراحی وب پیشرفته',
        'ریاضیات مهندسی',
        'فیزیک مکانیک',
        'آموزش زبان انگلیسی',
        'برنامه‌نویسی جاوا',
        'علوم داده',
        'یادگیری ماشین',
        'تحلیل آماری',
        'طراحی گرافیک',
        'امنیت شبکه',
        'حسابداری مالی',
        'مدیریت پروژه',
        'توسعه نرم‌افزار موبایل'
      ];

      return courseNames[Math.floor(Math.random() * courseNames.length)];
    },

    getRandomLessonName() {
      const lessonNames = [
        'مقدمه و آشنایی',
        'اصول اولیه',
        'ساختارهای داده',
        'الگوریتم‌ها',
        'مفاهیم پیشرفته',
        'پروژه عملی',
        'نصب و راه‌اندازی',
        'اصول طراحی',
        'تکنیک‌های پیشرفته',
        'بررسی موردی',
        'مباحث تکمیلی',
        'آزمون و ارزیابی'
      ];

      return lessonNames[Math.floor(Math.random() * lessonNames.length)];
    },

    getRandomTeacherFirstName() {
      const firstNames = ['علی', 'محمد', 'سارا', 'مریم', 'امیر', 'رضا', 'فاطمه', 'زهرا', 'حسین', 'نرگس'];
      return firstNames[Math.floor(Math.random() * firstNames.length)];
    },

    getRandomTeacherLastName() {
      const lastNames = ['محمدی', 'احمدی', 'حسینی', 'رضایی', 'کریمی', 'موسوی', 'صادقی', 'نجفی', 'علوی', 'مرادی'];
      return lastNames[Math.floor(Math.random() * lastNames.length)];
    },

    getRandomDate() {
      // تولید تاریخ تصادفی در محدوده 6 ماه گذشته
      const now = new Date();
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(now.getMonth() - 6);

      const randomTimestamp = sixMonthsAgo.getTime() + Math.random() * (now.getTime() - sixMonthsAgo.getTime());
      return new Date(randomTimestamp).toISOString();
    },

    getCourseImage(course) {
      // در یک پروژه واقعی، تصویر دوره از سرور دریافت می‌شود
      return `/api/placeholder/400/200`;
    },

    getCourseDetailImage(course) {
      // تصویر بزرگتر برای نمایش در مودال جزئیات
      return `/api/placeholder/500/300`;
    },

    getTeacherName(teacher) {
      if (!teacher) return 'نامشخص';
      return this.getUserFullName(teacher);
    },

    getCategoryName(categoryId) {
      const category = this.categories.find(c => c.id === categoryId);
      return category ? category.name : 'عمومی';
    },

    isPopularCourse(course) {
      // دوره‌هایی با تعداد دانش‌آموزان بیشتر از 20 یا امتیاز بالاتر از 4 را محبوب در نظر می‌گیریم
      return (course.enrolledStudents?.length > 20 || course.rating >= 4);
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
      // ریست صفحه‌بندی
      this.currentPage = 1;
      // فیلتر کردن در computed property انجام می‌شود
    },

    sortCourses() {
      // مرتب‌سازی دوره‌ها بر اساس معیار انتخاب شده
      switch (this.sortBy) {
        case 'title':
          this.coursesData.sort((a, b) => a.title.localeCompare(b.title));
          break;
        case 'popularity':
          this.coursesData.sort((a, b) => b.rating - a.rating);
          break;
        case 'newest':
          this.coursesData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          break;
        case 'students':
          this.coursesData.sort((a, b) => (b.enrolledStudents?.length || 0) - (a.enrolledStudents?.length || 0));
          break;
        default:
          break;
      }
    },

    changePage(page) {
      this.currentPage = page;
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

    showCourseDetail(course) {
      this.selectedCourse = { ...course };

      // در پروژه واقعی، احتمالاً اطلاعات دقیق‌تر دوره از سرور دریافت می‌شود
      // this.loadCourseDetail(course.id);

      // نمایش مودال
      const modal = new bootstrap.Modal(document.getElementById('courseDetailModal'));
      modal.show();
    },

    async loadCourseDetail(courseId) {
      // این متد در یک پروژه واقعی برای دریافت جزئیات دوره از سرور استفاده می‌شود
      this.courseDetailLoading = true;

      try {
        // اینجا از API برای دریافت جزئیات دوره استفاده می‌کنیم
        // const response = await this.$http.get(`/courses/${courseId}`);
        // this.selectedCourse = response.data;
      } catch (error) {
        console.error('Error loading course details:', error);
        this.$toast.error('خطا در دریافت جزئیات دوره');
      } finally {
        this.courseDetailLoading = false;
      }
    },

    async enrollCourse(course) {
      if (this.enrollingCourse) return;

      this.enrollingCourse = true;

      try {
        // ثبت‌نام در دوره
        await this.$store.dispatch('courses/enrollCourse', course.id);

        // حذف دوره از لیست دوره‌های قابل ثبت‌نام
        this.coursesData = this.coursesData.filter(c => c.id !== course.id);

        // بروزرسانی آمار
        this.$toast.success(`شما با موفقیت در دوره "${course.title}" ثبت‌نام شدید`);

        // بستن مودال اگر باز است
        const modal = bootstrap.Modal.getInstance(document.getElementById('courseDetailModal'));
        if (modal) {
          modal.hide();
        }

        // هدایت به صفحه دوره
        this.$router.push(`/courses/${course.id}`);
      } catch (error) {
        console.error('Error enrolling in course:', error);
        this.$toast.error('خطا در ثبت‌نام دوره');
      } finally {
        this.enrollingCourse = false;
      }
    },

    enrollSelectedCourse() {
      // ثبت‌نام در دوره انتخاب شده (از مودال)
      this.enrollCourse(this.selectedCourse);
    }
  }
}
</script>

<style scoped>
.available-courses-container {
  min-height: calc(100vh - 56px);
}

.course-filters {
  background-color: #f8f9fa;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  margin-bottom: 2rem;
}

/* Grid View */
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

.course-popularity {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: rgba(255, 59, 48, 0.9);
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

.course-category {
  display: inline-block;
  background-color: #e9ecef;
  color: #495057;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  margin-bottom: 8px;
}

.course-title {
  font-size: 1.1rem;
  margin-bottom: 8px;
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
  border-top: 1px solid #eee;
}

.course-rating {
  display: flex;
  align-items: center;
}

.rating-count {
  font-size: 0.8rem;
}

/* List View */
.course-list-view {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.course-list-item {
  display: flex;
  background-color: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s, box-shadow 0.3s;
}

.course-list-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.course-list-image {
  position: relative;
  width: 220px;
  min-width: 220px;
  overflow: hidden;
}

.course-list-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.course-list-content {
  flex: 1;
  padding: 16px;
  display: flex;
  flex-direction: column;
}

.course-list-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.course-list-footer {
  margin-top: auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #eee;
}

.course-meta {
  display: flex;
  gap: 16px;
  color: #6c757d;
  font-size: 0.85rem;
}

/* Course Detail Modal */
.course-detail-image {
  width: 100%;
  border-radius: 8px;
  margin-bottom: 16px;
}

.course-quick-info {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 12px;
}

.info-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.info-item i {
  width: 24px;
  color: #6c757d;
  margin-left: 8px;
}

.course-detail-description {
  margin-bottom: 16px;
  line-height: 1.6;
}

.course-rating-detail {
  display: flex;
  align-items: center;
  gap: 10px;
}

.course-lessons-list {
  margin-top: 10px;
}

.lesson-item {
  display: flex;
  align-items: center;
  padding: 8px;
  background-color: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 8px;
}

.lesson-number {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: #007bff;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.8rem;
  margin-left: 10px;
}

.lesson-info {
  flex: 1;
}

.lesson-title {
  font-weight: 600;
  font-size: 0.9rem;
}

.lesson-meta {
  font-size: 0.8rem;
  color: #6c757d;
}

.more-lessons {
  text-align: center;
  color: #6c757d;
  font-size: 0.9rem;
  padding: 8px;
  background-color: #f8f9fa;
  border-radius: 8px;
}
</style>