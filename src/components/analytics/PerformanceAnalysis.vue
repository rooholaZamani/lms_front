<template>
  <div class="modern-page-bg danger-gradient">
    <div class="modern-container large animate-slide-up">
      <div class="modern-header">
        <div class="modern-logo danger">
          <i class="fas fa-chart-line"></i>
        </div>
        <h1 class="modern-title">تحلیل عملکرد</h1>
        <p class="modern-subtitle">بررسی و تحلیل عملکرد دانش‌آموزان</p>
      </div>

      <!-- Course Selection -->
      <div class="modern-card mb-4 animate-slide-up" style="animation-delay: 0.2s;">
        <div class="row align-items-center">
          <div class="col-md-6 modern-form-group">
            <label for="courseSelect" class="modern-form-label">انتخاب دوره برای تحلیل:</label>
            <select
                class="modern-form-control"
                id="courseSelect"
                v-model="selectedCourse"
                @change="fetchAnalytics">
              <option value="">انتخاب کنید...</option>
              <option v-for="course in courses" :key="course.id" :value="course.id">
                {{ course.title }}
              </option>
            </select>
          </div>
          <div class="col-md-6 modern-form-group">
            <label for="periodSelect" class="modern-form-label">بازه زمانی:</label>
            <select class="modern-form-control" id="periodSelect" v-model="selectedPeriod" @change="fetchAnalytics">
              <option value="week">هفته گذشته</option>
              <option value="month">ماه گذشته</option>
              <option value="all">تمام مدت</option>
            </select>
          </div>
        </div>
      </div>

      <template v-if="selectedCourse">
        <!-- Key Metrics -->
        <div class="row mb-4">
          <div class="col-md-3 mb-3">
            <div class="modern-stat-card animate-slide-up" style="animation-delay: 0.3s;">
              <div class="modern-stat-icon text-primary">
                <i class="fas fa-users"></i>
              </div>
              <div class="modern-stat-value">{{ metrics.totalStudents }}</div>
              <div class="modern-stat-label">کل دانش‌آموزان</div>
            </div>
          </div>
          <div class="col-md-3 mb-3">
            <div class="modern-stat-card animate-slide-up" style="animation-delay: 0.4s;">
              <div class="modern-stat-icon text-success">
                <i class="fas fa-chart-line"></i>
              </div>
              <div class="modern-stat-value">{{ metrics.averageProgress }}%</div>
              <div class="modern-stat-label">میانگین پیشرفت</div>
            </div>
          </div>
          <div class="col-md-3 mb-3">
            <div class="modern-stat-card animate-slide-up" style="animation-delay: 0.5s;">
              <div class="modern-stat-icon text-warning">
                <i class="fas fa-star"></i>
              </div>
              <div class="modern-stat-value">{{ metrics.averageScore }}</div>
              <div class="modern-stat-label">میانگین نمرات</div>
            </div>
          </div>
          <div class="col-md-3 mb-3">
            <div class="modern-stat-card animate-slide-up" style="animation-delay: 0.6s;">
              <div class="modern-stat-icon text-info">
                <i class="fas fa-clock"></i>
              </div>
              <div class="modern-stat-value">{{ metrics.completionRate }}%</div>
              <div class="modern-stat-label">نرخ تکمیل</div>
            </div>
          </div>
        </div>

        <!-- Charts Row -->
        <div class="row mb-4">
          <div class="col-md-6 mb-4">
            <div class="modern-card animate-slide-up" style="animation-delay: 0.7s;">
              <h5 class="modern-title mb-4">
                <i class="fas fa-chart-bar text-primary me-2"></i>
                توزیع نمرات
              </h5>
              <div class="chart-container">
                <loading-spinner :loading="loadingCharts">
                  <div class="chart-placeholder">
                    <i class="fas fa-chart-bar fa-3x text-muted"></i>
                    <p class="text-muted mt-2">نمودار توزیع نمرات</p>
                  </div>
                </loading-spinner>
              </div>
            </div>
          </div>
          <div class="col-md-6 mb-4">
            <div class="modern-card animate-slide-up" style="animation-delay: 0.8s;">
              <h5 class="modern-title mb-4">
                <i class="fas fa-chart-line text-success me-2"></i>
                روند پیشرفت
              </h5>
              <div class="chart-container">
                <loading-spinner :loading="loadingCharts">
                  <div class="chart-placeholder">
                    <i class="fas fa-chart-line fa-3x text-muted"></i>
                    <p class="text-muted mt-2">نمودار روند پیشرفت</p>
                  </div>
                </loading-spinner>
              </div>
            </div>
          </div>
        </div>

        <!-- Detailed Analysis -->
        <div class="row">
          <div class="col-md-6 mb-4">
            <div class="modern-card animate-slide-up" style="animation-delay: 0.9s;">
              <h5 class="modern-title mb-4">
                <i class="fas fa-exclamation-triangle text-warning me-2"></i>
                درس‌های چالش‌برانگیز
              </h5>
              <loading-spinner :loading="loading">
                <div v-if="difficultLessons.length === 0" class="text-center py-4">
                  <div class="modern-logo large success mb-3">
                    <i class="fas fa-check-circle"></i>
                  </div>
                  <p class="text-muted">داده‌ای موجود نیست</p>
                </div>
                <div v-else>
                  <div v-for="lesson in difficultLessons" :key="lesson.id" class="lesson-item mb-3">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                      <span class="fw-bold">{{ lesson.title }}</span>
                      <span class="modern-badge modern-badge-danger">{{ lesson.failRate }}% شکست</span>
                    </div>
                    <div class="progress mb-2">
                      <div
                          class="progress-bar bg-danger"
                          :style="`width: ${lesson.failRate}%`">
                      </div>
                    </div>
                    <small class="text-muted">
                      میانگین زمان تکمیل: {{ lesson.avgCompletionTime }} دقیقه
                    </small>
                  </div>
                </div>
              </loading-spinner>
            </div>
          </div>

          <div class="col-md-6 mb-4">
            <div class="modern-card animate-slide-up" style="animation-delay: 1s;">
              <h5 class="modern-title mb-4">
                <i class="fas fa-users text-info me-2"></i>
                دانش‌آموزان نیازمند کمک
              </h5>
              <loading-spinner :loading="loading">
                <div v-if="strugglingStudents.length === 0" class="text-center py-4">
                  <div class="modern-logo large success mb-3">
                    <i class="fas fa-thumbs-up"></i>
                  </div>
                  <p class="text-muted">همه دانش‌آموزان عملکرد مناسبی دارند</p>
                </div>
                <div v-else>
                  <div v-for="student in strugglingStudents" :key="student.id" class="student-item d-flex justify-content-between align-items-center mb-3">
                    <div>
                      <strong>{{ getStudentName(student) }}</strong>
                      <div class="small text-muted">نمره: {{ student.averageScore }}</div>
                    </div>
                    <div class="text-end">
                      <div class="progress mb-1" style="width: 80px; height: 6px;">
                        <div
                            class="progress-bar bg-warning"
                            :style="`width: ${student.progress}%`">
                        </div>
                      </div>
                      <small class="text-muted">{{ student.progress }}%</small>
                    </div>
                  </div>
                </div>
              </loading-spinner>
            </div>
          </div>
        </div>
      </template>

      <div v-else class="modern-card animate-slide-up" style="animation-delay: 0.3s;">
        <div class="text-center py-5">
          <div class="modern-logo large secondary mb-4">
            <i class="fas fa-chart-bar"></i>
          </div>
          <h4>تحلیل عملکرد</h4>
          <p class="text-muted">لطفاً یک دوره انتخاب کنید تا تحلیل عملکرد نمایش داده شود.</p>
        </div>
      </div>

      <!-- Refresh Button -->
      <div class="text-center mt-4">
        <button class="modern-btn modern-btn-outline text-white" @click="refreshData">
          <i class="fas fa-sync-alt me-1"></i> بروزرسانی اطلاعات
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import axios from 'axios';

