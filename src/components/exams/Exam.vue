<template>
  <div class="modern-page-bg primary-gradient">
    <div class="modern-container animate-slide-up" v-if="!loading">
      <!-- Header -->
      <div class="modern-header">
        <div class="modern-logo primary">
          <i class="fas fa-clipboard-check"></i>
        </div>
        <h1 class="modern-title">{{ exam.title }}</h1>
        <p class="modern-subtitle">{{ exam.description }}</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">در حال بارگذاری...</span>
        </div>
      </div>

      <!-- Exam Introduction (if not started and not completed) -->
      <div v-else-if="!examStarted && !examCompleted && !showingAnswers" class="row">
        <div class="col-lg-8 mb-4">
          <div class="modern-card animate-slide-right">
            <h6 class="section-title">
              <i class="fas fa-info-circle me-2"></i>
              قوانین آزمون
            </h6>

            <div class="exam-rules">
              <div class="rule-item">
                <div class="rule-icon">
                  <i class="fas fa-clock"></i>
                </div>
                <div class="rule-content">
                  <span class="rule-title">مدت زمان آزمون</span>
                  <span class="rule-value">{{ exam.timeLimit || 60 }} دقیقه</span>
                </div>
              </div>

              <div class="rule-item">
                <div class="rule-icon">
                  <i class="fas fa-question-circle"></i>
                </div>
                <div class="rule-content">
                  <span class="rule-title">تعداد سوالات</span>
                  <span class="rule-value">{{ exam.questions ? exam.questions.length : 0 }}</span>
                </div>
              </div>

              <div class="rule-item">
                <div class="rule-icon">
                  <i class="fas fa-percentage"></i>
                </div>
                <div class="rule-content">
                  <span class="rule-title">نمره قبولی</span>
                  <span class="rule-value">{{ exam.passingScore }}%</span>
                </div>
              </div>

              <div class="rule-item warning">
                <div class="rule-icon">
                  <i class="fas fa-exclamation-triangle"></i>
                </div>
                <div class="rule-content">
                  <span class="rule-title">هشدار</span>
                  <span class="rule-value">پس از شروع آزمون امکان خروج و بازگشت وجود ندارد</span>
                </div>
              </div>
            </div>

            <div class="exam-start-section">
              <button
                  class="modern-btn modern-btn-primary modern-btn-large"
                  @click="startExam"
                  :disabled="!canStartExam">
                <i class="fas fa-play me-2"></i>
                شروع آزمون
              </button>
            </div>
          </div>
        </div>

        <!-- Exam Info Sidebar -->
        <div class="col-lg-4">
          <div class="modern-card animate-slide-left">
            <h6 class="section-title">
              <i class="fas fa-info me-2"></i>
              اطلاعات آزمون
            </h6>

            <div class="exam-info-items">
              <div class="info-item">
                <div class="info-icon text-primary">
                  <i class="fas fa-calendar-alt"></i>
                </div>
                <div class="info-content">
                  <span class="info-label">تاریخ آزمون</span>
                  <span class="info-value">{{ formatDate(exam.createdAt) }}</span>
                </div>
              </div>

              <div class="info-item">
                <div class="info-icon text-info">
                  <i class="fas fa-user-graduate"></i>
                </div>
                <div class="info-content">
                  <span class="info-label">استاد درس</span>
                  <span class="info-value">{{ exam.teacherName || 'نامشخص' }}</span>
                </div>
              </div>

              <div class="info-item">
                <div class="info-icon text-success">
                  <i class="fas fa-book"></i>
                </div>
                <div class="info-content">
                  <span class="info-label">درس مربوطه</span>
                  <span class="info-value">{{ exam.lessonTitle || 'نامشخص' }}</span>
                </div>
              </div>
            </div>

            <!-- Previous Result (if exists) -->
            <div v-if="previousResult" class="previous-result">
              <h6 class="section-title">
                <i class="fas fa-history me-2"></i>
                نتیجه قبلی
              </h6>

              <div class="result-summary">
                <div class="score-display" :class="previousResult.passed ? 'passed' : 'failed'">
                  <div class="score-number">{{ previousResult.score }}%</div>
                  <div class="score-status">{{ previousResult.passed ? 'قبول' : 'مردود' }}</div>
                </div>
                <div class="submission-time">
                  {{ formatDateTime(previousResult.submittedAt) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Exam Interface (when started) -->
      <div v-else-if="examStarted && !examCompleted" class="exam-interface">
        <div class="exam-header">
          <div class="exam-info">
            <h5 class="mb-0">{{ exam.title }}</h5>
            <div class="exam-progress">
              <div class="progress-info">
                سوال {{ currentQuestionIndex + 1 }} از {{ exam.questions ? exam.questions.length : 0 }}
              </div>
              <div class="progress">
                <div class="progress-bar" :style="`width: ${examProgress}%`"></div>
              </div>
            </div>
          </div>
          <div class="exam-timer">
            <i class="fas fa-clock me-2"></i>
            {{ formatTime(timeRemaining) }}
          </div>
        </div>

        <!-- Question Content Using ExamQuestion Component -->
        <div class="question-container" v-if="currentQuestion">
          <ExamQuestion
              :question="currentQuestion"
              :question-number="currentQuestionIndex + 1"
              :total-questions="exam.questions ? exam.questions.length : 0"
              :selected-answer="answers[currentQuestionIndex]"
              :is-marked-for-review="questionsForReview.includes(currentQuestionIndex)"
              @answer-selected="updateAnswer"
              @mark-for-review="toggleQuestionForReview"
          />
        </div>

        <!-- Navigation -->
        <div class="exam-navigation">
          <div class="nav-buttons">
            <button
                class="modern-btn modern-btn-outline"
                @click="previousQuestion"
                :disabled="currentQuestionIndex === 0">
              <i class="fas fa-chevron-right me-2"></i>
              سوال قبلی
            </button>

            <button
                v-if="currentQuestionIndex < (exam.questions ? exam.questions.length - 1 : 0)"
                class="modern-btn modern-btn-primary"
                @click="nextQuestion">
              سوال بعدی
              <i class="fas fa-chevron-left ms-2"></i>
            </button>

            <button
                v-else
                class="modern-btn modern-btn-info"
                @click="finishExam">
              <i class="fas fa-check me-2"></i>
              پایان آزمون
            </button>
          </div>

          <!-- Question Grid -->
          <div class="question-grid">
            <button
                v-for="(question, index) in exam.questions"
                :key="index"
                class="question-number"
                :class="{
                'current': index === currentQuestionIndex,
                'answered': answers[index] !== null && answers[index] !== undefined,
                'marked': questionsForReview.includes(index)
              }"
                @click="goToQuestion(index)">
              {{ index + 1 }}
            </button>
          </div>
        </div>
      </div>

      <!-- Student Answers Display -->
      <div v-else-if="showingAnswers" class="student-answers-section">
        <div class="modern-card">
          <h6 class="section-title">
            <i class="fas fa-clipboard-list me-2"></i>
            پاسخ‌های شما
          </h6>

          <!-- Answer Summary -->
          <div class="answer-summary mb-4">
            <div class="row">
              <div class="col-md-3">
                <div class="info-item">
                  <span class="info-label">نمره:</span>
                  <span class="info-value score" :class="studentPassed ? 'passed' : 'failed'">
                    {{ studentScore }}%
                  </span>
                </div>
              </div>
              <div class="col-md-3">
                <div class="info-item">
                  <span class="info-label">وضعیت:</span>
                  <span class="info-value" :class="studentPassed ? 'text-success' : 'text-danger'">
                    <i :class="studentPassed ? 'fas fa-check-circle' : 'fas fa-times-circle'"></i>
                    {{ studentPassed ? 'قبول' : 'مردود' }}
                  </span>
                </div>
              </div>
              <div class="col-md-6">
                <div class="info-item">
                  <span class="info-label">زمان ارسال:</span>
                  <span class="info-value">{{ formatDateTime(studentSubmissionTime) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Questions and Answers Using ExamQuestion Component -->
          <div class="questions-answers">
            <div
                v-for="(question, index) in exam.questions"
                :key="question.id"
                class="question-answer-item mb-4">

              <ExamQuestion
                  :question="question"
                  :question-number="index + 1"
                  :total-questions="exam.questions.length"
                  :selected-answer="answers[index]"
                  :show-correct-answer="true"
                  :show-explanation="true"
                  :is-review-mode="true"
                  :is-correct="checkAnswer(question, answers[index])"
                  @answer-selected="() => {}"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Exam Completed -->
      <div v-else-if="examCompleted" class="exam-completed">
        <div class="modern-card text-center">
          <div class="modern-logo large success mb-4">
            <i class="fas fa-check-circle"></i>
          </div>
          <h3 class="mb-3">آزمون با موفقیت تکمیل شد!</h3>
          <p class="mb-4">پاسخ‌های شما ثبت شد و نتیجه بزودی اعلام می‌شود.</p>

          <div class="completion-actions">
            <button class="modern-btn modern-btn-primary me-3" @click="viewAnswers">
              <i class="fas fa-eye me-2"></i>
              مشاهده پاسخ‌ها
            </button>

            <button class="modern-btn modern-btn-outline" @click="goToDashboard">
              <i class="fas fa-home me-2"></i>
              بازگشت به داشبورد
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import ExamQuestion from '@/components/exams/ExamQuestion.vue';

export default {
  name: 'Exam',
  components: {
    ExamQuestion
  },
  props: {
    id: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      loading: true,
      exam: {},
      answers: {},
      currentQuestionIndex: 0,
      examStarted: false,
      examCompleted: false,
      showingAnswers: false,
      timeRemaining: 0,
      timer: null,
      questionsForReview: [],
      previousResult: null,
      studentScore: 0,
      studentPassed: false,
      studentSubmissionTime: null
    };
  },
  computed: {
    currentQuestion() {
      if (!this.exam.questions || this.exam.questions.length === 0) return null;
      return this.exam.questions[this.currentQuestionIndex];
    },
    examProgress() {
      if (!this.exam.questions || this.exam.questions.length === 0) return 0;
      return Math.round(((this.currentQuestionIndex + 1) / this.exam.questions.length) * 100);
    },
    canStartExam() {
      return this.exam && this.exam.questions && this.exam.questions.length > 0;
    }
  },
  async created() {
    await this.fetchExam();
    await this.checkPreviousSubmission();
  },
  beforeUnmount() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  },
  methods: {
    async fetchExam() {
      try {
        this.loading = true;
        const response = await axios.get(`/exams/${this.id}`);
        this.exam = response.data;

        // Initialize answers object
        if (this.exam.questions) {
          const initialAnswers = {};
          this.exam.questions.forEach((_, index) => {
            initialAnswers[index] = null;
          });
          this.answers = initialAnswers;
        }

        // Set time limit
        this.timeRemaining = (this.exam.timeLimit || 60) * 60; // Convert to seconds
      } catch (error) {
        console.error('Error fetching exam:', error);
        this.$toast?.error('خطا در دریافت اطلاعات آزمون');
        this.$router.push('/dashboard');
      } finally {
        this.loading = false;
      }
    },

    async checkPreviousSubmission() {
      try {
        const response = await axios.get(`/exams/${this.id}/submission`);
        if (response.data && response.data.id) {
          this.previousResult = response.data;
          this.showingAnswers = true;
          this.studentScore = response.data.score;
          this.studentPassed = response.data.passed;
          this.studentSubmissionTime = response.data.submittedAt;

          // Load previous answers
          if (response.data.answers) {
            this.answers = { ...response.data.answers };
          }
        }
      } catch (error) {
        // No previous submission found, continue normally
        console.log('No previous submission found');
      }
    },

    startExam() {
      if (!this.canStartExam) return;

      this.examStarted = true;
      this.startTimer();
    },

    startTimer() {
      this.timer = setInterval(() => {
        if (this.timeRemaining > 0) {
          this.timeRemaining--;
        } else {
          this.finishExam();
        }
      }, 1000);
    },

    updateAnswer(answer) {
      // Create a new object to ensure reactivity
      this.answers = {
        ...this.answers,
        [this.currentQuestionIndex]: answer
      };
    },

    toggleQuestionForReview() {
      const index = this.currentQuestionIndex;
      const reviewIndex = this.questionsForReview.indexOf(index);

      if (reviewIndex > -1) {
        this.questionsForReview.splice(reviewIndex, 1);
      } else {
        this.questionsForReview.push(index);
      }
    },

    nextQuestion() {
      if (this.currentQuestionIndex < this.exam.questions.length - 1) {
        this.currentQuestionIndex++;
      }
    },

    previousQuestion() {
      if (this.currentQuestionIndex > 0) {
        this.currentQuestionIndex--;
      }
    },

    goToQuestion(index) {
      this.currentQuestionIndex = index;
    },

    async finishExam() {
      if (this.timer) {
        clearInterval(this.timer);
      }

      try {
        const submission = {
          examId: this.exam.id,
          answers: this.answers,
          submittedAt: new Date().toISOString()
        };

        const response = await axios.post(`/exams/${this.id}/submit`, submission);

        this.examCompleted = true;
        this.examStarted = false;
        this.studentScore = response.data.score;
        this.studentPassed = response.data.passed;
        this.studentSubmissionTime = response.data.submittedAt;

        this.$toast?.success('آزمون با موفقیت ارسال شد!');
      } catch (error) {
        console.error('Error submitting exam:', error);
        this.$toast?.error('خطا در ارسال آزمون. لطفاً دوباره تلاش کنید.');
      }
    },

    viewAnswers() {
      this.showingAnswers = true;
      this.examCompleted = false;
    },

    goToDashboard() {
      this.$router.push('/dashboard');
    },

    checkAnswer(question, answer) {
      if (!question || answer === null || answer === undefined) return false;

      switch (question.type || question.questionType) {
        case 'MULTIPLE_CHOICE':
          return answer === question.correctOption;
        case 'TRUE_FALSE':
          return answer === question.correctOption;
        case 'SHORT_ANSWER':
          return answer.toLowerCase().trim() === question.correctOption.toLowerCase().trim();
        default:
          return false;
      }
    },

    formatTime(seconds) {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;

      if (hours > 0) {
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      }
      return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    },

    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('fa-IR');
    },

    formatDateTime(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('fa-IR') + ' ' + date.toLocaleTimeString('fa-IR');
    }
  }
}
</script>

