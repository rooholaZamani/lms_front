<template>
  <div class="modern-page-bg primary-gradient">
    <div class="modern-container large animate-slide-up">
      <div class="modern-header">
        <div class="modern-logo primary">
          <i class="fas fa-user-graduate"></i>
        </div>
        <h1 class="modern-title">فعالیت دانش‌آموزان</h1>
        <p class="modern-subtitle">پیگیری و مشاهده فعالیت‌های دانش‌آموزان</p>
      </div>

      <!-- Statistics Cards -->
      <div class="row mb-4">
        <div class="col-md-4 mb-3">
          <div class="modern-stat-card animate-slide-up">
            <div class="modern-stat-icon text-primary">
              <i class="fas fa-users"></i>
            </div>
            <div class="modern-stat-value">{{ stats.totalStudents }}</div>
            <div class="modern-stat-label">کل دانش‌آموزان</div>
          </div>
        </div>
        <div class="col-md-4 mb-3">
          <div class="modern-stat-card animate-slide-up" style="animation-delay: 0.1s;">
            <div class="modern-stat-icon text-success">
              <i class="fas fa-user-check"></i>
            </div>
            <div class="modern-stat-value">{{ stats.activeStudents }}</div>
            <div class="modern-stat-label">دانش‌آموزان فعال</div>
          </div>
        </div>
        <div class="col-md-4 mb-3">
          <div class="modern-stat-card animate-slide-up" style="animation-delay: 0.2s;">
            <div class="modern-stat-icon text-info">
              <i class="fas fa-chart-line"></i>
            </div>
            <div class="modern-stat-value">{{ stats.averageProgress }}%</div>
            <div class="modern-stat-label">میانگین پیشرفت</div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="modern-card animate-slide-up" style="animation-delay: 0.3s;">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h5 class="modern-title mb-0">
            <i class="fas fa-list text-primary me-2"></i>
            فعالیت دانش‌آموزان
          </h5>
          <div class="d-flex gap-2">
            <select class="modern-form-control" v-model="selectedCourse" @change="fetchStudentActivities" style="min-width: 200px;">
              <option value="">همه دوره‌ها</option>
              <option v-for="course in courses" :key="course.id" :value="course.id">
                {{ course.title }}
              </option>
            </select>
            <button class="modern-btn modern-btn-outline text-white" @click="refreshData">
              <i class="fas fa-sync-alt me-1"></i> بروزرسانی
            </button>
          </div>
        </div>

        <loading-spinner :loading="loading">
          <div v-if="students.length === 0" class="text-center py-5">
            <div class="modern-logo large secondary mb-4">
              <i class="fas fa-user-graduate"></i>
            </div>
            <h5>دانش‌آموزی یافت نشد</h5>
            <p class="text-muted">در حال حاضر دانش‌آموزی در دوره‌های شما ثبت‌نام نکرده است.</p>
          </div>
          <div v-else class="modern-table-container">
            <table class="modern-table table">
              <thead>
              <tr>
                <th>#</th>
                <th>دانش‌آموز</th>
                <th>دوره</th>
                <th>پیشرفت</th>
                <th>آخرین فعالیت</th>
                <th>وضعیت</th>
                <th>عملیات</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="(student, index) in students" :key="student.id">
                <td>{{ index + 1 }}</td>
                <td>
                  <div class="d-flex align-items-center">
                    <div class="student-avatar me-2">
                      <span>{{ getInitials(student) }}</span>
                    </div>
                    <div>
                      <strong>{{ getStudentName(student) }}</strong>
                      <div class="small text-muted">{{ student.email }}</div>
                    </div>
                  </div>
                </td>
                <td>{{ student.course?.title || 'نامشخص' }}</td>
                <td>
                  <div class="progress-container">
                    <div class="progress mb-1">
                      <div
                          class="progress-bar"
                          :class="getProgressClass(student.progress)"
                          :style="`width: ${student.progress || 0}%`">
                      </div>
                    </div>
                    <small class="text-muted">{{ student.progress || 0 }}%</small>
                  </div>
                </td>
                <td>{{ formatDate(student.lastActivity) }}</td>
                <td>
                    <span class="modern-badge" :class="getStatusBadge(student.status)">
                      {{ getStatusText(student.status) }}
                    </span>
                </td>
                <td>
                  <button
                      class="modern-btn modern-btn-primary modern-btn-sm me-1"
                      @click="viewProgress(student)"
                      title="مشاهده پیشرفت">
                    <i class="fas fa-chart-line"></i>
                  </button>
                  <button
                      class="modern-btn modern-btn-info modern-btn-sm"
                      @click="sendMessage(student)"
                      title="ارسال پیام">
                    <i class="fas fa-envelope"></i>
                  </button>
                </td>
              </tr>
              </tbody>
            </table>
          </div>
        </loading-spinner>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useFormatters } from '@/composables/useFormatters.js';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import axios from 'axios';

