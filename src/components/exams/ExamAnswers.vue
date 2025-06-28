<template>
  <div class="exam-answers-page">
    <div class="container mt-4">
      <!-- Header -->
      <div class="page-header mb-4">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <h2 class="page-title">
              <i class="fas fa-eye me-2"></i>
              مشاهده پاسخ‌های آزمون
            </h2>
            <nav aria-label="breadcrumb">
              <ol class="breadcrumb">
                <li class="breadcrumb-item">
                  <router-link to="/dashboard">داشبورد</router-link>
                </li>
                <li class="breadcrumb-item">
                  <router-link to="/student/exams">آزمون‌های من</router-link>
                </li>
                <li class="breadcrumb-item active">مشاهده پاسخ‌ها</li>
              </ol>
            </nav>
          </div>
          <button class="modern-btn modern-btn-secondary" @click="goBack">
            <i class="fas fa-arrow-right me-1"></i>
            بازگشت
          </button>
        </div>
      </div>

      <loading-spinner v-if="loading" />

      <div v-else-if="error" class="error-state">
        <div class="modern-card">
          <div class="text-center py-5">
            <div class="modern-logo large danger mb-4">
              <i class="fas fa-exclamation-triangle"></i>
            </div>
            <h4 class="text-danger mb-3">خطا در بارگذاری اطلاعات</h4>
            <p class="text-muted mb-4">{{ error }}</p>
            <button class="modern-btn modern-btn-primary" @click="fetchData">
              <i class="fas fa-redo me-1"></i>
              تلاش مجدد
            </button>
          </div>
        </div>
      </div>

      <div v-else class="exam-answers-content">
        <!-- Exam Summary -->
        <div class="row mb-4">
          <div class="col-lg-8">
            <div class="modern-card animate-slide-up">
              <div class="modern-card-header">
                <h5 class="mb-0">
                  <i class="fas fa-clipboard-check me-2"></i>
                  خلاصه نتیجه آزمون
                </h5>
              </div>
              <div class="modern-card-body">
                <div class="exam-summary">
                  <div class="summary-item">
                    <div class="summary-icon">
                      <i class="fas fa-file-alt"></i>
                    </div>
                    <div class="summary-content">
                      <span class="summary-label">عنوان آزمون</span>
                      <span class="summary-value">{{ submissionData.exam?.title }}</span>
                    </div>
                  </div>
                  <div class="summary-item">
                    <div class="summary-icon">
                      <i class="fas fa-book"></i>
                    </div>
                    <div class="summary-content">
                      <span class="summary-label">درس</span>
                      <span class="summary-value">{{ submissionData.exam?.lesson?.title }}</span>
                    </div>
                  </div>
                  <div class="summary-item">
                    <div class="summary-icon">
                      <i class="fas fa-calendar"></i>
                    </div>
                    <div class="summary-content">
                      <span class="summary-label">تاریخ شرکت</span>
                      <span class="summary-value">{{ formatDateTime(submissionData.submission?.submissionTime) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-lg-4">
            <div class="modern-card animate-slide-up" style="animation-delay: 0.1s;">
              <div class="modern-card-body text-center">
                <div class="score-display">
                  <div class="score-circle" :class="getScoreClass()">
                    <div class="score-number">{{ submissionData.submission?.score || 0 }}</div>
                    <div class="score-total">از {{ submissionData.exam?.totalPossibleScore || 100 }}</div>
                  </div>
                  <div class="score-percentage mt-2">
                    {{ getScorePercentage() }}%
                  </div>
                  <div class="result-status mt-2">
                    <span class="modern-badge" :class="submissionData.submission?.passed ? 'modern-badge-success' : 'modern-badge-danger'">
                      <i :class="submissionData.submission?.passed ? 'fas fa-check' : 'fas fa-times'" class="me-1"></i>
                      {{ submissionData.submission?.passed ? 'قبول' : 'مردود' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Questions and Answers -->
        <div class="modern-card animate-slide-up" style="animation-delay: 0.2s;">
          <div class="modern-card-header">
            <h5 class="mb-0">
              <i class="fas fa-question-circle me-2"></i>
              سوالات و پاسخ‌ها
            </h5>
          </div>
          <div class="modern-card-body">
            <div class="questions-container">
              <div v-for="(question, index) in submissionData.examQuestions"
                   :key="question.id"
                   class="question-card mb-4 animate-fade-in"
                   :style="`animation-delay: ${0.3 + index * 0.1}s`">

                <!-- Question Header -->
                <div class="question-header">
                  <div class="question-number">
                    <span class="question-index">{{ index + 1 }}</span>
                  </div>
                  <div class="question-content">
                    <h6 class="question-text">{{ question.text }}</h6>
                    <div class="question-meta">
                      <span class="question-points">
                        <i class="fas fa-star me-1"></i>
                        {{ question.points || 1 }} امتیاز
                      </span>
                      <span class="question-type">
                        <i class="fas fa-list me-1"></i>
                        چندگزینه‌ای
                      </span>
                    </div>
                  </div>
                  <div class="question-result">
                    <div class="result-icon" :class="getQuestionResultClass(question)">
                      <i :class="getQuestionResultIcon(question)"></i>
                    </div>
                  </div>
                </div>

                <!-- Answer Options -->
                <div class="answer-options">
                  <div v-for="option in question.answers"
                       :key="option.id"
                       class="option-item"
                       :class="getOptionClass(question, option)">
                    <div class="option-marker">
                      <i class="fas fa-circle"></i>
                    </div>
                    <div class="option-text">{{ option.text }}</div>
                    <div class="option-status">
                      <i v-if="option.correct" class="fas fa-check text-success"></i>
                      <i v-else-if="isSelectedAnswer(question, option)" class="fas fa-times text-danger"></i>
                    </div>
                  </div>
                </div>

                <!-- Question Explanation (if available) -->
                <div v-if="question.explanation" class="question-explanation">
                  <div class="explanation-header">
                    <i class="fas fa-lightbulb me-2"></i>
                    توضیح
                  </div>
                  <div class="explanation-content">
                    {{ question.explanation }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Statistics Summary -->
        <div class="row mt-4">
          <div class="col-md-3 mb-3">
            <div class="stat-card correct animate-slide-up" style="animation-delay: 0.4s;">
              <div class="stat-icon">
                <i class="fas fa-check"></i>
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ getCorrectAnswersCount() }}</div>
                <div class="stat-label">پاسخ صحیح</div>
              </div>
            </div>
          </div>
          <div class="col-md-3 mb-3">
            <div class="stat-card incorrect animate-slide-up" style="animation-delay: 0.5s;">
              <div class="stat-icon">
                <i class="fas fa-times"></i>
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ getIncorrectAnswersCount() }}</div>
                <div class="stat-label">پاسخ نادرست</div>
              </div>
            </div>
          </div>
          <div class="col-md-3 mb-3">
            <div class="stat-card unanswered animate-slide-up" style="animation-delay: 0.6s;">
              <div class="stat-icon">
                <i class="fas fa-question"></i>
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ getUnansweredCount() }}</div>
                <div class="stat-label">بدون پاسخ</div>
              </div>
            </div>
          </div>
          <div class="col-md-3 mb-3">
            <div class="stat-card total animate-slide-up" style="animation-delay: 0.7s;">
              <div class="stat-icon">
                <i class="fas fa-list"></i>
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ getTotalQuestionsCount() }}</div>
                <div class="stat-label">کل سوالات</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';

