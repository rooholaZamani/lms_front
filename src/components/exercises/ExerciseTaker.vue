<template>
  <div class="exercise-taker">
    <!-- Loading State -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">در حال بارگذاری...</span>
      </div>
    </div>

    <!-- Exercise Taking Interface -->
    <div v-else-if="exercise && questions.length > 0" class="exercise-interface">
      <!-- Header -->
      <div class="exercise-header">
        <div class="container-fluid">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h4 class="mb-0">{{ exercise.title }}</h4>
              <small class="text-muted">سوال {{ currentQuestionIndex + 1 }} از {{ questions.length }}</small>
            </div>
            <div class="d-flex align-items-center gap-3">
              <div v-if="exercise.timeLimit" class="time-display">
                <i class="fas fa-clock me-1"></i>
                {{ formatTime(timeLeft) }}
              </div>
              <button @click="submitExercise" class="btn btn-success">
                <i class="fas fa-check me-1"></i>
                اتمام تمرین
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Progress Bar -->
      <div class="progress-container">
        <div class="progress">
          <div
              class="progress-bar"
              :style="{ width: progressPercentage + '%' }"
          ></div>
        </div>
      </div>

      <!-- Question Area -->
      <div class="question-container">
        <div class="container-fluid">
          <div class="question-card">
            <div class="question-number">
              سوال {{ currentQuestionIndex + 1 }}
            </div>

            <div class="question-text">
              {{ currentQuestion.text }}
            </div>

            <!-- Options -->
            <div class="options-container">
              <div
                  v-for="(option, index) in currentQuestion.options"
                  :key="option.id"
                  class="option-item"
                  :class="{ 'selected': selectedAnswers[currentQuestion.id] === option.id }"
                  @click="selectAnswer(option.id)"
              >
                <div class="option-radio">
                  <input
                      type="radio"
                      :name="'question_' + currentQuestion.id"
                      :value="option.id"
                      :checked="selectedAnswers[currentQuestion.id] === option.id"
                      @change="selectAnswer(option.id)"
                  >
                </div>
                <div class="option-text">
                  {{ option.text }}
                </div>
              </div>
            </div>

            <!-- Navigation -->
            <div class="question-navigation">
              <button
                  @click="previousQuestion"
                  :disabled="currentQuestionIndex === 0"
                  class="btn btn-outline-secondary"
              >
                <i class="fas fa-arrow-right me-1"></i>
                قبلی
              </button>

              <button
                  @click="nextQuestion"
                  :disabled="currentQuestionIndex === questions.length - 1"
                  class="btn btn-primary"
              >
                بعدی
                <i class="fas fa-arrow-left ms-1"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Question Overview -->
      <div class="question-overview">
        <div class="container-fluid">
          <h6>نمای کلی سوالات:</h6>
          <div class="question-grid">
            <button
                v-for="(question, index) in questions"
                :key="question.id"
                @click="goToQuestion(index)"
                class="question-pill"
                :class="getQuestionPillClass(question.id, index)"
            >
              {{ index + 1 }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- No Questions State -->
    <div v-else-if="!loading" class="text-center py-5">
      <div class="alert alert-warning">
        این تمرین هنوز سوالی ندارد.
      </div>
      <button @click="goBack" class="btn btn-secondary">
        <i class="fas fa-arrow-right me-1"></i>
        بازگشت
      </button>
    </div>
  </div>
</template>

<script>
import { useExercises } from '@/composables/useExercises';

export default {
  name: 'ExerciseTaker',
  props: {
    id: {
      type: String,
      required: true
    }
  },
  setup() {
    const { fetchExerciseById, submitExercise: submitExerciseApi } = useExercises();
    return { fetchExerciseById, submitExerciseApi };
  },
  data() {
    return {
      loading: true,
      exercise: null,
      questions: [],
      currentQuestionIndex: 0,
      selectedAnswers: {},
      answerTimes: {},
      questionStartTime: null,
      timeLeft: 0,
      timer: null,
      isSubmitting: false
    };
  },
  computed: {
    currentQuestion() {
      return this.questions[this.currentQuestionIndex] || null;
    },
    progressPercentage() {
      return ((this.currentQuestionIndex + 1) / this.questions.length) * 100;
    }
  },
  async mounted() {
    await this.loadExercise();
    this.startQuestionTimer();
    if (this.exercise?.timeLimit) {
      this.startExerciseTimer();
    }
  },
  beforeUnmount() {
    this.stopTimers();
  },
  methods: {
    async loadExercise() {
      try {
        this.loading = true;
        this.exercise = await this.fetchExerciseById(this.id);
        await this.loadQuestions();
      } catch (error) {
        console.error('Error loading exercise:', error);
        this.$toast.error('خطا در بارگذاری تمرین');
      } finally {
        this.loading = false;
      }
    },

    async loadQuestions() {
      try {
        const response = await this.$http.get(`/exercises/${this.id}/questions`);
        this.questions = response.data;
      } catch (error) {
        console.error('Error loading questions:', error);
        this.$toast.error('خطا در بارگذاری سوالات');
      }
    },

    selectAnswer(optionId) {
      this.selectedAnswers[this.currentQuestion.id] = optionId;
      this.recordAnswerTime();
    },

    recordAnswerTime() {
      if (this.questionStartTime) {
        const timeSpent = Date.now() - this.questionStartTime;
        this.answerTimes[this.currentQuestion.id] = Math.round(timeSpent / 1000);
      }
    },

    startQuestionTimer() {
      this.questionStartTime = Date.now();
    },

    nextQuestion() {
      if (this.currentQuestionIndex < this.questions.length - 1) {
        this.recordAnswerTime();
        this.currentQuestionIndex++;
        this.startQuestionTimer();
      }
    },

    previousQuestion() {
      if (this.currentQuestionIndex > 0) {
        this.recordAnswerTime();
        this.currentQuestionIndex--;
        this.startQuestionTimer();
      }
    },

    goToQuestion(index) {
      this.recordAnswerTime();
      this.currentQuestionIndex = index;
      this.startQuestionTimer();
    },

    getQuestionPillClass(questionId, index) {
      if (index === this.currentQuestionIndex) {
        return 'current';
      }
      if (this.selectedAnswers[questionId]) {
        return 'answered';
      }
      return 'unanswered';
    },

    startExerciseTimer() {
      this.timeLeft = this.exercise.timeLimit * 60; // Convert to seconds
      this.timer = setInterval(() => {
        this.timeLeft--;
        if (this.timeLeft <= 0) {
          this.submitExercise();
        }
      }, 1000);
    },

    stopTimers() {
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
    },

    formatTime(seconds) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    },

    async submitExercise() {
      if (this.isSubmitting) return;

      this.isSubmitting = true;
      this.recordAnswerTime();
      this.stopTimers();

      try {
        const result = await this.submitExerciseApi(
            this.id,
            this.selectedAnswers,
            this.answerTimes
        );

        this.$toast.success('تمرین با موفقیت ارسال شد');
        this.$router.push(`/exercises/${this.id}`);
      } catch (error) {
        console.error('Error submitting exercise:', error);
        this.$toast.error('خطا در ارسال تمرین');
        this.isSubmitting = false;
      }
    },

    goBack() {
      this.$router.go(-1);
    }
  }
};
</script>

