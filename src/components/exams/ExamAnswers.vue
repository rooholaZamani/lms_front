<template>
  <div class="exam-results">
    <div class="container-fluid">
      <!-- Header -->
      <div class="page-header">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <h2 class="page-title">
              <i class="fas fa-chart-bar me-2"></i>
              نتایج آزمون
            </h2>
            <p class="page-subtitle" v-if="examData">{{ examData.title }}</p>
          </div>
          <div class="header-actions">
            <button
                v-if="hasManualQuestions"
                class="modern-btn modern-btn-warning me-2"
                @click="goToManualGrading"
            >
              <i class="fas fa-clipboard-check me-2"></i>
              نمره‌گذاری دستی
            </button>
            <button class="modern-btn modern-btn-outline" @click="goBack">
              <i class="fas fa-arrow-right me-2"></i>
              بازگشت
            </button>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">در حال بارگذاری...</span>
        </div>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="alert alert-danger">
        <i class="fas fa-exclamation-triangle me-2"></i>
        {{ error }}
      </div>

      <!-- Content -->
      <div v-else-if="examData" class="results-content">
        <!-- Statistics Cards -->
        <div class="row mb-4">
          <div class="col-md-2">
            <div class="stat-card">
              <div class="stat-icon bg-primary">
                <i class="fas fa-users"></i>
              </div>
              <div class="stat-content">
                <h3>{{ submissions.length }}</h3>
                <p>کل شرکت‌کنندگان</p>
              </div>
            </div>
          </div>
          <div class="col-md-2">
            <div class="stat-card">
              <div class="stat-icon bg-success">
                <i class="fas fa-check"></i>
              </div>
              <div class="stat-content">
                <h3>{{ passedCount }}</h3>
                <p>قبول شدگان</p>
              </div>
            </div>
          </div>
          <div class="col-md-2">
            <div class="stat-card">
              <div class="stat-icon bg-danger">
                <i class="fas fa-times"></i>
              </div>
              <div class="stat-content">
                <h3>{{ failedCount }}</h3>
                <p>مردود شدگان</p>
              </div>
            </div>
          </div>
          <div class="col-md-2">
            <div class="stat-card">
              <div class="stat-icon bg-info">
                <i class="fas fa-percentage"></i>
              </div>
              <div class="stat-content">
                <h3>{{ passPercentage }}%</h3>
                <p>درصد قبولی</p>
              </div>
            </div>
          </div>
          <div class="col-md-2">
            <div class="stat-card">
              <div class="stat-icon bg-warning">
                <i class="fas fa-calculator"></i>
              </div>
              <div class="stat-content">
                <h3>{{ averageScore }}</h3>
                <p>میانگین نمره</p>
              </div>
            </div>
          </div>
          <div class="col-md-2" v-if="hasManualQuestions">
            <div class="stat-card">
              <div class="stat-icon bg-secondary">
                <i class="fas fa-clock"></i>
              </div>
              <div class="stat-content">
                <h3>{{ pendingGradingCount }}</h3>
                <p>نیاز به نمره‌گذاری</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Manual Grading Alert -->
        <div v-if="hasManualQuestions && pendingGradingCount > 0" class="alert alert-warning mb-4">
          <div class="d-flex align-items-center">
            <i class="fas fa-exclamation-triangle me-3"></i>
            <div class="flex-grow-1">
              <strong>توجه:</strong> {{ pendingGradingCount }} ارسالی نیاز به نمره‌گذاری دستی دارد.
              سوالات تشریحی و پاسخ کوتاه نیاز به بررسی و نمره‌گذاری توسط شما دارند.
            </div>
            <button class="btn btn-warning btn-sm" @click="goToManualGrading">
              <i class="fas fa-edit me-2"></i>
              شروع نمره‌گذاری
            </button>
          </div>
        </div>

        <!-- Submissions Table -->
        <div class="modern-card">
          <div class="modern-card-header">
            <div class="d-flex justify-content-between align-items-center">
              <h5 class="card-title mb-0">
                <i class="fas fa-list me-2"></i>
                جزئیات نتایج
              </h5>
              <div class="table-actions">
                <button class="modern-btn modern-btn-sm modern-btn-success" @click="exportResults">
                  <i class="fas fa-download me-2"></i>
                  خروجی Excel
                </button>
              </div>
            </div>
          </div>
          <div class="modern-card-body">
            <div class="table-responsive">
              <table class="table table-hover">
                <thead>
                <tr>
                  <th>ردیف</th>
                  <th>دانش‌آموز</th>
                  <th>زمان ارسال</th>
                  <th>مدت زمان</th>
                  <th>نمره</th>
                  <th>درصد</th>
                  <th>وضعیت</th>
                  <th v-if="hasManualQuestions">نمره‌گذاری</th>
                  <th>عملیات</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="(submission, index) in submissions" :key="submission.id">
                  <td>{{ index + 1 }}</td>
                  <td>
                    <div class="student-info">
                      <div class="student-name">{{ getStudentName(submission) }}</div>
                      <div class="student-username">{{ submission.student.username }}</div>
                    </div>
                  </td>
                  <td>
                    <div class="submission-time">
                      {{ formatDateTime(submission.submissionTime) }}
                    </div>
                  </td>
                  <td>
                    <div class="time-spent">
                      {{ formatTimeSpent(submission.timeSpent) }}
                    </div>
                  </td>
                  <td>
                    <div class="score-display">
                      <span class="score-number">{{ submission.score || 0 }}</span>
                      <span class="score-total">/ {{ examData.totalPossibleScore }}</span>
                    </div>
                  </td>
                  <td>
                    <div class="percentage">
                      {{ getScorePercentage(submission) }}%
                    </div>
                  </td>
                  <td>
                      <span :class="getStatusBadgeClass(submission)" class="status-badge">
                        {{ submission.passed ? 'قبول' : 'مردود' }}
                      </span>
                  </td>
                  <td v-if="hasManualQuestions">
                      <span v-if="submission.gradedManually" class="badge badge-success">
                        <i class="fas fa-check me-1"></i>
                        تکمیل شده
                      </span>
                    <span v-else-if="needsManualGrading(submission)" class="badge badge-warning">
                        <i class="fas fa-clock me-1"></i>
                        در انتظار
                      </span>
                    <span v-else class="badge badge-info">
                        <i class="fas fa-robot me-1"></i>
                        خودکار
                      </span>
                  </td>
                  <td>
                    <div class="action-buttons">
                      <button
                          class="modern-btn modern-btn-sm modern-btn-primary me-1"
                          @click="viewStudentAnswers(submission)"
                          title="مشاهده پاسخ‌ها"
                      >
                        <i class="fas fa-eye"></i>
                      </button>
                      <button
                          v-if="hasManualQuestions && needsManualGrading(submission)"
                          class="modern-btn modern-btn-sm modern-btn-warning me-1"
                          @click="goToManualGrading()"
                          title="نمره‌گذاری دستی"
                      >
                        <i class="fas fa-edit"></i>
                      </button>
                      <button
                          v-if="submission.feedback"
                          class="modern-btn modern-btn-sm modern-btn-info"
                          @click="viewFeedback(submission)"
                          title="مشاهده بازخورد"
                      >
                        <i class="fas fa-comment"></i>
                      </button>
                    </div>
                  </td>
                </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Charts Section -->
        <div class="row mt-4">
          <!-- Score Distribution Chart -->
          <div class="col-md-6">
            <div class="modern-card">
              <div class="modern-card-header">
                <h5 class="card-title mb-0">
                  <i class="fas fa-chart-pie me-2"></i>
                  توزیع نمرات
                </h5>
              </div>
              <div class="modern-card-body">
                <canvas ref="scoreChart" width="400" height="200"></canvas>
              </div>
            </div>
          </div>

          <!-- Pass/Fail Chart -->
          <div class="col-md-6">
            <div class="modern-card">
              <div class="modern-card-header">
                <h5 class="card-title mb-0">
                  <i class="fas fa-chart-doughnut me-2"></i>
                  وضعیت قبولی
                </h5>
              </div>
              <div class="modern-card-body">
                <canvas ref="passFailChart" width="400" height="200"></canvas>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Feedback Modal -->
      <div class="modal fade" id="feedbackModal" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">
                <i class="fas fa-comment me-2"></i>
                بازخورد استاد
              </h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <div v-if="selectedFeedback" class="feedback-content">
                <div class="student-info mb-3">
                  <strong>دانش‌آموز:</strong> {{ selectedFeedback.studentName }}
                </div>
                <div class="feedback-text">
                  {{ selectedFeedback.feedback }}
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                بستن
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- Student Answers Modal -->
  <div class="modal fade" id="studentAnswersModal" tabindex="-1">
    <div class="modal-dialog modal-xl">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            <i class="fas fa-eye me-2"></i>
            پاسخ‌های دانش‌آموز
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <div class="student-answers-content">
      <!-- Student Info -->
      <div class="student-info mb-4">
        <div class="row">
          <div class="col-md-4">
            <strong>دانش‌آموز:</strong> {{ selectedStudentAnswers?.studentName }}
          </div>
          <div class="col-md-4">
            <strong>نمره:</strong>
            <span :class="selectedStudentAnswers?.passed ? 'text-success' : 'text-danger'">
            {{ selectedStudentAnswers?.score }}/{{ selectedStudentAnswers?.totalScore }}
          </span>
          </div>
          <div class="col-md-4">
            <strong>وضعیت:</strong>
            <span :class="selectedStudentAnswers?.passed ? 'badge bg-success' : 'badge bg-danger'">
            {{ selectedStudentAnswers?.passed ? 'قبول' : 'مردود' }}
          </span>
          </div>
        </div>
      </div>

      <!-- Questions and Answers -->
      <div v-if="selectedStudentAnswers?.answers" class="questions-list">
        <div v-for="(answerData, index) in selectedStudentAnswers?.answers"
             :key="answerData?.questionId" class="question-item mb-4 p-3 border rounded">
          <div class="question-header mb-3">
            <div class="d-flex justify-content-between align-items-start">
              <div class="question-info">
                <h6>سوال {{ index + 1 }}: {{ answerData?.questionText }}</h6>
                <small class="text-muted">نوع: {{ getQuestionTypeLabel(answerData?.questionType) }}</small>
              </div>
              <div class="question-score-badge">
                <span v-if="isPartialScoringQuestion(answerData)"
                      :class="getPartialScoreBadgeClass(answerData)"
                      class="badge fs-6 mb-1">
                  {{ answerData?.earnedPoints }}/{{ answerData?.totalPoints }}
                </span>
                <span v-else
                      :class="answerData?.isCorrect ? 'badge bg-success fs-6 mb-1' : 'badge bg-danger fs-6 mb-1'">
                  {{ answerData?.earnedPoints }}/{{ answerData?.totalPoints }}
                </span>
                <div class="score-percentage text-center">
                  <small class="text-muted">{{ getScorePercentageForQuestion(answerData) }}%</small>
                </div>
              </div>
            </div>
          </div>

          <div class="answer-details">
            <div class="row">
              <div class="col-md-6">
                <strong>پاسخ دانش‌آموز:</strong>
                <div class="answer-text mt-1"
                     v-if="isPartialScoringQuestion(answerData)"
                     v-html="formatStudentAnswer(answerData)">
                </div>
                <div class="answer-text mt-1" v-else>
                  {{ formatStudentAnswer(answerData) }}
                </div>
              </div>
              <div class="col-md-6">
                <strong>پاسخ صحیح:</strong>
                <div class="correct-answer-text mt-1"
                     v-if="isPartialScoringQuestion(answerData)"
                     v-html="formatCorrectAnswer(answerData)">
                </div>
                <div class="correct-answer-text mt-1" v-else>
                  {{ formatCorrectAnswer(answerData) }}
                </div>
              </div>
            </div>
            <div class="d-flex justify-content-between align-items-center mt-3">
              <div class="score-status">
                <span v-if="isPartialScoringQuestion(answerData)"
                      :class="getPartialScoreBadgeClass(answerData)"
                      class="badge">
                  {{ getPartialScoreLabel(answerData) }}
                </span>
                <span v-else
                      :class="answerData?.isCorrect ? 'badge bg-success' : 'badge bg-danger'">
                  {{ answerData?.isCorrect ? 'درست' : 'نادرست' }}
                </span>
              </div>
              <div class="score-points">
                <span class="text-muted">
                  امتیاز: {{ answerData?.earnedPoints }}/{{ answerData?.totalPoints }}
                </span>
                <span v-if="isPartialScoringQuestion(answerData) && getScorePercentageForQuestion(answerData) < 100"
                      class="text-info ms-2">
                  ({{ getScorePercentageForQuestion(answerData) }}%)
                </span>
              </div>
            </div>
          </div>
          </div>
        </div>
        </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
            بستن
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import Chart from 'chart.js/auto'
import exams from "@/store/exams.js";
import {nextTick} from "vue";

