<template>
  <div class="question-bank-container">
    <div class="container-fluid p-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>بانک سوالات</h2>
        <div>
          <button class="btn btn-primary" @click="showAddQuestionModal">
            <i class="fas fa-plus me-1"></i> افزودن سوال جدید
          </button>
          <button class="btn btn-outline-secondary ms-2" @click="goBack">
            <i class="fas fa-arrow-right me-1"></i> بازگشت
          </button>
        </div>
      </div>

      <!-- فیلترها و جستجو -->
      <div class="card mb-4">
        <div class="card-body">
          <div class="row">
            <div class="col-md-4">
              <div class="mb-3">
                <label for="searchQuery" class="form-label">جستجو</label>
                <div class="input-group">
                  <input
                      type="text"
                      class="form-control"
                      id="searchQuery"
                      v-model="searchQuery"
                      placeholder="جستجو در متن سوالات"
                  >
                  <button class="btn btn-primary" @click="filterQuestions">
                    <i class="fas fa-search"></i>
                  </button>
                </div>
              </div>
            </div>
            <div class="col-md-3">
              <div class="mb-3">
                <label for="typeFilter" class="form-label">نوع سوال</label>
                <select class="form-select" id="typeFilter" v-model="typeFilter" @change="filterQuestions">
                  <option value="all">همه</option>
                  <option value="MULTIPLE_CHOICE">چند گزینه‌ای</option>
                  <option value="TRUE_FALSE">درست/نادرست</option>
                  <option value="SHORT_ANSWER">پاسخ کوتاه</option>
                  <option value="ESSAY">تشریحی</option>
                </select>
              </div>
            </div>
            <div class="col-md-3">
              <div class="mb-3">
                <label for="lessonFilter" class="form-label">درس</label>
                <select class="form-select" id="lessonFilter" v-model="lessonFilter" @change="filterQuestions">
                  <option value="all">همه</option>
                  <option v-for="lesson in availableLessons" :key="lesson.id" :value="lesson.id">
                    {{ lesson.title }}
                  </option>
                </select>
              </div>
            </div>
            <div class="col-md-2 d-flex align-items-end">
              <button class="btn btn-secondary w-100" @click="resetFilters">
                <i class="fas fa-redo me-1"></i> بازنشانی
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- بخش اصلی نمایش سوالات -->
      <loading-spinner :loading="loading">
        <div v-if="error" class="alert alert-danger">
          {{ error }}
        </div>

        <empty-state
            v-else-if="filteredQuestions.length === 0"
            title="سوالی یافت نشد"
            description="هیچ سوالی با معیارهای جستجو یافت نشد یا هنوز سوالی در بانک سوالات ذخیره نشده است."
            icon="question-circle"
        >
          <button class="btn btn-primary mt-3" @click="showAddQuestionModal">
            <i class="fas fa-plus me-1"></i> افزودن سوال جدید
          </button>
        </empty-state>

        <div v-else>
          <!-- نمایش سوالات -->
          <div class="mb-4">
            <div class="table-responsive">
              <table class="table table-hover">
                <thead class="table-light">
                <tr>
                  <th style="width: 50px">#</th>
                  <th>متن سوال</th>
                  <th style="width: 120px">نوع</th>
                  <th style="width: 140px">درس</th>
                  <th style="width: 150px">عملیات</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="(question, index) in paginatedQuestions" :key="question.id">
                  <td>{{ (currentPage - 1) * itemsPerPage + index + 1 }}</td>
                  <td>
                    <div class="question-text-preview">{{ question.text }}</div>
                  </td>
                  <td>
                    <span class="badge" :class="getQuestionTypeBadgeClass(question.type)">
                      {{ getQuestionTypeText(question.type) }}
                    </span>
                  </td>
                  <td>{{ getQuestionLessonName(question) }}</td>
                  <td>
                    <div class="d-flex gap-1">
                      <button class="btn btn-sm btn-outline-info" @click="viewQuestion(question)">
                        <i class="fas fa-eye"></i>
                      </button>
                      <button class="btn btn-sm btn-outline-primary" @click="editQuestion(question)">
                        <i class="fas fa-edit"></i>
                      </button>
                      <button class="btn btn-sm btn-outline-success" @click="useInExam(question)">
                        <i class="fas fa-copy"></i>
                      </button>
                      <button class="btn btn-sm btn-outline-danger" @click="confirmDeleteQuestion(question)">
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Pagination -->
          <pagination
              v-if="totalPages > 1"
              :current-page="currentPage"
              :total-pages="totalPages"
              @page-changed="changePage"
          />
        </div>
      </loading-spinner>
    </div>

    <!-- Modal: افزودن/ویرایش سوال -->
    <base-modal
        modal-id="questionModal"
        :title="isEditingQuestion ? 'ویرایش سوال' : 'افزودن سوال جدید'"
        modal-size="modal-lg"
        ref="questionModal"
    >
      <question-form
          :question-data="currentQuestion"
          :is-editing="isEditingQuestion"
          :is-submitting="isSubmitting"
          @save="saveQuestion"
          @cancel="$refs.questionModal.hide()"
      />
    </base-modal>

    <!-- Modal: مشاهده سوال -->
    <base-modal
        modal-id="viewQuestionModal"
        title="مشاهده سوال"
        modal-size="modal-lg"
        ref="viewQuestionModal"
    >
      <div v-if="selectedQuestion">
        <div class="question-view">
          <div class="question-header mb-3 pb-2 border-bottom">
            <h5>{{ selectedQuestion.text }}</h5>
            <div class="d-flex justify-content-between">
              <div>
                <span class="badge me-2" :class="getQuestionTypeBadgeClass(selectedQuestion.type)">
                  {{ getQuestionTypeText(selectedQuestion.type) }}
                </span>
                <span class="text-muted">درس: {{ getQuestionLessonName(selectedQuestion) }}</span>
              </div>
              <div>
                <span class="badge bg-info">{{ selectedQuestion.points || 10 }} امتیاز</span>
              </div>
            </div>
          </div>

          <!-- نمایش گزینه‌ها برای سوال چند گزینه‌ای -->
          <div v-if="selectedQuestion.type === 'MULTIPLE_CHOICE' && selectedQuestion.options" class="options-list mt-3">
            <div v-for="(option, optIndex) in selectedQuestion.options" :key="optIndex" class="option-item mb-2">
              <div class="form-check">
                <input class="form-check-input" type="radio" :checked="selectedQuestion.correctOption == optIndex" disabled>
                <label class="form-check-label" :class="{'text-success fw-bold': selectedQuestion.correctOption == optIndex}">
                  {{ option }}
                  <span v-if="selectedQuestion.correctOption == optIndex" class="badge bg-success ms-2">پاسخ صحیح</span>
                </label>
              </div>
            </div>
          </div>

          <!-- نمایش پاسخ درست/نادرست -->
          <div v-else-if="selectedQuestion.type === 'TRUE_FALSE'" class="mt-3">
            <div class="form-check mb-2">
              <input class="form-check-input" type="radio" :checked="selectedQuestion.correctOption === 'true'" disabled>
              <label class="form-check-label" :class="{'text-success fw-bold': selectedQuestion.correctOption === 'true'}">
                درست
                <span v-if="selectedQuestion.correctOption === 'true'" class="badge bg-success ms-2">پاسخ صحیح</span>
              </label>
            </div>
            <div class="form-check">
              <input class="form-check-input" type="radio" :checked="selectedQuestion.correctOption === 'false'" disabled>
              <label class="form-check-label" :class="{'text-success fw-bold': selectedQuestion.correctOption === 'false'}">
                نادرست
                <span v-if="selectedQuestion.correctOption === 'false'" class="badge bg-success ms-2">پاسخ صحیح</span>
              </label>
            </div>
          </div>

          <!-- نمایش پاسخ کوتاه -->
          <div v-else-if="selectedQuestion.type === 'SHORT_ANSWER'" class="mt-3">
            <div class="input-group">
              <span class="input-group-text">پاسخ صحیح:</span>
              <input type="text" class="form-control" :value="selectedQuestion.correctOption" disabled>
            </div>
          </div>

          <!-- نمایش اطلاعات سوال تشریحی -->
          <div v-else-if="selectedQuestion.type === 'ESSAY'" class="mt-3 p-3 border rounded">
            <div class="d-flex justify-content-between align-items-center">
              <span>سوال تشریحی - نیاز به بررسی استاد</span>
              <span class="badge bg-info">{{ selectedQuestion.maxScore || 10 }} نمره</span>
            </div>
          </div>

          <!-- نمایش توضیحات اضافی -->
          <div v-if="selectedQuestion.explanation" class="explanation mt-4 p-3 bg-light rounded">
            <h6>توضیحات تکمیلی:</h6>
            <p class="mb-0">{{ selectedQuestion.explanation }}</p>
          </div>

          <div class="text-end mt-4">
            <button class="btn btn-primary" @click="editQuestion(selectedQuestion)">
              <i class="fas fa-edit me-1"></i> ویرایش
            </button>
            <button class="btn btn-success ms-2" @click="useInExam(selectedQuestion)">
              <i class="fas fa-copy me-1"></i> استفاده در آزمون
            </button>
            <button class="btn btn-outline-secondary ms-2" @click="$refs.viewQuestionModal.hide()">
              بستن
            </button>
          </div>
        </div>
      </div>
    </base-modal>

    <!-- Modal: استفاده از سوال در آزمون -->
    <base-modal
        modal-id="useInExamModal"
        title="استفاده از سوال در آزمون"
        ref="useInExamModal"
    >
      <div v-if="selectedQuestion">
        <div class="mb-3">
          <label for="examSelect" class="form-label">انتخاب آزمون:</label>
          <select class="form-select" id="examSelect" v-model="selectedExamId">
            <option v-for="exam in availableExams" :key="exam.id" :value="exam.id">
              {{ exam.title }} ({{ exam.lesson ? exam.lesson.title : 'نامشخص' }})
            </option>
          </select>
        </div>
        <div class="text-end">
          <button class="btn btn-outline-secondary me-2" @click="$refs.useInExamModal.hide()">انصراف</button>
          <button
              class="btn btn-primary"
              :disabled="!selectedExamId || isSubmitting"
              @click="addQuestionToExam"
          >
            <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2" role="status"></span>
            افزودن به آزمون
          </button>
        </div>
      </div>
    </base-modal>

    <!-- Modal: تأیید حذف سوال -->
    <confirmation-dialog
        modal-id="deleteQuestionModal"
        title="حذف سوال"
        :message="'آیا از حذف این سوال از بانک سوالات اطمینان دارید؟ این عمل قابل بازگشت نیست.'"
        :details="selectedQuestion ? selectedQuestion.text : ''"
        confirm-text="حذف سوال"
        confirm-button-type="danger"
        icon="trash-alt"
        ref="deleteConfirmDialog"
        @confirm="deleteQuestion"
    />
  </div>
