<template>
  <div class="lesson-questions-manager">
    <div class="card">
      <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
        <h5 class="mb-0">مدیریت سوالات درس: {{ lessonTitle }}</h5>
        <button class="btn btn-light" @click="createNewExam" v-if="!hasExam">
          <i class="fas fa-plus"></i> ایجاد آزمون جدید
        </button>
        <button class="btn btn-light" @click="showAddQuestionModal" v-else>
          <i class="fas fa-plus"></i> افزودن سوال
        </button>
      </div>
      <div class="card-body">
        <!-- نمایش حالت خالی -->
        <div v-if="!hasExam" class="text-center py-5">
          <div class="mb-4">
            <i class="fas fa-clipboard-check fa-4x text-muted"></i>
          </div>
          <h5>هنوز آزمونی برای این درس ایجاد نشده است</h5>
          <p class="text-muted">برای افزودن سوال، ابتدا یک آزمون جدید ایجاد کنید.</p>
          <button class="btn btn-primary mt-3" @click="createNewExam">
            <i class="fas fa-plus me-1"></i> ایجاد آزمون جدید
          </button>
        </div>

        <!-- نمایش اطلاعات آزمون و لیست سوالات -->
        <div v-else>
          <div class="exam-info mb-4">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h5>{{ examData.title }}</h5>
              <div>
                <button class="btn btn-sm btn-outline-primary me-2" @click="editExam">
                  <i class="fas fa-edit"></i> ویرایش آزمون
                </button>
                <button class="btn btn-sm btn-outline-success" @click="previewExam">
                  <i class="fas fa-eye"></i> پیش‌نمایش
                </button>
              </div>
            </div>
            <div class="exam-meta d-flex flex-wrap gap-3">
              <div class="meta-item">
                <i class="fas fa-clock text-primary me-1"></i>
                <span>زمان: {{ examData.duration }} دقیقه</span>
              </div>
              <div class="meta-item">
                <i class="fas fa-check-circle text-success me-1"></i>
                <span>نمره قبولی: {{ examData.passingScore }}%</span>
              </div>
              <div class="meta-item">
                <i class="fas fa-question-circle text-info me-1"></i>
                <span>تعداد سوالات: {{ questions.length }}</span>
              </div>
            </div>
          </div>

          <!-- لیست سوالات -->
          <question-list
              :questions="questions"
              @add-question="showAddQuestionModal"
              @edit-question="editQuestion"
              @delete-question="confirmDeleteQuestion"
          />

          <div class="text-center mt-4">
            <button class="btn btn-success" @click="showAddQuestionModal">
              <i class="fas fa-plus me-1"></i> افزودن سوال جدید
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: ایجاد آزمون جدید -->
    <base-modal
        modal-id="createExamModal"
        title="ایجاد آزمون جدید"
        modal-size="modal-lg"
        ref="createExamModal"
    >
      <form @submit.prevent="saveNewExam">
        <div class="mb-3">
          <label for="examTitle" class="form-label">عنوان آزمون <span class="text-danger">*</span></label>
          <input type="text" class="form-control" id="examTitle" v-model="newExam.title" required>
        </div>
        <div class="mb-3">
          <label for="examDescription" class="form-label">توضیحات آزمون</label>
          <textarea class="form-control" id="examDescription" v-model="newExam.description" rows="3"></textarea>
        </div>
        <div class="row">
          <div class="col-md-6">
            <div class="mb-3">
              <label for="examDuration" class="form-label">مدت زمان (دقیقه) <span class="text-danger">*</span></label>
              <input type="number" class="form-control" id="examDuration" v-model="newExam.duration" min="1" required>
            </div>
          </div>
          <div class="col-md-6">
            <div class="mb-3">
              <label for="examPassingScore" class="form-label">نمره قبولی (درصد) <span class="text-danger">*</span></label>
              <input type="number" class="form-control" id="examPassingScore" v-model="newExam.passingScore" min="0" max="100" required>
            </div>
          </div>
        </div>
        <div class="mb-3">
          <div class="form-check">
            <input class="form-check-input" type="checkbox" id="shuffleQuestions" v-model="newExam.shuffleQuestions">
            <label class="form-check-label" for="shuffleQuestions">
              ترتیب سوالات تصادفی باشد
            </label>
          </div>
        </div>
        <div class="d-flex justify-content-end">
          <button type="button" class="btn btn-secondary me-2" @click="$refs.createExamModal.hide()">انصراف</button>
          <button type="submit" class="btn btn-primary" :disabled="isCreatingExam">
            <span v-if="isCreatingExam" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            ایجاد آزمون
          </button>
        </div>
      </form>
    </base-modal>

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
import BaseModal from '@/components/common/BaseModal.vue';
import ConfirmationDialog from '@/components/common/ConfirmationDialog.vue';
import QuestionForm from '@/components/exams/QuestionForm.vue';
import QuestionList from '@/components/exams/QuestionList.vue';
import formMixin from '@/mixins/formMixin.js';