export default {
  name: 'ExamResults',
  props: {
    examId: {
      type: [String, Number],
      required: true
    }
  },
  data() {
    return {
      loading: false,
      error: null,
      examData: null,
      submissions: [],
      hasManualQuestions: false,
      selectedFeedback: null,
      scoreChart: null,
      passFailChart: null,
      selectedStudentAnswers: null,
      loadingAnswers: false
    }
  },
  computed: {
    passedCount() {
      return this.submissions.filter(s => s.passed).length;
    },
    failedCount() {
      return this.submissions.filter(s => !s.passed).length;
    },
    passPercentage() {
      if (this.submissions.length === 0) return 0;
      return Math.round((this.passedCount / this.submissions.length) * 100);
    },
    averageScore() {
      if (this.submissions.length === 0) return 0;
      const total = this.submissions.reduce((sum, s) => sum + (s.score || 0), 0);
      return Math.round(total / this.submissions.length);
    },
    pendingGradingCount() {
      if (!this.hasManualQuestions) return 0;
      return this.submissions.filter(s => this.needsManualGrading(s)).length;
    }
  },
  async mounted() {
    await this.fetchData();
    this.$nextTick(() => {
      this.initializeCharts();
    });
  },
  beforeUnmount() {
    if (this.scoreChart) {
      this.scoreChart.destroy();
    }
    if (this.passFailChart) {
      this.passFailChart.destroy();
    }
  },
  methods: {
    async fetchData() {
      try {
        this.loading = true;
        this.error = null;

        // دریافت اطلاعات آزمون
        console.log(this.examId)
        const examResponse = await axios.get(`/exams/${this.examId}`);
        this.examData = examResponse.data;

        // دریافت submissions
        const submissionsResponse = await axios.get(`/exams/${this.examId}/submissions`);
        this.submissions = submissionsResponse.data;

        // بررسی وجود سوالات تشریحی
        this.hasManualQuestions = this.examData.questions?.some(
            q => ['ESSAY', 'SHORT_ANSWER'].includes(q.questionType)
        ) || false;

      } catch (error) {
        console.error('Error fetching exam results:', error);
        this.error = 'خطا در دریافت نتایج آزمون';
      } finally {
        this.loading = false;
      }
    },

    needsManualGrading(submission) {
      if (!this.hasManualQuestions) return false;
      return !submission.gradedManually;
    },

    getStudentName(submission) {
      const student = submission.student;
      return `${student.firstName} ${student.lastName || ''}`.trim();
    },

    getScorePercentage(submission) {
      if (!this.examData?.totalPossibleScore) return 0;
      return Math.round(((submission.score || 0) / this.examData.totalPossibleScore) * 100);
    },

    getStatusBadgeClass(submission) {
      return submission.passed ? 'badge-success' : 'badge-danger';
    },

    formatDateTime(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('fa-IR') + ' ' + date.toLocaleTimeString('fa-IR', {
        hour: '2-digit',
        minute: '2-digit'
      });
    },
    getQuestionTypeLabel(type) {
      const labels = {
        'MULTIPLE_CHOICE': 'چندگزینه‌ای',
        'TRUE_FALSE': 'درست/نادرست',
        'SHORT_ANSWER': 'پاسخ کوتاه',
        'ESSAY': 'تشریحی',
        'MATCHING': 'تطبیقی',
        'FILL_IN_THE_BLANKS': 'جاهای خالی',
        'CATEGORIZATION': 'دسته‌بندی'
      };
      return labels[type] || type;
    },

    formatStudentAnswer(answerData) {
      const { questionType, studentAnswer, questionOptions } = answerData;

      switch (questionType) {
        case 'MULTIPLE_CHOICE':
          if (questionOptions?.answers) {
            const option = questionOptions.answers.find(a => a.id === studentAnswer);
            return option ? option.text : 'پاسخ نامعتبر';
          }
          return 'نامشخص';

        case 'TRUE_FALSE':
          return studentAnswer === 'true' || studentAnswer === true ? 'درست' : 'نادرست';

        case 'MATCHING':
          return this.formatMatchingAnswer(studentAnswer, answerData);

        case 'CATEGORIZATION':
          return this.formatCategorizationAnswer(studentAnswer, answerData);

        case 'FILL_IN_THE_BLANKS':
          return Array.isArray(studentAnswer) ? studentAnswer.join(', ') : studentAnswer;

        default:
          return studentAnswer || 'پاسخ داده نشده';
      }
    },

    formatCorrectAnswer(answerData) {
      const { questionType, correctAnswer, questionOptions } = answerData;

      switch (questionType) {
        case 'MULTIPLE_CHOICE':
          if (questionOptions?.answers) {
            const option = questionOptions.answers.find(a => a.id === correctAnswer);
            return option ? option.text : 'نامشخص';
          }
          return 'نامشخص';

        case 'TRUE_FALSE':
          return correctAnswer === 'true' || correctAnswer === true ? 'درست' : 'نادرست';

        case 'MATCHING':
          return this.formatMatchingCorrectAnswer(correctAnswer, answerData);

        case 'CATEGORIZATION':
          return this.formatCategorizationCorrectAnswer(correctAnswer, answerData);

        case 'FILL_IN_THE_BLANKS':
          return Array.isArray(correctAnswer) ? correctAnswer.join(', ') : correctAnswer;

        default:
          return correctAnswer || 'نامشخص';
      }
    },

    formatMatchingAnswer(studentAnswer, answerData) {
      if (!studentAnswer || typeof studentAnswer !== 'object') {
        return 'پاسخ داده نشده';
      }

      const pairs = Object.entries(studentAnswer);
      if (pairs.length === 0) {
        return 'پاسخ داده نشده';
      }

      const correctAnswer = answerData.correctAnswer || {};
      let result = '<div class="matching-answer-display">';
      let correctCount = 0;

      pairs.forEach(([left, right]) => {
        const isCorrect = correctAnswer[left] === right;
        if (isCorrect) correctCount++;

        const statusClass = isCorrect ? 'text-success' : 'text-danger';
        const statusIcon = isCorrect ? '✓' : '✗';

        result += `<div class="matching-pair ${statusClass}">`;
        result += `<span class="status-icon">${statusIcon}</span> `;
        result += `<span class="left-item">${left}</span> → `;
        result += `<span class="right-item">${right}</span>`;
        result += `</div>`;
      });

      const percentage = Math.round((correctCount / pairs.length) * 100);
      result += `<div class="partial-score-summary mt-2">`;
      result += `<small class="text-muted">تطبیق‌های صحیح: ${correctCount}/${pairs.length} (${percentage}%)</small>`;
      result += `</div></div>`;

      return result;
    },

    formatMatchingCorrectAnswer(correctAnswer, answerData) {
      if (!correctAnswer || typeof correctAnswer !== 'object') {
        return 'نامشخص';
      }

      const pairs = Object.entries(correctAnswer);
      if (pairs.length === 0) {
        return 'نامشخص';
      }

      let result = '<div class="matching-correct-display">';
      pairs.forEach(([left, right]) => {
        result += `<div class="matching-pair text-success">`;
        result += `<span class="left-item">${left}</span> → `;
        result += `<span class="right-item">${right}</span>`;
        result += `</div>`;
      });
      result += '</div>';

      return result;
    },

    formatCategorizationAnswer(studentAnswer, answerData) {
      if (!studentAnswer || typeof studentAnswer !== 'object') {
        return 'پاسخ داده نشده';
      }

      const categories = Object.entries(studentAnswer);
      if (categories.length === 0) {
        return 'پاسخ داده نشده';
      }

      const correctAnswer = answerData.correctAnswer || {};
      let result = '<div class="categorization-answer-display">';
      let correctCount = 0;

      categories.forEach(([item, category]) => {
        const isCorrect = correctAnswer[item] === category;
        if (isCorrect) correctCount++;

        const statusClass = isCorrect ? 'text-success' : 'text-danger';
        const statusIcon = isCorrect ? '✓' : '✗';

        result += `<div class="categorization-item ${statusClass}">`;
        result += `<span class="status-icon">${statusIcon}</span> `;
        result += `<span class="item-name">${item}</span> → `;
        result += `<span class="category-name">${category}</span>`;
        result += `</div>`;
      });

      const percentage = Math.round((correctCount / categories.length) * 100);
      result += `<div class="partial-score-summary mt-2">`;
      result += `<small class="text-muted">دسته‌بندی‌های صحیح: ${correctCount}/${categories.length} (${percentage}%)</small>`;
      result += `</div></div>`;

      return result;
    },

    formatCategorizationCorrectAnswer(correctAnswer, answerData) {
      if (!correctAnswer || typeof correctAnswer !== 'object') {
        return 'نامشخص';
      }

      const categories = Object.entries(correctAnswer);
      if (categories.length === 0) {
        return 'نامشخص';
      }

      let result = '<div class="categorization-correct-display">';
      categories.forEach(([item, category]) => {
        result += `<div class="categorization-item text-success">`;
        result += `<span class="item-name">${item}</span> → `;
        result += `<span class="category-name">${category}</span>`;
        result += `</div>`;
      });
      result += '</div>';

      return result;
    },

    isPartialScoringQuestion(answerData) {
      return answerData?.questionType === 'MATCHING' || answerData?.questionType === 'CATEGORIZATION';
    },

    getScorePercentageForQuestion(answerData) {
      if (!answerData?.totalPoints || answerData.totalPoints === 0) return 0;
      return Math.round((answerData.earnedPoints / answerData.totalPoints) * 100);
    },

    getPartialScoreBadgeClass(answerData) {
      const percentage = this.getScorePercentageForQuestion(answerData);
      if (percentage === 100) return 'bg-success';
      if (percentage >= 75) return 'bg-primary';
      if (percentage >= 50) return 'bg-warning';
      if (percentage > 0) return 'bg-info';
      return 'bg-danger';
    },

    getPartialScoreLabel(answerData) {
      const percentage = this.getScorePercentageForQuestion(answerData);
      if (percentage === 100) return 'کامل';
      if (percentage >= 75) return 'خوب';
      if (percentage >= 50) return 'متوسط';
      if (percentage > 0) return 'جزئی';
      return 'نادرست';
    },

    async viewStudentAnswers(submission) {
      try {
        this.loadingAnswers = true;
        const response = await axios.get(`/exams/${this.examId}/student-answers/${submission.student.id}`);

        // تبدیل answers object به array برای نمایش آسان‌تر
        const answersArray = Object.entries(response.data.answers).map(([questionId, answerData]) => ({
          questionId,
          questionText: answerData.questionText,
          questionType: answerData.questionType,
          studentAnswer: answerData.studentAnswer,
          correctAnswer: answerData.correctAnswer,
          isCorrect: answerData.isCorrect,
          earnedPoints: answerData.earnedPoints,
          totalPoints: answerData.totalPoints,
          questionOptions: answerData.questionOptions
        }));

        this.selectedStudentAnswers = {
          studentName: `${submission.student.firstName} ${submission.student.lastName}`,
          score: response.data.score,
          totalScore: response.data.totalPossibleScore,
          passed: response.data.passed,
          timeSpent: response.data.timeSpent,
          submissionTime: response.data.submissionTime,
          answers: answersArray
        };
        console.log("Selected student answers:", this.selectedStudentAnswers);

        await nextTick(() => {
          const modalElement = document.getElementById('studentAnswersModal');
          if (modalElement) {
            const modal = new bootstrap.Modal(modalElement);
            modal.show();
          } else {
            console.error('Modal element not found');
          }
        });

      } catch (error) {
        console.error('Error fetching student answers:', error);
        this.$toast?.error('خطا در دریافت پاسخ‌های دانش‌آموز');
      } finally {
        this.loadingAnswers = false;
      }
    },

    getStudentAnswerText(question, answer) {
      if (!answer) return 'پاسخ داده نشده';

      switch (question.questionType) {
        case 'MULTIPLE_CHOICE':
          const option = question.answers?.find(a => a.id === answer);
          return option ? option.text : 'نامشخص';
        case 'TRUE_FALSE':
          return answer === 'true' ? 'درست' : 'نادرست';
        case 'SHORT_ANSWER':
        case 'ESSAY':
          return answer;
        default:
          return JSON.stringify(answer);
      }
    },

    getCorrectAnswerText(question) {
      switch (question.questionType) {
        case 'MULTIPLE_CHOICE':
          const correctOption = question.answers?.find(a => a.correct);
          return correctOption ? correctOption.text : 'نامشخص';
        case 'TRUE_FALSE':
          return question.correctOption === 'true' ? 'درست' : 'نادرست';
        case 'SHORT_ANSWER':
          return question.correctOption || 'نامشخص';
        case 'ESSAY':
          return 'نیاز به بررسی دستی';
        default:
          return 'نامشخص';
      }
    },

    formatTimeSpent(timeSpent) {
      if (!timeSpent) return 'نامشخص';
      return this.$filters.formatTime(timeSpent);
    },

    // viewSubmission(submission) {
    //   this.$router.push(`/exam-answers/${submission.id}`);
    // },


    goToManualGrading() {
      console.log('goToManualGrading' + this.examId);
      this.$router.push(`/exams/${this.examId}/manual-grading`);
    },

    viewFeedback(submission) {
      this.selectedFeedback = {
        studentName: this.getStudentName(submission),
        feedback: submission.feedback
      };

      const modal = new bootstrap.Modal(document.getElementById('feedbackModal'));
      modal.show();
    },

    async exportResults() {
      try {
        const response = await axios.get(`/exams/${this.examId}/export-results`, {
          responseType: 'blob'
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `exam-results-${this.examId}.xlsx`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

        this.$toast?.success('فایل با موفقیت دانلود شد');
      } catch (error) {
        console.error('Error exporting results:', error);
        this.$toast?.error('خطا در دانلود فایل');
      }
    },

    initializeCharts() {
      this.initializeScoreChart();
      this.initializePassFailChart();
    },

    initializeScoreChart() {
      if (!this.$refs.scoreChart) return;

      const ctx = this.$refs.scoreChart.getContext('2d');

      // توزیع نمرات در بازه‌های 10 تایی
      const scoreRanges = ['0-10', '11-20', '21-30', '31-40', '41-50', '51-60', '61-70', '71-80', '81-90', '91-100'];
      const scoreCounts = new Array(10).fill(0);

      this.submissions.forEach(submission => {
        const percentage = this.getScorePercentage(submission);
        const rangeIndex = Math.min(Math.floor(percentage / 10), 9);
        scoreCounts[rangeIndex]++;
      });

      this.scoreChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: scoreRanges,
          datasets: [{
            label: 'تعداد دانش‌آموزان',
            data: scoreCounts,
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 1
              }
            }
          }
        }
      });
    },

    initializePassFailChart() {
      if (!this.$refs.passFailChart) return;

      const ctx = this.$refs.passFailChart.getContext('2d');

      this.passFailChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['قبول', 'مردود'],
          datasets: [{
            data: [this.passedCount, this.failedCount],
            backgroundColor: [
              'rgba(40, 167, 69, 0.7)',
              'rgba(220, 53, 69, 0.7)'
            ],
            borderColor: [
              'rgba(40, 167, 69, 1)',
              'rgba(220, 53, 69, 1)'
            ],
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom'
            }
          }
        }
      });
    },

    goBack() {
      this.$router.go(-1);
    }
  }
}
</script>