<style scoped>
.modern-page-bg {
  min-height: 100vh;
  padding: 2rem 0;
}

.modern-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.modern-header {
  text-align: center;
  margin-bottom: 3rem;
}

.modern-logo {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  font-size: 2rem;
  color: white;
}

.modern-logo.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.modern-logo.success {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
}

.modern-logo.large {
  width: 100px;
  height: 100px;
  font-size: 2.5rem;
}

.modern-title {
  color: white;
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.modern-subtitle {
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.2rem;
}

.modern-card {
  background: white;
  border-radius: 15px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.section-title {
  display: flex;
  align-items: center;
  font-weight: 600;
  color: #495057;
  margin-bottom: 1.5rem;
  font-size: 1.1rem;
}

.exam-rules {
  display: grid;
  gap: 1rem;
}

.rule-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  border-radius: 10px;
  background: #f8f9fa;
  border-left: 4px solid #dee2e6;
}

.rule-item.warning {
  background: #fff3cd;
  border-color: #ffc107;
}

.rule-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  margin-left: 1rem;
  font-size: 1.2rem;
  color: #6c757d;
}

.rule-content {
  flex: 1;
}

.rule-title {
  display: block;
  font-weight: 600;
  color: #495057;
  margin-bottom: 0.25rem;
}

.rule-value {
  color: #6c757d;
}

