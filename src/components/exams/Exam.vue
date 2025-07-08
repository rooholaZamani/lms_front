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
                  <span class="rule-value">{{ exam.questions ? exam.questions.length : 0 }} سوال</span>
                </div>
              </div>

              <div class="rule-item">
                <div class="rule-icon">
                  <i class="fas fa-percentage"></i>
                </div>
                <div class="rule-content">
                  <span class="rule-title">نمره قبولی</span>
                  <span class="rule-value">{{ exam.passingScore || 60 }}</span>
                </div>
              </div>
              <div class="rule-item">
                <div class="rule-icon">
                  <i class="fas fa-percentage"></i>
                </div>
                <div class="rule-content">
                  <span class="rule-title">حداکثر نمره</span>
                  <span class="rule-value">{{ exam.totalPossibleScore || 100 }}</span>
                </div>
              </div>

              <div class="rule-item warning">
                <div class="rule-icon">
                  <i class="fas fa-exclamation-triangle"></i>
                </div>
                <div class="rule-content">
                  <span class="rule-title">توجه مهم</span>
                  <span class="rule-value">پس از شروع آزمون، امکان متوقف کردن آن وجود ندارد</span>
                </div>
              </div>

              <div class="rule-item danger">
                <div class="rule-icon">
                  <i class="fas fa-times-circle"></i>
                </div>
                <div class="rule-content">
                  <span class="rule-title">هشدار</span>
                  <span class="rule-value">در صورت بستن صفحه، پاسخ‌های شما ذخیره نخواهد شد</span>
                </div>
              </div>
            </div>

            <!-- Start/Show Answers Button -->
            <div class="exam-start-section">
              <button
                  v-if="!hasStudentTaken"
                  class="modern-btn modern-btn-primary modern-btn-large"
                  @click="startExam"
                  :disabled="loading">
                <i class="fas fa-play me-2"></i>
                شروع آزمون
              </button>

              <button
                  v-else
                  class="modern-btn modern-btn-info modern-btn-large"
                  @click="showAnswers"
                  :disabled="loading">
                <i class="fas fa-eye me-2"></i>
                نمایش پاسخ‌ها
              </button>
            </div>
          </div>
        </div>

        <!-- Exam Info Sidebar -->
        <div class="col-lg-4 mb-4">
          <div class="modern-card animate-slide-left">
            <h6 class="section-title">
              <i class="fas fa-info me-2"></i>
              اطلاعات آزمون
            </h6>

            <div class="exam-info-items">
              <div class="info-item">
                <div class="info-icon">
                  <i class="fas fa-book"></i>
                </div>
                <div class="info-content">
                  <span class="info-label">درس</span>
                  <span class="info-value">{{ exam.lessonTitle  || 'نامشخص' }}</span>
                </div>
              </div>

              <div class="info-item">
                <div class="info-icon">
                  <i class="fas fa-user-tie"></i>
                </div>
                <div class="info-content">
                  <span class="info-label">دوره</span>
                  <span class="info-value">{{ exam.courseTitle  || 'نامشخص' }}</span>
                </div>
              </div>


              <div class="info-item">
                <div class="info-icon">
                  <i class="fas fa-user-tie"></i>
                </div>
                <div class="info-content">
                  <span class="info-label">ایجاد شده توسط</span>
                  <span class="info-value">{{ exam.finalizedBy  || 'نامشخص' }}</span>
                </div>
              </div>

              <div class="info-item">
                <div class="info-icon">
                  <i class="fas fa-calendar"></i>
                </div>
                <div class="info-content">
                  <span class="info-label">تاریخ ایجاد</span>
                  <span class="info-value">{{ formatDateTime(exam.finalizedAt) }}</span>
                </div>
              </div>

              <!-- Show previous result if taken -->
              <div v-if="hasStudentTaken" class="previous-result">
                <h6 class="section-title mt-4">
                  <i class="fas fa-chart-line me-2"></i>
                  آخرین نتیجه شما
                </h6>

                <div class="result-summary">
                  <div class="score-display" :class="studentPassed ? 'passed' : 'failed'">
                    <div class="score-number">{{ studentScore }}%</div>
                    <div class="score-status">
                      <i :class="studentPassed ? 'fas fa-check' : 'fas fa-times'"></i>
                      {{ studentPassed ? 'قبول' : 'مردود' }}
                    </div>
                  </div>

                  <div class="submission-time">
                    <i class="fas fa-clock me-1"></i>
                    {{ formatDateTime(studentSubmissionTime) }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Exam Interface (during exam) -->
      <div v-else-if="examStarted && !examCompleted" class="exam-interface">
        <!-- Exam Header -->
        <div class="exam-header">
          <div class="exam-progress">
            <div class="progress-info">
              <span>سوال {{ currentQuestionIndex + 1 }} از {{ exam.questions.length }}</span>
            </div>
            <div class="progress">
              <div class="progress-bar" :style="{ width: ((currentQuestionIndex + 1) / exam.questions.length * 100) + '%' }"></div>
            </div>
          </div>

          <div class="exam-timer">
            <i class="fas fa-clock me-2"></i>
            {{ formatTime(remainingTime) }}
          </div>
        </div>

        <!-- Question Display -->
        <div class="question-container">
          <div class="question-header">
            <h4>سوال {{ currentQuestionIndex + 1 }}</h4>
            <button class="btn btn-outline-warning btn-sm" @click="markForReview">
              <i class="fas fa-flag me-1"></i>
              {{ questionsForReview.includes(currentQuestionIndex) ? 'حذف از بررسی' : 'علامت‌گذاری برای بررسی' }}
            </button>
          </div>

          <div class="question-text">
            {{ currentQuestion.text }}
          </div>

          <!-- Multiple Choice Question -->
          <div v-if="currentQuestion.type === 'MULTIPLE_CHOICE'" class="question-options">
            <div
                v-for="(option, index) in currentQuestion.options"
                :key="index"
                class="option-item"
                :class="{ 'selected': answers[currentQuestionIndex] === index }"
                @click="updateAnswer(currentQuestionIndex, index)">

              <div class="option-radio">
                <input
                    type="radio"
                    :name="`question_${currentQuestionIndex}`"
                    :value="index"
                    :checked="answers[currentQuestionIndex] === index"
                    @change="updateAnswer(currentQuestionIndex, index)">
              </div>

              <div class="option-content">
                <span class="option-letter">{{ String.fromCharCode(65 + index) }})</span>
                <span class="option-text">{{ option.text }}</span>
              </div>
            </div>
          </div>

          <!-- Essay Question -->
          <div v-else-if="currentQuestion.type === 'ESSAY'" class="question-essay">
            <textarea
                class="form-control"
                rows="8"
                placeholder="پاسخ خود را اینجا بنویسید..."
                :value="answers[currentQuestionIndex] || ''"
                @input="updateAnswer(currentQuestionIndex, $event.target.value)">
            </textarea>
          </div>
        </div>

        <!-- Navigation -->
        <div class="exam-navigation">
          <div class="nav-buttons">
            <button
                class="btn btn-outline-secondary"
                @click="previousQuestion"
                :disabled="currentQuestionIndex === 0">
              <i class="fas fa-chevron-right me-1"></i>
              سوال قبل
            </button>

            <button
                v-if="currentQuestionIndex < exam.questions.length - 1"
                class="btn btn-primary"
                @click="nextQuestion">
              سوال بعد
              <i class="fas fa-chevron-left ms-1"></i>
            </button>

            <button
                v-else
                class="btn btn-success"
                @click="confirmFinishExam">
              <i class="fas fa-check me-1"></i>
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

          <!-- Questions and Answers -->
          <div class="questions-answers">
            <div
                v-for="(question, index) in exam.questions"
                :key="question.id"
                class="question-answer-item mb-4">

              <div class="question-header">
                <h6>
                  <i class="fas fa-question-circle me-2"></i>
                  سوال {{ index + 1 }}
                </h6>
              </div>

              <div class="question-text mb-3">
                {{ question.text }}
              </div>

              <!-- Multiple Choice Options -->
              <div v-if="question.type === 'MULTIPLE_CHOICE'" class="options-list">
                <div
                    v-for="(option, optIndex) in question.options"
                    :key="optIndex"
                    class="option-item"
                    :class="{
                    'correct-answer': option.isCorrect,
                    'student-answer': studentAnswers[question.id] == optIndex,
                    'wrong-answer': studentAnswers[question.id] == optIndex && !option.isCorrect
                  }">

                  <div class="option-content">
                    <span class="option-letter">{{ String.fromCharCode(65 + optIndex) }})</span>
                    <span class="option-text">{{ option.text }}</span>
                  </div>

                  <div class="option-indicators">
                    <i v-if="option.isCorrect" class="fas fa-check text-success" title="پاسخ صحیح"></i>
                    <i v-if="studentAnswers[question.id] == optIndex" class="fas fa-user text-primary" title="پاسخ شما"></i>
                  </div>
                </div>

                <!-- Show if no answer provided -->
                <div v-if="!hasStudentAnswered(question.id)" class="no-answer">
                  <i class="fas fa-exclamation-triangle text-warning"></i>
                  پاسخی ارسال نشده است
                </div>
              </div>

              <!-- Essay Answer -->
              <div v-else-if="question.type === 'ESSAY'" class="essay-answer">
                <div class="student-essay-answer">
                  <strong>
                    <i class="fas fa-pen me-1"></i>
                    پاسخ شما:
                  </strong>
                  <div class="essay-text">
                    {{ studentAnswers[question.id] || 'پاسخی ارسال نشده است' }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="answers-footer">
            <button class="modern-btn modern-btn-outline" @click="hideAnswers">
              <i class="fas fa-times me-2"></i>
              بستن
            </button>
          </div>
        </div>
      </div>

      <!-- Exam Results -->
      <div v-else-if="examCompleted" class="exam-results">
        <div class="result-card">
          <div class="result-icon" :class="examResult.passed ? 'success' : 'failure'">
            <i :class="examResult.passed ? 'fas fa-check-circle' : 'fas fa-times-circle'"></i>
          </div>

          <h3 class="result-title">
            {{ examResult.passed ? 'تبریک! شما قبول شدید' : 'متأسفانه قبول نشدید' }}
          </h3>

          <div class="result-score">
            <span class="score-label">نمره شما:</span>
            <span class="score-value" :class="examResult.passed ? 'passed' : 'failed'">
              {{ examResult.score }}%
            </span>
          </div>

          <div class="result-details">
            <div class="detail-item">
              <span class="detail-label">پاسخ‌های صحیح:</span>
              <span class="detail-value">{{ examResult.correctCount }} از {{ exam.questions.length }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">پاسخ‌های نادرست:</span>
              <span class="detail-value">{{ examResult.incorrectCount }} از {{ exam.questions.length }}</span>
            </div>
          </div>

          <div class="result-actions">
            <button class="modern-btn modern-btn-primary" @click="$router.push('/courses')">
              <i class="fas fa-home me-2"></i>
              بازگشت به دوره‌ها
            </button>
          </div>
        </div>
      </div>

      <!-- Confirmation Modal -->
      <div v-if="showConfirmation" class="confirmation-overlay">
        <div class="confirmation-modal">
          <h5>تأیید پایان آزمون</h5>
          <p>آیا از پایان دادن آزمون اطمینان دارید؟</p>
          <p class="text-warning">
            <i class="fas fa-exclamation-triangle me-1"></i>
            پس از تأیید، امکان تغییر پاسخ‌ها وجود نخواهد داشت.
          </p>

          <div class="confirmation-buttons">
            <button class="btn btn-secondary" @click="cancelFinishExam">انصراف</button>
            <button class="btn btn-danger" @click="finishExam">تأیید و پایان</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'Exam',
  props: {
    id: {
      required: true
    }
  },
  data() {
    return {
      loading: true,
      exam: {},

      // Exam state
      examStarted: false,
      examCompleted: false,
      showConfirmation: false,
      showingAnswers: false,

      // Student status
      hasStudentTaken: false,
      studentScore: null,
      studentPassed: null,
      studentSubmissionTime: null,
      studentAnswers: {},

      // Questions and answers
      currentQuestionIndex: 0,
      answers: [],
      questionsForReview: [],

      // Timer
      remainingTime: 0,
      timerInterval: null,

      // Exam result
      examResult: {
        score: 0,
        correctCount: 0,
        incorrectCount: 0,
        passed: false
      }
    }
  },
  computed: {
    currentQuestion() {
      if (!this.exam || !this.exam.questions || this.exam.questions.length === 0) {
        return { text: 'سوالی وجود ندارد', type: 'MULTIPLE_CHOICE', options: [] };
      }
      return this.exam.questions[this.currentQuestionIndex] || {};
    }
  },
  async created() {
    await this.fetchExamData();
  },
  beforeUnmount() {
    this.stopTimer();
  },
  methods: {
    async fetchExamData() {
      try {
        this.loading = true;
        const response = await axios.get(`/exams/${this.id}`);
        this.exam = response.data;

        // Check submission status
        const statusResponse = await axios.get(`/exams/${this.id}/submission-status`);
        const status = statusResponse.data;

        this.hasStudentTaken = status.hasTaken;
        if (status.hasTaken) {
          this.studentScore = status.score;
          this.studentPassed = status.passed;
          this.studentSubmissionTime = status.submissionTime;
        }

        this.loading = false;
      } catch (error) {
        console.error('Error fetching exam:', error);
        this.$toast.error('مشکلی در دریافت آزمون رخ داد.');
        this.loading = false;
      }
    },

    async showAnswers() {
      try {
        this.loading = true;

        const response = await axios.get(`/exams/${this.id}/student-answers`);
        this.studentAnswers = response.data.answers || {};
        this.showingAnswers = true;

      } catch (error) {
        console.error('Error fetching answers:', error);
        this.$toast.error('خطا در دریافت پاسخ‌ها');
      } finally {
        this.loading = false;
      }
    },

    hideAnswers() {
      this.showingAnswers = false;
    },

    hasStudentAnswered(questionId) {
      return this.studentAnswers[questionId] !== null &&
          this.studentAnswers[questionId] !== undefined &&
          this.studentAnswers[questionId] !== '';
    },

    startExam() {
      if (this.hasStudentTaken) {
        this.$toast.warning('شما قبلاً این آزمون را گذرانده‌اید.');
        return;
      }

      this.examStarted = true;
      this.remainingTime = (this.exam.timeLimit || 60) * 60;
      this.answers = new Array(this.exam.questions.length).fill(null);
      this.startTimer();
    },

    startTimer() {
      this.timerInterval = setInterval(() => {
        if (this.remainingTime > 0) {
          this.remainingTime--;
        } else {
          this.stopTimer();
          this.finishExam();
        }
      }, 1000);
    },

    stopTimer() {
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
      }
    },

    previousQuestion() {
      if (this.currentQuestionIndex > 0) {
        this.currentQuestionIndex--;
      }
    },

    nextQuestion() {
      if (this.currentQuestionIndex < this.exam.questions.length - 1) {
        this.currentQuestionIndex++;
      }
    },

    goToQuestion(index) {
      if (index >= 0 && index < this.exam.questions.length) {
        this.currentQuestionIndex = index;
        if (this.showConfirmation) {
          this.showConfirmation = false;
        }
      }
    },

    updateAnswer(questionIndex, answer) {
      this.answers[questionIndex] = answer;
    },

    markForReview() {
      const index = this.currentQuestionIndex;
      if (this.questionsForReview.includes(index)) {
        this.questionsForReview = this.questionsForReview.filter(i => i !== index);
      } else {
        this.questionsForReview.push(index);
      }
    },

    confirmFinishExam() {
      this.showConfirmation = true;
    },

    cancelFinishExam() {
      this.showConfirmation = false;
    },

    async finishExam() {
      try {
        this.stopTimer();

        const submissionData = {
          answers: {},
          timeSpent: Math.floor(((this.exam.timeLimit || 60) * 60 - this.remainingTime) / 60)
        };

        this.answers.forEach((answer, index) => {
          if (answer !== null && answer !== undefined) {
            const questionId = this.exam.questions[index].id.toString();
            submissionData.answers[questionId] = answer;
          }
        });

        const response = await axios.post(`/exams/${this.id}/submit`, submissionData);
        this.examResult = response.data;
        this.examCompleted = true;
        this.showConfirmation = false;

      } catch (error) {
        console.error('Error submitting exam:', error);

        if (error.response?.data?.message?.includes('already taken')) {
          this.$toast.error('شما قبلاً این آزمون را گذرانده‌اید');
          await this.fetchExamData();
        } else {
          this.$toast.error('مشکلی در ارسال پاسخ‌ها رخ داد.');
        }
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

.rule-item.danger {
  background: #f8d7da;
  border-color: #dc3545;
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

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.question-text {
  font-size: 1.2rem;
  line-height: 1.6;
  color: #495057;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 10px;
  border-right: 4px solid #667eea;
}

.question-options {
  display: grid;
  gap: 1rem;
}

.option-item {
  display: flex;
  align-items: center;
  padding: 1rem 1.5rem;
  border: 2px solid #dee2e6;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.option-item:hover {
  border-color: #667eea;
  background: #f8f9fa;
}

.option-item.selected {
  border-color: #667eea;
  background: #e3f2fd;
}

.option-radio {
  margin-left: 1rem;
}

.option-content {
  flex: 1;
  display: flex;
  align-items: center;
}

.option-letter {
  font-weight: 600;
  margin-left: 0.75rem;
  color: #667eea;
}

.question-essay textarea {
  border-radius: 10px;
  border: 2px solid #dee2e6;
  transition: border-color 0.3s ease;
}

.question-essay textarea:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
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

.question-answer-item .question-header h6 {
  color: #495057;
  margin: 0;
  display: flex;
  align-items: center;
}

.question-answer-item .question-text {
  font-size: 1.1rem;
  line-height: 1.6;
  color: #212529;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  margin: 1rem 0;
}

.options-list .option-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  margin-bottom: 0.5rem;
  border-radius: 8px;
  border: 1px solid #dee2e6;
}

.correct-answer {
  background-color: #d4edda;
  border-color: #c3e6cb;
}

.student-answer:not(.correct-answer) {
  background-color: #f8d7da;
  border-color: #f5c6cb;
}

.option-indicators i {
  margin-left: 0.5rem;
  font-size: 1.1rem;
}

.no-answer {
  padding: 1rem;
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 8px;
  color: #856404;
  text-align: center;
}

.essay-answer {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 10px;
}

.essay-text {
  margin-top: 1rem;
  padding: 1rem;
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  min-height: 100px;
  white-space: pre-wrap;
  line-height: 1.6;
}

.answers-footer {
  text-align: center;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #dee2e6;
}

/* Exam Results */
.exam-results {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
}

.result-card {
  background: white;
  border-radius: 20px;
  padding: 3rem;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 100%;
}

.result-icon {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 2rem;
  font-size: 3rem;
  color: white;
}

.result-icon.success {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
}

.result-icon.failure {
  background: linear-gradient(135deg, #dc3545 0%, #fd7e14 100%);
}

.result-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #495057;
  margin-bottom: 2rem;
}

.result-score {
  margin-bottom: 2rem;
}

.score-label {
  display: block;
  font-size: 1.1rem;
  color: #6c757d;
  margin-bottom: 0.5rem;
}

.score-value {
  font-size: 3rem;
  font-weight: 700;
}

.score-value.passed {
  color: #28a745;
}

.score-value.failed {
  color: #dc3545;
}

.result-details {
  display: grid;
  gap: 1rem;
  margin-bottom: 2rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.detail-label {
  color: #6c757d;
}

.detail-value {
  font-weight: 600;
  color: #495057;
}

/* Confirmation Modal */
.confirmation-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.confirmation-modal {
  background: white;
  border-radius: 15px;
  padding: 2rem;
  max-width: 400px;
  width: 90%;
  text-align: center;
}

.confirmation-modal h5 {
  color: #495057;
  margin-bottom: 1rem;
}

.confirmation-modal p {
  color: #6c757d;
  margin-bottom: 1rem;
}

.confirmation-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
}

/* Animations */
.animate-slide-up {
  animation: slideUp 0.6s ease-out;
}

.animate-slide-right {
  animation: slideRight 0.6s ease-out;
}

.animate-slide-left {
  animation: slideLeft 0.6s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideRight {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideLeft {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .modern-container {
    padding: 0 0.5rem;
  }

  .modern-title {
    font-size: 2rem;
  }

  .modern-card {
    padding: 1.5rem;
  }

  .exam-header {
    flex-direction: column;
    gap: 1rem;
  }

  .exam-progress {
    margin-left: 0;
  }

  .question-container {
    padding: 1.5rem;
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
}
</style>