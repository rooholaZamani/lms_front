<template>
  <div class="modern-page-bg info-gradient">
    <div class="modern-container large animate-slide-up">
      <div class="modern-header">
        <div class="modern-logo info">
          <i class="fas fa-file-alt"></i>
        </div>
        <h1 class="modern-title">جزئیات ارسال تکلیف</h1>
        <p class="modern-subtitle">بررسی و نمره‌دهی ارسال دانش‌آموز</p>
      </div>

      <div class="d-flex justify-content-end mb-4">
        <button class="modern-btn modern-btn-secondary" @click="goBack">
          <i class="fas fa-arrow-right me-2"></i> بازگشت
        </button>
      </div>

      <loading-spinner :loading="loading">
        <div v-if="error" class="modern-alert modern-alert-danger">
          <i class="fas fa-exclamation-circle me-2"></i>
          {{ error }}
        </div>

        <div v-else class="content-sections">
          <!-- اطلاعات تکلیف -->
          <div class="form-section">
            <h6 class="section-title">
              <i class="fas fa-tasks me-2"></i>
              اطلاعات تکلیف
            </h6>

            <div class="info-grid">
              <div class="info-item">
                <label class="modern-form-label">عنوان تکلیف</label>
                <div class="info-value">{{ assignment.title }}</div>
              </div>
              <div class="info-item">
                <label class="modern-form-label">تاریخ ایجاد</label>
                <div class="info-value">{{ formatDate(assignment.createdAt) }}</div>
              </div>
              <div class="info-item">
                <label class="modern-form-label">مهلت ارسال</label>
                <div class="info-value">{{ formatDate(assignment.dueDate) }}</div>
              </div>
              <div class="info-item">
                <label class="modern-form-label">درس</label>
                <div class="info-value">{{ assignment.lesson?.title || 'نامشخص' }}</div>
              </div>
            </div>

            <div v-if="assignment.description" class="modern-form-group">
              <label class="modern-form-label">توضیحات تکلیف</label>
              <div class="description-box">{{ assignment.description }}</div>
            </div>

            <div v-if="assignment.file" class="modern-form-group">
              <label class="modern-form-label">فایل پیوست تکلیف</label>
              <div class="file-attachment">
                <i class="fas fa-file me-2"></i>
                <a href="#" @click.prevent="downloadFile(assignment.file)">
                  {{ assignment.file.originalFilename }}
                </a>
              </div>
            </div>
          </div>

          <!-- اطلاعات ارسال -->
          <div class="form-section">
            <h6 class="section-title">
              <i class="fas fa-user-graduate me-2"></i>
              اطلاعات ارسال دانش‌آموز
            </h6>

            <div class="row">
              <div class="col-md-6">
                <div class="info-grid">
                  <div class="info-item">
                    <label class="modern-form-label">نام دانش‌آموز</label>
                    <div class="info-value">{{ getStudentName() }}</div>
                  </div>
                  <div class="info-item" v-if="submission.student?.email">
                    <label class="modern-form-label">ایمیل</label>
                    <div class="info-value">{{ submission.student.email }}</div>
                  </div>
                  <div class="info-item">
                    <label class="modern-form-label">تاریخ ارسال</label>
                    <div class="info-value">{{ formatDate(submission.submittedAt) }}</div>
                  </div>
                  <div class="info-item">
                    <label class="modern-form-label">وضعیت ارسال</label>
                    <div class="info-value">
                      <span v-if="isOnTime()" class="modern-badge modern-badge-success">
                        به موقع
                      </span>
                      <span v-else class="modern-badge modern-badge-warning">
                        دیرکرد {{ getLateTimeText() }}
                      </span>
                    </div>
                  </div>
                  <div class="info-item" v-if="submission.score !== null && submission.score !== undefined">
                    <label class="modern-form-label">نمره</label>
                    <div class="info-value">{{ submission.score }}</div>
                  </div>
                </div>
              </div>

              <div class="col-md-6">
                <div v-if="submission.file" class="modern-form-group">
                  <label class="modern-form-label">فایل ارسالی</label>
                  <div class="file-container">
                    <div class="file-info">
                      <i class="fas fa-file-alt file-icon text-primary"></i>
                      <div>
                        <div class="file-name">{{ submission.file.originalFilename }}</div>
                        <div class="file-size">{{ formatFileSize(submission.file.size) }}</div>
                      </div>
                    </div>
                    <button class="modern-btn modern-btn-primary" @click="downloadFile(submission.file)">
                      <i class="fas fa-download me-1"></i> دانلود
                    </button>
                  </div>
                </div>

                <div v-if="submission.comment" class="modern-form-group">
                  <label class="modern-form-label">نظر دانش‌آموز</label>
                  <div class="comment-box">{{ submission.comment }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- بخش نمره‌دهی استاد -->
          <div v-if="isTeacher && !submission.graded" class="form-section">
            <h6 class="section-title">
              <i class="fas fa-star me-2"></i>
              نمره‌دهی
            </h6>

            <form @submit.prevent="gradeSubmission">
              <div class="row">
                <div class="col-md-4 modern-form-group">
                  <label for="score" class="modern-form-label">نمره (از ۱۰۰)</label>
                  <input
                      type="number"
                      class="modern-form-control"
                      id="score"
                      v-model="gradingForm.score"
                      min="0"
                      max="100"
                      required
                  >
                </div>
                <div class="col-md-8 modern-form-group">
                  <label for="feedback" class="modern-form-label">بازخورد</label>
                  <textarea
                      class="modern-form-control"
                      id="feedback"
                      v-model="gradingForm.feedback"
                      rows="3"
                      placeholder="بازخورد و نظرات خود را بنویسید..."
                  ></textarea>
                </div>
              </div>

              <div class="text-end">
                <button type="submit" class="modern-btn modern-btn-success" :disabled="isSubmitting">
                  <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  <i class="fas fa-check me-1"></i>
                  ثبت نمره
                </button>
              </div>
            </form>
          </div>

          <!-- نمایش بازخورد استاد -->
          <div v-if="submission.feedback || submission.graded" class="form-section">
            <h6 class="section-title">
              <i class="fas fa-comment me-2"></i>
              بازخورد استاد
            </h6>

            <div class="feedback-container">
              <div v-if="submission.feedback" class="feedback-text">
                {{ submission.feedback }}
              </div>
              <div v-else class="text-muted">
                بازخوردی ارائه نشده است.
              </div>

              <div v-if="submission.gradedBy" class="grader-info">
                <small class="text-muted">
                  نمره‌دهی توسط {{ getGraderName() }} در تاریخ {{ formatDate(submission.gradedAt) }}
                </small>
              </div>
            </div>
          </div>
        </div>
      </loading-spinner>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import { useUser } from '@/composables/useUser.js';
import { useFormatters } from '@/composables/useFormatters.js';
import formMixin from '@/mixins/formMixin.js';

export default {
  name: 'SubmissionDetail',
  components: {
    LoadingSpinner
  },
  mixins: [formMixin],
  props: {
    id: {
      type: String,
      required: true
    }
  },
  setup() {
    const { isTeacher, getUserFullName } = useUser();
    const { formatDate, formatFileSize } = useFormatters();

    return {
      isTeacher,
      getUserFullName,
      formatDate,
      formatFileSize
    };
  },
  data() {
    return {
      loading: true,
      error: null,
      assignment: {},
      submission: {},
      gradingForm: {
        score: 0,
        feedback: ''
      }
    };
  },
  created() {
    this.fetchSubmissionData();
  },
  methods: {
    async fetchSubmissionData() {
      try {
        this.loading = true;

        const response = await axios.get(`/assignments/submissions/${this.id}`);
        this.submission = response.data;

        if (this.submission.assignmentId) {
          const assignmentResponse = await axios.get(`/assignments/${this.submission.assignmentId}`);
          this.assignment = assignmentResponse.data;
        }

        this.loading = false;
      } catch (error) {
        console.error('Error fetching submission data:', error);
        this.error = 'مشکلی در بارگذاری جزئیات ارسال رخ داد. لطفاً دوباره تلاش کنید.';
        this.loading = false;
      }
    },

    goBack() {
      this.$router.go(-1);
    },

    getStudentName() {
      if (!this.submission || !this.submission.student) {
        return 'نامشخص';
      }
      return this.getUserFullName(this.submission.student);
    },

    getGraderName() {
      if (!this.submission || !this.submission.gradedBy) {
        return 'نامشخص';
      }
      return this.getUserFullName(this.submission.gradedBy);
    },

    isOnTime() {
      if (!this.submission?.submittedAt || !this.assignment?.dueDate) {
        return true;
      }

      const submittedDate = new Date(this.submission.submittedAt);
      const dueDate = new Date(this.assignment.dueDate);

      return submittedDate <= dueDate;
    },

    getLateTimeText() {
      if (!this.submission?.submittedAt || !this.assignment?.dueDate) {
        return '';
      }

      const submittedDate = new Date(this.submission.submittedAt);
      const dueDate = new Date(this.assignment.dueDate);

      if (submittedDate <= dueDate) return '';

      const diffMs = submittedDate - dueDate;
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

      if (diffDays > 0) {
        return `${diffDays} روز ${diffHours} ساعت`;
      } else {
        return `${diffHours} ساعت`;
      }
    },

    async downloadFile(file) {
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
      } catch (error) {
        console.error('Error downloading file:', error);
        this.showErrorToast('خطا در دانلود فایل. لطفاً دوباره تلاش کنید.');
      }
    },

    async gradeSubmission() {
      this.startSubmitting();

      try {
        const response = await axios.post(`/assignments/submissions/${this.id}/grade`, {
          score: this.gradingForm.score,
          feedback: this.gradingForm.feedback
        });

        this.submission = {
          ...this.submission,
          score: response.data.score,
          feedback: response.data.feedback,
          graded: true,
          gradedAt: response.data.gradedAt,
          gradedBy: response.data.gradedBy || this.$store.getters.currentUser,
          status: 'GRADED'
        };

        this.finishSubmitting('نمره‌دهی با موفقیت انجام شد.');
      } catch (error) {
        console.error('Error grading submission:', error);
        this.finishSubmitting(null, 'خطا در نمره‌دهی. لطفاً دوباره تلاش کنید.');
      }
    }
  }
}
</script>

