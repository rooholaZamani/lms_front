<template>
  <div class="pending-assignments-container">
    <div class="container-fluid">
      <!-- Header -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="modern-card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <div>
                <h4 class="mb-0">
                  <i class="fas fa-list-alt me-2"></i>
                  تکالیف در حال بررسی
                </h4>
                <p class="text-muted mb-0">بررسی و نمره‌دهی تکالیف دانش‌آموزان</p>
              </div>
              <div class="d-flex gap-2">
                <button @click="refreshData" class="modern-btn modern-btn-outline-primary" :disabled="loading">
                  <i class="fas fa-sync-alt me-1" :class="{'fa-spin': loading}"></i>
                  بروزرسانی
                </button>
                <button @click="downloadAllReports" class="modern-btn modern-btn-success" :disabled="!hasAssignments">
                  <i class="fas fa-download me-1"></i>
                  دانلود گزارش کل
                </button>
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
        <p class="mt-2 text-muted">در حال دریافت تکالیف...</p>
      </div>

      <!-- No Assignments -->
      <div v-else-if="!hasAssignments" class="text-center py-5">
        <div class="empty-state">
          <i class="fas fa-inbox fa-4x text-muted mb-3"></i>
          <h5 class="text-muted">تکلیفی برای بررسی وجود ندارد</h5>
          <p class="text-muted">تمام تکالیف نمره‌گذاری شده‌اند یا هنوز تکلیفی ارسال نشده است.</p>
        </div>
      </div>

      <!-- Assignments Grid -->
      <div v-else class="row">
        <div class="col-12 mb-3">
          <div class="d-flex justify-content-between align-items-center">
            <h6 class="mb-0">{{ assignments.length }} تکلیف در انتظار بررسی</h6>
            <div class="d-flex gap-2">
              <select v-model="sortBy" class="form-select form-select-sm" style="width: auto;">
                <option value="submittedAt">جدیدترین</option>
                <option value="dueDate">نزدیک‌ترین مهلت</option>
                <option value="course">بر اساس کورس</option>
                <option value="student">بر اساس دانش‌آموز</option>
              </select>
            </div>
          </div>
        </div>

        <div v-for="assignment in sortedAssignments" :key="assignment.id" class="col-lg-6 col-xl-4 mb-4">
          <div class="assignment-card modern-card h-100">
            <div class="card-header">
              <div class="d-flex justify-content-between align-items-start">
                <div>
                  <h6 class="card-title mb-1">{{ assignment.title }}</h6>
                  <small class="text-muted">{{ assignment.course.title }}</small>
                </div>
                <span class="badge" :class="getUrgencyBadge(assignment)">
                  {{ getUrgencyText(assignment) }}
                </span>
              </div>
            </div>

            <div class="card-body">
              <!-- Student Info -->
              <div class="student-info mb-3">
                <div class="d-flex align-items-center">
                  <div class="avatar-sm me-2">
                    {{ getStudentName(assignment.student).charAt(0) }}
                  </div>
                  <div>
                    <div class="fw-bold">{{ getStudentName(assignment.student) }}</div>
                    <small class="text-muted">دانش‌آموز</small>
                  </div>
                </div>
              </div>

              <!-- Assignment Info -->
              <div class="assignment-info mb-3">
                <div class="info-item">
                  <i class="fas fa-clock text-primary me-2"></i>
                  <span>ارسال: {{ formatDate(assignment.submittedAt) }}</span>
                </div>
                <div class="info-item" v-if="assignment.assignment.dueDate">
                  <i class="fas fa-calendar text-warning me-2"></i>
                  <span>مهلت: {{ formatDate(assignment.assignment.dueDate) }}</span>
                </div>
                <div class="info-item" v-if="isLate(assignment)">
                  <i class="fas fa-exclamation-triangle text-danger me-2"></i>
                  <span class="text-danger">{{ getLateTime(assignment) }} تاخیر</span>
                </div>
              </div>

              <!-- Assignment Description -->
              <div v-if="assignment.description" class="assignment-description mb-3">
                <small class="text-muted">توضیحات:</small>
                <p class="small">{{ truncateText(assignment.description, 100) }}</p>
              </div>

              <!-- Files Info -->
              <div v-if="assignment.files && assignment.files.length > 0" class="files-info mb-3">
                <small class="text-muted">فایل‌های ارسالی:</small>
                <div class="files-list">
                  <div v-for="file in assignment.files" :key="file.id" class="file-item">
                    <i class="fas fa-file text-info me-1"></i>
                    <span class="file-name">{{ file.originalFilename }}</span>
                    <span class="file-size text-muted">({{ formatFileSize(file.size) }})</span>
                  </div>
                </div>
              </div>

              <!-- Student Comment -->
              <div v-if="assignment.comment" class="student-comment mb-3">
                <small class="text-muted">نظر دانش‌آموز:</small>
                <div class="comment-box">
                  <i class="fas fa-quote-left text-muted me-1"></i>
                  {{ assignment.comment }}
                </div>
              </div>
            </div>

            <div class="card-footer">
              <div class="d-grid gap-2">
                <button @click="viewSubmissionDetail(assignment)" class="modern-btn modern-btn-info">
                  <i class="fas fa-eye me-1"></i>
                  مشاهده جزئیات کامل
                </button>
                <button @click="quickGrade(assignment)" class="modern-btn modern-btn-success">
                  <i class="fas fa-star me-1"></i>
                  نمره‌گذاری سریع
                </button>
              </div>
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
              جزئیات تکلیف: {{ selectedAssignment?.title }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>

          <div class="modal-body" v-if="selectedAssignment">
            <div class="row">
              <!-- Assignment Info -->
              <div class="col-md-4">
                <div class="info-section">
                  <h6 class="section-title">اطلاعات تکلیف</h6>

                  <div class="info-card">
                    <div class="info-row">
                      <strong>عنوان:</strong>
                      <span>{{ selectedAssignment.title }}</span>
                    </div>

                    <div class="info-row" v-if="selectedAssignment.description">
                      <strong>توضیحات:</strong>
                      <div class="description-text">{{ selectedAssignment.description }}</div>
                    </div>

                    <div class="info-row">
                      <strong>کورس:</strong>
                      <span>{{ selectedAssignment.course.title }}</span>
                    </div>

                    <div class="info-row">
                      <strong>دانش‌آموز:</strong>
                      <span>{{ getStudentName(selectedAssignment.student) }}</span>
                    </div>

                    <div class="info-row">
                      <strong>زمان ارسال:</strong>
                      <span>{{ formatDate(selectedAssignment.submittedAt) }}</span>
                    </div>

                    <div class="info-row" v-if="selectedAssignment.assignment.dueDate">
                      <strong>مهلت تکلیف:</strong>
                      <span :class="isLate(selectedAssignment) ? 'text-danger' : ''">
                        {{ formatDate(selectedAssignment.assignment.dueDate) }}
                        <span v-if="isLate(selectedAssignment)" class="ms-1">
                          ({{ getLateTime(selectedAssignment) }} تاخیر)
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Original Assignment Files -->
                <div v-if="selectedAssignment.assignment.files && selectedAssignment.assignment.files.length > 0" class="info-section mt-4">
                  <h6 class="section-title">فایل‌های اصل تکلیف</h6>
                  <div class="files-section">
                    <div v-for="file in selectedAssignment.assignment.files" :key="file.id" class="file-download-item">
                      <div class="file-info">
                        <i class="fas fa-file-alt text-primary me-2"></i>
                        <span>{{ file.originalFilename }}</span>
                        <small class="text-muted">({{ formatFileSize(file.size) }})</small>
                      </div>
                      <button @click="downloadAssignmentFile(file)" class="btn btn-sm btn-outline-primary">
                        <i class="fas fa-download"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Student Submission -->
              <div class="col-md-8">
                <div class="submission-section">
                  <h6 class="section-title">ارسالی دانش‌آموز</h6>

                  <!-- Student Comment -->
                  <div v-if="selectedAssignment.comment" class="comment-section mb-4">
                    <label class="form-label">نظر دانش‌آموز:</label>
                    <div class="comment-display">
                      {{ selectedAssignment.comment }}
                    </div>
                  </div>

                  <!-- Submitted Files -->
                  <div v-if="selectedAssignment.files && selectedAssignment.files.length > 0" class="files-section mb-4">
                    <label class="form-label">فایل‌های ارسالی:</label>
                    <div class="submitted-files">
                      <div v-for="file in selectedAssignment.files" :key="file.id" class="file-download-item">
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
                    <form @submit.prevent="gradeSubmission">
                      <div class="row">
                        <div class="col-md-6 mb-3">
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
                        <div class="col-md-6 mb-3">
                          <label class="form-label">وضعیت</label>
                          <select v-model="gradingForm.status" class="form-select">
                            <option value="GRADED">نمره‌گذاری شده</option>
                            <option value="NEEDS_REVISION">نیاز به بازنگری</option>
                            <option value="EXCELLENT">عالی</option>
                          </select>
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
                        <button type="button" @click="saveAsDraft" class="modern-btn modern-btn-outline-secondary">
                          <i class="fas fa-save me-1"></i>
                          ذخیره پیش‌نویس
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

    <!-- File Preview Modal -->
    <div class="modal fade" id="filePreviewModal" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">پیش‌نمایش فایل</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div v-if="previewContent.type === 'text'" class="text-preview">
              <pre>{{ previewContent.content }}</pre>
            </div>
            <div v-else-if="previewContent.type === 'image'" class="image-preview">
              <img :src="previewContent.content" class="img-fluid" />
            </div>
            <div v-else class="text-center py-4">
              <i class="fas fa-file fa-3x text-muted mb-3"></i>
              <p>پیش‌نمایش این نوع فایل پشتیبانی نمی‌شود</p>
            </div>
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
  name: 'PendingAssignments',
  setup() {
    const loading = ref(false);
    const submitting = ref(false);
    const assignments = ref([]);
    const selectedAssignment = ref(null);
    const sortBy = ref('submittedAt');
    const previewContent = ref({ type: '', content: '' });

    const gradingForm = ref({
      score: '',
      feedback: '',
      status: 'GRADED'
    });

    const fetchPendingAssignments = async () => {
      loading.value = true;
      try {
        const coursesResponse = await axios.get('/courses/teaching');
        const courses = coursesResponse.data;
        const pendingAssignments = [];

        for (const course of courses) {
          try {
            const lessonsResponse = await axios.get(`/lessons/course/${course.id}`);
            const lessons = lessonsResponse.data;

            for (const lesson of lessons) {
              try {
                const assignmentsResponse = await axios.get(`/assignments/lesson/${lesson.id}`);
                const lessonAssignments = assignmentsResponse.data;

                for (const assignment of lessonAssignments) {
                  try {
                    const submissionsResponse = await axios.get(`/assignments/${assignment.id}/submissions`);
                    const submissions = submissionsResponse.data;

                    const ungradedSubmissions = submissions
                        .filter(submission => !submission.graded)
                        .map(submission => ({
                          ...submission,
                          title: assignment.title,
                          description: assignment.description,
                          course: course,
                          assignment: assignment
                        }));

                    pendingAssignments.push(...ungradedSubmissions);
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

        assignments.value = pendingAssignments;
      } catch (error) {
        console.error('Error fetching pending assignments:', error);
        window.showError(error);
      } finally {
        loading.value = false;
      }
    };

    const sortedAssignments = computed(() => {
      const sorted = [...assignments.value];

      switch (sortBy.value) {
        case 'submittedAt':
          return sorted.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
        case 'dueDate':
          return sorted.sort((a, b) => new Date(a.assignment.dueDate) - new Date(b.assignment.dueDate));
        case 'course':
          return sorted.sort((a, b) => a.course.title.localeCompare(b.course.title));
        case 'student':
          return sorted.sort((a, b) => getStudentName(a.student).localeCompare(getStudentName(b.student)));
        default:
          return sorted;
      }
    });

    const hasAssignments = computed(() => assignments.value.length > 0);

    const refreshData = () => {
      fetchPendingAssignments();
    };

    const getStudentName = (student) => {
      if (!student) return 'نامشخص';
      return student.firstName && student.lastName
          ? `${student.firstName} ${student.lastName}`
          : student.username;
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

    const isLate = (assignment) => {
      if (!assignment.assignment.dueDate) return false;
      return new Date(assignment.submittedAt) > new Date(assignment.assignment.dueDate);
    };

    const getLateTime = (assignment) => {
      if (!isLate(assignment)) return '';

      const submittedDate = new Date(assignment.submittedAt);
      const dueDate = new Date(assignment.assignment.dueDate);
      const diffMs = submittedDate - dueDate;
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

      if (diffDays > 0) {
        return `${diffDays} روز و ${diffHours} ساعت`;
      } else {
        return `${diffHours} ساعت`;
      }
    };

    const getUrgencyBadge = (assignment) => {
      if (isLate(assignment)) return 'bg-danger';

      if (!assignment.assignment.dueDate) return 'bg-primary';

      const now = new Date();
      const dueDate = new Date(assignment.assignment.dueDate);
      const diffDays = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));

      if (diffDays < 0) return 'bg-danger';
      if (diffDays <= 1) return 'bg-warning';
      return 'bg-success';
    };

    const getUrgencyText = (assignment) => {
      if (isLate(assignment)) return 'دیرکرد';

      if (!assignment.assignment.dueDate) return 'عادی';

      const now = new Date();
      const dueDate = new Date(assignment.assignment.dueDate);
      const diffDays = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));

      if (diffDays < 0) return 'مهلت گذشته';
      if (diffDays <= 1) return 'فوری';
      return 'عادی';
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
        png: 'fas fa-file-image text-success',
        gif: 'fas fa-file-image text-success'
      };
      return iconMap[ext] || 'fas fa-file text-muted';
    };

    const isViewableFile = (file) => {
      const ext = file.originalFilename.split('.').pop().toLowerCase();
      return ['txt', 'jpg', 'jpeg', 'png', 'gif'].includes(ext);
    };

    const viewSubmissionDetail = (assignment) => {
      selectedAssignment.value = assignment;
      gradingForm.value = {
        score: '',
        feedback: '',
        status: 'GRADED'
      };

      const modal = new bootstrap.Modal(document.getElementById('submissionModal'));
      modal.show();
    };

    const quickGrade = async (assignment) => {
      const score = prompt(`نمره تکلیف "${assignment.title}" را وارد کنید (0-100):`);
      if (score === null) return;

      const numericScore = parseInt(score);
      if (isNaN(numericScore) || numericScore < 0 || numericScore > 100) {
        alert('لطفاً نمره معتبری بین 0 تا 100 وارد کنید.');
        return;
      }

      const feedback = prompt('بازخورد (اختیاری):') || '';

      try {
        await axios.post(`/assignments/submissions/${assignment.id}/grade`, null, {
          params: {
            score: numericScore,
            feedback: feedback
          }
        });

        window.toast.success('تکلیف با موفقیت نمره‌گذاری شد.');
        await fetchPendingAssignments();
      } catch (error) {
        console.error('Error grading assignment:', error);
        window.showError(error);
      }
    };

    const gradeSubmission = async () => {
      if (!selectedAssignment.value) return;

      submitting.value = true;
      try {
        await axios.post(`/assignments/submissions/${selectedAssignment.value.id}/grade`, {
          score: gradingForm.value.score,
          feedback: gradingForm.value.feedback
        });

        window.toast.success('تکلیف با موفقیت نمره‌گذاری شد.');

        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('submissionModal'));
        modal.hide();

        // Refresh data
        await fetchPendingAssignments();
      } catch (error) {
        console.error('Error grading submission:', error);
        window.showError(error);
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

        window.toast.success('فایل با موفقیت دانلود شد.');
      } catch (error) {
        console.error('Error downloading file:', error);
        window.toast.error('خطا در دانلود فایل.');
      }
    };

    const downloadAssignmentFile = async (file) => {
      await downloadFile(file);
    };

    const previewFile = async (file) => {
      try {
        const response = await axios.get(`/assignments/files/${file.id}`, {
          responseType: 'blob'
        });

        const ext = file.originalFilename.split('.').pop().toLowerCase();

        if (ext === 'txt') {
          const text = await response.data.text();
          previewContent.value = { type: 'text', content: text };
        } else if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) {
          const url = window.URL.createObjectURL(response.data);
          previewContent.value = { type: 'image', content: url };
        }

        const modal = new bootstrap.Modal(document.getElementById('filePreviewModal'));
        modal.show();
      } catch (error) {
        console.error('Error previewing file:', error);
        window.toast.error('خطا در نمایش پیش‌نمایش فایل.');
      }
    };

    const downloadAllReports = async () => {
      if (!hasAssignments.value) return;

      try {
        const csvHeaders = ['دانش‌آموز', 'کورس', 'عنوان تکلیف', 'زمان ارسال', 'مهلت تکلیف', 'وضعیت تاخیر', 'تعداد فایل'];
        const csvRows = [csvHeaders];

        assignments.value.forEach(assignment => {
          const row = [
            getStudentName(assignment.student),
            assignment.course.title,
            assignment.title,
            formatDate(assignment.submittedAt),
            assignment.assignment.dueDate ? formatDate(assignment.assignment.dueDate) : 'نامحدود',
            isLate(assignment) ? `دیرکرد (${getLateTime(assignment)})` : 'به موقع',
            assignment.files ? assignment.files.length : 0
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
        link.setAttribute('download', `تکالیف_در_انتظار_بررسی_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        window.toast.success('گزارش با موفقیت دانلود شد.');
      } catch (error) {
        console.error('Error downloading report:', error);
        window.toast.error('خطا در دانلود گزارش.');
      }
    };

    const saveAsDraft = () => {
      window.toast.info('پیش‌نویس ذخیره شد.');
    };

    onMounted(() => {
      fetchPendingAssignments();
    });

    return {
      loading,
      submitting,
      assignments,
      selectedAssignment,
      sortBy,
      sortedAssignments,
      hasAssignments,
      gradingForm,
      previewContent,
      refreshData,
      getStudentName,
      formatDate,
      formatFileSize,
      truncateText,
      isLate,
      getLateTime,
      getUrgencyBadge,
      getUrgencyText,
      getFileIcon,
      isViewableFile,
      viewSubmissionDetail,
      quickGrade,
      gradeSubmission,
      downloadFile,
      downloadAssignmentFile,
      previewFile,
      downloadAllReports,
      saveAsDraft
    };
  }
};
</script>

<style scoped>
.pending-assignments-container {
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

.assignment-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 2px solid transparent;
}

.assignment-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  border-color: rgba(102, 126, 234, 0.3);
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
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.modern-btn-success {
  background: linear-gradient(45deg, #56ab2f, #a8e6cf);
  color: white;
}

.modern-btn-success:hover {
  background: linear-gradient(45deg, #4a9025, #96d4b5);
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

.avatar-sm {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1rem;
}

.student-info {
  padding: 1rem;
  background: rgba(102, 126, 234, 0.05);
  border-radius: 8px;
  border-left: 4px solid #667eea;
}

.assignment-info .info-item {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.assignment-description {
  background: rgba(255, 255, 255, 0.7);
  padding: 0.75rem;
  border-radius: 6px;
  border: 1px solid rgba(102, 126, 234, 0.1);
}

.files-info {
  background: rgba(52, 152, 219, 0.05);
  padding: 0.75rem;
  border-radius: 6px;
  border-left: 3px solid #3498db;
}

.file-item {
  display: flex;
  align-items: center;
  padding: 0.25rem 0;
  font-size: 0.85rem;
}

.file-name {
  font-weight: 500;
  margin-right: 0.5rem;
}

.file-size {
  font-size: 0.75rem;
}

.student-comment {
  background: rgba(255, 193, 7, 0.05);
  padding: 0.75rem;
  border-radius: 6px;
  border-left: 3px solid #ffc107;
}

.comment-box {
  background: rgba(255, 255, 255, 0.8);
  padding: 0.5rem;
  border-radius: 4px;
  font-style: italic;
  margin-top: 0.25rem;
}

.empty-state {
  padding: 3rem;
  text-align: center;
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

.info-row {
  display: flex;
  margin-bottom: 0.75rem;
  align-items: flex-start;
}

.info-row strong {
  min-width: 120px;
  color: #495057;
  font-weight: 600;
}

.description-text {
  background: rgba(255, 255, 255, 0.8);
  padding: 0.5rem;
  border-radius: 4px;
  margin-top: 0.25rem;
}

.files-section {
  background: rgba(255, 255, 255, 0.5);
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.file-download-item {
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

.file-download-item:hover {
  background: rgba(102, 126, 234, 0.05);
  border-color: rgba(102, 126, 234, 0.2);
}

.file-info {
  display: flex;
  align-items: center;
  flex: 1;
}

.file-actions {
  display: flex;
  gap: 0.5rem;
}

.submitted-files .file-download-item {
  border-left: 4px solid #28a745;
}

.comment-display {
  background: rgba(255, 255, 255, 0.8);
  padding: 1rem;
  border-radius: 6px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  font-style: italic;
}

.grading-section {
  background: rgba(40, 167, 69, 0.05);
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid rgba(40, 167, 69, 0.2);
}

.text-preview pre {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 6px;
  border: 1px solid #dee2e6;
  white-space: pre-wrap;
  max-height: 400px;
  overflow-y: auto;
}

.image-preview {
  text-align: center;
}

.image-preview img {
  max-height: 500px;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
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
  .pending-assignments-container {
    padding: 10px;
  }

  .modern-card .card-body {
    padding: 1rem;
  }

  .assignment-card:hover {
    transform: none;
  }

  .file-download-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .file-actions {
    width: 100%;
    justify-content: flex-end;
  }

  .info-row {
    flex-direction: column;
  }

  .info-row strong {
    min-width: auto;
    margin-bottom: 0.25rem;
  }
}
</style>