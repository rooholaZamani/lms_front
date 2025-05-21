<template>
  <div class="exam-container">
    <div class="container-fluid p-4">
      <loading-spinner :loading="loading">
        <div v-if="error" class="alert alert-danger">
          {{ error }}
        </div>

        <template v-else>
          <!-- Before Exam Start -->
          <exam-intro
              v-if="!examStarted"
              :exam="exam"
              @start-exam="startExam" />

          <!-- During Exam -->
          <div v-else-if="!examCompleted" class="exam-active">
            <div class="exam-header">
              <h2>{{ exam.title }}</h2>
              <div class="exam-timer" :class="{ 'timer-warning': remainingTime <= 300 }">
                <i class="fas fa-clock"></i>
                <span>{{ formatTime(remainingTime) }}</span>
              </div>
            </div>

            <div class="progress mb-4">
              <div class="progress-bar" role="progressbar"
                   :style="`width: ${((currentQuestionIndex + 1) / exam.questions.length) * 100}%`"
                   :aria-valuenow="((currentQuestionIndex + 1) / exam.questions.length) * 100"
                   aria-valuemin="0" aria-valuemax="100">
                {{ currentQuestionIndex + 1 }} / {{ exam.questions.length }}
              </div>
            </div>

            <div class="card">
              <div class="card-body">
                <!-- View: Question and Options -->
                <exam-question
                    v-if="!showConfirmation"
                    :question="currentQuestion"
                    :question-index="currentQuestionIndex"
                    :total-questions="exam.questions.length"
                    :answer="answers[currentQuestionIndex]"
                    @answer-changed="updateAnswer" />

                <!-- Navigation Buttons -->
                <div v-if="!showConfirmation" class="exam-navigation mt-4 d-flex justify-content-between">
                  <button class="btn btn-secondary"
                          @click="previousQuestion"
                          :disabled="currentQuestionIndex === 0">
                    <i class="fas fa-chevron-right me-1"></i> سوال قبلی
                  </button>

                  <div>
                    <button class="btn btn-outline-primary me-2" @click="markForReview">
                      <i class="fas fa-bookmark me-1"></i> علامت‌گذاری برای بررسی مجدد
                    </button>

                    <button v-if="currentQuestionIndex < exam.questions.length - 1"
                            class="btn btn-primary"
                            @click="nextQuestion">
                      سوال بعدی <i class="fas fa-chevron-left ms-1"></i>
                    </button>
                    <button v-else
                            class="btn btn-success"
                            @click="confirmFinishExam">
                      پایان آزمون <i class="fas fa-check ms-1"></i>
                    </button>
                  </div>
                </div>

                <!-- View: Confirmation -->
                <exam-finish-confirmation
                    v-if="showConfirmation"
                    :answers="answers"
                    :total-questions="exam.questions.length"
                    @cancel="cancelFinishExam"
                    @finish="finishExam"
                    @go-to-question="goToQuestion" />
              </div>
            </div>

            <!-- Question Navigation Bar -->
            <exam-navigation
                v-if="!showConfirmation"
                class="mt-4"
                :current-question="currentQuestionIndex"
                :total-questions="exam.questions.length"
                :answers="answers"
                :review-questions="questionsForReview"
                @go-to-question="goToQuestion" />
          </div>

          <!-- Results -->
          <exam-results
              v-else
              :exam-result="examResult"
              :passing-score="exam.passingScore || 60"
              :questions="exam.questions"
              :answers="answers"
              @back-to-course="backToCourse" />
        </template>
      </loading-spinner>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import ExamIntro from '@/components/exams/ExamIntro.vue';
import ExamQuestion from '@/components/exams/ExamQuestion.vue';
import ExamNavigation from '@/components/exams/ExamNavigation.vue';
import ExamFinishConfirmation from '@/components/exams/ExamFinishConfirmation.vue';
import ExamResults from '@/components/exams/ExamResults.vue';
import { useFormatters } from '@/composables/useFormatters.js';

