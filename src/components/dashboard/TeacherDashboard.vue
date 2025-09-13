<template>
  <div class="modern-container large animate-slide-up">
    <!-- Header -->
    <div class="modern-header text-center mb-4">
      <div class="modern-logo large primary">
        <i class="fas fa-chalkboard-teacher"></i>
      </div>
      <h2 class="modern-title">داشبورد معلم</h2>
      <p class="modern-subtitle"> خوش آمدید  {{ getUserName() }} </p>

      <div class="header-actions mt-3">
        <button class="modern-btn modern-btn-success me-2" @click="showCreateCourseModal">
          <i class="fas fa-plus me-1"></i> ایجاد دوره جدید
        </button>
        <button class="modern-btn modern-btn-outline" @click="refreshData">
          <i class="fas fa-sync-alt me-1"></i> بروزرسانی
        </button>
      </div>
    </div>

    <!-- خلاصه وضعیت -->
    <div class="row mb-4">
      <div class="col-md-3 col-sm-6 mb-3">
        <div class="modern-stat-card animate-slide-up">
          <div class="modern-stat-icon text-primary">
            <i class="fas fa-check-circle"></i>
          </div>
          <div class="modern-stat-value">{{ stats.completionRate }}%</div>
          <div class="modern-stat-label">نرخ تکمیل</div>
        </div>
      </div>
      <div class="col-md-3 col-sm-6 mb-3">
        <div class="modern-stat-card animate-slide-up" style="animation-delay: 0.1s;">
          <div class="modern-stat-icon text-warning">
            <i class="fas fa-clock"></i>
          </div>
          <div class="modern-stat-value">{{ formatStudyTime(stats.averageTimeSpent) }}</div>
          <div class="modern-stat-label">میانگین زمان مطالعه</div>
        </div>
      </div>
      <div class="col-md-3 col-sm-6 mb-3">
        <div class="modern-stat-card animate-slide-up" style="animation-delay: 0.2s;">
          <div class="modern-stat-icon text-success">
            <i class="fas fa-chart-line"></i>
          </div>
          <div class="modern-stat-value">{{ stats.averageProgress }}%</div>
          <div class="modern-stat-label">میانگین پیشرفت</div>
        </div>
      </div>
      <div class="col-md-3 col-sm-6 mb-3">
        <div class="modern-stat-card animate-slide-up" style="animation-delay: 0.3s;">
          <div class="modern-stat-icon text-info">
            <i class="fas fa-user-graduate"></i>
          </div>
          <div class="modern-stat-value">{{ stats.totalStudents }}</div>
          <div class="modern-stat-label">تعداد دانش‌آموزان</div>
        </div>
      </div>
    </div>

    <!-- دوره‌های در حال تدریس -->
    <div class="modern-card mb-4">
      <div class="modern-card-header bg-gray text-dark d-flex justify-content-between align-items-center">
        <h5 class="mb-0">
          <i class="fas fa-chalkboard-teacher me-2"></i>
          دوره‌های من
        </h5>
        <router-link :to="{ name: 'TeachingCourses' }" class="modern-btn modern-btn-outline text-gray btn-sm">
          مشاهده همه
        </router-link>
      </div>

      <div class="modern-card-body">
        <loading-spinner :loading="loadingCourses">
          <template v-if="courses.length === 0">
            <div class="text-center py-5">
              <div class="modern-logo large secondary mb-4">
                <i class="fas fa-book"></i>
              </div>
              <h5 class="text-muted mb-3">شما هنوز دوره‌ای ایجاد نکرده‌اید</h5>
              <button class="modern-btn modern-btn-primary" @click="showCreateCourseModal">
                <i class="fas fa-plus me-1"></i>
                ایجاد دوره جدید
              </button>
            </div>
          </template>

          <template v-else>
            <div class="row">
              <div v-for="course in courses.slice(0, 3)" :key="course.id" class="col-md-4 mb-3">
                <div class="modern-card h-100 course-card">
                  <div class="modern-card-header bg-gray text-dark">
                    <h6 class="mb-0">{{ course.title }}</h6>
                  </div>
                  <div class="modern-card-body d-flex flex-column">
                    <p v-if="course.description" class="mb-3 text-dark">
                      {{ truncateText(course.description, 100) }}
                    </p>

                    <div class="course-stats mb-3 mt-auto text-dark">
                      <div class="d-flex justify-content-between mb-2">
                        <span>دانش‌آموزان:</span>
                        <span class="fw-bold text-success">
                          {{ course.enrolledStudents ? course.enrolledStudents.length : 0 }}
                        </span>
                      </div>
                      <div class="d-flex justify-content-between">
                        <span>دروس:</span>
                        <span class="fw-bold text-info">
                          {{ course.lessons ? course.lessons.length : 0 }}
                        </span>
                      </div>
                    </div>

                    <router-link :to="{ name: 'CourseDetail', params: { id: course.id } }"
                                 class="modern-btn modern-btn-primary mt-auto">
                      <i class="fas fa-cog me-1"></i>
                      مدیریت دوره
                    </router-link>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </loading-spinner>
      </div>
    </div>

    <!-- فعالیت‌های اخیر -->
