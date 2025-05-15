<template>
  <div class="exercise-container">
    <div class="container-fluid p-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>{{ isCreating ? 'ایجاد تمرین جدید' : isEditing ? 'ویرایش تمرین' : exercise.title }}</h2>
        
        <div v-if="!isCreating && !isEditing">
          <!-- دکمه‌های نمایش تمرین -->
          <button v-if="isTeacher" class="btn btn-primary ms-2" @click="editExercise">
            <i class="fas fa-edit"></i> ویرایش
          </button>
          <button v-if="isTeacher" class="btn btn-info ms-2" @click="viewResults">
            <i class="fas fa-chart-bar"></i> نتایج
          </button>
          <button v-if="isStudent && !hasSubmitted && !isExpired" class="btn btn-success" @click="startExercise">
            <i class="fas fa-play"></i> شروع تمرین
          </button>
          <button v-if="isStudent && hasSubmitted" class="btn btn-secondary" @click="viewMyResults">
            <i class="fas fa-eye"></i> مشاهده نتیجه من
          </button>
        </div>
        
        <div v-else>
          <button class="btn btn-secondary" @click="cancel">
            <i class="fas fa-times"></i> انصراف
          </button>
        </div>
      </div>

      <loading-spinner :loading="loading">
        <!-- Exercise Info Display (Not in edit mode) -->
        <div v-if="!isCreating && !isEditing && !exercise.inProgress" class="card mb-4">
          <div class="card-header bg-primary text-white">
            <h5 class="mb-0">اطلاعات تمرین</h5>
          </div>
          <div class="card-body">
            <div class="row">
              <div class="col-md-8">
                <div class="mb-3">{{ exercise.description }}</div>
                
                <div class="exercise-meta">
                  <div class="meta-item">
                    <i class="fas fa-clock"></i>
                    <span>زمان مجاز: {{ exercise.timeLimit }} دقیقه</span>
                  </div>
                  <div class="meta-item">
                    <i class="fas fa-check-circle"></i>
                    <span>نمره قبولی: {{ exercise.passingScore }}%</span>
                  </div>
                  <div class="meta-item">
                    <i class="fas fa-question-circle"></i>
                    <span>تعداد سوالات: {{ exercise.questions ? exercise.questions.length : 0 }}</span>
                  </div>
                  <div class="meta-item">
                    <i class="fas fa-random"></i>
                    <span>سطح دشواری: {{ exercise.adaptiveDifficulty ? 'تطبیقی' : 'ثابت' }}</span>
                  </div>
                </div>
                
                <div v-if="isStudent && hasSubmitted" class="exercise-result mt-4">
                  <div class="result-header">
                    <h5>نتیجه شما</h5>
                  </div>
                  <div class="result-stats">
                    <div class="result-stat">
                      <div class="stat-label">نمره</div>
                      <div class="stat-value" :class="{'text-success': submission.passed, 'text-danger': !submission.passed}">
                        {{ submission.score }}%
                      </div>
                    </div>
                    <div class="result-stat">
                      <div class="stat-label">امتیاز زمان</div>
                      <div class="stat-value text-info">+{{ submission.timeBonus }}</div>
                    </div>
                    <div class="result-stat">
                      <div class="stat-label">امتیاز کل</div>
                      <div class="stat-value" :class="{'text-success': submission.passed, 'text-danger': !submission.passed}">
                        {{ submission.totalScore }}
                      </div>
                    </div>
                    <div class="result-stat">
                      <div class="stat-label">وضعیت</div>
                      <div class="stat-value">
                        <span :class="submission.passed ? 'badge bg-success' : 'badge bg-danger'">
                          {{ submission.passed ? 'قبول' : 'مردود' }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-md-4">
                <div class="lesson-info">
                  <h6>اطلاعات درس</h6>
                  <div class="info-item">
                    <div class="info-label">درس:</div>
                    <div class="info-value">{{ exercise.lesson ? exercise.lesson.title : 'نامشخص' }}</div>
                  </div>
                  <div class="info-item">
                    <div class="info-label">دوره:</div>
                    <div class="info-value">{{ getCourseTitle() }}</div>
                  </div>
                  <div class="info-item">
                    <div class="info-label">استاد:</div>
                    <div class="info-value">{{ getTeacherName() }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-if="isTeacher" class="card-footer">
            <button v-if="exercise.questions && exercise.questions.length > 0" class="btn btn-primary" @click="manageQuestions">
              <i class="fas fa-list"></i> مدیریت سوالات
            </button>
            <button v-else class="btn btn-success" @click="addQuestions">
              <i class="fas fa-plus"></i> افزودن سوالات
            </button>
          </div>
        </div>

        <!-- Exercise Creation/Edit Form -->
        <div v-if="isCreating || isEditing" class="card mb-4">
          <div class="card-header bg-primary text-white">
            <h5 class="mb-0">{{ isCreating ? 'ایجاد تمرین جدید' : 'ویرایش تمرین' }}</h5>
          </div>
          <div class="card-body">
            <form @submit.prevent="saveExercise">
              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label for="title" class="form-label">عنوان تمرین</label>
                    <input type="text" class="form-control" id="title" v-model="exerciseForm.title" required>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label for="lessonId" class="form-label">درس</label>
                    <select v-if="isCreating" class="form-select" id="lessonId" v-model="exerciseForm.lessonId" required>
                      <option value="" disabled selected>انتخاب درس</option>
                      <option v-for="lesson in availableLessons" :key="lesson.id" :value="lesson.id">
                        {{ lesson.title }} ({{ lesson.course ? lesson.course.title : 'نامشخص' }})
                      </option>
                    </select>
                    <input v-else type="text" class="form-control" :value="exercise.lesson ? exercise.lesson.title : 'نامشخص'" disabled>
                  </div>
                </div>
              </div>
              
              <div class="mb-3">
                <label for="description" class="form-label">توضیحات</label>
                <textarea class="form-control" id="description" v-model="exerciseForm.description" rows="3" required></textarea>
              </div>
              
              <div class="row">
                <div class="col-md-4">
                  <div class="mb-3">
                    <label for="timeLimit" class="form-label">زمان مجاز (دقیقه)</label>
                    <input type="number" class="form-control" id="timeLimit" v-model="exerciseForm.timeLimit" min="1" required>
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="mb-3">
                    <label for="passingScore" class="form-label">نمره قبولی (درصد)</label>
                    <input type="number" class="form-control" id="passingScore" v-model="exerciseForm.passingScore" min="0" max="100" required>
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="mb-3 pt-4">
                    <div class="form-check form-switch">
                      <input class="form-check-input" type="checkbox" id="adaptiveDifficulty" v-model="exerciseForm.adaptiveDifficulty">
                      <label class="form-check-label" for="adaptiveDifficulty">دشواری تطبیقی</label>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="text-end">
                <button type="button" class="btn btn-secondary me-2" @click="cancel">انصراف</button>
                <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
                  <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  {{ isCreating ? 'ایجاد تمرین' : 'به‌روزرسانی تمرین' }}
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Questions Management Section for Teachers -->
        <div v-if="showQuestionsManager && isTeacher" class="card mb-4">
          <div class="card-header bg-info text-white d-flex justify-content-between align-items-center">
            <h5 class="mb-0">مدیریت سوالات</h5>
            <button class="btn btn-light" @click="showAddQuestionModal">
              <i class="fas fa-plus"></i> افزودن سوال
            </button>
          </div>
          <div class="card-body">
            <question-list
                :questions="exercise.questions || []"
                @add-question="showAddQuestionModal"
                @edit-question="editQuestion"
                @delete-question="confirmDeleteQuestion"
            />
          </div>
        </div>

        <!-- Exercise In Progress (for students) -->
        <div v-if="exercise.inProgress" class="exercise-active">
          <div class="card">
            <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
              <h5 class="mb-0">در حال انجام تمرین: {{ exercise.title }}</h5>
              <div class="exercise-timer" :class="{ 'timer-warning': remainingTime <= 300 }">
                <i class="fas fa-clock me-1"></i>
                <span>{{ formatTime(remainingTime) }}</span>
              </div>
            </div>
            <div class="card-body">
              <div class="progress mb-4">
                <div class="progress-bar" role="progressbar"
                     :style="`width: ${((currentQuestionIndex + 1) / currentQuestions.length) * 100}%`"
                     :aria-valuenow="((currentQuestionIndex + 1) / currentQuestions.length) * 100"
                     aria-valuemin="0" aria-valuemax="100">
                  {{ currentQuestionIndex + 1 }} / {{ currentQuestions.length }}
                </div>
              </div>

              <!-- Current Question -->
              <div class="question-container">
                <h4 class="question-number">سوال {{ currentQuestionIndex + 1 }} از {{ currentQuestions.length }}</h4>
                <div class="question-text">{{ currentQuestion.text }}</div>

                <!-- Multiple Choice -->
                <div v-if="currentQuestion.type === 'MULTIPLE_CHOICE'" class="options-container mt-4">
                  <div v-for="(option, index) in currentQuestion.answers" :key="index" class="option-item">
                    <div class="form-check">
                      <input class="form-check-input" type="radio"
                            :id="`option-${index}`"
                            :name="`question-${currentQuestionIndex}`"
                            :value="index"
                            v-model="answers[currentQuestionIndex]">
                      <label class="form-check-label" :for="`option-${index}`">
                        {{ option.text }}
                      </label>
                    </div>
                  </div>
                </div>

                <!-- True/False -->
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

                <!-- Short Answer -->
                <div v-else-if="currentQuestion.type === 'SHORT_ANSWER'" class="mt-4">
                  <div class="form-group">
                    <label for="short-answer">پاسخ کوتاه:</label>
                    <input type="text" class="form-control mt-2"
                          id="short-answer"
                          v-model="answers[currentQuestionIndex]">
                  </div>
                </div>

                <!-- Navigation Buttons -->
                <div class="exercise-navigation mt-4 d-flex justify-content-between">
                  <button class="btn btn-secondary"
                          @click="previousQuestion"
                          :disabled="currentQuestionIndex === 0">
                    <i class="fas fa-chevron-right me-1"></i> سوال قبلی
                  </button>

                  <div>
                    <button v-if="currentQuestionIndex < currentQuestions.length - 1"
                            class="btn btn-primary"
                            @click="nextQuestion">
                      سوال بعدی <i class="fas fa-chevron-left ms-1"></i>
                    </button>
                    <button v-else
                            class="btn btn-success"
                            @click="finishExercise">
                      پایان تمرین <i class="fas fa-check ms-1"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Question Navigation -->
          <div class="card mt-4">
            <div class="card-header">
              <h5 class="mb-0">راهنمای سوالات</h5>
            </div>
            <div class="card-body">
              <div class="question-nav">
                <button
                  v-for="(_, index) in currentQuestions"
                  :key="index"
                  :class="[
                    'question-nav-item',
                    {'answered': answers[index] !== null && answers[index] !== undefined},
                    {'current': currentQuestionIndex === index}
                  ]"
                  @click="goToQuestion(index)">
                  {{ index + 1 }}
                </button>
              </div>
              <div class="question-nav-legend mt-3">
                <div class="legend-item">
                  <div class="legend-marker answered"></div>
                  <span>پاسخ داده شده</span>
                </div>
                <div class="legend-item">
                  <div class="legend-marker unanswered"></div>
                  <span>بدون پاسخ</span>
                </div>
                <div class="legend-item">
                  <div class="legend-marker current"></div>
                  <span>سوال فعلی</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </loading-spinner>
    </div>

    <!-- مودال افزودن/ویرایش سوال -->
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

    <!-- مودال تأیید حذف سوال -->
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

    <!-- مودال تأیید پایان تمرین -->
    <confirmation-dialog
        modal-id="finishExerciseModal"
        title="پایان تمرین"
        :message="'آیا مطمئن هستید می‌خواهید تمرین را به پایان برسانید؟'"
        :details="getUnsolvedQuestionsText()"
        confirm-text="پایان تمرین"
        confirm-button-type="success"
        icon="check-circle"
        ref="finishExerciseDialog"
        @confirm="submitExercise"
    />
  </div>
</template>

<script>
import axios from 'axios';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import BaseModal from '@/components/common/BaseModal.vue';
import ConfirmationDialog from '@/components/common/ConfirmationDialog.vue';
import QuestionList from '@/components/exams/QuestionList.vue';
import QuestionForm from '@/components/exams/QuestionForm.vue';
import { useUser } from '@/composables/useUser.js';
import { useFormatters } from '@/composables/useFormatters.js';
import formMixin from '@/mixins/formMixin.js';

export default {
  name: 'Exercise',
  components: {
    LoadingSpinner,
    BaseModal,
    ConfirmationDialog,
    QuestionList,
    QuestionForm
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
  setup() {
    const { isTeacher, isStudent } = useUser();
    const { formatDate, formatTime } = useFormatters();

    return {
      isTeacher,
      isStudent,
      formatDate,
      formatTime
    };
  },
  data() {
    return {
      loading: true,
      isCreating: !this.id,
      isEditing: false,
      exercise: {
        title: '',
        description: '',
        timeLimit: 30,
        passingScore: 60,
        lesson: null,
        questions: [],
        adaptiveDifficulty: true,
        inProgress: false
      },
      exerciseForm: {
        title: '',
        description: '',
        timeLimit: 30,
        passingScore: 60,
        lessonId: this.lessonId || '',
        adaptiveDifficulty: true
      },
      availableLessons: [],
      isSubmitting: false,
      showQuestionsManager: false,
      
      // For question management
      currentQuestion: {},
      isEditingQuestion: false,
      selectedQuestion: null,
      isQuestionSubmitting: false,
      
      // For exercise taking (students)
      currentQuestions: [],
      currentQuestionIndex: 0,
      answers: [],
      answerTimes: {},
      startTime: null,
      remainingTime: 0,
      timerInterval: null,
      hasSubmitted: false,
      submission: null,
      
      // For tracking question start times
      questionStartTimes: {}
    };
  },
  computed: {
    isExpired() {
      if (!this.exercise || !this.exercise.expiryDate) return false;
      return new Date(this.exercise.expiryDate) < new Date();
    },
    currentQuestion() {
      if (!this.currentQuestions || this.currentQuestions.length === 0) {
        return { text: 'سوالی وجود ندارد', type: 'MULTIPLE_CHOICE', answers: [] };
      }
      return this.currentQuestions[this.currentQuestionIndex] || {};
    }
  },
  async created() {
    if (this.isCreating) {
      await this.fetchAvailableLessons();
      this.loading = false;
    } else {
      await this.fetchExerciseData();
    }
  },
  beforeUnmount() {
    this.stopTimer();
  },
  methods: {
    async fetchExerciseData() {
      try {
        this.loading = true;

        // Get exercise details
        const response = await axios.get(`/exercises/${this.id}`);
        this.exercise = response.data;
        
        // Update form with exercise data
        this.exerciseForm = {
          title: this.exercise.title,
          description: this.exercise.description,
          timeLimit: this.exercise.timeLimit,
          passingScore: this.exercise.passingScore,
          lessonId: this.exercise.lesson ? this.exercise.lesson.id : '',
          adaptiveDifficulty: this.exercise.adaptiveDifficulty
        };
        
        // Check if the student has already submitted this exercise
        if (this.isStudent) {
          try {
            const submissionResponse = await axios.get(`/exercises/${this.id}/student-submission`);
            if (submissionResponse.data) {
              this.hasSubmitted = true;
              this.submission = submissionResponse.data;
            }
          } catch (error) {
            console.log('No submission found or error fetching submission.');
          }
        }

        this.loading = false;
      } catch (error) {
        console.error('Error fetching exercise data:', error);
        this.showErrorToast('مشکلی در دریافت اطلاعات تمرین رخ داد.');
        this.loading = false;
      }
    },
    
    async fetchAvailableLessons() {
      try {
        // For teachers, fetch their lessons to add exercises to
        const response = await axios.get('/lessons/teaching');
        this.availableLessons = response.data;
      } catch (error) {
        console.error('Error fetching lessons:', error);
        this.showErrorToast('مشکلی در دریافت لیست درس‌ها رخ داد.');
      }
    },
    
    getCourseTitle() {
      if (!this.exercise || !this.exercise.lesson || !this.exercise.lesson.course) {
        return 'نامشخص';
      }
      return this.exercise.lesson.course.title;
    },
    
    getTeacherName() {
      if (!this.exercise || !this.exercise.lesson || !this.exercise.lesson.course || !this.exercise.lesson.course.teacher) {
        return 'نامشخص';
      }
      
      const teacher = this.exercise.lesson.course.teacher;
      return teacher.firstName && teacher.lastName
        ? `${teacher.firstName} ${teacher.lastName}`
        : teacher.username;
    },
    
    editExercise() {
      this.isEditing = true;
      this.showQuestionsManager = false;
    },
    
    cancel() {
      if (this.isCreating) {
        // Navigate back to previous page
        this.$router.go(-1);
      } else {
        // Reset to view mode
        this.isEditing = false;
        this.showQuestionsManager = false;
        // Reset form data
        this.exerciseForm = {
          title: this.exercise.title,
          description: this.exercise.description,
          timeLimit: this.exercise.timeLimit,
          passingScore: this.exercise.passingScore,
          lessonId: this.exercise.lesson ? this.exercise.lesson.id : '',
          adaptiveDifficulty: this.exercise.adaptiveDifficulty
        };
      }
    },
    
    async saveExercise() {
      this.isSubmitting = true;
      
      try {
        let response;
        
        if (this.isCreating) {
          // Create new exercise
          response = await axios.post(`/exercises/lesson/${this.exerciseForm.lessonId}`, {
            title: this.exerciseForm.title,
            description: this.exerciseForm.description,
            timeLimit: this.exerciseForm.timeLimit,
            passingScore: this.exerciseForm.passingScore,
            adaptiveDifficulty: this.exerciseForm.adaptiveDifficulty
          });
          
          // Redirect to the new exercise's page
          this.$router.replace({ 
            name: 'Exercise', 
            params: { id: response.data.id } 
          });
          
          this.showSuccessToast('تمرین با موفقیت ایجاد شد.');
        } else {
          // Update existing exercise
          response = await axios.put(`/exercises/${this.id}`, {
            title: this.exerciseForm.title,
            description: this.exerciseForm.description,
            timeLimit: this.exerciseForm.timeLimit,
            passingScore: this.exerciseForm.passingScore,
            adaptiveDifficulty: this.exerciseForm.adaptiveDifficulty
          });
          
          // Update local data
          this.exercise = {
            ...this.exercise,
            title: response.data.title,
            description: response.data.description,
            timeLimit: response.data.timeLimit,
            passingScore: response.data.passingScore,
            adaptiveDifficulty: response.data.adaptiveDifficulty
          };
          
          // Exit edit mode
          this.isEditing = false;
          
          this.showSuccessToast('تمرین با موفقیت به‌روزرسانی شد.');
        }
      } catch (error) {
        console.error('Error saving exercise:', error);
        this.showErrorToast('مشکلی در ذخیره تمرین رخ داد. لطفاً دوباره تلاش کنید.');
      } finally {
        this.isSubmitting = false;
      }
    },
    
    // Questions Management
    manageQuestions() {
      this.showQuestionsManager = !this.showQuestionsManager;
    },
    
    addQuestions() {
      this.showQuestionsManager = true;
      this.showAddQuestionModal();
    },
    
    showAddQuestionModal() {
      this.isEditingQuestion = false;
      this.currentQuestion = {
        text: '',
        type: 'MULTIPLE_CHOICE',
        answers: [
          { text: '', correct: true },
          { text: '', correct: false },
          { text: '', correct: false },
          { text: '', correct: false }
        ],
        points: 10
      };
      this.$refs.questionModal.show();
    },
    
    editQuestion(question) {
      this.isEditingQuestion = true;
      this.selectedQuestion = question;
      this.currentQuestion = { ...question };
      
      // Ensure answers array exists and has the correct format
      if (!this.currentQuestion.answers || !Array.isArray(this.currentQuestion.answers)) {
        this.currentQuestion.answers = [
          { text: '', correct: true },
          { text: '', correct: false },
          { text: '', correct: false },
          { text: '', correct: false }
        ];
      }
      
      this.$refs.questionModal.show();
    },
    
    async saveQuestion() {
      this.isQuestionSubmitting = true;
      
      try {
        let response;
        const questionData = {
          ...this.currentQuestion,
          exerciseId: this.id
        };
        
        if (this.isEditingQuestion) {
          // Update existing question
          response = await axios.put(`/exercises/questions/${this.selectedQuestion.id}`, questionData);
          
          // Update question in the list
          const index = this.exercise.questions.findIndex(q => q.id === this.selectedQuestion.id);
          if (index !== -1) {
            this.$set(this.exercise.questions, index, response.data);
          }
          
          this.showSuccessToast('سوال با موفقیت به‌روزرسانی شد.');
        } else {
          // Add new question
          response = await axios.post(`/exercises/${this.id}/questions`, questionData);
          
          // Add new question to the list
          if (!this.exercise.questions) {
            this.exercise.questions = [];
          }
          this.exercise.questions.push(response.data);
          
          this.showSuccessToast('سوال جدید با موفقیت اضافه شد.');
        }
        
        // Close the modal
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
        await axios.delete(`/exercises/questions/${this.selectedQuestion.id}`);
        
        // Remove question from the list
        this.exercise.questions = this.exercise.questions.filter(q => q.id !== this.selectedQuestion.id);
        
        this.showSuccessToast('سوال با موفقیت حذف شد.');
      } catch (error) {
        console.error('Error deleting question:', error);
        this.showErrorToast('مشکلی در حذف سوال رخ داد. لطفاً دوباره تلاش کنید.');
      }
    },
    
    // Exercise taking for students
    startExercise() {
      if (!this.exercise || !this.exercise.questions || this.exercise.questions.length === 0) {
        this.showErrorToast('این تمرین هنوز سوالی ندارد.');
        return;
      }
      
      // Set exercise to in-progress mode
      this.exercise.inProgress = true;
      
      // Initialize current questions (might be shuffled)
      this.currentQuestions = [...this.exercise.questions];
      if (this.exercise.adaptiveDifficulty) {
        // If adaptive, sort questions by difficulty (assuming questions have a difficulty property)
        // For now, just shuffle them as a placeholder
        this.currentQuestions.sort(() => Math.random() - 0.5);
      }
      
      // Initialize answers array
      this.answers = Array(this.currentQuestions.length).fill(null);
      this.answerTimes = {};
      
      // Set remaining time
      this.remainingTime = this.exercise.timeLimit * 60; // convert minutes to seconds
      
      // Record start time
      this.startTime = new Date();
      
      // Start the timer
      this.startTimer();
      
      // Record starting time for the first question
      this.recordQuestionStartTime(0);
    },
    
    startTimer() {
      this.timerInterval = setInterval(() => {
        if (this.remainingTime > 0) {
          this.remainingTime--;
        } else {
          // Time's up - automatically submit
          this.stopTimer();
          this.submitExercise();
        }
      }, 1000);
    },
    
    stopTimer() {
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
      }
    },
    
    recordQuestionStartTime(questionIndex) {
      this.questionStartTimes[questionIndex] = new Date();
    },
    
    recordQuestionTime(questionIndex) {
      if (this.questionStartTimes[questionIndex]) {
        const endTime = new Date();
        const startTime = this.questionStartTimes[questionIndex];
        const timeSpent = Math.floor((endTime - startTime) / 1000); // in seconds
        this.answerTimes[questionIndex] = timeSpent;
      }
    },
    
    previousQuestion() {
      if (this.currentQuestionIndex > 0) {
        // Record time spent on current question
        this.recordQuestionTime(this.currentQuestionIndex);
        
        // Move to previous question
        this.currentQuestionIndex--;
        
        // Record new start time
        this.recordQuestionStartTime(this.currentQuestionIndex);
      }
    },
    
    nextQuestion() {
      if (this.currentQuestionIndex < this.currentQuestions.length - 1) {
        // Record time spent on current question
        this.recordQuestionTime(this.currentQuestionIndex);
        
        // Move to next question
        this.currentQuestionIndex++;
        
        // Record new start time
        this.recordQuestionStartTime(this.currentQuestionIndex);
      }
    },
    
    goToQuestion(index) {
      if (index >= 0 && index < this.currentQuestions.length) {
        // Record time spent on current question
        this.recordQuestionTime(this.currentQuestionIndex);
        
        // Move to the selected question
        this.currentQuestionIndex = index;
        
        // Record new start time
        this.recordQuestionStartTime(this.currentQuestionIndex);
      }
    },
    
    finishExercise() {
      // Record time on the last question
      this.recordQuestionTime(this.currentQuestionIndex);
      
      // Check if there are unanswered questions
      const unansweredCount = this.answers.filter(a => a === null || a === undefined).length;
      
      if (unansweredCount > 0) {
        // Show confirmation dialog with warning about unanswered questions
        this.$refs.finishExerciseDialog.show();
      } else {
        // If all questions are answered, proceed to submission
        this.submitExercise();
      }
    },
    
    getUnsolvedQuestionsText() {
      const unansweredCount = this.answers.filter(a => a === null || a === undefined).length;
      if (unansweredCount === 0) return '';
      
      return `هنوز ${unansweredCount} سوال بدون پاسخ وجود دارد. آیا مطمئن هستید؟`;
    },
    
    async submitExercise() {
      // Stop the timer
      this.stopTimer();
      
      try {
        // Prepare submission data
        const submissionData = {
          answers: {},
          answerTimes: {}
        };
        
        // Convert answers to the expected format
        this.currentQuestions.forEach((question, index) => {
          submissionData.answers[question.id] = this.answers[index];
          submissionData.answerTimes[question.id] = this.answerTimes[index] || 0;
        });
        
        // Submit the exercise
        const response = await axios.post(`/exercises/${this.id}/submit`, submissionData);
        
        // Update with submission results
        this.hasSubmitted = true;
        this.submission = response.data;
        
        // Exit in-progress mode
        this.exercise.inProgress = false;
        
        this.showSuccessToast('تمرین با موفقیت ارسال شد.');
      } catch (error) {
        console.error('Error submitting exercise:', error);
        this.showErrorToast('مشکلی در ارسال تمرین رخ داد. لطفاً دوباره تلاش کنید.');
        
        // Stay in in-progress mode so they can try submitting again
      }
    },
    
    // Results viewing
    viewResults() {
      this.$router.push({
        name: 'ExerciseResults',
        params: { id: this.id }
      });
    },
    
    viewMyResults() {
      this.$router.push({
        name: 'ExerciseResult',
        params: { id: this.id }
      });
    }
  }
}
</script>

<style scoped>
.exercise-container {
  min-height: calc(100vh - 56px);
}

.exercise-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-top: 20px;
}