export default {
  name: 'ExamAnswers',
  components: {
    LoadingSpinner
  },
  props: {
    submissionId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      loading: true,
      error: null,
      submissionData: {
        submission: null,
        answers: {},
        examQuestions: [],
        exam: null
      }
    };
  },
  async created() {
    await this.fetchData();
  },
  methods: {
    async fetchData() {
      try {
        this.loading = true;
        this.error = null;

        const response = await axios.get(`/exams/submissions/${this.submissionId}/answers`);
        this.submissionData = response.data;

      } catch (error) {
        console.error('Error fetching submission answers:', error);
        this.error = 'خطا در دریافت اطلاعات. لطفاً دوباره تلاش کنید.';
      } finally {
        this.loading = false;
      }
    },

    goBack() {
      this.$router.go(-1);
    },

    formatDateTime(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('fa-IR') + ' ' + date.toLocaleTimeString('fa-IR');
    },

    getScorePercentage() {
      const score = this.submissionData.submission?.score || 0;
      const total = this.submissionData.exam?.totalPossibleScore || 100;
      return Math.round((score / total) * 100);
    },

    getScoreClass() {
      const percentage = this.getScorePercentage();
      if (percentage >= 90) return 'score-excellent';
      if (percentage >= 80) return 'score-good';
      if (percentage >= 70) return 'score-average';
      if (percentage >= 60) return 'score-poor';
      return 'score-fail';
    },

    isSelectedAnswer(question, option) {
      return this.submissionData.answers[question.id] == option.id;
    },

    isCorrectAnswer(question) {
      const selectedAnswerId = this.submissionData.answers[question.id];
      if (!selectedAnswerId) return false;

      const selectedOption = question.answers.find(ans => ans.id == selectedAnswerId);
      return selectedOption?.correct || false;
    },

    getQuestionResultClass(question) {
      if (this.isCorrectAnswer(question)) return 'result-correct';
      if (this.submissionData.answers[question.id]) return 'result-incorrect';
      return 'result-unanswered';
    },

    getQuestionResultIcon(question) {
      if (this.isCorrectAnswer(question)) return 'fas fa-check';
      if (this.submissionData.answers[question.id]) return 'fas fa-times';
      return 'fas fa-question';
    },

    getOptionClass(question, option) {
      const classes = [];

      if (this.isSelectedAnswer(question, option)) {
        classes.push('selected');
        if (!option.correct) classes.push('incorrect');
      }

      if (option.correct) {
        classes.push('correct');
      }

      return classes.join(' ');
    },

    getCorrectAnswersCount() {
      return this.submissionData.examQuestions?.filter(q => this.isCorrectAnswer(q)).length || 0;
    },

    getIncorrectAnswersCount() {
      return this.submissionData.examQuestions?.filter(q =>
          this.submissionData.answers[q.id] && !this.isCorrectAnswer(q)
      ).length || 0;
    },

    getUnansweredCount() {
      return this.submissionData.examQuestions?.filter(q =>
          !this.submissionData.answers[q.id]
      ).length || 0;
    },

    getTotalQuestionsCount() {
      return this.submissionData.examQuestions?.length || 0;
    }
  }
};
</script>