</template>

<script>
import axios from 'axios';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import Pagination from '@/components/common/Pagination.vue';
import BaseModal from '@/components/common/BaseModal.vue';
import ConfirmationDialog from '@/components/common/ConfirmationDialog.vue';
import QuestionForm from '@/components/exams/QuestionForm.vue';
import { useFormatters } from '@/composables/useFormatters.js';
import formMixin from '@/mixins/formMixin.js';

export default {
  name: 'QuestionBank',
  components: {
    LoadingSpinner,
    EmptyState,
    Pagination,
    BaseModal,
    ConfirmationDialog,
    QuestionForm
  },
  mixins: [formMixin],
  setup() {
    const { formatDate } = useFormatters();

    return {
      formatDate
    };
  },
  data() {
    return {
      loading: true,
      error: null,
      questions: [],
      availableLessons: [],
      availableExams: [],

      // فیلترها و جستجو
      searchQuery: '',
      typeFilter: 'all',
      lessonFilter: 'all',

      // پاگینیشن
      currentPage: 1,
      itemsPerPage: 10,

      // مدیریت سوال
      currentQuestion: {},
      selectedQuestion: null,
      isEditingQuestion: false,
      isSubmitting: false,

      // برای استفاده در آزمون
      selectedExamId: null,
      returnToExam: false,
      returnExamId: null
    };
  },
  computed: {
    filteredQuestions() {
      let result = [...this.questions];

      // اعمال فیلتر جستجو
      if (this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase().trim();
        result = result.filter(question =>
            question.text.toLowerCase().includes(query) ||
            (question.explanation && question.explanation.toLowerCase().includes(query))
        );
      }

      // اعمال فیلتر نوع سوال
      if (this.typeFilter !== 'all') {
        result = result.filter(question => question.type === this.typeFilter);
      }

      // اعمال فیلتر درس
      if (this.lessonFilter !== 'all') {
        result = result.filter(question =>
            question.lessonId === this.lessonFilter ||
            (question.lesson && question.lesson.id === this.lessonFilter)
        );
      }

      return result;
    },
    paginatedQuestions() {
      const startIndex = (this.currentPage - 1) * this.itemsPerPage;
      const endIndex = startIndex + this.itemsPerPage;
      return this.filteredQuestions.slice(startIndex, endIndex);
    },
    totalPages() {
      return Math.ceil(this.filteredQuestions.length / this.itemsPerPage);
    }
  },
  async created() {
    // Check if we were redirected from an exam creator
    if (this.$route.query.returnTo === 'ExamCreator' && this.$route.query.examId) {
      this.returnToExam = true;
      this.returnExamId = this.$route.query.examId;
    }

    await this.fetchData();
  },
  methods: {
    async fetchData() {
      try {
        this.loading = true;

        // دریافت لیست سوالات بانک سوالات
        const questionsResponse = await axios.get('/questions/bank');
        this.questions = questionsResponse.data;

        // دریافت لیست درس‌ها
        const lessonsResponse = await axios.get('/lessons/teaching');
        this.availableLessons = lessonsResponse.data;

        // دریافت لیست آزمون‌ها
        const examsResponse = await axios.get('/exams/teaching');
        this.availableExams = examsResponse.data;

        this.loading = false;
      } catch (error) {
        console.error('Error fetching question bank data:', error);
        this.error = 'مشکلی در دریافت اطلاعات بانک سوالات رخ داد. لطفاً دوباره تلاش کنید.';
        this.loading = false;
      }
    },

    getQuestionTypeBadgeClass(type) {
      switch (type) {
        case 'MULTIPLE_CHOICE':
          return 'bg-primary';
        case 'TRUE_FALSE':
          return 'bg-success';
        case 'SHORT_ANSWER':
          return 'bg-info';
        case 'ESSAY':
          return 'bg-warning';
        default:
          return 'bg-secondary';
      }
    },

    getQuestionTypeText(type) {
      switch (type) {
        case 'MULTIPLE_CHOICE':
          return 'چند گزینه‌ای';
        case 'TRUE_FALSE':
          return 'درست/نادرست';
        case 'SHORT_ANSWER':
          return 'پاسخ کوتاه';
        case 'ESSAY':
          return 'تشریحی';
        default:
          return 'نامشخص';
      }
    },

    getQuestionLessonName(question) {
      if (question.lesson) {
        return question.lesson.title;
      } else if (question.lessonId) {
        const lesson = this.availableLessons.find(l => l.id === question.lessonId);
        return lesson ? lesson.title : 'نامشخص';
      }
      return 'نامشخص';
    },

    showAddQuestionModal() {
      this.isEditingQuestion = false;
      this.currentQuestion = {
        text: '',
        type: 'MULTIPLE_CHOICE',
        options: ['', '', '', ''],
        correctOption: 0,
        explanation: '',
        points: 10,
        lessonId: ''
      };
      this.$refs.questionModal.show();
    },

    editQuestion(question) {
      this.isEditingQuestion = true;
      this.selectedQuestion = question;

      // کپی اطلاعات سوال
      this.currentQuestion = { ...question };

      // بررسی آرایه گزینه‌ها برای سوال چندگزینه‌ای
      if (question.type === 'MULTIPLE_CHOICE' && (!question.options || !Array.isArray(question.options))) {
        this.currentQuestion.options = ['', '', '', ''];
        this.currentQuestion.correctOption = 0;
      }

      // بستن مودال نمایش سوال اگر باز است
      if (this.$refs.viewQuestionModal && this.$refs.viewQuestionModal.$el.classList.contains('show')) {
        this.$refs.viewQuestionModal.hide();
      }

      this.$refs.questionModal.show();
    },

    viewQuestion(question) {
      this.selectedQuestion = question;
      this.$refs.viewQuestionModal.show();
    },

    useInExam(question) {
      this.selectedQuestion = question;
      this.selectedExamId = this.availableExams.length > 0 ? this.availableExams[0].id : null;

      // بستن مودال نمایش سوال اگر باز است
      if (this.$refs.viewQuestionModal && this.$refs.viewQuestionModal.$el.classList.contains('show')) {
        this.$refs.viewQuestionModal.hide();
      }

      this.$refs.useInExamModal.show();
    },

    async addQuestionToExam() {
      if (!this.selectedExamId || !this.selectedQuestion) return;

      this.isSubmitting = true;

      try {
        // کلون کردن سوال به آزمون انتخاب شده
        await axios.post(`/exams/${this.selectedExamId}/questions/clone/${this.selectedQuestion.id}`);

        this.showSuccessToast('سوال با موفقیت به آزمون اضافه شد.');
        this.$refs.useInExamModal.hide();
      } catch (error) {
        console.error('Error adding question to exam:', error);
        this.showErrorToast('مشکلی در افزودن سوال به آزمون رخ داد. لطفاً دوباره تلاش کنید.');
      } finally {
        this.isSubmitting = false;
      }
    },

    confirmDeleteQuestion(question) {
      this.selectedQuestion = question;
      this.$refs.deleteConfirmDialog.show();
    },

    async deleteQuestion() {
      if (!this.selectedQuestion) return;

      this.isSubmitting = true;

      try {
        await axios.delete(`/questions/bank/${this.selectedQuestion.id}`);

        // حذف سوال از لیست
        this.questions = this.questions.filter(q => q.id !== this.selectedQuestion.id);

        this.showSuccessToast('سوال با موفقیت از بانک سوالات حذف شد.');
      } catch (error) {
        console.error('Error deleting question:', error);
        this.showErrorToast('مشکلی در حذف سوال رخ داد. لطفاً دوباره تلاش کنید.');
      } finally {
        this.isSubmitting = false;
      }
    },

    async saveQuestion() {
      this.isSubmitting = true;

      try {
        let response;
        const questionData = {
          ...this.currentQuestion,
          bankQuestion: true // علامت‌گذاری به عنوان سوال بانک سوالات
        };

        if (this.isEditingQuestion) {
          // ویرایش سوال موجود
          response = await axios.put(`/questions/bank/${this.currentQuestion.id}`, questionData);

          // به‌روزرسانی سوال در لیست
          const index = this.questions.findIndex(q => q.id === this.currentQuestion.id);
          if (index !== -1) {
            this.questions[index] = response.data;
          }

          this.showSuccessToast('سوال با موفقیت به‌روزرسانی شد.');
        } else {
          // افزودن سوال جدید
          response = await axios.post('/questions/bank', questionData);

          // افزودن سوال جدید به لیست
          this.questions.unshift(response.data);

          this.showSuccessToast('سوال جدید با موفقیت به بانک سوالات افزوده شد.');
        }

        // بستن مودال
        this.$refs.questionModal.hide();
      } catch (error) {
        console.error('Error saving question:', error);
        this.showErrorToast('مشکلی در ذخیره سوال رخ داد. لطفاً دوباره تلاش کنید.');
      } finally {
        this.isSubmitting = false;
      }
    },

    filterQuestions() {
      this.currentPage = 1;
    },

    resetFilters() {
      this.searchQuery = '';
      this.typeFilter = 'all';
      this.lessonFilter = 'all';
      this.currentPage = 1;
    },

    changePage(page) {
      this.currentPage = page;
      window.scrollTo(0, 0);
    },

    goBack() {
      if (this.returnToExam && this.returnExamId) {
        this.$router.push({
          name: 'ExamCreator',
          params: { id: this.returnExamId }
        });
      } else {
        this.$router.go(-1);
      }
    }
  }
}
</script>

<style scoped>
.question-bank-container {
  min-height: calc(100vh - 56px);
}

.question-text-preview {
  max-width: 500px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.question-view {
  padding: 10px;
}

.option-item {
  background-color: #f8f9fa;
  border-radius: 5px;
  padding: 10px 15px;
}

.badge {
  padding: 0.5em 0.8em;
}
</style>