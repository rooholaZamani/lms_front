<template>
  <div class="modern-page-bg exam-results-container">
    <div class="container-fluid p-4">
      <div class="modern-card exam-results animate-slide-up">
        <div class="result-header" :class="examPassed ? 'result-passed' : 'result-failed'">
          <div class="result-icon">
            <i :class="examPassed ? 'fas fa-check-circle' : 'fas fa-times-circle'"></i>
          </div>
          <div class="result-text">
            <h3 class="result-title">
              {{ examPassed ? 'تبریک! شما در این آزمون قبول شدید.' : 'متأسفانه شما در این آزمون مردود شدید.' }}
            </h3>
            <p class="result-subtitle">
              {{ examPassed ? 'عملکرد شما در این آزمون بسیار خوب بوده است.' : 'لطفاً موضوعات را مجدداً مطالعه کنید.' }}
            </p>
          </div>
        </div>

        <div class="result-stats">
          <h5 class="modern-title">
            <i class="fas fa-chart-line text-primary me-2"></i>
            نتایج آزمون
          </h5>

          <div class="stats-grid">
            <div class="stat-card" :class="examPassed ? 'stat-success' : 'stat-danger'">
              <div class="stat-icon">
                <i class="fas fa-trophy"></i>
              </div>
              <div class="stat-value">{{ examResult.score }}%</div>
              <div class="stat-label">نمره شما</div>
            </div>

            <div class="stat-card">
              <div class="stat-icon">
                <i class="fas fa-target"></i>
              </div>
              <div class="stat-value">{{ passingScore }}%</div>
              <div class="stat-label">حد نصاب قبولی</div>
            </div>

            <div class="stat-card stat-success">
              <div class="stat-icon">
                <i class="fas fa-check"></i>
              </div>
              <div class="stat-value">{{ examResult.correctCount }}</div>
              <div class="stat-label">پاسخ‌های درست</div>
            </div>

            <div class="stat-card stat-danger">
              <div class="stat-icon">
                <i class="fas fa-times"></i>
              </div>
              <div class="stat-value">{{ examResult.incorrectCount }}</div>
              <div class="stat-label">پاسخ‌های نادرست</div>
            </div>
          </div>
        </div>

        <div class="action-buttons">
          <button class="modern-btn modern-btn-primary" @click="$emit('back-to-course')">
            <i class="fas fa-arrow-right me-1"></i> بازگشت به دوره
          </button>
          <button class="modern-btn modern-btn-info" @click="toggleShowQuestions">
            <i :class="showQuestions ? 'fas fa-eye-slash' : 'fas fa-eye'" class="me-1"></i>
            {{ showQuestions ? 'مخفی کردن سوالات' : 'مشاهده سوالات و پاسخ‌ها' }}
          </button>
        </div>

        <!-- Questions and Answers Section -->
        <div v-if="showQuestions" class="modern-card questions-section animate-slide-up">
          <h5 class="modern-title">
            <i class="fas fa-question-circle text-info me-2"></i>
            سوالات و پاسخ‌ها
          </h5>

          <div class="questions-list">
            <div v-for="(question, index) in questions" :key="index" class="question-item">
              <div class="question-header">
                <div class="question-number">
                  <span>{{ index + 1 }}</span>
                </div>
                <div class="question-title">
                  <h6>{{ question.text }}</h6>
                </div>
                <div class="question-result">
                  <span class="result-badge" :class="examResult.answers[index].isCorrect ? 'badge-success' : 'badge-danger'">
                    <i :class="examResult.answers[index].isCorrect ? 'fas fa-check' : 'fas fa-times'" class="me-1"></i>
                    {{ examResult.answers[index].isCorrect ? 'درست' : 'نادرست' }}
                  </span>
                </div>
              </div>

              <div class="question-content">
                <!-- Multiple Choice Questions -->
                <div v-if="question.type === 'MULTIPLE_CHOICE'" class="answer-section">
                  <div class="answer-row">
                    <span class="answer-label">پاسخ شما:</span>
                    <span class="answer-value user-answer" :class="examResult.answers[index].isCorrect ? 'correct' : 'incorrect'">
                      {{ getAnswerText(question, answers[index]) }}
                    </span>
                  </div>
                  <div class="answer-row">
                    <span class="answer-label">پاسخ صحیح:</span>
                    <span class="answer-value correct-answer">
                      {{ getAnswerText(question, question.correctOption) }}
                    </span>
                  </div>
                </div>

                <!-- True/False Questions -->
                <div v-else-if="question.type === 'TRUE_FALSE'" class="answer-section">
                  <div class="answer-row">
                    <span class="answer-label">پاسخ شما:</span>
                    <span class="answer-value user-answer" :class="examResult.answers[index].isCorrect ? 'correct' : 'incorrect'">
                      {{ answers[index] === 'true' ? 'درست' : 'نادرست' }}
                    </span>
                  </div>
                  <div class="answer-row">
                    <span class="answer-label">پاسخ صحیح:</span>
                    <span class="answer-value correct-answer">
                      {{ question.correctOption === 'true' ? 'درست' : 'نادرست' }}
                    </span>
                  </div>
                </div>

                <!-- Essay Questions -->
                <div v-else-if="question.type === 'ESSAY'" class="answer-section">
                  <div class="essay-answer">
                    <h6 class="essay-title">
                      <i class="fas fa-pen text-primary me-1"></i>
                      پاسخ شما:
                    </h6>
                    <div class="essay-content">
                      {{ answers[index] || 'بدون پاسخ' }}
                    </div>
                  </div>

                  <div class="essay-feedback" v-if="examResult.answers[index].feedback">
                    <h6 class="feedback-title">
                      <i class="fas fa-comment text-warning me-1"></i>
                      بازخورد استاد:
                    </h6>
                    <div class="feedback-content">
                      {{ examResult.answers[index].feedback }}
                    </div>
                  </div>

                  <div v-else class="essay-feedback pending">
                    <h6 class="feedback-title">
                      <i class="fas fa-clock text-muted me-1"></i>
                      بازخورد استاد:
                    </h6>
                    <div class="feedback-content">
                      هنوز بررسی نشده است.
                    </div>
                  </div>
                </div>

                <!-- Short Answer Questions -->
                <div v-else-if="question.type === 'SHORT_ANSWER'" class="answer-section">
                  <div class="answer-row">
                    <span class="answer-label">پاسخ شما:</span>
                    <span class="answer-value user-answer" :class="examResult.answers[index].isCorrect ? 'correct' : 'incorrect'">
                      {{ answers[index] || 'بدون پاسخ' }}
                    </span>
                  </div>
                  <div class="answer-row">
                    <span class="answer-label">پاسخ صحیح:</span>
                    <span class="answer-value correct-answer">
                      {{ question.correctOption }}
                    </span>
                  </div>
                </div>

                <!-- Explanation Section -->
                <div v-if="question.explanation" class="explanation-section">
                  <h6 class="explanation-title">
                    <i class="fas fa-lightbulb text-warning me-1"></i>
                    توضیحات:
                  </h6>
                  <div class="explanation-content">
                    {{ question.explanation }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Performance Summary -->
        <div v-if="showQuestions" class="modern-card performance-summary animate-slide-up" style="animation-delay: 0.1s;">
          <h5 class="modern-title">
            <i class="fas fa-chart-pie text-success me-2"></i>
            خلاصه عملکرد
          </h5>

          <div class="row">
            <div class="col-md-6">
              <div class="performance-chart">
                <div class="chart-placeholder">
                  <div class="progress-circle" :style="getProgressStyle()">
                    <span class="progress-text">{{ examResult.score }}%</span>
                  </div>
                </div>
                <p class="chart-label">درصد کل نمره</p>
              </div>
            </div>
            <div class="col-md-6">
              <div class="performance-details">
                <div class="detail-item">
                  <i class="fas fa-clock text-info"></i>
                  <span>زمان صرف شده: {{ formatTime(examResult.timeSpent || 1800) }}</span>
                </div>
                <div class="detail-item">
                  <i class="fas fa-calendar text-primary"></i>
                  <span>تاریخ آزمون: {{ formatDate(examResult.submittedAt) }}</span>
                </div>
                <div class="detail-item">
                  <i class="fas fa-list-ol text-secondary"></i>
                  <span>تعداد کل سوالات: {{ questions.length }}</span>
                </div>
                <div class="detail-item" :class="examPassed ? 'text-success' : 'text-danger'">
                  <i :class="examPassed ? 'fas fa-check-circle' : 'fas fa-times-circle'"></i>
                  <span>{{ examPassed ? 'قبول' : 'مردود' }}</span>
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
import { useFormatters } from '@/composables/useFormatters.js';

export default {
  name: 'ExamResults',
  props: {
    examResult: {
      type: Object,
      required: true
    },
    passingScore: {
      type: Number,
      default: 60
    },
    questions: {
      type: Array,
      required: true
    },
    answers: {
      type: Array,
      required: true
    }
  },
  setup() {
    const { formatDate } = useFormatters();

    return {
      formatDate
    };
  },
  data() {
    return {
      showQuestions: false
    };
  },
  computed: {
    examPassed() {
      return this.examResult.score >= this.passingScore;
    }
  },
  methods: {
    toggleShowQuestions() {
      this.showQuestions = !this.showQuestions;
    },

    getAnswerText(question, optionIndex) {
      if (question.type !== 'MULTIPLE_CHOICE' || !question.options || !question.options[optionIndex]) {
        return 'نامشخص';
      }
      return question.options[optionIndex];
    },

    getProgressStyle() {
      const percentage = this.examResult.score;
      const color = percentage >= this.passingScore ? '#28a745' : '#dc3545';
      return {
        background: `conic-gradient(${color} ${percentage * 3.6}deg, #e9ecef 0deg)`
      };
    },

    formatTime(seconds) {
      return this.$filters.formatTime(seconds);
    }
  }
}
</script>

<style scoped>
.exam-results-container {
  min-height: calc(100vh - 56px);
  padding: 2rem 1rem;
}

/* Result Header */
.result-header {
  display: flex;
  align-items: center;
  padding: 2rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 249, 250, 0.9) 100%);
}

