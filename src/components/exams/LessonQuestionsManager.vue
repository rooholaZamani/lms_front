<template>
  <div class="modern-page-bg success-gradient">
    <div class="modern-container large animate-slide-up">
      <div class="modern-header">
        <div class="modern-logo success">
          <i class="fas fa-chalkboard-teacher"></i>
        </div>
        <h1 class="modern-title">مدیریت سوالات درس: {{ lessonTitle }}</h1>
        <p class="modern-subtitle">ایجاد و مدیریت آزمون‌ها و سوالات درس</p>
      </div>

      <!-- نمایش حالت خالی -->
      <div v-if="!hasExam" class="empty-exam-state">
        <div class="modern-logo large secondary mb-4">
          <i class="fas fa-clipboard-check"></i>
        </div>
        <h4 class="text-white mb-3">هنوز آزمونی برای این درس ایجاد نشده است</h4>
        <p class="text-white-50 mb-4">برای افزودن سوال، ابتدا یک آزمون جدید ایجاد کنید</p>
        <button class="modern-btn modern-btn-primary" @click="createNewExam">
          <i class="fas fa-plus me-1"></i> ایجاد آزمون جدید
        </button>
      </div>

      <!-- نمایش اطلاعات آزمون و لیست سوالات -->
      <div v-else>
        <!-- اطلاعات آزمون -->
        <div class="form-section">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h6 class="section-title">
              <i class="fas fa-info-circle me-2"></i>
              اطلاعات آزمون
            </h6>
            <div class="exam-actions">
              <button class="modern-btn modern-btn-outline me-2" @click="editExam">
                <i class="fas fa-edit me-1"></i> ویرایش آزمون
              </button>
              <button class="modern-btn modern-btn-info" @click="previewExam">
                <i class="fas fa-eye me-1"></i> پیش‌نمایش
              </button>
            </div>
          </div>

          <div class="exam-info-grid">
            <div class="info-card">
              <div class="info-icon">
                <i class="fas fa-file-alt text-primary"></i>
              </div>
              <div class="info-content">
                <h6>{{ examData.title }}</h6>
                <p class="text-muted">عنوان آزمون</p>
              </div>
            </div>

            <div class="info-card">
              <div class="info-icon">
                <i class="fas fa-clock text-warning"></i>
              </div>
              <div class="info-content">
                <h6>{{ examData.duration }} دقیقه</h6>
                <p class="text-muted">مدت زمان</p>
              </div>
            </div>

            <div class="info-card">
              <div class="info-icon">
                <i class="fas fa-check-circle text-success"></i>
              </div>
              <div class="info-content">
                <h6>{{ examData.passingScore }}%</h6>
                <p class="text-muted">نمره قبولی</p>
              </div>
            </div>

            <div class="info-card">
              <div class="info-icon">
                <i class="fas fa-question-circle text-info"></i>
              </div>
              <div class="info-content">
                <h6>{{ questions.length }}</h6>
                <p class="text-muted">تعداد سوالات</p>
              </div>
            </div>
          </div>
        </div>

        <!-- لیست سوالات -->
        <div class="form-section">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h6 class="section-title">
              <i class="fas fa-list me-2"></i>
              سوالات آزمون
            </h6>
            <button class="modern-btn modern-btn-success" @click="showAddQuestionModal">
              <i class="fas fa-plus me-1"></i> افزودن سوال جدید
            </button>
          </div>

          <question-list
              :questions="questions"
              @add-question="showAddQuestionModal"
              @edit-question="editQuestion"
              @delete-question="confirmDeleteQuestion"
          />
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
        <div class="form-section">
          <h6 class="section-title">
            <i class="fas fa-clipboard-check me-2"></i>
            اطلاعات آزمون
          </h6>

          <div class="modern-form-group">
            <label for="examTitle" class="modern-form-label">عنوان آزمون <span class="text-danger">*</span></label>
            <input
                type="text"
                class="modern-form-control"
                id="examTitle"
                v-model="newExam.title"
                placeholder="عنوان آزمون را وارد کنید..."
                required
            >
          </div>

          <div class="modern-form-group">
            <label for="examDescription" class="modern-form-label">توضیحات آزمون</label>
            <textarea
                class="modern-form-control"
                id="examDescription"
                v-model="newExam.description"
                rows="3"
                placeholder="توضیحات آزمون..."
            ></textarea>
          </div>

          <div class="row">
            <div class="col-md-6 modern-form-group">
              <label for="examDuration" class="modern-form-label">مدت زمان (دقیقه) <span class="text-danger">*</span></label>
              <input
                  type="number"
                  class="modern-form-control"
                  id="examDuration"
                  v-model="newExam.duration"
                  min="1"
                  placeholder="مدت زمان به دقیقه..."
                  required
              >
            </div>
            <div class="col-md-6 modern-form-group">
              <label for="examPassingScore" class="modern-form-label">نمره قبولی (درصد) <span class="text-danger">*</span></label>
              <input
                  type="number"
                  class="modern-form-control"
                  id="examPassingScore"
                  v-model="newExam.passingScore"
                  min="0"
                  max="100"
                  placeholder="نمره قبولی..."
                  required
              >
            </div>
          </div>

          <div class="modern-form-group">
            <div class="form-check">
              <input
                  class="form-check-input"
                  type="checkbox"
                  id="shuffleQuestions"
                  v-model="newExam.shuffleQuestions"
              >
              <label class="form-check-label" for="shuffleQuestions">
                <i class="fas fa-random me-1"></i>
                ترتیب سوالات تصادفی باشد
              </label>
            </div>
          </div>
        </div>

        <div class="d-flex justify-content-end gap-2">
          <button type="button" class="modern-btn modern-btn-secondary" @click="$refs.createExamModal.hide()">
            <i class="fas fa-times me-1"></i>
            انصراف
          </button>
          <button type="submit" class="modern-btn modern-btn-success" :disabled="isCreatingExam">
            <span v-if="isCreatingExam" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            <i class="fas fa-check me-1"></i>
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

      newExam: {
        title: '',
        description: '',
        duration: 60,
        passingScore: 70,
        shuffleQuestions: false
      },
      isCreatingExam: false,

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

        // شبیه‌سازی دریافت اطلاعات آزمون
        // در پروژه واقعی از API زیر استفاده می‌شود:
        // const response = await axios.get(`/exams/lesson/${this.lessonId}`);

        // برای نمونه، یک آزمون فرضی ایجاد می‌کنیم
        this.examData = {
          id: 1,
          title: `آزمون درس ${this.lessonTitle}`,
          description: 'آزمون جامع درس',
          duration: 90,
          passingScore: 70,
          shuffleQuestions: false
        };

        // شبیه‌سازی دریافت سوالات
        await this.fetchExamQuestions();
      } catch (error) {
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
        // شبیه‌سازی دریافت سوالات
        // const response = await axios.get(`/exams/${this.examData.id}/questions`);

        // ایجاد سوالات نمونه
        this.questions = Array.from({ length: 3 }, (_, i) => ({
          id: i + 1,
          text: `سوال نمونه شماره ${i + 1} برای آزمون`,
          type: ['MULTIPLE_CHOICE', 'TRUE_FALSE', 'SHORT_ANSWER'][i % 3],
          options: i % 3 === 0 ? ['گزینه ۱', 'گزینه ۲', 'گزینه ۳', 'گزینه ۴'] : null,
          correctOption: i % 3 === 0 ? 0 : (i % 3 === 1 ? 'true' : 'پاسخ صحیح'),
          points: 10,
          explanation: `توضیحات سوال ${i + 1}`
        }));
      } catch (error) {
        console.error('Error fetching exam questions:', error);
        this.showErrorToast('مشکلی در دریافت سوالات آزمون رخ داد.');
      }
    },

    createNewExam() {
      this.$refs.createExamModal.show();
    },

    async saveNewExam() {
      this.isCreatingExam = true;

      try {
        // شبیه‌سازی ایجاد آزمون
        // const response = await axios.post(`/exams/lesson/${this.lessonId}`, { ... });

        this.examData = {
          id: Date.now(),
          title: this.newExam.title,
          description: this.newExam.description,
          duration: this.newExam.duration,
          passingScore: this.newExam.passingScore,
          shuffleQuestions: this.newExam.shuffleQuestions
        };

        this.$refs.createExamModal.hide();
        this.showSuccessToast('آزمون با موفقیت ایجاد شد. اکنون می‌توانید سوالات را اضافه کنید.');

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
      this.$router.push({
        name: 'ExamEditor',
        params: { id: this.examData.id }
      });
    },

    previewExam() {
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

      this.currentQuestion = { ...question };

      if (question.questionType === 'MULTIPLE_CHOICE' || question.questionType === 'MULTIPLE_CHOICE') {
        if (question.answers && Array.isArray(question.answers)) {
          this.currentQuestion.options = question.answers.map(a => a.text);
          const correctIndex = question.answers.findIndex(a => a.correct);
          this.currentQuestion.correctOption = correctIndex >= 0 ? correctIndex : 0;
        } else if (question.options && Array.isArray(question.options)) {
          this.currentQuestion.options = question.options.map(o => o.text || o);
          const correctIndex = question.options.findIndex(o => o.correct);
          this.currentQuestion.correctOption = correctIndex >= 0 ? correctIndex : 0;
        }
      }

      if (question.questionType && !question.questionType) {
        this.currentquestion.questionType = question.questionType;
      }

      this.$refs.questionModal.show();
    },

    async saveQuestion() {
      this.isQuestionSubmitting = true;

      try {
        const questionData = {
          text: this.currentQuestion.text,
          type: this.currentquestion.questionType,
          points: this.currentQuestion.points || 10,
          explanation: this.currentQuestion.explanation
        };

        if (this.currentquestion.questionType === 'MULTIPLE_CHOICE') {
          const options = this.currentQuestion.options;
          questionData.answers = options.map((text, index) => ({
            text,
            correct: index === parseInt(this.currentQuestion.correctOption)
          }));
        } else if (this.currentquestion.questionType === 'TRUE_FALSE') {
          questionData.answers = [
            { text: 'درست', correct: this.currentQuestion.correctOption === 'true' },
            { text: 'نادرست', correct: this.currentQuestion.correctOption === 'false' }
          ];
        } else if (this.currentquestion.questionType === 'SHORT_ANSWER') {
          questionData.correctOption = this.currentQuestion.correctOption;
        } else if (this.currentquestion.questionType === 'ESSAY') {
          questionData.maxScore = this.currentQuestion.maxScore || 10;
        }

        if (this.isEditingQuestion) {
          const index = this.questions.findIndex(q => q.id === this.selectedQuestionId);
          if (index !== -1) {
            this.questions[index] = { ...this.currentQuestion };
          }
          this.showSuccessToast('سوال با موفقیت به‌روزرسانی شد.');
        } else {
          const newQuestion = {
            ...this.currentQuestion,
            id: this.questions.length + 1
          };
          this.questions.push(newQuestion);
          this.showSuccessToast('سوال جدید با موفقیت افزوده شد.');
        }

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
.empty-exam-state {
  text-align: center;
  padding: 4rem 2rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.exam-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.info-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(102, 126, 234, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.info-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.15);
}

.info-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  background: rgba(248, 249, 250, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.info-content h6 {
  margin: 0;
  font-weight: 700;
  color: #333;
  font-size: 1.1rem;
}

.info-content p {
  margin: 0;
  font-size: 0.85rem;
  color: #6c757d;
}

.exam-actions {
  display: flex;
  gap: 0.5rem;
}

.form-check {
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(102, 126, 234, 0.1);
  border-radius: 8px;
  padding: 1rem;
  transition: all 0.2s ease;
}

.form-check:hover {
  background: rgba(102, 126, 234, 0.05);
  border-color: #667eea;
}

.form-check-input:checked {
  background-color: #27ae60;
  border-color: #27ae60;
}

.form-check-label {
  margin: 0;
  cursor: pointer;
  font-weight: 500;
  display: flex;
  align-items: center;
}

@media (max-width: 768px) {
  .exam-info-grid {
    grid-template-columns: 1fr;
  }

  .info-card {
    padding: 1rem;
  }

  .info-icon {
    width: 40px;
    height: 40px;
    font-size: 1.2rem;
  }

  .exam-actions {
    flex-direction: column;
  }

  .empty-exam-state {
    padding: 2rem 1rem;
  }
}
</style>