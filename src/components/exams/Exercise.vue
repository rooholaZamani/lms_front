<template>
  <div class="modern-page-bg" style="min-height: calc(100vh - 56px); padding: 2rem 1rem;">
    <div class="container-fluid">
      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="text-white mb-2">
            <i class="fas fa-dumbbell me-3"></i>
            {{ isCreating ? 'ایجاد تمرین جدید' : isEditing ? 'ویرایش تمرین' : exercise.title }}
          </h2>
          <p class="text-white-50 mb-0">مدیریت تمرین‌ها و تست‌های آموزشی</p>
        </div>

        <div v-if="!isCreating && !isEditing">
          <button v-if="isTeacher" class="modern-btn modern-btn-primary me-2" @click="editExercise">
            <i class="fas fa-edit me-1"></i> ویرایش
          </button>
          <button v-if="isTeacher" class="modern-btn modern-btn-success me-2" @click="viewResults">
            <i class="fas fa-chart-bar me-1"></i> نتایج
          </button>
          <button v-if="isStudent && !hasSubmitted && !isExpired" class="modern-btn modern-btn-warning" @click="startExercise">
            <i class="fas fa-play me-1"></i> شروع تمرین
          </button>
          <button v-if="isStudent && hasSubmitted" class="modern-btn modern-btn-info" @click="viewMyResults">
            <i class="fas fa-eye me-1"></i> مشاهده نتیجه من
          </button>
        </div>

        <div v-else>
          <button class="modern-btn modern-btn-secondary" @click="cancel">
            <i class="fas fa-times me-1"></i> انصراف
          </button>
        </div>
      </div>

      <loading-spinner :loading="loading">
        <!-- Exercise Info Display -->
        <div v-if="!isCreating && !isEditing && !exercise.inProgress" class="modern-card mb-4 animate-slide-up">
          <div class="modern-card-header bg-primary text-white">
            <h5 class="mb-0">
              <i class="fas fa-info-circle me-2"></i>
              اطلاعات تمرین
            </h5>
          </div>
          <div class="modern-card-body">
            <div class="row">
              <div class="col-md-8">
                <div class="form-section">
                  <p class="section-description">{{ exercise.description }}</p>

                  <div class="exercise-meta">
                    <div class="row">
                      <div class="col-md-6 mb-3">
                        <div class="modern-stat-card">
                          <div class="modern-stat-icon text-primary">
                            <i class="fas fa-clock"></i>
                          </div>
                          <div class="modern-stat-value">{{ exercise.timeLimit }}</div>
                          <div class="modern-stat-label">دقیقه زمان مجاز</div>
                        </div>
                      </div>

                      <div class="col-md-6 mb-3">
                        <div class="modern-stat-card">
                          <div class="modern-stat-icon text-success">
                            <i class="fas fa-check-circle"></i>
                          </div>
                          <div class="modern-stat-value">{{ exercise.passingScore }}%</div>
                          <div class="modern-stat-label">نمره قبولی</div>
                        </div>
                      </div>

                      <div class="col-md-6 mb-3">
                        <div class="modern-stat-card">
                          <div class="modern-stat-icon text-warning">
                            <i class="fas fa-question-circle"></i>
                          </div>
                          <div class="modern-stat-value">{{ exercise.questions ? exercise.questions.length : 0 }}</div>
                          <div class="modern-stat-label">تعداد سوالات</div>
                        </div>
                      </div>

                      <div class="col-md-6 mb-3">
                        <div class="modern-stat-card">
                          <div class="modern-stat-icon text-info">
                            <i class="fas fa-random"></i>
                          </div>
                          <div class="modern-stat-value">{{ exercise.adaptiveDifficulty ? 'تطبیقی' : 'ثابت' }}</div>
                          <div class="modern-stat-label">سطح دشواری</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div v-if="isStudent && hasSubmitted" class="form-section">
                  <h6 class="section-title">
                    <i class="fas fa-trophy text-warning me-2"></i>
                    نتیجه شما
                  </h6>
                  <div class="row">
                    <div class="col-md-3">
                      <div class="modern-stat-card" :class="{'success': submission.passed, 'danger': !submission.passed}">
                        <div class="modern-stat-value">{{ submission.score }}%</div>
                        <div class="modern-stat-label">نمره</div>
                      </div>
                    </div>
                    <div class="col-md-3">
                      <div class="modern-stat-card info">
                        <div class="modern-stat-value">+{{ submission.timeBonus }}</div>
                        <div class="modern-stat-label">امتیاز زمان</div>
                      </div>
                    </div>
                    <div class="col-md-3">
                      <div class="modern-stat-card" :class="{'success': submission.passed, 'danger': !submission.passed}">
                        <div class="modern-stat-value">{{ submission.totalScore }}</div>
                        <div class="modern-stat-label">امتیاز کل</div>
                      </div>
                    </div>
                    <div class="col-md-3">
                      <div class="modern-stat-card">
                        <div class="modern-stat-value">
                          <span :class="submission.passed ? 'modern-badge modern-badge-success' : 'modern-badge modern-badge-danger'">
                            {{ submission.passed ? 'قبول' : 'مردود' }}
                          </span>
                        </div>
                        <div class="modern-stat-label">وضعیت</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="col-md-4">
                <div class="form-section">
                  <h6 class="section-title">
                    <i class="fas fa-book me-2"></i>
                    اطلاعات درس
                  </h6>
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

          <div v-if="isTeacher" class="modern-card-footer">
            <button v-if="exercise.questions && exercise.questions.length > 0" class="modern-btn modern-btn-primary" @click="manageQuestions">
              <i class="fas fa-list me-1"></i> مدیریت سوالات
            </button>
            <button v-else class="modern-btn modern-btn-success" @click="addQuestions">
              <i class="fas fa-plus me-1"></i> افزودن سوالات
            </button>
          </div>
        </div>

        <!-- Exercise Creation/Edit Form -->
        <div v-if="isCreating || isEditing" class="modern-card mb-4 animate-slide-up">
          <div class="modern-card-header bg-primary text-white">
            <h5 class="mb-0">
              <i class="fas fa-edit me-2"></i>
              {{ isCreating ? 'ایجاد تمرین جدید' : 'ویرایش تمرین' }}
            </h5>
          </div>
          <div class="modern-card-body">
            <form @submit.prevent="saveExercise">
              <div class="form-section">
                <h6 class="section-title">
                  <i class="fas fa-info-circle me-2"></i>
                  اطلاعات کلی
                </h6>

                <div class="row">
                  <div class="col-md-6 modern-form-group">
                    <label for="title" class="modern-form-label">عنوان تمرین</label>
                    <input type="text" class="modern-form-control" id="title" v-model="exerciseForm.title" required>
                  </div>
                  <div class="col-md-6 modern-form-group">
                    <label for="lessonId" class="modern-form-label">درس</label>
                    <select v-if="isCreating" class="modern-form-control" id="lessonId" v-model="exerciseForm.lessonId" required>
                      <option value="" disabled selected>انتخاب درس</option>
                      <option v-for="lesson in availableLessons" :key="lesson.id" :value="lesson.id">
                        {{ lesson.title }} ({{ lesson.course ? lesson.course.title : 'نامشخص' }})
                      </option>
                    </select>
                    <input v-else type="text" class="modern-form-control" :value="exercise.lesson ? exercise.lesson.title : 'نامشخص'" disabled>
                  </div>
                </div>

                <div class="modern-form-group">
                  <label for="description" class="modern-form-label">توضیحات</label>
                  <textarea class="modern-form-control" id="description" v-model="exerciseForm.description" rows="3" required></textarea>
                </div>
              </div>

              <div class="form-section">
                <h6 class="section-title">
                  <i class="fas fa-cog me-2"></i>
                  تنظیمات
                </h6>

                <div class="row">
                  <div class="col-md-4 modern-form-group">
                    <label for="timeLimit" class="modern-form-label">زمان مجاز (دقیقه)</label>
                    <input type="number" class="modern-form-control" id="timeLimit" v-model="exerciseForm.timeLimit" min="1" required>
                  </div>
                  <div class="col-md-4 modern-form-group">
                    <label for="passingScore" class="modern-form-label">نمره قبولی (درصد)</label>
                    <input type="number" class="modern-form-control" id="passingScore" v-model="exerciseForm.passingScore" min="0" max="100" required>
                  </div>
                  <div class="col-md-4 modern-form-group">
                    <div class="form-check mt-4">
                      <input class="form-check-input" type="checkbox" id="adaptiveDifficulty" v-model="exerciseForm.adaptiveDifficulty">
                      <label class="form-check-label" for="adaptiveDifficulty">دشواری تطبیقی</label>
                    </div>
                  </div>
                </div>
              </div>

              <div class="text-end">
                <button type="button" class="modern-btn modern-btn-secondary me-2" @click="cancel">انصراف</button>
                <button type="submit" class="modern-btn modern-btn-primary" :disabled="isSubmitting">
                  <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  {{ isCreating ? 'ایجاد تمرین' : 'به‌روزرسانی تمرین' }}
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Questions Management Section -->
        <div v-if="showQuestionsManager && isTeacher" class="modern-card mb-4 animate-slide-up" style="animation-delay: 0.1s;">
          <div class="modern-card-header bg-info text-white d-flex justify-content-between align-items-center">
            <h5 class="mb-0">
              <i class="fas fa-question-circle me-2"></i>
              مدیریت سوالات
            </h5>
            <button class="modern-btn modern-btn-light" @click="showAddQuestionModal">
              <i class="fas fa-plus me-1"></i> افزودن سوال
            </button>
          </div>
          <div class="modern-card-body">
            <question-list
                :questions="exercise.questions || []"
                @add-question="showAddQuestionModal"
                @edit-question="editQuestion"
                @delete-question="confirmDeleteQuestion"
            />
          </div>
        </div>

        <!-- Exercise In Progress -->
        <div v-if="exercise.inProgress" class="exercise-active">
          <div class="modern-card animate-slide-up">
            <div class="modern-card-header bg-warning text-dark d-flex justify-content-between align-items-center">
              <h5 class="mb-0">
                <i class="fas fa-play-circle me-2"></i>
                در حال انجام تمرین: {{ exercise.title }}
              </h5>
              <div class="exercise-timer" :class="{ 'timer-warning': remainingTime <= 300 }">
                <i class="fas fa-clock me-1"></i>
                <span>{{ formatTime(remainingTime) }}</span>
              </div>
            </div>
            <div class="modern-card-body">
              <div class="progress mb-4">
                <div class="progress-bar" role="progressbar"
                     :style="`width: ${((currentQuestionIndex + 1) / currentQuestions.length) * 100}%`"
                     :aria-valuenow="((currentQuestionIndex + 1) / currentQuestions.length) * 100"
                     aria-valuemin="0" aria-valuemax="100">
                  {{ currentQuestionIndex + 1 }} / {{ currentQuestions.length }}
                </div>
              </div>

              <!-- Current Question -->
              <div class="form-section">
                <h4 class="section-title">سوال {{ currentQuestionIndex + 1 }} از {{ currentQuestions.length }}</h4>
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
                      <label class="form-check-label" for="option-true">درست</label>
                    </div>
                  </div>
                  <div class="option-item">
                    <div class="form-check">
                      <input class="form-check-input" type="radio"
                             id="option-false"
                             :name="`question-${currentQuestionIndex}`"
                             value="false"
                             v-model="answers[currentQuestionIndex]">
                      <label class="form-check-label" for="option-false">نادرست</label>
                    </div>
                  </div>
                </div>

                <!-- Short Answer -->
                <div v-else-if="currentQuestion.type === 'SHORT_ANSWER'" class="mt-4">
                  <div class="modern-form-group">
                    <label for="short-answer" class="modern-form-label">پاسخ کوتاه:</label>
                    <input type="text" class="modern-form-control"
                           id="short-answer"
                           v-model="answers[currentQuestionIndex]">
                  </div>
                </div>

                <!-- Navigation Buttons -->
                <div class="exercise-navigation mt-4 d-flex justify-content-between">
                  <button class="modern-btn modern-btn-secondary"
                          @click="previousQuestion"
                          :disabled="currentQuestionIndex === 0">
                    <i class="fas fa-chevron-right me-1"></i> سوال قبلی
                  </button>

                  <div>
                    <button v-if="currentQuestionIndex < currentQuestions.length - 1"
                            class="modern-btn modern-btn-primary"
                            @click="nextQuestion">
                      سوال بعدی <i class="fas fa-chevron-left ms-1"></i>
                    </button>
                    <button v-else
                            class="modern-btn modern-btn-success"
                            @click="finishExercise">
                      پایان تمرین <i class="fas fa-check ms-1"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Question Navigation -->
          <div class="modern-card mt-4 animate-slide-up" style="animation-delay: 0.1s;">
            <div class="modern-card-header">
              <h5 class="mb-0">
                <i class="fas fa-map me-2"></i>
                راهنمای سوالات
              </h5>
            </div>
            <div class="modern-card-body">
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

    <!-- Modals -->
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
        const response = await axios.get(`/exercises/${this.id}`);
        this.exercise = response.data;

        this.exerciseForm = {
          title: this.exercise.title,
          description: this.exercise.description,
          timeLimit: this.exercise.timeLimit,
          passingScore: this.exercise.passingScore,
          lessonId: this.exercise.lesson ? this.exercise.lesson.id : '',
          adaptiveDifficulty: this.exercise.adaptiveDifficulty
        };

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
        this.$router.go(-1);
      } else {
        this.isEditing = false;
        this.showQuestionsManager = false;
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
          response = await axios.post(`/exercises/lesson/${this.exerciseForm.lessonId}`, {
            title: this.exerciseForm.title,
            description: this.exerciseForm.description,
            timeLimit: this.exerciseForm.timeLimit,
            passingScore: this.exerciseForm.passingScore,
            adaptiveDifficulty: this.exerciseForm.adaptiveDifficulty
          });

          this.$router.replace({
            name: 'Exercise',
            params: { id: response.data.id }
          });

          this.showSuccessToast('تمرین با موفقیت ایجاد شد.');
        } else {
          response = await axios.put(`/exercises/${this.id}`, {
            title: this.exerciseForm.title,
            description: this.exerciseForm.description,
            timeLimit: this.exerciseForm.timeLimit,
            passingScore: this.exerciseForm.passingScore,
            adaptiveDifficulty: this.exerciseForm.adaptiveDifficulty
          });

          this.exercise = {
            ...this.exercise,
            title: response.data.title,
            description: response.data.description,
            timeLimit: response.data.timeLimit,
            passingScore: response.data.passingScore,
            adaptiveDifficulty: response.data.adaptiveDifficulty
          };

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
          response = await axios.put(`/exercises/questions/${this.selectedQuestion.id}`, questionData);
          const index = this.exercise.questions.findIndex(q => q.id === this.selectedQuestion.id);
          if (index !== -1) {
            this.exercise.questions[index] = response.data;
          }
          this.showSuccessToast('سوال با موفقیت به‌روزرسانی شد.');
        } else {
          response = await axios.post(`/exercises/${this.id}/questions`, questionData);
          if (!this.exercise.questions) {
            this.exercise.questions = [];
          }
          this.exercise.questions.push(response.data);
          this.showSuccessToast('سوال جدید با موفقیت اضافه شد.');
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
        await axios.delete(`/exercises/questions/${this.selectedQuestion.id}`);
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

      this.exercise.inProgress = true;
      this.currentQuestions = [...this.exercise.questions];
      if (this.exercise.adaptiveDifficulty) {
        this.currentQuestions.sort(() => Math.random() - 0.5);
      }

      this.answers = Array(this.currentQuestions.length).fill(null);
      this.answerTimes = {};
      this.remainingTime = this.exercise.timeLimit * 60;
      this.startTime = new Date();
      this.startTimer();
      this.recordQuestionStartTime(0);
    },

    startTimer() {
      this.timerInterval = setInterval(() => {
        if (this.remainingTime > 0) {
          this.remainingTime--;
        } else {
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
        const timeSpent = Math.floor((endTime - startTime) / 1000);
        this.answerTimes[questionIndex] = timeSpent;
      }
    },

    previousQuestion() {
      if (this.currentQuestionIndex > 0) {
        this.recordQuestionTime(this.currentQuestionIndex);
        this.currentQuestionIndex--;
        this.recordQuestionStartTime(this.currentQuestionIndex);
      }
    },

    nextQuestion() {
      if (this.currentQuestionIndex < this.currentQuestions.length - 1) {
        this.recordQuestionTime(this.currentQuestionIndex);
        this.currentQuestionIndex++;
        this.recordQuestionStartTime(this.currentQuestionIndex);
      }
    },

    goToQuestion(index) {
      if (index >= 0 && index < this.currentQuestions.length) {
        this.recordQuestionTime(this.currentQuestionIndex);
        this.currentQuestionIndex = index;
        this.recordQuestionStartTime(this.currentQuestionIndex);
      }
    },

    finishExercise() {
      this.recordQuestionTime(this.currentQuestionIndex);
      const unansweredCount = this.answers.filter(a => a === null || a === undefined).length;

      if (unansweredCount > 0) {
        this.$refs.finishExerciseDialog.show();
      } else {
        this.submitExercise();
      }
    },

    getUnsolvedQuestionsText() {
      const unansweredCount = this.answers.filter(a => a === null || a === undefined).length;
      if (unansweredCount === 0) return '';
      return `هنوز ${unansweredCount} سوال بدون پاسخ وجود دارد. آیا مطمئن هستید؟`;
    },

    async submitExercise() {
      this.stopTimer();

      try {
        const submissionData = {
          answers: {},
          answerTimes: {}
        };

        this.currentQuestions.forEach((question, index) => {
          submissionData.answers[question.id] = this.answers[index];
          submissionData.answerTimes[question.id] = this.answerTimes[index] || 0;
        });

        const response = await axios.post(`/exercises/${this.id}/submit`, submissionData);
        this.hasSubmitted = true;
        this.submission = response.data;
        this.exercise.inProgress = false;
        this.showSuccessToast('تمرین با موفقیت ارسال شد.');
      } catch (error) {
        console.error('Error submitting exercise:', error);
        this.showErrorToast('مشکلی در ارسال تمرین رخ داد. لطفاً دوباره تلاش کنید.');
      }
    },

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
/* Exercise specific styles */
.exercise-timer {
  background-color: rgba(255, 255, 255, 0.2);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: bold;
}

.timer-warning {
  background-color: #fff3cd;
  color: #856404;
  animation: pulse 1.5s infinite;
}

.section-description {
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 2rem;
  color: #6c757d;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid rgba(0,0,0,0.05);
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  font-weight: 600;
  color: #495057;
}

.info-value {
  color: #6c757d;
}

.question-text {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #333;
}

.options-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.option-item {
  background: rgba(255, 255, 255, 0.5);
  border: 2px solid #e9ecef;
  border-radius: 12px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.option-item:hover {
  border-color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
}

.form-check-input:checked + .form-check-label {
  color: #667eea;
  font-weight: 600;
}

.question-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.question-nav-item {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
  border: 2px solid #dee2e6;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.question-nav-item:hover {
  background-color: #e9ecef;
  transform: scale(1.05);
}

.question-nav-item.answered {
  background-color: #d4edda;
  border-color: #c3e6cb;
  color: #155724;
}

.question-nav-item.current {
  background-color: #667eea;
  border-color: #667eea;
  color: white;
}

.question-nav-legend {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  font-size: 0.9rem;
}

.legend-marker {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  margin-left: 0.5rem;
}

.legend-marker.answered {
  background-color: #d4edda;
  border: 2px solid #c3e6cb;
}

.legend-marker.unanswered {
  background-color: #f8f9fa;
  border: 2px solid #dee2e6;
}

.legend-marker.current {
  background-color: #667eea;
  border: 2px solid #667eea;
}

/* Modern stat card variants */
.modern-stat-card.success {
  background: linear-gradient(135deg, rgba(40, 167, 69, 0.1), rgba(25, 135, 84, 0.1));
  border-color: #28a745;
}

.modern-stat-card.danger {
  background: linear-gradient(135deg, rgba(220, 53, 69, 0.1), rgba(204, 43, 57, 0.1));
  border-color: #dc3545;
}

.modern-stat-card.info {
  background: linear-gradient(135deg, rgba(23, 162, 184, 0.1), rgba(13, 145, 169, 0.1));
  border-color: #17a2b8;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .exercise-timer {
    font-size: 0.9rem;
    padding: 0.25rem 0.75rem;
  }

  .question-nav-item {
    width: 35px;
    height: 35px;
    font-size: 0.85rem;
  }

  .legend-item {
    font-size: 0.8rem;
  }

  .question-text {
    font-size: 1rem;
  }
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.8; }
  100% { opacity: 1; }
}
</style>