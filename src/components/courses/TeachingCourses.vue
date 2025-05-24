<template>
  <div class="teaching-courses-container">
    <div class="container-fluid p-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>دوره‌های تدریس من</h2>

        <button class="btn btn-primary" @click="showCreateCourseModal">
          <i class="fas fa-plus me-1"></i> ایجاد دوره جدید
        </button>
      </div>

      <loading-spinner :loading="loading">
        <div class="row mb-4">
          <div class="col-lg-3 col-md-6 mb-4">
            <div class="stats-card">
              <div class="stats-icon">
                <i class="fas fa-chalkboard-teacher"></i>
              </div>
              <div class="stats-value">{{ coursesStats.totalCourses }}</div>
              <div class="stats-label">کل دوره‌ها</div>
            </div>
          </div>

          <div class="col-lg-3 col-md-6 mb-4">
            <div class="stats-card">
              <div class="stats-icon">
                <i class="fas fa-users"></i>
              </div>
              <div class="stats-value">{{ coursesStats.totalStudents }}</div>
              <div class="stats-label">کل دانش‌آموزان</div>
            </div>
          </div>

          <div class="col-lg-3 col-md-6 mb-4">
            <div class="stats-card">
              <div class="stats-icon">
                <i class="fas fa-book"></i>
              </div>
              <div class="stats-value">{{ coursesStats.totalLessons }}</div>
              <div class="stats-label">کل دروس</div>
            </div>
          </div>

          <div class="col-lg-3 col-md-6 mb-4">
            <div class="stats-card">
              <div class="stats-icon">
                <i class="fas fa-chart-line"></i>
              </div>
              <div class="stats-value">{{ coursesStats.averageProgress }}%</div>
              <div class="stats-label">میانگین پیشرفت</div>
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
              <select v-model="sortBy" class="form-select" @change="sortCourses">
                <option value="title">مرتب‌سازی بر اساس: نام</option>
                <option value="students">مرتب‌سازی بر اساس: تعداد دانش‌آموزان</option>
                <option value="date">مرتب‌سازی بر اساس: تاریخ</option>
                <option value="progress">مرتب‌سازی بر اساس: پیشرفت</option>
              </select>
            </div>

            <div class="col-md-3">
              <div class="form-check form-switch mt-2">
                <input
                    class="form-check-input"
                    type="checkbox"
                    id="activeCoursesOnly"
                    v-model="activeCoursesOnly"
                    @change="filterCourses"
                >
                <label class="form-check-label" for="activeCoursesOnly">فقط دوره‌های فعال</label>
              </div>
            </div>
          </div>
        </div>

        <div v-if="filteredCourses.length > 0">
          <div class="table-responsive">
            <table class="table table-hover teaching-courses-table">
              <thead class="table-light">
              <tr>
                <th scope="col">#</th>
                <th scope="col">نام دوره</th>
                <th scope="col">دانش‌آموزان</th>
                <th scope="col">دروس</th>
                <th scope="col">میانگین پیشرفت</th>
                <th scope="col">وضعیت</th>
                <th scope="col">عملیات</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="(course, index) in filteredCourses" :key="course.id">
                <td>{{ index + 1 }}</td>
                <td>
                  <div class="d-flex align-items-center">
                    <div class="course-image me-2">
                      <img :src="getCourseImage(course)" :alt="course.title">
                    </div>
                    <div>
                      <div class="course-title">{{ course.title }}</div>
                      <div class="course-description">{{ truncateText(course.description, 60) }}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="d-flex align-items-center">
                    <span class="badge bg-primary me-1">{{ getStudentCount(course) }}</span>
                    <div class="students-trend" v-if="course.studentsTrend !== 0">
                      <i
                          class="fas"
                          :class="getStudentsTrendIcon(course.studentsTrend)"
                          :style="`color: ${getStudentsTrendColor(course.studentsTrend)}`"></i>
                      <span>{{ Math.abs(course.studentsTrend) }}%</span>
                    </div>
                  </div>
                </td>
                <td>{{ getLessonCount(course) }}</td>
                <td>
                  <div class="progress">
                    <div
                        class="progress-bar"
                        :class="getProgressBarClass(getCourseProgress(course))"
                        role="progressbar"
                        :style="`width: ${getCourseProgress(course)}%`"
                        :aria-valuenow="getCourseProgress(course)"
                        aria-valuemin="0"
                        aria-valuemax="100"
                    >
                      {{ getCourseProgress(course) }}%
                    </div>
                  </div>
                </td>
                <td>
                    <span class="badge" :class="getStatusBadgeClass(course.status)">
                      {{ getStatusText(course.status) }}
                    </span>
                </td>
                <td>
                  <div class="d-flex">
                    <router-link
                        :to="`/courses/${course.id}`"
                        class="btn btn-sm btn-outline-primary me-1"
                        title="مشاهده"
                    >
                      <i class="fas fa-eye"></i>
                    </router-link>

                    <button
                        class="btn btn-sm btn-outline-success me-1"
                        @click="navigateToCourseAnalytics(course.id)"
                        title="تحلیل آماری"
                    >
                      <i class="fas fa-chart-bar"></i>
                    </button>

                    <button
                        class="btn btn-sm btn-outline-secondary"
                        @click="navigateToCourseSettings(course.id)"
                        title="تنظیمات"
                    >
                      <i class="fas fa-cog"></i>
                    </button>
                  </div>
                </td>
              </tr>
              </tbody>
            </table>
          </div>

          <pagination
              :current-page="currentPage"
              :total-pages="totalPages"
              @page-changed="changePage"
          />
        </div>

        <empty-state
            v-else
            title="هیچ دوره‌ای یافت نشد"
            description="شما هنوز هیچ دوره‌ای برای تدریس ندارید یا نتیجه‌ای با جستجوی شما مطابقت ندارد"
            icon="chalkboard-teacher"
        >
          <button class="btn btn-primary" @click="showCreateCourseModal">
            ایجاد دوره جدید
          </button>
        </empty-state>
      </loading-spinner>
    </div>

    <!-- Create Course Modal -->
    <div class="modal fade" id="createCourseModal" tabindex="-1" aria-labelledby="createCourseModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="createCourseModalLabel">ایجاد دوره جدید</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="form-group mb-3">
              <label for="courseTitle" class="form-label">عنوان دوره</label>
              <input
                  type="text"
                  id="courseTitle"
                  class="form-control"
                  v-model="courseForm.title"
                  placeholder="عنوان دوره را وارد کنید"
                  required
              >
            </div>

            <div class="form-group mb-3">
              <label for="courseDescription" class="form-label">توضیحات دوره</label>
              <textarea
                  id="courseDescription"
                  class="form-control"
                  v-model="courseForm.description"
                  rows="4"
                  placeholder="توضیحات دوره را وارد کنید"
              ></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">انصراف</button>
            <button
                type="button"
                class="btn btn-primary"
                @click="createCourse"
                :disabled="creatingCourse"
            >
              <span v-if="creatingCourse" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
              ایجاد دوره
            </button>
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

