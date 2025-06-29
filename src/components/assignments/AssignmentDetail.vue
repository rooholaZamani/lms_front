<template>
  <div class="assignment-detail">
    <!-- Loading State -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">در حال بارگذاری...</span>
      </div>
    </div>

    <!-- Assignment Content -->
    <div v-else-if="assignment" class="container-fluid">
      <!-- Header -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="modern-card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <div>
                <h4 class="mb-0">
                  <i class="fas fa-tasks me-2"></i>
                  {{ assignment.title }}
                </h4>
                <p class="text-muted mb-0" v-if="assignment.lesson">
                  درس: {{ assignment.lesson.title }} |
                  کورس: {{ assignment.lesson.course ? assignment.lesson.course.title : 'نامشخص' }}
                </p>
              </div>
              <button @click="goBack" class="modern-btn modern-btn-outline-secondary">
                <i class="fas fa-arrow-right me-1"></i>
                بازگشت
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Assignment Info -->
      <div class="row mb-4">
        <div class="col-md-8">
          <div class="modern-card">
            <div class="card-body">
              <h5 class="card-title">توضیحات تکلیف</h5>
              <p class="card-text" v-if="assignment.description">{{ assignment.description }}</p>
              <p v-else class="text-muted">توضیحی برای این تکلیف ارائه نشده است.</p>

              <div class="assignment-meta mt-4">
                <div class="meta-item" v-if="assignment.dueDate">
                  <i class="fas fa-calendar text-danger me-2"></i>
                  <span>مهلت ارسال: {{ formatDate(assignment.dueDate) }}</span>
                </div>
                <div class="meta-item" v-if="assignment.createdAt">
                  <i class="fas fa-clock text-info me-2"></i>
                  <span>تاریخ ایجاد: {{ formatDate(assignment.createdAt) }}</span>
                </div>
                <div class="meta-item" v-if="assignment.teacher">
                  <i class="fas fa-user text-primary me-2"></i>
                  <span>مدرس: {{ getTeacherName() }}</span>
                </div>
              </div>

              <!-- Attached File -->
              <div v-if="assignment.file" class="attachment-section mt-4">
                <h6>فایل پیوست:</h6>
                <div class="file-item">
                  <i class="fas fa-file-alt me-2"></i>
                  <a :href="`/api/assignments/files/${assignment.file.id}`" target="_blank">
                    {{ assignment.file.originalFilename }}
                  </a>
                  <span class="file-size ms-2 text-muted">
                    ({{ formatFileSize(assignment.file.fileSize) }})
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Assignment Status -->
        <div class="col-md-4">
          <div class="modern-card">
            <div class="card-body text-center">
              <h6 class="card-title">وضعیت تکلیف</h6>

              <!-- For Students -->
              <div v-if="isStudent" class="student-status">
                <div v-if="hasSubmitted" class="alert alert-success">
                  <i class="fas fa-check-circle me-2"></i>
                  شما این تکلیف را ارسال کرده‌اید
                  <div class="mt-2" v-if="submission.score !== null">
                    <small>نمره: {{ submission.score }}</small>
                  </div>
                </div>
                <div v-else>
                  <div class="submission-form">
                    <form @submit.prevent="submitAssignment">
                      <div class="mb-3">
                        <label class="form-label">فایل تکلیف:</label>
                        <input
                            type="file"
                            class="form-control"
                            @change="handleFileSelect"
                            required
                        >
                      </div>
                      <div class="mb-3">
                        <label class="form-label">توضیحات:</label>
                        <textarea
                            class="form-control"
                            rows="3"
                            v-model="submissionComment"
                            placeholder="توضیحات اضافی..."
                        ></textarea>
                      </div>
                      <button
                          type="submit"
                          class="btn btn-success w-100"
                          :disabled="submitting || !selectedFile"
                      >
                        <i class="fas fa-upload me-1"></i>
                        {{ submitting ? 'در حال ارسال...' : 'ارسال تکلیف' }}
                      </button>
                    </form>
                  </div>
                </div>
              </div>

              <!-- For Teachers -->
              <div v-if="isTeacher" class="teacher-status">
                <div class="status-item">
                  <div class="status-number">{{ submissionCount }}</div>
                  <div class="status-label">ارسالی</div>
                </div>
                <div class="mt-3">
                  <button class="btn btn-primary w-100" @click="viewSubmissions">
                    <i class="fas fa-eye me-1"></i>
                    مشاهده ارسالی‌ها
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else class="text-center py-5">
      <div class="alert alert-danger">
        تکلیف یافت نشد یا خطایی رخ داده است.
      </div>
      <button @click="goBack" class="btn btn-secondary">
        <i class="fas fa-arrow-right me-1"></i>
        بازگشت
      </button>
    </div>
  </div>
