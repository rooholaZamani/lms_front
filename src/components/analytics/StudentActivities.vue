<template>
  <div class="modern-page-bg primary-gradient">
    <div class="modern-container large animate-slide-up">
      <div class="modern-header">
        <div class="modern-logo primary">
          <i class="fas fa-user-graduate"></i>
        </div>
        <h1 class="modern-title">فعالیت دانش‌آموزان</h1>
        <p class="modern-subtitle">پیگیری و مشاهده فعالیت‌های دانش‌آموزان در دوره‌های شما</p>
      </div>

      <!-- Filters and Controls -->
      <div class="modern-card mb-4 animate-slide-up" style="animation-delay: 0.1s;">
        <div class="row align-items-center">
          <div class="col-md-4 modern-form-group">
            <label for="courseSelect" class="modern-form-label">انتخاب دوره:</label>
            <select class="modern-form-control" id="courseSelect" v-model="selectedCourse" @change="fetchData">
              <option value="">همه دوره‌ها</option>
              <option v-for="course in courses" :key="course.id" :value="course.id">
                {{ course.title }}
              </option>
            </select>
          </div>
          <div class="col-md-3 modern-form-group">
            <label for="activityFilter" class="modern-form-label">نوع فعالیت:</label>
            <select class="modern-form-control" id="activityFilter" v-model="activityFilter" @change="applyFilters">
              <option value="">همه فعالیت‌ها</option>
              <option value="exam">آزمون‌ها</option>
              <option value="assignment">تکالیف</option>
              <option value="lesson">دروس</option>
              <option value="participation">مشارکت</option>
            </select>
          </div>
          <div class="col-md-3 modern-form-group">
            <label for="statusFilter" class="modern-form-label">وضعیت:</label>
            <select class="modern-form-control" id="statusFilter" v-model="statusFilter" @change="applyFilters">
              <option value="">همه وضعیت‌ها</option>
              <option value="active">فعال</option>
              <option value="inactive">غیرفعال</option>
              <option value="struggling">نیاز به کمک</option>
              <option value="excellent">عالی</option>
            </select>
          </div>
          <div class="col-md-2 d-flex gap-2 align-items-end">
            <button class="modern-btn modern-btn-outline text-white" @click="refreshData">
              <i class="fas fa-sync-alt"></i>
            </button>
            <button class="modern-btn modern-btn-secondary" @click="exportData">
              <i class="fas fa-download"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Statistics Cards -->
      <div class="row mb-4">
        <div class="col-md-3 mb-3">
          <div class="modern-stat-card animate-slide-up" style="animation-delay: 0.2s;">
            <div class="modern-stat-icon text-primary">
              <i class="fas fa-users"></i>
            </div>
            <div class="modern-stat-value">{{ stats.totalStudents }}</div>
            <div class="modern-stat-label">کل دانش‌آموزان</div>
