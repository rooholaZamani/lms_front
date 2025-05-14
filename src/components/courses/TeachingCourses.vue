<template>
  <div class="teaching-courses">
    <div class="container-fluid p-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>دوره‌های تدریس من</h2>
        <button class="btn btn-primary" @click="showCreateCourseModal">
          <i class="fas fa-plus me-2"></i> ایجاد دوره جدید
        </button>
      </div>

      <!-- فیلتر و جستجو -->
      <div class="card mb-4">
        <div class="card-body">
          <div class="row">
            <div class="col-md-4">
              <div class="form-group mb-3">
                <label for="searchQuery" class="form-label">جستجو</label>
                <div class="input-group">
                  <input
                      type="text"
                      class="form-control"
                      id="searchQuery"
                      v-model="searchQuery"
                      placeholder="عنوان دوره"
                  >
                  <button class="btn btn-primary" @click="searchCourses">
                    <i class="fas fa-search"></i>
                  </button>
                </div>
              </div>
            </div>
            <div class="col-md-3">
              <div class="form-group">
                <label for="statusFilter" class="form-label">وضعیت</label>
                <select class="form-select" id="statusFilter" v-model="statusFilter" @change="filterCourses">
                  <option value="all">همه</option>
                  <option value="active">فعال</option>
                  <option value="draft">پیش‌نویس</option>
                </select>
              </div>
            </div>
            <div class="col-md-3">
              <div class="form-group">
                <label for="sortBy" class="form-label">مرتب‌سازی بر اساس</label>
                <select class="form-select" id="sortBy" v-model="sortBy" @change="sortCourses">
                  <option value="date">تاریخ ایجاد</option>
                  <option value="name">نام</option>
                  <option value="students">تعداد دانش‌آموزان</option>
                </select>
              </div>
            </div>
            <div class="col-md-2 d-flex align-items-end">
              <button class="btn btn-secondary w-100" @click="resetFilters">
                <i class="fas fa-redo me-2"></i> بازنشانی
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- لیست دوره‌ها -->
      <loading-spinner :loading="loading">
        <empty-state
            v-if="filteredCourses.length === 0"
            title="دوره‌ای یافت نشد"
            description="شما هنوز هیچ دوره‌ای ایجاد نکرده‌اید یا دوره‌ای که با فیلترهای انتخابی مطابقت داشته باشد، وجود ندارد."
            icon="book-open"
        >
          <button class="btn btn-primary mt-3" @click="showCreateCourseModal">
            <i class="fas fa-plus me-2"></i> ایجاد دوره جدید
          </button>
        </empty-state>

        <div v-else>
          <div class="table-responsive">
            <table class="table table-striped table-hover">
              <thead class="table-dark">
              <tr>
                <th>عنوان دوره</th>
                <th>تعداد درس‌ها</th>
                <th>تعداد دانش‌آموزان</th>
                <th>وضعیت</th>
                <th>تاریخ ایجاد</th>
                <th>عملیات</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="course in paginatedCourses" :key="course.id">
                <td>{{ course.title }}</td>
                <td>{{ course.lessons ? course.lessons.length : 0 }}</td>
                <td>{{ course.enrolledStudents ? course.enrolledStudents.length : 0 }}</td>
                <td><span class="badge" :class="getCourseStatusClass(course)">{{ getCourseStatusText(course) }}</span></td>
                <td>{{ formatDate(course.createdAt) }}</td>
                <td>
                  <div class="d-flex gap-1">
                    <router-link :to="{ name: 'CourseDetail', params: { id: course.id } }" class="btn btn-sm btn-primary">
                      <i class="fas fa-eye"></i>
                    </router-link>
                    <button class="btn btn-sm btn-success" @click="editCourse(course)">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-info" @click="addLesson(course)">
                      <i class="fas fa-plus"></i> درس
                    </button>
                    <button class="btn btn-sm btn-warning" @click="addExam(course)">
                      <i class="fas fa-clipboard-check"></i> آزمون
                    </button>
                  </div>
                </td>
              </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <pagination
              v-if="totalPages > 1"
              :current-page="currentPage"
              :total-pages="totalPages"
              @page-changed="changePage"
          />
        </div>
      </loading-spinner>
    </div>

    <!-- مودال ایجاد دوره -->
    <base-modal
        modal-id="createCourseModal"
        title="ایجاد دوره جدید"
        ref="createCourseModal">
      <form @submit.prevent="createCourse">
        <div class="mb-3">
          <label for="title" class="form-label">عنوان دوره</label>
          <input type="text" class="form-control" id="title" v-model="newCourse.title" required>
        </div>
        <div class="mb-3">
          <label for="description" class="form-label">توضیحات دوره</label>
          <textarea class="form-control" id="description" v-model="newCourse.description" rows="3" required></textarea>
        </div>
        <div class="mb-3">
          <label for="level" class="form-label">سطح دوره</label>
          <select class="form-select" id="level" v-model="newCourse.level">
            <option value="مبتدی">مبتدی</option>
            <option value="متوسط">متوسط</option>
            <option value="پیشرفته">پیشرفته</option>
          </select>
        </div>
        <button type="submit" class="btn btn-primary w-100" :disabled="isSubmitting">
          <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          ایجاد دوره
        </button>
      </form>
    </base-modal>
  </div>
