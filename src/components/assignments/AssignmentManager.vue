<template>
  <div class="assignment-manager-container">
    <div class="container-fluid">
      <!-- Header -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="modern-card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <div>
                <h4 class="mb-0">
                  <i class="fas fa-tasks me-2"></i>
                  مدیریت تکالیف
                </h4>
                <p class="text-muted mb-0">ایجاد، ویرایش و مدیریت تکالیف دروس</p>
              </div>
              <div class="d-flex gap-2">
                <button @click="refreshData" class="modern-btn modern-btn-outline-primary" :disabled="loading">
                  <i class="fas fa-sync-alt me-1" :class="{'fa-spin': loading}"></i>
                  بروزرسانی
                </button>
                <button @click="showCreateModal" class="modern-btn modern-btn-primary">
                  <i class="fas fa-plus me-1"></i>
                  تکلیف جدید
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="row mb-4">
        <div class="col-md-3 col-sm-6 mb-3">
          <div class="stats-card modern-card">
            <div class="stats-content">
              <div class="stats-icon total">
                <i class="fas fa-clipboard-list"></i>
              </div>
              <div class="stats-info">
                <h5>{{ stats.totalAssignments }}</h5>
                <p>کل تکالیف</p>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-3 col-sm-6 mb-3">
          <div class="stats-card modern-card">
            <div class="stats-content">
              <div class="stats-icon active">
                <i class="fas fa-play-circle"></i>
              </div>
              <div class="stats-info">
                <h5>{{ stats.activeAssignments }}</h5>
                <p>فعال</p>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-3 col-sm-6 mb-3">
          <div class="stats-card modern-card">
            <div class="stats-content">
              <div class="stats-icon pending">
                <i class="fas fa-hourglass-half"></i>
              </div>
              <div class="stats-info">
                <h5>{{ stats.pendingGrades }}</h5>
                <p>در انتظار نمره‌گذاری</p>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-3 col-sm-6 mb-3">
          <div class="stats-card modern-card">
            <div class="stats-content">
              <div class="stats-icon submissions">
                <i class="fas fa-paper-plane"></i>
              </div>
              <div class="stats-info">
                <h5>{{ stats.totalSubmissions }}</h5>
                <p>کل ارسالی‌ها</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Filter and Search -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="modern-card">
            <div class="card-body">
              <div class="row">
                <div class="col-md-4 mb-3">
                  <label class="form-label">جستجو</label>
                  <div class="search-box">
                    <i class="fas fa-search"></i>
                    <input
                        type="text"
                        class="form-control"
                        placeholder="جستجو در تکالیف..."
                        v-model="searchQuery"
                        @input="filterAssignments"
                    >
                  </div>
                </div>
                <div class="col-md-3 mb-3">
                  <label class="form-label">فیلتر بر اساس کورس</label>
                  <select class="form-select" v-model="selectedCourse" @change="filterAssignments">
                    <option value="">همه کورس‌ها</option>
                    <option v-for="course in courses" :key="course.id" :value="course.id">
                      {{ course.title }}
                    </option>
                  </select>
                </div>
                <div class="col-md-3 mb-3">
                  <label class="form-label">وضعیت</label>
                  <select class="form-select" v-model="statusFilter" @change="filterAssignments">
                    <option value="">همه</option>
                    <option value="active">فعال</option>
                    <option value="expired">منقضی شده</option>
                    <option value="upcoming">آینده</option>
                  </select>
                </div>
                <div class="col-md-2 mb-3">
                  <label class="form-label">مرتب‌سازی</label>
                  <select class="form-select" v-model="sortBy" @change="sortAssignments">
                    <option value="createdAt">جدیدترین</option>
                    <option value="dueDate">نزدیک‌ترین مهلت</option>
                    <option value="title">عنوان</option>
                    <option value="submissions">تعداد ارسالی</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">در حال بارگذاری...</span>
        </div>
      </div>

      <!-- Assignments Grid -->
      <div v-else-if="filteredAssignments.length === 0" class="text-center py-5">
        <div class="empty-state">
          <i class="fas fa-inbox fa-4x text-muted mb-3"></i>
          <h5 class="text-muted">تکلیفی یافت نشد</h5>
          <p class="text-muted">تکلیف جدید ایجاد کنید یا فیلترهای خود را تغییر دهید.</p>
          <button @click="showCreateModal" class="modern-btn modern-btn-primary">
            <i class="fas fa-plus me-1"></i>
            ایجاد تکلیف جدید
          </button>
        </div>
      </div>

      <div v-else class="row">
        <div v-for="assignment in paginatedAssignments" :key="assignment.id" class="col-lg-6 col-xl-4 mb-4">
          <div class="assignment-card modern-card h-100">
            <div class="card-header">
              <div class="d-flex justify-content-between align-items-start">
                <div>
                  <h6 class="card-title mb-1">{{ assignment.title }}</h6>
                  <small class="text-muted">{{ assignment.lesson?.course?.title || 'نامشخص' }}</small>
                </div>
                <div class="dropdown">
                  <ul class="dropdown-menu">
                    <li><a class="dropdown-item" href="#" @click="editAssignment(assignment)">
                      <i class="fas fa-edit me-2"></i>ویرایش
                    </a></li>
                    <li><a class="dropdown-item" href="#" @click="duplicateAssignment(assignment)">
                      <i class="fas fa-copy me-2"></i>کپی
                    </a></li>
                    <li><hr class="dropdown-divider"></li>
                    <li><a class="dropdown-item text-danger" href="#" @click="deleteAssignment(assignment)">
                      <i class="fas fa-trash me-2"></i>حذف
                    </a></li>
                  </ul>
                </div>
              </div>
              <div class="assignment-status">
                <span class="badge" :class="getStatusBadge(assignment)">
                  {{ getStatusText(assignment) }}
                </span>
              </div>
            </div>

            <div class="card-body">
              <p v-if="assignment.description" class="card-text">
                {{ truncateText(assignment.description, 100) }}
              </p>

              <div class="assignment-meta">
                <div class="meta-item">
                  <i class="fas fa-calendar-plus text-info me-2"></i>
                  <span>ایجاد: {{ formatDate(assignment.createdAt) }}</span>
                </div>
                <div class="meta-item" v-if="assignment.dueDate">
                  <i class="fas fa-calendar-alt text-warning me-2"></i>
                  <span>مهلت: {{ formatDate(assignment.dueDate) }}</span>
                </div>
                <div class="meta-item">
                  <i class="fas fa-users text-primary me-2"></i>
                  <span>{{ assignment.submissionCount || 0 }} ارسالی</span>
                </div>
              </div>

              <!-- Assignment Files -->
              <div v-if="assignment.files && assignment.files.length > 0" class="assignment-files">
                <small class="text-muted">فایل‌های ضمیمه:</small>
                <div class="files-list">
                  <div v-for="file in assignment.files" :key="file.id" class="file-item">
                    <i :class="getFileIcon(file.originalFilename)" class="me-2"></i>
                    <span class="file-name">{{ file.originalFilename }}</span>
                    <small class="text-muted">({{ formatFileSize(file.size) }})</small>
                  </div>
                </div>
              </div>

              <!-- Progress Bar -->
              <div class="progress-section mt-3">
                <div class="d-flex justify-content-between align-items-center mb-1">
                  <small class="text-muted">پیشرفت ارسال</small>
                  <small class="text-muted">{{ getSubmissionProgress(assignment) }}%</small>
                </div>
                <div class="progress">
                  <div
                      class="progress-bar"
                      :class="getProgressBarClass(assignment)"
                      :style="{ width: getSubmissionProgress(assignment) + '%' }"
                  ></div>
                </div>
              </div>
            </div>

            <div class="card-footer">
              <div class="d-flex gap-2">
                <button @click="viewSubmissions(assignment)" class="modern-btn modern-btn-info flex-fill">
                  <i class="fas fa-eye me-1"></i>
                  مشاهده ارسالی‌ها
                </button>
                <button @click="viewAnalytics(assignment)" class="modern-btn modern-btn-outline-secondary">
                  <i class="fas fa-chart-bar"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="row">
        <div class="col-12">
          <nav aria-label="صفحه‌بندی تکالیف">
            <ul class="pagination justify-content-center">
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <a class="page-link" href="#" @click.prevent="changePage(currentPage - 1)">قبلی</a>
              </li>
              <li
                  v-for="page in visiblePages"
                  :key="page"
                  class="page-item"
                  :class="{ active: page === currentPage }"
              >
                <a class="page-link" href="#" @click.prevent="changePage(page)">{{ page }}</a>
              </li>
              <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                <a class="page-link" href="#" @click.prevent="changePage(currentPage + 1)">بعدی</a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>

    <!-- Create/Edit Assignment Modal -->
    <div class="modal fade" id="assignmentModal" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              {{ isEditing ? 'ویرایش تکلیف' : 'ایجاد تکلیف جدید' }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveAssignment">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">عنوان تکلیف <span class="text-danger">*</span></label>
                  <input
                      type="text"
                      class="form-control"
                      v-model="assignmentForm.title"
                      required
                      placeholder="عنوان تکلیف را وارد کنید"
                  >
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">درس <span class="text-danger">*</span></label>
                  <select class="form-select" v-model="assignmentForm.lessonId" required>
                    <option value="">انتخاب درس</option>
                    <option v-for="lesson in lessons" :key="lesson.id" :value="lesson.id">
                      {{ lesson.title }} ({{ lesson.course?.title }})
                    </option>
                  </select>
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label">توضیحات تکلیف</label>
                <textarea
                    class="form-control"
                    rows="4"
                    v-model="assignmentForm.description"
                    placeholder="توضیحات کامل تکلیف را وارد کنید..."
                ></textarea>
              </div>

              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">مهلت ارسال</label>
                  <input
                      type="datetime-local"
                      class="form-control"
                      v-model="assignmentForm.dueDate"
                  >
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">حداکثر امتیاز</label>
                  <input
                      type="number"
                      class="form-control"
                      v-model.number="assignmentForm.maxScore"
                      min="1"
                      max="100"
                      placeholder="100"
                  >
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label">فایل ضمیمه (اختیاری)</label>
                <input
                    type="file"
                    class="form-control"
                    @change="handleFileSelect"
                    accept=".pdf,.doc,.docx,.txt,.zip,.rar,.jpg,.jpeg,.png"
                >
                <small class="form-text text-muted">
                  فرمت‌های مجاز: PDF, DOC, DOCX, TXT, ZIP, RAR, JPG, PNG (حداکثر 10MB)
                </small>
              </div>

              <!-- Current file display (for editing) -->
              <div v-if="isEditing && assignmentForm.currentFile" class="mb-3">
                <label class="form-label">فایل فعلی</label>
                <div class="current-file">
                  <i :class="getFileIcon(assignmentForm.currentFile.originalFilename)" class="me-2"></i>
                  <span>{{ assignmentForm.currentFile.originalFilename }}</span>
                  <button type="button" class="btn btn-sm btn-outline-danger ms-2" @click="removeCurrentFile">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              </div>

              <div class="row">
                <div class="col-md-6 mb-3">
                  <div class="form-check">
                    <input
                        class="form-check-input"
                        type="checkbox"
                        v-model="assignmentForm.allowLateSubmission"
                        id="allowLateSubmission"
                    >
                    <label class="form-check-label" for="allowLateSubmission">
                      اجازه ارسال دیرهنگام
                    </label>
                  </div>
                </div>
                <div class="col-md-6 mb-3">
                  <div class="form-check">
                    <input
                        class="form-check-input"
                        type="checkbox"
                        v-model="assignmentForm.notifyStudents"
                        id="notifyStudents"
                    >
                    <label class="form-check-label" for="notifyStudents">
                      اطلاع‌رسانی به دانش‌آموزان
                    </label>
                  </div>
                </div>
              </div>

              <div class="d-flex gap-2">
                <button type="submit" class="modern-btn modern-btn-primary" :disabled="submitting">
                  <i class="fas fa-save me-1"></i>
                  {{ submitting ? 'در حال ذخیره...' : (isEditing ? 'ذخیره تغییرات' : 'ایجاد تکلیف') }}
                </button>
                <button type="button" class="modern-btn modern-btn-outline-secondary" data-bs-dismiss="modal">
                  <i class="fas fa-times me-1"></i>
                  انصراف
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Analytics Modal -->
    <div class="modal fade" id="analyticsModal" tabindex="-1">
      <div class="modal-dialog modal-xl">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">تحلیل تکلیف: {{ selectedAssignment?.title }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body" v-if="selectedAssignment">
            <div class="row">
              <div class="col-md-3 mb-3">
                <div class="analytics-card">
                  <div class="analytics-icon submissions">
                    <i class="fas fa-paper-plane"></i>
                  </div>
                  <div class="analytics-info">
                    <h4>{{ selectedAssignment.submissionCount || 0 }}</h4>
                    <p>کل ارسالی‌ها</p>
                  </div>
                </div>
              </div>
              <div class="col-md-3 mb-3">
                <div class="analytics-card">
                  <div class="analytics-icon graded">
                    <i class="fas fa-check-circle"></i>
                  </div>
                  <div class="analytics-info">
                    <h4>{{ selectedAssignment.gradedCount || 0 }}</h4>
                    <p>نمره‌گذاری شده</p>
                  </div>
                </div>
              </div>
              <div class="col-md-3 mb-3">
                <div class="analytics-card">
                  <div class="analytics-icon average">
                    <i class="fas fa-chart-line"></i>
                  </div>
                  <div class="analytics-info">
                    <h4>{{ selectedAssignment.averageScore || 0 }}%</h4>
                    <p>میانگین نمرات</p>
                  </div>
                </div>
              </div>
              <div class="col-md-3 mb-3">
                <div class="analytics-card">
                  <div class="analytics-icon late">
                    <i class="fas fa-clock"></i>
                  </div>
                  <div class="analytics-info">
                    <h4>{{ selectedAssignment.lateSubmissions || 0 }}</h4>
                    <p>ارسال دیرهنگام</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Chart placeholder -->
              <div class="chart-section mt-4">
                <h6>نمودار توزیع نمرات</h6>
                <div class="chart-container" style="position: relative; height: 300px;">
                  <canvas ref="scoreChart"></canvas>
                </div>
              </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {ref, computed, onMounted, onBeforeUnmount, watch, nextTick} from 'vue';
import Chart from 'chart.js/auto';
import axios from 'axios';

export default {
  name: 'AssignmentManager',
  setup() {
    const loading = ref(true);
    const submitting = ref(false);
    const isEditing = ref(false);
    const assignments = ref([]);
    const courses = ref([]);
    const lessons = ref([]);
    const selectedAssignment = ref(null);

    const scoreChart = ref(null);
    const chartInstance = ref(null);

    const searchQuery = ref('');
    const selectedCourse = ref('');
    const statusFilter = ref('');
    const sortBy = ref('createdAt');
    const currentPage = ref(1);
    const itemsPerPage = ref(12);

    const stats = ref({
      totalAssignments: 0,
      activeAssignments: 0,
      pendingGrades: 0,
      totalSubmissions: 0
    });

    const assignmentForm = ref({
      title: '',
      description: '',
      lessonId: '',
      dueDate: '',
      maxScore: 100,
      file: null,
      currentFile: null,
      allowLateSubmission: false,
      notifyStudents: true
    });

    const filteredAssignments = computed(() => {
      let result = [...assignments.value];

      // Search filter
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        result = result.filter(assignment =>
            assignment.title.toLowerCase().includes(query) ||
            assignment.description?.toLowerCase().includes(query)
        );
      }

      // Course filter
      if (selectedCourse.value) {
        result = result.filter(assignment =>
            assignment.lesson?.course?.id === selectedCourse.value
        );
      }

      // Status filter
      if (statusFilter.value) {
        const now = new Date();
        result = result.filter(assignment => {
          const dueDate = assignment.dueDate ? new Date(assignment.dueDate) : null;

          switch (statusFilter.value) {
            case 'active':
              return !dueDate || dueDate > now;
            case 'expired':
              return dueDate && dueDate <= now;
            case 'upcoming':
              return dueDate && dueDate > now;
            default:
              return true;
          }
        });
      }

      // Sort
      result.sort((a, b) => {
        switch (sortBy.value) {
          case 'title':
            return a.title.localeCompare(b.title);
          case 'dueDate':
            if (!a.dueDate && !b.dueDate) return 0;
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;
            return new Date(a.dueDate) - new Date(b.dueDate);
          case 'submissions':
            return (b.submissionCount || 0) - (a.submissionCount || 0);
          case 'createdAt':
          default:
            return new Date(b.createdAt) - new Date(a.createdAt);
        }
      });

      return result;
    });

    const totalPages = computed(() =>
        Math.ceil(filteredAssignments.value.length / itemsPerPage.value)
    );

    const paginatedAssignments = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value;
      const end = start + itemsPerPage.value;
      return filteredAssignments.value.slice(start, end);
    });

    const visiblePages = computed(() => {
      const pages = [];
      const start = Math.max(1, currentPage.value - 2);
      const end = Math.min(totalPages.value, start + 4);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      return pages;
    });

    const fetchData = async () => {
      loading.value = true;
      try {
        // Fetch courses and lessons
        const [coursesResponse, lessonsResponse] = await Promise.all([
          axios.get('/courses/teaching'),
          axios.get('/lessons/teaching')
        ]);

        courses.value = coursesResponse.data;
        lessons.value = lessonsResponse.data;

        // Fetch assignments for each lesson
        const allAssignments = [];
        let totalSubmissions = 0;
        let pendingGrades = 0;

        for (const lesson of lessons.value) {
          try {
            const assignmentsResponse = await axios.get(`/assignments/lesson/${lesson.id}`);
            const lessonAssignments = assignmentsResponse.data;

            for (const assignment of lessonAssignments) {
              try {
                const submissionsResponse = await axios.get(`/assignments/${assignment.id}/submissions`);
                const submissions = submissionsResponse.data;

                assignment.submissionCount = submissions.length;
                assignment.gradedCount = submissions.filter(s => s.graded).length;
                assignment.lesson = lesson;

                totalSubmissions += submissions.length;
                pendingGrades += submissions.filter(s => !s.graded).length;

                allAssignments.push(assignment);
              } catch (error) {
                console.error(`Error fetching submissions for assignment ${assignment.id}:`, error);
                assignment.submissionCount = 0;
                assignment.gradedCount = 0;
                assignment.lesson = lesson;
                allAssignments.push(assignment);
              }
            }
          } catch (error) {
            console.error(`Error fetching assignments for lesson ${lesson.id}:`, error);
          }
        }

        assignments.value = allAssignments;

        const now = new Date();
        const activeAssignments = allAssignments.filter(a =>
            !a.dueDate || new Date(a.dueDate) > now
        );

        stats.value = {
          totalAssignments: allAssignments.length,
          activeAssignments: activeAssignments.length,
          pendingGrades: pendingGrades,
          totalSubmissions: totalSubmissions
        };

      } catch (error) {
        console.error('Error fetching data:', error);
        this.$toast.error('خطا در دریافت اطلاعات');
      } finally {
        loading.value = false;
      }
    };

    const refreshData = () => {
      fetchData();
    };

    const filterAssignments = () => {
      currentPage.value = 1;
    };

    const sortAssignments = () => {
      currentPage.value = 1;
    };

    const changePage = (page) => {
      if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page;
        window.scrollTo(0, 0);
      }
    };

    const formatDate = (dateString) => {
      if (!dateString) return '';
      return new Date(dateString).toLocaleString('fa-IR');
    };
    const initializeScoreChart = () => {
      if (!scoreChart.value || !selectedAssignment.value?.submissions) return;

      // پاک کردن نمودار قبلی
      if (chartInstance.value) {
        chartInstance.value.destroy();
      }

      const ctx = scoreChart.value.getContext('2d');
      const submissions = selectedAssignment.value.submissions || [];

      // محاسبه توزیع نمرات در بازه‌های 10 تایی
      const scoreRanges = ['0-10', '11-20', '21-30', '31-40', '41-50', '51-60', '61-70', '71-80', '81-90', '91-100'];
      const scoreCounts = new Array(10).fill(0);

      submissions.forEach(submission => {
        if (submission.score !== null && submission.score !== undefined) {
          const percentage = (submission.score / (submission.maxScore || 100)) * 100;
          const rangeIndex = Math.min(Math.floor(percentage / 10), 9);
          scoreCounts[rangeIndex]++;
        }
      });

      chartInstance.value = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: scoreRanges,
          datasets: [{
            label: 'تعداد دانش‌آموزان',
            data: scoreCounts,
            backgroundColor: 'rgba(54, 162, 235, 0.6)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 1
              }
            }
          }
        }
      });
    };

    const formatFileSize = (bytes) => {
      if (!bytes) return '0 B';
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(1024));
      return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    };

    const truncateText = (text, length) => {
      if (!text) return '';
      return text.length > length ? text.substring(0, length) + '...' : text;
    };

    const getStatusBadge = (assignment) => {
      if (!assignment.dueDate) return 'bg-primary';

      const now = new Date();
      const dueDate = new Date(assignment.dueDate);

      if (dueDate > now) return 'bg-success';
      return 'bg-danger';
    };

    const getStatusText = (assignment) => {
      if (!assignment.dueDate) return 'فعال';

      const now = new Date();
      const dueDate = new Date(assignment.dueDate);

      if (dueDate > now) return 'فعال';
      return 'منقضی شده';
    };

    const getFileIcon = (filename) => {
      const ext = filename.split('.').pop().toLowerCase();
      const iconMap = {
        pdf: 'fas fa-file-pdf text-danger',
        doc: 'fas fa-file-word text-primary',
        docx: 'fas fa-file-word text-primary',
        txt: 'fas fa-file-alt text-secondary',
        zip: 'fas fa-file-archive text-warning',
        rar: 'fas fa-file-archive text-warning',
        jpg: 'fas fa-file-image text-success',
        jpeg: 'fas fa-file-image text-success',
        png: 'fas fa-file-image text-success'
      };
      return iconMap[ext] || 'fas fa-file text-muted';
    };

    const getSubmissionProgress = (assignment) => {
      if (!assignment.submissionCount || assignment.submissionCount === 0) return 0;
      // Assume total students enrolled in the course - this would need actual data
      const totalStudents = 30; // This should come from actual enrolled students count
      return Math.min(Math.round((assignment.submissionCount / totalStudents) * 100), 100);
    };

    const getProgressBarClass = (assignment) => {
      const progress = getSubmissionProgress(assignment);
      if (progress >= 80) return 'bg-success';
      if (progress >= 50) return 'bg-warning';
      return 'bg-danger';
    };

    const showCreateModal = () => {
      isEditing.value = false;
      assignmentForm.value = {
        title: '',
        description: '',
        lessonId: '',
        dueDate: '',
        maxScore: 100,
        file: null,
        currentFile: null,
        allowLateSubmission: false,
        notifyStudents: true
      };

      const modal = new bootstrap.Modal(document.getElementById('assignmentModal'));
      modal.show();
    };

    const editAssignment = (assignment) => {
      isEditing.value = true;
      assignmentForm.value = {
        id: assignment.id,
        title: assignment.title,
        description: assignment.description || '',
        lessonId: assignment.lesson?.id || '',
        dueDate: assignment.dueDate ? new Date(assignment.dueDate).toISOString().slice(0, 16) : '',
        maxScore: assignment.maxScore || 100,
        file: null,
        currentFile: assignment.files && assignment.files.length > 0 ? assignment.files[0] : null,
        allowLateSubmission: assignment.allowLateSubmission || false,
        notifyStudents: true
      };

      const modal = new bootstrap.Modal(document.getElementById('assignmentModal'));
      modal.show();
    };

    const handleFileSelect = (event) => {
      assignmentForm.value.file = event.target.files[0];
    };

    const removeCurrentFile = () => {
      assignmentForm.value.currentFile = null;
    };

    const saveAssignment = async () => {
      submitting.value = true;
      try {
        const formData = new FormData();
        formData.append('title', assignmentForm.value.title);
        formData.append('description', assignmentForm.value.description);
        formData.append('dueDate', assignmentForm.value.dueDate);
        formData.append('maxScore', assignmentForm.value.maxScore);
        formData.append('allowLateSubmission', assignmentForm.value.allowLateSubmission);

        if (assignmentForm.value.file) {
          formData.append('file', assignmentForm.value.file);
        }

        if (isEditing.value) {
          await axios.put(`/assignments/${assignmentForm.value.id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          this.$toast.success('تکلیف با موفقیت ویرایش شد.');
        } else {
          await axios.post(`/assignments/lesson/${assignmentForm.value.lessonId}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          this.$toast.success('تکلیف با موفقیت ایجاد شد.');
        }

        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('assignmentModal'));
        modal.hide();

        // Refresh data
        await fetchData();
      } catch (error) {
        console.error('Error saving assignment:', error);
        this.$toast.error('خطا در ذخیره تکلیف');
      } finally {
        submitting.value = false;
      }
    };

    const duplicateAssignment = async (assignment) => {
      if (confirm(`آیا می‌خواهید تکلیف "${assignment.title}" را کپی کنید؟`)) {
        try {
          const formData = new FormData();
          formData.append('title', `${assignment.title} (کپی)`);
          formData.append('description', assignment.description || '');
          formData.append('maxScore', assignment.maxScore || 100);

          await axios.post(`/assignments/lesson/${assignment.lesson.id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });

          this.$toast.success('تکلیف با موفقیت کپی شد.');
          await fetchData();
        } catch (error) {
          console.error('Error duplicating assignment:', error);
          this.$toast.error('خطا در کپی تکلیف');
        }
      }
    };


    const deleteAssignment = async (assignment) => {
      if (confirm(`آیا می‌خواهید تکلیف "${assignment.title}" را حذف کنید؟ این عمل قابل بازگشت نیست.`)) {
        try {
          await axios.delete(`/assignments/${assignment.id}`);
          this.$toast.success('تکلیف با موفقیت حذف شد.');
          await fetchData();
        } catch (error) {
          console.error('Error deleting assignment:', error);
          this.$toast.error('خطا در حذف تکلیف');
        }
      }
    };

    const viewSubmissions = (assignment) => {
      window.open(`/assignments/${assignment.id}/submissions`, '_blank');
    };

    const viewAnalytics = (assignment) => {
      selectedAssignment.value = assignment;

      const modal = new bootstrap.Modal(document.getElementById('analyticsModal'));
      modal.show();
    };
    watch(selectedAssignment, (newAssignment) => {
      if (newAssignment) {
        nextTick(() => {
          initializeScoreChart();
        });
      }
    });

    onMounted(() => {
      fetchData();
    });
    onBeforeUnmount(() => {
      if (chartInstance.value) {
        chartInstance.value.destroy();
      }
    });

    return {
      loading,
      submitting,
      isEditing,
      assignments,
      courses,
      lessons,
      selectedAssignment,
      searchQuery,
      selectedCourse,
      statusFilter,
      sortBy,
      currentPage,
      stats,
      assignmentForm,
      filteredAssignments,
      totalPages,
      paginatedAssignments,
      visiblePages,
      refreshData,
      filterAssignments,
      sortAssignments,
      changePage,
      formatDate,
      formatFileSize,
      truncateText,
      getStatusBadge,
      getStatusText,
      getFileIcon,
      getSubmissionProgress,
      getProgressBarClass,
      showCreateModal,
      editAssignment,
      handleFileSelect,
      removeCurrentFile,
      saveAssignment,
      duplicateAssignment,
      deleteAssignment,
      viewSubmissions,
      viewAnalytics,
      scoreChart,
      initializeScoreChart
    };
  }
};
</script>

<style scoped>
.assignment-manager-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px 0;
}

.modern-card {
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 15px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  overflow: hidden;
}

.modern-card .card-header {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  border: none;
  padding: 1rem 1.5rem;
}

.modern-btn {
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-weight: 500;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.modern-btn-primary {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
}

.modern-btn-primary:hover {
  background: linear-gradient(45deg, #5a6fd8, #6a3093);
  transform: translateY(-1px);
}

.modern-btn-info {
  background: linear-gradient(45deg, #3498db, #2980b9);
  color: white;
}

.modern-btn-outline-primary {
  background: transparent;
  color: #667eea;
  border: 2px solid #667eea;
}

.modern-btn-outline-secondary {
  background: transparent;
  color: #6c757d;
  border: 2px solid #6c757d;
}

.stats-card {
  height: 100px;
  display: flex;
  align-items: center;
  transition: transform 0.3s ease;
}

.stats-card:hover {
  transform: translateY(-3px);
}

.stats-content {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 1rem;
}

.stats-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
  margin-right: 1rem;
}

.stats-icon.total {
  background: linear-gradient(45deg, #667eea, #764ba2);
}

.stats-icon.active {
  background: linear-gradient(45deg, #66bb6a, #43a047);
}

.stats-icon.pending {
  background: linear-gradient(45deg, #ffa726, #ff7043);
}

.stats-icon.submissions {
  background: linear-gradient(45deg, #42a5f5, #1e88e5);
}

.stats-info h5 {
  margin: 0;
  font-size: 1.8rem;
  font-weight: bold;
  color: #333;
}

.stats-info p {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
}

.search-box {
  position: relative;
}

.search-box i {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
}

.search-box .form-control {
  padding-left: 2.5rem;
}

.assignment-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 2px solid transparent;
}

.assignment-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  border-color: rgba(102, 126, 234, 0.3);
}

.assignment-status {
  margin-top: 0.5rem;
}

.assignment-meta {
  background: rgba(102, 126, 234, 0.05);
  padding: 0.75rem;
  border-radius: 6px;
  margin-top: 1rem;
}

.meta-item {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  font-size: 0.85rem;
}

.meta-item:last-child {
  margin-bottom: 0;
}

.assignment-files {
  background: rgba(52, 152, 219, 0.05);
  padding: 0.75rem;
  border-radius: 6px;
  border-left: 3px solid #3498db;
  margin-top: 1rem;
}

.files-list .file-item {
  display: flex;
  align-items: center;
  padding: 0.25rem 0;
  font-size: 0.85rem;
}

.file-name {
  margin-left: 0.5rem;
  margin-right: 0.5rem;
}

.progress-section {
  margin-top: 1rem;
}

.progress {
  height: 6px;
  border-radius: 3px;
  background-color: rgba(0, 0, 0, 0.1);
}

.progress-bar {
  border-radius: 3px;
  transition: width 0.3s ease;
}

.empty-state {
  text-align: center;
  padding: 3rem;
}

.current-file {
  background: rgba(102, 126, 234, 0.05);
  padding: 0.75rem;
  border-radius: 6px;
  border: 1px solid rgba(102, 126, 234, 0.1);
  display: flex;
  align-items: center;
}

.analytics-card {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.analytics-card:hover {
  transform: translateY(-3px);
}

.analytics-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
  margin: 0 auto 1rem;
}

.analytics-icon.submissions {
  background: linear-gradient(45deg, #42a5f5, #1e88e5);
}

.analytics-icon.graded {
  background: linear-gradient(45deg, #66bb6a, #43a047);
}

.analytics-icon.average {
  background: linear-gradient(45deg, #ffa726, #ff7043);
}

.analytics-icon.late {
  background: linear-gradient(45deg, #ef5350, #e53935);
}

.analytics-info h4 {
  margin: 0;
  font-size: 2rem;
  font-weight: bold;
  color: #333;
}

.analytics-info p {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
}

.chart-placeholder {
  background: rgba(0, 0, 0, 0.02);
  border: 2px dashed rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  padding: 3rem;
  text-align: center;
}

.pagination .page-link {
  border: none;
  border-radius: 8px;
  margin: 0 2px;
  color: #667eea;
  background: rgba(255, 255, 255, 0.8);
  transition: all 0.3s ease;
}

.pagination .page-link:hover {
  background: #667eea;
  color: white;
  transform: translateY(-1px);
}

.pagination .page-item.active .page-link {
  background: #667eea;
  border-color: #667eea;
}

.modal-content {
  border: none;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.modal-header {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  border-bottom: none;
  border-radius: 12px 12px 0 0;
}

.modal-header .btn-close {
  filter: invert(1);
}

.form-control, .form-select {
  border: 2px solid #e9ecef;
  border-radius: 8px;
  padding: 0.75rem;
  transition: all 0.3s ease;
}

.form-control:focus, .form-select:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 0.25rem rgba(102, 126, 234, 0.25);
}

@media (max-width: 768px) {
  .assignment-manager-container {
    padding: 10px;
  }

  .assignment-card:hover {
    transform: none;
  }

  .stats-content {
    flex-direction: column;
    text-align: center;
  }

  .stats-icon {
    margin-right: 0;
    margin-bottom: 0.5rem;
  }
}
</style>