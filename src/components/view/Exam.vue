<template>
  <div class="exam-container">
    <div class="container-fluid p-4">
      <div v-if="loading" class="text-center my-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">در حال بارگذاری...</span>
        </div>
      </div>

      <div v-else-if="error" class="alert alert-danger">
        {{ error }}
      </div>

      <template v-else>
        <!-- Before Exam Start -->
        <div v-if="!examStarted" class="exam-intro">
          <div class="card">
            <div class="card-header bg-primary text-white">
              <h3 class="mb-0">{{ exam.title }}</h3>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-8">
                  <h4>توضیحات آزمون</h4>
                  <p>{{ exam.description }}</p>

                  <h5>قوانین آزمون:</h5>
                  <ul class="exam-rules">
                    <li>مدت زمان آزمون: <strong>{{ exam.duration }} دقیقه</strong></li>
                    <li>تعداد سوالات: <strong>{{ exam.questions ? exam.questions.length : 0 }} سوال</strong></li>
                    <li>نمره قبولی: <strong>{{ exam.passingScore || 60 }}%</strong></li>
                    <li>پس از شروع آزمون، نمی‌توانید آن را متوقف کنید.</li>
                    <li>در صورت بستن صفحه یا خروج از آزمون، پاسخ‌های شما ذخیره نخواهد شد.</li>
                  </ul>
                </div>
                <div class="col-md-4">
                  <div class="exam-info-box">
                    <div class="exam-info-item">
                      <i class="fas fa-book"></i>
                      <div>
                        <h5>درس</h5>
                        <p>{{ exam.lesson ? exam.lesson.title : 'نامشخص' }}</p>
                      </div>
                    </div>
                    <div class="exam-info-item">
                      <i class="fas fa-graduation-cap"></i>
                      <div>
                        <h5>دوره</h5>
                        <p>{{ exam.lesson && exam.lesson.course ? exam.lesson.course.title : 'نامشخص' }}</p>
                      </div>
                    </div>
                    <div class="exam-info-item">
                      <i class="fas fa-clock"></i>
                      <div>
                        <h5>زمان آزمون</h5>
                        <p>{{ exam.duration }} دقیقه</p>
                      </div>
                    </div>
                    <div class="exam-info-item">
                      <i class="fas fa-check-circle"></i>
                      <div>
                        <h5>نمره قبولی</h5>
                        <p>{{ exam.passingScore || 60 }}%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="text-center mt-4">
                <button class="btn btn-primary btn-lg" @click="startExam">
                  <i class="fas fa-play me-2"></i> شروع آزمون
                </button>
              </div>
            </div>
          </div>
        </div>

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
                 :style="`width: ${(currentQuestionIndex / exam.questions.length) * 100}%`"
                 :aria-valuenow="(currentQuestionIndex / exam.questions.length) * 100"
                 aria-valuemin="0" aria-valuemax="100">
              {{ currentQuestionIndex }} / {{ exam.questions.length }}
            </div>
          </div>

          <div class="card">
            <div class="card-body">
              <div class="question-container">
                <h4 class="question-number">سوال {{ currentQuestionIndex + 1 }} از {{ exam.questions.length }}</h4>
                <div class="question-text">{{ currentQuestion.text }}</div>

                <!-- سوال چند گزینه‌ای -->
                <div v-if="currentQuestion.type === 'MULTIPLE_CHOICE'" class="options-container mt-4">
                  <div v-for="(option, index) in currentQuestion.options" :key="index" class="option-item">
                    <div class="form-check">
                      <input class="form-check-input" type="radio"
                             :id="`option-${index}`"
                             :name="`question-${currentQuestionIndex}`"
                             :value="index"
                             v-model="answers[currentQuestionIndex]">
                      <label class="form-check-label" :for="`option-${index}`">
                        {{ option }}
                      </label>
                    </div>
                  </div>
                </div>

                <!-- سوال درست/نادرست -->
                <div v-else-if="currentQuestion.type === 'TRUE_FALSE'" class="options-container mt-4">
                  <div class="option-item">
                    <div class="form-check">
                      <input class="form-check-input" type="radio"
                             id="option-true"
                             :name="`question-${currentQuestionIndex}`"
                             value="true"
                             v-model="answers[currentQuestionIndex]">
                      <label class="form-check-label" for="option-true">
                        درست
                      </label>
                    </div>
                  </div>
                  <div class="option-item">
                    <div class="form-check">
                      <input class="form-check-input" type="radio"
                             id="option-false"
                             :name="`question-${currentQuestionIndex}`"
                             value="false"
                             v-model="answers[currentQuestionIndex]">
                      <label class="form-check-label" for="option-false">
                        نادرست
                      </label>
                    </div>
                  </div>
                </div>

                <!-- سوال تشریحی -->
                <div v-else-if="currentQuestion.type === 'ESSAY'" class="mt-4">
                  <div class="form-group">
                    <label for="essay-answer">پاسخ خود را بنویسید:</label>
                    <textarea class="form-control mt-2"
                              id="essay-answer"
                              v-model="answers[currentQuestionIndex]"
                              rows="5"></textarea>
                  </div>
                </div>

                <!-- سوال کوتاه پاسخ -->
                <div v-else-if="currentQuestion.type === 'SHORT_ANSWER'" class="mt-4">
                  <div class="form-group">
                    <label for="short-answer">پاسخ کوتاه:</label>
                    <input type="text" class="form-control mt-2"
                           id="short-answer"
                           v-model="answers[currentQuestionIndex]">
                  </div>
                </div>
              </div>

              <div class="exam-navigation mt-4 d-flex justify-content-between">
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
            </div>
          </div>

          <!-- نوار پیمایش سوالات -->
          <div class="question-navigation mt-4">
            <div class="question-nav-header d-flex justify-content-between align-items-center mb-2">
              <h5 class="mb-0">پیمایش سوالات</h5>
              <div class="question-nav-legend d-flex">
                <div class="legend-item">
                  <span class="badge bg-success"></span> پاسخ داده شده
                </div>
                <div class="legend-item">
                  <span class="badge bg-warning"></span> نیاز به بررسی
                </div>
                <div class="legend-item">
                  <span class="badge bg-light border"></span> پاسخ داده نشده
                </div>
              </div>
            </div>
            <div class="question-nav-items">
              <button v-for="(question, index) in exam.questions"
                      :key="index"
                      :class="{
                    'btn-success': answers[index] !== null && answers[index] !== undefined && !questionsForReview.includes(index),
                    'btn-warning': questionsForReview.includes(index),
                    'btn-light border': answers[index] === null || answers[index] === undefined,
                    'active': currentQuestionIndex === index
                  }"
                      class="btn btn-sm question-nav-item"
                      @click="goToQuestion(index)">
                {{ index + 1 }}
              </button>
            </div>
          </div>
        </div>

        <!-- After Exam Completion (Confirmation) -->
        <div v-else-if="showConfirmation" class="exam-confirmation">
          <div class="card">
            <div class="card-header bg-warning">
              <h3 class="mb-0">آیا مطمئن هستید؟</h3>
            </div>
            <div class="card-body">
              <p>شما در حال پایان دادن به آزمون هستید. پس از تأیید، نمی‌توانید پاسخ‌های خود را تغییر دهید.</p>

              <div class="exam-stats mt-4">
                <div class="row">
                  <div class="col-md-4">
                    <div class="exam-stat-item">
                      <h5>تعداد کل سوالات</h5>
                      <div class="stat-number">{{ exam.questions.length }}</div>
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="exam-stat-item">
                      <h5>پاسخ داده شده</h5>
                      <div class="stat-number">{{ answeredQuestionsCount }}</div>
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="exam-stat-item">
                      <h5>بدون پاسخ</h5>
                      <div class="stat-number text-warning">{{ exam.questions.length - answeredQuestionsCount }}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="unanswered-questions mt-4" v-if="exam.questions.length - answeredQuestionsCount > 0">
                <h5>سوالات بدون پاسخ:</h5>
                <div class="question-nav-items">
                  <button v-for="index in getUnansweredQuestions()"
                          :key="index"
                          class="btn btn-sm btn-danger question-nav-item"
                          @click="goToQuestion(index)">
                    {{ index + 1 }}
                  </button>
                </div>
              </div>

              <div class="text-center mt-5">
                <button class="btn btn-secondary btn-lg me-2" @click="cancelFinishExam">
                  <i class="fas fa-arrow-right me-1"></i> بازگشت به آزمون
                </button>
                <button class="btn btn-success btn-lg" @click="finishExam">
                  <i class="fas fa-check me-1"></i> تأیید و ارسال
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Results -->
        <div v-else class="exam-results">
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
                      <div class="stat-number">{{ exam.passingScore || 60 }}%</div>
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
                <router-link :to="{ name: 'CourseDetail', params: { id: courseId } }" class="btn btn-primary me-2">
                  <i class="fas fa-arrow-right me-1"></i> بازگشت به دوره
                </router-link>
                <button class="btn btn-success" @click="showQuestions = !showQuestions">
                  <i :class="showQuestions ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                  {{ showQuestions ? 'مخفی کردن سوالات' : 'مشاهده سوالات و پاسخ‌ها' }}
                </button>
              </div>

              <!-- نمایش سوالات و پاسخ‌ها -->
              <div v-if="showQuestions" class="question-results mt-5">
                <h4>سوالات و پاسخ‌ها</h4>

                <div v-for="(question, index) in exam.questions" :key="index" class="question-result-item">
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
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'Exam',
  props: {
    id: {
      type: String,
      required: true
    }
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
      },
      examPassed: false,
      showQuestions: false
    }
  },
  computed: {
    currentQuestion() {
      if (!this.exam || !this.exam.questions || this.exam.questions.length === 0) {
        return { text: 'سوالی وجود ندارد', type: 'MULTIPLE_CHOICE', options: [] }
      }
      return this.exam.questions[this.currentQuestionIndex] || {}
    },
    answeredQuestionsCount() {
      return this.answers.filter(answer => answer !== null && answer !== undefined).length
    }
  },
  async created() {
    await this.fetchExamData()
  },
  beforeUnmount() {
    // توقف تایمر در صورت خروج از صفحه
    this.stopTimer()
  },
  methods: {
    async fetchExamData() {
      try {
        this.loading = true

        // دریافت اطلاعات آزمون
        const response = await axios.get(`/exams/${this.id}`)
        this.exam = response.data

        // ذخیره شناسه دوره برای بازگشت بعد از آزمون
        if (this.exam.lesson && this.exam.lesson.course) {
          this.courseId = this.exam.lesson.course.id
        }

        // آماده‌سازی آرایه پاسخ‌ها
        if (this.exam.questions) {
          this.answers = Array(this.exam.questions.length).fill(null)
        }

        this.loading = false
      } catch (error) {
        console.error('Error fetching exam data:', error)
        this.error = 'مشکلی در دریافت اطلاعات آزمون رخ داد. لطفاً دوباره تلاش کنید.'
        this.loading = false
      }
    },

    startExam() {
      // شروع آزمون
      this.examStarted = true

      // تنظیم زمان باقی‌مانده
      this.remainingTime = (this.exam.duration || 60) * 60 // تبدیل دقیقه به ثانیه

      // شروع تایمر
      this.startTimer()
    },

    startTimer() {
      this.timerInterval = setInterval(() => {
        if (this.remainingTime > 0) {
          this.remainingTime--
        } else {
          // پایان زمان آزمون
          this.stopTimer()
          this.finishExam()
        }
      }, 1000)
    },

    stopTimer() {
      if (this.timerInterval) {
        clearInterval(this.timerInterval)
        this.timerInterval = null
      }
    },

    formatTime(seconds) {
      const hours = Math.floor(seconds / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)
      const secs = seconds % 60

      return [
        hours.toString().padStart(2, '0'),
        minutes.toString().padStart(2, '0'),
        secs.toString().padStart(2, '0')
      ].join(':')
    },

    previousQuestion() {
      if (this.currentQuestionIndex > 0) {
        this.currentQuestionIndex--
      }
    },

    nextQuestion() {
      if (this.currentQuestionIndex < this.exam.questions.length - 1) {
        this.currentQuestionIndex++
      }
    },

    goToQuestion(index) {
      if (index >= 0 && index < this.exam.questions.length) {
        this.currentQuestionIndex = index

        // اگر در صفحه تایید بودیم، برمی‌گردیم به آزمون
        if (this.showConfirmation) {
          this.showConfirmation = false
        }
      }
    },

    markForReview() {
      const index = this.currentQuestionIndex

      if (this.questionsForReview.includes(index)) {
        // حذف از لیست بررسی مجدد
        this.questionsForReview = this.questionsForReview.filter(i => i !== index)
      } else {
        // افزودن به لیست بررسی مجدد
        this.questionsForReview.push(index)
      }
    },

    confirmFinishExam() {
      this.showConfirmation = true
    },

    cancelFinishExam() {
      this.showConfirmation = false
    },

    getUnansweredQuestions() {
      const unanswered = []
      this.answers.forEach((answer, index) => {
        if (answer === null || answer === undefined) {
          unanswered.push(index)
        }
      })
      return unanswered
    },

    async finishExam() {
      try {
        // توقف تایمر
        this.stopTimer()

        // آماده‌سازی داده‌های ارسالی
        const submissionData = {
          examId: this.id,
          answers: this.answers.map((answer, index) => ({
            questionId: this.exam.questions[index].id,
            answer: answer
          }))
        }

        // ارسال پاسخ‌ها به سرور
        const response = await axios.post('/exams/submit', submissionData)

        // ذخیره نتیجه
        this.examResult = response.data
        this.examPassed = this.examResult.score >= (this.exam.passingScore || 60)

        // تکمیل آزمون
        this.examCompleted = true
        this.showConfirmation = false

      } catch (error) {
        console.error('Error submitting exam:', error)
        this.$toast.error('مشکلی در ارسال پاسخ‌ها رخ داد. لطفاً دوباره تلاش کنید.')
      }
    },

    getAnswerText(question, optionIndex) {
      if (question.type !== 'MULTIPLE_CHOICE' || !question.options || !question.options[optionIndex]) {
        return 'نامشخص'
      }
      return question.options[optionIndex]
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

.exam-rules {
  background-color: #f8f9fa;
  padding: 15px 20px;
  border-radius: 5px;
  border-right: 4px solid #007bff;
  margin-top: 20px;
}

.exam-info-box {
  background-color: #f8f9fa;
  border-radius: 5px;
  padding: 20px;
}

.exam-info-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 15px;
}

.exam-info-item i {
  font-size: 1.5rem;
  color: #007bff;
  margin-left: 15px;
  width: 30px;
  text-align: center;
}

.exam-info-item h5 {
  margin-bottom: 5px;
  font-size: 0.9rem;
  color: #6c757d;
}

.exam-info-item p {
  margin-bottom: 0;
  font-weight: bold;
}

.question-container {
  margin-bottom: 20px;
}

.question-number {
  color: #6c757d;
  font-size: 1.1rem;
  margin-bottom: 15px;
}

.question-text {
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 20px;
}

.options-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.option-item {
  background-color: #f8f9fa;
  border-radius: 5px;
  padding: 10px 15px;
  transition: background-color 0.2s;
}

.option-item:hover {
  background-color: #e9ecef;
}

.question-navigation {
  background-color: white;
  border-radius: 5px;
  padding: 15px;
  border: 1px solid #dee2e6;
}

.question-nav-legend {
  display: flex;
  gap: 15px;
}

.legend-item {
  display: flex;
  align-items: center;
  font-size: 0.8rem;
}

.legend-item .badge {
  width: 15px;
  height: 15px;
  margin-left: 5px;
}

.question-nav-items {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.question-nav-item {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.question-nav-item.active {
  border: 2px solid #495057;
}

.exam-stats, .result-stats {
  background-color: #f8f9fa;
  border-radius: 5px;
  padding: 20px;
}

.exam-stat-item, .result-stat-item {
  text-align: center;
  padding: 15px;
}

.exam-stat-item h5, .result-stat-item h5 {
  color: #6c757d;
  font-size: 0.9rem;
  margin-bottom: 10px;
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
}

.unanswered-questions {
  background-color: #f8d7da;
  border-radius: 5px;
  padding: 15px;
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