export default {
  name: 'PerformanceAnalysis',
  components: {
    LoadingSpinner
  },
  setup() {
    const loading = ref(true);
    const loadingCharts = ref(false);
    const courses = ref([]);
    const selectedCourse = ref('');
    const selectedPeriod = ref('month');

    const metrics = ref({
      totalStudents: 0,
      averageProgress: 0,
      averageScore: 0,
      completionRate: 0
    });

    const difficultLessons = ref([]);
    const strugglingStudents = ref([]);

    const fetchCourses = async () => {
      loading.value = true;
      try {
        const response = await axios.get('/courses/teaching');
        courses.value = response.data || [];
      } catch (error) {
        console.error('Error fetching courses:', error);
        window.showError(error);
      } finally {
        loading.value = false;
      }
    };

    const fetchAnalytics = async () => {
      if (!selectedCourse.value) return;

      loading.value = true;
      loadingCharts.value = true;

      try {
        const performanceResponse = await axios.get(`/analytics/teacher/course/${selectedCourse.value}/performance`);
        const performanceData = performanceResponse.data || {};

        metrics.value = {
          totalStudents: performanceData.totalStudents || 0,
          averageProgress: Math.round(performanceData.averageProgress || 0),
          averageScore: Math.round(performanceData.averageScore || 0),
          completionRate: Math.round(performanceData.completionRate || 0)
        };

        try {
          const difficultResponse = await axios.get(`/analytics/teacher/course/${selectedCourse.value}/difficult-lessons`);
          difficultLessons.value = difficultResponse.data || [];
        } catch (error) {
          console.error('Error fetching difficult lessons:', error);
          difficultLessons.value = [];
        }

        try {
          const strugglingResponse = await axios.get(`/analytics/teacher/course/${selectedCourse.value}/struggling-students`);
          strugglingStudents.value = strugglingResponse.data || [];
        } catch (error) {
          console.error('Error fetching struggling students:', error);
          strugglingStudents.value = [];
        }

      } catch (error) {
        console.error('Error fetching analytics:', error);
        window.showError(error);

        metrics.value = {
          totalStudents: 0,
          averageProgress: 0,
          averageScore: 0,
          completionRate: 0
        };
        difficultLessons.value = [];
        strugglingStudents.value = [];
      } finally {
        loading.value = false;
        loadingCharts.value = false;
      }
    };

    const refreshData = () => {
      if (selectedCourse.value) {
        fetchAnalytics();
      } else {
        fetchCourses();
      }
    };

    const getStudentName = (student) => {
      if (!student) return 'نامشخص';
      return student.firstName && student.lastName
          ? `${student.firstName} ${student.lastName}`
          : student.username;
    };

    onMounted(() => {
      fetchCourses();
    });

    return {
      loading,
      loadingCharts,
      courses,
      selectedCourse,
      selectedPeriod,
      metrics,
      difficultLessons,
      strugglingStudents,
      fetchAnalytics,
      refreshData,
      getStudentName
    };
  }
}
</script>

<style scoped>
.chart-container {
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 2px dashed rgba(255, 255, 255, 0.2);
}

.chart-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: rgba(255, 255, 255, 0.6);
}

.lesson-item,
.student-item {
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
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
  .chart-container {
    height: 150px;
  }

  .student-item {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
}
</style>