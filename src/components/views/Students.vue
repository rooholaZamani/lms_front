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
          <div class="search-container">
            <input
                type="text"
                class="modern-form-control"
                placeholder="جستجو در دانش‌آموزان..."
                v-model="searchQuery"
                @input="filterStudents"
                style="min-width: 250px;">
            <i class="fas fa-search search-icon"></i>
          </div>

          <div class="dropdown">
            <button class="modern-btn modern-btn-outline text-gray dropdown-toggle" type="button" data-bs-toggle="dropdown">
              <i class="fas fa-filter me-1"></i> فیلتر دوره
            </button>
            <ul class="dropdown-menu dropdown-menu-end">
              <li><a class="dropdown-item" href="#" @click.prevent="filterByCourse('')">همه دوره‌ها</a></li>
              <li v-for="course in courses" :key="course.id">
                <a class="dropdown-item" href="#" @click.prevent="filterByCourse(course.id)">
                  {{ course.title }}
                </a>
              </li>
            </ul>
          </div>

          <button class="modern-btn modern-btn-secondary" @click="exportStudents">
            <i class="fas fa-download me-1"></i> خروجی Excel
          </button>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="row mb-4">
        <div class="col-lg-3 col-md-6 mb-3">
          <div class="modern-stat-card animate-slide-up">
            <div class="modern-stat-icon text-primary">
              <i class="fas fa-users"></i>
            </div>
            <div class="modern-stat-value">{{ stats.totalStudents }}</div>
            <div class="modern-stat-label">کل دانش‌آموزان</div>
          </div>
        </div>

        <div class="col-lg-3 col-md-6 mb-3">
          <div class="modern-stat-card animate-slide-up" style="animation-delay: 0.1s;">
            <div class="modern-stat-icon text-success">
              <i class="fas fa-user-check"></i>
            </div>
            <div class="modern-stat-value">{{ stats.activeStudents }}</div>
            <div class="modern-stat-label">دانش‌آموزان فعال</div>
          </div>
        </div>

        <div class="col-lg-3 col-md-6 mb-3">
          <div class="modern-stat-card animate-slide-up" style="animation-delay: 0.2s;">
            <div class="modern-stat-icon text-warning">
              <i class="fas fa-graduation-cap"></i>
            </div>
            <div class="modern-stat-value">{{ stats.averageProgress }}%</div>
            <div class="modern-stat-label">میانگین پیشرفت</div>
          </div>
        </div>

        <div class="col-lg-3 col-md-6 mb-3">
          <div class="modern-stat-card animate-slide-up" style="animation-delay: 0.3s;">
            <div class="modern-stat-icon text-info">
              <i class="fas fa-book"></i>
            </div>
            <div class="modern-stat-value">{{ courses.length }}</div>
            <div class="modern-stat-label">دوره‌های فعال</div>
          </div>
        </div>
      </div>

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
                    <button
                        class="modern-btn modern-btn-success btn-sm"
                        @click="viewStudentProgress(student)"
                        title="پیشرفت تحصیلی">
                      <i class="fas fa-chart-line"></i>
                    </button>
                    <button
                        class="modern-btn modern-btn-info btn-sm"
                        @click="sendMessageToStudent(student)"
                        title="ارسال پیام">
                      <i class="fas fa-envelope"></i>
                    </button>
                    <div class="dropdown">
                      <button class="modern-btn modern-btn-secondary btn-sm dropdown-toggle"
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
        <div class="modal-body" v-if="selectedStudent">
          <div class="row">
            <div class="col-md-4 text-center">
              <div class="student-avatar-large mb-3">
                {{ getStudentInitials(selectedStudent) }}
              </div>
              <h5>{{ getStudentName(selectedStudent) }}</h5>
              <p class="text-muted">@{{ selectedStudent.username }}</p>
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
                  <strong>تعداد دوره‌ها:</strong>
                  <span>{{ selectedStudent.enrolledCourses?.length || 0 }}</span>
                </div>
                <div class="info-row">
                  <strong>پیشرفت کلی:</strong>
                  <span>{{ selectedStudent.overallProgress }}%</span>
                </div>
                <div class="info-row">
                  <strong>آخرین فعالیت:</strong>
                  <span>{{ formatDate(selectedStudent.lastActivity) }}</span>
                </div>
              </div>

              <div class="mt-4">
                <h6>دوره‌های ثبت‌نام شده:</h6>
                <div class="d-flex flex-wrap gap-2">
                  <span v-for="course in selectedStudent.enrolledCourses"
                        :key="course.id"
                        class="modern-badge modern-badge-info">
                    {{ course.title }}
                  </span>
                </div>
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
        // Fetch teacher's courses with enrolled students
        const response = await axios.get('/courses/teaching');
        this.courses = response.data;

        // Extract unique students from all courses
        this.extractStudentsFromCourses();
        this.calculateStats();
      } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
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

    calculateStats() {
      this.stats.totalStudents = this.allStudents.length;
      this.stats.activeStudents = this.allStudents.filter(student => {
        const lastActivity = new Date(student.lastActivity);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return lastActivity > thirtyDaysAgo;
      }).length;

      const totalProgress = this.allStudents.reduce((sum, student) => sum + student.overallProgress, 0);
      this.stats.averageProgress = this.allStudents.length > 0 ?
          Math.round(totalProgress / this.allStudents.length) : 0;
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

  .pagination-info {
    color: #cbd5e0;
  }
}
</style>