</template>

<script>
import axios from 'axios';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import Pagination from '@/components/common/Pagination.vue';
import BaseModal from '@/components/common/BaseModal.vue';
import { useFormatters } from '@/composables/useFormatters.js';
import formMixin from '@/mixins/formMixin.js';

export default {
  name: 'TeachingCourses',
  components: {
    LoadingSpinner,
    EmptyState,
    Pagination,
    BaseModal
  },
  mixins: [formMixin],
  setup() {
    const { formatDate } = useFormatters();

    return {
      formatDate
    };
  },
  data() {
    return {
      courses: [],
      loading: true,
      error: null,

      // pagination
      currentPage: 1,
      itemsPerPage: 10,
      totalCourses: 0,

      // filters
      searchQuery: '',
      statusFilter: 'all',
      sortBy: 'date',

      // new course
      newCourse: {
        title: '',
        description: '',
        level: 'متوسط'
      }
    };
  },
  computed: {
    filteredCourses() {
      let result = [...this.courses];

      // apply search filter
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        result = result.filter(course =>
            course.title.toLowerCase().includes(query)
        );
      }

      // apply status filter
      if (this.statusFilter !== 'all') {
        if (this.statusFilter === 'active') {
          result = result.filter(course => course.status === 'active');
        } else if (this.statusFilter === 'draft') {
          result = result.filter(course => course.status === 'draft');
        }
      }

      // apply sorting
      if (this.sortBy === 'name') {
        result.sort((a, b) => a.title.localeCompare(b.title));
      } else if (this.sortBy === 'students') {
        result.sort((a, b) => {
          const studentsA = a.enrolledStudents ? a.enrolledStudents.length : 0;
          const studentsB = b.enrolledStudents ? b.enrolledStudents.length : 0;
          return studentsB - studentsA;
        });
      } else {
        // default: date
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }

      return result;
    },
    totalPages() {
      return Math.ceil(this.filteredCourses.length / this.itemsPerPage);
    },
    paginatedCourses() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredCourses.slice(start, end);
    }
  },
  created() {
    this.fetchCourses();
  },
  methods: {
    async fetchCourses() {
      try {
        this.loading = true;

        // fetch courses taught by this teacher
        const response = await axios.get('/courses/teaching');
        this.courses = response.data;

        this.loading = false;
      } catch (error) {
        console.error('Error fetching courses:', error);
        this.error = 'مشکلی در دریافت لیست دوره‌ها رخ داد. لطفاً دوباره تلاش کنید.';
        this.loading = false;
      }
    },

    getCourseStatusClass(course) {
      if (course.status === 'active') {
        return 'bg-success';
      } else {
        return 'bg-secondary';
      }
    },

    getCourseStatusText(course) {
      if (course.status === 'active') {
        return 'فعال';
      } else {
        return 'پیش‌نویس';
      }
    },

    changePage(page) {
      this.currentPage = page;
      window.scrollTo(0, 0);
    },

    searchCourses() {
      this.currentPage = 1;
    },

    filterCourses() {
      this.currentPage = 1;
    },

    sortCourses() {
      this.currentPage = 1;
    },

    resetFilters() {
      this.searchQuery = '';
      this.statusFilter = 'all';
      this.sortBy = 'date';
      this.currentPage = 1;
    },

    showCreateCourseModal() {
      this.newCourse = {
        title: '',
        description: '',
        level: 'متوسط'
      };
      this.$refs.createCourseModal.show();
    },

    async createCourse() {
      this.startSubmitting();

      try {
        const response = await axios.post('/courses', this.newCourse);

        // add the new course to the list
        this.courses.unshift(response.data);

        // close the modal
        this.$refs.createCourseModal.hide();

        this.finishSubmitting('دوره با موفقیت ایجاد شد.');
      } catch (error) {
        console.error('Error creating course:', error);
        this.finishSubmitting(null, 'خطا در ایجاد دوره. لطفاً دوباره تلاش کنید.');
      }
    },

    editCourse(course) {
      // navigating to course edit page
      this.$router.push({
        name: 'CourseEdit',
        params: { id: course.id }
      });
    },

    addLesson(course) {
      // navigating to course detail with add lesson query
      this.$router.push({
        name: 'CourseDetail',
        params: { id: course.id },
        query: { addLesson: true }
      });
    },

    addExam(course) {
      // navigating to course detail with add exam query
      this.$router.push({
        name: 'CourseDetail',
        params: { id: course.id },
        query: { addExam: true }
      });
    }
  }
}
</script>

<style scoped>
.teaching-courses {
  min-height: calc(100vh - 56px);
}
</style>