.result-header.result-passed {
  background: linear-gradient(135deg, rgba(40, 167, 69, 0.1) 0%, rgba(46, 204, 113, 0.1) 100%);
  border: 2px solid rgba(40, 167, 69, 0.3);
}

.result-header.result-failed {
  background: linear-gradient(135deg, rgba(220, 53, 69, 0.1) 0%, rgba(231, 76, 60, 0.1) 100%);
  border: 2px solid rgba(220, 53, 69, 0.3);
}

.result-icon {
  font-size: 4rem;
  margin-left: 2rem;
}

.result-header.result-passed .result-icon {
  color: #28a745;
}

.result-header.result-failed .result-icon {
  color: #dc3545;
}

.result-title {
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.result-subtitle {
  font-size: 1.1rem;
  color: #6c757d;
  margin: 0;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: rgba(248, 249, 250, 0.8);
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.15);
}

.stat-card.stat-success {
  background: linear-gradient(135deg, rgba(40, 167, 69, 0.1) 0%, rgba(46, 204, 113, 0.1) 100%);
  border-color: rgba(40, 167, 69, 0.3);
}

.stat-card.stat-danger {
  background: linear-gradient(135deg, rgba(220, 53, 69, 0.1) 0%, rgba(231, 76, 60, 0.1) 100%);
  border-color: rgba(220, 53, 69, 0.3);
}

