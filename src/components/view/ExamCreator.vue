<template>
  <div class="exam-creator">
    <div class="container-fluid p-4">
      <div v-if="loading" class="text-center my-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">در حال بارگذاری...</span>
        </div>
      </div>

      <div v-else>
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h2>{{ isEditMode ? 'ویرایش آزمون' : 'ایجاد آزمون جدید' }}</h2>
          <button class="btn btn-outline-secondary" @click="goBack">
            <i class="fas fa-arrow-right"></i> بازگشت
          </button>
        </div>

        <!-- فرم اطلاعات پایه آزمون -->
        <div class="card mb-4">
          <div class="card-header bg-primary text-white">
            <h5 class="mb-0">اطلاعات آزمون</h5>
          </div>
          <div class="card-body">
            <form @submit.prevent="saveExamInfo">
              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label for="examTitle" class="form-label">عنوان آزمون <span class="text-danger">*</span></label>
                    <input type="text" class="form-control" id="examTitle" v-model="examData.title" required>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label for="examDuration" class="form-label">مدت زمان (دقیقه) <span class="text-danger">*</span></label>
                    <input type="number" class="form-control" id="examDuration" v-model="examData.duration" min="1" required>
                  </div>
                </div>
              </div>

              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label for="examPassingScore" class="form-label">نمره قبولی (درصد)</label>
                    <input type="number" class="form-control" id="examPassingScore" v-model="examData.passingScore" min="0" max="100">
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label for="examLesson" class="form-label">درس مربوطه <span class="text-danger">*</span></label>
                    <select class="form-select" id="examLesson" v-model="examData.lessonId" required>
                      <option value="" disabled selected>انتخاب درس</option>
                      <option v-for="lesson in availableLessons" :key="lesson.id" :value="lesson.id">
                        {{ lesson.title }} ({{ getCourseTitle(lesson) }})
                      </option>
                    </select>
                  </div>
                </div>
              </div>

              <div class="mb-3">
                <label for="examDescription" class="form-label">توضیحات آزمون</label>
                <textarea class="form-control" id="examDescription" v-model="examData.description" rows="3"></textarea>
              </div>

              <div class="mb-3">
                <div class="form-check">
                  <input class="form-check-input" type="checkbox" id="shuffleQuestions" v-model="examData.shuffleQuestions">
                  <label class="form-check-label" for="shuffleQuestions">
                    ترتیب سوالات تصادفی باشد
                  </label>
                </div>
              </div>

              <div class="text-end">
                <button type="submit" class="btn btn-primary" :disabled="isInfoSubmitting">
                  <span v-if="isInfoSubmitting" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  ذخیره اطلاعات
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- مدیریت سوالات - فقط زمانی نمایش داده می‌شود که examId داشته باشیم -->
        <div v-if="examId" class="card">
          <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
            <h5 class="mb-0">سوالات آزمون</h5>
            <button class="btn btn-light" @click="showAddQuestionModal">
              <i class="fas fa-plus"></i> افزودن سوال
            </button>
          </div>
          <div class="card-body">
            <div v-if="questions.length === 0" class="alert alert-info text-center">
              <p>هنوز سوالی برای این آزمون تعریف نشده است.</p>
              <button class="btn btn-primary mt-2" @click="showAddQuestionModal">
                <i class="fas fa-plus"></i> افزودن سوال جدید
              </button>
            </div>

            <div v-else class="question-list">
              <div v-for="(question, index) in questions" :key="question.id" class="question-item">
                <div class="question-header d-flex justify-content-between align-items-center">
                  <h5 class="mb-0">
                    <span class="question-number">{{ index + 1 }}</span>
                    {{ question.text }}
                  </h5>
                  <div class="question-actions">
                    <span class="badge" :class="getQuestionTypeBadgeClass(question.type)">
                      {{ getQuestionTypeText(question.type) }}
                    </span>
                    <button class="btn btn-sm btn-outline-success ms-2" @click="editQuestion(question)">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger ms-1" @click="confirmDeleteQuestion(question)">
                      <i class="fas fa-trash-alt"></i>
                    </button>
                  </div>
                </div>
                <div class="question-details">
                  <!-- نمایش گزینه‌ها برای سوال چند گزینه‌ای -->
                  <div v-if="question.type === 'MULTIPLE_CHOICE' && question.options" class="options-list mt-3">
                    <div v-for="(option, optIndex) in question.options" :key="optIndex" class="option-item">
                      <div class="form-check">
                        <input class="form-check-input" type="radio" :checked="question.correctOption == optIndex" disabled>
                        <label class="form-check-label" :class="{'text-success fw-bold': question.correctOption == optIndex}">
                          {{ option }}
                          <span v-if="question.correctOption == optIndex" class="badge bg-success ms-2">پاسخ صحیح</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <!-- نمایش پاسخ درست/نادرست -->
                  <div v-else-if="question.type === 'TRUE_FALSE'" class="mt-3">
                    <div class="form-check">
                      <input class="form-check-input" type="radio" :checked="question.correctOption === 'true'" disabled>
                      <label class="form-check-label" :class="{'text-success fw-bold': question.correctOption === 'true'}">
                        درست
                        <span v-if="question.correctOption === 'true'" class="badge bg-success ms-2">پاسخ صحیح</span>
                      </label>
                    </div>
                    <div class="form-check">
                      <input class="form-check-input" type="radio" :checked="question.correctOption === 'false'" disabled>
                      <label class="form-check-label" :class="{'text-success fw-bold': question.correctOption === 'false'}">
                        نادرست
                        <span v-if="question.correctOption === 'false'" class="badge bg-success ms-2">پاسخ صحیح</span>
                      </label>
                    </div>
                  </div>

                  <!-- نمایش پاسخ کوتاه -->
                  <div v-else-if="question.type === 'SHORT_ANSWER'" class="mt-3">
                    <div class="input-group">
                      <span class="input-group-text">پاسخ صحیح:</span>
                      <input type="text" class="form-control" :value="question.correctOption" disabled>
                    </div>
                  </div>

                  <!-- نمایش اطلاعات سوال تشریحی -->
                  <div v-else-if="question.type === 'ESSAY'" class="mt-3 p-2 border rounded">
                    <div class="d-flex justify-content-between align-items-center">
                      <span>سوال تشریحی - نیاز به بررسی استاد</span>
                      <span class="badge bg-info">{{ question.maxScore || 10 }} نمره</span>
                    </div>
                  </div>

                  <!-- نمایش توضیحات اضافی -->
                  <div v-if="question.explanation" class="explanation mt-3">
                    <div class="form-floating">
                      <textarea class="form-control" :value="question.explanation" disabled></textarea>
                      <label>توضیحات تکمیلی</label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="text-center mt-4">
              <button class="btn btn-success btn-lg" @click="finalizeExam" :disabled="questions.length === 0">
                <i class="fas fa-check"></i> نهایی‌سازی آزمون
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: افزودن/ویرایش سوال -->
    <div class="modal fade" id="questionModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ isEditingQuestion ? 'ویرایش سوال' : 'افزودن سوال جدید' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveQuestion">
              <div class="mb-3">
                <label for="questionText" class="form-label">متن سوال <span class="text-danger">*</span></label>
                <textarea class="form-control" id="questionText" v-model="currentQuestion.text" rows="3" required></textarea>
              </div>

              <div class="mb-3">
                <label for="questionType" class="form-label">نوع سوال <span class="text-danger">*</span></label>
                <select class="form-select" id="questionType" v-model="currentQuestion.type" required>
                  <option value="MULTIPLE_CHOICE">چند گزینه‌ای</option>
                  <option value="TRUE_FALSE">درست/نادرست</option>
                  <option value="SHORT_ANSWER">پاسخ کوتاه</option>
                  <option value="ESSAY">تشریحی</option>
                </select>
              </div>

              <!-- گزینه‌های سوال چند گزینه‌ای -->
              <div v-if="currentQuestion.type === 'MULTIPLE_CHOICE'" class="mb-3">
                <label class="form-label">گزینه‌ها <span class="text-danger">*</span></label>
                <div v-for="(option, index) in currentQuestion.options" :key="index" class="option-input-group mb-2">
                  <div class="input-group">
                    <div class="input-group-text">
                      <input class="form-check-input" type="radio"
                             :name="'correctOption'"
                             :value="index"
                             v-model="currentQuestion.correctOption">
                    </div>
                    <input type="text" class="form-control" v-model="currentQuestion.options[index]"
                           :placeholder="`گزینه ${index + 1}`" required>
                    <button type="button" class="btn btn-outline-danger" @click="removeOption(index)">
                      <i class="fas fa-times"></i>
                    </button>
                  </div>
                </div>

                <button type="button" class="btn btn-outline-primary btn-sm mt-2" @click="addOption"
                        :disabled="currentQuestion.options.length >= 6">
                  <i class="fas fa-plus"></i> افزودن گزینه
                </button>
              </div>

              <!-- گزینه‌های سوال درست/نادرست -->
              <div v-else-if="currentQuestion.type === 'TRUE_FALSE'" class="mb-3">
                <label class="form-label">پاسخ صحیح <span class="text-danger">*</span></label>
                <div class="form-check">
                  <input class="form-check-input" type="radio" id="trueFalseTrue"
                         value="true" v-model="currentQuestion.correctOption">
                  <label class="form-check-label" for="trueFalseTrue">درست</label>
                </div>
                <div class="form-check">
                  <input class="form-check-input" type="radio" id="trueFalseFalse"
                         value="false" v-model="currentQuestion.correctOption">
                  <label class="form-check-label" for="trueFalseFalse">نادرست</label>
                </div>
              </div>

              <!-- گزینه‌های سوال پاسخ کوتاه -->
              <div v-else-if="currentQuestion.type === 'SHORT_ANSWER'" class="mb-3">
                <label for="shortAnswerCorrect" class="form-label">پاسخ صحیح <span class="text-danger">*</span></label>
                <input type="text" class="form-control" id="shortAnswerCorrect"
                       v-model="currentQuestion.correctOption" required>
              </div>

              <!-- گزینه‌های سوال تشریحی -->
              <div v-else-if="currentQuestion.type === 'ESSAY'" class="mb-3">
                <label for="essayMaxScore" class="form-label">حداکثر نمره <span class="text-danger">*</span></label>
                <input type="number" class="form-control" id="essayMaxScore"
                       v-model="currentQuestion.maxScore" min="1" max="100" required>
              </div>

              <div class="mb-3">
                <label for="questionExplanation" class="form-label">توضیحات تکمیلی (اختیاری)</label>
                <textarea class="form-control" id="questionExplanation"
                          v-model="currentQuestion.explanation" rows="2"></textarea>
                <div class="form-text">این توضیحات پس از آزمون به دانش‌آموز نمایش داده خواهد شد.</div>
              </div>

              <div class="text-end">
                <button type="button" class="btn btn-secondary me-2" data-bs-dismiss="modal">انصراف</button>
                <button type="submit" class="btn btn-primary" :disabled="isQuestionSubmitting">
                  <span v-if="isQuestionSubmitting" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  {{ isEditingQuestion ? 'ذخیره تغییرات' : 'افزودن سوال' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: تأیید حذف سوال -->
    <div class="modal fade" id="deleteQuestionModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header bg-danger text-white">
            <h5 class="modal-title">حذف سوال</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p>آیا از حذف این سوال اطمینان دارید؟ این عمل قابل بازگشت نیست.</p>
            <p class="mb-0"><strong>متن سوال:</strong> {{ selectedQuestion?.text }}</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">انصراف</button>
            <button type="button" class="btn btn-danger" @click="deleteQuestion" :disabled="isDeleting">
              <span v-if="isDeleting" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              حذف سوال
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min.js'

export default {
  name: 'ExamCreator',
  props: {
    id: {
      type: String,
      default: null
    },
    lessonId: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      loading: true,
      isEditMode: false,
      examId: null,

      // مودال‌ها
      questionModal: null,
      deleteQuestionModal: null,

      // فرم اطلاعات آزمون
      examData: {
        title: '',
        description: '',
        duration: 60,
        passingScore: 60,
        lessonId: '',
        shuffleQuestions: false
      },
      isInfoSubmitting: false,

      // سوالات
      questions: [],
      availableLessons: [],

      // فرم سوال
      currentQuestion: {
        text: '',
        type: 'MULTIPLE_CHOICE',
        options: ['', '', '', ''],
        correctOption: 0,
        explanation: '',
        maxScore: 10
      },
      isEditingQuestion: false,
      selectedQuestionId: null,
      isQuestionSubmitting: false,

      // حذف سوال
      selectedQuestion: null,
      isDeleting: false
    }
  },
  async created() {
    if (this.id) {
      this.isEditMode = true
      this.examId = this.id
      await this.fetchExamData()
    } else {
      this.isEditMode = false
      this.loading = false

      // اگر lessonId از پراپس دریافت شده باشد، آن را تنظیم می‌کنیم
      if (this.lessonId) {
        this.examData.lessonId = this.lessonId
      }
    }

    await this.fetchLessons()
  },
  mounted() {
    this.initModals()
  },
  methods: {
    async fetchExamData() {
      try {
        const response = await axios.get(`/exams/${this.examId}`)
        const examData = response.data

        // تنظیم داده‌های آزمون
        this.examData = {
          title: examData.title,
          description: examData.description,
          duration: examData.duration,
          passingScore: examData.passingScore || 60,
          lessonId: examData.lesson ? examData.lesson.id : '',
          shuffleQuestions: examData.shuffleQuestions || false
        }

        // دریافت سوالات
        if (examData.questions) {
          this.questions = examData.questions
        }

        this.loading = false
      } catch (error) {
        console.error('Error fetching exam data:', error)
        this.$toast.error('مشکلی در دریافت اطلاعات آزمون رخ داد. لطفاً دوباره تلاش کنید.')
        this.loading = false
      }
    },

    async fetchLessons() {
      try {
        // دریافت درس‌های قابل دسترس برای معلم
        const response = await axios.get('/lessons/teaching')
        this.availableLessons = response.data
      } catch (error) {
        console.error('Error fetching lessons:', error)
        this.$toast.error('مشکلی در دریافت لیست درس‌ها رخ داد.')
      }
    },

    initModals() {
      // ایجاد نمونه‌های مودال
      this.questionModal = new bootstrap.Modal(document.getElementById('questionModal'))
      this.deleteQuestionModal = new bootstrap.Modal(document.getElementById('deleteQuestionModal'))
    },

    goBack() {
      this.$router.go(-1)
    },

    async saveExamInfo() {
      this.isInfoSubmitting = true

      try {
        let response

        if (this.isEditMode) {
          // ویرایش آزمون موجود
          response = await axios.put(`/exams/${this.examId}`, this.examData)
        } else {
          // ایجاد آزمون جدید
          response = await axios.post('/exams', this.examData)
          this.examId = response.data.id
          this.isEditMode = true
        }

        this.$toast.success('اطلاعات آزمون با موفقیت ذخیره شد.')
      } catch (error) {
        console.error('Error saving exam info:', error)
        this.$toast.error('مشکلی در ذخیره اطلاعات آزمون رخ داد. لطفاً دوباره تلاش کنید.')
      } finally {
        this.isInfoSubmitting = false
      }
    },

    showAddQuestionModal() {
      this.isEditingQuestion = false
      this.currentQuestion = {
        text: '',
        type: 'MULTIPLE_CHOICE',
        options: ['', '', '', ''],
        correctOption: 0,
        explanation: '',
        maxScore: 10
      }
      this.questionModal.show()
    },

    editQuestion(question) {
      this.isEditingQuestion = true
      this.selectedQuestionId = question.id

      // کپی اطلاعات سوال
      this.currentQuestion = { ...question }

      // اطمینان از وجود آرایه گزینه‌ها برای سوال چند گزینه‌ای
      if (question.type === 'MULTIPLE_CHOICE' && (!question.options || !Array.isArray(question.options))) {
        this.currentQuestion.options = ['', '', '', '']
      }

      this.questionModal.show()
    },

    addOption() {
      if (!this.currentQuestion.options) {
        this.currentQuestion.options = []
      }

      if (this.currentQuestion.options.length < 6) {
        this.currentQuestion.options.push('')
      }
    },

    removeOption(index) {
      if (this.currentQuestion.options.length > 2) {
        this.currentQuestion.options.splice(index, 1)

        // اگر گزینه انتخاب شده حذف شد، گزینه اول را به عنوان پاسخ درست انتخاب می‌کنیم
        if (this.currentQuestion.correctOption === index) {
          this.currentQuestion.correctOption = 0
        } else if (this.currentQuestion.correctOption > index) {
          // تنظیم مجدد شاخص گزینه درست اگر بعد از گزینه حذف شده باشد
          this.currentQuestion.correctOption--
        }
      } else {
        this.$toast.warning('حداقل دو گزینه برای سوال چندگزینه‌ای لازم است.')
      }
    },

    async saveQuestion() {
      this.isQuestionSubmitting = true

      try {
        // بررسی اعتبار فرم بر اساس نوع سوال
        if (this.currentQuestion.type === 'MULTIPLE_CHOICE') {
          // حداقل باید دو گزینه با مقدار غیر خالی وجود داشته باشد
          const validOptions = this.currentQuestion.options.filter(opt => opt.trim() !== '')
          if (validOptions.length < 2) {
            throw new Error('حداقل دو گزینه برای سوال چندگزینه‌ای لازم است.')
          }

          // اطمینان از این که گزینه درست انتخاب شده و در محدوده قابل قبول است
          if (this.currentQuestion.correctOption === null ||
              this.currentQuestion.correctOption === undefined ||
              this.currentQuestion.correctOption < 0 ||
              this.currentQuestion.correctOption >= this.currentQuestion.options.length) {
            throw new Error('لطفاً پاسخ درست را انتخاب کنید.')
          }
        } else if (this.currentQuestion.type === 'TRUE_FALSE') {
          // اطمینان از این که یک گزینه انتخاب شده است
          if (this.currentQuestion.correctOption !== 'true' && this.currentQuestion.correctOption !== 'false') {
            throw new Error('لطفاً پاسخ درست را انتخاب کنید.')
          }
        } else if (this.currentQuestion.type === 'SHORT_ANSWER') {
          // اطمینان از پر کردن فیلد پاسخ صحیح
          if (!this.currentQuestion.correctOption || this.currentQuestion.correctOption.trim() === '') {
            throw new Error('لطفاً پاسخ صحیح را وارد کنید.')
          }
        } else if (this.currentQuestion.type === 'ESSAY') {
          // اطمینان از وارد کردن نمره
          if (!this.currentQuestion.maxScore || this.currentQuestion.maxScore < 1) {
            throw new Error('لطفاً حداکثر نمره سوال را وارد کنید.')
          }
        }

        let response
        const questionData = {
          ...this.currentQuestion,
          examId: this.examId
        }

        if (this.isEditingQuestion) {
          // ویرایش سوال موجود
          response = await axios.put(`/questions/${this.selectedQuestionId}`, questionData)

          // به‌روزرسانی سوال در لیست
          const index = this.questions.findIndex(q => q.id === this.selectedQuestionId)
          if (index !== -1) {
            this.$set(this.questions, index, response.data)
          }
        } else {
          // افزودن سوال جدید
          response = await axios.post('/questions', questionData)

          // افزودن سوال جدید به لیست
          this.questions.push(response.data)
        }

        // بستن مودال
        this.questionModal.hide()

        // پیام موفقیت
        this.$toast.success(
            this.isEditingQuestion
                ? 'سوال با موفقیت به‌روزرسانی شد.'
                : 'سوال جدید با موفقیت افزوده شد.'
        )
      } catch (error) {
        console.error('Error saving question:', error)
        this.$toast.error(error.message || 'مشکلی در ذخیره سوال رخ داد. لطفاً دوباره تلاش کنید.')
      } finally {
        this.isQuestionSubmitting = false
      }
    },

    confirmDeleteQuestion(question) {
      this.selectedQuestion = question
      this.deleteQuestionModal.show()
    },

    async deleteQuestion() {
      if (!this.selectedQuestion) return

      this.isDeleting = true

      try {
        await axios.delete(`/questions/${this.selectedQuestion.id}`)

        // حذف سوال از لیست
        this.questions = this.questions.filter(q => q.id !== this.selectedQuestion.id)

        // بستن مودال
        this.deleteQuestionModal.hide()

        // پیام موفقیت
        this.$toast.success('سوال با موفقیت حذف شد.')
      } catch (error) {
        console.error('Error deleting question:', error)
        this.$toast.error('مشکلی در حذف سوال رخ داد. لطفاً دوباره تلاش کنید.')
      } finally {
        this.isDeleting