<!--    <div class="modern-card">-->
<!--      <div class="modern-card-header">-->
<!--        <h5 class="mb-0">-->
<!--          <i class="fas fa-history text-info me-2"></i>-->
<!--          فعالیت‌های اخیر دانش‌آموزان-->
<!--        </h5>-->
<!--      </div>-->
<!--      <div class="modern-card-body">-->
<!--        <loading-spinner :loading="loadingStudentActivities">-->
<!--          <template v-if="studentActivities.length === 0">-->
<!--            <div class="text-center py-4">-->
<!--              <div class="modern-logo large secondary mb-3">-->
<!--                <i class="fas fa-user-graduate"></i>-->
<!--              </div>-->
<!--              <h6 class="text-muted">فعالیت اخیری وجود ندارد</h6>-->
<!--            </div>-->
<!--          </template>-->

<!--          <template v-else>-->
<!--            <student-activity-table-->
<!--                :students="studentActivities"-->
<!--                @view-progress="viewStudentProgress"-->
<!--                @send-message="sendMessageToStudent" />-->
<!--          </template>-->
<!--        </loading-spinner>-->
<!--      </div>-->
<!--    </div>-->
  </div>

  <!-- مودال ایجاد دوره جدید -->
  <div class="modal fade" id="createCourseModal" tabindex="-1" v-if="showCreateCourse">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header bg-primary text-dark">
          <h5 class="modal-title">ایجاد دوره جدید</h5>
          <button type="button" class="btn-close btn-close-white" @click="hideCreateCourseModal"></button>
        </div>
        <form @submit.prevent="createCourse">
          <div class="modal-body">
            <div class="modern-form-group">
              <label for="courseTitle" class="modern-form-label">عنوان دوره</label>
              <input type="text" class="modern-form-control" id="courseTitle"
                     v-model="newCourse.title" required>
            </div>
            <div class="modern-form-group">
              <label for="courseDescription" class="modern-form-label">توضیحات دوره</label>
              <textarea class="modern-form-control" id="courseDescription"
                        v-model="newCourse.description" rows="4"></textarea>
            </div>
            <div class="modern-alert modern-alert-info">
              <i class="fas fa-info-circle me-2"></i>
              پس از ایجاد دوره، می‌توانید دروس و محتوای آن را اضافه کنید.
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="modern-btn modern-btn-secondary" @click="hideCreateCourseModal">
              انصراف
            </button>
            <button type="submit" class="modern-btn modern-btn-primary" :disabled="isSubmitting">
              <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2"></span>
              <i class="fas fa-plus me-1"></i>
              ایجاد دوره
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import StudentActivityTable from '@/components/dashboard/StudentActivityTable.vue';
import { useFormatters } from '@/composables/useFormatters.js';
import { getCurrentInstance } from 'vue';
import axios from 'axios';