.stat-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #6c757d;
}

.stat-card.stat-success .stat-icon {
  color: #28a745;
}

.stat-card.stat-danger .stat-icon {
  color: #dc3545;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: #2c3e50;
}

.stat-label {
  color: #6c757d;
  font-weight: 500;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

/* Questions Section */
.questions-section {
  margin-top: 2rem;
}

.questions-list {
  margin-top: 1.5rem;
}

.question-item {
  background: rgba(248, 249, 250, 0.8);
  border-radius: 12px;
  margin-bottom: 1.5rem;
  border: 1px solid rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.question-header {
  display: flex;
  align-items: center;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.9);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
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
  font-weight: 600;
  margin-left: 1rem;
}

.question-title {
  flex: 1;
}

.question-title h6 {
  margin: 0;
  font-weight: 600;
  color: #2c3e50;
}

.result-badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
}

.result-badge.badge-success {
  background: rgba(40, 167, 69, 0.1);
  color: #28a745;
  border: 1px solid rgba(40, 167, 69, 0.3);
}

.result-badge.badge-danger {
  background: rgba(220, 53, 69, 0.1);
  color: #dc3545;
  border: 1px solid rgba(220, 53, 69, 0.3);
}

/* Question Content */
.question-content {
  padding: 1.5rem;
}

