<template>
  <div class="assignment-grading-table-container">
    <div class="container-fluid">
      <!-- Header -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="modern-card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <div>
                <h4 class="mb-0">
                  <i class="fas fa-clipboard-check me-2"></i>
                  جدول نمره‌گذاری تکالیف
                </h4>
                <p class="text-muted mb-0">بررسی و نمره‌گذاری ارسالی‌های دانش‌آموزان</p>
              </div>
              <div class="d-flex gap-2">
                <button @click="refreshData" class="modern-btn modern-btn-outline-primary" :disabled="loading">
                  <i class="fas fa-sync-alt me-1" :class="{'fa-spin': loading}"></i>
                  بروزرسانی
                </button>
                <button @click="exportToCSV" class="modern-btn modern-btn-success" :disabled="!hasSubmissions">
                  <i class="fas fa-download me-1"></i>
                  خروجی CSV
                </button>
                <button @click="bulkGrade" class="modern-btn modern-btn-warning" :disabled="selectedSubmissions.length === 0">
                  <i class="fas fa-star me-1"></i>
                  نمره‌گذاری گروهی ({{ selectedSubmissions.length }})
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Filter Section -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="modern-card">
            <div class="card-body">
              <div class="row">
                <div class="col-md-3 mb-3">
                  <label class="form-label">جستجو</label>
                  <div class="search-box">
                    <i class="fas fa-search"></i>
                    <input
                        type="text"
                        class="form-control"
                        placeholder="جستجو دانش‌آموز یا تکلیف..."
                        v-model="searchQuery"
                        @input="applyFilters"
                    >
                  </div>
                </div>
                <div class="col-md-2 mb-3">
                  <label class="form-label">کورس</label>
                  <select class="form-select" v-model="selectedCourse" @change="applyFilters">
                    <option value="">همه کورس‌ها</option>
                    <option v-for="course in courses" :key="course.id" :value="course.id">
                      {{ course.title }}
                    </option>
                  </select>
                </div>
                <div class="col-md-2 mb-3">
                  <label class="form-label">وضعیت</label>
                  <select class="form-select" v-model="statusFilter" @change="applyFilters">
                    <option value="">همه</option>
                    <option value="pending">در انتظار نمره‌گذاری</option>
                    <option value="graded">نمره‌گذاری شده</option>
                    <option value="late">ارسال دیرهنگام</option>
                  </select>
                </div>
                <div class="col-md-2 mb-3">
                  <label class="form-label">مرتب‌سازی</label>
                  <select class="form-select" v-model="sortBy" @change="applySorting">
                    <option value="submittedAt">جدیدترین ارسال</option>
                    <option value="studentName">نام دانش‌آموز</option>
                    <option value="assignmentTitle">عنوان تکلیف</option>
                    <option value="dueDate">مهلت تکلیف</option>
                  </select>
                </div>
                <div class="col-md-3 mb-3">
                  <label class="form-label">عملیات</label>
                  <div class="d-flex gap-2">
                    <button @click="selectAll" class="modern-btn modern-btn-outline-info flex-fill">
                      <i class="fas fa-check-square me-1"></i>
                      انتخاب همه
                    </button>
                    <button @click="clearSelection" class="modern-btn modern-btn-outline-secondary flex-fill">
                      <i class="fas fa-times me-1"></i>
                      لغو انتخاب
                    </button>
                  </div>
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

      <!-- Empty State -->
      <div v-else-if="!hasSubmissions" class="text-center py-5">
        <div class="empty-state">
          <i class="fas fa-clipboard-list fa-4x text-muted mb-3"></i>
          <h5 class="text-muted">ارسالی‌ای برای نمره‌گذاری وجود ندارد</h5>
          <p class="text-muted">ارسالی‌های دانش‌آموزان در اینجا نمایش داده خواهند شد.</p>
        </div>
      </div>

      <!-- Submissions Table -->
      <div v-else class="row">
        <div class="col-12">
          <div class="modern-card">
            <div class="card-header">
              <div class="d-flex justify-content-between align-items-center">
                <h6 class="mb-0">{{ filteredSubmissions.length }} ارسالی</h6>
                <div class="d-flex gap-2">
                  <span class="badge bg-warning">{{ pendingCount }} در انتظار</span>
                  <span class="badge bg-success">{{ gradedCount }} نمره‌گذاری شده</span>
                </div>
              </div>
            </div>

            <div class="card-body p-0">
              <div class="table-responsive">
                <table class="table modern-table mb-0">
                  <thead>
                  <tr>
                    <th scope="col" width="50">
                      <input
                          type="checkbox"
                          class="form-check-input"
                          :checked="isAllSelected"
                          @change="toggleSelectAll"
                      >
                    </th>
                    <th scope="col" width="60">#</th>
                    <th scope="col">دانش‌آموز</th>
                    <th scope="col">تکلیف</th>
                    <th scope="col">کورس</th>
                    <th scope="col">زمان ارسال</th>
                    <th scope="col">وضعیت</th>
                    <th scope="col">نمره</th>
                    <th scope="col" width="200">عملیات</th>
                  </tr>
                  </thead>
                  <tbody>
                  <tr
                      v-for="(submission, index) in paginatedSubmissions"
                      :key="submission.id"
                      :class="{ 'table-selected': selectedSubmissions.includes(submission.id) }"
                  >
                    <td>
                      <input
                          type="checkbox"
                          class="form-check-input"
                          :value="submission.id"
                          v-model="selectedSubmissions"
                      >
                    </td>
                    <td>{{ (currentPage - 1) * itemsPerPage + index + 1 }}</td>
                    <td>
                      <div class="student-info">
                        <div class="student-avatar">
                          {{ getStudentInitials(submission.student) }}
                        </div>
                        <div class="student-details">
                          <div class="student-name">{{ getStudentName(submission.student) }}</div>
                          <small class="text-muted">{{ submission.student?.username }}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div class="assignment-info">
                        <div class="assignment-title">{{ submission.assignment?.title }}</div>
                        <small class="text-muted">{{ truncateText(submission.assignment?.description, 50) }}</small>
                      </div>
                    </td>
                    <td>
                      <div class="course-info">
                        <span class="course-name">{{ submission.course?.title }}</span>
                      </div>
                    </td>
                    <td>
                      <div class="submission-time">
                        <div>{{ formatDate(submission.submittedAt) }}</div>
                        <small class="text-muted">{{ getTimeAgo(submission.submittedAt) }}</small>
                        <div v-if="isLateSubmission(submission)" class="late-indicator">
                          <i class="fas fa-exclamation-triangle text-danger me-1"></i>
                          <small class="text-danger">{{ getLateTime(submission) }} تاخیر</small>
                        </div>
                      </div>
                    </td>
                    <td>
                        <span class="badge" :class="getStatusBadgeClass(submission)">
                          {{ getStatusText(submission) }}
                        </span>
                    </td>
                    <td>
                      <div v-if="submission.graded" class="grade-display">
                          <span class="grade-score" :class="getGradeClass(submission.score)">
                            {{ submission.score }}/100
                          </span>
                      </div>
                      <div v-else class="text-muted">
                        <small>نمره‌گذاری نشده</small>
                      </div>
                    </td>
                    <td>
                      <div class="action-buttons">
                        <button
                            @click="viewSubmissionDetail(submission)"
                            class="btn btn-sm btn-outline-info me-1"
                            title="مشاهده جزئیات"
                        >
                          <i class="fas fa-eye"></i>
                        </button>
                        <button
                            v-if="!submission.graded"
                            @click="quickGrade(submission)"
                            class="btn btn-sm btn-success me-1"
                            title="نمره‌گذاری سریع"
                        >
                          <i class="fas fa-star"></i>
                        </button>
                        <button
                            v-else
                            @click="editGrade(submission)"
                            class="btn btn-sm btn-warning me-1"
                            title="ویرایش نمره"
                        >
                          <i class="fas fa-edit"></i>
                        </button>
                        <button
                            @click="downloadSubmissionFiles(submission)"
                            class="btn btn-sm btn-outline-primary"
                            title="دانلود فایل‌ها"
                            :disabled="!submission.files || submission.files.length === 0"
                        >
                          <i class="fas fa-download"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Pagination -->
            <div class="card-footer" v-if="totalPages > 1">
              <nav aria-label="صفحه‌بندی ارسالی‌ها">
                <ul class="pagination justify-content-center mb-0">
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
      </div>
    </div>

    <!-- Submission Detail Modal -->
    <div class="modal fade" id="submissionModal" tabindex="-1">
      <div class="modal-dialog modal-xl">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="fas fa-file-alt me-2"></i>
              جزئیات ارسالی: {{ selectedSubmission?.assignment?.title }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>

          <div class="modal-body" v-if="selectedSubmission">
            <div class="row">
              <!-- Student & Assignment Info -->
              <div class="col-md-4">
                <div class="info-section">
                  <h6 class="section-title">اطلاعات دانش‌آموز</h6>
                  <div class="info-card">
                    <div class="student-profile">
                      <div class="student-avatar large">
                        {{ getStudentInitials(selectedSubmission.student) }}
                      </div>
                      <div class="student-info">
                        <h6>{{ getStudentName(selectedSubmission.student) }}</h6>
                        <p class="text-muted">{{ selectedSubmission.student?.username }}</p>
                        <p class="text-muted" v-if="selectedSubmission.student?.email">
                          {{ selectedSubmission.student.email }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="info-section mt-4">
                  <h6 class="section-title">اطلاعات تکلیف</h6>
                  <div class="info-card">
                    <div class="info-row">
                      <strong>عنوان:</strong>
                      <span>{{ selectedSubmission.assignment?.title }}</span>
                    </div>
                    <div class="info-row">
                      <strong>کورس:</strong>
                      <span>{{ selectedSubmission.course?.title }}</span>
                    </div>
                    <div class="info-row" v-if="selectedSubmission.assignment?.description">
                      <strong>توضیحات:</strong>
                      <div>{{ selectedSubmission.assignment.description }}</div>
                    </div>
                    <div class="info-row" v-if="selectedSubmission.assignment?.dueDate">
                      <strong>مهلت:</strong>
                      <span :class="isLateSubmission(selectedSubmission) ? 'text-danger' : ''">
                        {{ formatDate(selectedSubmission.assignment.dueDate) }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Submission Content -->
              <div class="col-md-8">
                <div class="submission-section">
                  <h6 class="section-title">محتوای ارسالی</h6>

                  <!-- Submission Info -->
                  <div class="submission-meta mb-4">
                    <div class="row">
                      <div class="col-md-6">
                        <div class="meta-item">
                          <i class="fas fa-clock text-primary me-2"></i>
                          <span>زمان ارسال: {{ formatDate(selectedSubmission.submittedAt) }}</span>
                        </div>
                      </div>
                      <div class="col-md-6">
                        <div class="meta-item">
                          <i class="fas fa-calendar-check text-success me-2"></i>
                          <span>وضعیت: {{ getStatusText(selectedSubmission) }}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Student Comment -->
                  <div v-if="selectedSubmission.comment" class="comment-section mb-4">
                    <label class="form-label">نظر دانش‌آموز:</label>
                    <div class="comment-display">
                      {{ selectedSubmission.comment }}
                    </div>
                  </div>

                  <!-- Submitted Files -->
                  <div v-if="selectedSubmission.files && selectedSubmission.files.length > 0" class="files-section mb-4">
                    <label class="form-label">فایل‌های ارسالی:</label>
                    <div class="submitted-files">
                      <div v-for="file in selectedSubmission.files" :key="file.id" class="file-item">
                        <div class="file-info">
                          <i :class="getFileIcon(file.originalFilename)" class="me-2"></i>
                          <div>
                            <div class="file-name">{{ file.originalFilename }}</div>
                            <small class="text-muted">{{ formatFileSize(file.size) }}</small>
                          </div>
                        </div>
                        <div class="file-actions">
                          <button @click="downloadFile(file)" class="btn btn-sm btn-primary">
                            <i class="fas fa-download me-1"></i>
                            دانلود
                          </button>
                          <button v-if="isViewableFile(file)" @click="previewFile(file)" class="btn btn-sm btn-outline-info">
                            <i class="fas fa-eye me-1"></i>
                            پیش‌نمایش
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Grading Section -->
                  <div class="grading-section">
                    <h6 class="section-title">نمره‌گذاری</h6>
                    <form @submit.prevent="submitGrade">
                      <div class="row">
                        <div class="col-md-4 mb-3">
                          <label class="form-label">نمره (0-100)</label>
                          <input
                              type="number"
                              class="form-control"
                              v-model.number="gradingForm.score"
                              min="0"
                              max="100"
                              required
                              placeholder="نمره را وارد کنید"
                          >
                        </div>
                        <div class="col-md-4 mb-3">
                          <label class="form-label">وضعیت</label>
                          <select v-model="gradingForm.status" class="form-select">
                            <option value="GRADED">نمره‌گذاری شده</option>
                            <option value="NEEDS_REVISION">نیاز به بازنگری</option>
                            <option value="EXCELLENT">عالی</option>
                          </select>
                        </div>
                        <div class="col-md-4 mb-3">
                          <label class="form-label">تاریخ نمره‌گذاری</label>
                          <input
                              type="datetime-local"
                              class="form-control"
                              v-model="gradingForm.gradedAt"
                          >
                        </div>
                      </div>

                      <div class="mb-3">
                        <label class="form-label">بازخورد و نظرات</label>
                        <textarea
                            class="form-control"
                            rows="4"
                            v-model="gradingForm.feedback"
                            placeholder="بازخورد خود را برای دانش‌آموز بنویسید..."
                        ></textarea>
                      </div>

                      <div class="d-flex gap-2">
                        <button type="submit" class="modern-btn modern-btn-success" :disabled="submitting">
                          <i class="fas fa-check me-1"></i>
                          {{ submitting ? 'در حال ذخیره...' : 'ثبت نمره و بازخورد' }}
                        </button>
                        <button type="button" @click="saveAsDraft" class="modern-btn modern-btn-outline-warning">
                          <i class="fas fa-save me-1"></i>
                          ذخیره پیش‌نویس
                        </button>
                        <button type="button" @click="resetGradingForm" class="modern-btn modern-btn-outline-secondary">
                          <i class="fas fa-undo me-1"></i>
                          بازنشانی
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bulk Grading Modal -->
    <div class="modal fade" id="bulkGradingModal" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">نمره‌گذاری گروهی ({{ selectedSubmissions.length }} ارسالی)</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="alert alert-info">
              <i class="fas fa-info-circle me-2"></i>
              نمره و بازخورد انتخاب شده برای تمام ارسالی‌های انتخابی اعمال خواهد شد.
            </div>

            <form @submit.prevent="submitBulkGrade">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">نمره یکسان (0-100)</label>
                  <input
                      type="number"
                      class="form-control"
                      v-model.number="bulkGradingForm.score"
                      min="0"
                      max="100"
                      required
                      placeholder="نمره یکسان برای همه"
                  >
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">وضعیت</label>
                  <select v-model="bulkGradingForm.status" class="form-select">
                    <option value="GRADED">نمره‌گذاری شده</option>
                    <option value="NEEDS_REVISION">نیاز به بازنگری</option>
                    <option value="EXCELLENT">عالی</option>
                  </select>
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label">بازخورد یکسان</label>
                <textarea
                    class="form-control"
                    rows="3"
                    v-model="bulkGradingForm.feedback"
                    placeholder="بازخورد یکسان برای تمام انتخاب شده‌ها..."
                ></textarea>
              </div>

              <!-- Selected submissions preview -->
              <div class="selected-submissions">
                <h6>ارسالی‌های انتخاب شده:</h6>
                <div class="submissions-list">
                  <div v-for="submissionId in selectedSubmissions" :key="submissionId" class="submission-item">
                    <div class="submission-info">
                      <span class="student-name">{{ getSubmissionStudentName(submissionId) }}</span>
                      <small class="text-muted">{{ getSubmissionAssignmentTitle(submissionId) }}</small>
                    </div>
                  </div>
                </div>
              </div>

              <div class="d-flex gap-2 mt-4">
                <button type="submit" class="modern-btn modern-btn-success" :disabled="submitting">
                  <i class="fas fa-check me-1"></i>
                  {{ submitting ? 'در حال اعمال...' : 'اعمال نمره‌گذاری گروهی' }}
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
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';

export default {
  name: 'AssignmentGradingTable',
  setup() {
    const loading = ref(true);
    const submitting = ref(false);
    const submissions = ref([]);
    const courses = ref([]);
    const selectedSubmission = ref(null);
    const selectedSubmissions = ref([]);

    const searchQuery = ref('');
    const selectedCourse = ref('');
    const statusFilter = ref('');
    const sortBy = ref('submittedAt');
    const currentPage = ref(1);
    const itemsPerPage = ref(10);

    const gradingForm = ref({
      score: '',
      feedback: '',
      status: 'GRADED',
      gradedAt: new Date().toISOString().slice(0, 16)
    });

    const bulkGradingForm = ref({
      score: '',
      feedback: '',
      status: 'GRADED'
    });

    const filteredSubmissions = computed(() => {
      let result = [...submissions.value];

      // Search filter
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        result = result.filter(submission =>
            getStudentName(submission.student).toLowerCase().includes(query) ||
            submission.assignment?.title?.toLowerCase().includes(query) ||
            submission.course?.title?.toLowerCase().includes(query)
        );
      }

      // Course filter
      if (selectedCourse.value) {
        result = result.filter(submission =>
            submission.course?.id === selectedCourse.value
        );
      }

      // Status filter
      if (statusFilter.value) {
        switch (statusFilter.value) {
          case 'pending':
            result = result.filter(submission => !submission.graded);
            break;
          case 'graded':
            result = result.filter(submission => submission.graded);
            break;
          case 'late':
            result = result.filter(submission => isLateSubmission(submission));
            break;
        }
      }

      // Sort
      result.sort((a, b) => {
        switch (sortBy.value) {
          case 'studentName':
            return getStudentName(a.student).localeCompare(getStudentName(b.student));
          case 'assignmentTitle':
            return (a.assignment?.title || '').localeCompare(b.assignment?.title || '');
          case 'dueDate':
            if (!a.assignment?.dueDate && !b.assignment?.dueDate) return 0;
            if (!a.assignment?.dueDate) return 1;
            if (!b.assignment?.dueDate) return -1;
            return new Date(a.assignment.dueDate) - new Date(b.assignment.dueDate);
          case 'submittedAt':
          default:
            return new Date(b.submittedAt) - new Date(a.submittedAt);
        }
      });

      return result;
    });

    const totalPages = computed(() =>
        Math.ceil(filteredSubmissions.value.length / itemsPerPage.value)
    );

    const paginatedSubmissions = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value;
      const end = start + itemsPerPage.value;
      return filteredSubmissions.value.slice(start, end);
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

    const hasSubmissions = computed(() => submissions.value.length > 0);

    const pendingCount = computed(() =>
        submissions.value.filter(s => !s.graded).length
    );

    const gradedCount = computed(() =>
        submissions.value.filter(s => s.graded).length
    );

    const isAllSelected = computed(() =>
        paginatedSubmissions.value.length > 0 &&
        paginatedSubmissions.value.every(s => selectedSubmissions.value.includes(s.id))
    );

    const fetchData = async () => {
      loading.value = true;
      try {
        // Fetch courses
        const coursesResponse = await axios.get('/courses/teaching');
        courses.value = coursesResponse.data;

        // Fetch all submissions
        const allSubmissions = [];

        for (const course of courses.value) {
          try {
            const lessonsResponse = await axios.get(`/lessons/course/${course.id}`);
            const lessons = lessonsResponse.data;

            for (const lesson of lessons) {
              try {
                const assignmentsResponse = await axios.get(`/assignments/lesson/${lesson.id}`);
                const assignments = assignmentsResponse.data;

                for (const assignment of assignments) {
                  try {
                    const submissionsResponse = await axios.get(`/assignments/${assignment.id}/submissions`);
                    const assignmentSubmissions = submissionsResponse.data;

                    assignmentSubmissions.forEach(submission => {
                      allSubmissions.push({
                        ...submission,
                        assignment: assignment,
                        course: course,
                        lesson: lesson
                      });
                    });
                  } catch (error) {
                    console.error(`Error fetching submissions for assignment ${assignment.id}:`, error);
                  }
                }
              } catch (error) {
                console.error(`Error fetching assignments for lesson ${lesson.id}:`, error);
              }
            }
          } catch (error) {
            console.error(`Error fetching lessons for course ${course.id}:`, error);
          }
        }

        submissions.value = allSubmissions;
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

    const applyFilters = () => {
      currentPage.value = 1;
    };

    const applySorting = () => {
      currentPage.value = 1;
    };

    const changePage = (page) => {
      if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page;
        window.scrollTo(0, 0);
      }
    };

    const selectAll = () => {
      selectedSubmissions.value = [...paginatedSubmissions.value.map(s => s.id)];
    };

    const clearSelection = () => {
      selectedSubmissions.value = [];
    };

    const toggleSelectAll = () => {
      if (isAllSelected.value) {
        selectedSubmissions.value = selectedSubmissions.value.filter(id =>
            !paginatedSubmissions.value.some(s => s.id === id)
        );
      } else {
        const newSelections = paginatedSubmissions.value
            .map(s => s.id)
            .filter(id => !selectedSubmissions.value.includes(id));
        selectedSubmissions.value.push(...newSelections);
      }
    };

    const getStudentName = (student) => {
      if (!student) return 'نامشخص';
      return student.firstName && student.lastName
          ? `${student.firstName} ${student.lastName}`
          : student.username;
    };

    const getStudentInitials = (student) => {
      if (!student) return 'N';
      const name = getStudentName(student);
      const parts = name.split(' ');
      if (parts.length >= 2) {
        return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
      }
      return name.charAt(0).toUpperCase();
    };

    const formatDate = (dateString) => {
      if (!dateString) return '';
      return new Date(dateString).toLocaleString('fa-IR');
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

    const getTimeAgo = (dateString) => {
      if (!dateString) return '';
      const now = new Date();
      const date = new Date(dateString);
      const diffTime = Math.abs(now - date);
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffHours < 24) return `${diffHours} ساعت قبل`;
      if (diffDays === 1) return 'دیروز';
      return `${diffDays} روز قبل`;
    };

    const isLateSubmission = (submission) => {
      if (!submission.assignment?.dueDate) return false;
      return new Date(submission.submittedAt) > new Date(submission.assignment.dueDate);
    };

    const getLateTime = (submission) => {
      if (!isLateSubmission(submission)) return '';

      const submittedDate = new Date(submission.submittedAt);
      const dueDate = new Date(submission.assignment.dueDate);
      const diffMs = submittedDate - dueDate;
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

      if (diffDays > 0) {
        return `${diffDays} روز و ${diffHours} ساعت`;
      } else {
        return `${diffHours} ساعت`;
      }
    };

    const getStatusBadgeClass = (submission) => {
      if (submission.graded) return 'bg-success';
      if (isLateSubmission(submission)) return 'bg-danger';
      return 'bg-warning';
    };

    const getStatusText = (submission) => {
      if (submission.graded) return 'نمره‌گذاری شده';
      if (isLateSubmission(submission)) return 'ارسال دیرهنگام';
      return 'در انتظار نمره‌گذاری';
    };

    const getGradeClass = (score) => {
      if (!score) return 'text-muted';
      if (score >= 80) return 'text-success fw-bold';
      if (score >= 60) return 'text-info fw-bold';
      if (score >= 40) return 'text-warning fw-bold';
      return 'text-danger fw-bold';
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

    const isViewableFile = (file) => {
      const ext = file.originalFilename.split('.').pop().toLowerCase();
      return ['txt', 'jpg', 'jpeg', 'png', 'gif'].includes(ext);
    };

    const viewSubmissionDetail = (submission) => {
      selectedSubmission.value = submission;
      gradingForm.value = {
        score: submission.score || '',
        feedback: submission.feedback || '',
        status: submission.status || 'GRADED',
        gradedAt: submission.gradedAt ? new Date(submission.gradedAt).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16)
      };

      const modal = new bootstrap.Modal(document.getElementById('submissionModal'));
      modal.show();
    };

    const quickGrade = async (submission) => {
      const score = prompt(`نمره تکلیف "${submission.assignment?.title}" را وارد کنید (0-100):`);
      if (score === null) return;

      const numericScore = parseInt(score);
      if (isNaN(numericScore) || numericScore < 0 || numericScore > 100) {
        this.$toast.error('لطفاً نمره معتبری بین 0 تا 100 وارد کنید.');
        return;
      }

      const feedback = prompt('بازخورد (اختیاری):') || '';

      try {
        await axios.post(`/assignments/submissions/${submission.id}/grade`, {
          score: numericScore,
          feedback: feedback
        });

        this.$toast.success('تکلیف با موفقیت نمره‌گذاری شد.');
        await fetchData();
      } catch (error) {
        console.error('Error grading submission:', error);
        this.$toast.error('خطا در نمره‌گذاری');
      }
    };

    const editGrade = (submission) => {
      viewSubmissionDetail(submission);
    };

    const submitGrade = async () => {
      if (!selectedSubmission.value) return;

      submitting.value = true;
      try {
        await axios.post(`/assignments/submissions/${selectedSubmission.value.id}/grade`, {
          score: gradingForm.value.score,
          feedback: gradingForm.value.feedback,
          status: gradingForm.value.status
        });

        this.$toast.success('نمره‌گذاری با موفقیت انجام شد.');

        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('submissionModal'));
        modal.hide();

        // Refresh data
        await fetchData();
      } catch (error) {
        console.error('Error submitting grade:', error);
        this.$toast.error('خطا در ثبت نمره');
      } finally {
        submitting.value = false;
      }
    };

    const bulkGrade = () => {
      if (selectedSubmissions.value.length === 0) {
        this.$toast.warning('لطفاً حداقل یک ارسالی انتخاب کنید.');
        return;
      }

      bulkGradingForm.value = {
        score: '',
        feedback: '',
        status: 'GRADED'
      };

      const modal = new bootstrap.Modal(document.getElementById('bulkGradingModal'));
      modal.show();
    };

    const submitBulkGrade = async () => {
      submitting.value = true;
      try {
        const promises = selectedSubmissions.value.map(submissionId =>
            axios.post(`/assignments/submissions/${submissionId}/grade`, {
              score: bulkGradingForm.value.score,
              feedback: bulkGradingForm.value.feedback,
              status: bulkGradingForm.value.status
            })
        );

        await Promise.all(promises);

        this.$toast.success(`${selectedSubmissions.value.length} ارسالی با موفقیت نمره‌گذاری شد.`);

        // Close modal and clear selections
        const modal = bootstrap.Modal.getInstance(document.getElementById('bulkGradingModal'));
        modal.hide();
        selectedSubmissions.value = [];

        // Refresh data
        await fetchData();
      } catch (error) {
        console.error('Error bulk grading:', error);
        this.$toast.error('خطا در نمره‌گذاری گروهی');
      } finally {
        submitting.value = false;
      }
    };

    const downloadFile = async (file) => {
      try {
        const response = await axios.get(`/assignments/files/${file.id}`, {
          responseType: 'blob'
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', file.originalFilename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        this.$toast.success('فایل با موفقیت دانلود شد.');
      } catch (error) {
        console.error('Error downloading file:', error);
        this.$toast.error('خطا در دانلود فایل.');
      }
    };

    const downloadSubmissionFiles = async (submission) => {
      if (!submission.files || submission.files.length === 0) {
        this.$toast.warning('فایلی برای دانلود وجود ندارد.');
        return;
      }

      for (const file of submission.files) {
        await downloadFile(file);
      }
    };

    const exportToCSV = () => {
      if (!hasSubmissions.value) return;

      const csvHeaders = [
        'ردیف', 'نام دانش‌آموز', 'نام کاربری', 'عنوان تکلیف', 'کورس',
        'زمان ارسال', 'مهلت تکلیف', 'وضعیت', 'نمره', 'بازخورد'
      ];

      const csvRows = [csvHeaders];

      filteredSubmissions.value.forEach((submission, index) => {
        const row = [
          index + 1,
          getStudentName(submission.student),
          submission.student?.username || '',
          submission.assignment?.title || '',
          submission.course?.title || '',
          formatDate(submission.submittedAt),
          submission.assignment?.dueDate ? formatDate(submission.assignment.dueDate) : 'نامحدود',
          getStatusText(submission),
          submission.score || 'نمره‌گذاری نشده',
          submission.feedback || ''
        ];
        csvRows.push(row);
      });

      const csvContent = csvRows.map(row =>
          row.map(cell => `"${cell.toString().replace(/"/g, '""')}"`).join(',')
      ).join('\n');

      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `جدول_نمره‌گذاری_تکالیف_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      this.$toast.success('فایل CSV با موفقیت دانلود شد.');
    };

    const getSubmissionStudentName = (submissionId) => {
      const submission = submissions.value.find(s => s.id === submissionId);
      return submission ? getStudentName(submission.student) : '';
    };

    const getSubmissionAssignmentTitle = (submissionId) => {
      const submission = submissions.value.find(s => s.id === submissionId);
      return submission?.assignment?.title || '';
    };

    const saveAsDraft = () => {
      this.$toast.info('پیش‌نویس ذخیره شد.');
    };

    const resetGradingForm = () => {
      gradingForm.value = {
        score: '',
        feedback: '',
        status: 'GRADED',
        gradedAt: new Date().toISOString().slice(0, 16)
      };
    };

    const previewFile = async (file) => {
      // This would implement file preview functionality
      this.$toast.info('پیش‌نمایش فایل در نسخه آینده اضافه خواهد شد.');
    };

    onMounted(() => {
      fetchData();
    });

    return {
      loading,
      submitting,
      submissions,
      courses,
      selectedSubmission,
      selectedSubmissions,
      searchQuery,
      selectedCourse,
      statusFilter,
      sortBy,
      currentPage,
      itemsPerPage,
      gradingForm,
      bulkGradingForm,
      filteredSubmissions,
      totalPages,
      paginatedSubmissions,
      visiblePages,
      hasSubmissions,
      pendingCount,
      gradedCount,
      isAllSelected,
      refreshData,
      applyFilters,
      applySorting,
      changePage,
      selectAll,
      clearSelection,
      toggleSelectAll,
      getStudentName,
      getStudentInitials,
      formatDate,
      formatFileSize,
      truncateText,
      getTimeAgo,
      isLateSubmission,
      getLateTime,
      getStatusBadgeClass,
      getStatusText,
      getGradeClass,
      getFileIcon,
      isViewableFile,
      viewSubmissionDetail,
      quickGrade,
      editGrade,
      submitGrade,
      bulkGrade,
      submitBulkGrade,
      downloadFile,
      downloadSubmissionFiles,
      exportToCSV,
      getSubmissionStudentName,
      getSubmissionAssignmentTitle,
      saveAsDraft,
      resetGradingForm,
      previewFile
    };
  }
};
</script>

<style scoped>
.assignment-grading-table-container {
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

.modern-btn-success {
  background: linear-gradient(45deg, #56ab2f, #a8e6cf);
  color: white;
}

.modern-btn-warning {
  background: linear-gradient(45deg, #ffa726, #ff7043);
  color: white;
}

.modern-btn-outline-primary {
  background: transparent;
  color: #667eea;
  border: 2px solid #667eea;
}

.modern-btn-outline-info {
  background: transparent;
  color: #17a2b8;
  border: 2px solid #17a2b8;
}

.modern-btn-outline-secondary {
  background: transparent;
  color: #6c757d;
  border: 2px solid #6c757d;
}

.modern-btn-outline-warning {
  background: transparent;
  color: #ffc107;
  border: 2px solid #ffc107;
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

.modern-table {
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

.modern-table th {
  background: linear-gradient(45deg, #f8f9fa, #e9ecef);
  border: none;
  font-weight: 600;
  color: #495057;
  padding: 1rem 0.75rem;
}

.modern-table td {
  border-color: #e9ecef;
  vertical-align: middle;
  padding: 1rem 0.75rem;
}

.modern-table tbody tr:hover {
  background-color: rgba(102, 126, 234, 0.05);
}

.table-selected {
  background-color: rgba(102, 126, 234, 0.1) !important;
}

.student-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.student-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.9rem;
}

.student-avatar.large {
  width: 60px;
  height: 60px;
  font-size: 1.2rem;
}

.student-details {
  flex: 1;
}

.student-name {
  font-weight: 600;
  color: #333;
}

.assignment-info {
  max-width: 200px;
}

.assignment-title {
  font-weight: 500;
  color: #333;
}

.course-info {
  max-width: 150px;
}

.course-name {
  font-weight: 500;
  color: #667eea;
}

.submission-time {
  min-width: 120px;
}

.late-indicator {
  margin-top: 0.25rem;
}

.grade-display {
  text-align: center;
}

.grade-score {
  font-weight: bold;
  font-size: 1.1rem;
}

.action-buttons {
  display: flex;
  gap: 0.25rem;
  justify-content: center;
}

.empty-state {
  text-align: center;
  padding: 3rem;
}

.info-section {
  margin-bottom: 2rem;
}

.section-title {
  color: #667eea;
  border-bottom: 2px solid #667eea;
  padding-bottom: 0.5rem;
  margin-bottom: 1rem;
  font-weight: 600;
}

.info-card {
  background: rgba(102, 126, 234, 0.05);
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid rgba(102, 126, 234, 0.1);
}

.student-profile {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.student-profile .student-info h6 {
  margin: 0;
  color: #333;
}

.student-profile .student-info p {
  margin: 0.25rem 0;
}

.info-row {
  display: flex;
  margin-bottom: 0.75rem;
  align-items: flex-start;
}

.info-row strong {
  min-width: 100px;
  color: #495057;
  font-weight: 600;
}

.submission-meta {
  background: rgba(23, 162, 184, 0.05);
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid #17a2b8;
}

.meta-item {
  display: flex;
  align-items: center;
  font-size: 0.9rem;
}

.comment-section {
  background: rgba(255, 193, 7, 0.05);
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid #ffc107;
}

.comment-display {
  background: rgba(255, 255, 255, 0.8);
  padding: 0.75rem;
  border-radius: 6px;
  margin-top: 0.5rem;
  font-style: italic;
}

.files-section {
  background: rgba(52, 152, 219, 0.05);
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid #3498db;
}

.submitted-files .file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 6px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.submitted-files .file-item:hover {
  background: rgba(102, 126, 234, 0.05);
  border-color: rgba(102, 126, 234, 0.2);
}

.file-info {
  display: flex;
  align-items: center;
  flex: 1;
}

.file-name {
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.file-actions {
  display: flex;
  gap: 0.5rem;
}

.grading-section {
  background: rgba(40, 167, 69, 0.05);
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid rgba(40, 167, 69, 0.2);
}

.selected-submissions {
  background: rgba(102, 126, 234, 0.05);
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid rgba(102, 126, 234, 0.1);
  max-height: 200px;
  overflow-y: auto;
}

.submissions-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.submission-item {
  background: rgba(255, 255, 255, 0.8);
  padding: 0.5rem;
  border-radius: 6px;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.submission-info .student-name {
  font-weight: 500;
  color: #333;
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
  .assignment-grading-table-container {
    padding: 10px;
  }

  .modern-table {
    font-size: 0.875rem;
  }

  .action-buttons {
    flex-direction: column;
  }

  .student-info {
    flex-direction: column;
    text-align: center;
    gap: 0.5rem;
  }

  .file-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .file-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>