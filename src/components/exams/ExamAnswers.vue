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
                    <span class="summary-value">{{ formatDurationSecend(submissionData.timeSpent) }} </span>
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

        <!-- Questions and Answers Section -->
        <div class="modern-card">
          <h4 class="section-title mb-4">
            <i class="fas fa-list-alt me-2"></i>
            سوالات و پاسخ‌ها
          </h4>

          <!-- Check if we have answers -->
          <div v-if="!submissionData.answers || getTotalQuestionsCount() === 0" class="alert alert-warning">
            هیچ سوال و پاسخی یافت نشد
          </div>

          <!-- Loop through answers -->
          <div v-else>
            <!-- If answers is an object, convert to array -->
            <div
                v-for="(answer, index) in getAnswersArray()"
                :key="index"
                class="question-answer-item mb-4"
            >
              <!-- Question Header -->
              <div class="question-card">
                <div class="question-header">
                  <div class="question-number">
                    <span>{{ index + 1 }}</span>
                  </div>
                  <div class="question-meta">
                    <div class="question-type">
                      <span class="badge" :class="getQuestionTypeClass(answer.questionType)">
                        {{ getQuestionTypeText(answer.questionType) }}
                      </span>
                    </div>
                    <div class="question-points">
                      <span class="earned-points" :class="answer.isCorrect ? 'text-success' : 'text-danger'">
                        {{ answer.earnedPoints || 0 }}
                      </span>
                      <span class="total-points">/ {{ answer.totalPoints || 10 }} امتیاز</span>
                    </div>
                    <div class="question-result-icon">
                      <i :class="answer.isCorrect ? 'fas fa-check text-success' : 'fas fa-times text-danger'"></i>
                    </div>
                  </div>
                </div>
                <div class="question-text">{{ answer.questionText }}</div>
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
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'ExamAnswers',
  props: {
    submissionId: {
      type: [String, Number],
      required: true
    }
  },
  data() {
    return {
      submissionData : null,
      loading: true,
      error: null
    }
  },
  async mounted() {
    await this.fetchExamAnswers()
    // await this.fetchData()
  },
  methods: {
    getAnswersArray() {
      if (!this.submissionData.answers) return [];

      // اگر آرایه باشه، همون رو برگردون
      if (Array.isArray(this.submissionData.answers)) {
        return this.submissionData.answers;
      }

      // اگر object باشه، به آرایه تبدیل کن
      if (typeof this.submissionData.answers === 'object') {
        return Object.values(this.submissionData.answers);
      }

      return [];
    },
    isMatchingCorrect(answer, leftItem) {
      if (!answer.studentAnswer || !answer.correctAnswer) return false;
      return answer.studentAnswer[leftItem] === answer.correctAnswer[leftItem];
    },

    isBlankCorrect(answer, blankIndex) {
      if (!answer.studentAnswer || !answer.correctAnswer) return false;
      const studentBlanks = this.getBlankAnswers(answer.studentAnswer);
      const correctBlanks = this.getBlankAnswers(answer.correctAnswer);
      return studentBlanks[blankIndex] === correctBlanks[blankIndex];
    },

    getBlankAnswers(answers) {
      if (Array.isArray(answers)) return answers;
      if (typeof answers === 'string') {
        try {
          return JSON.parse(answers);
        } catch {
          return answers.split(',').map(s => s.trim());
        }
      }
      return [];
    },
    getTotalQuestionsCount() {
      const answers = this.getAnswersArray();
      return answers.length;
    },
    getCorrectAnswersCount() {
      const answers = this.getAnswersArray();
      return answers.filter(answer => answer.isCorrect).length;
    },
    formatDateTime(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('fa-IR') + ' ' + date.toLocaleTimeString('fa-IR');
    },
    getScorePercentage() {
      if (!this.submissionData?.score || !this.submissionData?.totalPossibleScore) return 0;
      return Math.round((this.submissionData.score / this.submissionData.totalPossibleScore) * 100);
    },

    getScoreClass() {
      const percentage = this.getScorePercentage();
      if (percentage >= 90) return 'score-excellent';
      if (percentage >= 80) return 'score-good';
      if (percentage >= 70) return 'score-average';
      if (percentage >= 60) return 'score-poor';
      return 'score-fail';
    },

    getQuestionTypeText(type) {
      const labels = {
        'MULTIPLE_CHOICE': 'چند گزینه‌ای',
        'TRUE_FALSE': 'درست/غلط',
        'MATCHING': 'تطبیقی',
        'CATEGORIZATION': 'دسته‌بندی',
        'FILL_IN_THE_BLANK': 'جای خالی',
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
        'FILL_IN_THE_BLANK': 'badge-info',
        'ESSAY': 'badge-danger',
        'SHORT_ANSWER': 'badge-light'
      };
      return classes[type] || 'badge-secondary';
    },

    goBack() {
      this.$router.go(-1);
    },
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
    async fetchExamAnswers() {
      try {
        this.loading = true
        this.error = null

        // استفاده از submissionId برای دریافت داده‌ها
        const response = await axios.get(`/exams/${this.submissionId}/student-answers`)
        this.submissionData  = response.data

      } catch (error) {
        console.error('Error fetching exam answers:', error)
        this.error = 'خطا در بارگذاری پاسخ‌های آزمون'
      } finally {
        this.loading = false
      }
    },

    getEarnedScore() {
      if (!this.examData?.answers) return 0
      return Object.values(this.examData.answers)
          .reduce((total, answer) => total + (answer.earnedPoints || 0), 0)
    },

    formatTime(seconds) {
      if (!seconds) return '00:00'
      const mins = Math.floor(seconds / 60)
      const secs = seconds % 60
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    },

    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleDateString('fa-IR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    formatDurationSecend(secends) {

      if (!secends) return '-';
      const min = Math.floor(secends / 60);
      const sec = secends % 60;
      const hrs = Math.floor(min / 60);
      const mins = min % 60;

      if (sec > 0) {
        return `${hrs} ساعت و ${mins} دقیقه و ${sec} ثانیه`;
      }
      return `${mins} دقیقه`;
    },

    getQuestionTypeLabel(type) {
      const labels = {
        'MULTIPLE_CHOICE': 'چند گزینه‌ای',
        'TRUE_FALSE': 'درست/غلط',
        'MATCHING': 'تطبیقی',
        'CATEGORIZATION': 'دسته‌بندی',
        'FILL_IN_THE_BLANK': 'جای خالی',
        'ESSAY': 'تشریحی',
        'SHORT_ANSWER': 'پاسخ کوتاه'
      }
      return labels[type] || type
    },

    getQuestionTypeBadgeClass(type) {
      const classes = {
        'MULTIPLE_CHOICE': 'primary',
        'TRUE_FALSE': 'secondary',
        'MATCHING': 'success',
        'CATEGORIZATION': 'warning',
        'FILL_IN_THE_BLANK': 'info',
        'ESSAY': 'danger',
        'SHORT_ANSWER': 'light'
      }
      return classes[type] || 'secondary'
    },

    checkMatchingCorrectness(questionData, leftItem, rightItem) {
      const correctAnswer = questionData.correctAnswer?.[leftItem]
      return rightItem === correctAnswer ? 'correct' : 'incorrect'
    },

    checkCategorizationCorrectness(questionData, item, category) {
      const correctCategory = questionData.correctAnswer?.[item]
      return category === correctCategory ? 'correct' : 'incorrect'
    }
  }
}
</script>