.answer-section {
  margin-bottom: 1rem;
}

.answer-row {
  display: flex;
  align-items: center;
  margin-bottom: 0.75rem;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 8px;
}

.answer-label {
  font-weight: 600;
  color: #495057;
  min-width: 120px;
}

.answer-value {
  flex: 1;
  font-weight: 500;
}

.answer-value.user-answer.correct {
  color: #28a745;
}

.answer-value.user-answer.incorrect {
  color: #dc3545;
}

.answer-value.correct-answer {
  color: #28a745;
  background: rgba(40, 167, 69, 0.1);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

/* Essay Answers */
.essay-answer,
.essay-feedback {
  margin-bottom: 1rem;
}

.essay-title,
.feedback-title,
.explanation-title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
}

.essay-content,
.feedback-content,
.explanation-content {
  background: rgba(255, 255, 255, 0.9);
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  line-height: 1.6;
}

.essay-feedback.pending .feedback-content {
  background: rgba(248, 249, 250, 0.9);
  color: #6c757d;
  font-style: italic;
}

/* Explanation Section */
.explanation-section {
  background: linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(253, 126, 20, 0.1) 100%);
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 193, 7, 0.3);
}

/* Performance Summary */
.performance-summary {
  margin-top: 2rem;
}

.performance-chart {
  text-align: center;
}

.chart-placeholder {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}

.progress-circle {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.progress-text {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2c3e50;
}

.chart-label {
  font-weight: 600;
  color: #6c757d;
  margin: 0;
}

.performance-details {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 8px;
  font-weight: 500;
}

.detail-item i {
  width: 20px;
  text-align: center;
}

/* Responsive */
@media (max-width: 768px) {
  .exam-results-container {
    padding: 1rem 0.5rem;
  }

  .result-header {
    flex-direction: column;
    text-align: center;
    padding: 1.5rem;
  }

  .result-icon {
    margin-left: 0;
    margin-bottom: 1rem;
    font-size: 3rem;
  }

  .result-title {
    font-size: 1.5rem;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  .action-buttons {
    flex-direction: column;
    align-items: center;
  }

  .action-buttons .modern-btn {
    width: 100%;
    max-width: 300px;
  }

  .question-header {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }

  .question-number {
    margin-left: 0;
  }

  .answer-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .answer-label {
    min-width: auto;
  }
}

@media (max-width: 576px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .stat-card {
    padding: 1rem;
  }

  .stat-icon {
    font-size: 2rem;
  }

  .stat-value {
    font-size: 1.5rem;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .result-header {
    background: linear-gradient(135deg, rgba(45, 55, 72, 0.9) 0%, rgba(74, 85, 104, 0.9) 100%);
  }

  .result-title {
    color: #e2e8f0;
  }

  .result-subtitle {
    color: #cbd5e0;
  }

  .stat-card {
    background: rgba(45, 55, 72, 0.8);
    border-color: rgba(255, 255, 255, 0.1);
  }

  .stat-value {
    color: #e2e8f0;
  }

  .stat-label {
    color: #cbd5e0;
  }

  .question-item {
    background: rgba(45, 55, 72, 0.8);
    border-color: rgba(255, 255, 255, 0.1);
  }

  .question-header {
    background: rgba(74, 85, 104, 0.9);
    border-bottom-color: rgba(255, 255, 255, 0.1);
  }

  .question-title h6 {
    color: #e2e8f0;
  }

  .answer-row {
    background: rgba(74, 85, 104, 0.7);
  }

  .answer-label {
    color: #cbd5e0;
  }

  .essay-content,
  .feedback-content,
  .explanation-content {
    background: rgba(74, 85, 104, 0.9);
    border-color: rgba(255, 255, 255, 0.1);
    color: #e2e8f0;
  }

  .progress-text {
    color: #e2e8f0;
  }

  .chart-label {
    color: #cbd5e0;
  }

  .detail-item {
    background: rgba(74, 85, 104, 0.7);
    color: #e2e8f0;
  }
}
</style>