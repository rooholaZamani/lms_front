<template>
  <div class="exercise-container">
    <!-- Loading State -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">در حال بارگذاری...</span>
      </div>
    </div>

    <!-- Main Content -->
    <div v-else class="container-fluid">
      <!-- Header -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="modern-card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <div>
                <h4 class="mb-0">
                  <i class="fas fa-dumbbell me-2"></i>
                  {{ isCreating ? 'ایجاد تمرین جدید' : (exercise ? exercise.title : 'تمرین') }}
                </h4>
                <p class="text-muted mb-0" v-if="!isCreating && exercise">
                  درس: {{ exercise.lesson ? exercise.lesson.title : 'نامشخص' }} |
                  کورس: {{ getCourseTitle() }} |
                  مدرس: {{ getTeacherName() }}
                </p>
              </div>
              <button @click="goBack" class="modern-btn modern-btn-outline-secondary">
                <i class="fas fa-arrow-right me-1"></i>
                بازگشت
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Exercise Form (Create/Edit Mode) -->
      <div v-if="isCreating || isEditing" class="row">
        <div class="col-12">
          <div class="modern-card">
            <div class="card-header">
              <h5 class="mb-0">
                <i class="fas fa-edit me-2"></i>
                {{ isCreating ? 'اطلاعات تمرین جدید' : 'ویرایش تمرین' }}
              </h5>
            </div>
            <div class="card-body">
              <form @submit.prevent="saveExercise">
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label class="form-label">عنوان تمرین</label>
                    <input
                        type="text"
                        class="form-control"
                        v-model="exerciseForm.title"
                        required
                        placeholder="عنوان تمرین را وارد کنید"
                    >
                  </div>
                  <div class="col-md-6 mb-3" v-if="isCreating">
                    <label class="form-label">درس</label>
                    <select class="form-select" v-model="exerciseForm.lessonId" required>
                      <option value="">انتخاب درس</option>
                      <option v-for="lesson in availableLessons" :key="lesson.id" :value="lesson.id">
                        {{ lesson.title }} ({{ lesson.course ? lesson.course.title : '' }})
                      </option>
                    </select>
                  </div>
                </div>

                <div class="mb-3">
                  <label class="form-label">توضیحات</label>
                  <textarea
                      class="form-control"
                      rows="3"
                      v-model="exerciseForm.description"
                      placeholder="توضیحات تمرین را وارد کنید"
                  ></textarea>
                </div>

                <div class="row">
                  <div class="col-md-4 mb-3">
                    <label class="form-label">محدودیت زمانی (دقیقه)</label>
                    <input
                        type="number"
                        class="form-control"
                        v-model.number="exerciseForm.timeLimit"
                        min="1"
                        placeholder="زمان به دقیقه"
                    >
                  </div>
                  <div class="col-md-4 mb-3">
                    <label class="form-label">نمره قبولی</label>
                    <input
                        type="number"
                        class="form-control"
                        v-model.number="exerciseForm.passingScore"
                        min="0"
                        max="100"
                        placeholder="نمره قبولی از 100"
                    >
                  </div>
                  <div class="col-md-4 mb-3">
                    <div class="form-check mt-4">
                      <input
                          class="form-check-input"
                          type="checkbox"
                          v-model="exerciseForm.adaptiveDifficulty"
                          id="adaptiveDifficulty"
                      >
                      <label class="form-check-label" for="adaptiveDifficulty">
                        سختی تطبیقی
                      </label>
                    </div>
                  </div>
                </div>

                <div class="d-flex gap-2">
                  <button type="submit" class="modern-btn modern-btn-primary" :disabled="submitting">
                    <i class="fas fa-save me-1"></i>
                    {{ submitting ? 'در حال ذخیره...' : (isCreating ? 'ایجاد تمرین' : 'ذخیره تغییرات') }}
                  </button>
                  <button type="button" @click="cancel" class="modern-btn modern-btn-outline-secondary">
                    <i class="fas fa-times me-1"></i>
                    انصراف
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <!-- Exercise Details View -->
      <div v-else-if="exercise">
        <!-- Exercise Info -->
        <div class="row mb-4">
          <div class="col-md-8">
            <div class="modern-card">
              <div class="card-body">
                <h5 class="card-title">{{ exercise.title }}</h5>
                <p class="card-text" v-if="exercise.description">{{ exercise.description }}</p>

                <div class="exercise-meta">
                  <div class="meta-item">
                    <i class="fas fa-clock text-primary me-2"></i>
                    <span>محدودیت زمانی: {{ exercise.timeLimit || 'نامحدود' }} دقیقه</span>
                  </div>
                  <div class="meta-item">
                    <i class="fas fa-check-circle text-success me-2"></i>
                    <span>نمره قبولی: {{ exercise.passingScore || 0 }}</span>
                  </div>
                  <div class="meta-item">
                    <i class="fas fa-chart-line text-info me-2"></i>
                    <span>سختی تطبیقی: {{ exercise.adaptiveDifficulty ? 'فعال' : 'غیرفعال' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-md-4">
            <div class="modern-card">
              <div class="card-body text-center">
                <h6 class="card-title">وضعیت تمرین</h6>
                <div class="exercise-status">
                  <div class="status-item">
                    <div class="status-number">{{ questions.length }}</div>
                    <div class="status-label">سوال</div>
                  </div>
                  <div class="status-item" v-if="isTeacher">
                    <div class="status-number">{{ submissions.length }}</div>
                    <div class="status-label">پاسخ ارسالی</div>
                  </div>
                </div>

                <!-- Teacher Actions -->
                <div v-if="isTeacher" class="mt-3 d-grid gap-2">
                  <button @click="editExercise" class="modern-btn modern-btn-primary">
                    <i class="fas fa-edit me-1"></i>
                    ویرایش تمرین
                  </button>
                  <button @click="showQuestionsManager = true" class="modern-btn modern-btn-info">
                    <i class="fas fa-question-circle me-1"></i>
                    مدیریت سوالات
                  </button>
                </div>

                <!-- Student Submission Status -->
                <div v-if="isStudent" class="mt-3">
                  <div v-if="hasSubmitted" class="alert alert-success">
                    <i class="fas fa-check-circle me-2"></i>
                    شما این تمرین را ارسال کرده‌اید
                    <div class="mt-2">
                      <small>نمره: {{ submission.totalScore || submission.score || 0 }}</small>
                    </div>
                  </div>
                  <div v-else class="d-grid">
                    <button @click="startExercise" class="modern-btn modern-btn-success">
                      <i class="fas fa-play me-1"></i>
                      شروع تمرین
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Questions Manager -->
        <div v-if="showQuestionsManager && isTeacher" class="row mb-4">
          <div class="col-12">
            <div class="modern-card">
              <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0">
                  <i class="fas fa-question-circle me-2"></i>
                  مدیریت سوالات
                </h5>
                <button @click="showQuestionsManager = false" class="modern-btn modern-btn-outline-secondary">
                  <i class="fas fa-times me-1"></i>
                  بستن
                </button>
              </div>
              <div class="card-body">
                <!-- Question Form -->
                <form @submit.prevent="addQuestion" class="mb-4">
                  <div class="mb-3">
                    <label class="form-label">متن سوال</label>
                    <textarea
                        class="form-control"
                        v-model="questionForm.text"
                        rows="2"
                        required
                        placeholder="متن سوال را وارد کنید"
                    ></textarea>
                  </div>

                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <label class="form-label">امتیاز</label>
                      <input
                          type="number"
                          class="form-control"
                          v-model.number="questionForm.points"
                          min="1"
                          required
                      >
                    </div>
                    <div class="col-md-6 mb-3">
                      <label class="form-label">محدودیت زمان (ثانیه)</label>
                      <input
                          type="number"
                          class="form-control"
                          v-model.number="questionForm.timeLimit"
                          min="10"
                      >
                    </div>
                  </div>

                  <!-- Options -->
                  <div class="mb-3">
                    <label class="form-label">گزینه‌های پاسخ</label>
                    <div v-for="(option, index) in questionForm.options" :key="index" class="input-group mb-2">
                      <input
                          type="text"
                          class="form-control"
                          v-model="option.text"
                          :placeholder="`گزینه ${index + 1}`"
                          required
                      >
                      <div class="input-group-text">
                        <input
                            class="form-check-input"
                            type="radio"
                            :name="`correct-option`"
                            v-model="questionForm.correctOption"
                            :value="index"
                        >
                      </div>
                      <button
                          type="button"
                          @click="removeOption(index)"
                          class="btn btn-outline-danger"
                          v-if="questionForm.options.length > 2"
                      >
                        <i class="fas fa-times"></i>
                      </button>
                    </div>
                    <button
                        type="button"
                        @click="addOption"
                        class="btn btn-outline-primary btn-sm"
                    >
                      <i class="fas fa-plus me-1"></i>
                      افزودن گزینه
                    </button>
                  </div>

                  <button type="submit" class="modern-btn modern-btn-success" :disabled="submitting">
                    <i class="fas fa-plus me-1"></i>
                    {{ submitting ? 'در حال افزودن...' : 'افزودن سوال' }}
                  </button>
                </form>

                <!-- Questions List -->
                <div v-if="questions.length > 0">
                  <h6>سوالات موجود ({{ questions.length }})</h6>
                  <div class="questions-list">
                    <div v-for="(question, index) in questions" :key="question.id" class="question-item">
                      <div class="question-header">
                        <span class="question-number">{{ index + 1 }}</span>
                        <span class="question-text">{{ question.text }}</span>
                        <span class="question-points">{{ question.points }} امتیاز</span>
                      </div>
                      <div class="question-options">
                        <div v-for="option in question.options" :key="option.id"
                             :class="['option-item', { 'correct-option': option.correct }]">
                          <i :class="option.correct ? 'fas fa-check-circle text-success' : 'far fa-circle'"></i>
                          {{ option.text }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Student Answers Section (For Teachers) -->
        <div v-if="isTeacher && !isEditing && !showQuestionsManager" class="row">
          <div class="col-12">
            <div class="modern-card">
              <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0">
                  <i class="fas fa-users me-2"></i>
                  پاسخ‌های دانش‌آموزان
                </h5>
                <div class="d-flex gap-2">
                  <button
                      @click="fetchSubmissions"
                      class="modern-btn modern-btn-outline-primary"
                      :disabled="loadingSubmissions"
                  >
                    <i class="fas fa-sync-alt me-1" :class="{'fa-spin': loadingSubmissions}"></i>
                    بروزرسانی
                  </button>
                  <button
                      @click="downloadAnswersCSV"
                      class="modern-btn modern-btn-success"
                      :disabled="!hasSubmissions"
                  >
                    <i class="fas fa-download me-1"></i>
                    دانلود CSV
                  </button>
                </div>
              </div>

              <div class="card-body">
                <div v-if="loadingSubmissions" class="text-center py-4">
                  <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">در حال بارگذاری...</span>
                  </div>
                </div>

                <div v-else-if="!hasSubmissions" class="text-center py-4 text-muted">
                  <i class="fas fa-inbox fa-3x mb-3"></i>
                  <p>هنوز هیچ پاسخی ارسال نشده است</p>
                </div>

                <div v-else>
                  <div class="table-responsive">
                    <table class="table table-hover">
                      <thead class="table-light">
                      <tr>
                        <th>دانش‌آموز</th>
                        <th>زمان ارسال</th>
                        <th>نمره</th>
                        <th>وضعیت</th>
                        <th>عملیات</th>
                      </tr>
                      </thead>
                      <tbody>
                      <tr v-for="submission in submissions" :key="submission.id">
                        <td>
                          <div class="d-flex align-items-center">
                            <div class="avatar-sm me-2">
                              {{ getStudentName(submission).charAt(0) }}
                            </div>
                            {{ getStudentName(submission) }}
                          </div>
                        </td>
                        <td>
                          {{ new Date(submission.submissionTime).toLocaleString('fa-IR') }}
                        </td>
                        <td>
                            <span class="badge" :class="submission.passed ? 'bg-success' : 'bg-danger'">
                              {{ submission.totalScore || submission.score || 0 }}
                            </span>
                        </td>
                        <td>
                            <span class="badge" :class="submission.passed ? 'bg-success' : 'bg-danger'">
                              {{ submission.passed ? 'قبول' : 'رد' }}
                            </span>
                        </td>
                        <td>
                          <button
                              @click="showSubmissionDetail(submission)"
                              class="btn btn-sm btn-outline-primary"
                          >
                            <i class="fas fa-eye me-1"></i>
                            مشاهده جزئیات
                          </button>
                        </td>
                      </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Submission Detail Modal -->
    <div class="modal fade" id="submissionDetailModal" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">جزئیات پاسخ - {{ selectedSubmission?.student ? getStudentName(selectedSubmission) : '' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body" v-if="selectedSubmission">
            <div class="row mb-3">
              <div class="col-md-6">
                <strong>زمان ارسال:</strong>
                {{ new Date(selectedSubmission.submissionTime).toLocaleString('fa-IR') }}
              </div>
              <div class="col-md-6">
                <strong>نمره نهایی:</strong>
                {{ selectedSubmission.totalScore || selectedSubmission.score || 0 }}
              </div>
            </div>

            <h6>پاسخ‌های ارسالی:</h6>
            <div v-if="questions && questions.length > 0">
              <div v-for="(question, index) in questions" :key="question.id" class="card mb-3">
                <div class="card-body">
                  <h6 class="card-title">سوال {{ index + 1 }}</h6>
                  <p class="card-text">{{ question.text }}</p>

                  <div class="row">
                    <div class="col-md-8">
                      <strong>پاسخ انتخاب شده:</strong>
                      <span class="ms-2">
                        {{ getAnswerText(question, selectedSubmission.answers ? selectedSubmission.answers[question.id.toString()] : null) }}
                      </span>
                    </div>
                    <div class="col-md-4">
                      <strong>زمان پاسخ:</strong>
                      <span class="ms-2">
                        {{ selectedSubmission.answerTimes ? selectedSubmission.answerTimes[question.id.toString()] || 0 : 0 }} ثانیه
                      </span>
                    </div>
                  </div>

                  <!-- نمایش گزینه‌های سوال -->
                  <div class="mt-2">
                    <small class="text-muted">گزینه‌های سوال:</small>
                    <ul class="list-unstyled mt-1">
                      <li v-for="option in question.options" :key="option.id"
                          :class="{'text-success fw-bold': option.correct, 'text-primary': selectedSubmission.answers && selectedSubmission.answers[question.id.toString()] == option.id}">
                        <i :class="option.correct ? 'fas fa-check text-success' : 'far fa-circle'"></i>
                        {{ option.text }}
                        <span v-if="selectedSubmission.answers && selectedSubmission.answers[question.id.toString()] == option.id" class="badge bg-primary ms-2">انتخاب شده</span>
                        <span v-if="option.correct" class="badge bg-success ms-2">پاسخ صحیح</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">بستن</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { mapGetters } from 'vuex';

export default {
  name: 'Exercise',
  props: ['id'],

  data() {
    return {
      loading: false,
      submitting: false,
      exercise: null,
      questions: [],
      submissions: [],
      selectedSubmission: null,
      isCreating: false,
      isEditing: false,
      showQuestionsManager: false,
      loadingSubmissions: false,
      hasSubmitted: false,
      submission: null,
      availableLessons: [],

      exerciseForm: {
        title: '',
        description: '',
        timeLimit: 30,
        passingScore: 60,
        lessonId: '',
        adaptiveDifficulty: false
      },

      questionForm: {
        text: '',
        points: 10,
        timeLimit: 60,
        options: [
          { text: '', correct: false },
          { text: '', correct: false }
        ],
        correctOption: 0
      }
    };
  },

  computed: {
    ...mapGetters(['currentUser', 'isTeacher', 'isStudent']),

    hasSubmissions() {
      return this.submissions && this.submissions.length > 0;
    }
  },

  async mounted() {
    if (this.$route.query.create === 'true') {
      this.isCreating = true;
      await this.fetchAvailableLessons();
    } else if (this.id) {
      await this.loadExercise();
      if (this.isTeacher) {
        await this.fetchSubmissions();
      }
    }
  },

  methods: {
    async loadExercise() {
      this.loading = true;
      try {
        // Load exercise details
        const exerciseResponse = await axios.get(`/exercises/${this.id}`);
        this.exercise = exerciseResponse.data;

        // Load questions
        const questionsResponse = await axios.get(`/exercises/${this.id}/questions`);
        this.questions = questionsResponse.data;

        // Initialize form with exercise data
        this.exerciseForm = {
          title: this.exercise.title || '',
          description: this.exercise.description || '',
          timeLimit: this.exercise.timeLimit || 30,
          passingScore: this.exercise.passingScore || 60,
          lessonId: this.exercise.lesson ? this.exercise.lesson.id : '',
          adaptiveDifficulty: this.exercise.adaptiveDifficulty || false
        };

        // Check student submission status
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

    async fetchSubmissions() {
      if (!this.isTeacher) return;

      this.loadingSubmissions = true;
      try {
        const response = await axios.get(`/exercises/${this.id}/submissions`);
        this.submissions = response.data;
      } catch (error) {
        console.error('Error fetching submissions:', error);
        this.showErrorToast('خطا در دریافت پاسخ‌های دانش‌آموزان');
      } finally {
        this.loadingSubmissions = false;
      }
    },

    async saveExercise() {
      this.submitting = true;
      try {
        if (this.isCreating) {
          const response = await axios.post(`/exercises/lesson/${this.exerciseForm.lessonId}`, this.exerciseForm);
          this.showSuccessToast('تمرین با موفقیت ایجاد شد.');
          this.$router.push(`/exercises/${response.data.id}`);
        } else {
          await axios.put(`/exercises/${this.id}`, this.exerciseForm);
          this.exercise = { ...this.exercise, ...this.exerciseForm };
          this.isEditing = false;
          this.showSuccessToast('تمرین با موفقیت به‌روزرسانی شد.');
        }
      } catch (error) {
        console.error('Error saving exercise:', error);
        this.showErrorToast('خطا در ذخیره تمرین. لطفاً دوباره تلاش کنید.');
      } finally {
        this.submitting = false;
      }
    },

    async addQuestion() {
      this.submitting = true;
      try {
        // Prepare question data
        const questionData = {
          text: this.questionForm.text,
          questionType: 'MULTIPLE_CHOICE',
          points: this.questionForm.points,
          timeLimit: this.questionForm.timeLimit,
          isRequired: true,
          difficulty: 2.0,
          options: this.questionForm.options.map((option, index) => ({
            text: option.text,
            correct: index === this.questionForm.correctOption,
            answerType: 'TEXT',
            points: index === this.questionForm.correctOption ? this.questionForm.points : 0,
            orderIndex: index
          }))
        };

        await axios.post(`/exercises/${this.id}/questions`, questionData);

        // Reset form
        this.questionForm = {
          text: '',
          points: 10,
          timeLimit: 60,
          options: [
            { text: '', correct: false },
            { text: '', correct: false }
          ],
          correctOption: 0
        };

        // Reload questions
        await this.loadQuestions();
        this.showSuccessToast('سوال با موفقیت اضافه شد.');
      } catch (error) {
        console.error('Error adding question:', error);
        this.showErrorToast('خطا در افزودن سوال. لطفاً دوباره تلاش کنید.');
      } finally {
        this.submitting = false;
      }
    },

    async loadQuestions() {
      try {
        const response = await axios.get(`/exercises/${this.id}/questions`);
        this.questions = response.data;
      } catch (error) {
        console.error('Error loading questions:', error);
      }
    },

    addOption() {
      this.questionForm.options.push({ text: '', correct: false });
    },

    removeOption(index) {
      if (this.questionForm.options.length > 2) {
        this.questionForm.options.splice(index, 1);
        if (this.questionForm.correctOption >= index && this.questionForm.correctOption > 0) {
          this.questionForm.correctOption--;
        }
      }
    },

    downloadAnswersCSV() {
      if (!this.submissions || this.submissions.length === 0) {
        this.showErrorToast('هیچ پاسخی برای دانلود وجود ندارد');
        return;
      }

      const csvHeaders = ['نام دانش‌آموز', 'زمان ارسال', 'نمره', 'نمره کل', 'وضعیت قبولی'];

      // اضافه کردن عناوین سوالات
      if (this.questions && this.questions.length > 0) {
        this.questions.forEach((question, index) => {
          csvHeaders.push(`سوال ${index + 1}`);
          csvHeaders.push(`زمان پاسخ ${index + 1} (ثانیه)`);
        });
      }

      const csvRows = [csvHeaders];

      this.submissions.forEach(submission => {
        const studentName = this.getStudentName(submission);
        const submissionTime = new Date(submission.submissionTime).toLocaleString('fa-IR');
        const status = submission.passed ? 'قبول' : 'رد';

        const row = [
          studentName,
          submissionTime,
          submission.score || 0,
          submission.totalScore || 0,
          status
        ];

        // اضافه کردن پاسخ‌ها
        if (this.questions && this.questions.length > 0) {
          this.questions.forEach((question) => {
            const questionId = question.id.toString();
            const answer = submission.answers ? submission.answers[questionId] : '';
            const answerTime = submission.answerTimes ? submission.answerTimes[questionId] : '';

            // پیدا کردن متن پاسخ انتخاب شده
            let answerText = answer;
            if (question.options && answer) {
              const selectedOption = question.options.find(opt => opt.id.toString() === answer.toString());
              answerText = selectedOption ? selectedOption.text : answer;
            }

            row.push(answerText || 'پاسخ داده نشده');
            row.push(answerTime || 0);
          });
        }

        csvRows.push(row);
      });

      // تبدیل به CSV
      const csvContent = csvRows.map(row =>
          row.map(cell => `"${cell.toString().replace(/"/g, '""')}"`).join(',')
      ).join('\n');

      // دانلود فایل
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `تمرین_${this.exercise.title}_پاسخها.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      this.showSuccessToast('فایل پاسخ‌ها با موفقیت دانلود شد');
    },

    showSubmissionDetail(submission) {
      this.selectedSubmission = submission;

      // نمایش modal با Bootstrap 5
      const modal = new bootstrap.Modal(document.getElementById('submissionDetailModal'));
      modal.show();
    },

    getStudentName(submission) {
      if (!submission.student) return 'نامشخص';
      return submission.student.firstName && submission.student.lastName
          ? `${submission.student.firstName} ${submission.student.lastName}`
          : submission.student.username;
    },

    getAnswerText(question, answerId) {
      if (!question.options || !answerId) return 'پاسخ داده نشده';

      const selectedOption = question.options.find(opt => opt.id.toString() === answerId.toString());
      return selectedOption ? selectedOption.text : answerId;
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

    goBack() {
      this.$router.go(-1);
    },

    startExercise() {
      this.$router.push(`/exercises/${this.id}/take`);
    },

    showSuccessToast(message) {
      if (window.toast) {
        window.toast.success(message);
      } else {
        alert(message);
      }
    },

    showErrorToast(message) {
      if (window.toast) {
        window.toast.error(message);
      } else {
        alert(message);
      }
    }
  }
};
</script>

<style scoped>
.exercise-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px 0;
}

.modern-card {
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 15px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  margin-bottom: 20px;
}

.modern-card .card-header {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 15px 15px 0 0;
  padding: 1rem 1.5rem;
}

.modern-card .card-body {
  padding: 1.5rem;
}

.modern-btn {
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-weight: 500;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 120px;
}

.modern-btn-primary {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
}

.modern-btn-primary:hover {
  background: linear-gradient(45deg, #5a6fd8, #6a3093);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.modern-btn-success {
  background: linear-gradient(45deg, #56ab2f, #a8e6cf);
  color: white;
}

.modern-btn-success:hover {
  background: linear-gradient(45deg, #4a9025, #96d4b5);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(86, 171, 47, 0.4);
}

.modern-btn-info {
  background: linear-gradient(45deg, #3498db, #2980b9);
  color: white;
}

.modern-btn-info:hover {
  background: linear-gradient(45deg, #2980b9, #2471a3);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.4);
}

.modern-btn-outline-primary {
  background: transparent;
  color: #667eea;
  border: 2px solid #667eea;
}

.modern-btn-outline-primary:hover {
  background: #667eea;
  color: white;
  transform: translateY(-1px);
}

.modern-btn-outline-secondary {
  background: transparent;
  color: #6c757d;
  border: 2px solid #6c757d;
}

.modern-btn-outline-secondary:hover {
  background: #6c757d;
  color: white;
  transform: translateY(-1px);
}

.exercise-meta {
  background: rgba(102, 126, 234, 0.05);
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1rem;
}

.meta-item {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.meta-item:last-child {
  margin-bottom: 0;
}

.exercise-status {
  display: flex;
  justify-content: space-around;
  margin: 1rem 0;
}

.status-item {
  text-align: center;
}

.status-number {
  font-size: 2rem;
  font-weight: bold;
  color: #667eea;
  display: block;
}

.status-label {
  font-size: 0.9rem;
  color: #6c757d;
}

.questions-list {
  max-height: 400px;
  overflow-y: auto;
}

.question-item {
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(102, 126, 234, 0.2);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.question-header {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  gap: 1rem;
}

.question-number {
  background: #667eea;
  color: white;
  width: 25px;
  height: 25px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: bold;
  flex-shrink: 0;
}

.question-text {
  flex: 1;
  font-weight: 500;
}

.question-points {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.question-options {
  margin-top: 0.5rem;
}

.option-item {
  display: flex;
  align-items: center;
  padding: 0.25rem 0;
  font-size: 0.9rem;
}

.option-item i {
  margin-right: 0.5rem;
  width: 16px;
}

.correct-option {
  color: #28a745;
  font-weight: 500;
}

.avatar-sm {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.8rem;
}

.table-responsive {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.table th {
  background: linear-gradient(45deg, #f8f9fa, #e9ecef);
  border: none;
  font-weight: 600;
  color: #495057;
}

.table td {
  border-color: #e9ecef;
  vertical-align: middle;
}

.table tbody tr:hover {
  background-color: rgba(102, 126, 234, 0.05);
}

.modal-content {
  border: none;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}

.modal-header {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  border-bottom: none;
  border-radius: 12px 12px 0 0;
}

.modal-header .btn-close {
  filter: invert(1);
}

.form-control, .form-select {
  border: 2px solid #e9ecef;
  border-radius: 8px;
  padding: 0.75rem;
  transition: all 0.3s ease;
}

.form-control:focus, .form-select:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 0.25rem rgba(102, 126, 234, 0.25);
}

.form-label {
  font-weight: 600;
  color: #495057;
  margin-bottom: 0.5rem;
}

@media (max-width: 768px) {
  .exercise-container {
    padding: 10px;
  }

  .modern-card .card-body {
    padding: 1rem;
  }

  .d-flex.gap-2 {
    flex-direction: column;
    gap: 0.5rem !important;
  }

  .modern-btn {
    width: 100%;
  }

  .exercise-status {
    flex-direction: column;
    gap: 1rem;
  }

  .question-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>