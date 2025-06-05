<template>
  <div class="modern-page-bg" style="min-height: calc(100vh - 56px); padding: 2rem 1rem;">
    <div class="container-fluid">
      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="text-white mb-2">
            <i class="fas fa-chalkboard-teacher me-3"></i>
            دوره‌های در حال تدریس من
          </h2>
          <p class="text-white-50 mb-0">مدیریت و نظارت بر دوره‌های آموزشی شما</p>
        </div>

        <button class="modern-btn modern-btn-success" @click="showCreateCourseModal">
          <i class="fas fa-plus me-2"></i>
          ایجاد دوره جدید
        </button>
      </div>

      <loading-spinner :loading="loading">
        <!-- Stats Cards -->
        <div class="row mb-4">
          <div class="col-lg-3 col-md-6 mb-3">
            <div class="modern-stat-card animate-slide-up">
              <div class="modern-stat-icon text-primary">
                <i class="fas fa-chalkboard-teacher"></i>
              </div>
              <div class="modern-stat-value">{{ coursesStats.totalCourses }}</div>
              <div class="modern-stat-label">کل دوره‌ها</div>
            </div>
          </div>

          <div class="col-lg-3 col-md-6 mb-3">
            <div class="modern-stat-card animate-slide-up" style="animation-delay: 0.1s;">
              <div class="modern-stat-icon text-success">
                <i class="fas fa-users"></i>
              </div>
              <div class="modern-stat-value">{{ coursesStats.totalStudents }}</div>
              <div class="modern-stat-label">کل دانش‌آموزان</div>
            </div>
          </div>

          <div class="col-lg-3 col-md-6 mb-3">
            <div class="modern-stat-card animate-slide-up" style="animation-delay: 0.2s;">
              <div class="modern-stat-icon text-warning">
                <i class="fas fa-book"></i>
              </div>
              <div class="modern-stat-value">{{ coursesStats.totalLessons }}</div>
              <div class="modern-stat-label">کل دروس</div>
            </div>
          </div>

          <div class="col-lg-3 col-md-6 mb-3">
            <div class="modern-stat-card animate-slide-up" style="animation-delay: 0.3s;">
              <div class="modern-stat-icon text-info">
                <i class="fas fa-chart-line"></i>
              </div>
              <div class="modern-stat-value">{{ coursesStats.averageProgress }}%</div>
              <div class="modern-stat-label">میانگین پیشرفت</div>
            </div>
          </div>
        </div>

        <!-- Filters -->
        <div class="modern-card mb-4 animate-slide-up" style="animation-delay: 0.4s;">
          <div class="row g-3">
            <div class="col-md-4">
              <div class="modern-form-group">
                <label class="modern-form-label">جستجو در دوره‌ها</label>
                <input
                    type="text"
                    class="modern-form-control"
                    v-model="searchQuery"
                    placeholder="نام دوره را وارد کنید..."
                    @input="filterCourses"
                >
              </div>
            </div>

            <div class="col-md-4">
              <div class="modern-form-group">
                <label class="modern-form-label">مرتب‌سازی بر اساس</label>
                <select v-model="sortBy" class="modern-form-control" @change="sortCourses">
                  <option value="title">نام دوره</option>
                  <option value="students">تعداد دانش‌آموزان</option>
                  <option value="progress">میزان پیشرفت</option>
                </select>
              </div>
            </div>

            <div class="col-md-4">
              <div class="modern-form-group">
                <label class="modern-form-label">فیلتر وضعیت</label>
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
        </div>

        <!-- Courses Table -->
        <div v-if="filteredCourses.length > 0" class="modern-card animate-slide-up" style="animation-delay: 0.5s;">
          <div class="modern-table-container">
            <table class="modern-table table">
              <thead>
              <tr>
                <th><i class="fas fa-hashtag me-1"></i> #</th>
                <th><i class="fas fa-book me-1"></i> نام دوره</th>
                <th><i class="fas fa-users me-1"></i> دانش‌آموزان</th>
                <th><i class="fas fa-list me-1"></i> دروس</th>
                <th><i class="fas fa-chart-line me-1"></i> پیشرفت</th>
                <th><i class="fas fa-info-circle me-1"></i> وضعیت</th>
                <th><i class="fas fa-cogs me-1"></i> عملیات</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="(course, index) in filteredCourses" :key="course.id">
                <td>{{ index + 1 }}</td>
                <td>
                  <div class="d-flex align-items-center">
                    <div class="course-avatar me-3">
                      {{ getCourseInitials(course.title) }}
                    </div>
                    <div>
                      <div class="fw-bold">{{ course.title }}</div>
                      <small class="text-muted">{{ truncateText(course.description, 60) }}</small>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="d-flex align-items-center">
                    <span class="modern-badge modern-badge-primary">{{ getStudentCount(course) }}</span>
                    <div v-if="course.studentsTrend !== 0" class="students-trend ms-2">
                      <i
                          class="fas"
                          :class="getStudentsTrendIcon(course.studentsTrend)"
                          :style="`color: ${getStudentsTrendColor(course.studentsTrend)}`"
                      ></i>
                      <span class="small">{{ Math.abs(course.studentsTrend) }}%</span>
                    </div>
                  </div>
                </td>
                <td>
                  <span class="modern-badge modern-badge-secondary">{{ getLessonCount(course) }}</span>
                </td>
                <td>
                  <div class="progress" style="height: 8px;">
                    <div
                        class="progress-bar"
                        :class="getProgressBarClass(getCourseProgress(course))"
                        role="progressbar"
                        :style="`width: ${getCourseProgress(course)}%`"
                        :aria-valuenow="getCourseProgress(course)"
                        aria-valuemin="0"
                        aria-valuemax="100"
                    ></div>
                  </div>
                  <small class="text-muted">{{ getCourseProgress(course) }}%</small>
                </td>
                <td>
                  <span class="modern-badge" :class="getStatusBadgeClass(course.status)">
                    {{ getStatusText(course.status) }}
                  </span>
                </td>
                <td>
                  <div class="d-flex gap-1">
                    <router-link
                        :to="`/courses/${course.id}`"
                        class="modern-btn modern-btn-primary btn-sm"
                        title="مشاهده"
                    >
                      <i class="fas fa-eye"></i>
                    </router-link>

                    <button
                        class="modern-btn modern-btn-success btn-sm"
                        @click="navigateToCourseAnalytics(course.id)"
                        title="تحلیل آماری"
                    >
                      <i class="fas fa-chart-bar"></i>
                    </button>

                    <button
                        class="modern-btn modern-btn-secondary btn-sm"
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

        <!-- Empty State -->
        <div v-else class="modern-card text-center animate-slide-up" style="animation-delay: 0.5s;">
          <div class="py-5">
            <div class="modern-logo large secondary mb-4">
              <i class="fas fa-chalkboard-teacher"></i>
            </div>
            <h4 class="text-warning mb-3">هیچ دوره‌ای یافت نشد</h4>
            <p class="text-muted mb-4">
              شما هنوز هیچ دوره‌ای برای تدریس ندارید یا نتیجه‌ای با جستجوی شما مطابقت ندارد
            </p>
            <button class="modern-btn modern-btn-primary" @click="showCreateCourseModal">
              <i class="fas fa-plus me-2"></i>
              ایجاد دوره جدید
            </button>
          </div>
        </div>
      </loading-spinner>
    </div>

    <!-- Create Course Modal -->
    <div class="modal fade" id="createCourseModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="fas fa-plus me-2"></i>
              ایجاد دوره جدید
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="modern-form-group">
              <label for="courseTitle" class="modern-form-label">عنوان دوره</label>
              <input
                  type="text"
                  id="courseTitle"
                  class="modern-form-control"
                  v-model="courseForm.title"
                  placeholder="عنوان دوره را وارد کنید"
                  required
              >
            </div>

            <div class="modern-form-group">
              <label for="courseDescription" class="modern-form-label">توضیحات دوره</label>
              <textarea
                  id="courseDescription"
                  class="modern-form-control"
                  v-model="courseForm.description"
                  rows="4"
                  placeholder="توضیحات دوره را وارد کنید"
              ></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="modern-btn modern-btn-secondary" data-bs-dismiss="modal">
              انصراف
            </button>
            <button
                type="button"
                class="modern-btn modern-btn-success"
                @click="createCourse"
                :disabled="creatingCourse"
            >
              <span v-if="creatingCourse" class="spinner-border spinner-border-sm me-2"></span>
              <i class="fas fa-save me-1"></i>
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
import Pagination from '@/components/common/Pagination.vue';
import { useFormatters } from '@/composables/useFormatters.js';

