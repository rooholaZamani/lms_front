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
      <div class="modal-dialog modal-xl modal-form-lg">
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
        this.$toast.error('مشکلی در دریافت سوالات آزمون رخ داد.');
      }
    },

    async fetchLessons() {
      try {
        const response = await axios.get('/lessons/teaching');
        this.availableLessons = response.data;
      } catch (error) {
        console.error('Error fetching lessons:', error);
        this.$toast.error('مشکلی در دریافت لیست درس‌ها رخ داد.');
      }
    },

    goBack() {
      this.$router.go(-1);
    },

    async saveExamInfo() {
      this.isInfoSubmitting = true;
      let response;
      try {

        if (this.isEditMode) {
          response = await axios.put(`/exams/${this.examId}`, this.examData);
        } else {
          response = await axios.post(`/exams/lesson/${this.examData.lessonId}`, this.examData);
          this.examId = response.data.id;
          this.isEditMode = true;
        }

        this.$toast.success('اطلاعات آزمون با موفقیت ذخیره شد.');
      } catch (error) {
        this.$toast.error('مشکلی در ذخیره اطلاعات آزمون رخ داد. لطفاً دوباره تلاش کنید.')
        this.$toast.error('بررسی کنید برای این درس از قبل آزمونی وجود نداشته باشد');
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
        isRequired: false,
        // فیلدهای اضافی برای انواع مختلف سوال
        template: '', // برای FILL_IN_THE_BLANKS
        blankAnswers: [{
          blankIndex: 0,
          correctAnswer: '',
          acceptableAnswers: '',
          caseSensitive: false,
          points: 0
        }],
        matchingPairs: [{
          leftItem: '',
          rightItem: '',
          leftItemType: 'TEXT',
          rightItemType: 'TEXT',
          leftItemUrl: null,
          rightItemUrl: null,
          points: 0
        }],
        categories: ['دسته ۱', 'دسته ۲'],
        categorizationItems: [{
          text: '',
          correctCategory: '',
          itemType: 'TEXT',
          mediaUrl: null,
          points: 0
        }]
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
                correctOption && correctOption.text.toLowerCase() === 'true' ? 'true' : 'false';
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
              blankIndex: blank.blankIndex || 0,
              correctAnswer: blank.correctAnswer || '',
              acceptableAnswers: Array.isArray(blank.acceptableAnswers)
                  ? blank.acceptableAnswers.join(', ')
                  : blank.acceptableAnswers || '',
              caseSensitive: blank.caseSensitive || false,
              points: blank.points || 0
            }));
          } else {
            this.currentQuestion.blankAnswers = [{
              blankIndex: 0,
              correctAnswer: '',
              acceptableAnswers: '',
              caseSensitive: false,
              points: 0
            }];
          }
          break;

        case 'MATCHING':
          if (question.matchingPairs && Array.isArray(question.matchingPairs)) {
            this.currentQuestion.matchingPairs = question.matchingPairs.map(pair => ({
              leftItem: pair.leftItem || '',
              rightItem: pair.rightItem || '',
              leftItemType: pair.leftItemType || 'TEXT',
              rightItemType: pair.rightItemType || 'TEXT',
              leftItemUrl: pair.leftItemUrl || null,
              rightItemUrl: pair.rightItemUrl || null,
              points: pair.points || 0
            }));
          } else {
            this.currentQuestion.matchingPairs = [{
              leftItem: '',
              rightItem: '',
              leftItemType: 'TEXT',
              rightItemType: 'TEXT',
              leftItemUrl: null,
              rightItemUrl: null,
              points: 0
            }];
          }
          break;

        case 'CATEGORIZATION':
          this.currentQuestion.categories = question.categories || ['دسته ۱', 'دسته ۲'];

          if (question.categorizationItems && Array.isArray(question.categorizationItems)) {
            this.currentQuestion.categorizationItems = question.categorizationItems.map(item => ({
              text: item.text || '',
              correctCategory: item.correctCategory || '',
              itemType: item.itemType || 'TEXT',
              mediaUrl: item.mediaUrl || null,
              points: item.points || 0
            }));
          } else {
            this.currentQuestion.categorizationItems = [{
              text: '',
              correctCategory: '',
              itemType: 'TEXT',
              mediaUrl: null,
              points: 0
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
                feedback: index === parseInt(questionData.correctOption) ? 'پاسخ صحیح' : 'پاسخ نادرست',
                orderIndex: index + 1,
                category: null
              }));
          break;

        case 'TRUE_FALSE':
          data.options = [
            {
              text: 'True',
              correct: questionData.correctOption === 'true',
              answerType: 'TEXT',
              mediaUrl: null,
              points: questionData.correctOption === 'true' ? data.points : 0,
              feedback: questionData.correctOption === 'true' ? 'پاسخ صحیح' : 'پاسخ نادرست',
              orderIndex: 1,
              category: null
            },
            {
              text: 'False',
              correct: questionData.correctOption === 'false',
              answerType: 'TEXT',
              mediaUrl: null,
              points: questionData.correctOption === 'false' ? data.points : 0,
              feedback: questionData.correctOption === 'false' ? 'پاسخ صحیح' : 'پاسخ نادرست',
              orderIndex: 2,
              category: null
            }
          ];
          break;

        case 'FILL_IN_THE_BLANKS':
          data.template = questionData.template || questionData.text;
          data.blankAnswers = questionData.blankAnswers
              .filter(blank => blank.correctAnswer && blank.correctAnswer.trim())
              .map((blank, index) => ({
                blankIndex: parseInt(blank.blankIndex) || index,
                correctAnswer: blank.correctAnswer.trim(),
                acceptableAnswers: Array.isArray(blank.acceptableAnswers)
                    ? blank.acceptableAnswers.filter(ans => ans.trim())
                    : typeof blank.acceptableAnswers === 'string'
                        ? blank.acceptableAnswers.split(',').map(s => s.trim()).filter(s => s)
                        : [blank.correctAnswer.trim()],
                caseSensitive: blank.caseSensitive || false,
                points: Math.floor(data.points / questionData.blankAnswers.length) || 1
              }));
          break;

        case 'MATCHING':
          data.matchingPairs = questionData.matchingPairs
              .filter(pair => pair.leftItem.trim() && pair.rightItem.trim())
              .map((pair, index) => ({
                leftItem: pair.leftItem.trim(),
                rightItem: pair.rightItem.trim(),
                leftItemType: pair.leftItemType || 'TEXT',
                rightItemType: pair.rightItemType || 'TEXT',
                leftItemUrl: pair.leftItemUrl || null,
                rightItemUrl: pair.rightItemUrl || null,
                points: Math.floor(data.points / questionData.matchingPairs.length) || 1
              }));
          break;

        case 'CATEGORIZATION':
          data.categories = questionData.categories
              .filter(cat => cat && cat.trim())
              .map(cat => cat.trim());

          data.categorizationItems = questionData.categorizationItems
              .filter(item => item.text.trim() && item.correctCategory)
              .map((item, index) => ({
                text: item.text.trim(),
                correctCategory: item.correctCategory,
                itemType: item.itemType || 'TEXT',
                mediaUrl: item.mediaUrl || null,
                points: Math.floor(data.points / questionData.categorizationItems.length) || 1
              }));
          break;

        case 'ESSAY':
          // سوالات تشریحی فقط فیلدهای عمومی نیاز دارند
          break;

        case 'SHORT_ANSWER':
          // برای سوالات پاسخ کوتاه پاسخ صحیح را اضافه می‌کنیم
          if (questionData.correctOption && questionData.correctOption.trim()) {
            data.correctOption = questionData.correctOption.trim();
          }
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
              this.$toast.error('ابتدا باید اطلاعات آزمون را کامل کنید.');
              return;
            }
          }
          response = await this.$http.post(`/questions/exam/${this.examId}`, formattedData);
        }


        this.$toast.success(this.isEditingQuestion ? 'سوال با موفقیت ویرایش شد.' : 'سوال با موفقیت اضافه شد.');
        this.hideQuestionModal();
        await this.fetchExamQuestions();

      } catch (error) {
        console.error('Error saving question:', error);
        this.$toast.error('مشکلی در ذخیره سوال رخ داد. لطفاً دوباره تلاش کنید.');
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
        this.$toast.success('سوال با موفقیت حذف شد.');
      } catch (error) {
        console.error('Error deleting question:', error);
        this.$toast.error('مشکلی در حذف سوال رخ داد. لطفاً دوباره تلاش کنید.');
      } finally {
        this.isDeleting = false;
      }
    },

    async finalizeExam() {
      if (this.questions.length === 0) {
        this.$toast.error('برای نهایی‌سازی آزمون، حداقل یک سوال باید اضافه کنید.');
        return;
      }

      try {
        await axios.put(`/exams/${this.examId}/finalize`);
        this.$toast.success('آزمون با موفقیت نهایی شد.');

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
        this.$toast.error('مشکلی در نهایی‌سازی آزمون رخ داد. لطفاً دوباره تلاش کنید.');
      }
    },

    async createExamNormal() {
      try {
        const response = await axios.post(`/exams/lesson/${this.examData.lessonId}`, this.examData);

        if (response.data.success) {
          this.examId = response.data.exam.id;
          this.isEditMode = true;
          return response;
        } else {
          throw new Error(response.data.message || 'خطا در ایجاد آزمون');
        }
      } catch (error) {
        if (error.response?.data?.errorType === 'EXAM_EXISTS_WITH_SUBMISSIONS') {
          // این نباید اتفاق بیفتد چون قبلاً چک کردیم
          console.error('Unexpected exam exists error');
        }
        throw error;
      }
    },

    async createExamWithForce() {
      try {
        const response = await axios.post(
            `/exams/lesson/${this.examData.lessonId}?forceReplace=true`,
            this.examData
        );

        if (response.data.success) {
          this.examId = response.data.exam.id;
          this.isEditMode = true;
          this.$toast.success('آزمون جدید ایجاد شد (نتایج قبلی حذف شدند)');
          return response;
        } else {
          throw new Error(response.data.message || 'خطا در ایجاد آزمون');
        }
      } catch (error) {
        console.error('Error creating exam with force:', error);
        throw error;
      }
    },

    showDeleteConfirmation(examTitle, submissionCount) {
      return new Promise((resolve) => {
        const message = `این درس قبلاً آزمون "${examTitle}" دارد که ${submissionCount} دانش‌آموز در آن شرکت کرده‌اند.\n\nآیا می‌خواهید آزمون جدید ایجاد کنید؟\n⚠️ تمام نتایج قبلی حذف خواهد شد!`;

        if (this.$swal) {
          this.$swal({
            title: 'هشدار!',
            text: message,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'بله، آزمون جدید ایجاد کن',
            cancelButtonText: 'انصراف',
            reverseButtons: true
          }).then((result) => {
            resolve(result.isConfirmed);
          });
        } else {
          // Fallback به confirm معمولی
          resolve(confirm(message));
        }
      });
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