export default {
  name: 'TeacherDashboard',
  components: {
    LoadingSpinner,
    StudentActivityTable
  },
  props: {
    user: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    const { truncateText } = useFormatters();
    const { proxy } = getCurrentInstance();
    // State
    const loadingCourses = ref(true);
    const loadingStudentActivities = ref(false);
    const isSubmitting = ref(false);
    const showCreateCourse = ref(false);

    const courses = ref([]);
    const studentActivities = ref([]);

    const stats = reactive({
      totalCourses: 0,
      totalStudents: 0,
      activeAssignments: 0,
      averageProgress: 0,
      averageTimeSpent: 0,
      completionRate: 0
    });

    const newCourse = reactive({
      title: '',
      description: ''
    });

    // Methods
    const fetchData = async () => {
      try {
        await Promise.all([
          fetchCourses(),
          fetchAnalyticsStats()
        ]);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    const fetchCourses = async () => {
      loadingCourses.value = true;
      try {
        const response = await axios.get('/courses/teaching');
        courses.value = response.data;
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        loadingCourses.value = false;
      }
    };

    const fetchAnalyticsStats = async () => {
      try {
        // Fetch system overview stats
        const systemOverviewResponse = await axios.get('/analytics/teacher/system-overview');
        const systemOverview = systemOverviewResponse.data;
        
        // Fetch students progress overview  
        const progressOverviewResponse = await axios.get('/analytics/teacher/students-progress');
        const progressOverview = progressOverviewResponse.data;

        // Update stats with real analytics data and proper validation
        stats.totalCourses = courses.value.length;
        stats.totalStudents = systemOverview.totalStudents || 0;

        // Use consistent progress calculation with validation
        const progressCompletion = progressOverview.averageCompletion || 0;
        stats.averageProgress = Math.min(Math.round(progressCompletion), 100); // Cap at 100%
        stats.completionRate = Math.min(Math.round(systemOverview.averageCompletion || 0), 100); // Cap at 100%

        // Validate study time (should be in seconds)
        const timePerStudent = systemOverview.avgTimePerStudent || 0;
        stats.averageTimeSpent = Math.max(timePerStudent, 0); // Ensure non-negative

        stats.activeAssignments = systemOverview.activeAssignments || 0;
        
      } catch (error) {
        console.error('Error fetching analytics stats:', error);
        // Fallback to basic calculation if analytics API fails
        calculateBasicStats();
      }
    };

    const calculateBasicStats = () => {
      stats.totalCourses = courses.value.length;

      const uniqueStudents = new Set();
      courses.value.forEach(course => {
        if (course.enrolledStudents) {
          course.enrolledStudents.forEach(student => {
            uniqueStudents.add(student.id);
          });
        }
      });
      stats.totalStudents = uniqueStudents.size;
      stats.activeAssignments = 0;
      stats.averageProgress = 0;
      stats.averageTimeSpent = 0;
      stats.completionRate = 0;
    };

    const getUserName = () => {
      return props.user.firstName && props.user.lastName
          ? `${props.user.firstName} ${props.user.lastName}`
          : props.user.username;
    };

    const showCreateCourseModal = () => {
      showCreateCourse.value = true;
      // Bootstrap modal show
      setTimeout(() => {
        const modal = new window.bootstrap.Modal(document.getElementById('createCourseModal'));
        modal.show();
      }, 100);
    };

    const hideCreateCourseModal = () => {
      showCreateCourse.value = false;
      document.querySelector('.modal-backdrop')?.remove();
      document.body.style.overflow = '';

    };

    const createCourse = async () => {
      isSubmitting.value = true;
      try {
        await axios.post('/courses', newCourse);
        proxy.$toast.success('دوره جدید با موفقیت ایجاد شد.');
        hideCreateCourseModal();

        // Reset form
        newCourse.title = '';
        newCourse.description = '';

        // Refresh courses and stats
        await fetchCourses();
        await fetchAnalyticsStats();
      } catch (error) {
        console.error('Error creating course:', error);
        proxy.$toast.error('خطا در ایجاد دوره. لطفاً دوباره تلاش کنید.');
      } finally {
        isSubmitting.value = false;
      }
    };

    const viewStudentProgress = (student) => {
      console.log('View progress:', student);
    };

    const sendMessageToStudent = (student) => {
      console.log('Send message to:', student);
    };

    const refreshData = async () => {
      await fetchData();
    };

    const formatStudyTime = (seconds) => {
      // Handle invalid or null values
      if (!seconds || isNaN(seconds) || seconds < 0) {
        return '0 دقیقه';
      }

      // Round to avoid floating point issues
      const totalSeconds = Math.round(seconds);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);

      if (hours > 0) {
        const hoursText = `${hours} ساعت`;
        const minutesText = minutes > 0 ? ` ${minutes} دقیقه` : '';
        return hoursText + minutesText;
      } else if (minutes > 0) {
        return `${minutes} دقیقه`;
      } else {
        return '۱ دقیقه کمتر'; // Show "less than 1 minute" for very small values
      }
    };

    // Lifecycle
    onMounted(() => {
      fetchData();
    });

    return {
      loadingCourses,
      loadingStudentActivities,
      isSubmitting,
      showCreateCourse,
      courses,
      studentActivities,
      stats,
      newCourse,
      truncateText,
      getUserName,
      showCreateCourseModal,
      hideCreateCourseModal,
      createCourse,
      viewStudentProgress,
      sendMessageToStudent,
      refreshData,
      formatStudyTime
    };
  }
}
</script>

<style scoped>
.course-card {
  transition: transform 0.3s ease;
}

.course-card:hover {
  transform: translateY(-5px);
}

.course-stats {
  background: rgba(102, 126, 234, 0.05);
  border-radius: 8px;
  padding: 1rem;
  border: 1px solid rgba(102, 126, 234, 0.1);
}

.header-actions {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}

/* Modal styles */
.modal-content {
  border-radius: 12px;
  border: none;
}

.modal-header {
  border-radius: 12px 12px 0 0;
}

/* Responsive */
@media (max-width: 768px) {
  .modern-container.large {
    margin: 0 0.5rem;
  }

  .header-actions {
    flex-direction: column;
    align-items: center;
  }

  .header-actions .modern-btn {
    width: 100%;
    max-width: 250px;
  }
}
</style>