export default {
  name: 'LessonQuestionsManager',
  components: {
    BaseModal,
    ConfirmationDialog,
    QuestionForm,
    QuestionList
  },
  mixins: [formMixin],
  props: {
    lessonId: {
      type: [String, Number],
      required: true
    },
    lessonTitle: {
      type: String,
      default: 'نامشخص'
    }
  },
  data() {
    return {
      loading: true,
      examData: null,
      questions: [],

      // فرم ایجاد آزمون جدید
      newExam: {
        title: '',
        description: '',
        duration: 60,
        passingScore: 70,
        shuffleQuestions: false
      },
      isCreatingExam: false,

      // فرم سوال
      currentQuestion: {
        text: '',
        type: 'MULTIPLE_CHOICE',
        options: ['', '', '', ''],
        correctOption: 0,
        explanation: '',
        points: 10,
        maxScore: 10
      },
      isEditingQuestion: false,
      selectedQuestionId: null,
      isQuestionSubmitting: false,

      // حذف سوال
      selectedQuestion: null
    }
  },
  computed: {
    hasExam() {
      return this.examData !== null;
    }
  },
  async created() {
    await this.fetchExamData();
  },
  methods: {
    async fetchExamData() {
      try {
        this.loading = true;

        // بررسی وجود آزمون برای این درس
        const response = await axios.get(`/exams/lesson/${this.lessonId}`);

        if (response.data) {
          // آزمون موجود است
          this.examData = response.data;

          // دریافت سوالات آزمون
          await this.fetchExamQuestions();
        } else {
          // آزمون وجود ندارد
          this.examData = null;
          this.questions = [];
        }
      } catch (error) {
        // اگر آزمونی وجود نداشته باشد، احتمالاً خطای 404 دریافت می‌شود
        if (error.response && error.response.status === 404) {
          this.examData = null;
          this.questions = [];
        } else {
          console.error('Error fetching exam data:', error);
          this.showErrorToast('مشکلی در دریافت اطلاعات آزمون رخ داد.');
        }
      } finally {
        this.loading = false;
      }
    },

    async fetchExamQuestions() {
      if (!this.examData || !this.examData.id) return;

      try {
        const response = await axios.get(`/exams/${this.examData.id}/questions`);
        this.questions = response.data;
      } catch (error) {
        console.error('Error fetching exam questions:', error);
        this.showErrorToast('مشکلی در دریافت سوالات آزمون رخ داد.');
      }
    },

    createNewExam() {
      // باز کردن مودال ایجاد آزمون جدید
      this.$refs.createExamModal.show();
    },

    async saveNewExam() {
      this.isCreatingExam = true;

      try {
        // ایجاد آزمون جدید برای درس
        const response = await axios.post(`/exams/lesson/${this.lessonId}`, {
          title: this.newExam.title,
          description: this.newExam.description,
          duration: this.newExam.duration,
          passingScore: this.newExam.passingScore,
          shuffleQuestions: this.newExam.shuffleQuestions
        });

        // ذخیره اطلاعات آزمون
        this.examData = response.data;

        // بستن مودال
        this.$refs.createExamModal.hide();

        // پیام موفقیت
        this.showSuccessToast('آزمون با موفقیت ایجاد شد. اکنون می‌توانید سوالات را اضافه کنید.');

        // باز کردن مودال افزودن سوال
        setTimeout(() => {
          this.showAddQuestionModal();
        }, 500);
      } catch (error) {
        console.error('Error creating exam:', error);
        this.showErrorToast('مشکلی در ایجاد آزمون رخ داد. لطفاً دوباره تلاش کنید.');
      } finally {
        this.isCreatingExam = false;
      }
    },

    editExam() {
      // انتقال به صفحه ویرایش آزمون
      this.$router.push({
        name: 'ExamEditor',
        params: { id: this.examData.id }
      });
    },

    previewExam() {
      // نمایش پیش‌نمایش آزمون
      this.$router.push({
        name: 'Exam',
        params: { id: this.examData.id }
      });
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
        maxScore: 10
      };
      this.$refs.questionModal.show();
    },

    editQuestion(question) {
      this.isEditingQuestion = true;
      this.selectedQuestionId = question.id;

      // کپی اطلاعات سوال
      this.currentQuestion = { ...question };

      // تبدیل answers به options برای نمایش در فرم
      if (question.type === 'MULTIPLE_CHOICE' || question.questionType === 'MULTIPLE_CHOICE') {
        if (question.answers && Array.isArray(question.answers)) {
          this.currentQuestion.options = question.answers.map(a => a.text);
          const correctIndex = question.answers.findIndex(a => a.correct);
          this.currentQuestion.correctOption = correctIndex >= 0 ? correctIndex : 0;
        } else if (question.options && Array.isArray(question.options)) {
          // اگر از قبل options داشته باشد
          this.currentQuestion.options = question.options.map(o => o.text || o);
          const correctIndex = question.options.findIndex(o => o.correct);
          this.currentQuestion.correctOption = correctIndex >= 0 ? correctIndex : 0;
        }
      }

      // تبدیل questionType به type برای فرم
      if (question.questionType && !question.type) {
        this.currentQuestion.type = question.questionType;
      }

      this.$refs.questionModal.show();
    },

    async saveQuestion() {
      this.isQuestionSubmitting = true;

      try {
        let response;

        // آماده‌سازی داده‌ها
        const questionData = {
          text: this.currentQuestion.text,
          type: this.currentQuestion.type,
          points: this.currentQuestion.points || 10,
          explanation: this.currentQuestion.explanation
        };

        // افزودن فیلدهای اضافی بر اساس نوع سوال
        if (this.currentQuestion.type === 'MULTIPLE_CHOICE') {
          const options = this.currentQuestion.options;
          questionData.answers = options.map((text, index) => ({
            text,
            correct: index === parseInt(this.currentQuestion.correctOption)
          }));
        } else if (this.currentQuestion.type === 'TRUE_FALSE') {
          questionData.answers = [
            { text: 'درست', correct: this.currentQuestion.correctOption === 'true' },
            { text: 'نادرست', correct: this.currentQuestion.correctOption === 'false' }
          ];
        } else if (this.currentQuestion.type === 'SHORT_ANSWER') {
          questionData.correctOption = this.currentQuestion.correctOption;
        } else if (this.currentQuestion.type === 'ESSAY') {
          questionData.maxScore = this.currentQuestion.maxScore || 10;
        }

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
          // افزودن سوال جدید
          response = await axios.post(`/questions/exam/${this.examData.id}`, questionData);

          // افزودن سوال جدید به لیست
          this.questions.push(response.data);

          this.showSuccessToast('سوال جدید با موفقیت افزوده شد.');
        }

        // بستن مودال
        this.$refs.questionModal.hide();
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

      try {
        await axios.delete(`/questions/${this.selectedQuestion.id}`);

        // حذف سوال از لیست
        this.questions = this.questions.filter(q => q.id !== this.selectedQuestion.id);

        this.showSuccessToast('سوال با موفقیت حذف شد.');
      } catch (error) {
        console.error('Error deleting question:', error);
        this.showErrorToast('مشکلی در حذف سوال رخ داد. لطفاً دوباره تلاش کنید.');
      }
    }
  }
}
</script>

<style scoped>
.meta-item {
  background-color: #f8f9fa;
  padding: 8px 15px;
  border-radius: 5px;
  font-size: 0.9rem;
}
</style>