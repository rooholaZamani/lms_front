<template>
  <div class="modern-page-bg primary-gradient">
    <div class="modern-container large animate-slide-up">
      <loading-spinner :loading="loading">
        <!-- Header -->
        <div class="modern-header">
          <div class="modern-logo primary">
            <i class="fas fa-clipboard-list"></i>
          </div>
          <h1 class="modern-title">{{ isEditMode ? 'ویرایش آزمون' : 'ایجاد آزمون جدید' }}</h1>
          <div class="d-flex justify-content-center">
            <button class="modern-btn modern-btn-outline text-white" @click="goBack">
              <i class="fas fa-arrow-right me-2"></i>
              بازگشت
            </button>
          </div>
        </div>

        <!-- فرم اطلاعات پایه آزمون -->
        <div class="modern-card animate-fade-in" style="animation-delay: 0.1s;">
          <exam-info-form
              :exam-data="examData"
              :available-lessons="availableLessons"
              :is-submitting="isInfoSubmitting"
              @save-exam-info="saveExamInfo"
          />
        </div>

        <!-- مدیریت سوالات -->
        <div v-if="examId" class="modern-card animate-fade-in" style="animation-delay: 0.2s;">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <h5 class="modern-title">
              <i class="fas fa-question-circle text-primary me-2"></i>
              سوالات آزمون
            </h5>
            <div class="d-flex gap-2 flex-wrap">
              <button class="modern-btn modern-btn-success" @click="showAddQuestionModal">
                <i class="fas fa-plus me-2"></i>
                افزودن سوال
              </button>
            </div>
          </div>

          <question-list
              :questions="questions"
              @add-question="showAddQuestionModal"
              @edit-question="editQuestion"
              @delete-question="confirmDeleteQuestion"
          />

          <div class="text-center mt-4">
            <button
                class="modern-btn modern-btn-success btn-lg"
                @click="finalizeExam"
                :disabled="questions.length === 0">
              <i class="fas fa-check me-2"></i>
              نهایی‌سازی آزمون
            </button>
          </div>
        </div>
      </loading-spinner>
    </div>

    <!-- Modal: افزودن/ویرایش سوال -->
    <div class="modal fade" id="questionModal" tabindex="-1" data-bs-backdrop="static" data-bs-keyboard="false">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ isEditingQuestion ? 'ویرایش سوال' : 'افزودن سوال جدید' }}</h5>
            <button type="button" class="btn-close" @click="hideQuestionModal"></button>
          </div>
          <div class="modal-body">
            <question-form
                :question-data="currentQuestion"
                :is-editing="isEditingQuestion"
                :is-submitting="isQuestionSubmitting"
                @save="saveQuestion"
                @cancel="hideQuestionModal"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: تأیید حذف سوال -->
    <confirmation-dialog
        modal-id="deleteQuestionModal"
        title="حذف سوال"
        :message="'آیا از حذف این سوال اطمینان دارید؟ این عمل قابل بازگشت نیست.'"
        :details="selectedQuestion?.text"
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
import BaseModal from '@/components/common/BaseModal.vue';
import ConfirmationDialog from '@/components/common/ConfirmationDialog.vue';
import ExamInfoForm from '@/components/exams/ExamInfoForm.vue';
import QuestionForm from '@/components/exams/QuestionForm.vue';
import QuestionList from '@/components/exams/QuestionList.vue';
import formMixin from '@/mixins/formMixin.js';

