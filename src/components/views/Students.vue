<template>
  <div class="modern-page-bg" style="min-height: calc(100vh - 56px); padding: 2rem 1rem;">
    <div class="container-fluid">
      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="text-white mb-2">
            <i class="fas fa-user-graduate me-3"></i>
            لیست دانش‌آموزان
          </h2>
          <p class="text-white-50 mb-0">مدیریت و مشاهده اطلاعات دانش‌آموزان دوره‌های شما</p>
        </div>

        <div class="d-flex flex-wrap gap-2">
<!--          <div class="search-container">-->
<!--            <input-->
<!--                type="text"-->
<!--                class="modern-form-control"-->
<!--                placeholder="جستجو در دانش‌آموزان..."-->
<!--                v-model="searchQuery"-->
<!--                @input="filterStudents"-->
<!--                style="min-width: 250px;">-->
<!--            <i class="fas fa-search search-icon"></i>-->
<!--          </div>-->

<!--          <div class="dropdown">-->
<!--            <button class="modern-btn modern-btn-outline text-gray dropdown-toggle" type="button" data-bs-toggle="dropdown">-->
<!--              <i class="fas fa-filter me-1"></i> فیلتر دوره-->
<!--            </button>-->
<!--            <ul class="dropdown-menu dropdown-menu-end">-->
<!--              <li><a class="dropdown-item" href="#" @click.prevent="filterByCourse('')">همه دوره‌ها</a></li>-->
<!--              <li v-for="course in courses" :key="course.id">-->
<!--                <a class="dropdown-item" href="#" @click.prevent="filterByCourse(course.id)">-->
<!--                  {{ course.title }}-->
<!--                </a>-->
<!--              </li>-->
<!--            </ul>-->
<!--          </div>-->

<!--          <button class="modern-btn modern-btn-secondary" @click="exportStudents">-->
<!--            <i class="fas fa-download me-1"></i> خروجی Excel-->
<!--          </button>-->
        </div>
      </div>

      <!-- Stats Cards -->
<!--      <div class="row mb-4">-->
<!--        <div class="col-lg-3 col-md-6 mb-3">-->
<!--          <div class="modern-stat-card animate-slide-up">-->
<!--            <div class="modern-stat-icon text-primary">-->
<!--              <i class="fas fa-users"></i>-->
<!--            </div>-->
<!--            <div class="modern-stat-value">{{ stats.totalStudents }}</div>-->
<!--            <div class="modern-stat-label">کل دانش‌آموزان</div>-->
<!--          </div>-->
<!--        </div>-->

<!--        <div class="col-lg-3 col-md-6 mb-3">-->
<!--          <div class="modern-stat-card animate-slide-up" style="animation-delay: 0.1s;">-->
<!--            <div class="modern-stat-icon text-success">-->
<!--              <i class="fas fa-user-check"></i>-->
<!--            </div>-->
<!--            <div class="modern-stat-value">{{ stats.activeStudents }}</div>-->
<!--            <div class="modern-stat-label">دانش‌آموزان فعال</div>-->
<!--          </div>-->
<!--        </div>-->

<!--        <div class="col-lg-3 col-md-6 mb-3">-->
<!--          <div class="modern-stat-card animate-slide-up" style="animation-delay: 0.2s;">-->
<!--            <div class="modern-stat-icon text-warning">-->
<!--              <i class="fas fa-graduation-cap"></i>-->
<!--            </div>-->
<!--            <div class="modern-stat-value">{{ stats.averageProgress }}%</div>-->
<!--            <div class="modern-stat-label">میانگین پیشرفت</div>-->
<!--          </div>-->
<!--        </div>-->

