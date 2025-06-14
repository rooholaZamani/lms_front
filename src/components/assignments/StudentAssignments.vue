<template>
  <div class="student-assignments-container">
    <div class="container-fluid">
      <!-- Header -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="modern-card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <div>
                <h4 class="mb-0">
                  <i class="fas fa-tasks me-2"></i>
                  تکالیف من
                </h4>
                <p class="text-muted mb-0">مشاهده و ارسال تکالیف دروس</p>
              </div>
              <button @click="refreshData" class="modern-btn modern-btn-outline-primary" :disabled="loading">
                <i class="fas fa-sync-alt me-1" :class="{'fa-spin': loading}"></i>
                بروزرسانی
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="row mb-4">
        <div class="col-md-3 col-sm-6 mb-3">
          <div class="stats-card modern-card">
            <div class="stats-content">
              <div class="stats-icon">
                <i class="fas fa-list-alt"></i>
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
              <div class="stats-icon pending">
                <i class="fas fa-clock"></i>
              </div>
              <div class="stats-info">
                <h5>{{ stats.pendingAssignments }}</h5>
                <p>در انتظار ارسال</p>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-3 col-sm-6 mb-3">
          <div class="stats-card modern-card">
            <div class="stats-content">
              <div class="stats-icon submitted">
                <i class="fas fa-paper-plane"></i>
              </div>
              <div class="stats-info">
                <h5>{{ stats.submittedAssignments }}</h5>
                <p>ارسال شده</p>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-3 col-sm-6 mb-3">
          <div class="stats-card modern-card">
            <div class="stats-content">
              <div class="stats-icon graded">
                <i class="fas fa-star"></i>
              </div>
              <div class="stats-info">
                <h5>{{ stats.averageScore }}%</h5>
                <p>میانگین نمرات</p>
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

      <!-- Tabs -->
      <div v-else class="row">
        <div class="col-12">
          <div class="modern-card">
            <div class="card-header">
              <div class="modern-tabs">
                <button
                    @click="activeTab = 'pending'"
                    :class="['modern-tab-btn', { active: activeTab === 'pending' }]"
                >
                  <i class="fas fa-clock me-1"></i>
                  در انتظار ارسال ({{ pendingAssignments.length }})
                </button>
                <button
                    @click="activeTab = 'submitted'"
                    :class="['modern-tab-btn', { active: activeTab === 'submitted' }]"
                >
                  <i class="fas fa-paper-plane me-1"></i>
                  ارسال شده ({{ submittedAssignments.length }})
                </button>
                <button
                    @click="activeTab = 'graded'"
                    :class="['modern-tab-btn', { active: activeTab === 'graded' }]"
                >
                  <i class="fas fa-star me-1"></i>
                  نمره‌گذاری شده ({{ gradedAssignments.length }})
                </button>
              </div>
            </div>

            <div class="card-body">
              <!-- Pending Assignments -->
              <div v-if="activeTab === 'pending'">
                <div v-if="pendingAssignments.length === 0" class="empty-state">
                  <i class="fas fa-inbox fa-4x text-muted mb-3"></i>
                  <h5 class="text-muted">تکلیفی برای ارسال وجود ندارد</h5>
                  <p class="text-muted">تمام تکالیف شما ارسال شده‌اند.</p>
                </div>
                <div v-else class="row">
                  <div v-for="assignment in pendingAssignments" :key="assignment.id" class="col-lg-6 col-xl-4 mb-4">
                    <div class="assignment-card modern-card h-100">
                      <div class="card-header">
                        <div class="d-flex justify-content-between align-items-start">
                          <div>
                            <h6 class="card-title mb-1">{{ assignment.title }}</h6>
                            <small class="text-muted">{{ assignment.course?.title || 'نامشخص' }}</small>
                          </div>
                          <span class="badge" :class="getDueBadgeClass(assignment.dueDate)">
                            {{ getDaysRemaining(assignment.dueDate) }}
                          </span>
                        </div>
                      </div>

                      <div class="card-body">
                        <p v-if="assignment.description" class="card-text">
                          {{ truncateText(assignment.description, 100) }}
                        </p>

                        <div class="assignment-meta">
                          <div class="meta-item" v-if="assignment.dueDate">
                            <i class="fas fa-calendar-alt text-warning me-2"></i>
                            <span>مهلت: {{ formatDate(assignment.dueDate) }}</span>
                          </div>
                          <div class="meta-item" v-if="assignment.createdAt">
                            <i class="fas fa-plus-circle text-info me-2"></i>
                            <span>ایجاد: {{ formatDate(assignment.createdAt) }}</span>
                          </div>
                        </div>

                        <!-- Assignment Files -->
                        <div v-if="assignment.files && assignment.files.length > 0" class="assignment-files mt-3">
                          <small class="text-muted">فایل‌های ضمیمه:</small>
                          <div class="files-list">
                            <div v-for="file in assignment.files" :key="file.id" class="file-item">
                              <i :class="getFileIcon(file.originalFilename)" class="me-2"></i>
                              <a href="#" @click.prevent="downloadAssignmentFile(file)" class="file-link">
                                {{ file.originalFilename }}
                              </a>
                              <small class="text-muted">({{ formatFileSize(file.size) }})</small>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div class="card-footer">
                        <div class="d-grid">
                          <button @click="submitAssignment(assignment)" class="modern-btn modern-btn-success">
                            <i class="fas fa-upload me-1"></i>
                            ارسال تکلیف
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Submitted Assignments -->
              <div v-if="activeTab === 'submitted'">
                <div v-if="submittedAssignments.length === 0" class="empty-state">
                  <i class="fas fa-paper-plane fa-4x text-muted mb-3"></i>
                  <h5 class="text-muted">تکلیف ارسالی‌ای وجود ندارد</h5>
                  <p class="text-muted">تکالیف ارسال شده که هنوز نمره‌گذاری نشده‌اند در اینجا نمایش داده می‌شوند.</p>
                </div>
                <div v-else class="row">
                  <div v-for="assignment in submittedAssignments" :key="assignment.id" class="col-lg-6 col-xl-4 mb-4">
                    <div class="assignment-card modern-card h-100 submitted">
                      <div class="card-header">
                        <div class="d-flex justify-content-between align-items-start">
                          <div>
                            <h6 class="card-title mb-1">{{ assignment.title }}</h6>
                            <small class="text-muted">{{ assignment.course?.title || 'نامشخص' }}</small>
                          </div>
                          <span class="badge bg-info">
                            در انتظار نمره‌گذاری
                          </span>
                        </div>
                      </div>

                      <div class="card-body">
                        <div class="submission-info">
                          <div class="info-item">
                            <i class="fas fa-clock text-success me-2"></i>
                            <span>ارسال شده: {{ formatDate(assignment.submittedAt) }}</span>
                          </div>
                          <div class="info-item" v-if="assignment.comment">
                            <i class="fas fa-comment text-info me-2"></i>
                            <span>نظر: {{ truncateText(assignment.comment, 50) }}</span>
                          </div>
                        </div>

                        <!-- View submission link -->
                        <div class="mt-3">
                          <small class="text-muted">فایل ارسالی شما:</small>
                          <div v-if="assignment.submissionFiles && assignment.submissionFiles.length > 0">
                            <div v-for="file in assignment.submissionFiles" :key="file.id" class="file-item">
                              <i :class="getFileIcon(file.originalFilename)" class="me-2"></i>
                              <a href="#" @click.prevent="downloadFile(file)" class="file-link">
                                {{ file.originalFilename }}
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Graded Assignments -->
              <div v-if="activeTab === 'graded'">
                <div v-if="gradedAssignments.length === 0" class="empty-state">
                  <i class="fas fa-star fa-4x text-muted mb-3"></i>
                  <h5 class="text-muted">هنوز تکلیفی نمره‌گذاری نشده</h5>
                  <p class="text-muted">تکالیف نمره‌گذاری شده در اینجا نمایش داده خواهند شد.</p>
                </div>
                <div v-else class="row">
                  <div v-for="assignment in gradedAssignments" :key="assignment.id" class="col-lg-6 col-xl-4 mb-4">
                    <div class="assignment-card modern-card h-100 graded">
                      <div class="card-header">
                        <div class="d-flex justify-content-between align-items-start">
                          <div>
                            <h6 class="card-title mb-1">{{ assignment.title }}</h6>
                            <small class="text-muted">{{ assignment.course?.title || 'نامشخص' }}</small>
                          </div>
                          <span class="badge" :class="getScoreBadgeClass(assignment.score)">
                            {{ assignment.score || 0 }}/100
                          </span>
                        </div>
                      </div>

                      <div class="card-body">
                        <div class="grade-info">
                          <div class="score-display">
                            <div class="score-circle" :class="getScoreCircleClass(assignment.score)">
                              <span class="score-number">{{ assignment.score || 0 }}</span>
                              <small class="score-label">نمره</small>
                            </div>
                          </div>

                          <div class="grade-details">
                            <div class="info-item">
                              <i class="fas fa-calendar-check text-success me-2"></i>
                              <span>نمره‌گذاری: {{ formatDate(assignment.gradedAt) }}</span>
                            </div>
                            <div class="info-item">
                              <i class="fas fa-paper-plane text-info me-2"></i>
                              <span>ارسال: {{ formatDate(assignment.submittedAt) }}</span>
                            </div>
                          </div>
                        </div>

                        <!-- Feedback -->
                        <div v-if="assignment.feedback" class="feedback-section mt-3">
                          <small class="text-muted">بازخورد استاد:</small>
                          <div class="feedback-box">
                            <i class="fas fa-comment-dots text-primary me-2"></i>
                            {{ assignment.feedback }}
                          </div>
                        </div>
                      </div>

                      <div class="card-footer">
                        <button @click="viewSubmissionDetail(assignment)" class="modern-btn modern-btn-outline-info w-100">
                          <i class="fas fa-eye me-1"></i>
                          مشاهده جزئیات
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Assignment Submission Modal -->
    <div class="modal fade" id="submissionModal" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">ارسال تکلیف: {{ selectedAssignment?.title }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body" v-if="selectedAssignment">
            <div class="assignment-details mb-4">
              <h6>جزئیات تکلیف:</h6>
              <p>{{ selectedAssignment.description }}</p>

              <div v-if="selectedAssignment.dueDate" class="alert alert-warning">
                <i class="fas fa-exclamation-triangle me-2"></i>
                مهلت ارسال: {{ formatDate(selectedAssignment.dueDate) }}
              </div>
            </div>

            <form @submit.prevent="handleSubmission">
              <div class="mb-3">
                <label class="form-label">انتخاب فایل <span class="text-danger">*</span></label>
                <input
                    type="file"
                    class="form-control"
                    @change="handleFileSelect"
                    accept=".pdf,.doc,.docx,.txt,.zip,.rar,.jpg,.jpeg,.png"
                    required
                >
                <small class="form-text text-muted">
                  فرمت‌های مجاز: PDF, DOC, DOCX, TXT, ZIP, RAR, JPG, PNG
                </small>
              </div>

              <div class="mb-3">
                <label class="form-label">نظر یا توضیحات (اختیاری)</label>
                <textarea
                    class="form-control"
                    rows="3"
                    v-model="submissionForm.comment"
                    placeholder="نظر یا توضیحات اضافی خود را اینجا بنویسید..."
                ></textarea>
              </div>

              <div class="d-flex gap-2">
                <button type="submit" class="modern-btn modern-btn-success" :disabled="submitting">
                  <i class="fas fa-upload me-1"></i>
                  {{ submitting ? 'در حال ارسال...' : 'ارسال تکلیف' }}
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

    <!-- Assignment Detail Modal -->
    <div class="modal fade" id="detailModal" tabindex="-1">
      <div class="modal-dialog modal-xl">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">جزئیات تکلیف: {{ viewingAssignment?.title }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body" v-if="viewingAssignment">
            <div class="row">
              <div class="col-md-6">
                <h6>اطلاعات تکلیف</h6>
                <div class="info-card">
                  <div class="info-row">
                    <strong>عنوان:</strong>
                    <span>{{ viewingAssignment.title }}</span>
                  </div>
                  <div class="info-row">
                    <strong>کورس:</strong>
                    <span>{{ viewingAssignment.course?.title }}</span>
                  </div>
                  <div class="info-row">
                    <strong>توضیحات:</strong>
                    <div>{{ viewingAssignment.description }}</div>
                  </div>
                  <div class="info-row" v-if="viewingAssignment.dueDate">
                    <strong>مهلت:</strong>
                    <span>{{ formatDate(viewingAssignment.dueDate) }}</span>
                  </div>
                </div>
              </div>
              <div class="col-md-6">
                <h6>اطلاعات ارسال</h6>
                <div class="submission-card">
                  <div class="info-row">
                    <strong>زمان ارسال:</strong>
                    <span>{{ formatDate(viewingAssignment.submittedAt) }}</span>
                  </div>
                  <div class="info-row" v-if="viewingAssignment.score !== null">
                    <strong>نمره:</strong>
                    <span class="badge" :class="getScoreBadgeClass(viewingAssignment.score)">
                      {{ viewingAssignment.score }}/100
                    </span>
                  </div>
                  <div class="info-row" v-if="viewingAssignment.feedback">
                    <strong>بازخورد:</strong>
                    <div class="feedback-display">{{ viewingAssignment.feedback }}</div>
                  </div>
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
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';

