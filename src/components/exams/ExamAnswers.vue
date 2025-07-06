<template>
  <div class="exam-answers-page">
    <div class="container-fluid">
      <!-- Loading State -->
      <div v-if="loading" class="loading-section">
        <div class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">در حال بارگذاری...</span>
          </div>
          <p class="mt-3 text-muted">در حال بارگذاری پاسخ‌های شما...</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-section">
        <div class="alert alert-danger text-center">
          <i class="fas fa-exclamation-triangle me-2"></i>
          {{ error }}
        </div>
      </div>

      <!-- Main Content -->
      <div v-else-if="examData" class="exam-answers-content">
        <!-- Header Summary -->
        <div class="summary-header">
          <div class="row">
            <div class="col-12">
              <div class="summary-card">
                <div class="d-flex justify-content-between align-items-center mb-4">
                  <h2 class="page-title">
                    <i class="fas fa-clipboard-list me-2"></i>
                    پاسخ‌های شما
                  </h2>
                  <div class="status-badge" :class="examData.passed ? 'success' : 'danger'">
                    <i :class="examData.passed ? 'fas fa-check-circle' : 'fas fa-times-circle'"></i>
                    {{ examData.passed ? 'قبول' : 'مردود' }}
                  </div>
                </div>

                <div class="row stats-row">
                  <div class="col-md-3 col-6">
                    <div class="stat-card primary">
                      <div class="stat-icon">
                        <i class="fas fa-percentage"></i>
                      </div>
                      <div class="stat-content">
                        <div class="stat-value">{{ examData.score }}%</div>
                        <div class="stat-label">نمره کلی</div>
                      </div>
                    </div>
                  </div>

                  <div class="col-md-3 col-6">
                    <div class="stat-card success">
                      <div class="stat-icon">
                        <i class="fas fa-star"></i>
                      </div>
                      <div class="stat-content">
                        <div class="stat-value">{{ getEarnedScore() }} / {{ examData.totalPossibleScore }}</div>
                        <div class="stat-label">امتیاز کسب شده</div>
                      </div>
                    </div>
                  </div>

                  <div class="col-md-3 col-6">
                    <div class="stat-card warning">
                      <div class="stat-icon">
                        <i class="fas fa-clock"></i>
                      </div>
                      <div class="stat-content">
                        <div class="stat-value">{{ formatTime(examData.timeSpent) }}</div>
                        <div class="stat-label">زمان صرف شده</div>
                      </div>
                    </div>
                  </div>

                  <div class="col-md-3 col-6">
                    <div class="stat-card info">
                      <div class="stat-icon">
                        <i class="fas fa-calendar-alt"></i>
                      </div>
                      <div class="stat-content">
                        <div class="stat-value">{{ formatDate(examData.submissionTime) }}</div>
                        <div class="stat-label">زمان ارسال</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Questions and Answers -->
        <div class="questions-section">
          <div
              v-for="(questionData, questionId, index) in examData.answers"
              :key="questionId"
              class="question-card"
          >
            <div>{{questionData}}</div>
            <!-- Question Header -->
            <div class="question-header">
              <div class="d-flex justify-content-between align-items-start">
                <div class="question-info">
                  <div class="d-flex align-items-center mb-2">
                    <div class="question-number">{{ index + 1 }}</div>
                    <div class="question-badges">
                      <span class="type-badge" :class="getQuestionTypeBadgeClass(questionData.questionType)">
                        {{ getQuestionTypeLabel(questionData.questionType) }}
                      </span>
                      <span class="result-badge" :class="questionData.isCorrect ? 'correct' : 'incorrect'">
                        <i :class="questionData.isCorrect ? 'fas fa-check' : 'fas fa-times'"></i>
                        {{ questionData.isCorrect ? 'صحیح' : 'غلط' }}
                      </span>
                    </div>
                  </div>
                  <h5 class="question-text">{{ questionData.questionText }}</h5>
                </div>

                <div class="points-info">
                  <div class="points-earned" :class="questionData.isCorrect ? 'correct' : 'incorrect'">
                    {{ questionData.earnedPoints }}
                  </div>
                  <div class="points-total">/ {{ questionData.totalPoints }}</div>
                  <div class="points-label">امتیاز</div>
                </div>
              </div>
            </div>

            <!-- Answer Content -->
            <div class="answer-content">
              <!-- Multiple Choice / True False -->
              <div v-if="['MULTIPLE_CHOICE', 'TRUE_FALSE'].includes(questionData.questionType)">
                <div class="answer-comparison">
                  <div class="answer-section student">
                    <h6 class="answer-title">
                      <i class="fas fa-user me-2"></i>
                      پاسخ شما
                    </h6>
                    <div class="answer-box" :class="questionData.isCorrect ? 'correct' : 'incorrect'">
                      {{ questionData.studentAnswer || 'پاسخی انتخاب نشده' }}
                    </div>
                  </div>

                  <div class="answer-section correct">
                    <h6 class="answer-title">
                      <i class="fas fa-check-circle me-2"></i>
                      پاسخ صحیح
                    </h6>
                    <div class="answer-box correct">
                      {{ questionData.correctAnswer }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Matching Questions -->
              <div v-else-if="questionData.questionType === 'MATCHING'">
                <div class="matching-content">
                  <div class="answer-comparison">
                    <div class="answer-section student">
                      <h6 class="answer-title">
                        <i class="fas fa-user me-2"></i>
                        تطبیق‌های شما
                      </h6>
                      <div class="matching-pairs">
                        <div
                            v-for="(rightItem, leftItem) in questionData.studentAnswer"
                            :key="leftItem"
                            class="matching-pair"
                            :class="checkMatchingCorrectness(questionData, leftItem, rightItem)"
                        >
                          <span class="left-item">{{ leftItem }}</span>
                          <i class="fas fa-arrow-left mx-2"></i>
                          <span class="right-item">{{ rightItem }}</span>
                        </div>
                      </div>
                    </div>

                    <div class="answer-section correct">
                      <h6 class="answer-title">
                        <i class="fas fa-check-circle me-2"></i>
                        تطبیق‌های صحیح
                      </h6>
                      <div class="matching-pairs">
                        <div
                            v-for="(rightItem, leftItem) in questionData.correctAnswer"
                            :key="leftItem"
                            class="matching-pair correct"
                        >
                          <span class="left-item">{{ leftItem }}</span>
                          <i class="fas fa-arrow-left mx-2"></i>
                          <span class="right-item">{{ rightItem }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Categorization Questions -->
              <div v-else-if="questionData.questionType === 'CATEGORIZATION'">
                <div class="categorization-content">
                  <div class="answer-comparison">
                    <div class="answer-section student">
                      <h6 class="answer-title">
                        <i class="fas fa-user me-2"></i>
                        دسته‌بندی شما
                      </h6>
                      <div class="category-items">
                        <div
                            v-for="(category, item) in questionData.studentAnswer"
                            :key="item"
                            class="category-item"
                            :class="checkCategorizationCorrectness(questionData, item, category)"
                        >
                          <span class="item-name">{{ item }}</span>
                          <span class="category-badge">{{ category }}</span>
                        </div>
                      </div>
                    </div>

                    <div class="answer-section correct">
                      <h6 class="answer-title">
                        <i class="fas fa-check-circle me-2"></i>
                        دسته‌بندی صحیح
                      </h6>
                      <div class="category-items">
                        <div
                            v-for="(category, item) in questionData.correctAnswer"
                            :key="item"
                            class="category-item correct"
                        >
                          <span class="item-name">{{ item }}</span>
                          <span class="category-badge">{{ category }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Fill in the Blank -->
              <div v-else-if="questionData.questionType === 'FILL_IN_THE_BLANK'">
                <div class="answer-comparison">
                  <div class="answer-section student">
                    <h6 class="answer-title">
                      <i class="fas fa-user me-2"></i>
                      پاسخ شما
                    </h6>
                    <div class="answer-box" :class="questionData.isCorrect ? 'correct' : 'incorrect'">
                      {{ questionData.studentAnswer || 'پاسخی وارد نشده' }}
                    </div>
                  </div>

                  <div class="answer-section correct">
                    <h6 class="answer-title">
                      <i class="fas fa-check-circle me-2"></i>
                      پاسخ‌های قابل قبول
                    </h6>
                    <div class="answer-box correct">
                      {{ Array.isArray(questionData.correctAnswer) ?
                        questionData.correctAnswer.join(' یا ') :
                        questionData.correctAnswer }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Unknown Question Type -->
              <div v-else class="unknown-type">
                <div class="alert alert-warning">
                  <i class="fas fa-exclamation-triangle me-2"></i>
                  نوع سوال پشتیبانی نشده: {{ questionData.questionType }}
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
      examData: null,
      loading: true,
      error: null
    }
  },
  async mounted() {
    await this.fetchExamAnswers()
  },
  methods: {
    async fetchExamAnswers() {
      try {
        this.loading = true
        this.error = null

        // استفاده از submissionId برای دریافت داده‌ها
        const response = await axios.get(`/api/exams/${this.submissionId}/student-answers`)
        this.examData = response.data

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