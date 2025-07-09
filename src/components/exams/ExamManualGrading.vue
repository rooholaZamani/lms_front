<template>
  <div class="exam-manual-grading">
    <div class="container-fluid">
      <!-- Page Header -->
      <div class="page-header">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <h1 class="page-title">نمره‌گذاری دستی آزمون</h1>
            <p class="page-subtitle" v-if="examData">{{ examData.examTitle }}</p>
          </div>
          <button class="modern-btn modern-btn-outline" @click="goBack">
            <i class="fas fa-arrow-right me-2"></i>
            بازگشت
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">در حال بارگذاری...</span>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="alert alert-danger">
        <i class="fas fa-exclamation-triangle me-2"></i>
        {{ error }}
      </div>

      <!-- Main Content -->
      <div v-else-if="examData">
        <!-- Stats -->
        <div class="row mb-4">
          <div class="col-md-3">
            <div class="stat-card">
              <div class="stat-icon bg-primary">
                <i class="fas fa-users"></i>
              </div>
              <div class="stat-content">
                <h3>{{ examData.totalSubmissions }}</h3>
                <p>کل ارسالی‌ها</p>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="stat-card">
              <div class="stat-icon bg-warning">
                <i class="fas fa-clock"></i>
              </div>
              <div class="stat-content">
                <h3>{{ examData.needsGradingCount }}</h3>
                <p>نیاز به نمره‌گذاری</p>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="stat-card">
              <div class="stat-icon bg-info">
                <i class="fas fa-clipboard-list"></i>
              </div>
              <div class="stat-content">
                <h3>{{ manualQuestionsCount }}</h3>
                <p>سوالات تشریحی</p>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="stat-card">
              <div class="stat-icon bg-success">
                <i class="fas fa-check"></i>
              </div>
              <div class="stat-content">
                <h3>{{ examData.totalSubmissions - examData.needsGradingCount }}</h3>
                <p>تکمیل شده</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Submissions Table -->
        <div class="modern-card">
          <div class="modern-card-header">
            <h5 class="card-title mb-0">
              <i class="fas fa-list me-2"></i>
              ارسالی‌های نیازمند نمره‌گذاری
            </h5>
          </div>
          <div class="modern-card-body">
            <div class="table-responsive">
              <table class="table table-hover">
                <thead>
                <tr>
                  <th>ردیف</th>
                  <th>دانش‌آموز</th>
                  <th>زمان ارسال</th>
                  <th>نمره فعلی</th>
                  <th>وضعیت نمره‌گذاری</th>
                  <th>عملیات</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="(submission, index) in examData.submissions" :key="submission.id">
                  <td>{{ index + 1 }}</td>
                  <td>
                    <div class="student-info">
                      <div class="student-name">{{ getStudentName(submission) }}</div>
                      <div class="student-username">{{ submission.studentUsername }}</div>
                    </div>
                  </td>
                  <td>{{ formatDateTime(submission.submissionTime) }}</td>
                  <td>
                    <span class="score-display">{{ submission.score || 0 }}</span>
                  </td>
                  <td>
                    <span class="badge" :class="getGradingStatusClass(submission)">
                      {{ getGradingStatusText(submission) }}
                    </span>
                  </td>
                  <td>
                    <div class="action-buttons">
                      <button
                          class="modern-btn modern-btn-sm modern-btn-primary"
                          @click="gradeSubmission(submission)"
                      >
                        <i class="fas fa-edit me-1"></i>
                        {{ submission.gradedManually ? 'ویرایش نمره' : 'نمره‌گذاری' }}
                      </button>
                      <button
                          class="modern-btn modern-btn-sm modern-btn-outline"
                          @click="viewSubmission(submission)"
                      >
                        <i class="fas fa-eye me-1"></i>
                        مشاهده
                      </button>
                    </div>
                  </td>
                </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Grading Modal -->
      <div class="modal fade" id="gradingModal" tabindex="-1">
        <div class="modal-dialog modal-xl">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">
                <i class="fas fa-clipboard-check me-2"></i>
                نمره‌گذاری ارسالی
              </h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <div v-if="selectedSubmission && gradingData" class="grading-form">
                <!-- Student Info -->
                <div class="student-header mb-4">
                  <h6>
                    <i class="fas fa-user me-2"></i>
                    {{ gradingData.studentName }}
                  </h6>
                  <p class="text-muted mb-0">
                    زمان ارسال: {{ formatDateTime(gradingData.submissionTime) }}
                  </p>
                </div>

                <!-- Questions -->
                <div class="questions-container">
                  <div
                      v-for="(question, questionId) in gradingData.questions"
                      :key="questionId"
                      class="question-card mb-4"
                  >
                    <div class="question-header">
                      <div class="question-info">
                        <span class="question-type-badge" :class="getQuestionTypeClass(question.questionType)">
                          {{ getQuestionTypeText(question.questionType) }}
                        </span>
                        <span class="question-points">{{ question.points }} امتیاز</span>
                      </div>
                    </div>

                    <div class="question-content">
                      <h6 class="question-text">{{ question.text }}</h6>

                      <!-- Student Answer -->
                      <div class="answer-section">
                        <label class="answer-label">پاسخ دانش‌آموز:</label>
                        <div class="answer-content">
                          <div v-if="question.questionType === 'ESSAY' || question.questionType === 'SHORT_ANSWER'"
                               class="text-answer">
                            {{ question.studentAnswer || 'پاسخی ارائه نشده' }}
                          </div>
                          <div v-else class="auto-graded-answer">
                            <span :class="question.isCorrect ? 'text-success' : 'text-danger'">
                              {{ question.studentAnswer }}
                              <i :class="question.isCorrect ? 'fas fa-check' : 'fas fa-times'" class="ms-2"></i>
                            </span>
                          </div>
                        </div>
                      </div>

                      <!-- Manual Grading -->
                      <div v-if="question.needsManualGrading" class="grading-section">
                        <label class="grading-label">نمره:</label>
                        <div class="grading-input">
                          <input
                              type="number"
                              class="form-control"
                              :max="question.points"
                              min="0"
                              v-model="manualGrades[questionId]"
                              @input="calculateTotalScore"
                          >
                          <span class="input-addon">از {{ question.points }}</span>
                        </div>
                      </div>

                      <!-- Auto Grade Display -->
                      <div v-else class="auto-grade-display">
                        <span class="grade-badge" :class="question.isCorrect ? 'grade-correct' : 'grade-incorrect'">
                          {{ question.autoGrade }} از {{ question.points }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Feedback -->
                <div class="feedback-section mt-4">
                  <label for="feedback" class="form-label">بازخورد کلی:</label>
                  <textarea
                      id="feedback"
                      class="form-control"
                      rows="4"
                      v-model="feedback"
                      placeholder="بازخورد و نظرات خود را در اینجا بنویسید..."
                  ></textarea>
                </div>

                <!-- Score Summary -->
                <div class="score-summary mt-4">
                  <div class="row">
                    <div class="col-md-4">
                      <div class="summary-item">
                        <label>نمره کل:</label>
                        <span class="summary-value">{{ totalCalculatedScore }}</span>
                      </div>
                    </div>
                    <div class="col-md-4">
                      <div class="summary-item">
                        <label>حداکثر نمره:</label>
                        <span class="summary-value">{{ gradingData.totalPossibleScore }}</span>
                      </div>
                    </div>
                    <div class="col-md-4">
                      <div class="summary-item">
                        <label>وضعیت:</label>
                        <span class="summary-value" :class="totalCalculatedScore >= gradingData.passingScore ? 'text-success' : 'text-danger'">
                          {{ totalCalculatedScore >= gradingData.passingScore ? 'قبول' : 'مردود' }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                انصراف
              </button>
              <button type="button" class="btn btn-primary" @click="saveGrades" :disabled="submitting">
                <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>
                <i class="fas fa-save me-2"></i>
                ذخیره نمرات
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- View Modal -->
      <div class="modal fade" id="viewModal" tabindex="-1">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">
                <i class="fas fa-eye me-2"></i>
                مشاهده ارسالی
              </h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <div v-if="viewData">
                <div class="row">
                  <div class="col-md-6">
                    <h6>اطلاعات دانش‌آموز</h6>
                    <div class="detail-list">
                      <div class="detail-item">
                        <span class="detail-label">نام:</span>
                        <span class="detail-value">{{ viewData.studentName }}</span>
                      </div>
                      <div class="detail-item">
                        <span class="detail-label">زمان ارسال:</span>
                        <span class="detail-value">{{ formatDateTime(viewData.submissionTime) }}</span>
                      </div>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <h6>نتایج</h6>
                    <div class="detail-list">
                      <div class="detail-item">
                        <span class="detail-label">نمره:</span>
                        <span class="detail-value">{{ viewData.currentScore || 0 }}</span>
                      </div>
                      <div class="detail-item">
                        <span class="detail-label">وضعیت نمره‌گذاری:</span>
                        <span class="detail-value">
                          <span class="badge" :class="viewData.gradedManually ? 'bg-success' : 'bg-warning'">
                            {{ viewData.gradedManually ? 'تکمیل شده' : 'در انتظار' }}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div v-if="viewData.currentFeedback" class="mt-4">
                  <h6>بازخورد</h6>
                  <div class="feedback-display">
                    {{ viewData.currentFeedback }}
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                بستن
              </button>
              <button type="button" class="btn btn-primary" @click="editFromView" v-if="viewData && !viewData.gradedManually">
                <i class="fas fa-edit me-2"></i>
                شروع نمره‌گذاری
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'ExamManualGrading',
  props: {
    examId: {
      type: [String, Number],
      required: true
    }
  },
  data() {
    return {
      loading: false,
      error: null,
      examData: null,
      selectedSubmission: null,
      gradingData: null,
      viewData: null,
      manualGrades: {},
      feedback: '',
      submitting: false,
      totalCalculatedScore: 0
    }
  },
  computed: {
    manualQuestionsCount() {
      if (!this.examData || !this.examData.submissions || this.examData.submissions.length === 0) return 0;
      return this.examData.submissions[0]?.manualQuestionsCount || 0;
    }
  },
  async mounted() {
    await this.fetchData();
  },
  methods: {
    async fetchData() {
      try {
        this.loading = true;
        this.error = null;

        const response = await axios.get(`/exams/${this.examId}/submissions-for-grading`);
        this.examData = response.data;

      } catch (error) {
        console.error('Error fetching grading data:', error);
        this.error = 'خطا در دریافت اطلاعات نمره‌گذاری';
      } finally {
        this.loading = false;
      }
    },

    async gradeSubmission(submission) {
      try {
        this.selectedSubmission = submission;

        const response = await axios.get(`/exams/submissions/${submission.id}/grading-detail`);
        this.gradingData = response.data;

        // Initialize manual grades
        this.manualGrades = {};
        this.feedback = this.gradingData.currentFeedback || '';

        Object.keys(this.gradingData.questions).forEach(questionId => {
          const question = this.gradingData.questions[questionId];
          if (question.needsManualGrading) {
            this.manualGrades[questionId] = question.manualGrade || 0;
          }
        });

        this.calculateTotalScore();

        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('gradingModal'));
        modal.show();

      } catch (error) {
        console.error('Error loading grading detail:', error);
        this.$toast?.error('خطا در دریافت جزئیات نمره‌گذاری');
      }
    },

    async viewSubmission(submission) {
      try {
        const response = await axios.get(`/exams/submissions/${submission.id}/grading-detail`);
        this.viewData = response.data;

        // Show view modal
        const modal = new bootstrap.Modal(document.getElementById('viewModal'));
        modal.show();

      } catch (error) {
        console.error('Error loading submission detail:', error);
        this.$toast?.error('خطا در دریافت جزئیات ارسالی');
      }
    },

    editFromView() {
      // Close view modal
      const viewModal = bootstrap.Modal.getInstance(document.getElementById('viewModal'));
      viewModal.hide();

      // Open grading modal with the same data
      this.selectedSubmission = { id: this.viewData.submissionId };
      this.gradingData = this.viewData;

      // Initialize manual grades
      this.manualGrades = {};
      this.feedback = this.gradingData.currentFeedback || '';

      Object.keys(this.gradingData.questions).forEach(questionId => {
        const question = this.gradingData.questions[questionId];
        if (question.needsManualGrading) {
          this.manualGrades[questionId] = question.manualGrade || 0;
        }
      });

      this.calculateTotalScore();

      // Show grading modal
      setTimeout(() => {
        const modal = new bootstrap.Modal(document.getElementById('gradingModal'));
        modal.show();
      }, 300);
    },

    calculateTotalScore() {
      if (!this.gradingData || !this.gradingData.questions) return;

      let total = 0;

      Object.keys(this.gradingData.questions).forEach(questionId => {
        const question = this.gradingData.questions[questionId];

        if (question.needsManualGrading) {
          // نمره دستی
          const manualScore = parseInt(this.manualGrades[questionId]) || 0;
          total += Math.min(Math.max(manualScore, 0), question.points);
        } else {
          // نمره خودکار
          total += question.autoGrade || 0;
        }
      });

      this.totalCalculatedScore = total;
    },

    async saveGrades() {
      try {
        this.submitting = true;

        const gradingData = {
          manualGrades: this.manualGrades,
          feedback: this.feedback
        };

        const response = await axios.post(
            `/exams/submissions/${this.selectedSubmission.id}/manual-grade`,
            gradingData
        );

        if (response.data.success) {
          this.$toast?.success('نمره‌گذاری با موفقیت انجام شد');

          // Close modal
          const modal = bootstrap.Modal.getInstance(document.getElementById('gradingModal'));
          modal.hide();

          // Refresh data
          await this.fetchData();
        } else {
          this.$toast?.error(response.data.message || 'خطا در ذخیره نمرات');
        }

      } catch (error) {
        console.error('Error saving grades:', error);
        this.$toast?.error('خطا در ذخیره نمرات');
      } finally {
        this.submitting = false;
      }
    },

    getStudentName(submission) {
      return submission.studentName || 'نامشخص';
    },

    getGradingStatusClass(submission) {
      if (submission.gradedManually) {
        return 'bg-success';
      } else if (submission.needsManualGrading) {
        return 'bg-warning text-dark';
      } else {
        return 'bg-info';
      }
    },

    getGradingStatusText(submission) {
      if (submission.gradedManually) {
        return 'تکمیل شده';
      } else if (submission.needsManualGrading) {
        return 'در انتظار نمره‌گذاری';
      } else {
        return 'خودکار';
      }
    },

    getStatusClass(passed) {
      return passed ? 'text-success' : 'text-danger';
    },

    getQuestionTypeText(type) {
      const labels = {
        'MULTIPLE_CHOICE': 'چند گزینه‌ای',
        'TRUE_FALSE': 'درست/غلط',
        'MATCHING': 'تطبیقی',
        'CATEGORIZATION': 'دسته‌بندی',
        'FILL_IN_THE_BLANKS': 'جای خالی',
        'ESSAY': 'تشریحی',
        'SHORT_ANSWER': 'پاسخ کوتاه'
      };
      return labels[type] || type;
    },

    getQuestionTypeClass(type) {
      const classes = {
        'MULTIPLE_CHOICE': 'badge-primary',
        'TRUE_FALSE': 'badge-secondary',
        'MATCHING': 'badge-success',
        'CATEGORIZATION': 'badge-warning',
        'FILL_IN_THE_BLANKS': 'badge-info',
        'ESSAY': 'badge-danger',
        'SHORT_ANSWER': 'badge-light'
      };
      return classes[type] || 'badge-secondary';
    },

    formatDateTime(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('fa-IR') + ' ' + date.toLocaleTimeString('fa-IR', {
        hour: '2-digit',
        minute: '2-digit'
      });
    },

    goBack() {
      this.$router.go(-1);
    }
  }
}
</script>