</template>

<script>
import { useUser } from '@/composables/useUser';
import { useFormatters } from '@/composables/useFormatters';
import { useAssignments } from '@/composables/useAssignments';

export default {
  name: 'AssignmentDetail',
  props: {
    id: {
      type: String,
      required: true
    }
  },
  setup() {
    const { isStudent, isTeacher } = useUser();
    const { formatDate, formatFileSize } = useFormatters();

    return {
      isStudent,
      isTeacher,
      formatDate,
      formatFileSize
    };
  },
  data() {
    return {
      loading: true,
      assignment: null,
      submission: null,
      hasSubmitted: false,
      submissionCount: 0,
      selectedFile: null,
      submissionComment: '',
      submitting: false
    };
  },
  async mounted() {
    await this.loadAssignment();
    if (this.isStudent) {
      await this.checkSubmissionStatus();
    }
    if (this.isTeacher) {
      await this.loadSubmissions();
    }
  },
  methods: {
    async loadAssignment() {
      try {
        this.loading = true;
        const response = await this.$http.get(`/assignments/${this.id}`);
        this.assignment = response.data;
      } catch (error) {
        console.error('Error loading assignment:', error);
        this.$toast.error('خطا در بارگذاری تکلیف');
      } finally {
        this.loading = false;
      }
    },

    async checkSubmissionStatus() {
      try {
        const response = await this.$http.get('/assignments/submissions/student');
        const mySubmission = response.data.find(sub => sub.assignmentId === parseInt(this.id));
        if (mySubmission) {
          this.hasSubmitted = true;
          this.submission = mySubmission;
        }
      } catch (error) {
        console.error('Error checking submission status:', error);
      }
    },

    async loadSubmissions() {
      try {
        const response = await this.$http.get(`/assignments/${this.id}/submissions`);
        this.submissionCount = response.data.length;
      } catch (error) {
        console.error('Error loading submissions:', error);
      }
    },

    handleFileSelect(event) {
      this.selectedFile = event.target.files[0];
    },

    async submitAssignment() {
      if (!this.selectedFile) {
        this.$toast.error('لطفاً فایل تکلیف را انتخاب کنید');
        return;
      }

      try {
        this.submitting = true;
        const formData = new FormData();
        formData.append('file', this.selectedFile);
        formData.append('comment', this.submissionComment);

        await this.$http.post(`/assignments/${this.id}/submit`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        this.$toast.success('تکلیف با موفقیت ارسال شد');
        this.hasSubmitted = true;
        await this.checkSubmissionStatus();
      } catch (error) {
        console.error('Error submitting assignment:', error);
        this.$toast.error('خطا در ارسال تکلیف');
      } finally {
        this.submitting = false;
      }
    },

    getTeacherName() {
      if (!this.assignment || !this.assignment.teacher) {
        return 'نامشخص';
      }
      const teacher = this.assignment.teacher;
      return teacher.firstName && teacher.lastName
          ? `${teacher.firstName} ${teacher.lastName}`
          : teacher.username;
    },

    viewSubmissions() {
      // Navigate to submissions view for this assignment
      this.$router.push(`/assignments/${this.id}/submissions`);
    },

    goBack() {
      this.$router.go(-1);
    }
  }
};
</script>

<style scoped>
.assignment-detail {
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
  margin-bottom: 20px;
}

.modern-card .card-header {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 15px 15px 0 0;
  padding: 1rem 1.5rem;
}

.meta-item {
  margin-bottom: 0.5rem;
}

.file-item {
  background: #f8f9fa;
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.file-item a {
  color: #007bff;
  text-decoration: none;
}

.file-item a:hover {
  text-decoration: underline;
}

.status-item {
  text-align: center;
  margin-bottom: 1rem;
}

.status-number {
  font-size: 2rem;
  font-weight: bold;
  color: #007bff;
}

.status-label {
  font-size: 0.875rem;
  color: #6c757d;
}

.modern-btn {
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.modern-btn-outline-secondary {
  border: 2px solid #6c757d;
  color: #6c757d;
  background: transparent;
}

.modern-btn-outline-secondary:hover {
  background: #6c757d;
  color: white;
}
</style>