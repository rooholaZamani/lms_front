<template>
  <div class="modern-page-bg info-gradient">
    <div class="modern-container large animate-slide-up">
      <loading-spinner :loading="loading">
        <div v-if="error" class="modern-alert modern-alert-danger">
          <i class="fas fa-exclamation-circle me-2"></i>
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
            <!-- Header -->
            <div class="modern-header">
              <div class="modern-logo info">
                <i class="fas fa-clipboard-check"></i>
              </div>
              <h1 class="modern-title">{{ exam.title }}</h1>
              <div class="exam-timer" :class="{ 'timer-warning': remainingTime <= 300 }">
                <i class="fas fa-clock me-2"></i>
                <span>{{ formatTime(remainingTime) }}</span>
              </div>
            </div>

            <!-- Progress Bar -->
            <div class="modern-card animate-fade-in" style="animation-delay: 0.1s;">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <span class="fw-bold">پیشرفت آزمون</span>
                <span class="text-muted">{{ currentQuestionIndex + 1 }} / {{ exam.questions.length }}</span>
              </div>
              <div class="progress">
                <div class="progress-bar bg-info"
                     :style="`width: ${((currentQuestionIndex + 1) / exam.questions.length) * 100}%`"
                     role="progressbar">
                </div>
              </div>
            </div>

            <!-- Question Card -->
            <div class="modern-card animate-fade-in" style="animation-delay: 0.2s;">
              <!-- Question Content -->
              <exam-question
                  v-if="!showConfirmation"
                  :question="currentQuestion"
                  :question-index="currentQuestionIndex"
                  :total-questions="exam.questions.length"
                  :answer="answers[currentQuestionIndex]"
                  @answer-changed="updateAnswer" />

              <!-- Navigation Buttons -->
              <div v-if="!showConfirmation" class="exam-navigation mt-4">
                <div class="d-flex justify-content-between align-items-center flex-wrap gap-3">
                  <button
                      class="modern-btn modern-btn-secondary"
                      @click="previousQuestion"
                      :disabled="currentQuestionIndex === 0">
                    <i class="fas fa-chevron-right me-2"></i>
                    سوال قبلی
                  </button>

                  <div class="d-flex gap-2 flex-wrap">
                    <button class="modern-btn modern-btn-outline" @click="markForReview">
                      <i class="fas fa-bookmark me-2"></i>
                      علامت‌گذاری برای بررسی
                    </button>

                    <button
                        v-if="currentQuestionIndex < exam.questions.length - 1"
                        class="modern-btn modern-btn-primary"
                        @click="nextQuestion">
                      سوال بعدی
                      <i class="fas fa-chevron-left ms-2"></i>
                    </button>

                    <button
                        v-else
                        class="modern-btn modern-btn-success"
                        @click="confirmFinishExam">
                      پایان آزمون
                      <i class="fas fa-check ms-2"></i>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Confirmation View -->
              <exam-finish-confirmation
                  v-if="showConfirmation"
                  :answers="answers"
                  :total-questions="exam.questions.length"
                  @cancel="cancelFinishExam"
                  @finish="finishExam"
                  @go-to-question="goToQuestion" />
            </div>

            <!-- Question Navigation Bar -->
            <div v-if="!showConfirmation" class="modern-card animate-fade-in" style="animation-delay: 0.3s;">
              <exam-navigation
                  :current-question="currentQuestionIndex"
                  :total-questions="exam.questions.length"
                  :answers="answers"
                  :review-questions="questionsForReview"
                  @go-to-question="goToQuestion" />
            </div>
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
    return { formatTime };
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
    this.stopTimer();
  },
  methods: {
    async fetchExamData() {
      try {
        this.loading = true;
        const response = await axios.get(`/exams/${this.id}`);


        console.log('Exam API Response:', response.data);
        console.log('Questions in exam:', response.data.questions);
        console.log('Exam status:', response.data.status);


        this.exam = response.data;

        if (this.exam.lesson && this.exam.lesson.course) {
          this.courseId = this.exam.lesson.course.id;
        }

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
      this.examStarted = true;
      this.remainingTime = (this.exam.duration || 60) * 60;
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
          answers: {},  // Change to object/map format
          timeSpent: Math.floor(((this.exam.duration || 60) * 60 - this.remainingTime) / 60) // Add time spent in minutes
        };

// Convert array answers to map format
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
        this.$toast.error('مشکلی در ارسال پاسخ‌ها رخ داد. لطفاً دوباره تلاش کنید.');
      }
    },

    backToCourse() {
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
.exam-timer {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  padding: 1rem 1.5rem;
  border-radius: 12px;
  font-size: 1.2rem;
  font-weight: 700;
  color: #495057;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.timer-warning {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
  color: white;
  animation: pulse 1.5s infinite;
}

.progress {
  height: 8px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar {
  transition: width 0.3s ease;
  border-radius: 4px;
}

/* Navigation */
.exam-navigation {
  padding-top: 2rem;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

/* Responsive */
@media (max-width: 768px) {
  .exam-timer {
    font-size: 1rem;
    padding: 0.75rem 1rem;
  }

  .d-flex.justify-content-between {
    flex-direction: column;
    gap: 1rem;
  }

  .d-flex.gap-2 {
    justify-content: center;
  }

  .modern-btn {
    width: 100%;
  }

  .d-flex.gap-2 .modern-btn {
    width: auto;
    flex: 1;
  }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}
</style>