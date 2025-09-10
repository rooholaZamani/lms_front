<template>
  <div class="students-container">
    <!-- Page Header -->
    <div class="page-header mb-4">
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <h2 class="page-title">
            <i class="fas fa-users me-2"></i>
            لیست دانش‌آموزان
          </h2>
          <p class="page-subtitle text-muted">مدیریت و مشاهده اطلاعات دانش‌آموزان</p>
        </div>
        <button class="modern-btn modern-btn-primary" @click="exportStudents">
          <i class="fas fa-download me-1"></i>
          خروجی Excel
        </button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="row mb-4">
      <div class="col-md-4">
        <div class="stat-card">
          <div class="stat-icon bg-primary">
            <i class="fas fa-users"></i>
          </div>
          <div class="stat-content">
            <h3>{{ stats.totalStudents }}</h3>
            <p>کل دانش‌آموزان</p>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="stat-card">
          <div class="stat-icon bg-success">
            <i class="fas fa-user-check"></i>
          </div>
          <div class="stat-content">
            <h3>{{ stats.activeStudents }}</h3>
            <p>فعال در هفته گذشته</p>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="stat-card">
          <div class="stat-icon bg-info">
            <i class="fas fa-chart-line"></i>
          </div>
          <div class="stat-content">
            <h3>{{ stats.averageProgress }}%</h3>
            <p>میانگین پیشرفت</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters and Search -->
    <div class="filters-section mb-4">
      <div class="row">
        <div class="col-md-6">
          <div class="search-container">
            <i class="fas fa-search search-icon"></i>
            <input
                type="text"
                class="form-control"
                placeholder="جستجو بر اساس نام، نام کاربری، ایمیل یا کد ملی..."
                v-model="searchQuery"
                @input="filterStudents">
          </div>
        </div>
        <div class="col-md-4">
          <select class="form-select" v-model="selectedCourseFilter" @change="filterByCourse(selectedCourseFilter)">
            <option value="">همه دوره‌ها</option>
            <option v-for="course in courses" :key="course.id" :value="course.id">
              {{ course.title }}
            </option>
          </select>
        </div>
        <div class="col-md-2">
          <button class="modern-btn modern-btn-outline-secondary w-100" @click="clearSearch">
            <i class="fas fa-times me-1"></i>
            پاک کردن
          </button>
        </div>
      </div>
    </div>

    <!-- Students Table -->
    <div class="students-table-container">
      <loading-spinner :loading="loading">
        <div v-if="paginatedStudents.length > 0" class="table-responsive">
          <table class="table table-hover modern-table">
            <thead>
            <tr>
              <th>دانش‌آموز</th>
              <th>اطلاعات تماس</th>
              <th>دوره‌ها</th>
              <th>پیشرفت کلی</th>
              <th>آخرین فعالیت</th>
              <th>عملیات</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="student in paginatedStudents" :key="student.id" class="student-row">
              <td>
                <div class="d-flex align-items-center">
                  <div class="student-avatar me-3">
                    {{ getStudentInitials(student) }}
                  </div>
                  <div>
                    <h6 class="mb-1">{{ getStudentName(student) }}</h6>
                    <small class="text-muted">@{{ student.username }}</small>
                  </div>
                </div>
              </td>
              <td>
                <div class="contact-info">
                  <div v-if="student.email">
                    <i class="fas fa-envelope me-1 text-muted"></i>
                    {{ student.email }}
                  </div>
                  <div v-if="student.phoneNumber">
                    <i class="fas fa-phone me-1 text-muted"></i>
                    {{ student.phoneNumber }}
                  </div>
                  <div v-if="student.nationalId">
                    <i class="fas fa-id-card me-1 text-muted"></i>
                    {{ student.nationalId }}
                  </div>
                </div>
              </td>
              <td>
                <div class="courses-list">
                    <span v-for="course in student.enrolledCourses" :key="course.id"
                          class="badge bg-light text-dark me-1 mb-1"
                          :title="course.title">
                      {{ truncateText(course.title, 15) }}
                    </span>
                </div>
              </td>
              <td>
                <div class="progress-container">
                  <div class="progress" style="height: 8px;">
                    <div
                        class="progress-bar"
                        :class="getProgressClass(student.overallProgress)"
                        role="progressbar"
                        :style="`width: ${student.overallProgress}%`"
                        :aria-valuenow="student.overallProgress"
                        aria-valuemin="0"
                        aria-valuemax="100">
                    </div>
                  </div>
                  <small class="text-muted mt-1">{{ student.overallProgress }}%</small>
                </div>
              </td>
              <td>
                <div class="d-flex flex-column">
                  <span>{{ formatDate(student.lastActivity) }}</span>
                  <small class="text-muted">{{ getTimeAgo(student.lastActivity) }}</small>
                </div>
              </td>
              <td>
                <div class="d-flex gap-1">
                  <button
                      class="modern-btn modern-btn-primary btn-sm"
                      @click="showStudentDetails(student)"
                      title="مشاهده جزئیات">
                    <i class="fas fa-eye"></i>
                  </button>
                  <div class="dropdown">
                    <button class="modern-btn modern-btn-outline-secondary btn-sm dropdown-toggle"
                            type="button" data-bs-toggle="dropdown">
                      <i class="fas fa-ellipsis-v"></i>
                    </button>
                    <ul class="dropdown-menu">
                      <li><a class="dropdown-item" href="#" @click="viewStudentSubmissions(student)">
                        <i class="fas fa-file-alt me-2"></i> تکالیف ارسالی
                      </a></li>
                      <li><a class="dropdown-item" href="#" @click="viewStudentExams(student)">
                        <i class="fas fa-clipboard-check me-2"></i> آزمون‌های شرکت کرده
                      </a></li>
                      <li><hr class="dropdown-divider"></li>
                      <li><a class="dropdown-item" href="#" @click="sendMessageToStudent(student)">
                        <i class="fas fa-envelope me-2"></i> ارسال پیام
                      </a></li>
                      <li><a class="dropdown-item text-danger" href="#" @click="removeStudentFromCourse(student)">
                        <i class="fas fa-user-times me-2"></i> حذف از دوره
                      </a></li>
                    </ul>
                  </div>
                </div>
              </td>
            </tr>
            </tbody>
          </table>

          <!-- Pagination -->
          <nav v-if="totalPages > 1" class="mt-4">
            <ul class="pagination justify-content-center">
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <button class="page-link" @click="changePage(currentPage - 1)" :disabled="currentPage === 1">
                  <i class="fas fa-chevron-right"></i>
                </button>
              </li>
              <li class="page-item" v-for="page in Math.min(totalPages, 5)" :key="page"
                  :class="{ active: currentPage === page }">
                <button class="page-link" @click="changePage(page)">{{ page }}</button>
              </li>
              <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                <button class="page-link" @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages">
                  <i class="fas fa-chevron-left"></i>
                </button>
              </li>
            </ul>
          </nav>

          <!-- Results Info -->
          <div class="results-info text-center text-muted mt-3">
            نمایش {{ startIndex + 1 }} تا {{ Math.min(startIndex + studentsPerPage, filteredStudents.length) }}
            از {{ filteredStudents.length }} دانش‌آموز
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="empty-state text-center py-5">
          <div class="empty-icon mb-3">
            <i class="fas fa-users fa-4x text-muted opacity-50"></i>
          </div>
          <h4 class="text-muted">
            {{ searchQuery || selectedCourseFilter ?
              'نتیجه‌ای با جستجوی شما مطابقت ندارد' : 'هنوز دانش‌آموزی در دوره‌های شما ثبت‌نام نکرده است' }}
          </h4>
          <p class="text-muted">
            {{ searchQuery || selectedCourseFilter ?
              'نتیجه‌ای با جستجوی شما مطابقت ندارد' : 'هنوز دانش‌آموزی در دوره‌های شما ثبت‌نام نکرده است' }}
          </p>
          <button v-if="searchQuery" class="modern-btn modern-btn-primary" @click="clearSearch">
            <i class="fas fa-times me-1"></i>
            پاک کردن جستجو
          </button>
        </div>
      </loading-spinner>
    </div>
  </div>

  <!-- Student Details Modal -->
  <div class="modal fade" id="studentDetailsModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-xl">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            <i class="fas fa-user me-2"></i>
            جزئیات دانش‌آموز
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body" v-if="selectedStudent">
          <div v-if="loadingStudentDetails" class="text-center py-4">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">در حال بارگذاری...</span>
            </div>
          </div>

          <div v-else>
            <!-- بخش اطلاعات پایه -->
            <div class="row mb-4">
              <div class="col-md-4 text-center">
                <div class="student-avatar-large mb-3">
                  {{ getStudentInitials(selectedStudent) }}
                </div>
                <h5>{{ getStudentName(selectedStudent) }}</h5>
                <p class="text-muted">@{{ selectedStudent.username }}</p>
                <div class="d-flex justify-content-center gap-2 mb-3">
                  <span class="badge bg-primary">{{ selectedStudent.enrolledCourses?.length || 0 }} دوره</span>
                  <span class="badge bg-success" v-if="selectedStudentProgress">
                    {{ Math.round(selectedStudentProgress.averageCompletion) }}% پیشرفت
                  </span>
                </div>
              </div>
              <div class="col-md-8">
                <div class="row">
                  <div class="col-md-6">
                    <h6>اطلاعات تماس</h6>
                    <ul class="list-unstyled">
                      <li v-if="selectedStudent.email">
                        <i class="fas fa-envelope me-2 text-muted"></i>
                        {{ selectedStudent.email }}
                      </li>
                      <li v-if="selectedStudent.phoneNumber">
                        <i class="fas fa-phone me-2 text-muted"></i>
                        {{ selectedStudent.phoneNumber }}
                      </li>
                      <li v-if="selectedStudent.nationalId">
                        <i class="fas fa-id-card me-2 text-muted"></i>
                        {{ selectedStudent.nationalId }}
                      </li>
                    </ul>
                  </div>
                  <div class="col-md-6">
                    <h6>آمار کلی</h6>
                    <ul class="list-unstyled">
                      <li v-if="selectedStudentProgress">
                        <i class="fas fa-clock me-2 text-muted"></i>
                        {{ $filters.formatTime(selectedStudentProgress.totalStudyTime || 0) }}
                      </li>
                      <li v-if="selectedStudentExams.length > 0">
                        <i class="fas fa-clipboard-check me-2 text-muted"></i>
                        {{ selectedStudentExams[0].examsTaken }} آزمون شرکت کرده
                      </li>
                      <li v-if="selectedStudentProgress">
                        <i class="fas fa-calendar me-2 text-muted"></i>
                        آخرین ورود: {{ formatDate(selectedStudentProgress.lastAccessed) }}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <!-- Navigation Tabs -->
            <ul class="nav nav-tabs" id="studentDetailsTab" role="tablist">
              <li class="nav-item" role="presentation">
                <button class="nav-link active" id="progress-tab" data-bs-toggle="tab"
                        data-bs-target="#progress" type="button" role="tab">
                  <i class="fas fa-chart-line me-1"></i>پیشرفت
                </button>
              </li>
              <li class="nav-item" role="presentation">
                <button class="nav-link" id="exams-tab" data-bs-toggle="tab"
                        data-bs-target="#exams" type="button" role="tab">
                  <i class="fas fa-clipboard-check me-1"></i>آزمون‌ها
                </button>
              </li>
              <li class="nav-item" role="presentation">
                <button class="nav-link" id="assignments-tab" data-bs-toggle="tab"
                        data-bs-target="#assignments" type="button" role="tab">
                  <i class="fas fa-tasks me-1"></i>تکالیف
                </button>
              </li>
              <li class="nav-item" role="presentation">
                <button class="nav-link" id="activity-tab" data-bs-toggle="tab"
                        data-bs-target="#activity" type="button" role="tab">
                  <i class="fas fa-history me-1"></i>فعالیت‌ها
                </button>
              </li>
            </ul>

            <div class="tab-content" id="studentDetailsTabContent">
              <!-- تب پیشرفت -->
              <div class="tab-pane fade show active" id="progress" role="tabpanel">
                <div v-if="selectedStudentProgress && selectedStudentProgress.courses && selectedStudentProgress.courses.length > 0">
                  <!-- خلاصه کلی عملکرد -->
                  <div class="row mb-4">
                    <div class="col-md-3">
                      <div class="card text-center">
                        <div class="card-body">
                          <h5 class="card-title text-primary">{{ Math.round(selectedStudentProgress.averageCompletion) }}%</h5>
                          <p class="card-text">میانگین پیشرفت</p>
                        </div>
                      </div>
                    </div>
                    <div class="col-md-3">
                      <div class="card text-center">
                        <div class="card-body">
                          <h5 class="card-title text-info">{{ selectedStudentProgress.enrolledCourses }}</h5>
                          <p class="card-text">دوره‌های ثبت‌نام</p>
                        </div>
                      </div>
                    </div>
                    <div class="col-md-3">
                      <div class="card text-center">
                        <div class="card-body">
                          <h5 class="card-title text-success">{{ Math.round((selectedStudentProgress.totalStudyTime || 0) / 60) }}</h5>
                          <p class="card-text">دقیقه مطالعه</p>
                        </div>
                      </div>
                    </div>
                    <div class="col-md-3">
                      <div class="card text-center">
                        <div class="card-body">
                          <h5 class="card-title text-warning">{{ Math.round((selectedStudentProgress.averageStudyTimePerCourse || 0) / 60) }}</h5>
                          <p class="card-text">میانگین دقیقه/دوره</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- جزئیات پیشرفت هر دوره -->
                  <div class="card">
                    <div class="card-header">
                      <h6 class="mb-0">
                        <i class="fas fa-chart-line me-2"></i>
                        پیشرفت در هر دوره
                      </h6>
                    </div>
                    <div class="card-body">
                      <div v-for="course in selectedStudentProgress.courses" :key="course.courseId" class="course-progress-item mb-3">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                          <h6 class="mb-0">{{ course.courseName }}</h6>
                          <span class="badge bg-primary">{{ Math.round(course.completion) }}%</span>
                        </div>
                        <div class="progress mb-2" style="height: 8px;">
                          <div class="progress-bar"
                               :class="getProgressClass(course.completion)"
                               role="progressbar"
                               :style="`width: ${course.completion}%`"
                               :aria-valuenow="course.completion"
                               aria-valuemin="0"
                               aria-valuemax="100">
                          </div>
                        </div>
                        <div class="row">
                          <div class="col-md-6">
                            <small class="text-muted">
                              <i class="fas fa-clock me-1"></i>
                              زمان مطالعه: {{ Math.round((course.studyTime || 0) / 60) }} دقیقه
                            </small>
                          </div>
                          <div class="col-md-6 text-end">
                            <small class="text-muted">
                              <i class="fas fa-calendar me-1"></i>
                              آخرین ورود: {{ formatDate(course.lastAccessed) }}
                            </small>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-else class="text-center text-muted py-4">
                  <i class="fas fa-chart-line fa-3x mb-3 text-muted"></i>
                  <p>اطلاعات پیشرفت در دسترس نیست</p>
                </div>
              </div>

              <!-- تب آزمون‌ها -->
              <div class="tab-pane fade" id="exams" role="tabpanel">
                <div v-if="selectedStudentExams && selectedStudentExams.length > 0">
                  <div class="row mb-4">
                    <div class="col-md-3">
                      <div class="card text-center">
                        <div class="card-body">
                          <h5 class="card-title text-primary">{{ selectedStudentExams[0].examsTaken }}</h5>
                          <p class="card-text">آزمون شرکت کرده</p>
                        </div>
                      </div>
                    </div>
                    <div class="col-md-3">
                      <div class="card text-center">
                        <div class="card-body">
                          <h5 class="card-title text-success">{{ Math.round(selectedStudentExams[0].averageScore) }}</h5>
                          <p class="card-text">میانگین نمره</p>
                        </div>
                      </div>
                    </div>
                    <div class="col-md-3">
                      <div class="card text-center">
                        <div class="card-body">
                          <h5 class="card-title text-info">{{ Math.round(selectedStudentExams[0].passRate) }}%</h5>
                          <p class="card-text">درصد قبولی</p>
                        </div>
                      </div>
                    </div>
                    <div class="col-md-3">
                      <div class="card text-center">
                        <div class="card-body">
                          <h5 class="card-title text-warning">{{ selectedStudentExams[0].recentActivityCount }}</h5>
                          <p class="card-text">فعالیت اخیر</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="alert alert-info">
                    <i class="fas fa-info-circle me-2"></i>
                    برای مشاهده جزئیات آزمون‌ها، به بخش مدیریت آزمون‌ها مراجعه کنید.
                    <br>
                    آمار فوق بر اساس آزمون‌های انجام شده در تمام دوره‌های این دانش‌آموز محاسبه شده است.
                  </div>
                </div>
                <div v-else class="text-center text-muted py-4">
                  <i class="fas fa-clipboard-check fa-3x mb-3 text-muted"></i>
                  <p>هنوز در هیچ آزمونی شرکت نکرده است</p>
                </div>
              </div>

              <!-- تب تکالیف -->
              <div class="tab-pane fade" id="assignments" role="tabpanel">
                <div v-if="selectedStudentAssignments && selectedStudentAssignments.length > 0">
                  <div class="table-responsive">
                    <table class="table table-hover">
                      <thead>
                      <tr>
                        <th>عنوان تکلیف</th>
                        <th>دوره</th>
                        <th>وضعیت</th>
                        <th>نمره</th>
                        <th>تاریخ ارسال</th>
                        <th>مهلت</th>
                      </tr>
                      </thead>
                      <tbody>
                      <tr v-for="assignment in selectedStudentAssignments" :key="assignment.id">
                        <td>{{ assignment.title || 'نامشخص' }}</td>
                        <td>{{ assignment.courseName || 'نامشخص' }}</td>
                        <td>
                            <span class="badge" :class="getAssignmentStatusClass(assignment.status)">
                              {{ getAssignmentStatusText(assignment.status) }}
                            </span>
                        </td>
                        <td>
                            <span v-if="assignment.score !== null && assignment.score !== undefined" class="fw-bold">
                              {{ assignment.score }}/{{ assignment.maxScore || 100 }}
                            </span>
                          <span v-else class="text-muted">نمره‌گذاری نشده</span>
                        </td>
                        <td>
                            <span v-if="assignment.submissionDate">
                              {{ formatDate(assignment.submissionDate) }}
                            </span>
                          <span v-else class="text-muted">ارسال نشده</span>
                        </td>
                        <td>
                            <span v-if="assignment.dueDate" :class="{'text-danger': new Date(assignment.dueDate) < new Date()}">
                              {{ formatDate(assignment.dueDate) }}
                            </span>
                          <span v-else class="text-muted">مهلت تعیین نشده</span>
                        </td>
                      </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <div v-else class="text-center text-muted py-4">
                  <i class="fas fa-tasks fa-3x mb-3 text-muted"></i>
                  <p>اطلاعات تکالیف در دسترس نیست</p>
                  <small class="text-muted">
                    برای مشاهده تکالیف دانش‌آموز، باید از طریق صفحه مدیریت تکالیف اقدام کنید
                  </small>
                </div>
              </div>

              <!-- تب فعالیت‌ها -->
              <div class="tab-pane fade" id="activity" role="tabpanel">
                <div v-if="selectedStudentActivity && selectedStudentActivity.length > 0">
                  <div class="timeline">
                    <div v-for="activity in selectedStudentActivity" :key="activity.id" class="timeline-item">
                      <div class="timeline-marker">
                        <i :class="getActivityIcon(activity.type)"></i>
                      </div>
                      <div class="timeline-content">
                        <div class="timeline-header">
                          <h6 class="mb-1">{{ activity.courseName }}</h6>
                          <small class="text-muted">{{ formatDate(activity.timestamp) }}</small>
                        </div>
                        <p class="mb-0">{{ activity.description }}</p>
                        <small v-if="activity.additionalInfo" class="text-info">{{ activity.additionalInfo }}</small>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-else class="text-center text-muted py-4">
                  <i class="fas fa-history fa-3x mb-3 text-muted"></i>
                  <p>هیچ فعالیت اخیری ثبت نشده است</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import LoadingSpinner from '../common/LoadingSpinner.vue';