<style scoped>
.content-sections {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-value {
  font-weight: 500;
  color: #333;
  padding: 0.5rem 0;
}

.description-box, .comment-box {
  background: rgba(248, 249, 250, 0.8);
  border: 1px solid rgba(102, 126, 234, 0.1);
  border-radius: 8px;
  padding: 1rem;
  white-space: pre-wrap;
  line-height: 1.6;
}

.file-attachment {
  display: flex;
  align-items: center;
  background: rgba(248, 249, 250, 0.8);
  border: 1px solid rgba(102, 126, 234, 0.1);
  border-radius: 8px;
  padding: 1rem;
}

.file-attachment a {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
}

.file-attachment a:hover {
  text-decoration: underline;
}

.file-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(248, 249, 250, 0.8);
  border: 1px solid rgba(102, 126, 234, 0.1);
  border-radius: 8px;
  padding: 1rem;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.file-icon {
  font-size: 2rem;
}

.file-name {
  font-weight: 600;
  color: #333;
}

.file-size {
  font-size: 0.9rem;
  color: #6c757d;
}

.feedback-container {
  background: rgba(248, 249, 250, 0.8);
  border: 1px solid rgba(102, 126, 234, 0.1);
  border-radius: 8px;
  padding: 1.5rem;
}

.feedback-text {
  white-space: pre-wrap;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.grader-info {
  text-align: left;
  font-style: italic;
  border-top: 1px solid rgba(102, 126, 234, 0.1);
  padding-top: 1rem;
}

@media (max-width: 768px) {
  .info-grid {
    grid-template-columns: 1fr;
  }

  .file-container {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
}
</style>