export default {
  name: 'Exam',
  components: {
    LoadingSpinner,
    ExamIntro,
    ExamQuestion,
    ExamNavigation,
    ExamFinishConfirmation,
    ExamResults
  },
  props: {
    id: {
      type: String,
      required: true
    }
  },
  setup() {
    const { formatTime } = useFormatters();

    return {
      formatTime
    };
  },
  data() {
    return {
      exam: {},
      loading: true,
      error: null,
      courseId: null,

      // وضعیت آزمون
      examStarted: false,
      examCompleted: false,
      showConfirmation: false,

      // سوالات و پاسخ‌ها
      currentQuestionIndex: 0,
      answers: [],
      questionsForReview: [],

      // تایمر
      remainingTime: 0,
      timerInterval: null,

      // نتیجه آزمون
      examResult: {
        score: 0,
        correctCount: 0,
        incorrectCount: 0,
        answers: []
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
    // توقف تایمر در صورت خروج از صفحه
    this.stopTimer();
  },
  methods: {
    async fetchExamData() {
      try {
        this.loading = true;

        // دریافت اطلاعات آزمون
        const response = await axios.get(`/exams/${this.id}`);
        this.exam = response.data;

        // ذخیره شناسه دوره برای بازگشت بعد از آزمون
        if (this.exam.lesson && this.exam.lesson.course) {
          this.courseId = this.exam.lesson.course.id;
        }

        // آماده‌سازی آرایه پاسخ‌ها
        if (this.exam.questions) {
          this.answers = Array(this.exam.questions.length).fill(null);
        }

        this.loading = false;
      } catch (error) {
        console.error('Error fetching exam data:', error);
        this.error = 'مشکلی در دریافت اطلاعات آزمون رخ داد. لطفاً دوباره تلاش کنید.';
        this.loading = false;
      }
    },

    startExam() {
      // شروع آزمون
      this.examStarted = true;

      // تنظیم زمان باقی‌مانده
      this.remainingTime = (this.exam.duration || 60) * 60; // تبدیل دقیقه به ثانیه

      // شروع تایمر
      this.startTimer();
    },

    startTimer() {
      this.timerInterval = setInterval(() => {
        if (this.remainingTime > 0) {
          this.remainingTime--;
        } else {
          // پایان زمان آزمون
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

        // اگر در صفحه تایید بودیم، برمی‌گردیم به آزمون
        if (this.showConfirmation) {
          this.showConfirmation = false;
        }
      }
    },

    updateAnswer(questionIndex, answer) {
      // this.$set(this.answers, questionIndex, answer);
      this.answers[questionIndex]= answer;
    },

    markForReview() {
      const index = this.currentQuestionIndex;

      if (this.questionsForReview.includes(index)) {
        // حذف از لیست بررسی مجدد
        this.questionsForReview = this.questionsForReview.filter(i => i !== index);
      } else {
        // افزودن به لیست بررسی مجدد
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
        // توقف تایمر
        this.stopTimer();

        // آماده‌سازی داده‌های ارسالی
        const submissionData = {
          examId: this.id,
          answers: this.answers.map((answer, index) => ({
            questionId: this.exam.questions[index].id,
            answer: answer
          }))
        };

        // ارسال پاسخ‌ها به سرور
        const response = await axios.post('/exams/submit', submissionData);

        // ذخیره نتیجه
        this.examResult = response.data;

        // تکمیل آزمون
        this.examCompleted = true;
        this.showConfirmation = false;

      } catch (error) {
        console.error('Error submitting exam:', error);
        this.$toast.error('مشکلی در ارسال پاسخ‌ها رخ داد. لطفاً دوباره تلاش کنید.');
      }
    },

    backToCourse() {
      // بازگشت به صفحه دوره
      if (this.courseId) {
        this.$router.push({ name: 'CourseDetail', params: { id: this.courseId } });
      } else {
        this.$router.push({ name: 'Dashboard' });
      }
    }
  }
}
</script>

<style scoped>
.exam-container {
  min-height: calc(100vh - 56px);
  background-color: #f5f7fa;
}

.exam-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.exam-timer {
  background-color: #e9ecef;
  padding: 10px 20px;
  border-radius: 5px;
  font-size: 1.2rem;
  font-weight: bold;
  display: flex;
  align-items: center;
}

.exam-timer i {
  margin-left: 10px;
  color: #6c757d;
}

.timer-warning {
  background-color: #fff3cd;
  color: #856404;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.8; }
  100% { opacity: 1; }
}
</style>