export default {
  name: 'ExamCreator',
  components: {
    LoadingSpinner,
    BaseModal,
    ConfirmationDialog,
    ExamInfoForm,
    QuestionForm,
    QuestionList
  },
  mixins: [formMixin],
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
      this.isEditMode = true;
      this.examId = this.id;
      await this.fetchExamData();
    } else {
      this.isEditMode = false;
      this.loading = false;

      if (this.lessonId) {
        this.examData.lessonId = this.lessonId;
      }
    }

    await this.fetchLessons();
  },
  methods: {
    async fetchExamData() {
      this.startSubmitting();

      try {
        const response = await axios.get(`/exams/${this.examId}`);
        const examData = response.data;

        this.examData = {
          title: examData.title,
          description: examData.description,
          duration: examData.duration,
          passingScore: examData.passingScore || 60,
          lessonId: examData.lesson ? examData.lesson.id : '',
          shuffleQuestions: examData.shuffleQuestions || false
        };

        await this.fetchExamQuestions();
        this.loading = false;
        this.finishSubmitting();
      } catch (error) {
        console.error('Error fetching exam data:', error);
        this.finishSubmitting(null, 'مشکلی در دریافت اطلاعات آزمون رخ داد. لطفاً دوباره تلاش کنید.');
        this.loading = false;
      }
    },
    hideQuestionModal() {
      const modal = bootstrap.Modal.getInstance(document.getElementById('questionModal'));
      if (modal) {
        modal.hide();
      }
    },

    async fetchExamQuestions() {
      try {
        const response = await axios.get(`/exams/${this.examId}/questions`);
        this.questions = response.data;
      } catch (error) {
        console.error('Error fetching exam questions:', error);
        this.showErrorToast('مشکلی در دریافت سوالات آزمون رخ داد.');
      }
    },

    async fetchLessons() {
      try {
        const response = await axios.get('/lessons/teaching');
        this.availableLessons = response.data;
      } catch (error) {
        console.error('Error fetching lessons:', error);
        this.showErrorToast('مشکلی در دریافت لیست درس‌ها رخ داد.');
      }
    },

    goBack() {
      this.$router.go(-1);
    },

    async saveExamInfo() {
      this.isInfoSubmitting = true;

      try {
        let response;

        if (this.isEditMode) {
          response = await axios.put(`/exams/${this.examId}`, this.examData);
        } else {
          response = await axios.post(`/exams/lesson/${this.examData.lessonId}`, this.examData);
          this.examId = response.data.id;
          this.isEditMode = true;
        }

        this.showSuccessToast('اطلاعات آزمون با موفقیت ذخیره شد.');
      } catch (error) {
        console.error('Error saving exam info:', error);
        this.showErrorToast('مشکلی در ذخیره اطلاعات آزمون رخ داد. لطفاً دوباره تلاش کنید.');
      } finally {
        this.isInfoSubmitting = false;
      }
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
        hint: '',
        timeLimit: null,
        difficulty: 3.0,
        isRequired: false
      };

      const modal = new bootstrap.Modal(document.getElementById('questionModal'));
      modal.show();
    },

    editQuestion(question) {
      this.isEditingQuestion = true;
      this.selectedQuestionId = question.id;

      // فرمت‌دهی داده‌های سوال برای ویرایش
      this.currentQuestion = {
        text: question.text,
        type: question.questionType,
        points: question.points || 10,
        explanation: question.explanation || '',
        hint: question.hint || '',
        timeLimit: question.timeLimit || null,
        difficulty: question.difficulty || 3.0,
        isRequired: question.isRequired || false
      };

      // فرمت‌دهی بر اساس نوع سوال
      switch (question.questionType) {
        case 'MULTIPLE_CHOICE':
          if (question.options && Array.isArray(question.options)) {
            this.currentQuestion.options = question.options.map(opt => opt.text);
            const correctIndex = question.options.findIndex(opt => opt.correct);
            this.currentQuestion.correctOption = correctIndex >= 0 ? correctIndex : 0;
          } else {
            this.currentQuestion.options = ['', '', '', ''];
            this.currentQuestion.correctOption = 0;
          }
          break;

        case 'TRUE_FALSE':
          if (question.options && Array.isArray(question.options)) {
            const correctOption = question.options.find(opt => opt.correct);
            this.currentQuestion.correctOption =
                correctOption && correctOption.text === 'صحیح' ? 'true' : 'false';
          } else {
            this.currentQuestion.correctOption = 'true';
          }
          break;

        case 'SHORT_ANSWER':
          this.currentQuestion.correctOption = question.correctOption || '';
          break;

        case 'ESSAY':
          this.currentQuestion.maxScore = question.maxScore || question.points || 10;
          break;

        case 'FILL_IN_THE_BLANKS':
          this.currentQuestion.template = question.template || question.text;
          if (question.blankAnswers && Array.isArray(question.blankAnswers)) {
            this.currentQuestion.blankAnswers = question.blankAnswers.map(blank => ({
              correctAnswer: blank.correctAnswer || '',
              acceptableAnswers: Array.isArray(blank.acceptableAnswers)
                  ? blank.acceptableAnswers.join(', ')
                  : blank.acceptableAnswers || '',
              blankIndex: blank.blankIndex || 0
            }));
          } else {
            this.currentQuestion.blankAnswers = [{
              correctAnswer: '',
              acceptableAnswers: '',
              blankIndex: 0
            }];
          }
          break;

        case 'MATCHING':
          if (question.matchingPairs && Array.isArray(question.matchingPairs)) {
            this.currentQuestion.matchingPairs = question.matchingPairs.map(pair => ({
              leftItem: pair.leftItem || '',
              rightItem: pair.rightItem || '',
              leftItemType: 'TEXT',
              rightItemType: 'TEXT'
            }));
          } else {
            this.currentQuestion.matchingPairs = [{
              leftItem: '',
              rightItem: '',
              leftItemType: 'TEXT',
              rightItemType: 'TEXT'
            }];
          }
          break;

        case 'CATEGORIZATION':
          this.currentQuestion.categories = question.categories || ['دسته ۱', 'دسته ۲'];

          // تبدیل answers به categorizationItems
          if (question.answers && Array.isArray(question.answers) && question.answers.length > 0) {
            this.currentQuestion.categorizationItems = question.answers.map(answer => ({
              text: answer.text || '',
              correctCategory: answer.category || '',
              itemType: 'TEXT'
            }));
          } else {
            this.currentQuestion.categorizationItems = [{
              text: '',
              correctCategory: '',
              itemType: 'TEXT'
            }];
          }
          break;
      }

      const modal = new bootstrap.Modal(document.getElementById('questionModal'));
      modal.show();
    },

    formatQuestionForBackend(questionData) {
      const data = {
        text: questionData.text,
        questionType: questionData.type,
        points: questionData.points || 10,
        explanation: questionData.explanation || '',
        hint: questionData.hint || '',
        timeLimit: questionData.timeLimit || null,
        difficulty: parseFloat(questionData.difficulty) || 3.0,
        isRequired: questionData.isRequired || false
      };

      switch (questionData.type) {
        case 'MULTIPLE_CHOICE':
          data.options = questionData.options
              .filter(opt => opt && opt.trim() !== '')
              .map((text, index) => ({
                text: text.trim(),
                correct: index === parseInt(questionData.correctOption),
                answerType: 'TEXT',
                mediaUrl: null,
                points: index === parseInt(questionData.correctOption) ? data.points : 0,
                feedback: '',
                orderIndex: index + 1
              }));
          break;

        case 'TRUE_FALSE':
          data.options = [
            {
              text: 'صحیح',
              correct: questionData.correctOption === 'true',
              answerType: 'TEXT',
              mediaUrl: null,
              points: questionData.correctOption === 'true' ? data.points : 0,
              feedback: '',
              orderIndex: 1
            },
            {
              text: 'غلط',
              correct: questionData.correctOption === 'false',
              answerType: 'TEXT',
              mediaUrl: null,
              points: questionData.correctOption === 'false' ? data.points : 0,
              feedback: '',
              orderIndex: 2
            }
          ];
          break;

        case 'SHORT_ANSWER':
          // برای SHORT_ANSWER فقط text کافی است - backend خودش handle می‌کند
          break;

        case 'ESSAY':
          // برای ESSAY فقط اطلاعات اصلی کافی است
          break;

        case 'FILL_IN_THE_BLANKS':
          data.template = questionData.template || questionData.text;
          data.blankAnswers = questionData.blankAnswers.map((blank, index) => ({
            blankIndex: index,
            correctAnswer: blank.correctAnswer,
            acceptableAnswers: blank.acceptableAnswers ?
                blank.acceptableAnswers.split(',').map(s => s.trim()).filter(s => s) : [],
            caseSensitive: false,
            points: Math.floor(data.points / questionData.blankAnswers.length) || 1
          }));
          break;

        case 'MATCHING':
          data.matchingPairs = questionData.matchingPairs
              .filter(pair => pair.leftItem.trim() && pair.rightItem.trim())
              .map(pair => ({
                leftItem: pair.leftItem.trim(),
                rightItem: pair.rightItem.trim(),
                leftItemType: 'TEXT',
                rightItemType: 'TEXT',
                leftItemUrl: null,
                rightItemUrl: null,
                points: Math.floor(data.points / questionData.matchingPairs.length) || 1
              }));
          break;

        case 'CATEGORIZATION':
          data.categories = questionData.categories
              .filter(cat => cat && cat.trim())
              .map(cat => cat.trim());

          data.categorizationItems = questionData.categorizationItems
              .filter(item => item.text.trim() && item.correctCategory)
              .map(item => ({
                text: item.text.trim(),
                correctCategory: item.correctCategory,
                itemType: 'TEXT',
                mediaUrl: null,
                points: Math.floor(data.points / questionData.categorizationItems.length) || 1
              }));
          break;
      }

      return data;
    },
    async saveQuestion(questionData) {
      this.isQuestionSubmitting = true;

      try {
        const formattedData = this.formatQuestionForBackend(questionData);
        let response;

        if (this.isEditingQuestion) {
          response = await this.$http.put(`/questions/${this.selectedQuestionId}`, formattedData);
        } else {
          if (!this.examId) {
            await this.saveExamInfo();
            if (!this.examId) {
              this.showErrorToast('ابتدا باید اطلاعات آزمون را کامل کنید.');
              return;
            }
          }
          response = await this.$http.post(`/questions/exam/${this.examId}`, formattedData);
        }

        if (response.data.success) {
          this.showSuccessToast(this.isEditingQuestion ? 'سوال با موفقیت ویرایش شد.' : 'سوال با موفقیت اضافه شد.');
          this.hideQuestionModal();
          await this.fetchExamQuestions();
        }
      } catch (error) {
        console.error('Error saving question:', error);
        this.showErrorToast('مشکلی در ذخیره سوال رخ داد. لطفاً دوباره تلاش کنید.');
      } finally {
        this.isQuestionSubmitting = false;
      }
    },


    confirmDeleteQuestion(question) {
      this.selectedQuestion = question;
      this.$refs.deleteConfirmDialog.show();
    },

    async deleteQuestion() {
      if (!this.selectedQuestion) return;

      this.isDeleting = true;

      try {
        await axios.delete(`/questions/${this.selectedQuestion.id}`);
        this.questions = this.questions.filter(q => q.id !== this.selectedQuestion.id);
        this.showSuccessToast('سوال با موفقیت حذف شد.');
      } catch (error) {
        console.error('Error deleting question:', error);
        this.showErrorToast('مشکلی در حذف سوال رخ داد. لطفاً دوباره تلاش کنید.');
      } finally {
        this.isDeleting = false;
      }
    },

    async finalizeExam() {
      if (this.questions.length === 0) {
        this.showErrorToast('برای نهایی‌سازی آزمون، حداقل یک سوال باید اضافه کنید.');
        return;
      }

      try {
        await axios.put(`/exams/${this.examId}/finalize`);
        this.showSuccessToast('آزمون با موفقیت نهایی شد.');

        if (this.examData.lessonId) {
          const lessonResponse = await axios.get(`/lessons/${this.examData.lessonId}`);
          const courseId = lessonResponse.data.course?.id;

          if (courseId) {
            this.$router.push({ name: 'CourseDetail', params: { id: courseId } });
          } else {
            this.$router.push({ name: 'TeachingCourses' });
          }
        } else {
          this.$router.push({ name: 'TeachingCourses' });
        }
      } catch (error) {
        console.error('Error finalizing exam:', error);
        this.showErrorToast('مشکلی در نهایی‌سازی آزمون رخ داد. لطفاً دوباره تلاش کنید.');
      }
    }
  }
}
</script>

<style scoped>
/* Responsive */
@media (max-width: 768px) {
  .d-flex.gap-2 {
    flex-direction: column;
    gap: 0.5rem !important;
  }

  .modern-btn {
    width: 100%;
  }
}
</style>