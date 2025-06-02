<template>
  <div class="modern-page-bg secondary-gradient">
    <div class="modern-container large animate-slide-up">
      <div class="modern-header">
        <div class="modern-logo secondary">
          <i class="fas fa-database"></i>
        </div>
        <h1 class="modern-title">بانک سوالات</h1>
        <p class="modern-subtitle">مدیریت و سازماندهی مجموعه سوالات آزمون‌ها</p>
      </div>

      <div class="d-flex justify-content-between align-items-center mb-4">
        <button class="modern-btn modern-btn-success" @click="showAddQuestionModal">
          <i class="fas fa-plus me-1"></i> افزودن سوال جدید
        </button>
        <button class="modern-btn modern-btn-secondary" @click="goBack">
          <i class="fas fa-arrow-right me-1"></i> بازگشت
        </button>
      </div>

      <!-- فیلترها و جستجو -->
      <div class="form-section">
        <h6 class="section-title">
          <i class="fas fa-filter me-2"></i>
          فیلتر و جستجو
        </h6>

        <div class="row">
          <div class="col-md-4 modern-form-group">
            <label class="modern-form-label">جستجو در متن سوالات</label>
            <div class="search-input-group">
              <input
                  type="text"
                  class="modern-form-control"
                  v-model="searchQuery"
                  placeholder="جستجو در سوالات..."
                  @input="filterQuestions"
              >
              <button class="search-btn" @click="filterQuestions">
                <i class="fas fa-search"></i>
              </button>
            </div>
          </div>
          <div class="col-md-3 modern-form-group">
            <label class="modern-form-label">نوع سوال</label>
            <select class="modern-form-control" v-model="typeFilter" @change="filterQuestions">
              <option value="all">همه انواع</option>
              <option value="MULTIPLE_CHOICE">چند گزینه‌ای</option>
              <option value="TRUE_FALSE">درست/نادرست</option>
              <option value="SHORT_ANSWER">پاسخ کوتاه</option>
              <option value="ESSAY">تشریحی</option>
            </select>
          </div>
          <div class="col-md-3 modern-form-group">
            <label class="modern-form-label">درس</label>
            <select class="modern-form-control" v-model="lessonFilter" @change="filterQuestions">
              <option value="all">همه دروس</option>
              <option v-for="lesson in availableLessons" :key="lesson.id" :value="lesson.id">
                {{ lesson.title }}
              </option>
            </select>
          </div>
          <div class="col-md-2 d-flex align-items-end modern-form-group">
            <button class="modern-btn modern-btn-secondary w-100" @click="resetFilters">
              <i class="fas fa-redo me-1"></i> بازنشانی
            </button>
          </div>
        </div>
      </div>

      <loading-spinner :loading="loading">
        <div v-if="error" class="modern-alert modern-alert-danger">
          <i class="fas fa-exclamation-circle me-2"></i>
          {{ error }}
        </div>

        <!-- لیست سوالات -->
        <div v-if="filteredQuestions.length > 0" class="questions-section">
          <div class="questions-grid">
            <div v-for="(question, index) in paginatedQuestions" :key="question.id"
                 class="question-card modern-card animate-fade-in">
              <div class="question-header">
                <div class="question-number">
                  <span class="number-badge">{{ (currentPage - 1) * itemsPerPage + index + 1 }}</span>
                </div>
                <div class="question-type">
                  <span class="modern-badge" :class="getQuestionTypeBadgeClass(question.questionType)">
                    {{ getQuestionTypeText(question.questionType) }}
                  </span>
                </div>
              </div>

              <div class="question-content">
                <h6 class="question-text">{{ question.text }}</h6>
                <div class="question-meta">
                  <div class="meta-item">
                    <i class="fas fa-book text-primary me-1"></i>
                    <span>{{ getQuestionLessonName(question) }}</span>
                  </div>
                  <div class="meta-item" v-if="question.points">
                    <i class="fas fa-star text-warning me-1"></i>
                    <span>{{ question.points }} امتیاز</span>
                  </div>
                  <div class="meta-item" v-if="question.difficulty">
                    <i class="fas fa-tachometer-alt text-info me-1"></i>
                    <span>سطح {{ question.difficulty }}</span>
                  </div>
                </div>
              </div>

              <div class="question-actions">
                <button class="action-btn primary" @click="viewQuestion(question)" title="مشاهده جزئیات">
                  <i class="fas fa-eye"></i>
                </button>
                <button class="action-btn success" @click="editQuestion(question)" title="ویرایش">
                  <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn info" @click="useInExam(question)" title="استفاده در آزمون">
                  <i class="fas fa-copy"></i>
                </button>
                <button class="action-btn danger" @click="confirmDeleteQuestion(question)" title="حذف">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
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

        <!-- حالت خالی -->
        <div v-else class="empty-state">
          <div class="modern-logo large secondary mb-4">
            <i class="fas fa-question-circle"></i>
          </div>
          <h4 class="text-muted mb-3">سوالی یافت نشد</h4>
          <p class="text-muted mb-4">
            هیچ سوالی با معیارهای جستجو یافت نشد یا هنوز سوالی در بانک سوالات ذخیره نشده است
          </p>
          <div class="d-flex justify-content-center gap-2">
            <button class="modern-btn modern-btn-primary" @click="showAddQuestionModal">
              <i class="fas fa-plus me-1"></i> افزودن سوال جدید
            </button>
            <button class="modern-btn modern-btn-secondary" @click="resetFilters">
              <i class="fas fa-refresh me-1"></i> بازنشانی فیلتر
            </button>
          </div>
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
      <div v-if="selectedQuestion" class="question-view">
        <div class="question-view-header">
          <h5>{{ selectedQuestion.text }}</h5>
          <div class="question-view-meta">
            <span class="modern-badge" :class="getQuestionTypeBadgeClass(selectedquestion.questionType)">
              {{ getQuestionTypeText(selectedquestion.questionType) }}
            </span>
            <span class="modern-badge modern-badge-info">{{ selectedQuestion.points || 10 }} امتیاز</span>
          </div>
        </div>

        <!-- نمایش گزینه‌ها -->
        <div v-if="selectedquestion.questionType === 'MULTIPLE_CHOICE' && selectedQuestion.options" class="options-display">
          <h6>گزینه‌ها:</h6>
          <div v-for="(option, optIndex) in selectedQuestion.options" :key="optIndex" class="option-display-item">
            <span class="option-letter">{{ String.fromCharCode(65 + optIndex) }}</span>
            <span class="option-text" :class="{ 'correct': selectedQuestion.correctOption == optIndex }">
              {{ option }}
            </span>
            <span v-if="selectedQuestion.correctOption == optIndex" class="correct-indicator">
              <i class="fas fa-check text-success"></i>
            </span>
          </div>
        </div>

        <!-- سایر انواع سوال -->
        <div v-else-if="selectedquestion.questionType === 'TRUE_FALSE'" class="answer-display">
          <h6>پاسخ صحیح:</h6>
          <span class="modern-badge modern-badge-success">
            {{ selectedQuestion.correctOption === 'true' ? 'درست' : 'نادرست' }}
          </span>
        </div>

        <div v-else-if="selectedquestion.questionType === 'SHORT_ANSWER'" class="answer-display">
          <h6>پاسخ صحیح:</h6>
          <div class="answer-text">{{ selectedQuestion.correctOption }}</div>
        </div>

        <div v-else-if="selectedquestion.questionType === 'ESSAY'" class="essay-display">
          <div class="essay-info">
            <i class="fas fa-edit text-warning me-2"></i>
            سوال تشریحی - نیاز به بررسی استاد
            <span class="modern-badge modern-badge-info ms-2">{{ selectedQuestion.maxScore || 10 }} نمره</span>
          </div>
        </div>

        <!-- توضیحات اضافی -->
        <div v-if="selectedQuestion.explanation" class="explanation-display">
          <h6>توضیحات تکمیلی:</h6>
          <div class="explanation-text">{{ selectedQuestion.explanation }}</div>
        </div>

        <div class="text-end mt-4">
          <button class="modern-btn modern-btn-primary me-2" @click="editQuestion(selectedQuestion)">
            <i class="fas fa-edit me-1"></i> ویرایش
          </button>
          <button class="modern-btn modern-btn-success me-2" @click="useInExam(selectedQuestion)">
            <i class="fas fa-copy me-1"></i> استفاده در آزمون
          </button>
          <button class="modern-btn modern-btn-secondary" @click="$refs.viewQuestionModal.hide()">
            بستن
          </button>
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
        <div class="modern-form-group">
          <label class="modern-form-label">انتخاب آزمون:</label>
          <select class="modern-form-control" v-model="selectedExamId">
            <option value="">آزمون مورد نظر را انتخاب کنید</option>
            <option v-for="exam in availableExams" :key="exam.id" :value="exam.id">
              {{ exam.title }} ({{ exam.lesson ? exam.lesson.title : 'نامشخص' }})
            </option>
          </select>
        </div>
        <div class="text-end">
          <button class="modern-btn modern-btn-secondary me-2" @click="$refs.useInExamModal.hide()">انصراف</button>
          <button
              class="modern-btn modern-btn-primary"
              :disabled="!selectedExamId || isSubmitting"
              @click="addQuestionToExam"
          >
            <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2" role="status"></span>
            <i class="fas fa-plus me-1"></i>
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
    Pagination,
    BaseModal,
    ConfirmationDialog,
    QuestionForm
  },
  mixins: [formMixin],
  setup() {
    const { formatDate } = useFormatters();
    return { formatDate };
  },
  data() {
    return {
      loading: true,
      error: null,
      questions: [],
      availableLessons: [],
      availableExams: [],

      searchQuery: '',
      typeFilter: 'all',
      lessonFilter: 'all',

      currentPage: 1,
      itemsPerPage: 6,

      currentQuestion: {},
      selectedQuestion: null,
      isEditingQuestion: false,

      selectedExamId: null,
      returnToExam: false,
      returnExamId: null
    };
  },
  computed: {
    filteredQuestions() {
      let result = [...this.questions];

      if (this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase().trim();
        result = result.filter(question =>
            question.text.toLowerCase().includes(query) ||
            (question.explanation && question.explanation.toLowerCase().includes(query))
        );
      }

      if (this.typeFilter !== 'all') {
        result = result.filter(question => question.questionType === this.typeFilter);
      }

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
        this.questions = this.generateMockQuestions();
        this.availableLessons = this.generateMockLessons();
        this.availableExams = this.generateMockExams();
        this.loading = false;
      } catch (error) {
        console.error('Error fetching question bank data:', error);
        this.error = 'مشکلی در دریافت اطلاعات بانک سوالات رخ داد. لطفاً دوباره تلاش کنید.';
        this.loading = false;
      }
    },

    generateMockQuestions() {
      return Array.from({ length: 15 }, (_, i) => {
        const types = ['MULTIPLE_CHOICE', 'TRUE_FALSE', 'SHORT_ANSWER', 'ESSAY'];
        const type = types[i % types.length];

        return {
          id: i + 1,
          text: `سوال نمونه شماره ${i + 1} برای بانک سوالات`,
          type,
          points: Math.floor(Math.random() * 10) + 5,
          difficulty: Math.floor(Math.random() * 5) + 1,
          explanation: `توضیحات تکمیلی برای سوال ${i + 1}`,
          lessonId: Math.floor(Math.random() * 3) + 1,
          lesson: { id: Math.floor(Math.random() * 3) + 1, title: `درس ${Math.floor(Math.random() * 3) + 1}` },
          options: type === 'MULTIPLE_CHOICE' ? ['گزینه ۱', 'گزینه ۲', 'گزینه ۳', 'گزینه ۴'] : null,
          correctOption: type === 'MULTIPLE_CHOICE' ? 0 : (type === 'TRUE_FALSE' ? 'true' : 'پاسخ صحیح')
        };
      });
    },

    generateMockLessons() {
      return Array.from({ length: 5 }, (_, i) => ({
        id: i + 1,
        title: `درس ${i + 1}`
      }));
    },

    generateMockExams() {
      return Array.from({ length: 3 }, (_, i) => ({
        id: i + 1,
        title: `آزمون ${i + 1}`,
        lesson: { title: `درس ${i + 1}` }
      }));
    },

    getQuestionTypeBadgeClass(type) {
      switch (type) {
        case 'MULTIPLE_CHOICE':
          return 'modern-badge-primary';
        case 'TRUE_FALSE':
          return 'modern-badge-success';
        case 'SHORT_ANSWER':
          return 'modern-badge-info';
        case 'ESSAY':
          return 'modern-badge-warning';
        default:
          return 'modern-badge-secondary';
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
      this.currentQuestion = { ...question };

      if (question.questionType === 'MULTIPLE_CHOICE' && (!question.options || !Array.isArray(question.options))) {
        this.currentQuestion.options = ['', '', '', ''];
        this.currentQuestion.correctOption = 0;
      }

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

      if (this.$refs.viewQuestionModal && this.$refs.viewQuestionModal.$el.classList.contains('show')) {
        this.$refs.viewQuestionModal.hide();
      }

      this.$refs.useInExamModal.show();
    },

    async addQuestionToExam() {
      if (!this.selectedExamId || !this.selectedQuestion) return;

      this.startSubmitting();
      try {
        this.showSuccessToast('سوال با موفقیت به آزمون اضافه شد.');
        this.$refs.useInExamModal.hide();
      } catch (error) {
        console.error('Error adding question to exam:', error);
        this.showErrorToast('مشکلی در افزودن سوال به آزمون رخ داد. لطفاً دوباره تلاش کنید.');
      } finally {
        this.finishSubmitting();
      }
    },

    confirmDeleteQuestion(question) {
      this.selectedQuestion = question;
      this.$refs.deleteConfirmDialog.show();
    },

    async deleteQuestion() {
      if (!this.selectedQuestion) return;

      this.startSubmitting();
      try {
        this.questions = this.questions.filter(q => q.id !== this.selectedQuestion.id);
        this.showSuccessToast('سوال با موفقیت از بانک سوالات حذف شد.');
      } catch (error) {
        console.error('Error deleting question:', error);
        this.showErrorToast('مشکلی در حذف سوال رخ داد. لطفاً دوباره تلاش کنید.');
      } finally {
        this.finishSubmitting();
      }
    },

    async saveQuestion() {
      this.startSubmitting();
      try {
        if (this.isEditingQuestion) {
          const index = this.questions.findIndex(q => q.id === this.currentQuestion.id);
          if (index !== -1) {
            this.questions[index] = { ...this.currentQuestion };
          }
          this.showSuccessToast('سوال با موفقیت به‌روزرسانی شد.');
        } else {
          const newQuestion = {
            ...this.currentQuestion,
            id: this.questions.length + 1
          };
          this.questions.unshift(newQuestion);
          this.showSuccessToast('سوال جدید با موفقیت به بانک سوالات افزوده شد.');
        }
        this.$refs.questionModal.hide();
      } catch (error) {
        console.error('Error saving question:', error);
        this.showErrorToast('مشکلی در ذخیره سوال رخ داد. لطفاً دوباره تلاش کنید.');
      } finally {
        this.finishSubmitting();
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
.search-input-group {
  display: flex;
  align-items: center;
  position: relative;
}

.search-btn {
  position: absolute;
  left: 10px;
  background: none;
  border: none;
  color: #667eea;
  cursor: pointer;
  padding: 0.5rem;
}

.questions-section {
  margin-top: 2rem;
}

.questions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.question-card {
  border: 1px solid rgba(102, 126, 234, 0.1);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
}

.question-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.15);
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.number-badge {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.9rem;
}

.question-content {
  flex: 1;
  margin-bottom: 1.5rem;
}

.question-text {
  font-weight: 600;
  color: #333;
  line-height: 1.5;
  margin-bottom: 1rem;
}

.question-meta {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.meta-item {
  display: flex;
  align-items: center;
  font-size: 0.85rem;
  color: #6c757d;
}

.question-actions {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: auto;
}

.action-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
}

.action-btn.primary {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
}

.action-btn.success {
  background: rgba(40, 167, 69, 0.1);
  color: #28a745;
}

.action-btn.info {
  background: rgba(23, 162, 184, 0.1);
  color: #17a2b8;
}

.action-btn.danger {
  background: rgba(220, 53, 69, 0.1);
  color: #dc3545;
}

.action-btn:hover {
  transform: scale(1.1);
}

.question-view {
  padding: 1rem;
}

.question-view-header {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(102, 126, 234, 0.1);
}

.question-view-meta {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.options-display, .answer-display, .essay-display, .explanation-display {
  background: rgba(248, 249, 250, 0.5);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.option-display-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  margin-bottom: 0.5rem;
}

.option-letter {
  width: 24px;
  height: 24px;
  background: #f8f9fa;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.8rem;
}

.option-text.correct {
  color: #28a745;
  font-weight: 600;
}

.answer-text, .explanation-text {
  background: white;
  padding: 1rem;
  border-radius: 6px;
  border: 1px solid #e9ecef;
  font-weight: 500;
}

.essay-info {
  display: flex;
  align-items: center;
  background: white;
  padding: 1rem;
  border-radius: 6px;
  border: 1px solid #e9ecef;
  gap: 0.5rem;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
}

@media (max-width: 768px) {
  .questions-grid {
    grid-template-columns: 1fr;
  }

  .question-meta {
    align-items: flex-start;
  }

  .meta-item {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>