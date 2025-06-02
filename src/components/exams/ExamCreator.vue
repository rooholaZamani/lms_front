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
              <button class="modern-btn modern-btn-info" @click="importFromQuestionBank">
                <i class="fas fa-database me-2"></i>
                استفاده از بانک سوالات
              </button>
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

    importFromQuestionBank() {
      localStorage.setItem('currentExamId', this.examId);
      this.$router.push({
        name: 'QuestionBank',
        query: { returnTo: 'ExamCreator', examId: this.examId }
      });
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
      this.currentQuestion = { ...question };

      if (question.questionType === 'MULTIPLE_CHOICE' && (!question.options || !Array.isArray(question.options))) {
        this.currentQuestion.options = ['', '', '', ''];
      }

      const modal = new bootstrap.Modal(document.getElementById('questionModal'));
      modal.show();
    },

    async saveQuestion() {
      this.isQuestionSubmitting = true;

      try {
        let response;

        const questionData = {
          text: this.currentQuestion.text,
          questionType: this.currentquestion.questionType,
          points: this.currentQuestion.points || 10,
          explanation: this.currentQuestion.explanation || '',
          hint: this.currentQuestion.hint || '',
          timeLimit: this.currentQuestion.timeLimit || null,
          difficulty: this.currentQuestion.difficulty || 3.0,
          isRequired: this.currentQuestion.isRequired || false
        };

        if (this.currentquestion.questionType === 'MULTIPLE_CHOICE') {
          const options = this.currentQuestion.options.filter(opt => opt && opt.trim() !== '');
          questionData.options = options.map((text, index) => ({
            text: text,
            correct: index === parseInt(this.currentQuestion.correctOption),
            answerType: 'TEXT',
            points: index === parseInt(this.currentQuestion.correctOption) ? questionData.points : 0,
            orderIndex: index
          }));
        } else if (this.currentquestion.questionType === 'TRUE_FALSE') {
          questionData.options = [
            {
              text: 'True',
              correct: this.currentQuestion.correctOption === 'true',
              answerType: 'TEXT',
              points: this.currentQuestion.correctOption === 'true' ? questionData.points : 0,
              orderIndex: 0
            },
            {
              text: 'False',
              correct: this.currentQuestion.correctOption === 'false',
              answerType: 'TEXT',
              points: this.currentQuestion.correctOption === 'false' ? questionData.points : 0,
              orderIndex: 1
            }
          ];
        } else if (this.currentquestion.questionType === 'SHORT_ANSWER') {
          questionData.options = [
            {
              text: this.currentQuestion.correctOption,
              correct: true,
              answerType: 'TEXT',
              points: questionData.points,
              orderIndex: 0
            }
          ];
        } else if (this.currentquestion.questionType === 'ESSAY') {
          questionData.options = [
            {
              text: 'Essay Answer',
              correct: true,
              answerType: 'TEXT',
              points: this.currentQuestion.maxScore || questionData.points,
              orderIndex: 0
            }
          ];
        }

        if (this.isEditingQuestion) {
          response = await axios.put(`/questions/${this.selectedQuestionId}`, questionData);
          const index = this.questions.findIndex(q => q.id === this.selectedQuestionId);
          if (index !== -1) {
            this.questions[index] = response.data;
          }
          this.showSuccessToast('سوال با موفقیت به‌روزرسانی شد.');
        } else {
          response = await axios.post(`/questions/exam/${this.examId}`, questionData);
          this.questions.push(response.data);
          this.showSuccessToast('سوال جدید با موفقیت افزوده شد.');
        }

        this.hideQuestionModal();
      } catch (error) {
        console.error('Error saving question:', error);
        this.showErrorToast(error.response?.data?.message || 'مشکلی در ذخیره سوال رخ داد. لطفاً دوباره تلاش کنید.');
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