.exam-start-section {
  text-align: center;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #dee2e6;
}

.modern-btn {
  padding: 1rem 2rem;
  border-radius: 10px;
  font-weight: 600;
  border: none;
  transition: all 0.3s ease;
  cursor: pointer;
}

.modern-btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.modern-btn-info {
  background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);
  color: white;
}

.modern-btn-outline {
  background: transparent;
  border: 2px solid #6c757d;
  color: #6c757d;
}

.modern-btn-large {
  font-size: 1.2rem;
  padding: 1.2rem 2.5rem;
}

.exam-info-items {
  display: grid;
  gap: 1rem;
}

.info-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.info-icon {
  width: 35px;
  height: 35px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  margin-left: 0.75rem;
  color: #6c757d;
}

.info-content {
  flex: 1;
}

.info-label {
  display: block;
  font-size: 0.9rem;
  color: #6c757d;
  margin-bottom: 0.25rem;
}

.info-value {
  font-weight: 600;
  color: #495057;
}

.previous-result {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #dee2e6;
}

.result-summary {
  text-align: center;
}

.score-display {
  padding: 1.5rem;
  border-radius: 15px;
  margin-bottom: 1rem;
}

.score-display.passed {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  color: white;
}

.score-display.failed {
  background: linear-gradient(135deg, #dc3545 0%, #fd7e14 100%);
  color: white;
}

.score-number {
  font-size: 2rem;
  font-weight: 700;
  line-height: 1;
}

.score-status {
  margin-top: 0.5rem;
  font-size: 1.1rem;
}

.submission-time {
  color: #6c757d;
  font-size: 0.9rem;
}

/* Exam Interface Styles */
.exam-interface {
  background: white;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.exam-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.exam-progress {
  flex: 1;
  margin-left: 2rem;
}

.progress-info {
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.progress {
  height: 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: rgba(255, 255, 255, 0.9);
  transition: width 0.3s ease;
}

.exam-timer {
  font-size: 1.2rem;
  font-weight: 700;
  display: flex;
  align-items: center;
}

.question-container {
  padding: 2rem;
}

.exam-navigation {
  background: #f8f9fa;
  padding: 2rem;
  border-top: 1px solid #dee2e6;
}

.nav-buttons {
  display: flex;
  justify-content: space-between;
  margin-bottom: 2rem;
}

.question-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(50px, 1fr));
  gap: 0.5rem;
}

.question-number {
  width: 50px;
  height: 50px;
  border: 2px solid #dee2e6;
  background: white;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.question-number:hover {
  border-color: #667eea;
}

.question-number.current {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.question-number.answered {
  background: #28a745;
  color: white;
  border-color: #28a745;
}

.question-number.marked {
  background: #ffc107;
  color: #212529;
  border-color: #ffc107;
}

/* Student Answers Styles */
.student-answers-section {
  max-width: 1000px;
  margin: 0 auto;
}

.answer-summary {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 10px;
  margin-bottom: 2rem;
}

.answer-summary .info-item {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 0.5rem;
}

.answer-summary .info-label {
  font-weight: 600;
  margin-left: 0.5rem;
  color: #6c757d;
}

.answer-summary .info-value.score.passed {
  color: #28a745;
  font-weight: 700;
  font-size: 1.2rem;
}

.answer-summary .info-value.score.failed {
  color: #dc3545;
  font-weight: 700;
  font-size: 1.2rem;
}

.question-answer-item {
  border: 1px solid #dee2e6;
  border-radius: 15px;
  padding: 2rem;
  background: white;
  margin-bottom: 2rem;
}

/* Exam Completed Styles */
.exam-completed {
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
}

.completion-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

/* Responsive */
@media (max-width: 768px) {
  .modern-container {
    padding: 0 0.5rem;
  }

  .modern-card {
    padding: 1.5rem;
  }

  .exam-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .exam-progress {
    margin: 0;
  }

  .nav-buttons {
    flex-direction: column;
    gap: 1rem;
  }

  .question-grid {
    grid-template-columns: repeat(auto-fill, minmax(40px, 1fr));
  }

  .question-number {
    width: 40px;
    height: 40px;
  }

  .completion-actions {
    flex-direction: column;
  }
}
</style>