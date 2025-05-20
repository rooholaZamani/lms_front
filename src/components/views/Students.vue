<template>
  <div class="students-container">
    <div class="container-fluid p-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>مدیریت دانش‌آموزان</h2>

        <div class="d-flex">
          <div class="me-2">
            <input
                type="text"
                class="form-control"
                placeholder="جستجو دانش‌آموز..."
                v-model="searchQuery"
                @input="filterStudents"
            >
          </div>

          <button class="btn btn-primary">
            <i class="fas fa-plus me-1"></i> افزودن دانش‌آموز
          </button>
        </div>
      </div>

      <loading-spinner :loading="loading">
        <div class="card">
          <div class="card-body">
            <div class="table-responsive">
              <table class="table table-hover">
                <thead class="table-light">
                <tr>
                  <th>نام و نام خانوادگی</th>
                  <th>شماره دانش‌آموزی</th>
                  <th>ایمیل</th>
                  <th>دوره‌های ثبت‌نام شده</th>
                  <th>تاریخ ثبت‌نام</th>
                  <th>وضعیت</th>
                  <th>عملیات</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="student in students" :key="student.id">
                  <td>{{ student.firstName }} {{ student.lastName }}</td>
                  <td>{{ student.studentId }}</td>
                  <td>{{ student.email }}</td>
                  <td>{{ student.enrolledCourses }}</td>
                  <td>{{ formatDate(student.registrationDate) }}</td>
                  <td>
                      <span class="badge" :class="getStatusClass(student.status)">
                        {{ getStatusText(student.status) }}
                      </span>
                  </td>
                  <td>
                    <div class="d-flex gap-1">
                      <button class="btn btn-sm btn-outline-primary" title="مشاهده جزئیات">
                        <i class="fas fa-eye"></i>
                      </button>
                      <button class="btn btn-sm btn-outline-success" title="ویرایش">
                        <i class="fas fa-edit"></i>
                      </button>
                      <button class="btn btn-sm btn-outline-danger" title="غیرفعال‌سازی">
                        <i class="fas fa-ban"></i>
                      </button>
                    </div>
                  </td>
                </tr>
                </tbody>
              </table>
            </div>

            <empty-state
                v-if="students.length === 0"
                title="دانش‌آموزی یافت نشد"
                description="در حال حاضر هیچ دانش‌آموزی وجود ندارد یا هیچ موردی با معیارهای جستجوی شما مطابقت ندارد."
                icon="user-graduate"
            />
          </div>
        </div>
      </loading-spinner>
    </div>
  </div>
</template>

<script>
import { useFormatters } from '@/composables/useFormatters.js';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import EmptyState from '@/components/common/EmptyState.vue';

export default {
  name: 'Students',
  components: {
    LoadingSpinner,
    EmptyState
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
      students: []
    };
  },
  created() {
    // در یک برنامه واقعی، این داده‌ها از API دریافت می‌شوند
    setTimeout(() => {
      this.students = this.generateSampleStudents();
      this.loading = false;
    }, 800);
  },
  methods: {
    generateSampleStudents() {
      // تولید داده‌های نمونه
      return [
        {
          id: 1,
          firstName: 'علی',
          lastName: 'محمدی',
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
          studentId: '1401005',
          email: 'mohammad.hosseini@example.com',
          enrolledCourses: 0,
          registrationDate: '2023-09-12T11:20:00Z',
          status: 'inactive'
        }
      ];
    },

    filterStudents() {
      // پیاده‌سازی فیلتر کردن دانش‌آموزان بر اساس جستجو
      console.log('جستجو برای:', this.searchQuery);
      // در یک برنامه واقعی، این بخش باید پیاده‌سازی شود
    },

    getStatusClass(status) {
      switch (status) {
        case 'active':
          return 'bg-success';
        case 'inactive':
          return 'bg-secondary';
        case 'suspended':
          return 'bg-warning';
        default:
          return 'bg-secondary';
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
    }
  }
}
</script>

<style scoped>
.students-container {
  min-height: calc(100vh - 56px);
}

.table th, .table td {
  vertical-align: middle;
}
</style>