<style scoped>
.exam-answers-page {
  background: #f8f9fa;
  min-height: 100vh;
  padding: 2rem 0;
  direction: rtl;
}

.container-fluid {
  max-width: 1200px;
  margin: 0 auto;
}

/* Loading & Error States */
.loading-section, .error-section {
  padding: 3rem 0;
}

/* Summary Header */
.summary-header {
  margin-bottom: 2rem;
}

.summary-card {
  background: white;
  border-radius: 15px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.page-title {
  color: #2c3e50;
  font-weight: 700;
  margin: 0;
}

.status-badge {
  padding: 0.75rem 1.5rem;
  border-radius: 25px;
  font-weight: 600;
  font-size: 1rem;
}

.status-badge.success {
  background: linear-gradient(135deg, #28a745, #20c997);
  color: white;
}

.status-badge.danger {
  background: linear-gradient(135deg, #dc3545, #fd7e14);
  color: white;
}

/* Stats Row */
.stats-row {
  margin-top: 2rem;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  border-left: 4px solid;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-card.primary { border-color: #007bff; }
.stat-card.success { border-color: #28a745; }
.stat-card.warning { border-color: #ffc107; }
.stat-card.info { border-color: #17a2b8; }

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
}

.stat-card.primary .stat-icon { background: #007bff; }
.stat-card.success .stat-icon { background: #28a745; }
.stat-card.warning .stat-icon { background: #ffc107; }
.stat-card.info .stat-icon { background: #17a2b8; }

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2c3e50;
  line-height: 1;
}

.stat-label {
  font-size: 0.9rem;
  color: #6c757d;
  margin-top: 0.25rem;
}

/* Questions Section */
.questions-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.question-card {
  background: white;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.question-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
}

/* Question Header */
.question-header {
  background: #f8f9fa;
  padding: 1.5rem;
  border-bottom: 1px solid #e9ecef;
}

.question-number {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.1rem;
}

.question-badges {
  display: flex;
  gap: 0.75rem;
  margin-right: 1rem;
}

.type-badge {
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  color: white;
}

.type-badge.primary { background: #007bff; }
.type-badge.secondary { background: #6c757d; }
.type-badge.success { background: #28a745; }
.type-badge.warning { background: #ffc107; color: #212529; }
.type-badge.info { background: #17a2b8; }
.type-badge.danger { background: #dc3545; }
.type-badge.light { background: #f8f9fa; color: #212529; }

.result-badge {
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

.result-badge.correct {
  background: #d4edda;
  color: #155724;
}

.result-badge.incorrect {
  background: #f8d7da;
  color: #721c24;
}

.question-text {
  color: #2c3e50;
  font-weight: 500;
  line-height: 1.6;
  margin: 0;
}

.points-info {
  text-align: center;
  min-width: 80px;
}

.points-earned {
  font-size: 1.8rem;
  font-weight: 700;
  line-height: 1;
}

.points-earned.correct { color: #28a745; }
.points-earned.incorrect { color: #dc3545; }

.points-total {
  font-size: 1rem;
  color: #6c757d;
  line-height: 1;
}

.points-label {
  font-size: 0.8rem;
  color: #6c757d;
  margin-top: 0.25rem;
}

/* Answer Content */
.answer-content {
  padding: 2rem;
}

.answer-comparison {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.answer-section {
  background: #f8f9fa;
  border-radius: 10px;
  padding: 1.5rem;
}

.answer-section.student {
  background: rgba(23, 162, 184, 0.05);
  border: 1px solid rgba(23, 162, 184, 0.2);
}

.answer-section.correct {
  background: rgba(40, 167, 69, 0.05);
  border: 1px solid rgba(40, 167, 69, 0.2);
}

.answer-title {
  color: #495057;
  font-weight: 600;
  margin-bottom: 1rem;
  font-size: 1rem;
}

.answer-box {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  border: 2px solid #e9ecef;
  font-weight: 500;
  min-height: 50px;
  display: flex;
  align-items: center;
}

.answer-box.correct {
  border-color: #28a745;
  background: rgba(40, 167, 69, 0.05);
  color: #155724;
}

.answer-box.incorrect {
  border-color: #dc3545;
  background: rgba(220, 53, 69, 0.05);
  color: #721c24;
}

/* Matching Styles */
.matching-pairs {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.matching-pair {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  border: 2px solid #e9ecef;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.matching-pair.correct {
  border-color: #28a745;
  background: rgba(40, 167, 69, 0.05);
}

.matching-pair.incorrect {
  border-color: #dc3545;
  background: rgba(220, 53, 69, 0.05);
}

.left-item, .right-item {
  font-weight: 500;
  flex: 1;
}

.left-item {
  color: #495057;
}

.right-item {
  color: #6c757d;
  text-align: left;
}

/* Categorization Styles */
.category-items {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.category-item {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  border: 2px solid #e9ecef;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.category-item.correct {
  border-color: #28a745;
  background: rgba(40, 167, 69, 0.05);
}

.category-item.incorrect {
  border-color: #dc3545;
  background: rgba(220, 53, 69, 0.05);
}

.item-name {
  font-weight: 500;
  color: #495057;
  flex: 1;
}

.category-badge {
  background: #667eea;
  color: white;
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
}

/* Responsive Design */
@media (max-width: 768px) {
  .exam-answers-page {
    padding: 1rem 0;
  }

  .summary-card {
    padding: 1rem;
  }

  .stats-row {
    margin-top: 1rem;
  }

  .stat-card {
    margin-bottom: 0.5rem;
  }

  .answer-comparison {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .question-header {
    padding: 1rem;
  }

  .answer-content {
    padding: 1rem;
  }

  .stat-value {
    font-size: 1.2rem;
  }

  .points-earned {
    font-size: 1.4rem;
  }
}

@media (max-width: 576px) {
  .question-badges {
    flex-direction: column;
    gap: 0.5rem;
  }

  .stat-card {
    flex-direction: column;
    text-align: center;
    gap: 0.5rem;
  }

  .stat-icon {
    width: 40px;
    height: 40px;
    font-size: 1.2rem;
  }
}
</style>