<!--        <div class="col-lg-3 col-md-6 mb-3">-->
<!--          <div class="modern-stat-card animate-slide-up" style="animation-delay: 0.3s;">-->
<!--            <div class="modern-stat-icon text-info">-->
<!--              <i class="fas fa-book"></i>-->
<!--            </div>-->
<!--            <div class="modern-stat-value">{{ courses.length }}</div>-->
<!--            <div class="modern-stat-label">دوره‌های فعال</div>-->
<!--          </div>-->
<!--        </div>-->
<!--      </div>-->

      <loading-spinner :loading="loading">
        <!-- Students Table -->
        <div v-if="filteredStudents.length > 0" class="modern-card animate-slide-up" style="animation-delay: 0.4s;">
          <div class="modern-table-container">
            <table class="modern-table table">
              <thead>
              <tr>
                <th><i class="fas fa-hashtag me-1"></i> #</th>
                <th><i class="fas fa-user me-1"></i> نام و نام خانوادگی</th>
                <th><i class="fas fa-at me-1"></i> نام کاربری</th>
                <th><i class="fas fa-envelope me-1"></i> ایمیل</th>
                <th><i class="fas fa-phone me-1"></i> شماره تماس</th>
                <th><i class="fas fa-id-card me-1"></i> کد ملی</th>
                <th><i class="fas fa-book me-1"></i> دوره‌ها</th>
                <th><i class="fas fa-chart-line me-1"></i> پیشرفت کلی</th>
                <th><i class="fas fa-calendar me-1"></i> آخرین فعالیت</th>
                <th><i class="fas fa-cogs me-1"></i> عملیات</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="(student, index) in paginatedStudents" :key="student.id" class="student-row">
                <td>{{ (currentPage - 1) * studentsPerPage + index + 1 }}</td>
                <td>
                  <div class="d-flex align-items-center">
                    <div class="student-avatar me-3">
                      {{ getStudentInitials(student) }}
                    </div>
                    <div>
                      <div class="fw-bold">{{ getStudentName(student) }}</div>
                      <small class="text-muted">سن: {{ student.age || 'نامشخص' }}</small>
                    </div>
                  </div>
                </td>
                <td>
                  <span class="modern-badge modern-badge-secondary">
                    {{ student.username }}
                  </span>
                </td>
                <td>{{ student.email || 'نامشخص' }}</td>
                <td>{{ student.phoneNumber || 'نامشخص' }}</td>
                <td>{{ student.nationalId || 'نامشخص' }}</td>
                <td>
                  <div class="d-flex flex-wrap gap-1">
                    <span v-for="course in student.enrolledCourses" :key="course.id"
                          class="modern-badge modern-badge-info"
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
                        @click="viewStudentDetails(student)"
                        title="مشاهده جزئیات">
                      <i class="fas fa-eye"></i>
                    </button>
                    <div class="dropdown">
                      <ul class="dropdown-menu">
                        <li><a class="dropdown-item" href="#" @click="viewStudentSubmissions(student)">
                          <i class="fas fa-file-alt me-2"></i> تکالیف ارسالی
                        </a></li>
                        <li><a class="dropdown-item" href="#" @click="viewStudentExams(student)">
                          <i class="fas fa-clipboard-check me-2"></i> آزمون‌های شرکت کرده
                        </a></li>
                        <li><hr class="dropdown-divider"></li>
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
          </div>

          <!-- Pagination -->
          <div v-if="totalPages > 1" class="d-flex justify-content-between align-items-center mt-4">
            <div class="pagination-info">
              نمایش {{ startIndex + 1 }} تا {{ endIndex }} از {{ filteredStudents.length }} دانش‌آموز
            </div>
            <nav>
              <ul class="pagination">
                <li class="page-item" :class="{ disabled: currentPage === 1 }">
                  <button class="page-link" @click="changePage(currentPage - 1)" :disabled="currentPage === 1">
                    قبلی
                  </button>
                </li>
                <li
                    v-for="page in visiblePages"
                    :key="page"
                    class="page-item"
                    :class="{ active: page === currentPage }"
                >
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
        </div>

        <!-- Empty State -->
        <div v-else class="modern-card text-center animate-slide-up" style="animation-delay: 0.5s;">
          <div class="py-5">
            <div class="modern-logo large secondary mb-4">
              <i class="fas fa-user-graduate"></i>
            </div>
            <h4 class="mb-3">دانش‌آموزی یافت نشد</h4>
            <p class="text-muted mb-4">
              {{ searchQuery ? 'نتیجه‌ای با جستجوی شما مطابقت ندارد' : 'هنوز دانش‌آموزی در دوره‌های شما ثبت‌نام نکرده است' }}
            </p>
            <button v-if="searchQuery" class="modern-btn modern-btn-primary" @click="clearSearch">
              <i class="fas fa-times me-1"></i>
              پاک کردن جستجو
            </button>
          </div>
        </div>
      </loading-spinner>
    </div>
  </div>

  <!-- Student Details Modal -->
  <div class="modal fade" id="studentDetailsModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            <i class="fas fa-user me-2"></i>
            جزئیات دانش‌آموز
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <!-- جایگزین کل محتوای modal-body شود -->
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
            {{ Math.round(selectedStudentProgress.averageProgress || 0) }}% پیشرفت
          </span>
                </div>
              </div>

              <div class="col-md-8">
                <div class="student-info">
                  <div class="info-row">
                    <strong>ایمیل:</strong>
                    <span>{{ selectedStudent.email || 'نامشخص' }}</span>
                  </div>
                  <div class="info-row">
                    <strong>شماره تماس:</strong>
                    <span>{{ selectedStudent.phoneNumber || 'نامشخص' }}</span>
                  </div>
                  <div class="info-row">
                    <strong>کد ملی:</strong>
                    <span>{{ selectedStudent.nationalId || 'نامشخص' }}</span>
                  </div>
                  <div class="info-row">
                    <strong>سن:</strong>
                    <span>{{ selectedStudent.age || 'نامشخص' }}</span>
                  </div>
                  <div class="info-row">
                    <strong>تاریخ ثبت‌نام:</strong>
                    <span>{{ formatDate(selectedStudent.enrollmentDate) }}</span>
                  </div>
                  <div class="info-row">
                    <strong>آخرین فعالیت:</strong>
                    <span>{{ getTimeAgo(selectedStudent.lastActivity) }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- تب‌های اطلاعات تفصیلی -->
            <ul class="nav nav-tabs mb-3" id="studentDetailsTabs" role="tablist">
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
                <div v-if="selectedStudentProgress">
                  <div class="row">
                    <div class="col-md-6 mb-3" v-for="course in selectedStudentProgress.courses" :key="course.id">
                      <div class="card h-100">
                        <div class="card-body">
                          <h6 class="card-title">{{ course.title }}</h6>
                          <div class="progress mb-2" style="height: 10px;">
                            <div class="progress-bar"
                                 :class="getProgressClass(course.completionPercentage)"
                                 role="progressbar"
                                 :style="`width: ${course.completionPercentage}%`">
                            </div>
                          </div>
                          <div class="d-flex justify-content-between text-small">
                            <span>{{ course.completedLessons }}/{{ course.totalLessons }} درس</span>
                            <span>{{ Math.round(course.completionPercentage) }}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-else class="text-center text-muted">اطلاعات پیشرفت در دسترس نیست</div>
              </div>

              <!-- تب آزمون‌ها -->
              <div class="tab-pane fade" id="exams" role="tabpanel">
                <div v-if="selectedStudentExams.length > 0">
                  <div class="table-responsive">
                    <table class="table table-sm">
                      <thead>
                      <tr>
                        <th>آزمون</th>
                        <th>دوره</th>
                        <th>نمره</th>
                        <th>وضعیت</th>
                        <th>تاریخ</th>
                      </tr>
                      </thead>
                      <tbody>
                      <tr v-for="exam in selectedStudentExams" :key="exam.id">
                        <td>{{ exam.title }}</td>
                        <td>{{ exam.courseName }}</td>
                        <td>
                    <span class="badge" :class="exam.passed ? 'bg-success' : 'bg-danger'">
                      {{ exam.score }}/{{ exam.totalScore }}
                    </span>
                        </td>
                        <td>
                    <span class="badge" :class="exam.passed ? 'bg-success' : 'bg-danger'">
                      {{ exam.passed ? 'قبول' : 'مردود' }}
                    </span>
                        </td>
                        <td>{{ formatDate(exam.submissionTime) }}</td>
                      </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <div v-else class="text-center text-muted">هنوز آزمونی ارسال نشده است</div>
              </div>

              <!-- تب تکالیف -->
              <div class="tab-pane fade" id="assignments" role="tabpanel">
                <div v-if="selectedStudentAssignments.length > 0">
                  <div class="table-responsive">
                    <table class="table table-sm">
                      <thead>
                      <tr>
                        <th>تکلیف</th>
                        <th>درس</th>
                        <th>نمره</th>
                        <th>وضعیت</th>
                        <th>تاریخ ارسال</th>
                      </tr>
                      </thead>
                      <tbody>
                      <tr v-for="assignment in selectedStudentAssignments" :key="assignment.id">
                        <td>{{ assignment.title }}</td>
                        <td>{{ assignment.lessonTitle }}</td>
                        <td>
                    <span v-if="assignment.score !== null"
                          class="badge bg-primary">{{ assignment.score }}/100</span>
                          <span v-else class="text-muted">بدون نمره</span>
                        </td>
                        <td>
                    <span class="badge"
                          :class="getAssignmentStatusClass(assignment.status)">
                      {{ getAssignmentStatusText(assignment.status) }}
                    </span>
                        </td>
                        <td>{{ formatDate(assignment.submissionTime) }}</td>
                      </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <div v-else class="text-center text-muted">هنوز تکلیفی ارسال نشده است</div>
              </div>

              <!-- تب فعالیت‌ها -->
              <div class="tab-pane fade" id="activity" role="tabpanel">
                <div v-if="selectedStudentActivity.length > 0">
                  <div class="timeline">
                    <div v-for="activity in selectedStudentActivity.slice(0, 10)"
                         :key="activity.id" class="timeline-item">
                      <div class="timeline-marker" :class="getActivityIcon(activity.type)"></div>
                      <div class="timeline-content">
                        <h6 class="mb-1">{{ activity.description }}</h6>
                        <small class="text-muted">
                          {{ activity.courseName }} - {{ getTimeAgo(activity.timestamp) }}
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-else class="text-center text-muted">فعالیت اخیری ثبت نشده است</div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="modern-btn modern-btn-secondary" data-bs-dismiss="modal">
            بستن
          </button>
          <button type="button" class="modern-btn modern-btn-primary" @click="viewStudentProgress(selectedStudent)">
            <i class="fas fa-chart-line me-1"></i>
            مشاهده پیشرفت
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import { useFormatters } from '@/composables/useFormatters.js';
import axios from 'axios';

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
    },

    endIndex() {
      return Math.min(this.startIndex + this.studentsPerPage, this.filteredStudents.length);
    },

    visiblePages() {
      const pages = [];
      const start = Math.max(1, this.currentPage - 2);
      const end = Math.min(this.totalPages, this.currentPage + 2);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      return pages;
    }
  },
  async created() {
    try {
      await this.fetchData();
    } catch (error) {
      console.error('Error fetching students data:', error);
      this.$toast.error('خطا در دریافت اطلاعات دانش‌آموزان');
    } finally {
      this.loading = false;
    }
  },
  methods: {
    async fetchData() {
      try {
        // دریافت دوره‌های معلم
        const coursesResponse = await axios.get('/courses/teaching');
        this.courses = coursesResponse.data;

        // استخراج دانش‌آموزان و غنی‌سازی اطلاعات
        await this.extractAndEnrichStudents();
        this.calculateStats();
      } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
      }
    },
    async extractAndEnrichStudents() {
      const studentsMap = new Map();

      // استخراج دانش‌آموزان از دوره‌ها
      this.courses.forEach(course => {
        if (course.enrolledStudents) {
          course.enrolledStudents.forEach(student => {
            if (!studentsMap.has(student.id)) {
              studentsMap.set(student.id, {
                ...student,
                enrolledCourses: [],
                overallProgress: 0,
                lastActivity: student.lastActivity || new Date().toISOString(),
                // اطلاعات اضافی که از API دریافت می‌شود
                age: null,
                phoneNumber: null,
                nationalId: null
              });
            }

            const studentData = studentsMap.get(student.id);
            studentData.enrolledCourses.push({
              id: course.id,
              title: course.title,
              enrollmentDate: student.enrollmentDate || new Date().toISOString()
            });
          });
        }
      });

      this.allStudents = Array.from(studentsMap.values());

      // غنی‌سازی اطلاعات دانش‌آموزان
      await this.enrichStudentData();
    },
    async enrichStudentData() {
      try {
        // دریافت اطلاعات تحلیلی برای هر دوره
        const enrichmentPromises = this.courses.map(async (course) => {
          try {
            const performanceResponse = await axios.get(`/analytics/teacher/course/${course.id}/performance`);
            return {
              courseId: course.id,
              performance: performanceResponse.data
            };
          } catch (error) {
            console.warn(`Could not fetch performance for course ${course.id}:`, error);
            return {
              courseId: course.id,
              performance: null
            };
          }
        });

        const coursePerformances = await Promise.allSettled(enrichmentPromises);

        // محاسبه پیشرفت واقعی برای هر دانش‌آموز
        this.allStudents.forEach(student => {
          let totalProgress = 0;
          let courseCount = 0;

          student.enrolledCourses.forEach(enrolledCourse => {
            const performanceData = coursePerformances.find(
                p => p.status === 'fulfilled' && p.value.courseId === enrolledCourse.id
            );

            if (performanceData && performanceData.value.performance) {
              // استفاده از داده‌های واقعی پیشرفت
              const avgCompletion = performanceData.value.performance.averageCompletion || 0;
              totalProgress += avgCompletion;
              courseCount++;
            }
          });

          // محاسبه میانگین پیشرفت
          student.overallProgress = courseCount > 0 ?
              Math.round(totalProgress / courseCount) : 0;
        });

        // تلاش برای دریافت اطلاعات کامل دانش‌آموزان (اختیاری)
        await this.fetchDetailedStudentInfo();

      } catch (error) {
        console.error('Error enriching student data:', error);
        // در صورت خطا، پیشرفت پیش‌فرض تنظیم شود
        this.allStudents.forEach(student => {
          if (!student.overallProgress) {
            student.overallProgress = 0;
          }
        });
      }
    },
    async fetchDetailedStudentInfo() {
      // تلاش برای دریافت اطلاعات کامل دانش‌آموزان
      // این بخش اختیاری است و در صورت وجود API مناسب فعال شود

      try {
        // اگر API ای برای دریافت لیست کامل دانش‌آموزان وجود داشت:
        // const response = await axios.get('/teacher/students/detailed');
        // و سپس اطلاعات را merge کنیم

        // فعلاً از mock data استفاده می‌کنیم برای نمایش
        this.allStudents.forEach(student => {
          if (!student.age) {
            // اطلاعات نمونه - در واقعیت باید از API دریافت شود
            student.age = 20 + Math.floor(Math.random() * 15); // سن بین 20-35
            student.phoneNumber = `0912${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}`;
            student.nationalId = Math.floor(Math.random() * 10000000000).toString().padStart(10, '0');
          }
        });
      } catch (error) {
        console.warn('Could not fetch detailed student info:', error);
      }
    },

    calculateStats() {
      this.stats.totalStudents = this.allStudents.length;

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      this.stats.activeStudents = this.allStudents.filter(student => {
        const lastActivity = new Date(student.lastActivity);
        return lastActivity > thirtyDaysAgo;
      }).length;

      const totalProgress = this.allStudents.reduce((sum, student) => sum + (student.overallProgress || 0), 0);
      this.stats.averageProgress = this.allStudents.length > 0 ?
          Math.round(totalProgress / this.allStudents.length) : 0;
    },
    // متدهای کمکی جدید:
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
        'CONTENT_COMPLETE': 'fas fa-check-circle text-success'
      };
      return icons[type] || 'fas fa-circle text-muted';
    },
    async showStudentDetails(student) {
      this.selectedStudent = student;
      this.loadingStudentDetails = true;

      try {
        // دریافت اطلاعات کامل دانش‌آموز
        await Promise.all([
          this.fetchStudentProgress(student.id),
          this.fetchStudentExamResults(student.id),
          this.fetchStudentAssignments(student.id),
          this.fetchStudentRecentActivity(student.id)
        ]);
      } catch (error) {
        console.error('Error fetching student details:', error);
        this.$toast.error('خطا در دریافت جزئیات دانش‌آموز');
      } finally {
        this.loadingStudentDetails = false;
      }

      const modal = new bootstrap.Modal(document.getElementById('studentDetailsModal'));
      modal.show();
    },

    async fetchStudentProgress(studentId) {
      try {
        const response = await axios.get(`/analytics/teacher/student/${studentId}/progress`);
        this.selectedStudentProgress = response.data;
      } catch (error) {
        console.error('Error fetching student progress:', error);
        this.selectedStudentProgress = null;
      }
    },

    async fetchStudentExamResults(studentId) {
      try {
        const response = await axios.get(`/analytics/teacher/student/${studentId}/exam-results`);
        this.selectedStudentExams = response.data;
      } catch (error) {
        console.error('Error fetching student exam results:', error);
        this.selectedStudentExams = [];
      }
    },

    async fetchStudentAssignments(studentId) {
      try {
        const response = await axios.get(`/assignments/submissions/student/${studentId}`);
        this.selectedStudentAssignments = response.data;
      } catch (error) {
        console.error('Error fetching student assignments:', error);
        this.selectedStudentAssignments = [];
      }
    },

    async fetchStudentRecentActivity(studentId) {
      try {
        const response = await axios.get(`/analytics/teacher/student/${studentId}/recent-activity`);
        this.selectedStudentActivity = response.data;
      } catch (error) {
        console.error('Error fetching student activity:', error);
        this.selectedStudentActivity = [];
      }
    },

    extractStudentsFromCourses() {
      const studentsMap = new Map();

      this.courses.forEach(course => {
        if (course.enrolledStudents) {
          course.enrolledStudents.forEach(student => {
            if (!studentsMap.has(student.id)) {
              studentsMap.set(student.id, {
                ...student,
                enrolledCourses: [],
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
          });
        }
      });

      this.allStudents = Array.from(studentsMap.values());

      // Calculate overall progress for each student (mock calculation)
      this.allStudents.forEach(student => {
        student.overallProgress = Math.floor(Math.random() * 101);
      });
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

    viewStudentDetails(student) {
      this.selectedStudent = student;
      const modal = new bootstrap.Modal(document.getElementById('studentDetailsModal'));
      modal.show();
    },

    viewStudentProgress(student) {
      this.$router.push({
        name: 'StudentProgress',
        params: { studentId: student.id }
      });
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
  font-weight: 700;
  font-size: 1.5rem;
  margin: 0 auto;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

/* Student row */
.student-row {
  transition: all 0.2s ease;
}

.student-row:hover {
  background: rgba(102, 126, 234, 0.05);
  transform: translateY(-1px);
}

/* Progress container */
.progress-container {
  min-width: 120px;
}

/* Button styles */
.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.8rem;
}

/* Student info in modal */
.student-info {
  background: rgba(248, 249, 250, 0.8);
  border-radius: 8px;
  padding: 1rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.info-row:last-child {
  border-bottom: none;
}

/* Pagination */
.pagination-info {
  color: #6c757d;
  font-size: 0.9rem;
}

.pagination {
  margin: 0;
}

.pagination .page-link {
  border-radius: 8px;
  margin: 0 2px;
  border: none;
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  transition: all 0.2s ease;
}

.pagination .page-item.active .page-link {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.pagination .page-link:hover {
  background: rgba(102, 126, 234, 0.2);
  transform: translateY(-1px);
}

/* Responsive */
@media (max-width: 768px) {
  .d-flex.justify-content-between.align-items-center {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch !important;
  }

  .search-container {
    order: 2;
  }

  .search-container input {
    min-width: auto;
    width: 100%;
  }

  .modern-table-container {
    overflow-x: auto;
  }

  .modern-table {
    min-width: 1000px;
  }

  .d-flex.gap-1 {
    flex-direction: column;
    gap: 0.25rem !important;
  }

  .btn-sm {
    width: 100%;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .student-row:hover {
    background: rgba(102, 126, 234, 0.1);
  }

  .student-info {
    background: rgba(45, 55, 72, 0.8);
  }

  .info-row {
    border-bottom-color: rgba(255, 255, 255, 0.1);
  }

  .student-avatar-large {
    width: 80px;
    height: 80px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 24px;
    font-weight: bold;
    margin: 0 auto;
  }

  .timeline {
    position: relative;
    padding-left: 30px;
  }

  .timeline-item {
    position: relative;
    margin-bottom: 20px;
  }

  .timeline-marker {
    position: absolute;
    left: -35px;
    top: 5px;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #007bff;
  }

  .timeline-content {
    background: #f8f9fa;
    padding: 10px 15px;
    border-radius: 8px;
    border-left: 3px solid #007bff;
  }

  .info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid #eee;
  }

  .info-row:last-child {
    border-bottom: none;
  }

  .pagination-info {
    color: #cbd5e0;
  }
}
</style>