<template>
  <div class="exam-creator">
    <div class="container-fluid p-4">
      <loading-spinner :loading="loading">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h2>{{ isEditMode ? 'ویرایش آزمون' : 'ایجاد آزمون جدید' }}</h2>
          <button class="btn btn-outline-secondary" @click="goBack">
            <i class="fas fa-arrow-right"></i> بازگشت
          </button>
        </div>

        <!-- فرم اطلاعات پایه آزمون -->
        <exam-info-form
            :exam-data="examData"
            :available-lessons="availableLessons"
            :is-submitting="isInfoSubmitting"
            @save-exam-info="saveExamInfo"
        />

        <!-- مدیریت سوالات - فقط زمانی نمایش داده می‌شود که examId داشته باشیم -->
        <div v-if="examId" class="card">
          <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
            <h5 class="mb-0">سوالات آزمون</h5>
            <div>
              <button class="btn btn-light me-2" @click="importFromQuestionBank">
                <i class="fas fa-database"></i> استفاده از بانک سوالات
              </button>
              <button class="btn btn-light" @click="showAddQuestionModal">
                <i class="fas fa-plus"></i> افزودن سوال
              </button>
            </div>
          </div>
          <div class="card-body">
            <question-list
                :questions="questions"
                @add-question="showAddQuestionModal"
                @edit-question="editQuestion"
                @delete-question="confirmDeleteQuestion"
            />

            <div class="text-center mt-4">
              <button class="btn btn-success btn-lg" @click="finalizeExam" :disabled="questions.length === 0">
                <i class="fas fa-check"></i> نهایی‌سازی آزمون
              </button>
            </div>
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
          :is-submitting="isQuestionSubmitting"
          @save="saveQuestion"
          @cancel="$refs.questionModal.hide()"
      />
    </base-modal>

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

      // اگر lessonId از پراپس دریافت شده باشد، آن را تنظیم می‌کنیم
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

        // تنظیم داده‌های آزمون
        this.examData = {
          title: examData.title,
          description: examData.description,
          duration: examData.duration,
          passingScore: examData.passingScore || 60,
          lessonId: examData.lesson ? examData.lesson.id : '',
          shuffleQuestions: examData.shuffleQuestions || false
        };

        // دریافت سوالات
        await this.fetchExamQuestions();

        this.loading = false;
        this.finishSubmitting();
      } catch (error) {
        console.error('Error fetching exam data:', error);
        this.finishSubmitting(null, 'مشکلی در دریافت اطلاعات آزمون رخ داد. لطفاً دوباره تلاش کنید.');
        this.loading = false;
      }
    },
    importFromQuestionBank() {
      // Store the current exam ID in localStorage
      localStorage.setItem('currentExamId', this.examId);

      // Navigate to the question bank
      this.$router.push({
        name: 'QuestionBank',
        query: { returnTo: 'ExamCreator', examId: this.examId }
      });
    },
    async fetchExamQuestions() {
      try {
        // دریافت سوالات آزمون - با استفاده از endpoint صحیح
        const response = await axios.get(`/exams/${this.examId}/questions`);
        this.questions = response.data;
      } catch (error) {
        console.error('Error fetching exam questions:', error);
        this.showErrorToast('مشکلی در دریافت سوالات آزمون رخ داد.');
      }
    },

    async fetchLessons() {
      try {
        // دریافت درس‌های قابل دسترس برای معلم
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
          // ویرایش آزمون موجود
          response = await axios.put(`/exams/${this.examId}`, this.examData);
        } else {
          // ایجاد آزمون جدید - اصلاح endpoint مطابق با API
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
        maxScore: 10
      };
      this.$refs.questionModal.show();
    },

    editQuestion(question) {
      this.isEditingQuestion = true;
      this.selectedQuestionId = question.id;

      // کپی اطلاعات سوال
      this.currentQuestion = { ...question };

      // اطمینان از وجود آرایه گزینه‌ها برای سوال چند گزینه‌ای
      if (question.type === 'MULTIPLE_CHOICE' && (!question.options || !Array.isArray(question.options))) {
        this.currentQuestion.options = ['', '', '', ''];
      }

      this.$refs.questionModal.show();
    },

    async saveQuestion() {
      this.isQuestionSubmitting = true;

      try {
        let response;
        const questionData = {
          ...this.currentQuestion
        };

        if (this.isEditingQuestion) {
          // ویرایش سوال موجود
          response = await axios.put(`/questions/${this.selectedQuestionId}`, questionData);

          // به‌روزرسانی سوال در لیست
          const index = this.questions.findIndex(q => q.id === this.selectedQuestionId);
          if (index !== -1) {
            this.questions[index] = response.data;
          }

          this.showSuccessToast('سوال با موفقیت به‌روزرسانی شد.');
        } else {
          // افزودن سوال جدید - اصلاح endpoint مطابق با API
          response = await axios.post(`/exams/${this.examId}/questions`, questionData);

          // افزودن سوال جدید به لیست
          this.questions.push(response.data);

          this.showSuccessToast('سوال جدید با موفقیت افزوده شد.');
        }

        // بستن مودال
        this.$refs.questionModal.hide();
      } catch (error) {
        console.error('Error saving question:', error);
        this.showErrorToast(error.message || 'مشکلی در ذخیره سوال رخ داد. لطفاً دوباره تلاش کنید.');
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

        // حذف سوال از لیست
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

        // انتقال به صفحه درس
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