<style scoped>
.exam-answers-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.page-header {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.page-title {
  color: #2c3e50;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

/* Exam Summary */
.exam-summary {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(102, 126, 234, 0.05);
  border-radius: 8px;
  border-right: 4px solid #667eea;
}

.summary-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.summary-content {
  display: flex;
  flex-direction: column;
}

.summary-label {
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 0.25rem;
}

.summary-value {
  font-weight: 600;
  color: #333;
}

/* Score Display */
.score-display {
  padding: 1rem;
}

.score-circle {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  border: 4px solid;
  font-weight: 700;
  position: relative;
}

.score-circle.score-excellent {
  background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%);
  border-color: #27ae60;
  color: white;
}

.score-circle.score-good {
  background: linear-gradient(135deg, #3498db 0%, #74b9ff 100%);
  border-color: #3498db;
  color: white;
}

.score-circle.score-average {
  background: linear-gradient(135deg, #f39c12 0%, #fdcb6e 100%);
  border-color: #f39c12;
  color: white;
}

.score-circle.score-poor {
  background: linear-gradient(135deg, #e67e22 0%, #fd79a8 100%);
  border-color: #e67e22;
  color: white;
}

.score-circle.score-fail {
  background: linear-gradient(135deg, #e74c3c 0%, #fd79a8 100%);
  border-color: #e74c3c;
  color: white;
}

.score-number {
  font-size: 2rem;
  line-height: 1;
}

.score-total {
  font-size: 0.9rem;
  opacity: 0.9;
}

.score-percentage {
  font-size: 1.5rem;
  font-weight: 700;
  color: #333;
}

/* Question Cards */
.question-card {
  border: 1px solid #e9ecef;
  border-radius: 12px;
  padding: 1.5rem;
  background: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.question-card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.question-header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.question-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  flex-shrink: 0;
}

.question-content {
  flex: 1;
}

.question-text {
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
  line-height: 1.6;
}

.question-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.85rem;
  color: #666;
}

.question-result {
  flex-shrink: 0;
}

.result-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
}

.result-icon.result-correct {
  background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%);
}

.result-icon.result-incorrect {
  background: linear-gradient(135deg, #e74c3c 0%, #fd79a8 100%);
}

.result-icon.result-unanswered {
  background: linear-gradient(135deg, #95a5a6 0%, #bdc3c7 100%);
}

/* Answer Options */
.answer-options {
  margin-bottom: 1rem;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  margin-bottom: 0.5rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  transition: all 0.3s ease;
  background: white;
}

.option-item.selected {
  background: rgba(33, 150, 243, 0.1);
  border-color: #2196f3;
}

.option-item.correct {
  background: rgba(76, 175, 80, 0.1);
  border-color: #4caf50;
}

.option-item.selected.incorrect {
  background: rgba(244, 67, 54, 0.1);
  border-color: #f44336;
}

.option-marker {
  width: 12px;
  height: 12px;
  color: #666;
  flex-shrink: 0;
}

.option-item.selected .option-marker {
  color: #2196f3;
}

.option-item.correct .option-marker {
  color: #4caf50;
}

.option-text {
  flex: 1;
  color: #333;
  font-weight: 500;
}

.option-status {
  flex-shrink: 0;
  width: 20px;
  text-align: center;
}

/* Question Explanation */
.question-explanation {
  background: rgba(102, 126, 234, 0.05);
  border-radius: 8px;
  padding: 1rem;
  border-right: 4px solid #667eea;
}

.explanation-header {
  font-weight: 600;
  color: #667eea;
  margin-bottom: 0.5rem;
}

.explanation-content {
  color: #555;
  line-height: 1.6;
}

/* Statistics Cards */
.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  border-top: 4px solid;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

.stat-card.correct {
  border-top-color: #27ae60;
}

.stat-card.incorrect {
  border-top-color: #e74c3c;
}

.stat-card.unanswered {
  border-top-color: #95a5a6;
}

.stat-card.total {
  border-top-color: #3498db;
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  color: white;
  font-size: 1.25rem;
}

.stat-card.correct .stat-icon {
  background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%);
}

.stat-card.incorrect .stat-icon {
  background: linear-gradient(135deg, #e74c3c 0%, #fd79a8 100%);
}

.stat-card.unanswered .stat-icon {
  background: linear-gradient(135deg, #95a5a6 0%, #bdc3c7 100%);
}

.stat-card.total .stat-icon {
  background: linear-gradient(135deg, #3498db 0%, #74b9ff 100%);
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-weight: 600;
  color: #666;
  font-size: 0.9rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .question-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .question-meta {
    flex-direction: column;
    gap: 0.5rem;
  }

  .summary-item {
    flex-direction: column;
    text-align: center;
  }

  .score-circle {
    width: 100px;
    height: 100px;
  }

  .score-number {
    font-size: 1.5rem;
  }
}
</style>