export default {
  name: 'TeachingCourses',
  components: {
    LoadingSpinner,
    Pagination
  },
  setup() {
    const { formatDate, truncateText } = useFormatters();
    return { formatDate, truncateText };
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

      const startIndex = (this.currentPage - 1) * this.coursesPerPage;
      const endIndex = startIndex + this.coursesPerPage;
      return filtered.slice(startIndex, endIndex);
    },
    totalPages() {
      if (!this.coursesData.length) return 1;

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
      this.$toast.error('خطا در دریافت لیست دوره‌های در حال تدریس');
    } finally {
      this.loading = false;
    }
  },
  methods: {
    async fetchCourses() {
      try {
        await this.$store.dispatch('courses/fetchTeachingCourses');

        const coursesWithDetails = await Promise.all(
            this.teachingCourses.map(async (course) => {
              try {
                const courseDetailResponse = await this.$http.get(`/courses/${course.id}`);
                const courseDetail = courseDetailResponse.data.course;

                let courseStats = null;
                try {
                  const statsResponse = await this.$http.get(`/analytics/teacher/course/${course.id}/performance`);
                  courseStats = statsResponse.data;
                } catch (statsError) {
                  console.warn(`Could not fetch stats for course ${course.id}:`, statsError);
                  courseStats = {
                    averageProgress: 0,
                    studentGrowth: 0
                  };
                }

                return {
                  ...course,
                  enrolledStudents: courseDetail.enrolledStudents || [],
                  lessons: courseDetail.lessons || [],
                  status: 'active',
                  progress: courseStats.averageProgress || 0,
                  studentsTrend: courseStats.studentGrowth || 0,
                };
              } catch (error) {
                console.error(`Error fetching details for course ${course.id}:`, error);
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
        this.sortCourses();
      } catch (error) {
        throw error;
      }
    },

    calculateStats() {
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

      const allStudents = new Set();
      this.coursesData.forEach(course => {
        if (course.enrolledStudents) {
          course.enrolledStudents.forEach(student => {
            allStudents.add(student.id);
          });
        }
      });
      const totalStudents = allStudents.size;

      let totalLessons = 0;
      this.coursesData.forEach(course => {
        totalLessons += course.lessons ? course.lessons.length : 0;
      });

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

    getCourseInitials(title) {
      return title.split(' ').map(word => word.charAt(0)).join('').substring(0, 2).toUpperCase();
    },

    getStudentCount(course) {
      return course.enrolledStudents ? course.enrolledStudents.length : 0;
    },

    getLessonCount(course) {
      return course.lessons ? course.lessons.length : 0;
    },

    getCourseProgress(course) {
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
        case 'active': return 'modern-badge-success';
        case 'draft': return 'modern-badge-secondary';
        case 'completed': return 'modern-badge-info';
        case 'pending': return 'modern-badge-warning';
        default: return 'modern-badge-secondary';
      }
    },

    getStatusText(status) {
      switch (status) {
        case 'active': return 'فعال';
        case 'draft': return 'پیش‌نویس';
        case 'completed': return 'تکمیل شده';
        case 'pending': return 'در انتظار';
        default: return 'نامشخص';
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
      this.currentPage = 1;
    },

    changePage(page) {
      this.currentPage = page;
    },

    showCreateCourseModal() {
      this.courseForm = {
        title: '',
        description: ''
      };

      const modal = new bootstrap.Modal(document.getElementById('createCourseModal'));
      modal.show();
    },

    async createCourse() {
      if (!this.courseForm.title.trim() || this.creatingCourse) {
        return;
      }

      this.creatingCourse = true;

      try {
        const courseData = {
          title: this.courseForm.title,
          description: this.courseForm.description
        };

        const newCourse = await this.$store.dispatch('courses/createCourse', courseData);

        const courseWithExtras = {
          ...newCourse,
          status: 'draft',
          progress: 0,
          studentsTrend: 0,
          enrolledStudents: [],
          lessons: []
        };

        this.coursesData.unshift(courseWithExtras);
        this.calculateStats();

        this.$toast.success('دوره جدید با موفقیت ایجاد شد');

        const modal = bootstrap.Modal.getInstance(document.getElementById('createCourseModal'));
        modal.hide();

        this.$router.push(`/courses/${newCourse.id}`);
      } catch (error) {
        console.error('Error creating course:', error);
        this.$toast.error('خطا در ایجاد دوره جدید');
      } finally {
        this.creatingCourse = false;
      }
    },

    navigateToCourseAnalytics(courseId) {
      this.$router.push(`/analytics?courseId=${courseId}`);
    },

    navigateToCourseSettings(courseId) {
      this.$router.push(`/courses/${courseId}?tab=manage`);
    }
  }
}
</script>

<style scoped>
.course-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.9rem;
}

.students-trend {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.8rem;
}

/* Responsive */
@media (max-width: 768px) {
  .modern-page-bg {
    padding: 1rem 0.5rem;
  }

  .d-flex.gap-1 {
    flex-direction: column;
    gap: 0.25rem !important;
  }

  .btn-sm {
    width: 100%;
  }
}
</style>