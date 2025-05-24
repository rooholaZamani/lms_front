<template>
  <div class="performance-analysis">
    <div class="container-fluid">
      <div class="row">
        <div class="col-12">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <h2>تحلیل عملکرد</h2>
            <button class="btn btn-outline-secondary" @click="refreshData">
              <i class="fas fa-sync-alt me-1"></i> بروزرسانی
            </button>
          </div>

          <!-- Course Selection -->
          <div class="card mb-4">
            <div class="card-body">
              <div class="row align-items-center">
                <div class="col-md-6">
                  <label for="courseSelect" class="form-label">انتخاب دوره برای تحلیل:</label>
                  <select
                      class="form-select"
                      id="courseSelect"
                      v-model="selectedCourse"
                      @change="fetchAnalytics">
                    <option value="">انتخاب کنید...</option>
                    <option v-for="course in courses" :key="course.id" :value="course.id">
                      {{ course.title }}
                    </option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label for="periodSelect" class="form-label">بازه زمانی:</label>
                  <select class="form-select" id="periodSelect" v-model="selectedPeriod" @change="fetchAnalytics">
                    <option value="week">هفته گذشته</option>
                    <option value="month">ماه گذشته</option>
                    <option value="semester">ترم جاری</option>
                    <option value="all">تمام مدت</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <template v-if="selectedCourse">
            <!-- Key Metrics -->
            <div class="row mb-4">
              <div class="col-md-3 mb-3">
                <div class="card text-center">
                  <div class="card-body">
                    <i class="fas fa-users fa-2x text-primary mb-2"></i>
                    <h3 class="mb-0">{{ metrics.totalStudents }}</h3>
                    <p class="text-muted mb-0">کل دانش‌آموزان</p>
                  </div>
                </div>
              </div>
              <div class="col-md-3 mb-3">
                <div class="card text-center">
                  <div class="card-body">
                    <i class="fas fa-chart-line fa-2x text-success mb-2"></i>
                    <h3 class="mb-0">{{ metrics.averageProgress }}%</h3>
                    <p class="text-muted mb-0">میانگین پیشرفت</p>
                  </div>
                </div>
              </div>
              <div class="col-md-3 mb-3">
                <div class="card text-center">
                  <div class="card-body">
                    <i class="fas fa-star fa-2x text-warning mb-2"></i>
                    <h3 class="mb-0">{{ metrics.averageScore }}</h3>
                    <p class="text-muted mb-0">میانگین نمرات</p>
                  </div>
                </div>
              </div>
              <div class="col-md-3 mb-3">
                <div class="card text-center">
                  <div class="card-body">
                    <i class="fas fa-clock fa-2x text-info mb-2"></i>
                    <h3 class="mb-0">{{ metrics.completionRate }}%</h3>
                    <p class="text-muted mb-0">نرخ تکمیل</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Charts Row -->
            <div class="row mb-4">
              <div class="col-md-6">
                <div class="card">
                  <div class="card-header">
                    <h5 class="mb-0">توزیع نمرات</h5>
                  </div>
                  <div class="card-body" style="height: 300px;">
                    <loading-spinner :loading="loadingCharts">
                      <div class="chart-placeholder">
                        <i class="fas fa-chart-bar fa-3x text-muted"></i>
                        <p class="text-muted mt-2">نمودار توزیع نمرات</p>
                      </div>
                    </loading-spinner>
                  </div>
                </div>
              </div>
              <div class="col-md-6">
                <div class="card">
                  <div class="card-header">
                    <h5 class="mb-0">روند پیشرفت</h5>
                  </div>
                  <div class="card-body" style="height: 300px;">
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
              <div class="col-md-6">
                <div class="card">
                  <div class="card-header">
                    <h5 class="mb-0">درس‌های چالش‌برانگیز</h5>
                  </div>
                  <div class="card-body">
                    <loading-spinner :loading="loading">
                      <div v-if="difficultLessons.length === 0" class="text-center py-3">
                        <p class="text-muted">داده‌ای موجود نیست</p>
                      </div>
                      <div v-else>
                        <div v-for="lesson in difficultLessons" :key="lesson.id" class="mb-3">
                          <div class="d-flex justify-content-between align-items-center mb-1">
                            <span class="fw-bold">{{ lesson.title }}</span>
                            <span class="text-danger">{{ lesson.failRate }}% شکست</span>
                          </div>
                          <div class="progress" style="height: 6px;">
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
              </div>

              <div class="col-md-6">
                <div class="card">
                  <div class="card-header">
                    <h5 class="mb-0">دانش‌آموزان نیازمند کمک</h5>
                  </div>
                  <div class="card-body">
                    <loading-spinner :loading="loading">
                      <div v-if="strugglingStudents.length === 0" class="text-center py-3">
                        <p class="text-muted">همه دانش‌آموزان عملکرد مناسبی دارند</p>
                      </div>
                      <div v-else>
                        <div v-for="student in strugglingStudents" :key="student.id" class="d-flex justify-content-between align-items-center mb-3">
                          <div>
                            <strong>{{ getStudentName(student) }}</strong>
                            <div class="small text-muted">نمره: {{ student.averageScore }}</div>
                          </div>
                          <div>
                            <div class="progress" style="width: 80px; height: 6px;">
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
            </div>
          </template>

          <div v-else class="card">
            <div class="card-body text-center py-5">
              <i class="fas fa-chart-bar fa-4x text-muted mb-3"></i>
              <h4>تحلیل عملکرد</h4>
              <p class="text-muted">لطفاً یک دوره انتخاب کنید تا تحلیل عملکرد نمایش داده شود.</p>
            </div>
          </div>
        </div>
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
        // Fetch course performance metrics
        const performanceResponse = await axios.get(`/analytics/teacher/course/${selectedCourse.value}/performance`);
        const performanceData = performanceResponse.data || {};

        // Update metrics
        metrics.value = {
          totalStudents: performanceData.totalStudents || 0,
          averageProgress: Math.round(performanceData.averageProgress || 0),
          averageScore: Math.round(performanceData.averageScore || 0),
          completionRate: Math.round(performanceData.completionRate || 0)
        };

        // Fetch difficult lessons
        try {
          const difficultResponse = await axios.get(`/analytics/teacher/course/${selectedCourse.value}/difficult-lessons`);
          difficultLessons.value = difficultResponse.data || [];
        } catch (error) {
          console.error('Error fetching difficult lessons:', error);
          difficultLessons.value = [];
        }

        // Fetch struggling students
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

        // Reset to default values on error
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
.performance-analysis {
  min-height: calc(100vh - 56px);
  background-color: #f8f9fa;
  padding: 2rem 0;
}

.chart-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #6c757d;
}

.progress {
  border-radius: 10px;
  background-color: #e9ecef;
}

.progress-bar {
  border-radius: 10px;
}
</style>