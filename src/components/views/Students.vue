<template>
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: calc(100vh - 56px); padding: 2rem 1rem;">
    <div class="container-fluid">
      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="text-white mb-2">
            <i class="fas fa-user-graduate me-3"></i>
            مدیریت دانش‌آموزان
          </h2>
          <p class="text-white-50 mb-0">مشاهده و مدیریت اطلاعات دانش‌آموزان سیستم</p>
        </div>

        <div class="d-flex flex-wrap gap-2">
          <div class="search-container">
            <input
                type="text"
                class="modern-form-control"
                placeholder="جستجو دانش‌آموز..."
                v-model="searchQuery"
                @input="filterStudents"
                style="min-width: 250px;">
            <i class="fas fa-search search-icon"></i>
          </div>

          <button class="modern-btn modern-btn-success">
            <i class="fas fa-plus me-1"></i> افزودن دانش‌آموز
          </button>
        </div>
      </div>

      <loading-spinner :loading="loading">
        <!-- Students Table -->
        <div class="modern-card animate-slide-up">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <h5 class="modern-title mb-0">
              <i class="fas fa-list text-primary me-2"></i>
              لیست دانش‌آموزان
            </h5>
            <div class="d-flex gap-2">
              <button class="modern-btn modern-btn-secondary">
                <i class="fas fa-download me-1"></i> خروجی Excel
              </button>
              <button class="modern-btn modern-btn-secondary">
                <i class="fas fa-filter me-1"></i> فیلتر پیشرفته
              </button>
            </div>
          </div>

          <div class="modern-table-container" v-if="students.length > 0">
            <table class="modern-table table">
              <thead>
              <tr>
                <th>
                  <i class="fas fa-user me-1"></i>
                  نام و نام خانوادگی
                </th>
                <th>
                  <i class="fas fa-id-card me-1"></i>
                  شماره دانش‌آموزی
                </th>
                <th>
                  <i class="fas fa-envelope me-1"></i>
                  ایمیل
                </th>
                <th>
                  <i class="fas fa-books me-1"></i>
                  دوره‌های ثبت‌نام
                </th>
                <th>
                  <i class="fas fa-calendar me-1"></i>
                  تاریخ ثبت‌نام
                </th>
                <th>
                  <i class="fas fa-info-circle me-1"></i>
                  وضعیت
                </th>
                <th>
                  <i class="fas fa-cogs me-1"></i>
                  عملیات
                </th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="student in students" :key="student.id" class="student-row">
                <td>
                  <div class="d-flex align-items-center">
                    <div class="student-avatar me-3">
                      {{ getInitials(student.firstName, student.lastName) }}
                    </div>
                    <div>
                      <div class="fw-bold">{{ student.firstName }} {{ student.lastName }}</div>
                      <small class="text-muted">@{{ student.username || 'نامشخص' }}</small>
                    </div>
                  </div>
                </td>
                <td>
                    <span class="modern-badge modern-badge-secondary">
                      {{ student.studentId }}
                    </span>
                </td>
                <td>
                  <a :href="`mailto:${student.email}`" class="text-decoration-none">
                    {{ student.email }}
                  </a>
                </td>
                <td>
                  <div class="d-flex align-items-center">
                    <span class="fw-bold text-primary me-2">{{ student.enrolledCourses }}</span>
                    <i class="fas fa-book-open text-muted"></i>
                  </div>
                </td>
                <td>
                  <small>{{ formatDate(student.registrationDate) }}</small>
                </td>
                <td>
                    <span class="modern-badge" :class="getStatusBadgeClass(student.status)">
                      <i :class="getStatusIcon(student.status)" class="me-1"></i>
                      {{ getStatusText(student.status) }}
                    </span>
                </td>
                <td>
                  <div class="action-buttons">
                    <button class="action-btn primary" title="مشاهده جزئیات">
                      <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn success" title="ویرایش">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn warning" title="ارسال پیام">
                      <i class="fas fa-envelope"></i>
                    </button>
                    <button class="action-btn danger" title="غیرفعال‌سازی">
                      <i class="fas fa-ban"></i>
                    </button>
                  </div>
                </td>
              </tr>
              </tbody>
            </table>
          </div>

          <!-- Empty State -->
          <div v-else class="empty-state">
            <div class="text-center py-5">
              <div class="modern-logo large secondary mb-4">
                <i class="fas fa-user-graduate"></i>
              </div>
              <h4 class="text-muted mb-3">دانش‌آموزی یافت نشد</h4>
              <p class="text-muted mb-4">
                در حال حاضر هیچ دانش‌آموزی وجود ندارد یا هیچ موردی با معیارهای جستجوی شما مطابقت ندارد.
              </p>
              <div class="d-flex justify-content-center gap-2">
                <button class="modern-btn modern-btn-primary">
                  <i class="fas fa-plus me-1"></i> افزودن دانش‌آموز جدید
                </button>
                <button class="modern-btn modern-btn-secondary" @click="resetSearch">
                  <i class="fas fa-refresh me-1"></i> بازنشانی فیلتر
                </button>
              </div>
            </div>
          </div>

          <!-- Pagination -->
          <div v-if="students.length > 0" class="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
            <div class="text-muted">
              نمایش {{ students.length }} دانش‌آموز از مجموع {{ students.length }}
            </div>
            <nav>
              <ul class="pagination pagination-sm mb-0">
                <li class="page-item disabled">
                  <span class="page-link">قبلی</span>
                </li>
                <li class="page-item active">
                  <span class="page-link">1</span>
                </li>
                <li class="page-item disabled">
                  <span class="page-link">بعدی</span>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        <!-- Statistics Cards -->
        <div class="row mt-4">
          <div class="col-md-3 mb-3">
            <div class="modern-stat-card animate-slide-up" style="animation-delay: 0.1s;">
              <div class="modern-stat-icon text-success">
                <i class="fas fa-user-check"></i>
              </div>
              <div class="modern-stat-value">{{ getActiveStudentsCount() }}</div>
              <div class="modern-stat-label">دانش‌آموزان فعال</div>
            </div>
          </div>

          <div class="col-md-3 mb-3">
            <div class="modern-stat-card animate-slide-up" style="animation-delay: 0.2s;">
              <div class="modern-stat-icon text-warning">
                <i class="fas fa-user-clock"></i>
              </div>
              <div class="modern-stat-value">{{ getInactiveStudentsCount() }}</div>
              <div class="modern-stat-label">دانش‌آموزان غیرفعال</div>
            </div>
          </div>

          <div class="col-md-3 mb-3">
            <div class="modern-stat-card animate-slide-up" style="animation-delay: 0.3s;">
              <div class="modern-stat-icon text-danger">
                <i class="fas fa-user-times"></i>
              </div>
              <div class="modern-stat-value">{{ getSuspendedStudentsCount() }}</div>
              <div class="modern-stat-label">دانش‌آموزان تعلیق</div>
            </div>
          </div>

          <div class="col-md-3 mb-3">
            <div class="modern-stat-card animate-slide-up" style="animation-delay: 0.4s;">
              <div class="modern-stat-icon text-info">
                <i class="fas fa-chart-line"></i>
              </div>
              <div class="modern-stat-value">{{ getAverageCoursesPerStudent() }}</div>
              <div class="modern-stat-label">میانگین دوره به ازای هر دانش‌آموز</div>
            </div>
          </div>
        </div>
      </loading-spinner>
    </div>
  </div>
