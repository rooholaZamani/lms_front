<template>
  <div class="exam-answers-page">
    <div class="container py-4">
      <LoadingSpinner v-if="loading" />

      <div v-else-if="error" class="alert alert-danger">
        {{ error }}
      </div>

      <div v-else>
        <!-- Header -->
        <div class="page-header mb-4">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h3 class="page-title">پاسخ‌های شما</h3>
              <p class="text-muted">نتایج تفصیلی آزمون</p>
            </div>
            <button @click="goBack" class="btn btn-outline-secondary">
              <i class="fas fa-arrow-right me-2"></i>
              بازگشت
            </button>
          </div>
        </div>

        <!-- Score Summary -->
        <div class="row mb-4">
          <div class="col-lg-8">
            <div class="modern-card">
              <div class="exam-summary">
                <div class="summary-item">
                  <div class="summary-icon">
                    <i class="fas fa-calendar"></i>
                  </div>
                  <div class="summary-content">
                    <span class="summary-label">تاریخ شرکت</span>
                    <span class="summary-value">{{ formatDateTime(submissionData.submissionTime) }}</span>
                  </div>
                </div>
                <div class="summary-item">
                  <div class="summary-icon">
                    <i class="fas fa-clock"></i>
                  </div>
                  <div class="summary-content">
                    <span class="summary-label">زمان صرف شده</span>
                    <span class="summary-value">{{ submissionData.timeSpent }} دقیقه</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-lg-4">
            <div class="modern-card text-center">
              <div class="score-display">
                <div class="score-circle" :class="getScoreClass()">
                  <div class="score-number">{{ submissionData.score || 0 }}</div>
                  <div class="score-total">از {{ submissionData.totalPossibleScore || 100 }}</div>
                </div>
                <div class="score-percentage mt-2">
                  {{ getScorePercentage() }}%
                </div>
                <div class="result-status mt-2">
                  <span class="modern-badge" :class="submissionData.passed ? 'modern-badge-success' : 'modern-badge-danger'">
                    <i :class="submissionData.passed ? 'fas fa-check' : 'fas fa-times'" class="me-1"></i>
                    {{ submissionData.passed ? 'قبول' : 'مردود' }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Statistics Cards -->
        <div class="row mb-4">
          <div class="col-md-3 mb-3">
            <div class="stat-card correct">
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
            <div class="stat-card incorrect">
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
            <div class="stat-card unanswered">
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
            <div class="stat-card total">
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

        <!-- Questions and Answers -->
        <div class="questions-section">
          <h4 class="section-title mb-3">سوالات و پاسخ‌ها</h4>

          <div
              v-for="(answer, questionId, index) in submissionData.answers"
              :key="questionId"
              class="question-card mb-4"
          >
            <div class="question-header">
              <div class="question-number">{{ index + 1 }}</div>
              <div class="question-content flex-grow-1">
                <div class="question-meta">
                  <div class="question-type-badge" :class="getQuestionTypeClass(answer.questionType)">
                    {{ getQuestionTypeText(answer.questionType) }}
                  </div>
                  <div class="question-points">
                    <span class="earned-points" :class="answer.isCorrect ? 'text-success' : 'text-danger'">
                      {{ answer.earnedPoints }}
                    </span>
                    <span class="total-points">/ {{ answer.totalPoints }} امتیاز</span>
                  </div>
                  <div class="question-result-icon">
                    <i :class="answer.isCorrect ? 'fas fa-check text-success' : 'fas fa-times text-danger'"></i>
                  </div>
                </div>
                <div class="question-text">{{ answer.questionText }}</div>
              </div>
            </div>

            <!-- Question Answers based on type -->
            <div class="answer-section">
              <!-- Multiple Choice, True/False -->
              <div v-if="['MULTIPLE_CHOICE', 'TRUE_FALSE'].includes(answer.questionType)" class="choices-answers">
                <div class="answer-row">
                  <span class="answer-label">پاسخ شما:</span>
                  <span class="answer-value" :class="answer.isCorrect ? 'correct-answer' : 'incorrect-answer'">
                    {{ answer.studentAnswer || 'بدون پاسخ' }}
                  </span>
                </div>
                <div class="answer-row">
                  <span class="answer-label">پاسخ صحیح:</span>
                  <span class="answer-value correct-answer">{{ answer.correctAnswer }}</span>
                </div>
              </div>

              <!-- Fill in the Blanks -->
              <div v-else-if="answer.questionType === 'FILL_IN_THE_BLANKS'" class="blanks-answers">
                <div class="answer-row">
                  <span class="answer-label">پاسخ‌های شما:</span>
                  <div class="blanks-container">
                    <span
                        v-for="(blank, blankIndex) in getBlankAnswers(answer.studentAnswer)"
                        :key="blankIndex"
                        class="blank-answer"
                        :class="isBlankCorrect(answer, blankIndex) ? 'correct' : 'incorrect'"
                    >
                      {{ blank || 'خالی' }}
                    </span>
                  </div>
                </div>
                <div class="answer-row">
                  <span class="answer-label">پاسخ‌های صحیح:</span>
                  <div class="blanks-container">
                    <span
                        v-for="(blank, blankIndex) in getBlankAnswers(answer.correctAnswer)"
                        :key="blankIndex"
                        class="blank-answer correct"
                    >
                      {{ blank }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Matching -->
              <div v-else-if="answer.questionType === 'MATCHING'" class="matching-answers">
                <h6>تطبیق‌های شما:</h6>
                <div class="matching-pairs">
                  <div
                      v-for="(value, key) in answer.studentAnswer"
                      :key="key"
                      class="matching-pair"
                      :class="isMatchingCorrect(answer, key) ? 'correct' : 'incorrect'"
                  >
                    <span class="left-item">{{ key }}</span>
                    <i class="fas fa-arrow-left mx-2"></i>
                    <span class="right-item">{{ value || 'انتخاب نشده' }}</span>
                    <i :class="isMatchingCorrect(answer, key) ? 'fas fa-check text-success' : 'fas fa-times text-danger'" class="ms-2"></i>
                  </div>
                </div>

                <h6 class="mt-3">تطبیق‌های صحیح:</h6>
                <div class="matching-pairs">
                  <div
                      v-for="(value, key) in answer.correctAnswer"
                      :key="key"
                      class="matching-pair correct"
                  >
                    <span class="left-item">{{ key }}</span>
                    <i class="fas fa-arrow-left mx-2"></i>
                    <span class="right-item">{{ value }}</span>
                  </div>
                </div>
              </div>

              <!-- Categorization -->
              <div v-else-if="answer.questionType === 'CATEGORIZATION'" class="categorization-answers">
                <h6>دسته‌بندی‌های شما:</h6>
                <div class="category-items">
                  <div
                      v-for="(category, item) in answer.studentAnswer"
                      :key="item"
                      class="category-item"
                      :class="isCategoryCorrect(answer, item) ? 'correct' : 'incorrect'"
                  >
                    <span class="item-text">{{ item }}</span>
                    <i class="fas fa-arrow-left mx-2"></i>
                    <span class="category-text">{{ category || 'انتخاب نشده' }}</span>
                    <i :class="isCategoryCorrect(answer, item) ? 'fas fa-check text-success' : 'fas fa-times text-danger'" class="ms-2"></i>
                  </div>
                </div>

                <h6 class="mt-3">دسته‌بندی‌های صحیح:</h6>
                <div class="category-items">
                  <div
                      v-for="(category, item) in answer.correctAnswer"
                      :key="item"
                      class="category-item correct"
                  >
                    <span class="item-text">{{ item }}</span>
                    <i class="fas fa-arrow-left mx-2"></i>
                    <span class="category-text">{{ category }}</span>
                  </div>
                </div>
              </div>

              <!-- Essay and Short Answer -->
              <div v-else-if="['ESSAY', 'SHORT_ANSWER'].includes(answer.questionType)" class="text-answers">
                <div class="answer-row">
                  <span class="answer-label">پاسخ شما:</span>
                  <div class="text-answer-content" :class="answer.isCorrect ? 'correct' : 'incorrect'">
                    {{ answer.studentAnswer || 'بدون پاسخ' }}
                  </div>
                </div>
                <div class="answer-row">
                  <span class="answer-label">پاسخ صحیح:</span>
                  <div class="text-answer-content correct">{{ answer.correctAnswer }}</div>
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
      submissionData: {}
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

        const response = await axios.get(`/exams/${this.submissionId}/student-answers`);
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
      const score = this.submissionData.score || 0;
      const total = this.submissionData.totalPossibleScore || 100;
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

    getCorrectAnswersCount() {
      if (!this.submissionData.answers) return 0;
      return Object.values(this.submissionData.answers).filter(answer => answer.isCorrect).length;
    },

    getIncorrectAnswersCount() {
      if (!this.submissionData.answers) return 0;
      return Object.values(this.submissionData.answers).filter(answer =>
          !answer.isCorrect && (answer.studentAnswer !== null && answer.studentAnswer !== undefined && answer.studentAnswer !== '')
      ).length;
    },

    getUnansweredCount() {
      if (!this.submissionData.answers) return 0;
      return Object.values(this.submissionData.answers).filter(answer =>
          !answer.studentAnswer || answer.studentAnswer === '' ||
          (typeof answer.studentAnswer === 'object' && Object.keys(answer.studentAnswer).length === 0)
      ).length;
    },

    getTotalQuestionsCount() {
      return Object.keys(this.submissionData.answers || {}).length;
    },

    getQuestionTypeText(type) {
      const types = {
        'MULTIPLE_CHOICE': 'چندگزینه‌ای',
        'TRUE_FALSE': 'صحیح/غلط',
        'FILL_IN_THE_BLANKS': 'جاخالی',
        'MATCHING': 'تطبیقی',
        'CATEGORIZATION': 'دسته‌بندی',
        'ESSAY': 'تشریحی',
        'SHORT_ANSWER': 'پاسخ کوتاه'
      };
      return types[type] || type;
    },

    getQuestionTypeClass(type) {
      const classes = {
        'MULTIPLE_CHOICE': 'badge-primary',
        'TRUE_FALSE': 'badge-info',
        'FILL_IN_THE_BLANKS': 'badge-warning',
        'MATCHING': 'badge-success',
        'CATEGORIZATION': 'badge-secondary',
        'ESSAY': 'badge-dark',
        'SHORT_ANSWER': 'badge-light'
      };
      return classes[type] || 'badge-light';
    },

    getBlankAnswers(answers) {
      if (Array.isArray(answers)) return answers;
      if (typeof answers === 'object') return Object.values(answers);
      if (typeof answers === 'string') return answers.split(',').map(a => a.trim());
      return [];
    },

    isBlankCorrect(answer, index) {
      const studentAnswers = this.getBlankAnswers(answer.studentAnswer);
      const correctAnswers = this.getBlankAnswers(answer.correctAnswer);
      return studentAnswers[index] === correctAnswers[index];
    },

    isMatchingCorrect(answer, key) {
      return answer.studentAnswer[key] === answer.correctAnswer[key];
    },

    isCategoryCorrect(answer, item) {
      return answer.studentAnswer[item] === answer.correctAnswer[item];
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

.modern-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.modern-badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.85rem;
}

.modern-badge-success {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  color: white;
}

.modern-badge-danger {
  background: linear-gradient(135deg, #dc3545 0%, #fd7e14 100%);
  color: white;
}

/* Score Display */
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
}

.score-excellent {
  background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%);
  border-color: #27ae60;
  color: white;
}

.score-good {
  background: linear-gradient(135deg, #3498db 0%, #74b9ff 100%);
  border-color: #3498db;
  color: white;
}

.score-average {
  background: linear-gradient(135deg, #f39c12 0%, #fdcb6e 100%);
  border-color: #f39c12;
  color: white;
}

.score-poor {
  background: linear-gradient(135deg, #e67e22 0%, #fd79a8 100%);
  border-color: #e67e22;
  color: white;
}

.score-fail {
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
}

.stat-card.correct { border-top-color: #27ae60; }
.stat-card.incorrect { border-top-color: #e74c3c; }
.stat-card.unanswered { border-top-color: #95a5a6; }
.stat-card.total { border-top-color: #3498db; }

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

.stat-card.correct .stat-icon { background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%); }
.stat-card.incorrect .stat-icon { background: linear-gradient(135deg, #e74c3c 0%, #fd79a8 100%); }
.stat-card.unanswered .stat-icon { background: linear-gradient(135deg, #95a5a6 0%, #bdc3c7 100%); }
.stat-card.total .stat-icon { background: linear-gradient(135deg, #3498db 0%, #74b9ff 100%); }

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

/* Question Cards */
.question-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.question-header {
  display: flex;
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

.question-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.question-type-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
}

.badge-primary { background: #007bff; }
.badge-info { background: #17a2b8; }
.badge-warning { background: #ffc107; color: #212529; }
.badge-success { background: #28a745; }
.badge-secondary { background: #6c757d; }
.badge-dark { background: #343a40; }
.badge-light { background: #f8f9fa; color: #212529; }

.question-points {
  font-weight: 600;
}

.earned-points {
  font-size: 1.1rem;
}

.question-text {
  font-size: 1.1rem;
  line-height: 1.6;
  color: #333;
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
}

/* Answer Sections */
.answer-section {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
}

.answer-row {
  display: flex;
  margin-bottom: 1rem;
  align-items: flex-start;
  gap: 1rem;
}

.answer-label {
  font-weight: 600;
  color: #666;
  min-width: 100px;
}

.answer-value {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  flex: 1;
}

.correct-answer {
  background: #d4edda;
  border: 1px solid #c3e6cb;
  color: #155724;
}

.incorrect-answer {
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
}

/* Matching and Categorization */
.matching-pairs, .category-items {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.matching-pair, .category-item {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  border-radius: 6px;
  background: white;
  border: 1px solid #dee2e6;
}

.matching-pair.correct, .category-item.correct {
  background: #d4edda;
  border-color: #c3e6cb;
}

.matching-pair.incorrect, .category-item.incorrect {
  background: #f8d7da;
  border-color: #f5c6cb;
}

/* Blanks */
.blanks-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.blank-answer {
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-weight: 600;
  border: 2px solid;
}

.blank-answer.correct {
  background: #d4edda;
  border-color: #28a745;
  color: #155724;
}

.blank-answer.incorrect {
  background: #f8d7da;
  border-color: #dc3545;
  color: #721c24;
}

/* Text Answers */
.text-answer-content {
  padding: 1rem;
  border-radius: 6px;
  border: 1px solid #dee2e6;
  background: white;
  white-space: pre-wrap;
  line-height: 1.6;
}

.text-answer-content.correct {
  background: #d4edda;
  border-color: #c3e6cb;
}

.text-answer-content.incorrect {
  background: #f8d7da;
  border-color: #f5c6cb;
}

/* Summary Styles */
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

.section-title {
  color: #2c3e50;
  font-weight: 700;
  border-bottom: 3px solid #667eea;
  padding-bottom: 0.5rem;
}

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

  .answer-row {
    flex-direction: column;
  }

  .answer-label {
    min-width: auto;
  }
}
</style>