<style scoped>
.exam-results {
  background: #f8f9fa;
  min-height: 100vh;
  padding: 2rem 0;
}

.page-header {
  background: white;
  padding: 2rem;
  border-radius: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.page-title {
  color: #2c3e50;
  font-weight: 600;
  margin: 0;
}

.page-subtitle {
  color: #6c757d;
  margin: 0;
  font-size: 1.1rem;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.stat-card {
  background: white;
  border-radius: 15px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
  margin-left: 1rem;
}

.stat-content h3 {
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
}

.stat-content p {
  margin: 0;
  color: #6c757d;
  font-size: 0.9rem;
}

.modern-card {
  background: white;
  border-radius: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.modern-card-header {
  background: #f8f9fa;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #dee2e6;
}

.modern-card-body {
  padding: 0;
}

.table {
  margin: 0;
}

.table th {
  background: #f8f9fa;
  border: none;
  padding: 1rem 1.5rem;
  font-weight: 600;
  color: #495057;
  font-size: 0.9rem;
}

.table td {
  padding: 1rem 1.5rem;
  border: none;
  border-bottom: 1px solid #f1f3f4;
  vertical-align: middle;
  font-size: 0.9rem;
}

.student-info .student-name {
  font-weight: 600;
  color: #2c3e50;
}

.student-info .student-username {
  font-size: 0.8rem;
  color: #6c757d;
}

.submission-time, .time-spent {
  font-size: 0.85rem;
  color: #495057;
}

.score-display {
  text-align: center;
}

.score-number {
  font-size: 1.2rem;
  font-weight: 700;
  color: #2c3e50;
}

.score-total {
  color: #6c757d;
  margin-right: 0.25rem;
  font-size: 0.9rem;
}

.percentage {
  text-align: center;
  font-weight: 600;
  color: #495057;
}

.status-badge {
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
}

.badge-success {
  background: #d4edda;
  color: #155724;
}

.badge-danger {
  background: #f8d7da;
  color: #721c24;
}

.badge {
  padding: 0.3rem 0.6rem;
  border-radius: 15px;
  font-size: 0.7rem;
  font-weight: 600;
}

.badge-warning { background: #fff3cd; color: #856404; }
.badge-info { background: #d1ecf1; color: #0c5460; }

.action-buttons {
  display: flex;
  gap: 0.25rem;
}

.modern-btn-sm {
  padding: 0.4rem 0.8rem;
  font-size: 0.8rem;
  width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.feedback-content {
  line-height: 1.6;
}

.student-info {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.feedback-text {
  white-space: pre-wrap;
  color: #2c3e50;
}

@media (max-width: 768px) {
  .exam-results {
    padding: 1rem 0;
  }

  .page-header {
    padding: 1rem;
  }

  .page-header .d-flex {
    flex-direction: column;
    gap: 1rem;
  }

  .header-actions {
    justify-content: center;
  }

  .stat-card {
    margin-bottom: 1rem;
  }

  .action-buttons {
    flex-direction: column;
    gap: 0.5rem;
  }

  .modern-btn-sm {
    width: 100%;
    height: auto;
    padding: 0.5rem;
  }
}

/* Partial Scoring Display Styles */
.matching-answer-display,
.categorization-answer-display {
  background-color: #f8f9fa;
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.matching-pair,
.categorization-item {
  padding: 4px 0;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-icon {
  font-weight: bold;
  font-size: 1rem;
}

.left-item,
.right-item,
.item-name,
.category-name {
  font-weight: 500;
}

.partial-score-summary {
  border-top: 1px solid #dee2e6;
  padding-top: 8px;
  margin-top: 8px;
}

.matching-correct-display,
.categorization-correct-display {
  background-color: #d1edff;
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #b3d7ff;
}

.score-status .badge {
  font-size: 0.8rem;
  padding: 0.4rem 0.6rem;
}

.score-points {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Question item styling for better partial score visibility */
.question-item {
  transition: box-shadow 0.2s ease;
}

.question-item:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.answer-details {
  background-color: #fbfcfd;
  padding: 1rem;
  border-radius: 8px;
  margin-top: 0.5rem;
}

/* Question score badge styling */
.question-score-badge {
  min-width: 80px;
  text-align: center;
}

.question-score-badge .badge {
  font-weight: 600;
  min-width: 60px;
  padding: 0.5rem 0.8rem;
}

.question-score-badge .score-percentage {
  margin-top: 0.25rem;
}

.question-info {
  flex: 1;
  margin-right: 1rem;
}

/* Responsive adjustments for question header */
@media (max-width: 768px) {
  .question-header .d-flex {
    flex-direction: column;
    gap: 0.75rem;
  }

  .question-info {
    margin-right: 0;
  }

  .question-score-badge {
    align-self: flex-start;
  }
}
</style>