</template>

<script>
import { useFormatters } from '@/composables/useFormatters.js';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';

export default {
  name: 'Students',
  components: {
    LoadingSpinner
  },
  setup() {
    const { formatDate } = useFormatters();

    return {
      formatDate
    };
  },
  data() {
    return {
      loading: true,
      searchQuery: '',
      students: [],
      allStudents: []
    };
  },
  created() {
    setTimeout(() => {
      this.allStudents = this.generateSampleStudents();
      this.students = [...this.allStudents];
      this.loading = false;
    }, 800);
  },
  methods: {
    generateSampleStudents() {
      return [
        {
          id: 1,
          firstName: 'علی',
          lastName: 'محمدی',
          username: 'ali_mohammadi',
          studentId: '1401001',
          email: 'ali.mohammadi@example.com',
          enrolledCourses: 3,
          registrationDate: '2023-09-01T08:00:00Z',
          status: 'active'
        },
        {
          id: 2,
          firstName: 'مریم',
          lastName: 'احمدی',
          username: 'maryam_ahmadi',
          studentId: '1401002',
          email: 'maryam.ahmadi@example.com',
          enrolledCourses: 2,
          registrationDate: '2023-09-05T10:30:00Z',
          status: 'active'
        },
        {
          id: 3,
          firstName: 'حسین',
          lastName: 'رضایی',
          username: 'hossein_rezaei',
          studentId: '1401003',
          email: 'hossein.rezaei@example.com',
          enrolledCourses: 4,
          registrationDate: '2023-08-15T14:45:00Z',
          status: 'suspended'
        },
        {
          id: 4,
          firstName: 'فاطمه',
          lastName: 'کریمی',
          username: 'fatima_karimi',
          studentId: '1401004',
          email: 'fatima.karimi@example.com',
          enrolledCourses: 1,
          registrationDate: '2023-09-10T09:15:00Z',
          status: 'active'
        },
        {
          id: 5,
          firstName: 'محمد',
          lastName: 'حسینی',
          username: 'mohammad_hosseini',
          studentId: '1401005',
          email: 'mohammad.hosseini@example.com',
          enrolledCourses: 0,
          registrationDate: '2023-09-12T11:20:00Z',
          status: 'inactive'
        }
      ];
    },

    filterStudents() {
      if (!this.searchQuery.trim()) {
        this.students = [...this.allStudents];
        return;
      }

      const query = this.searchQuery.toLowerCase();
      this.students = this.allStudents.filter(student =>
          student.firstName.toLowerCase().includes(query) ||
          student.lastName.toLowerCase().includes(query) ||
          student.email.toLowerCase().includes(query) ||
          student.studentId.includes(query) ||
          (student.username && student.username.toLowerCase().includes(query))
      );
    },

    resetSearch() {
      this.searchQuery = '';
      this.students = [...this.allStudents];
    },

    getInitials(firstName, lastName) {
      return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
    },

    getStatusBadgeClass(status) {
      switch (status) {
        case 'active':
          return 'modern-badge-success';
        case 'inactive':
          return 'modern-badge-secondary';
        case 'suspended':
          return 'modern-badge-warning';
        default:
          return 'modern-badge-secondary';
      }
    },

    getStatusIcon(status) {
      switch (status) {
        case 'active':
          return 'fas fa-check-circle';
        case 'inactive':
          return 'fas fa-pause-circle';
        case 'suspended':
          return 'fas fa-exclamation-triangle';
        default:
          return 'fas fa-question-circle';
      }
    },

    getStatusText(status) {
      switch (status) {
        case 'active':
          return 'فعال';
        case 'inactive':
          return 'غیرفعال';
        case 'suspended':
          return 'تعلیق شده';
        default:
          return 'نامشخص';
      }
    },

    getActiveStudentsCount() {
      return this.allStudents.filter(s => s.status === 'active').length;
    },

    getInactiveStudentsCount() {
      return this.allStudents.filter(s => s.status === 'inactive').length;
    },

    getSuspendedStudentsCount() {
      return this.allStudents.filter(s => s.status === 'suspended').length;
    },

    getAverageCoursesPerStudent() {
      const total = this.allStudents.reduce((sum, student) => sum + student.enrolledCourses, 0);
      return this.allStudents.length > 0 ? Math.round(total / this.allStudents.length * 10) / 10 : 0;
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
  font-size: 0.85rem;
}

/* Action buttons */
.action-buttons {
  display: flex;
  gap: 0.25rem;
}

.action-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.75rem;
}

.action-btn.primary {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
}

.action-btn.success {
  background: rgba(40, 167, 69, 0.1);
  color: #28a745;
}

.action-btn.warning {
  background: rgba(255, 193, 7, 0.1);
  color: #ffc107;
}

.action-btn.danger {
  background: rgba(220, 53, 69, 0.1);
  color: #dc3545;
}

.action-btn:hover {
  transform: scale(1.1);
}

.action-btn.primary:hover {
  background: rgba(102, 126, 234, 0.2);
}

.action-btn.success:hover {
  background: rgba(40, 167, 69, 0.2);
}

.action-btn.warning:hover {
  background: rgba(255, 193, 7, 0.2);
}

.action-btn.danger:hover {
  background: rgba(220, 53, 69, 0.2);
}

/* Table enhancements */
.student-row {
  transition: all 0.2s ease;
}

.student-row:hover {
  background: rgba(102, 126, 234, 0.05);
  transform: translateY(-1px);
}

/* Empty state */
.empty-state {
  padding: 3rem 1rem;
}

/* Pagination */
.pagination .page-link {
  border-radius: 6px;
  margin: 0 2px;
  border: none;
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
}

.pagination .page-item.active .page-link {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
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

  .action-buttons {
    justify-content: center;
  }

  .student-avatar {
    width: 32px;
    height: 32px;
    font-size: 0.75rem;
  }
}

@media (max-width: 992px) {
  .modern-table-container {
    overflow-x: auto;
  }

  .modern-table {
    min-width: 800px;
  }
}

/* Animation delays */
.animate-slide-up {
  animation: slideInUp 0.6s ease forwards;
}

/* Dark mode enhancements */
@media (prefers-color-scheme: dark) {
  .student-row:hover {
    background: rgba(102, 126, 234, 0.1);
  }

  .search-icon {
    color: #a0aec0;
  }
}
</style>