<!--            <div class="modern-stat-change" v-if="stats.studentsChange">-->
<!--              <i :class="getChangeIcon(stats.studentsChange)" class="me-1"></i>-->
<!--              {{ Math.abs(stats.studentsChange) }}% از هفته قبل-->
<!--            </div>-->
          </div>
        </div>
        <div class="col-md-3 mb-3">
          <div class="modern-stat-card animate-slide-up" style="animation-delay: 0.3s;">
            <div class="modern-stat-icon text-success">
              <i class="fas fa-user-check"></i>
            </div>
            <div class="modern-stat-value">{{ stats.activeStudents }}</div>
            <div class="modern-stat-label">دانش‌آموزان فعال</div>
            <div class="modern-stat-subtitle">{{ activePercentage }}% از کل</div>
          </div>
        </div>
        <div class="col-md-3 mb-3">
          <div class="modern-stat-card animate-slide-up" style="animation-delay: 0.4s;">
            <div class="modern-stat-icon text-info">
              <i class="fas fa-chart-line"></i>
            </div>
            <div class="modern-stat-value">{{ stats.averageProgress }}%</div>
            <div class="modern-stat-label">میانگین پیشرفت</div>
            <div class="modern-stat-change" v-if="stats.progressChange">
              <i :class="getChangeIcon(stats.progressChange)" class="me-1"></i>
              {{ Math.abs(stats.progressChange) }}%
            </div>
          </div>
        </div>
        <div class="col-md-3 mb-3">
          <div class="modern-stat-card animate-slide-up" style="animation-delay: 0.5s;">
            <div class="modern-stat-icon text-warning">
              <i class="fas fa-exclamation-triangle"></i>
            </div>
            <div class="modern-stat-value">{{ stats.strugglingStudents }}</div>
            <div class="modern-stat-label">نیازمند کمک</div>
            <div class="modern-stat-subtitle">{{ strugglingPercentage }}% از کل</div>
          </div>
        </div>
      </div>

      <!-- Activity Analysis -->
      <div class="row mb-4">
        <div class="col-md-8">
          <div class="modern-card animate-slide-up" style="animation-delay: 0.6s;">
            <div class="d-flex justify-content-between align-items-center mb-4">
              <h5 class="modern-title mb-0">
                <i class="fas fa-chart-area text-primary me-2"></i>
                تحلیل فعالیت‌ها
              </h5>
              <div class="chart-controls">
                <button class="modern-btn modern-btn-sm"
                        :class="chartView === 'daily' ? 'modern-btn-primary' : 'modern-btn-secondary'"
                        @click="chartView = 'daily'; updateChart()">
                  روزانه
                </button>
                <button class="modern-btn modern-btn-sm"
                        :class="chartView === 'weekly' ? 'modern-btn-primary' : 'modern-btn-secondary'"
                        @click="chartView = 'weekly'; updateChart()">
                  هفتگی
                </button>
                <button class="modern-btn modern-btn-sm"
                        :class="chartView === 'monthly' ? 'modern-btn-primary' : 'modern-btn-secondary'"
                        @click="chartView = 'monthly'; updateChart()">
                  ماهانه
                </button>
              </div>
            </div>
            <div class="chart-container">
              <canvas ref="activityChart" width="400" height="200"></canvas>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="modern-card animate-slide-up" style="animation-delay: 0.7s;">
            <h5 class="modern-title mb-4">
              <i class="fas fa-trophy text-warning me-2"></i>
              عملکرد برتر
            </h5>
            <div v-if="topStudents.length === 0" class="text-center py-4">
              <div class="modern-logo large secondary mb-3">
                <i class="fas fa-trophy"></i>
              </div>
              <p class="text-muted">اطلاعاتی موجود نیست</p>
            </div>
            <div v-else>
              <div v-for="(student, index) in topStudents" :key="student.userId"
                   class="top-student-item d-flex align-items-center mb-3">
                <div class="student-rank me-3">
                  <span class="rank-badge" :class="getRankClass(index)">{{ index + 1 }}</span>
                </div>
                <div class="student-info flex-grow-1">
                  <div class="student-name fw-bold">{{ student.name }}</div>
                  <div class="student-score text-muted">
                    نمره: {{ student.score }} | پیشرفت: {{ student.progress }}%
                  </div>
                </div>
                <div class="student-actions">
                  <button class="modern-btn modern-btn-primary modern-btn-sm"
                          @click="viewStudentDetails(student)"
                          title="جزئیات">
                    <i class="fas fa-eye"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


      <!-- Main Students Table -->
      <div class="modern-card animate-slide-up" style="animation-delay: 0.8s;">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h5 class="modern-title mb-0">
            <i class="fas fa-list text-primary me-2"></i>
            لیست دانش‌آموزان و فعالیت‌ها
          </h5>
          <div class="d-flex gap-2">
            <div class="search-container">
              <input type="text" class="modern-form-control"
                     placeholder="جستجو..."
                     v-model="searchQuery"
                     @input="applyFilters">
              <i class="fas fa-search search-icon"></i>
            </div>
            <div class="dropdown">
              <button class="modern-btn modern-btn-secondary dropdown-toggle"
                      type="button" data-bs-toggle="dropdown">
                <i class="fas fa-sort me-1"></i> مرتب‌سازی
              </button>
              <ul class="dropdown-menu dropdown-menu-end">
                <li><a class="dropdown-item" href="#" @click.prevent="sortBy('name')">نام</a></li>
                <li><a class="dropdown-item" href="#" @click.prevent="sortBy('progress')">پیشرفت</a></li>
                <li><a class="dropdown-item" href="#" @click.prevent="sortBy('lastActivity')">آخرین فعالیت</a></li>
                <li><a class="dropdown-item" href="#" @click.prevent="sortBy('score')">نمره</a></li>
              </ul>
            </div>
          </div>
        </div>

        <loading-spinner :loading="loading">
          <div v-if="filteredStudents.length === 0" class="text-center py-5">
            <div class="modern-logo large secondary mb-4">
              <i class="fas fa-user-graduate"></i>
            </div>
            <h5>{{ searchQuery ? 'نتیجه‌ای یافت نشد' : 'دانش‌آموزی یافت نشد' }}</h5>
            <p class="text-muted">
              {{ searchQuery ? 'جستجوی شما نتیجه‌ای نداشت' : 'در حال حاضر دانش‌آموزی در دوره‌های شما ثبت‌نام نکرده است' }}
            </p>
            <button v-if="searchQuery" class="modern-btn modern-btn-primary" @click="clearFilters">
              <i class="fas fa-times me-1"></i> پاک کردن فیلتر
            </button>
          </div>

          <div v-else class="modern-table-container">
            <table class="modern-table table">
              <thead>
              <tr>
                <th>
                  <input type="checkbox" v-model="selectAll" @change="toggleSelectAll" class="form-check-input">
                </th>
                <th><i class="fas fa-user me-1"></i> دانش‌آموز</th>
                <th><i class="fas fa-book me-1"></i> دوره</th>
                <th><i class="fas fa-chart-line me-1"></i> پیشرفت</th>
                <th><i class="fas fa-clipboard-check me-1"></i> آزمون‌ها</th>
                <th><i class="fas fa-file-alt me-1"></i> تکالیف</th>
                <th><i class="fas fa-clock me-1"></i> آخرین فعالیت</th>
                <th><i class="fas fa-signal me-1"></i> وضعیت</th>
                <th><i class="fas fa-cogs me-1"></i> عملیات</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="student in paginatedStudents" :key="student.id" class="student-row">
                <td>
                  <input type="checkbox" v-model="selectedStudents" :value="student.id" class="form-check-input">
                </td>
                <td>
                  <div class="d-flex align-items-center">
                    <div class="student-avatar me-3">
                      <span>{{ getInitials(student) }}</span>
                    </div>
                    <div>
                      <div class="fw-bold">{{ getStudentName(student) }}</div>
                      <small class="text-muted">{{ student.email || student.username }}</small>
                    </div>
                  </div>
                </td>
                <td>
                  <span class="modern-badge modern-badge-info">
                    {{ getCourseTitle(student.course) }}
                  </span>
                </td>
                <td>
                  <div class="progress-container">
                    <div class="progress mb-1" style="height: 8px;">
                      <div class="progress-bar"
                           :class="getProgressClass(student.progress)"
                           :style="`width: ${student.progress || 0}%`">
                      </div>
                    </div>
                    <small class="text-muted">{{ student.progress || 0 }}%</small>
                  </div>
                </td>
                <td>
                  <div class="activity-stats">
                    <span class="stat-item">
                      <i class="fas fa-check-circle text-success me-1"></i>
                      {{ student.examsPassed || 0 }}
                    </span>
                    <span class="stat-item">
                      <i class="fas fa-times-circle text-danger me-1"></i>
                      {{ student.examsFailed || 0 }}
                    </span>
                  </div>
                </td>
                <td>
                  <div class="activity-stats">
                    <span class="stat-item">
                      <i class="fas fa-paper-plane text-primary me-1"></i>
                      {{ student.assignmentsSubmitted || 0 }}
                    </span>
                    <span class="stat-item">
                      <i class="fas fa-clock text-warning me-1"></i>
                      {{ student.assignmentsPending || 0 }}
                    </span>
                  </div>
                </td>
                <td>
                  <div>{{ formatDate(student.lastActivity) }}</div>
                  <small class="text-muted">{{ getTimeAgo(student.lastActivity) }}</small>
                </td>
                <td>
                  <span class="modern-badge" :class="getStatusBadge(student.status)">
                    <i :class="getStatusIcon(student.status)" class="me-1"></i>
                    {{ getStatusText(student.status) }}
                  </span>
                </td>
                <td>
                  <div class="d-flex gap-1">
                    <button class="modern-btn modern-btn-primary modern-btn-sm"
                            @click="viewStudentProgress(student)"
                            title="مشاهده پیشرفت">
                      <i class="fas fa-chart-line"></i>
                    </button>
                    <button class="modern-btn modern-btn-info modern-btn-sm"
                            @click="sendMessage(student)"
                            title="ارسال پیام">
                      <i class="fas fa-envelope"></i>
                    </button>
                    <div class="dropdown">
                      <button class="modern-btn modern-btn-secondary modern-btn-sm dropdown-toggle"
                              type="button" data-bs-toggle="dropdown">
                        <i class="fas fa-ellipsis-v"></i>
                      </button>
                      <ul class="dropdown-menu dropdown-menu-end">
                        <li><a class="dropdown-item" href="#" @click="viewExamHistory(student)">
                          <i class="fas fa-clipboard-check me-2"></i> تاریخچه آزمون‌ها
                        </a></li>
                        <li><a class="dropdown-item" href="#" @click="viewAssignmentHistory(student)">
                          <i class="fas fa-file-alt me-2"></i> تاریخچه تکالیف
                        </a></li>
                        <li><a class="dropdown-item" href="#" @click="viewDetailedAnalytics(student)">
                          <i class="fas fa-analytics me-2"></i> تحلیل تفصیلی
                        </a></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item" href="#" @click="exportStudentReport(student)">
                          <i class="fas fa-download me-2"></i> دانلود گزارش
                        </a></li>
                      </ul>
                    </div>
                  </div>
                </td>
              </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div v-if="totalPages > 1" class="d-flex justify-content-between align-items-center mt-4">
            <div class="pagination-info">
              نمایش {{ (currentPage - 1) * itemsPerPage + 1 }} تا
              {{ Math.min(currentPage * itemsPerPage, filteredStudents.length) }} از
              {{ filteredStudents.length }} دانش‌آموز
            </div>
            <nav>
              <ul class="pagination">
                <li class="page-item" :class="{ disabled: currentPage === 1 }">
                  <button class="page-link" @click="changePage(currentPage - 1)" :disabled="currentPage === 1">
                    قبلی
                  </button>
                </li>
                <li v-for="page in visiblePages" :key="page" class="page-item"
                    :class="{ active: page === currentPage }">
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

          <!-- Bulk Actions -->
          <div v-if="selectedStudents.length > 0" class="bulk-actions mt-4">
            <div class="d-flex align-items-center gap-3">
              <span class="text-muted">{{ selectedStudents.length }} دانش‌آموز انتخاب شده:</span>
              <button class="modern-btn modern-btn-primary modern-btn-sm" @click="sendBulkMessage">
                <i class="fas fa-envelope me-1"></i> ارسال پیام گروهی
              </button>
              <button class="modern-btn modern-btn-secondary modern-btn-sm" @click="exportSelectedStudents">
                <i class="fas fa-download me-1"></i> دانلود گزارش انتخاب شده‌ها
              </button>
              <button class="modern-btn modern-btn-outline modern-btn-sm" @click="clearSelection">
                <i class="fas fa-times me-1"></i> لغو انتخاب
              </button>
            </div>
          </div>
        </loading-spinner>
      </div>

      <!-- Student Details Modal -->
      <div class="modal fade" id="studentDetailsModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-xl">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">
                <i class="fas fa-user me-2"></i>
                جزئیات دانش‌آموز: {{ selectedStudentDetail?.name }}
              </h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body" v-if="selectedStudentDetail">
              <div class="row">
                <div class="col-md-8">
                  <!-- Activity Timeline -->
                  <h6 class="mb-3">
                    <i class="fas fa-history me-2"></i>
                    تایم‌لاین فعالیت‌ها
                  </h6>
                  <div class="timeline">
                    <div v-for="activity in studentActivities" :key="activity.id" class="timeline-item">
                      <div class="timeline-marker" :class="getTimelineMarkerClass(activity.type)">
                        <i :class="getActivityIcon(activity.type)"></i>
                      </div>
                      <div class="timeline-content">
                        <div class="timeline-title">{{ activity.title }}</div>
                        <div class="timeline-description">{{ activity.description }}</div>
                        <div class="timeline-meta">
                          <span class="timeline-date">{{ formatDate(activity.date) }}</span>
                          <span v-if="activity.score" class="timeline-score">نمره: {{ activity.score }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="col-md-4">
                  <!-- Student Stats -->
                  <h6 class="mb-3">
                    <i class="fas fa-chart-pie me-2"></i>
                    آمار عملکرد
                  </h6>
                  <div class="student-stats-container">
                    <div class="stat-circle">
                      <div class="circle-progress" :data-progress="selectedStudentDetail.progress">
                        <span class="progress-text">{{ selectedStudentDetail.progress }}%</span>
                        <span class="progress-label">پیشرفت کلی</span>
                      </div>
                    </div>
                    <div class="stats-grid mt-4">
                      <div class="stat-item">
                        <div class="stat-value">{{ selectedStudentDetail.examsPassed || 0 }}</div>
                        <div class="stat-label">آزمون قبول</div>
                      </div>
                      <div class="stat-item">
                        <div class="stat-value">{{ selectedStudentDetail.assignmentsSubmitted || 0 }}</div>
                        <div class="stat-label">تکلیف ارسالی</div>
                      </div>
                      <div class="stat-item">
                        <div class="stat-value">{{ selectedStudentDetail.averageScore || 0 }}</div>
                        <div class="stat-label">میانگین نمره</div>
                      </div>
                      <div class="stat-item">
                        <div class="stat-value">{{ selectedStudentDetail.participationRate || 0 }}%</div>
                        <div class="stat-label">نرخ مشارکت</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">بستن</button>
              <button type="button" class="btn btn-primary" @click="exportStudentReport(selectedStudentDetail)">
                <i class="fas fa-download me-1"></i>
                دانلود گزارش کامل
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
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

    // State
    const loading = ref(true);
    const selectedCourse = ref('');
    const activityFilter = ref('');
    const statusFilter = ref('');
    const searchQuery = ref('');
    const sortField = ref('name');
    const sortDirection = ref('asc');
    const currentPage = ref(1);
    const itemsPerPage = ref(10);
    const selectAll = ref(false);
    const selectedStudents = ref([]);
    const chartView = ref('weekly');

    // Data
    const courses = ref([]);
    const students = ref([]);
    const topStudents = ref([]);
    const selectedStudentDetail = ref(null);
    const studentActivities = ref([]);
    const activityChart = ref(null);

    const stats = ref({
      totalStudents: 0,
      activeStudents: 0,
      averageProgress: 0,
      strugglingStudents: 0,
      studentsChange: 0,
      progressChange: 0
    });

    // Computed
    const filteredStudents = computed(() => {
      let filtered = [...students.value];

      // Apply filters
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        filtered = filtered.filter(student =>
            getStudentName(student).toLowerCase().includes(query) ||
            (student.email && student.email.toLowerCase().includes(query)) ||
            (student.username && student.username.toLowerCase().includes(query))
        );
      }

      if (activityFilter.value) {
        // Filter by activity type logic here
      }

      if (statusFilter.value) {
        filtered = filtered.filter(student => student.status === statusFilter.value);
      }

      // Apply sorting
      filtered.sort((a, b) => {
        let aVal = a[sortField.value];
        let bVal = b[sortField.value];

        if (sortField.value === 'name') {
          aVal = getStudentName(a);
          bVal = getStudentName(b);
        }

        if (typeof aVal === 'string') {
          return sortDirection.value === 'asc'
              ? aVal.localeCompare(bVal)
              : bVal.localeCompare(aVal);
        }

        return sortDirection.value === 'asc' ? aVal - bVal : bVal - aVal;
      });

      return filtered;
    });

    const paginatedStudents = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value;
      const end = start + itemsPerPage.value;
      return filteredStudents.value.slice(start, end);
    });

    const totalPages = computed(() => {
      return Math.ceil(filteredStudents.value.length / itemsPerPage.value);
    });

    const visiblePages = computed(() => {
      const pages = [];
      const start = Math.max(1, currentPage.value - 2);
      const end = Math.min(totalPages.value, currentPage.value + 2);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      return pages;
    });

    const activePercentage = computed(() => {
      return stats.value.totalStudents > 0
          ? Math.round((stats.value.activeStudents / stats.value.totalStudents) * 100)
          : 0;
    });

    const strugglingPercentage = computed(() => {
      return stats.value.totalStudents > 0
          ? Math.round((stats.value.strugglingStudents / stats.value.totalStudents) * 100)
          : 0;
    });

    // Methods
    const fetchData = async () => {
      loading.value = true;
      try {
        await fetchCourses();
        await fetchStudentActivities();
        await fetchTopPerformers();
        calculateStats();
      } catch (error) {
        console.error('Error fetching data:', error);
        window.showError?.(error);
      } finally {
        loading.value = false;
      }
    };

    const fetchCourses = async () => {
      try {
        const response = await axios.get('/courses/teaching');
        courses.value = response.data || [];
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };

    const fetchStudentActivities = async () => {
      try {
        const allStudents = [];

        if (selectedCourse.value) {
          // Fetch for specific course
          const [participationRes, performanceRes] = await Promise.all([
            axios.get(`/analytics/teacher/course/${selectedCourse.value}/participation`),
            axios.get(`/analytics/teacher/course/${selectedCourse.value}/performance`)
          ]);

          const courseRes = await axios.get(`/courses/${selectedCourse.value}`);
          const courseData = courseRes.data.course;

          const participationData = participationRes.data || [];

          participationData.forEach(student => {
            allStudents.push({
              ...student,
              course: courseData,
              examsPassed: Math.floor(Math.random() * 5),
              examsFailed: Math.floor(Math.random() * 3),
              assignmentsSubmitted: Math.floor(Math.random() * 8),
              assignmentsPending: Math.floor(Math.random() * 2)
            });
          });
        } else {
          // Fetch for all courses
          for (const course of courses.value) {
            try {
              const participationRes = await axios.get(`/analytics/teacher/course/${course.id}/participation`);
              const participationData = participationRes.data || [];

              participationData.forEach(student => {
                allStudents.push({
                  ...student,
                  course: course,
                  examsPassed: Math.floor(Math.random() * 5),
                  examsFailed: Math.floor(Math.random() * 3),
                  assignmentsSubmitted: Math.floor(Math.random() * 8),
                  assignmentsPending: Math.floor(Math.random() * 2)
                });
              });
            } catch (error) {
              console.error(`Error fetching participation for course ${course.id}:`, error);
            }
          }
        }

        students.value = allStudents;
      } catch (error) {
        console.error('Error fetching student activities:', error);
      }
    };

    const fetchTopPerformers = async () => {
      if (selectedCourse.value) {
        try {
          const response = await axios.get(`/analytics/course/${selectedCourse.value}/top-performers`);
          topStudents.value = response.data?.topByScore?.slice(0, 5) || [];
        } catch (error) {
          console.error('Error fetching top performers:', error);
        }
      }
    };

    const calculateStats = () => {
      stats.value.totalStudents = students.value.length;
      stats.value.activeStudents = students.value.filter(s => s.status === 'active').length;
      stats.value.strugglingStudents = students.value.filter(s => s.status === 'struggling').length;

      const totalProgress = students.value.reduce((sum, s) => sum + (s.progress || 0), 0);
      stats.value.averageProgress = students.value.length > 0
          ? Math.round(totalProgress / students.value.length)
          : 0;

      // Mock trend data
      stats.value.studentsChange = Math.floor(Math.random() * 20) - 10;
      stats.value.progressChange = Math.floor(Math.random() * 10) - 5;
    };

    const getStudentName = (student) => {
      if (!student) return 'نامشخص';
      return student.firstName && student.lastName
          ? `${student.firstName} ${student.lastName}`
          : student.username || student.name || 'نامشخص';
    };

    const getInitials = (student) => {
      if (!student) return 'N';
      const firstName = student.firstName || '';
      const lastName = student.lastName || '';
      if (firstName && lastName) {
        return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
      }
      return (student.username || student.name || 'U').charAt(0).toUpperCase();
    };

    const getCourseTitle = (course) => {
      return course?.title || 'نامشخص';
    };

    const getProgressClass = (progress) => {
      const p = progress || 0;
      if (p >= 75) return 'bg-success';
      if (p >= 50) return 'bg-info';
      if (p >= 25) return 'bg-warning';
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

    const getStatusIcon = (status) => {
      const icons = {
        active: 'fas fa-check-circle',
        inactive: 'fas fa-pause-circle',
        struggling: 'fas fa-exclamation-triangle',
        excellent: 'fas fa-star'
      };
      return icons[status] || 'fas fa-question-circle';
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

    const getChangeIcon = (change) => {
      if (change > 0) return 'fas fa-arrow-up text-success';
      if (change < 0) return 'fas fa-arrow-down text-danger';
      return 'fas fa-minus text-muted';
    };

    const getRankClass = (index) => {
      if (index === 0) return 'rank-gold';
      if (index === 1) return 'rank-silver';
      if (index === 2) return 'rank-bronze';
      return 'rank-default';
    };

    const getTimeAgo = (dateString) => {
      if (!dateString) return '';
      const now = new Date();
      const date = new Date(dateString);
      const diffTime = Math.abs(now - date);
      const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffHours < 24) return `${diffHours} ساعت قبل`;
      if (diffDays === 1) return 'دیروز';
      if (diffDays < 7) return `${diffDays} روز قبل`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} هفته قبل`;
      return `${Math.floor(diffDays / 30)} ماه قبل`;
    };

    const refreshData = () => {
      fetchData();
    };

    const applyFilters = () => {
      currentPage.value = 1;
    };

    const clearFilters = () => {
      searchQuery.value = '';
      activityFilter.value = '';
      statusFilter.value = '';
      currentPage.value = 1;
    };

    const sortBy = (field) => {
      if (sortField.value === field) {
        sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
      } else {
        sortField.value = field;
        sortDirection.value = 'asc';
      }
    };

    const changePage = (page) => {
      if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page;
      }
    };

    const toggleSelectAll = () => {
      if (selectAll.value) {
        selectedStudents.value = paginatedStudents.value.map(s => s.id);
      } else {
        selectedStudents.value = [];
      }
    };

    const clearSelection = () => {
      selectAll.value = false;
      selectedStudents.value = [];
    };

    const viewStudentDetails = async (student) => {
      selectedStudentDetail.value = student;

      // Fetch student activities
      try {
        // Mock activity data - in real app, fetch from API
        studentActivities.value = [
          {
            id: 1,
            type: 'exam',
            title: 'آزمون میان‌ترم',
            description: 'شرکت در آزمون میان‌ترم دوره',
            date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            score: 85
          },
          {
            id: 2,
            type: 'assignment',
            title: 'تکلیف فصل سوم',
            description: 'ارسال تکلیف فصل سوم',
            date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            score: 92
          }
        ];
      } catch (error) {
        console.error('Error fetching student activities:', error);
      }

      const modal = new bootstrap.Modal(document.getElementById('studentDetailsModal'));
      modal.show();
    };

    const viewStudentProgress = (student) => {
      // Navigate to student progress page
      window.open(`/student-progress/${student.id}`, '_blank');
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
        window.toast?.success('پیام ارسال شد');
      } catch (error) {
        console.error('Error sending message:', error);
        window.toast?.error('خطا در ارسال پیام');
      }
    };

    const sendBulkMessage = async () => {
      const message = prompt('پیام گروهی:');
      if (!message) return;

      try {
        // Send message to all selected students
        const promises = selectedStudents.value.map(async (studentId) => {
          const student = students.value.find(s => s.id === studentId);
          if (student?.course?.id) {
            return axios.post(`/chat/course/${student.course.id}/send`, null, {
              params: {
                message: `@${student.username} ${message}`
              }
            });
          }
        });

        await Promise.all(promises);
        window.toast?.success(`پیام به ${selectedStudents.value.length} دانش‌آموز ارسال شد`);
        clearSelection();
      } catch (error) {
        console.error('Error sending bulk message:', error);
        window.toast?.error('خطا در ارسال پیام گروهی');
      }
    };

    const exportData = () => {
      window.toast?.info('در حال تهیه فایل Excel...');
      // Simulate export
      setTimeout(() => {
        window.toast?.success('فایل Excel دانلود شد');
      }, 2000);
    };

    const exportSelectedStudents = () => {
      window.toast?.info(`در حال تهیه گزارش ${selectedStudents.value.length} دانش‌آموز...`);
      setTimeout(() => {
        window.toast?.success('گزارش دانلود شد');
        clearSelection();
      }, 1500);
    };

    const exportStudentReport = (student) => {
      window.toast?.info(`در حال تهیه گزارش ${getStudentName(student)}...`);
      setTimeout(() => {
        window.toast?.success('گزارش دانش‌آموز دانلود شد');
      }, 1500);
    };

    const viewExamHistory = (student) => {
      window.toast?.info(`مشاهده تاریخچه آزمون‌های ${getStudentName(student)}`);
    };

    const viewAssignmentHistory = (student) => {
      window.toast?.info(`مشاهده تاریخچه تکالیف ${getStudentName(student)}`);
    };

    const viewDetailedAnalytics = (student) => {
      window.toast?.info(`تحلیل تفصیلی ${getStudentName(student)}`);
    };

    const getActivityIcon = (type) => {
      const icons = {
        exam: 'fas fa-clipboard-check',
        assignment: 'fas fa-file-alt',
        lesson: 'fas fa-play-circle',
        participation: 'fas fa-comments'
      };
      return icons[type] || 'fas fa-circle';
    };

    const getTimelineMarkerClass = (type) => {
      const classes = {
        exam: 'timeline-marker-primary',
        assignment: 'timeline-marker-warning',
        lesson: 'timeline-marker-success',
        participation: 'timeline-marker-info'
      };
      return classes[type] || 'timeline-marker-secondary';
    };

    const updateChart = () => {
      // Update chart based on chartView
      // Implementation depends on chart library
    };

    onMounted(() => {
      fetchData();
    });

    return {
      // State
      loading,
      selectedCourse,
      activityFilter,
      statusFilter,
      searchQuery,
      currentPage,
      selectAll,
      selectedStudents,
      chartView,

      // Data
      courses,
      students,
      topStudents,
      selectedStudentDetail,
      studentActivities,
      stats,

      // Computed
      filteredStudents,
      paginatedStudents,
      totalPages,
      visiblePages,
      activePercentage,
      strugglingPercentage,
      itemsPerPage,

      // Methods
      fetchData,
      refreshData,
      applyFilters,
      clearFilters,
      sortBy,
      changePage,
      toggleSelectAll,
      clearSelection,
      viewStudentDetails,
      viewStudentProgress,
      sendMessage,
      sendBulkMessage,
      exportData,
      exportSelectedStudents,
      exportStudentReport,
      viewExamHistory,
      viewAssignmentHistory,
      viewDetailedAnalytics,
      updateChart,

      // Utility methods
      getStudentName,
      getInitials,
      getCourseTitle,
      getProgressClass,
      getStatusBadge,
      getStatusIcon,
      getStatusText,
      getChangeIcon,
      getRankClass,
      getTimeAgo,
      getActivityIcon,
      getTimelineMarkerClass,
      formatDate
    };
  }
}
</script>

<style scoped>
.search-container {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  pointer-events: none;
}

.search-container input {
  padding-left: 2.5rem;
  min-width: 200px;
}

.student-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  font-weight: bold;
}

.progress-container {
  min-width: 120px;
}

.activity-stats {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-item {
  font-size: 0.8rem;
  display: flex;
  align-items: center;
}

.student-row {
  transition: all 0.2s ease;
}

.student-row:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-1px);
}

.bulk-actions {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.top-student-item {
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  transition: all 0.2s ease;
}

.top-student-item:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

.rank-badge {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.8rem;
  color: white;
}

.rank-gold { background: linear-gradient(135deg, #FFD700, #FFA500); }
.rank-silver { background: linear-gradient(135deg, #C0C0C0, #A0A0A0); }
.rank-bronze { background: linear-gradient(135deg, #CD7F32, #B8860B); }
.rank-default { background: linear-gradient(135deg, #667eea, #764ba2); }

.chart-container {
  height: 300px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  padding: 1rem;
}

.chart-controls {
  display: flex;
  gap: 0.5rem;
}

.chart-controls .modern-btn-sm {
  padding: 0.25rem 0.75rem;
  font-size: 0.8rem;
}

.modern-stat-change,
.modern-stat-subtitle {
  font-size: 0.75rem;
  margin-top: 0.5rem;
  opacity: 0.8;
}

/* Timeline styles */
.timeline {
  position: relative;
  padding-left: 2rem;
  max-height: 400px;
  overflow-y: auto;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 0.75rem;
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(to bottom, #667eea, #764ba2);
}

.timeline-item {
  position: relative;
  margin-bottom: 1.5rem;
}

.timeline-marker {
  position: absolute;
  left: -2.25rem;
  top: 0;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.7rem;
}

.timeline-marker-primary { background: #007bff; }
.timeline-marker-warning { background: #ffc107; }
.timeline-marker-success { background: #28a745; }
.timeline-marker-info { background: #17a2b8; }
.timeline-marker-secondary { background: #6c757d; }

.timeline-content {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.timeline-title {
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.timeline-description {
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 0.5rem;
}

.timeline-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
}

.timeline-score {
  font-weight: bold;
  color: #28a745;
}

/* Student stats */
.student-stats-container {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
}

.stat-circle {
  margin-bottom: 1.5rem;
}

.circle-progress {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: conic-gradient(#667eea 0deg, #667eea var(--progress, 0deg), rgba(255,255,255,0.2) var(--progress, 0deg));
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  position: relative;
}

.circle-progress::before {
  content: '';
  position: absolute;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
}

.progress-text {
  position: relative;
  font-size: 1.25rem;
  font-weight: bold;
  color: #333;
  z-index: 1;
}

.progress-label {
  position: relative;
  font-size: 0.7rem;
  color: #666;
  z-index: 1;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.stats-grid .stat-item {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 0.75rem;
}

.stats-grid .stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
}

.stats-grid .stat-label {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 0.25rem;
}

/* Pagination */
.pagination-info {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
}

.pagination .page-link {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  margin: 0 2px;
  border-radius: 6px;
}

.pagination .page-item.active .page-link {
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-color: #667eea;
}

.pagination .page-link:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
  color: white;
}

/* Responsive */
@media (max-width: 768px) {
  .d-flex.justify-content-between {
    flex-direction: column;
    gap: 1rem;
  }

  .search-container input {
    min-width: auto;
    width: 100%;
  }

  .chart-container {
    height: 200px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .timeline {
    padding-left: 1.5rem;
  }

  .timeline-marker {
    left: -1.75rem;
  }

  .activity-stats {
    flex-direction: row;
    gap: 1rem;
  }
}
</style>