<style scoped>
.exam-manual-grading {
  background: #f8f9fa;
  min-height: 100vh;
  padding: 2rem 0;
}

.page-header {
  background: white;
  padding: 2rem;
  border-radius: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.page-title {
  color: #2c3e50;
  font-weight: 600;
  margin: 0;
}

.page-subtitle {
  color: #6c757d;
  margin: 0;
  font-size: 1.1rem;
}

.stat-card {
  background: white;
  border-radius: 15px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
  margin-left: 1rem;
}

.stat-content h3 {
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
}

.stat-content p {
  margin: 0;
  color: #6c757d;
  font-size: 0.9rem;
}

.modern-card {
  background: white;
  border-radius: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.modern-card-header {
  background: #f8f9fa;
  padding: 1.5rem;
  border-bottom: 1px solid #dee2e6;
}

.modern-card-body {
  padding: 1.5rem;
}

.modern-btn {
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-weight: 600;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  transition: all 0.3s ease;
}

.modern-btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
}

.modern-btn-primary {
  background: #007bff;
  color: white;
}

.modern-btn-primary:hover {
  background: #0056b3;
  color: white;
}

.modern-btn-outline {
  background: transparent;
  color: #6c757d;
  border: 1px solid #dee2e6;
}

.modern-btn-outline:hover {
  background: #f8f9fa;
  color: #495057;
}

.student-info {
  display: flex;
  flex-direction: column;
}

.student-name {
  font-weight: 600;
  color: #2c3e50;
}

.student-username {
  font-size: 0.85rem;
  color: #6c757d;
}

.score-display {
  font-weight: 600;
  font-size: 1.1rem;
  color: #2c3e50;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.question-card {
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 10px;
  overflow: hidden;
}

.question-header {
  background: #f8f9fa;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.question-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.question-type-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.75rem;
  font-weight: 600;
}

.badge-primary { background: #007bff; color: white; }
.badge-secondary { background: #6c757d; color: white; }
.badge-success { background: #28a745; color: white; }
.badge-warning { background: #ffc107; color: #212529; }
.badge-info { background: #17a2b8; color: white; }
.badge-danger { background: #dc3545; color: white; }
.badge-light { background: #f8f9fa; color: #212529; border: 1px solid #dee2e6; }

.question-points {
  color: #6c757d;
  font-size: 0.9rem;
}

.question-content {
  padding: 1.5rem;
}

.question-text {
  color: #2c3e50;
  margin-bottom: 1rem;
}

.answer-section {
  margin-bottom: 1rem;
}

.answer-label {
  font-weight: 600;
  color: #495057;
  margin-bottom: 0.5rem;
  display: block;
}

.answer-content {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #dee2e6;
}

.text-answer {
  white-space: pre-wrap;
  line-height: 1.6;
}

.grading-section {
  margin-top: 1rem;
}

.grading-label {
  font-weight: 600;
  color: #495057;
  margin-bottom: 0.5rem;
  display: block;
}

.grading-input {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.grading-input input {
  width: 120px;
}

.input-addon {
  color: #6c757d;
  font-size: 0.9rem;
}

.auto-grade-display {
  margin-top: 1rem;
}

.grade-badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 600;
}

.grade-correct {
  background: #d4edda;
  color: #155724;
}

.grade-incorrect {
  background: #f8d7da;
  color: #721c24;
}

.feedback-section {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 10px;
}

.score-summary {
  background: #e3f2fd;
  padding: 1.5rem;
  border-radius: 10px;
}

.summary-item {
  text-align: center;
}

.summary-item label {
  display: block;
  font-weight: 600;
  color: #495057;
  margin-bottom: 0.5rem;
}

.summary-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2c3e50;
}

.detail-list {
  background: rgba(248, 249, 250, 0.8);
  border-radius: 8px;
  padding: 1rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-label {
  font-weight: 600;
  color: #333;
}

.detail-value {
  color: #6c757d;
}

.feedback-display {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #dee2e6;
  white-space: pre-wrap;
}

@media (max-width: 768px) {
  .exam-manual-grading {
    padding: 1rem 0;
  }

  .page-header {
    padding: 1rem;
  }

  .stat-card {
    margin-bottom: 1rem;
  }

  .action-buttons {
    flex-direction: column;
  }

  .modern-btn-sm {
    width: 100%;
    margin-bottom: 0.5rem;
  }
}
</style>