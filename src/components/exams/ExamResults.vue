<template>
  <div class="exam-results">
    <div class="card">
      <div class="card-header" :class="examPassed ? 'bg-success text-white' : 'bg-danger text-white'">
        <h3 class="mb-0">
          <i :class="examPassed ? 'fas fa-check-circle' : 'fas fa-times-circle'"></i>
          {{ examPassed ? 'تبریک! شما در این آزمون قبول شدید.' : 'متأسفانه شما در این آزمون مردود شدید.' }}
        </h3>
      </div>
      <div class="card-body">
        <div class="result-stats">
          <div class="row">
            <div class="col-md-3">
              <div class="result-stat-item">
                <h5>نمره شما</h5>
                <div class="stat-number" :class="{'text-success': examPassed, 'text-danger': !examPassed}">
                  {{ examResult.score }}%
                </div>
              </div>
            </div>
            <div class="col-md-3">
              <div class="result-stat-item">
                <h5>حد نصاب قبولی</h5>
                <div class="stat-number">{{ passingScore }}%</div>
              </div>
            </div>
            <div class="col-md-3">
              <div class="result-stat-item">
                <h5>پاسخ‌های درست</h5>
                <div class="stat-number text-success">{{ examResult.correctCount }}</div>
              </div>
            </div>
            <div class="col-md-3">
              <div class="result-stat-item">
                <h5>پاسخ‌های نادرست</h5>
                <div class="stat-number text-danger">{{ examResult.incorrectCount }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="text-center mt-5">
          <button class="btn btn-primary me-2" @click="$emit('back-to-course')">
            <i class="fas fa-arrow-right me-1"></i> بازگشت به دوره
          </button>
          <button class="btn btn-success" @click="toggleShowQuestions">
            <i :class="showQuestions ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            {{ showQuestions ? 'مخفی کردن سوالات' : 'مشاهده سوالات و پاسخ‌ها' }}
          </button>
        </div>

        <!-- نمایش سوالات و پاسخ‌ها -->
        <div v-if="showQuestions" class="question-results mt-5">
          <h4>سوالات و پاسخ‌ها</h4>

          <div v-for="(question, index) in questions" :key="index" class="question-result-item">
            <div class="question-header d-flex justify-content-between">
              <h5>سوال {{ index + 1 }}: {{ question.text }}</h5>
              <span :class="examResult.answers[index].isCorrect ? 'badge bg-success' : 'badge bg-danger'">
                {{ examResult.answers[index].isCorrect ? 'درست' : 'نادرست' }}
              </span>
            </div>

            <!-- نمایش پاسخ چند گزینه‌ای -->
            <div v-if="question.type === 'MULTIPLE_CHOICE'" class="mt-3">
              <p>پاسخ شما: <strong>{{ getAnswerText(question, answers[index]) }}</strong></p>
              <p>پاسخ صحیح: <strong>{{ getAnswerText(question, question.correctOption) }}</strong></p>
            </div>

            <!-- نمایش پاسخ درست/نادرست -->
            <div v-else-if="question.type === 'TRUE_FALSE'" class="mt-3">
              <p>پاسخ شما: <strong>{{ answers[index] === 'true' ? 'درست' : 'نادرست' }}</strong></p>
              <p>پاسخ صحیح: <strong>{{ question.correctOption === 'true' ? 'درست' : 'نادرست' }}</strong></p>
            </div>

            <!-- نمایش پاسخ تشریحی -->
            <div v-else-if="question.type === 'ESSAY'" class="mt-3">
              <p>پاسخ شما:</p>
              <div class="p-2 border rounded">{{ answers[index] || 'بدون پاسخ' }}</div>
              <p class="mt-2">توضیحات استاد:</p>
              <div class="p-2 border rounded" v-if="examResult.answers[index].feedback">
                {{ examResult.answers[index].feedback }}
              </div>
              <div class="p-2 border rounded bg-light" v-else>
                هنوز بررسی نشده است.
              </div>
            </div>

            <!-- نمایش پاسخ کوتاه -->
            <div v-else-if="question.type === 'SHORT_ANSWER'" class="mt-3">
              <p>پاسخ شما: <strong>{{ answers[index] || 'بدون پاسخ' }}</strong></p>
              <p>پاسخ صحیح: <strong>{{ question.correctOption }}</strong></p>
            </div>

            <!-- توضیحات بیشتر (در صورت وجود) -->
            <div v-if="question.explanation" class="explanation mt-3">
              <h6>توضیحات:</h6>
              <p>{{ question.explanation }}</p>
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
.result-stats {
  background-color: #f8f9fa;
  border-radius: 5px;
  padding: 20px;
}

.result-stat-item {
  text-align: center;
  padding: 15px;
}

.result-stat-item h5 {
  color: #6c757d;
  font-size: 0.9rem;
  margin-bottom: 10px;
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
}

.question-result-item {
  background-color: #f8f9fa;
  border-radius: 5px;
  padding: 15px;
  margin-bottom: 15px;
}

.question-header {
  border-bottom: 1px solid #dee2e6;
  padding-bottom: 10px;
  margin-bottom: 15px;
}

.explanation {
  background-color: #e2f0fd;
  border-radius: 5px;
  padding: 10px 15px;
}
</style>