export default {
  name: 'TeachingCourses',
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
      loading: true,
      searchQuery: '',
      sortBy: 'title',
      activeCoursesOnly: false,
      currentPage: 1,
      coursesPerPage: 10,
      creatingCourse: false,

      courseForm: {
        title: '',
        description: ''
      },

      coursesData: [],

      // آمار کلی دوره‌ها
      coursesStats: {
        totalCourses: 0,
        totalStudents: 0,
        totalLessons: 0,
        averageProgress: 0
      }
    };
  },
  computed: {
    ...mapGetters({
      teachingCourses: 'courses/getTeachingCourses'
    }),
    filteredCourses() {
      // فیلتر کردن براساس جستجو
      let filtered = [...this.coursesData];

      if (this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase().trim();
        filtered = filtered.filter(course => {
          return course.title.toLowerCase().includes(query) ||
              (course.description && course.description.toLowerCase().includes(query));
        });
      }

      // فیلتر بر اساس وضعیت فعال
      if (this.activeCoursesOnly) {
        filtered = filtered.filter(course => course.status === 'active');
      }

      // صفحه‌بندی
      const startIndex = (this.currentPage - 1) * this.coursesPerPage;
      const endIndex = startIndex + this.coursesPerPage;

      return filtered.slice(startIndex, endIndex);
    },
    totalPages() {
      if (!this.coursesData.length) return 1;

      // محاسبه تعداد کل صفحات
      let filtered = [...this.coursesData];

      if (this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase().trim();
        filtered = filtered.filter(course => {
          return course.title.toLowerCase().includes(query) ||
              (course.description && course.description.toLowerCase().includes(query));
        });
      }

      if (this.activeCoursesOnly) {
        filtered = filtered.filter(course => course.status === 'active');
      }

      return Math.ceil(filtered.length / this.coursesPerPage);
    }
  },
  async created() {
    try {
      await this.fetchCourses();
      this.calculateStats();
    } catch (error) {
      console.error('Error fetching teaching courses:', error);
      this.$toast.error('خطا در دریافت لیست دوره‌های تدریس');
    } finally {
      this.loading = false;
    }
  },
  methods: {
    async fetchCourses() {
      try {
        await this.$store.dispatch('courses/fetchTeachingCourses');

        // دریافت جزئیات هر دوره از API
        const coursesWithDetails = await Promise.all(
            this.teachingCourses.map(async (course) => {
              try {
                // دریافت جزئیات دوره شامل دانش‌آموزان و دروس
                const courseDetailResponse = await this.$http.get(`/courses/${course.id}`);
                const courseDetail = courseDetailResponse.data.course;

                // دریافت آمارهای عملکرد برای این دوره (اختیاری)
                let courseStats = null;
                try {
                  const statsResponse = await this.$http.get(`/analytics/teacher/course/${course.id}/performance`);
                  courseStats = statsResponse.data;
                } catch (statsError) {
                  console.warn(`Could not fetch stats for course ${course.id}:`, statsError);
                  // در صورت عدم دسترسی به آمار، مقادیر پیش‌فرض قرار می‌دهیم
                  courseStats = {
                    averageProgress: 0,
                    studentGrowth: 0
                  };
                }

                return {
                  ...course,
                  // اطلاعات واقعی از API
                  enrolledStudents: courseDetail.enrolledStudents || [],
                  lessons: courseDetail.lessons || [],
                  status: 'active', // یا از courseDetail.status اگر موجود باشد
                  progress: courseStats.averageProgress || 0,
                  studentsTrend: courseStats.studentGrowth || 0,
                };
              } catch (error) {
                console.error(`Error fetching details for course ${course.id}:`, error);
                // در صورت خطا، داده‌های پایه را برمی‌گردانیم
                return {
                  ...course,
                  enrolledStudents: [],
                  lessons: [],
                  status: 'active',
                  progress: 0,
                  studentsTrend: 0,
                };
              }
            })
        );

        this.coursesData = coursesWithDetails;

        // مرتب‌سازی اولیه
        this.sortCourses();
      } catch (error) {
        throw error;
      }
    },

    calculateStats() {
      // محاسبه آمارهای کلی براساس داده‌های واقعی
      if (this.coursesData.length === 0) {
        this.coursesStats = {
          totalCourses: 0,
          totalStudents: 0,
          totalLessons: 0,
          averageProgress: 0
        };
        return;
      }

      const totalCourses = this.coursesData.length;

      // محاسبه تعداد کل دانش‌آموزان (با حذف دانش‌آموزان تکراری)
      const allStudents = new Set();
      this.coursesData.forEach(course => {
        if (course.enrolledStudents) {
          course.enrolledStudents.forEach(student => {
            allStudents.add(student.id);
          });
        }
      });
      const totalStudents = allStudents.size;

      // محاسبه تعداد کل دروس
      let totalLessons = 0;
      this.coursesData.forEach(course => {
        totalLessons += course.lessons ? course.lessons.length : 0;
      });

      // محاسبه میانگین پیشرفت
      let totalProgress = 0;
      this.coursesData.forEach(course => {
        totalProgress += this.getCourseProgress(course);
      });
      const averageProgress = totalCourses > 0 ? Math.round(totalProgress / totalCourses) : 0;

      this.coursesStats = {
        totalCourses,
        totalStudents,
        totalLessons,
        averageProgress
      };
    },

    getCourseImage(course) {
      // اگر در API تصویری برای دوره موجود است، از آن استفاده کنید
      if (course.imageUrl) {
        return course.imageUrl;
      }
      // در غیر این صورت تصویر پیش‌فرض
      return `/api/placeholder/80/60`;
    },

    getStudentCount(course) {
      if (!course.enrolledStudents) return 0;
      return course.enrolledStudents.length;
    },

    getLessonCount(course) {
      if (!course.lessons) return 0;
      return course.lessons.length;
    },

    getCourseProgress(course) {
      // اگر از API آمار واقعی داریم، از آن استفاده می‌کنیم
      return course.progress || 0;
    },

    getStudentsTrendIcon(trend) {
      if (trend > 0) return 'fa-arrow-up';
      if (trend < 0) return 'fa-arrow-down';
      return 'fa-minus';
    },

    getStudentsTrendColor(trend) {
      if (trend > 0) return '#28a745';
      if (trend < 0) return '#dc3545';
      return '#6c757d';
    },

    getProgressBarClass(progress) {
      if (progress >= 75) return 'bg-success';
      if (progress >= 50) return 'bg-info';
      if (progress >= 25) return 'bg-warning';
      return 'bg-danger';
    },

    getStatusBadgeClass(status) {
      switch (status) {
        case 'active':
          return 'bg-success';
        case 'draft':
          return 'bg-secondary';
        case 'completed':
          return 'bg-info';
        case 'pending':
          return 'bg-warning';
        default:
          return 'bg-secondary';
      }
    },

    getStatusText(status) {
      switch (status) {
        case 'active':
          return 'فعال';
        case 'draft':
          return 'پیش‌نویس';
        case 'completed':
          return 'تکمیل شده';
        case 'pending':
          return 'در انتظار';
        default:
          return 'نامشخص';
      }
    },

    sortCourses() {
      this.coursesData.sort((a, b) => {
        switch (this.sortBy) {
          case 'title':
            return a.title.localeCompare(b.title);
          case 'students':
            return this.getStudentCount(b) - this.getStudentCount(a);
          case 'date':
            const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
            const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
            return dateB - dateA;
          case 'progress':
            return this.getCourseProgress(b) - this.getCourseProgress(a);
          default:
            return 0;
        }
      });
    },

    filterCourses() {
      // ریست صفحه‌بندی
      this.currentPage = 1;
      // فیلتر کردن در computed property انجام می‌شود
    },

    changePage(page) {
      this.currentPage = page;
    },

    showCreateCourseModal() {
      // ریست فرم
      this.courseForm = {
        title: '',
        description: ''
      };

      // نمایش مودال
      const modal = new bootstrap.Modal(document.getElementById('createCourseModal'));
      modal.show();
    },

    async createCourse() {
      if (!this.courseForm.title.trim() || this.creatingCourse) {
        return;
      }

      this.creatingCourse = true;

      try {
        // ایجاد دوره جدید
        const courseData = {
          title: this.courseForm.title,
          description: this.courseForm.description
        };

        const newCourse = await this.$store.dispatch('courses/createCourse', courseData);

        // اضافه کردن اطلاعات اضافی (برای دوره جدید که هنوز دانش‌آموزی ندارد)
        const courseWithExtras = {
          ...newCourse,
          status: 'draft',
          progress: 0,
          studentsTrend: 0,
          enrolledStudents: [],
          lessons: []
        };

        // اضافه کردن به لیست دوره‌ها
        this.coursesData.unshift(courseWithExtras);

        // بروزرسانی آمارها
        this.calculateStats();

        this.$toast.success('دوره جدید با موفقیت ایجاد شد');

        // بستن مودال
        const modal = bootstrap.Modal.getInstance(document.getElementById('createCourseModal'));
        modal.hide();

        // هدایت به صفحه جزئیات دوره
        this.$router.push(`/courses/${newCourse.id}`);
      } catch (error) {
        console.error('Error creating course:', error);
        this.$toast.error('خطا در ایجاد دوره جدید');
      } finally {
        this.creatingCourse = false;
      }
    },

    navigateToCourseAnalytics(courseId) {
      // هدایت به صفحه تحلیل آماری دوره
      this.$router.push(`/analytics?courseId=${courseId}`);
    },

    navigateToCourseSettings(courseId) {
      // هدایت به صفحه تنظیمات دوره
      this.$router.push(`/courses/${courseId}?tab=manage`);
    }
  }
}
</script>

<style scoped>
.teaching-courses-container {
  min-height: calc(100vh - 56px);
}

.stats-card {
  background-color: #fff;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  text-align: center;
  height: 100%;
  transition: transform 0.3s, box-shadow 0.3s;
}

.stats-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.stats-icon {
  font-size: 2rem;
  margin-bottom: 10px;
  color: #007bff;
}

.stats-value {
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
}

.stats-label {
  color: #6c757d;
  font-size: 0.9rem;
}

.course-filters {
  background-color: #f8f9fa;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
}

.teaching-courses-table {
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
}

.course-image {
  width: 50px;
  height: 50px;
  border-radius: 5px;
  overflow: hidden;
}

.course-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.course-title {
  font-weight: 600;
  color: #2c3e50;
}

.course-description {
  font-size: 0.85rem;
  color: #6c757d;
  margin-top: 2px;
}

.students-trend {
  font-size: 0.85rem;
  margin-left: 8px;
}
</style>