import { useFormatters } from '../../composables/useFormatters';

export default {
  name: 'Students',
  components: {
    LoadingSpinner
  },
  setup() {
    const { formatDate, truncateText } = useFormatters();
    return { formatDate, truncateText };
  },
  data() {
    return {
      loading: true,
      searchQuery: '',
      selectedCourseFilter: '',
      currentPage: 1,
      studentsPerPage: 15,

      courses: [],
      allStudents: [],
      selectedStudent: null,
      loadingStudentDetails: false,
      selectedStudentProgress: null,
      selectedStudentExams: [],
      selectedStudentAssignments: [],
      selectedStudentActivity: [],

      stats: {
        totalStudents: 0,
        activeStudents: 0,
        averageProgress: 0
      }
    };
  },
  computed: {
    filteredStudents() {
      let filtered = [...this.allStudents];

      // Filter by search query
      if (this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase().trim();
        filtered = filtered.filter(student => {
          return (
              this.getStudentName(student).toLowerCase().includes(query) ||
              student.username.toLowerCase().includes(query) ||
              (student.email && student.email.toLowerCase().includes(query)) ||
              (student.nationalId && student.nationalId.includes(query)) ||
              (student.phoneNumber && student.phoneNumber.includes(query))
          );
        });
      }

      // Filter by course
      if (this.selectedCourseFilter) {
        filtered = filtered.filter(student => {
          return student.enrolledCourses?.some(course => course.id == this.selectedCourseFilter);
        });
      }

      return filtered;
    },

    paginatedStudents() {
      const startIndex = (this.currentPage - 1) * this.studentsPerPage;
      const endIndex = startIndex + this.studentsPerPage;
      return this.filteredStudents.slice(startIndex, endIndex);
    },

    totalPages() {
      return Math.ceil(this.filteredStudents.length / this.studentsPerPage);
    },

    startIndex() {
      return (this.currentPage - 1) * this.studentsPerPage;
    }
  },
  async mounted() {
    await this.fetchData();
  },
  methods: {
    async fetchData() {
      this.loading = true;
      try {
        await Promise.all([
          this.fetchCourses(),
          this.fetchStudentsOverview()
        ]);

        // استخراج دانش‌آموزان و محاسبه پیشرفت واقعی
        await this.extractStudentsWithRealProgress();

        // محاسبه آمار کلی
        this.calculateStats();
      } catch (error) {
        console.error('Error loading students data:', error);
        this.$toast.error('خطا در بارگذاری اطلاعات دانش‌آموزان');
      } finally {
        this.loading = false;
      }
    },

// متد بهینه شده برای استخراج دانش‌آموزان با پیشرفت واقعی
    async extractStudentsWithRealProgress() {
      const studentsMap = new Map();
      const courseProgressData = new Map();

      // مرحله 1: دریافت اطلاعات پیشرفت از تمام دوره‌ها
      const courseProgressPromises = this.courses.map(async (course) => {
        try {
          const response = await axios.get(`/analytics/teacher/course/${course.id}/students-summary`);
          const studentsInCourse = response.data || [];

          courseProgressData.set(course.id, studentsInCourse);
          return { courseId: course.id, students: studentsInCourse };
        } catch (error) {
          console.error(`Error fetching course ${course.id} students summary:`, error);
          courseProgressData.set(course.id, []);
          return { courseId: course.id, students: [] };
        }
      });

      // منتظر دریافت اطلاعات تمام دوره‌ها
      await Promise.all(courseProgressPromises);

      // مرحله 2: ساخت نقشه دانش‌آموزان
      this.courses.forEach(course => {
        if (course.enrolledStudents) {
          course.enrolledStudents.forEach(student => {
            if (!studentsMap.has(student.id)) {
              studentsMap.set(student.id, {
                ...student,
                enrolledCourses: [],
                overallProgress: 0,
                lastActivity: student.lastActivity || new Date().toISOString(),
                coursesProgress: []
              });
            }

            // اضافه کردن دوره به لیست دوره‌های دانش‌آموز
            const studentData = studentsMap.get(student.id);
            studentData.enrolledCourses.push({
              id: course.id,
              title: course.title,
              enrollmentDate: student.enrollmentDate || new Date().toISOString()
            });

            // اضافه کردن اطلاعات پیشرفت در این دوره
            const studentsInCourse = courseProgressData.get(course.id) || [];
            const studentProgressInCourse = studentsInCourse.find(s => s.studentId === student.id);

            if (studentProgressInCourse) {
              studentData.coursesProgress.push({
                courseId: course.id,
                courseName: course.title,
                completion: studentProgressInCourse.completion || 0,
                studyTime: studentProgressInCourse.studyTime || 0,
                lastAccessed: studentProgressInCourse.lastAccessed || student.lastActivity,
                completedLessons: studentProgressInCourse.completedLessons || 0,
                examsTaken: studentProgressInCourse.examsTaken || 0,
                averageScore: studentProgressInCourse.averageScore || 0
              });
            } else {
              // اگر اطلاعات پیشرفت موجود نیست، مقادیر پیش‌فرض
              studentData.coursesProgress.push({
                courseId: course.id,
                courseName: course.title,
                completion: 0,
                studyTime: 0,
                lastAccessed: student.lastActivity,
                completedLessons: 0,
                examsTaken: 0,
                averageScore: 0
              });
            }
          });
        }
      });

      // مرحله 3: محاسبه پیشرفت کلی هر دانش‌آموز
      Array.from(studentsMap.values()).forEach(student => {
        if (student.coursesProgress.length > 0) {
          // محاسبه میانگین پیشرفت
          const totalProgress = student.coursesProgress.reduce((sum, course) => sum + course.completion, 0);
          student.overallProgress = Math.round(totalProgress / student.coursesProgress.length);

          // به‌روزرسانی آخرین فعالیت
          const latestActivity = student.coursesProgress.reduce((latest, course) => {
            const courseDate = new Date(course.lastAccessed);
            const latestDate = new Date(latest);
            return courseDate > latestDate ? course.lastAccessed : latest;
          }, student.lastActivity);

          student.lastActivity = latestActivity;

          // محاسبه آمار اضافی
          student.totalStudyTime = student.coursesProgress.reduce((sum, course) => sum + (course.studyTime || 0), 0);
          student.totalExamsTaken = student.coursesProgress.reduce((sum, course) => sum + (course.examsTaken || 0), 0);
          student.averageExamScore = this.calculateAverageExamScore(student.coursesProgress);
        } else {
          student.overallProgress = 0;
          student.totalStudyTime = 0;
          student.totalExamsTaken = 0;
          student.averageExamScore = 0;
        }
      });

      this.allStudents = Array.from(studentsMap.values());
    },

// متد کمکی برای محاسبه میانگین نمره آزمون‌ها
    calculateAverageExamScore(coursesProgress) {
      const coursesWithExams = coursesProgress.filter(course =>
          course.examsTaken > 0 && course.averageScore > 0
      );

      if (coursesWithExams.length === 0) return 0;

      const totalWeightedScore = coursesWithExams.reduce((sum, course) =>
          sum + (course.averageScore * course.examsTaken), 0
      );
      const totalExams = coursesWithExams.reduce((sum, course) =>
          sum + course.examsTaken, 0
      );

      return totalExams > 0 ? Math.round(totalWeightedScore / totalExams) : 0;
    },

// اصلاح متد calculateStats برای استفاده از داده‌های واقعی
    calculateStats() {
      this.stats.totalStudents = this.allStudents.length;

      // محاسبه دانش‌آموزان فعال بر اساس آخرین فعالیت (یک هفته گذشته)
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      this.stats.activeStudents = this.allStudents.filter(student => {
        const lastActivity = new Date(student.lastActivity);
        return lastActivity >= oneWeekAgo;
      }).length;

      // محاسبه میانگین پیشرفت واقعی
      const studentsWithProgress = this.allStudents.filter(student => student.overallProgress > 0);
      if (studentsWithProgress.length > 0) {
        const totalProgress = studentsWithProgress.reduce((sum, student) => sum + student.overallProgress, 0);
        this.stats.averageProgress = Math.round(totalProgress / studentsWithProgress.length);
      } else {
        this.stats.averageProgress = 0;
      }
    },

// بهبود متد showStudentDetails برای استفاده از اطلاعات موجود
    async showStudentDetails(student) {
      this.selectedStudent = student;
      this.loadingStudentDetails = true;

      try {
        // اگر اطلاعات پیشرفت از قبل موجود است، از آن استفاده کن
        if (student.coursesProgress && student.coursesProgress.length > 0) {
          this.selectedStudentProgress = {
            courses: student.coursesProgress.map(course => ({
              courseId: course.courseId,
              courseName: course.courseName,
              completion: course.completion,
              studyTime: course.studyTime,
              lastAccessed: course.lastAccessed
            })),
            averageCompletion: student.overallProgress,
            totalStudyTime: student.totalStudyTime || 0,
            lastAccessed: student.lastActivity,
            enrolledCourses: student.enrolledCourses.length,
            averageStudyTimePerCourse: student.enrolledCourses.length > 0 ?
                Math.round((student.totalStudyTime || 0) / student.enrolledCourses.length) : 0
          };

          this.selectedStudentExams = [{
            examsTaken: student.totalExamsTaken || 0,
            averageScore: student.averageExamScore || 0,
            passRate: this.calculatePassRate(student), // تخمینی
            recentActivityCount: student.coursesProgress.filter(course => {
              const lastAccess = new Date(course.lastAccessed);
              const oneWeekAgo = new Date();
              oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
              return lastAccess >= oneWeekAgo;
            }).length
          }];
        } else {
          // اگر اطلاعات موجود نیست، از API بگیر
          await this.fetchStudentPerformance(student.id);
        }

        await this.fetchStudentAssignments(student.id);
        await this.fetchStudentActivity(student.id);
      } catch (error) {
        console.error('Error fetching student details:', error);
        this.$toast.error('خطا در دریافت جزئیات دانش‌آموز');
      } finally {
        this.loadingStudentDetails = false;
      }

      const modal = new bootstrap.Modal(document.getElementById('studentDetailsModal'));
      modal.show();
    },

    calculatePassRate(student) {
      if (!student.coursesProgress || student.coursesProgress.length === 0) {
        return 0;
      }

      let totalExams = 0;
      let passedExams = 0;

      student.coursesProgress.forEach(course => {
        const courseExams = course.examsTaken || 0;
        const courseAverage = course.averageScore || 0;
        const passingScore = 70; // نمره قبولی (می‌توانید از API دریافت کنید)

        totalExams += courseExams;

        // اگر میانگین دوره >= نمره قبولی باشد، آن دوره را قبول حساب می‌کنیم
        if (courseExams > 0 && courseAverage >= passingScore) {
          passedExams += courseExams;
        }
      });

      return totalExams > 0 ? Math.round((passedExams / totalExams) * 100) : 0;
    },
    async fetchCourses() {
      try {
        const response = await axios.get('/courses/teaching');
        this.courses = response.data;
      } catch (error) {
        console.error('Error fetching courses:', error);
        this.courses = [];
      }
    },

    async fetchStudentsOverview() {
      try {
        const response = await axios.get('/analytics/teacher/students-progress');
        const data = response.data;

        this.stats = {
          totalStudents: data.totalStudents || 0,
          activeStudents: data.activeStudents || 0,
          averageProgress: Math.round(data.averageCompletion || 0)
        };
      } catch (error) {
        console.error('Error fetching students overview:', error);
      }
    },

    async extractStudentsFromCourses() {
      const studentsMap = new Map();

      for (const course of this.courses) {
        if (course.enrolledStudents) {
          for (const student of course.enrolledStudents) {
            if (!studentsMap.has(student.id)) {
              studentsMap.set(student.id, {
                ...student,
                enrolledCourses: [],
                courseProgressData: [],
                overallProgress: 0,
                lastActivity: student.lastActivity || new Date().toISOString()
              });
            }

            // Add course to student's enrolled courses
            const studentData = studentsMap.get(student.id);
            studentData.enrolledCourses.push({
              id: course.id,
              title: course.title,
              enrollmentDate: student.enrollmentDate || new Date().toISOString()
            });

            // Fetch real progress for this course
            try {
              const progressResponse = await axios.get(`/courses/${course.id}`);
              const courseData = progressResponse.data;

              // Find progress for this specific student
              if (courseData.progress && courseData.progress.studentId === student.id) {
                studentData.courseProgressData.push({
                  courseId: course.id,
                  courseName: course.title,
                  completion: courseData.progress.completionPercentage || 0,
                  lastAccessed: courseData.progress.lastAccessed
                });
              }
            } catch (error) {
              console.error(`Error fetching progress for course ${course.id}, student ${student.id}:`, error);
              // Fallback with 0 progress
              studentData.courseProgressData.push({
                courseId: course.id,
                courseName: course.title,
                completion: 0,
                lastAccessed: null
              });
            }
          }
        }
      }

      this.allStudents = Array.from(studentsMap.values());

      // Calculate real overall progress for each student

      this.allStudents.forEach(student => {
        console.log("this.allStudents:" + student.courseProgressData)
        if (student.courseProgressData && student.courseProgressData.length > 0) {
          const totalProgress = student.courseProgressData.reduce((sum, course) => sum + course.completion, 0);
          student.overallProgress = Math.round(totalProgress / student.courseProgressData.length);
        } else {
          student.overallProgress = 0;
        }
      });
    },



    // Helper methods
    getAssignmentStatusClass(status) {
      const statusClasses = {
        'SUBMITTED': 'bg-warning',
        'GRADED': 'bg-success',
        'LATE': 'bg-danger',
        'PENDING': 'bg-secondary'
      };
      return statusClasses[status] || 'bg-secondary';
    },

    getAssignmentStatusText(status) {
      const statusTexts = {
        'SUBMITTED': 'ارسال شده',
        'GRADED': 'نمره‌گذاری شده',
        'LATE': 'دیرکرد',
        'PENDING': 'در انتظار'
      };
      return statusTexts[status] || 'نامشخص';
    },

    getActivityIcon(type) {
      const icons = {
        'LOGIN': 'fas fa-sign-in-alt text-success',
        'LESSON_VIEW': 'fas fa-eye text-info',
        'EXAM_SUBMIT': 'fas fa-clipboard-check text-primary',
        'ASSIGNMENT_SUBMIT': 'fas fa-upload text-warning',
        'CONTENT_COMPLETE': 'fas fa-check-circle text-success',
        'PERFORMANCE_SUMMARY': 'fas fa-chart-bar text-primary',
        'RECENT_ACTIVITY': 'fas fa-clock text-info'
      };
      return icons[type] || 'fas fa-circle text-muted';
    },

    async fetchStudentPerformance(studentId) {
      try {
        const response = await axios.get(`/analytics/teacher/student/${studentId}/performance`);
        const performanceData = response.data;

        // ساخت داده‌های پیشرفت برای تب Progress
        this.selectedStudentProgress = {
          courses: performanceData.courseDetails || [],
          averageCompletion: performanceData.averageCompletion || 0,
          totalStudyTime: performanceData.totalStudyTime || 0,
          lastAccessed: performanceData.lastAccessed,
          enrolledCourses: performanceData.enrolledCourses || 0,
          averageStudyTimePerCourse: performanceData.averageStudyTimePerCourse || 0
        };

        let passRate = 0;
        if (performanceData.examPassRate !== undefined) {
          passRate = performanceData.examPassRate;
        } else if (performanceData.courseDetails && performanceData.courseDetails.length > 0) {
          // محاسبه بر اساس جزئیات دوره‌ها
          let totalExams = 0;
          let passedExams = 0;

          performanceData.courseDetails.forEach(course => {
            const courseExams = course.examsTaken || 0;
            const courseAverage = course.averageScore || 0;
            const passingScore = course.passingScore || 70;

            totalExams += courseExams;
            if (courseExams > 0 && courseAverage >= passingScore) {
              passedExams += courseExams;
            }
          });

          passRate = totalExams > 0 ? Math.round((passedExams / totalExams) * 100) : 0;
        }
        // ساخت داده‌های آزمون برای تب Exams
        this.selectedStudentExams = [{
          examsTaken: performanceData.examsTaken || 0,
          averageScore: performanceData.averageExamScore || 0,
          passRate: performanceData.passRate  || 0,
          recentActivityCount: performanceData.recentActivityCount || 0
        }];

      } catch (error) {
        console.error('Error fetching student performance:', error);
        this.selectedStudentProgress = {
          courses: [],
          averageCompletion: 0,
          totalStudyTime: 0,
          lastAccessed: null
        };
        this.selectedStudentExams = [];
      }
    },

    async fetchStudentAssignments(studentId) {
      try {
        // متأسفانه API مستقیم برای معلم جهت دیدن تکالیف دانش‌آموز خاص وجود ندارد
        // پس تب تکالیف را خالی می‌گذاریم یا پیام مناسب نمایش می‌دهیم
        this.selectedStudentAssignments = [];
      } catch (error) {
        console.error('Error fetching student assignments:', error);
        this.selectedStudentAssignments = [];
      }
    },

    async fetchStudentActivity(studentId) {
      try {
        // استفاده از داده‌های performance برای ساخت activity summary
        const performanceResponse = await axios.get(`/analytics/teacher/student/${studentId}/performance`);
        const performanceData = performanceResponse.data;

        // ساخت activity summary از داده‌های performance
        this.selectedStudentActivity = [{
          id: 1,
          type: 'PERFORMANCE_SUMMARY',
          description: `میانگین تکمیل: ${performanceData.averageCompletion || 0}% - زمان مطالعه کل: ${Math.round((performanceData.totalStudyTime || 0) / 60)} دقیقه`,
          courseName: `${performanceData.enrolledCourses || 0} دوره`,
          timestamp: performanceData.lastAccessed || new Date().toISOString(),
          additionalInfo: `آزمون‌های شرکت کرده: ${performanceData.examsTaken || 0} - میانگین نمره: ${Math.round(performanceData.averageExamScore || 0)}`
        }];

        // اگر فعالیت‌های اخیر وجود دارد، آن‌ها را اضافه کنید
        if (performanceData.recentActivityCount > 0) {
          this.selectedStudentActivity.push({
            id: 2,
            type: 'RECENT_ACTIVITY',
            description: `${performanceData.recentActivityCount} فعالیت در ۷ روز گذشته`,
            courseName: 'فعالیت‌های اخیر',
            timestamp: performanceData.lastAccessed || new Date().toISOString()
          });
        }

      } catch (error) {
        console.error('Error fetching student activity:', error);
        this.selectedStudentActivity = [];
      }
    },

    getStudentName(student) {
      if (!student) return 'نامشخص';
      return student.firstName && student.lastName
          ? `${student.firstName} ${student.lastName}`
          : student.username;
    },

    getStudentInitials(student) {
      const firstName = student.firstName || '';
      const lastName = student.lastName || '';
      if (firstName && lastName) {
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
      }
      return student.username ? student.username.charAt(0).toUpperCase() : 'U';
    },

    getProgressClass(progress) {
      if (progress >= 80) return 'bg-success';
      if (progress >= 60) return 'bg-info';
      if (progress >= 40) return 'bg-warning';
      return 'bg-danger';
    },

    getTimeAgo(dateString) {
      if (!dateString) return '';

      const now = new Date();
      const date = new Date(dateString);
      const diffTime = Math.abs(now - date);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) return 'دیروز';
      if (diffDays < 7) return `${diffDays} روز قبل`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} هفته قبل`;
      return `${Math.floor(diffDays / 30)} ماه قبل`;
    },

    filterStudents() {
      this.currentPage = 1;
    },

    filterByCourse(courseId) {
      this.selectedCourseFilter = courseId;
      this.currentPage = 1;
    },

    clearSearch() {
      this.searchQuery = '';
      this.selectedCourseFilter = '';
      this.currentPage = 1;
    },

    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
    },

    sendMessageToStudent(student) {
      // Implementation for sending message
      this.$toast.info('قابلیت ارسال پیام به زودی اضافه می‌شود');
    },

    viewStudentSubmissions(student) {
      // Implementation for viewing submissions
      this.$toast.info('قابلیت مشاهده تکالیف به زودی اضافه می‌شود');
    },

    viewStudentExams(student) {
      // Implementation for viewing exams
      this.$toast.info('قابلیت مشاهده آزمون‌ها به زودی اضافه می‌شود');
    },

    removeStudentFromCourse(student) {
      // Implementation for removing student from course
      this.$toast.warning('قابلیت حذف دانش‌آموز از دوره به زودی اضافه می‌شود');
    },

    exportStudents() {
      // Implementation for exporting students data
      this.$toast.info('قابلیت خروجی Excel به زودی اضافه می‌شود');
    }
  }
}
</script>

<style scoped>
/* Page Layout */
.students-container {
  padding: 2rem;
  background: #f8f9fa;
  min-height: 100vh;
}

.page-header {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.page-title {
  color: #2c3e50;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.page-subtitle {
  margin-bottom: 0;
  font-size: 1.1rem;
}

/* Stats Cards */
.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
  margin-bottom: 1rem;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 1rem;
  color: white;
  font-size: 1.5rem;
}

.stat-content h3 {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
  color: #2c3e50;
}

.stat-content p {
  color: #6c757d;
  margin-bottom: 0;
  font-size: 0.9rem;
}

/* Filters Section */
.filters-section {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

/* Search container */
.search-container {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  pointer-events: none;
}

.search-container input {
  padding-left: 2.5rem;
}

/* Students Table */
.students-table-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.modern-table {
  margin-bottom: 0;
}

.modern-table th {
  background: #f8f9fa;
  border-bottom: 2px solid #e9ecef;
  font-weight: 600;
  color: #495057;
  padding: 1rem;
}

.modern-table td {
  padding: 1rem;
  vertical-align: middle;
  border-bottom: 1px solid #f1f3f4;
}

.student-row:hover {
  background: rgba(0, 123, 255, 0.05);
}

/* Student avatar */
.student-avatar {
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
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.student-avatar-large {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.5rem;
  margin: 0 auto;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
}

.student-avatar-large:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

/* Contact Info */
.contact-info {
  font-size: 0.9rem;
}

.contact-info div {
  margin-bottom: 0.25rem;
}

/* Courses List */
.courses-list .badge {
  margin-right: 0.25rem;
  margin-bottom: 0.25rem;
}

/* Progress Container */
.progress-container {
  min-width: 120px;
}

.progress {
  margin-bottom: 0.5rem;
}

.progress-bar {
  transition: width 0.6s ease;
}

/* Empty State */
.empty-state {
  padding: 4rem 2rem;
}

.empty-icon {
  opacity: 0.5;
}

/* Pagination */
.pagination .page-link {
  border: none;
  padding: 0.75rem 1rem;
  margin: 0 0.25rem;
  border-radius: 8px;
  color: #495057;
  transition: all 0.3s ease;
}

.pagination .page-link:hover {
  background: #e9ecef;
  color: #495057;
}

.pagination .page-item.active .page-link {
  background: #007bff;
  color: white;
}

/* Results Info */
.results-info {
  padding: 1rem;
  background: #f8f9fa;
  font-size: 0.9rem;
}

/* Modal Improvements */
.modal-xl {
  max-width: 1200px;
}

.modal-content {
  border: none;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.modal-header {
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  border-radius: 12px 12px 0 0;
}

/* Tab Content */
.tab-content {
  padding-top: 1.5rem;
}

/* Course Progress Items */
.course-progress-item {
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 1rem;
  background: #f8f9fa;
  transition: all 0.3s ease;
}

.course-progress-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

/* Timeline Styles */
.timeline {
  position: relative;
  padding-left: 30px;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 15px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #dee2e6;
}

.timeline-item {
  position: relative;
  margin-bottom: 2rem;
}

.timeline-marker {
  position: absolute;
  left: -22px;
  top: 0;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #fff;
  border: 3px solid #dee2e6;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
}

.timeline-content {
  background: #fff;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
}

.timeline-header h6 {
  margin-bottom: 0;
  color: #495057;
}

/* Card Hover Effects */
.card {
  transition: all 0.3s ease;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Table Improvements */
.table-hover tbody tr:hover {
  background-color: rgba(0, 123, 255, 0.05);
}

/* Badge Styles for Assignments */
.badge.bg-warning {
  background-color: #ffc107 !important;
  color: #000;
}

.badge.bg-success {
  background-color: #28a745 !important;
}

.badge.bg-danger {
  background-color: #dc3545 !important;
}

.badge.bg-secondary {
  background-color: #6c757d !important;
}

/* Empty State Improvements */
.text-center.text-muted.py-4 {
  padding: 3rem 1rem !important;
}

.text-center.text-muted.py-4 i {
  opacity: 0.5;
}

/* Loading State for Student Details */
.modal-body .spinner-border {
  width: 3rem;
  height: 3rem;
}

/* Responsive Improvements */
@media (max-width: 768px) {
  .students-container {
    padding: 1rem;
  }

  .page-header {
    padding: 1.5rem;
  }

  .stat-card {
    margin-bottom: 1rem;
  }

  .timeline {
    padding-left: 20px;
  }

  .timeline::before {
    left: 10px;
  }

  .timeline-marker {
    left: -15px;
    width: 25px;
    height: 25px;
    font-size: 0.7rem;
  }

  .timeline-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .course-progress-item .row {
    flex-direction: column;
  }

  .course-progress-item .col-md-6:last-child {
    text-align: start !important;
    margin-top: 0.5rem;
  }

  .modal-xl {
    max-width: 95%;
  }
}

/* Modern Button Styles */
.modern-btn {
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  text-decoration: none;
}

.modern-btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.modern-btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  color: white;
}

.modern-btn-outline-secondary {
  background: transparent;
  border: 1px solid #6c757d;
  color: #6c757d;
}

.modern-btn-outline-secondary:hover {
  background: #6c757d;
  color: white;
}

.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
}
</style>