export default {
  name: 'StudentAssignments',
  setup() {
    const loading = ref(true);
    const submitting = ref(false);
    const activeTab = ref('pending');
    const assignments = ref([]);
    const selectedAssignment = ref(null);
    const viewingAssignment = ref(null);

    const stats = ref({
      totalAssignments: 0,
      submittedAssignments: 0,
      pendingAssignments: 0,
      averageScore: 0
    });

    const submissionForm = ref({
      file: null,
      comment: ''
    });

    const pendingAssignments = computed(() =>
        assignments.value.filter(a => !a.submitted)
    );

    const submittedAssignments = computed(() =>
        assignments.value.filter(a => a.submitted && !a.graded)
    );

    const gradedAssignments = computed(() =>
        assignments.value.filter(a => a.graded)
    );

    const fetchAssignments = async () => {
      loading.value = true;
      try {
        const response = await axios.get('/assignments/submissions/student');
        const submissions = response.data || [];

        const coursesResponse = await axios.get('/courses/enrolled');
        const enrolledCourses = coursesResponse.data || [];

        const allAssignments = [];

        for (const course of enrolledCourses) {
          try {
            const lessonsResponse = await axios.get(`/lessons/course/${course.id}`);
            const lessons = lessonsResponse.data || [];

            for (const lesson of lessons) {
              try {
                const assignmentsResponse = await axios.get(`/assignments/lesson/${lesson.id}`);
                const lessonAssignments = assignmentsResponse.data || [];

                for (const assignment of lessonAssignments) {
                  const submission = submissions.find(s => s.assignmentId === assignment.id);

                  allAssignments.push({
                    ...assignment,
                    course: course,
                    lesson: lesson,
                    submitted: !!submission,
                    graded: submission?.graded || false,
                    score: submission?.score,
                    submittedAt: submission?.submittedAt,
                    gradedAt: submission?.gradedAt,
                    feedback: submission?.feedback,
                    comment: submission?.comment,
                    submissionId: submission?.id,
                    submissionFiles: submission?.files
                  });
                }
              } catch (error) {
                console.error(`Error fetching assignments for lesson ${lesson.id}:`, error);
              }
            }
          } catch (error) {
            console.error(`Error fetching lessons for course ${course.id}:`, error);
          }
        }

        assignments.value = allAssignments;

        const submittedCount = allAssignments.filter(a => a.submitted).length;
        const pendingCount = allAssignments.filter(a => !a.submitted).length;

        const gradedAssignmentsWithScore = allAssignments.filter(a => a.graded && a.score);
        const averageScore = gradedAssignmentsWithScore.length > 0
            ? Math.round(gradedAssignmentsWithScore.reduce((sum, a) => sum + a.score, 0) / gradedAssignmentsWithScore.length)
            : 0;

        stats.value = {
          totalAssignments: allAssignments.length,
          submittedAssignments: submittedCount,
          pendingAssignments: pendingCount,
          averageScore: averageScore
        };

      } catch (error) {
        console.error('Error fetching assignments:', error);
        window.showError(error);
      } finally {
        loading.value = false;
      }
    };

    const refreshData = () => {
      fetchAssignments();
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

    const getDaysRemaining = (dueDate) => {
      if (!dueDate) return 'نامحدود';
      const now = new Date();
      const due = new Date(dueDate);
      const diffTime = due - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 0) return 'مهلت گذشته';
      if (diffDays === 0) return 'امروز';
      if (diffDays === 1) return 'فردا';
      return `${diffDays} روز باقی`;
    };

    const getDueBadgeClass = (dueDate) => {
      if (!dueDate) return 'bg-secondary';
      const now = new Date();
      const due = new Date(dueDate);
      const diffTime = due - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 0) return 'bg-danger';
      if (diffDays <= 1) return 'bg-warning';
      return 'bg-success';
    };

    const getScoreBadgeClass = (score) => {
      if (!score) return 'bg-secondary';
      if (score >= 80) return 'bg-success';
      if (score >= 60) return 'bg-info';
      if (score >= 40) return 'bg-warning';
      return 'bg-danger';
    };

    const getScoreCircleClass = (score) => {
      if (!score) return 'score-poor';
      if (score >= 80) return 'score-excellent';
      if (score >= 60) return 'score-good';
      if (score >= 40) return 'score-average';
      return 'score-poor';
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

    const submitAssignment = (assignment) => {
      selectedAssignment.value = assignment;
      submissionForm.value = { file: null, comment: '' };

      const modal = new bootstrap.Modal(document.getElementById('submissionModal'));
      modal.show();
    };

    const handleFileSelect = (event) => {
      submissionForm.value.file = event.target.files[0];
    };

    const handleSubmission = async () => {
      if (!submissionForm.value.file) {
        window.toast.error('لطفاً یک فایل انتخاب کنید.');
        return;
      }

      submitting.value = true;
      try {
        const formData = new FormData();
        formData.append('file', submissionForm.value.file);
        formData.append('comment', submissionForm.value.comment);

        await axios.post(`/assignments/${selectedAssignment.value.id}/submit`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        window.toast.success('تکلیف با موفقیت ارسال شد.');

        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('submissionModal'));
        modal.hide();

        // Refresh data
        await fetchAssignments();
        activeTab.value = 'submitted';
      } catch (error) {
        console.error('Error submitting assignment:', error);
        window.toast.error('خطا در ارسال تکلیف.');
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

    const viewSubmissionDetail = (assignment) => {
      viewingAssignment.value = assignment;

      const modal = new bootstrap.Modal(document.getElementById('detailModal'));
      modal.show();
    };

    onMounted(() => {
      fetchAssignments();
    });

    return {
      loading,
      submitting,
      activeTab,
      assignments,
      selectedAssignment,
      viewingAssignment,
      stats,
      submissionForm,
      pendingAssignments,
      submittedAssignments,
      gradedAssignments,
      refreshData,
      formatDate,
      formatFileSize,
      truncateText,
      getDaysRemaining,
      getDueBadgeClass,
      getScoreBadgeClass,
      getScoreCircleClass,
      getFileIcon,
      submitAssignment,
      handleFileSelect,
      handleSubmission,
      downloadFile,
      downloadAssignmentFile,
      viewSubmissionDetail
    };
  }
};
</script>

<style scoped>
.student-assignments-container {
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

.modern-btn-success {
  background: linear-gradient(45deg, #56ab2f, #a8e6cf);
  color: white;
}

.modern-btn-success:hover {
  background: linear-gradient(45deg, #4a9025, #96d4b5);
  transform: translateY(-1px);
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
  background: linear-gradient(45deg, #667eea, #764ba2);
  margin-right: 1rem;
}

.stats-icon.pending {
  background: linear-gradient(45deg, #ffa726, #ff7043);
}

.stats-icon.submitted {
  background: linear-gradient(45deg, #42a5f5, #1e88e5);
}

.stats-icon.graded {
  background: linear-gradient(45deg, #66bb6a, #43a047);
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

.modern-tabs {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.modern-tab-btn {
  padding: 0.75rem 1.5rem;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 25px;
  color: white;
  font-weight: 500;
  transition: all 0.3s ease;
  cursor: pointer;
}

.modern-tab-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.modern-tab-btn.active {
  background: rgba(255, 255, 255, 0.9);
  color: #333;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
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

.assignment-card.submitted {
  border-left: 4px solid #17a2b8;
}

.assignment-card.graded {
  border-left: 4px solid #28a745;
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
}

.files-list .file-item {
  display: flex;
  align-items: center;
  padding: 0.25rem 0;
  font-size: 0.85rem;
}

.file-link {
  color: #007bff;
  text-decoration: none;
  margin-left: 0.5rem;
  margin-right: 0.5rem;
}

.file-link:hover {
  text-decoration: underline;
}

.submission-info {
  background: rgba(23, 162, 184, 0.05);
  padding: 0.75rem;
  border-radius: 6px;
  border-left: 3px solid #17a2b8;
}

.info-item {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  font-size: 0.85rem;
}

.info-item:last-child {
  margin-bottom: 0;
}

.grade-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.score-display {
  display: flex;
  align-items: center;
  justify-content: center;
}

.score-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  position: relative;
}

.score-circle.score-excellent {
  background: linear-gradient(45deg, #28a745, #20c997);
}

.score-circle.score-good {
  background: linear-gradient(45deg, #17a2b8, #20c997);
}

.score-circle.score-average {
  background: linear-gradient(45deg, #ffc107, #fd7e14);
}

.score-circle.score-poor {
  background: linear-gradient(45deg, #dc3545, #e83e8c);
}

.score-number {
  font-size: 1.5rem;
  line-height: 1;
}

.score-label {
  font-size: 0.7rem;
  opacity: 0.9;
}

.grade-details {
  flex: 1;
}

.feedback-section {
  background: rgba(255, 193, 7, 0.05);
  padding: 0.75rem;
  border-radius: 6px;
  border-left: 3px solid #ffc107;
}

.feedback-box {
  background: rgba(255, 255, 255, 0.8);
  padding: 0.5rem;
  border-radius: 4px;
  margin-top: 0.25rem;
  font-style: italic;
}

.empty-state {
  text-align: center;
  padding: 3rem;
}

.info-card, .submission-card {
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
  min-width: 100px;
  color: #495057;
  font-weight: 600;
}

.feedback-display {
  background: rgba(255, 255, 255, 0.8);
  padding: 0.5rem;
  border-radius: 4px;
  margin-top: 0.25rem;
  font-style: italic;
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

.form-control {
  border: 2px solid #e9ecef;
  border-radius: 8px;
  padding: 0.75rem;
  transition: all 0.3s ease;
}

.form-control:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 0.25rem rgba(102, 126, 234, 0.25);
}

@media (max-width: 768px) {
  .student-assignments-container {
    padding: 10px;
  }

  .modern-tabs {
    flex-direction: column;
  }

  .modern-tab-btn {
    width: 100%;
    text-align: center;
  }

  .grade-info {
    flex-direction: column;
    text-align: center;
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