.meta-item {
  display: flex;
  align-items: center;
  background-color: #f8f9fa;
  padding: 10px 15px;
  border-radius: 5px;
}

.meta-item i {
  margin-left: 10px;
  color: #007bff;
}

.lesson-info {
  background-color: #f8f9fa;
  border-radius: 5px;
  padding: 15px;
}

.lesson-info h6 {
  margin-bottom: 15px;
  border-bottom: 1px solid #dee2e6;
  padding-bottom: 10px;
}

.info-item {
  display: flex;
  margin-bottom: 10px;
}

.info-label {
  min-width: 60px;
  font-weight: bold;
}

.exercise-result {
  background-color: #f8f9fa;
  border-radius: 5px;
  padding: 15px;
}

.result-header {
  margin-bottom: 15px;
  border-bottom: 1px solid #dee2e6;
  padding-bottom: 10px;
}

.result-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

.result-stat {
  background-color: white;
  border-radius: 5px;
  padding: 10px 15px;
  min-width: 120px;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.stat-label {
  font-size: 0.9rem;
  color: #6c757d;
  margin-bottom: 5px;
}

.stat-value {
  font-size: 1.2rem;
  font-weight: bold;
}

.text-success {
  color: #28a745;
}

.text-danger {
  color: #dc3545;
}

.text-info {
  color: #17a2b8;
}

/* Exercise in Progress Styles */
.exercise-active {
  margin-bottom: 30px;
}

.exercise-timer {
  background-color: #e9ecef;
  padding: 5px 15px;
  border-radius: 20px;
  font-weight: bold;
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

.question-container {
  padding: 20px;
}

.question-number {
  color: #6c757d;
  font-size: 1rem;
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
  margin-bottom: 30px;
}

.option-item {
  background-color: #f8f9fa;
  border-radius: 5px;
  padding: 12px 15px;
  transition: background-color 0.2s;
}

.option-item:hover {
  background-color: #e9ecef;
}

.question-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 15px;
}

.question-nav-item {
  width: 40px;
  height: 40px;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
}

.question-nav-item:hover {
  background-color: #e9ecef;
}

.question-nav-item.answered {
  background-color: #d4edda;
  border-color: #c3e6cb;
  color: #155724;
}

.question-nav-item.current {
  background-color: #007bff;
  border-color: #007bff;
  color: white;
}

.question-nav-legend {
  display: flex;
  gap: 20px;
}

.legend-item {
  display: flex;
  align-items: center;
  font-size: 0.9rem;
}

.legend-marker {
  width: 20px;
  height: 20px;
  border-radius: 3px;
  margin-left: 8px;
}

.legend-marker.answered {
  background-color: #d4edda;
  border: 1px solid #c3e6cb;
}

.legend-marker.unanswered {
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
}

.legend-marker.current {
  background-color: #007bff;
  border: 1px solid #007bff;
}
</style>