export default {
  name: 'StudentActivities',
  components: {
    LoadingSpinner
  },
  setup() {
    const { formatDate } = useFormatters();
    const loading = ref(true);
    const students = ref([]);
    const courses = ref([]);
    const selectedCourse = ref('');
    const stats = ref({
      totalStudents: 0,
      activeStudents: 0,
      averageProgress: 0
    });

    const fetchCourses = async () => {
      try {
        const response = await axios.get('/courses/teaching');
        courses.value = response.data || [];

        if (courses.value.length > 0 && !selectedCourse.value) {
          await fetchStudentActivities();
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
        window.showError(error);
      }
    };

    const fetchStudentActivities = async () => {
      if (!selectedCourse.value) {
        try {
          const coursesData = await Promise.all(
              courses.value.map(async (course) => {
                try {
                  const participationResponse = await axios.get(`/analytics/teacher/course/${course.id}/participation`);
                  return {
                    course,
                    students: participationResponse.data || []
                  };
                } catch (error) {
                  console.error(`Error fetching participation for course ${course.id}:`, error);
                  return { course, students: [] };
                }
              })
          );

          const allStudents = coursesData.flatMap(courseData =>
              courseData.students.map(student => ({
                ...student,
                course: courseData.course
              }))
          );

          students.value = allStudents;

          stats.value = {
            totalStudents: allStudents.length,
            activeStudents: allStudents.filter(s => s.status === 'active').length,
            averageProgress: allStudents.length > 0
                ? Math.round(allStudents.reduce((sum, s) => sum + (s.progress || 0), 0) / allStudents.length)
                : 0
          };
        } catch (error) {
          console.error('Error fetching all student activities:', error);
          window.showError(error);
        }
      } else {
        loading.value = true;
        try {
          const participationResponse = await axios.get(`/analytics/teacher/course/${selectedCourse.value}/participation`);
          const participationData = participationResponse.data || [];

          const courseResponse = await axios.get(`/courses/${selectedCourse.value}`);
          const courseDetails = courseResponse.data;

          students.value = participationData.map(student => ({
            ...student,
            course: courseDetails.course || {}
          }));

          stats.value = {
            totalStudents: participationData.length,
            activeStudents: participationData.filter(s => s.status === 'active').length,
            averageProgress: participationData.length > 0
                ? Math.round(participationData.reduce((sum, s) => sum + (s.progress || 0), 0) / participationData.length)
                : 0
          };
        } catch (error) {
          console.error('Error fetching student activities:', error);
          window.showError(error);
        } finally {
          loading.value = false;
        }
      }
    };

    const refreshData = () => {
      fetchStudentActivities();
    };

    const getStudentName = (student) => {
      if (!student) return 'نامشخص';
      return student.firstName && student.lastName
          ? `${student.firstName} ${student.lastName}`
          : student.username;
    };

    const getInitials = (student) => {
      if (!student) return 'N/A';
      const firstName = student.firstName || '';
      const lastName = student.lastName || '';
      const firstInitial = firstName ? firstName.charAt(0) : '';
      const lastInitial = lastName ? lastName.charAt(0) : '';
      return (firstInitial + lastInitial).toUpperCase();
    };

    const getProgressClass = (progress) => {
      const progressValue = progress || 0;
      if (progressValue >= 75) return 'bg-success';
      if (progressValue >= 50) return 'bg-info';
      if (progressValue >= 25) return 'bg-warning';
      return 'bg-danger';
    };

    const getStatusBadge = (status) => {
      const badges = {
        active: 'modern-badge-success',
        inactive: 'modern-badge-secondary',
        struggling: 'modern-badge-warning',
        excellent: 'modern-badge-primary'
      };
      return badges[status] || 'modern-badge-secondary';
    };

    const getStatusText = (status) => {
      const texts = {
        active: 'فعال',
        inactive: 'غیرفعال',
        struggling: 'نیاز به کمک',
        excellent: 'عالی'
      };
      return texts[status] || 'نامشخص';
    };

    const viewProgress = async (student) => {
      if (!student.course?.id) {
        alert('اطلاعات دوره یافت نشد.');
        return;
      }

      try {
        const message = `پیشرفت ${getStudentName(student)} در دوره ${student.course.title}:

پیشرفت کلی: ${student.progress || 0}%
آخرین فعالیت: ${formatDate(student.lastActivity)}
وضعیت: ${getStatusText(student.status)}

برای مشاهده جزئیات بیشتر، صفحه اختصاصی پیشرفت دانش‌آموز ایجاد کنید.`;

        alert(message);
      } catch (error) {
        console.error('Error viewing progress:', error);
        window.showError(error);
      }
    };

    const sendMessage = async (student) => {
      if (!student.course?.id) {
        alert('اطلاعات دوره یافت نشد.');
        return;
      }

      const message = prompt(`پیام برای ${getStudentName(student)}:`);
      if (!message) return;

      try {
        await axios.post(`/chat/course/${student.course.id}/send`, null, {
          params: {
            message: `@${student.username} ${message}`
          }
        });

        window.toast.success('پیام با موفقیت ارسال شد.');
      } catch (error) {
        console.error('Error sending message:', error);
        window.showError(error);
      }
    };

    onMounted(() => {
      fetchCourses();
      fetchStudentActivities();
    });

    return {
      loading,
      students,
      courses,
      selectedCourse,
      stats,
      refreshData,
      fetchStudentActivities,
      getStudentName,
      getInitials,
      getProgressClass,
      getStatusBadge,
      getStatusText,
      viewProgress,
      sendMessage,
      formatDate
    };
  }
}
</script>

<style scoped>
.student-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: bold;
  color: white;
}

.progress-container {
  min-width: 120px;
}

.progress {
  height: 6px;
  border-radius: 10px;
  background-color: rgba(255, 255, 255, 0.2);
}

.progress-bar {
  border-radius: 10px;
}

/* Responsive */
@media (max-width: 768px) {
  .d-flex.justify-content-between {
    flex-direction: column;
    gap: 1rem;
  }

  .d-flex.gap-2 {
    flex-direction: column;
    width: 100%;
  }
}
</style>