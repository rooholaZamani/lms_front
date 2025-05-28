<template>
  <div class="exam-results modern-page-bg" style="min-height: calc(100vh - 56px); padding: 2rem 1rem;">
    <div class="container-fluid">
      <!-- Header -->
      <div class="text-center mb-4">
        <div class="modern-logo large" :class="examPassed ? 'success' : 'danger'">
          <i :class="examPassed ? 'fas fa-trophy' : 'fas fa-times-circle'"></i>
        </div>
        <h2 class="text-white mb-2">
          {{ examPassed ? 'تبریک! شما در این آزمون قبول شدید.' : 'متأسفانه شما در این آزمون مردود شدید.' }}
        </h2>
        <p class="text-white-50">نتایج کامل آزمون شما</p>
      </div>

      <!-- Results Overview -->
      <div class="modern-card mb-4 animate-slide-up">
        <div class="modern-card-header" :class="examPassed ? 'bg-success text-white' : 'bg-danger text-white'">
          <h5 class="mb-0">
            <i :class="examPassed ? 'fas fa-check-circle' : 'fas fa-times-circle'" class="me-2"></i>
            نتیجه آزمون
          </h5>
        </div>
        <div class="modern-card-body">
          <div class="results-overview">
            <div class="row">
              <div class="col-lg-8">
                <div class="row">
                  <div class="col-md-3 mb-3">
                    <div class="modern-stat-card" :class="examPassed ? 'success' : 'danger'">
                      <div class="modern-stat-icon" :class="examPassed ? 'text-success' : 'text-danger'">
                        <i class="fas fa-star"></i>
                      </div>
                      <div class="modern-stat-value">{{ examResult.score }}%</div>
                      <div class="modern-stat-label">نمره شما</div>
                    </div>
                  </div>

                  <div class="col-md-3 mb-3">
                    <div class="modern-stat-card">
                      <div class="modern-stat-icon text-info">
                        <i class="fas fa-target"></i>
                      </div>
                      <div class="modern-stat-value">{{ passingScore }}%</div>
                      <div class="modern-stat-label">حد نصاب قبولی</div>
                    </div>
                  </div>

                  <div class="col-md-3 mb-3">
                    <div class="modern-stat-card success">
                      <div class="modern-stat-icon text-success">
                        <i class="fas fa-check"></i>
                      </div>
                      <div class="modern-stat-value">{{ examResult.correctCount }}</div>
                      <div class="modern-stat-label">پاسخ‌های درست</div>
                    </div>
                  </div>

                  <div class="col-md-3 mb-3">
                    <div class="modern-stat-card danger">
                      <div class="modern-stat-icon text-danger">
                        <i class="fas fa-times"></i>
                      </div>
                      <div class="modern-stat-value">{{ examResult.incorrectCount }}</div>
                      <div class="modern-stat-label">پاسخ‌های نادرست</div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="col-lg-4">
                <div class="score-visualization">
                  <div class="score-circle-large" :class="examPassed ? 'passed' : 'failed'">
                    <div class="score-percentage">{{ examResult.score }}%</div>
                    <div class="score-status">{{ examPassed ? 'قبول' : 'مردود' }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modern-card-footer text-center">
          <button class="modern-btn modern-btn-primary me-2" @click="$emit('back-to-course')">
            <i class="fas fa-arrow-right me-1"></i> بازگشت به دوره
          </button>
          <button class="modern-btn modern-btn-info" @click="toggleShowQuestions">
            <i :class="showQuestions ? 'fas fa-eye-slash' : 'fas fa-eye'" class="me-1"></i>
            {{ showQuestions ? 'مخفی کردن سوالات' : 'مشاهده سوالات و پاسخ‌ها' }}
          </button>
        </div>
      </div>

      <!-- Questions and Answers -->
      <div v-if="showQuestions" class="modern-card animate-slide-up" style="animation-delay: 0.1s;">
        <div class="modern-card-header bg-info text-white">
          <h5 class="mb-0">
            <i class="fas fa-list-alt me-2"></i>
            سوالات و پاسخ‌ها
          </h5>
        </div>
        <div class="modern-card-body">
          <div class="questions-results">
            <div v-for="(question, index) in questions" :key="index" class="question-result-item">
              <div class="form-section">
                <div class="question-header d-flex justify-content-between align-items-start">
                  <h6 class="section-title">
                    <i class="fas fa-question-circle me-2"></i>
                    سوال {{ index + 1 }}: {{ question.text }}
                  </h6>
                  <span :class="examResult.answers[index].isCorrect ? 'modern-badge modern-badge-success' : 'modern-badge modern-badge-danger'">
                    <i :class="examResult.answers[index].isCorrect ? 'fas fa-check' : 'fas fa-times'" class="me-1"></i>
                    {{ examResult.answers[index].isCorrect ? 'درست' : 'نادرست' }}
                  </span>
                </div>

                <div class="question-content">
                  <!-- Multiple Choice -->
                  <div v-if="question.type === 'MULTIPLE_CHOICE'" class="answer-section">
                    <div class="answer-item">
                      <div class="answer-label">پاسخ شما:</div>
                      <div class="answer-value user-answer">
                        <strong>{{ getAnswerText(question, answers[index]) }}</strong>
                      </div>
                    </div>
                    <div class="answer-item">
                      <div class="answer-label">پاسخ صحیح:</div>
                      <div class="answer-value correct-answer">
                        <strong>{{ getAnswerText(question, question.correctOption) }}</strong>
                      </div>
                    </div>
                  </div>

                  <!-- True/False -->
                  <div v-else-if="question.type === 'TRUE_FALSE'" class="answer-section">
                    <div class="answer-item">
                      <div class="answer-label">پاسخ شما:</div>
                      <div class="answer-value user-answer">
                        <strong>{{ answers[index] === 'true' ? 'درست' : 'نادرست' }}</strong>
                      </div>
                    </div>
                    <div class="answer-item">
                      <div class="answer-label">پاسخ صحیح:</div>
                      <div class="answer-value correct-answer">
                        <strong>{{ question.correctOption === 'true' ? 'درست' : 'نادرست' }}</strong>
                      </div>
                    </div>
                  </div>

                  <!-- Essay -->
                  <div v-else-if="question.type === 'ESSAY'" class="answer-section">
                    <div class="answer-item">
                      <div class="answer-label">پاسخ شما:</div>
                      <div class="answer-content">
                        <div class="answer-box">{{ answers[index] || 'بدون پاسخ' }}</div>
                      </div>
                    </div>
                    <div class="answer-item">
                      <div class="answer-label">توضیحات استاد:</div>
                      <div class="answer-content">
                        <div class="answer-box" :class="examResult.answers[index].feedback ? 'has-feedback' : 'no-feedback'">
                          {{ examResult.answers[index].feedback || 'هنوز بررسی نشده است.' }}
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Short Answer -->
                  <div v-else-if="question.type === 'SHORT_ANSWER'" class="answer-section">
                    <div class="answer-item">
                      <div class="answer-label">پاسخ شما:</div>
                      <div class="answer-value user-answer">
                        <strong>{{ answers[index] || 'بدون پاسخ' }}</strong>
                      </div>
                    </div>
                    <div class="answer-item">
                      <div class="answer-label">پاسخ صحیح:</div>
                      <div class="answer-value correct-answer">
                        <strong>{{ question.correctOption }}</strong>
                      </div>
                    </div>
                  </div>

                  <!-- Explanation -->
                  <div v-if="question.explanation" class="explanation-section">
                    <div class="explanation-box">
                      <h6 class="explanation-title">
                        <i class="fas fa-info-circle text-info me-2"></i>
                        توضیحات:
                      </h6>
                      <p class="explanation-text">{{ question.explanation }}</p>
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
</template>

<script>
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
  data() {
    return {
      showQuestions: false
    }
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
    }
  }
}
</script>

