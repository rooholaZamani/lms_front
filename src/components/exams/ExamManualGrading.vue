<template>
  <div class="exam-manual-grading">
    <div class="container-fluid">
      <!-- Header -->
      <div class="page-header">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <h2 class="page-title">
              <i class="fas fa-clipboard-check me-2"></i>
              نمره‌گذاری دستی آزمون
            </h2>
            <p class="page-subtitle" v-if="examData">{{ examData.examTitle }}</p>
          </div>
          <button class="modern-btn modern-btn-outline" @click="goBack">
            <i class="fas fa-arrow-right me-2"></i>
            بازگشت
          </button>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">در حال بارگذاری...</span>
        </div>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="alert alert-danger">
        <i class="fas fa-exclamation-triangle me-2"></i>
        {{ error }}
      </div>

      <!-- Content -->
      <div v-else-if="examData" class="grading-content">
        <!-- Statistics Cards -->
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
              <div class="stat-icon bg-success">
                <i class="fas fa-check"></i>
              </div>
              <div class="stat-content">
                <h3>{{ examData.totalSubmissions - examData.needsGradingCount }}</h3>
                <p>نمره‌گذاری شده</p>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="stat-card">
              <div class="stat-icon bg-info">
                <i class="fas fa-question"></i>
              </div>
              <div class="stat-content">
                <h3>{{ manualQuestionsCount }}</h3>
                <p>سوالات تشریحی</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Submissions Table -->
        <div class="modern-card">
          <div class="modern-card-header">
            <h5 class="card-title mb-0">
              <i class="fas fa-list me-2"></i>
              لیست ارسالی‌ها
            </h5>
          </div>
          <div class="modern-card-body">
            <div class="table-responsive">
              <table class="table table-hover">
                <thead>
                <tr>
                  <th>دانش‌آموز</th>
                  <th>زمان ارسال</th>
                  <th>نمره فعلی</th>
                  <th>وضعیت نمره‌گذاری</th>
                  <th>عملیات</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="submission in examData.submissions" :key="submission.id">
                  <td>
                    <div class="student-info">
                      <div class="student-name">{{ submission.studentName }}</div>
                      <div class="student-username">{{ submission.studentUsername }}</div>
                    </div>
                  </td>
                  <td>
                    <div class="submission-time">
                      {{ formatDateTime(submission.submissionTime) }}
                    </div>
                  </td>
                  <td>
                    <div class="score-display">
                      <span class="score-number">{{ submission.score || 0 }}</span>
                      <span class="score-total">/ {{ examData.totalPossibleScore || 0 }}</span>
                      <div :class="getScoreStatusClass(submission)" class="score-status">
                        {{ submission.passed ? 'قبول' : 'مردود' }}
                      </div>
                    </div>
                  </td>
                  <td>
                      <span v-if="submission.gradedManually" class="badge badge-success">
                        <i class="fas fa-check me-1"></i>
                        نمره‌گذاری شده
                      </span>
                    <span v-else-if="submission.needsManualGrading" class="badge badge-warning">
                        <i class="fas fa-clock me-1"></i>
                        نیاز به نمره‌گذاری
                      </span>
                    <span v-else class="badge badge-info">
                        <i class="fas fa-robot me-1"></i>
                        خودکار
                      </span>
                  </td>
                  <td>
                    <div class="action-buttons">
                      <button
                          class="modern-btn modern-btn-sm modern-btn-primary me-2"
                          @click="gradeSubmission(submission)"
                          :disabled="!submission.needsManualGrading && submission.gradedManually"
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
        this.$toast?.error('خطا در بارگذاری جزئیات');
      }
    },

    calculateTotalScore() {
      let total = 0;

      if (this.gradingData) {
        Object.keys(this.gradingData.questions).forEach(questionId => {
          const question = this.gradingData.questions[questionId];

          if (question.needsManualGrading) {
            total += parseInt(this.manualGrades[questionId] || 0);
          } else {
            total += question.autoGrade || 0;
          }
        });
      }

      this.totalCalculatedScore = total;
    },

    async saveGrades() {
      try {
        this.submitting = true;

        const gradingData = {
          manualGrades: this.manualGrades,
          feedback: this.feedback
        };

        await axios.post(`/exams/submissions/${this.selectedSubmission.id}/manual-grade`, gradingData);

        this.$toast?.success('نمرات با موفقیت ذخیره شد');

        // Hide modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('gradingModal'));
        modal.hide();

        // Refresh data
        await this.fetchData();

      } catch (error) {
        console.error('Error saving grades:', error);
        this.$toast?.error('خطا در ذخیره نمرات');
      } finally {
        this.submitting = false;
      }
    },

    viewSubmission(submission) {
      this.$router.push(`/exam-answers/${submission.id}`);
    },

    getScoreStatusClass(submission) {
      return submission.passed ? 'text-success' : 'text-danger';
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
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #dee2e6;
}

.modern-card-body {
  padding: 0;
}

.table {
  margin: 0;
}

.table th {
  background: #f8f9fa;
  border: none;
  padding: 1rem 1.5rem;
  font-weight: 600;
  color: #495057;
}

.table td {
  padding: 1rem 1.5rem;
  border: none;
  border-bottom: 1px solid #f1f3f4;
  vertical-align: middle;
}

.student-info .student-name {
  font-weight: 600;
  color: #2c3e50;
}

.student-info .student-username {
  font-size: 0.9rem;
  color: #6c757d;
}

.score-display {
  text-align: center;
}

.score-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2c3e50;
}

.score-total {
  color: #6c757d;
  margin-right: 0.25rem;
}

.score-status {
  font-size: 0.8rem;
  font-weight: 600;
  margin-top: 0.25rem;
}

.badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

.badge-success { background: #d4edda; color: #155724; }
.badge-warning { background: #fff3cd; color: #856404; }
.badge-info { background: #d1ecf1; color: #0c5460; }
.badge-primary { background: #cce7ff; color: #004085; }
.badge-secondary { background: #e2e3e5; color: #383d41; }
.badge-danger { background: #f8d7da; color: #721c24; }
.badge-light { background: #fefefe; color: #495057; border: 1px solid #dee2e6; }

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.modern-btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
}

/* Modal Styles */
.grading-form {
  max-height: 70vh;
  overflow-y: auto;
}

.student-header {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 10px;
}

.question-card {
  border: 1px solid #dee2e6;
  border-radius: 10px;
  overflow: hidden;
}

.question-header {
  background: #f8f9fa;
  padding: 1rem;
  display: flex;
  justify-content: between;
  align-items: center;
}

.question-type-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-left: 1rem;
}

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