<style scoped>
.exercise-taker {
  min-height: 100vh;
  background: #f8f9fa;
}

.exercise-header {
  background: white;
  border-bottom: 2px solid #e9ecef;
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.time-display {
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-weight: bold;
  color: #856404;
}

.progress-container {
  background: white;
  padding: 0.5rem 1rem;
  border-bottom: 1px solid #e9ecef;
}

.progress {
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
}

.progress-bar {
  background: linear-gradient(45deg, #667eea, #764ba2);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.question-container {
  flex: 1;
  padding: 2rem 0;
}

.question-card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.question-number {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  display: inline-block;
  font-weight: bold;
  margin-bottom: 1.5rem;
}

.question-text {
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 2rem;
  color: #333;
}

.options-container {
  margin-bottom: 2rem;
}

.option-item {
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
}

.option-item:hover {
  border-color: #667eea;
  background: #f0f4ff;
}

.option-item.selected {
  border-color: #667eea;
  background: #f0f4ff;
}

.option-radio {
  margin-left: 1rem;
}

.option-text {
  flex: 1;
}

.question-navigation {
  display: flex;
  justify-content: space-between;
  padding-top: 1rem;
  border-top: 1px solid #e9ecef;
}

.question-overview {
  background: white;
  border-top: 1px solid #e9ecef;
  padding: 1rem 0;
}

.question-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.question-pill {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid #e9ecef;
  background: white;
  color: #6c757d;
  font-weight: bold;
  transition: all 0.3s ease;
}

.question-pill.current {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.question-pill.answered {
  background: #28a745;
  color: white;
  border-color: #28a745;
}

.question-pill.unanswered:hover {
  border-color: #667eea;
  color: #667eea;
}
</style>