<style scoped>
/* Results overview */
.results-overview {
  padding: 1rem 0;
}

/* Score visualization */
.score-visualization {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  min-height: 200px;
}

.score-circle-large {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  border: 6px solid;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.score-circle-large.passed {
  border-color: #27ae60;
  background: linear-gradient(135deg, rgba(39, 174, 96, 0.2), rgba(46, 204, 113, 0.2));
  color: #27ae60;
}

.score-circle-large.failed {
  border-color: #e74c3c;
  background: linear-gradient(135deg, rgba(231, 76, 60, 0.2), rgba(192, 57, 43, 0.2));
  color: #e74c3c;
}

.score-percentage {
  font-size: 2.5rem;
  font-weight: 800;
  line-height: 1;
}

.score-status {
  font-size: 1.1rem;
  font-weight: 600;
  margin-top: 0.5rem;
}

/* Modern stat card variants */
.modern-stat-card.success {
  background: linear-gradient(135deg, rgba(40, 167, 69, 0.1), rgba(25, 135, 84, 0.1));
  border-color: #28a745;
}

.modern-stat-card.danger {
  background: linear-gradient(135deg, rgba(220, 53, 69, 0.1), rgba(204, 43, 57, 0.1));
  border-color: #dc3545;
}

/* Question results */
.questions-results {
  max-height: 600px;
  overflow-y: auto;
}

.question-result-item {
  margin-bottom: 2rem;
  border-bottom: 2px solid rgba(0,0,0,0.05);
  padding-bottom: 1.5rem;
}

.question-result-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.question-header {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(0,0,0,0.1);
}

.question-content {
  padding: 0 1rem;
}

.answer-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.answer-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.answer-label {
  min-width: 120px;
  font-weight: 600;
  color: #495057;
  font-size: 0.9rem;
}

.answer-value {
  flex: 1;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
}

.answer-value.user-answer {
  background: rgba(102, 126, 234, 0.1);
  border: 1px solid rgba(102, 126, 234, 0.2);
  color: #667eea;
}

.answer-value.correct-answer {
  background: rgba(40, 167, 69, 0.1);
  border: 1px solid rgba(40, 167, 69, 0.2);
  color: #28a745;
}

.answer-content {
  flex: 1;
}

.answer-box {
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #dee2e6;
  background: #f8f9fa;
  min-height: 60px;
  white-space: pre-wrap;
  font-size: 0.9rem;
  line-height: 1.5;
}

.answer-box.has-feedback {
  background: rgba(40, 167, 69, 0.05);
  border-color: rgba(40, 167, 69, 0.2);
  color: #155724;
}

.answer-box.no-feedback {
  background: rgba(108, 117, 125, 0.1);
  border-color: rgba(108, 117, 125, 0.2);
  color: #6c757d;
  font-style: italic;
}

/* Explanation section */
.explanation-section {
  margin-top: 1.5rem;
}

.explanation-box {
  background: rgba(23, 162, 184, 0.05);
  border: 1px solid rgba(23, 162, 184, 0.2);
  border-radius: 8px;
  padding: 1.5rem;
}

.explanation-title {
  color: #17a2b8;
  margin-bottom: 1rem;
  font-size: 1rem;
  font-weight: 600;
}

.explanation-text {
  color: #495057;
  line-height: 1.6;
  margin: 0;
  font-size: 0.9rem;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .score-circle-large {
    width: 120px;
    height: 120px;
  }

  .score-percentage {
    font-size: 2rem;
  }

  .score-status {
    font-size: 1rem;
  }

  .answer-item {
    flex-direction: column;
    gap: 0.5rem;
  }

  .answer-label {
    min-width: auto;
  }

  .questions-results {
    max-height: 500px;
  }
}

@media (max-width: 576px) {
  .modern-card-footer {
    text-align: center;
  }

  .modern-card-footer .modern-btn {
    width: 100%;
    margin-bottom: 0.5rem;
  }

  .modern-card-footer .modern-btn:last-child {
    margin-bottom: 0;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .answer-box {
    background: #2d3748;
    border-color: #4a5568;
    color: #e2e8f0;
  }

  .answer-box.has-feedback {
    background: rgba(40, 167, 69, 0.1);
    color: #68d391;
  }

  .explanation-box {
    background: rgba(23, 162, 184, 0.1);
    border-color: rgba(23, 162, 184, 0.3);
  }

  .explanation-text {
    color: #e2e8f0;
  }
}
</style>